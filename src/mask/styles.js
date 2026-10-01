/**
 * Reading and writing the mask in a GenerateBlocks block's `styles`.
 *
 * GenerateBlocks keeps styles as an object of CSS properties, with nested
 * objects for its breakpoints ("@media (max-width:1024px)" etc.), and
 * compiles them to CSS itself whenever they change. So the mask is plain
 * mask-* properties at the right level: tablet and mobile inherit desktop
 * through the CSS cascade, and everything is visible (and editable) in GB's
 * own Styles panel.
 */
import { fromMaskImage, toMaskImage, flipSvg, unflipSvg } from './svg';

// The editor's preview devices, mapped to GenerateBlocks' default breakpoints.
// Each level inherits from the ones before it.
export const LEVELS = [
	{ device: 'Desktop', key: null },
	{ device: 'Tablet', key: '@media (max-width:1024px)' },
	{ device: 'Mobile', key: '@media (max-width:767px)' },
];

const PROPERTIES = [ 'maskImage', 'maskSize', 'maskPosition', 'maskRepeat' ];

const DEFAULTS = {
	svg: '',
	flip: '',
	size: 'contain',
	position: { x: 0.5, y: 0.5 },
	repeat: false,
};

/**
 * The style properties set at one level.
 *
 * @param {Object} styles GB styles.
 * @param {number} level  Index in LEVELS.
 * @return {Object} Properties.
 */
function propertiesAt( styles, level ) {
	const key = LEVELS[ level ].key;

	return ( key ? styles?.[ key ] : styles ) || {};
}

/**
 * Turn CSS values into panel settings.
 *
 * @param {Object} values mask-* values.
 * @return {Object} Settings.
 */
function toSettings( values ) {
	const settings = {};

	if ( undefined !== values.maskImage ) {
		// "none" turns an inherited mask off at this size. A mask-image typed
		// by hand in GB's Styles panel (not an SVG from here) reads as no shape.
		const { svg, flip } = unflipSvg( fromMaskImage( values.maskImage ) );

		settings.svg = svg;
		settings.flip = flip;
	}

	if ( undefined !== values.maskSize ) {
		settings.size = values.maskSize;
	}

	if ( undefined !== values.maskPosition ) {
		const [ x, y ] = String( values.maskPosition )
			.split( /\s+/ )
			.map( ( part ) => parseFloat( part ) / 100 );

		settings.position = {
			x: Number.isFinite( x ) ? x : 0.5,
			y: Number.isFinite( y ) ? y : 0.5,
		};
	}

	if ( undefined !== values.maskRepeat ) {
		settings.repeat = 'no-repeat' !== values.maskRepeat;
	}

	return settings;
}

/**
 * The settings in effect at a level (its own values over the inherited ones),
 * and which of them are its own.
 *
 * @param {Object} styles GB styles.
 * @param {number} level  Index in LEVELS.
 * @return {{settings: Object, own: Object, inherited: Object}} Settings.
 */
export function readMask( styles, level ) {
	let inherited = { ...DEFAULTS };

	for ( let index = 0; index < level; index++ ) {
		inherited = {
			...inherited,
			...toSettings( propertiesAt( styles, index ) ),
		};
	}

	const own = toSettings( propertiesAt( styles, level ) );

	return { settings: { ...inherited, ...own }, own, inherited };
}

/**
 * CSS values for settings.
 *
 * @param {Object} settings Settings (only the ones to write).
 * @return {Object} mask-* values.
 */
function toValues( settings ) {
	const values = {};

	if ( undefined !== settings.svg ) {
		values.maskImage = settings.svg
			? toMaskImage( flipSvg( settings.svg, settings.flip || '' ) )
			: undefined;
	}

	if ( undefined !== settings.size ) {
		values.maskSize = settings.size;
	}

	if ( undefined !== settings.position ) {
		const { x, y } = settings.position;
		values.maskPosition = `${ Math.round( x * 100 ) }% ${ Math.round(
			y * 100
		) }%`;
	}

	if ( undefined !== settings.repeat ) {
		values.maskRepeat = settings.repeat ? 'repeat' : 'no-repeat';
	}

	return values;
}

/**
 * New styles with the mask settings changed at one level.
 *
 * A level where no wider level has a mask yet writes every setting, so its
 * CSS is complete (the browser's own defaults, like repeating, never leak
 * in). Otherwise it writes only what differs from what it inherits, so
 * changing desktop later still flows down to tablet and mobile. The shape
 * and its flip are one CSS value (mask-image), so they're written together.
 *
 * @param {Object} styles  GB styles.
 * @param {number} level   Index in LEVELS.
 * @param {Object} changes Settings to change.
 * @return {Object} New styles.
 */
export function writeMask( styles, level, changes ) {
	const { settings, inherited } = readMask( styles, level );
	const next = { ...settings, ...changes };

	// No shape here: nothing to write, or, if a wider screen has one,
	// switch it off at this size.
	if ( ! next.svg ) {
		return setLevel(
			styles,
			level,
			inherited.svg ? { maskImage: 'none' } : {}
		);
	}

	if ( ! inherited.svg ) {
		return setLevel( styles, level, toValues( next ) );
	}

	const same = ( name ) =>
		JSON.stringify( next[ name ] ) === JSON.stringify( inherited[ name ] );
	const write = {};

	if ( ! same( 'svg' ) || ! same( 'flip' ) ) {
		write.svg = next.svg;
		write.flip = next.flip;
	}

	[ 'size', 'position', 'repeat' ].forEach( ( name ) => {
		if ( ! same( name ) ) {
			write[ name ] = next[ name ];
		}
	} );

	return setLevel( styles, level, toValues( write ) );
}

/**
 * New styles with the mask removed: everywhere from desktop, or just one
 * breakpoint's own changes (so it inherits again).
 *
 * @param {Object} styles GB styles.
 * @param {number} level  Index in LEVELS.
 * @return {Object} New styles.
 */
export function clearMask( styles, level ) {
	let next = styles;

	LEVELS.forEach( ( _, index ) => {
		if ( 0 === level || index === level ) {
			next = setLevel( next, index, {} );
		}
	} );

	return next;
}

/**
 * Replace one level's mask-* properties, leaving every other style alone.
 *
 * @param {Object} styles GB styles.
 * @param {number} level  Index in LEVELS.
 * @param {Object} values mask-* values (undefined ones are left out).
 * @return {Object} New styles.
 */
function setLevel( styles, level, values ) {
	const key = LEVELS[ level ].key;
	const current = { ...propertiesAt( styles, level ) };

	PROPERTIES.forEach( ( name ) => delete current[ name ] );
	Object.entries( values ).forEach( ( [ name, value ] ) => {
		if ( undefined !== value ) {
			current[ name ] = value;
		}
	} );

	if ( ! key ) {
		// Desktop properties sit at the top level, next to the breakpoint objects.
		const next = { ...( styles || {} ) };

		PROPERTIES.forEach( ( name ) => delete next[ name ] );

		return { ...next, ...current };
	}

	const next = { ...( styles || {} ) };

	if ( Object.keys( current ).length ) {
		next[ key ] = current;
	} else {
		delete next[ key ];
	}

	return next;
}

/**
 * Whether a level has a mask setting of its own.
 *
 * @param {Object} styles GB styles.
 * @param {number} level  Index in LEVELS.
 * @return {boolean} Has its own settings.
 */
export function hasOwnMask( styles, level ) {
	const properties = propertiesAt( styles, level );

	return PROPERTIES.some( ( name ) => undefined !== properties[ name ] );
}
