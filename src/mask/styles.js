/**
 * Reading and writing the mask in a GenerateBlocks block's `styles`.
 *
 * GenerateBlocks keeps styles as an object of CSS properties, with nested
 * objects for its breakpoints ("@media (max-width:1024px)" etc.), and
 * compiles them to CSS itself whenever they change. So the mask is plain
 * mask-* properties at the right level: tablet and mobile inherit desktop
 * through the CSS cascade, and everything is visible (and editable) in GB's
 * own Styles panel.
 *
 * Values are kept as the CSS text that's stored, so a value typed in GB's
 * Styles panel (say a position of "right 10px bottom") survives untouched
 * until it's changed here.
 */
import {
	cleanSvg,
	fromMaskImage,
	toMaskImage,
	buildMaskSvg,
	unflipSvg,
} from './svg';

// The Size setting that lets the shape distort to fill the image.
export const STRETCH = '100% 100%';

/**
 * mask-image for settings: the shape, flipped, and allowed to distort only
 * when the size is Stretch.
 *
 * @param {Object} settings Settings.
 * @return {string} CSS value.
 */
function imageFor( settings ) {
	return toMaskImage(
		buildMaskSvg( settings.svg, settings.flip, STRETCH === settings.size )
	);
}

/**
 * The editor's preview devices, mapped to GenerateBlocks' breakpoints. Each
 * level inherits from the ones before it. The breakpoints are looked up the
 * way GenerateBlocks does, so a site that changed them gets its own.
 *
 * @return {Array<{device: string, key: string|null}>} Levels.
 */
export function getLevels() {
	const rules = window.gb?.stylesBuilder?.defaultAtRules || [];
	const rule = ( id, fallback ) =>
		rules.find( ( item ) => item.id === id )?.value || fallback;

	return [
		{ device: 'Desktop', key: null },
		{
			device: 'Tablet',
			key: rule( 'mediumSmallWidth', '@media (max-width:1024px)' ),
		},
		{
			device: 'Mobile',
			key: rule( 'smallWidth', '@media (max-width:767px)' ),
		},
	];
}

// Setting → CSS property.
const PROPERTIES = {
	size: 'maskSize',
	position: 'maskPosition',
	repeat: 'maskRepeat',
};

export const DEFAULTS = {
	svg: '',
	flip: '',
	size: 'contain',
	position: '50% 50%',
	repeat: 'no-repeat',
};

/**
 * The style properties set at one level.
 *
 * @param {Object} styles GB styles.
 * @param {number} level  Index in getLevels().
 * @return {Object} Properties.
 */
function propertiesAt( styles, level ) {
	const key = getLevels()[ level ].key;

	return ( key ? styles?.[ key ] : styles ) || {};
}

/**
 * The settings stored at one level (only the ones it sets).
 *
 * @param {Object} values Properties at a level.
 * @return {Object} Settings.
 */
function toSettings( values ) {
	const settings = {};

	if ( undefined !== values.maskImage ) {
		// "none" turns an inherited mask off at this size. A mask-image typed
		// by hand in GB's Styles panel (not an SVG from here) reads as no shape.
		// Cleaned again on the way in: the stored value could have been edited
		// by hand, and cleaning also gives one canonical form to compare.
		const { svg, flip } = unflipSvg( fromMaskImage( values.maskImage ) );

		settings.svg = svg ? cleanSvg( svg ).svg || '' : '';
		settings.flip = settings.svg ? flip : '';
	}

	Object.entries( PROPERTIES ).forEach( ( [ name, property ] ) => {
		if ( undefined !== values[ property ] ) {
			settings[ name ] = String( values[ property ] );
		}
	} );

	return settings;
}

/**
 * The settings in effect at a level (its own over the inherited ones), and
 * the inherited ones on their own.
 *
 * @param {Object} styles GB styles.
 * @param {number} level  Index in getLevels().
 * @return {{settings: Object, inherited: Object}} Settings.
 */
export function readMask( styles, level ) {
	let inherited = { ...DEFAULTS };

	for ( let index = 0; index < level; index++ ) {
		inherited = {
			...inherited,
			...toSettings( propertiesAt( styles, index ) ),
		};
	}

	return {
		settings: {
			...inherited,
			...toSettings( propertiesAt( styles, level ) ),
		},
		inherited,
	};
}

/**
 * Change mask settings at one level.
 *
 * Only the properties being changed are written, except where no wider
 * level has a mask yet: there every setting is written, so the CSS is
 * complete on its own (the browser's defaults, like repeating, never leak
 * in). A smaller level never stores a value equal to what it inherits, so
 * changing desktop later still flows down.
 *
 * The shape and its flip share one CSS value (mask-image). When the shape is
 * replaced, smaller levels that only flipped it are updated to flip the new
 * shape; a smaller level with a different shape of its own keeps it.
 *
 * @param {Object} styles  GB styles.
 * @param {number} level   Index in getLevels().
 * @param {Object} changes Settings to change.
 * @return {Object} New styles.
 */
export function writeMask( styles, level, changes ) {
	const { settings, inherited } = readMask( styles, level );
	const next = { ...settings, ...changes };
	const own = { ...propertiesAt( styles, level ) };

	if ( ! next.svg ) {
		// No shape here: none at all, or switch an inherited one off at this size.
		return setLevel(
			styles,
			level,
			inherited.svg ? { maskImage: 'none' } : {}
		);
	}

	const complete = ! inherited.svg;
	const differs = ( name ) => complete || next[ name ] !== inherited[ name ];
	const values = {};

	// The image carries the shape, its flip and whether it may stretch; it's
	// stored here only if it differs from the one inherited.
	const image = imageFor( next );

	if ( complete || image !== imageFor( inherited ) ) {
		values.maskImage = image;
	}

	Object.entries( PROPERTIES ).forEach( ( [ name, property ] ) => {
		if ( name in changes || complete ) {
			if ( differs( name ) ) {
				values[ property ] = next[ name ];
			}
		} else if ( undefined !== own[ property ] ) {
			// Untouched: keep exactly what's stored.
			values[ property ] = own[ property ];
		}
	} );

	let result = setLevel( styles, level, values );

	if ( 'svg' in changes && changes.svg !== settings.svg ) {
		result = carryShape( result, level, settings.svg, changes.svg );
	}

	return result;
}

/**
 * After the shape changes at a level, smaller levels that only flipped (or
 * stretched) the old shape get the new shape, flipped and stretched as before.
 *
 * @param {Object} styles GB styles.
 * @param {number} level  Level whose shape changed.
 * @param {string} from   Old shape.
 * @param {string} to     New shape.
 * @return {Object} New styles.
 */
function carryShape( styles, level, from, to ) {
	let next = styles;

	for ( let index = level + 1; index < getLevels().length; index++ ) {
		const own = propertiesAt( next, index );
		const { svg, flip } = toSettings( { maskImage: own.maskImage } );

		if ( undefined !== own.maskImage && svg && svg === from ) {
			const { size } = readMask( next, index ).settings;

			next = setLevel( next, index, {
				...own,
				maskImage: imageFor( { svg: to, flip, size } ),
			} );
		}
	}

	return next;
}

/**
 * New styles with the mask removed: everywhere from desktop, or just one
 * smaller level's own changes (so it inherits again).
 *
 * @param {Object} styles GB styles.
 * @param {number} level  Index in getLevels().
 * @return {Object} New styles.
 */
export function clearMask( styles, level ) {
	let next = styles;

	getLevels().forEach( ( _, index ) => {
		if ( 0 === level || index === level ) {
			next = setLevel( next, index, {} );
		}
	} );

	return next;
}

const MASK_PROPERTIES = [ 'maskImage', ...Object.values( PROPERTIES ) ];

/**
 * Replace one level's mask-* properties, leaving every other style alone.
 *
 * @param {Object} styles GB styles.
 * @param {number} level  Index in getLevels().
 * @param {Object} values mask-* values.
 * @return {Object} New styles.
 */
function setLevel( styles, level, values ) {
	const key = getLevels()[ level ].key;
	const current = { ...propertiesAt( styles, level ) };

	MASK_PROPERTIES.forEach( ( name ) => delete current[ name ] );
	Object.entries( values ).forEach( ( [ name, value ] ) => {
		if ( undefined !== value && MASK_PROPERTIES.includes( name ) ) {
			current[ name ] = value;
		}
	} );

	const next = { ...( styles || {} ) };

	if ( ! key ) {
		// Desktop properties sit at the top level, next to the breakpoint objects.
		MASK_PROPERTIES.forEach( ( name ) => delete next[ name ] );

		return { ...next, ...current };
	}

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
 * @param {number} level  Index in getLevels().
 * @return {boolean} Has its own settings.
 */
export function hasOwnMask( styles, level ) {
	const properties = propertiesAt( styles, level );

	return MASK_PROPERTIES.some( ( name ) => undefined !== properties[ name ] );
}

/**
 * A position for the focal point picker, if the stored value is two
 * percentages (as the picker writes); otherwise null (set elsewhere).
 *
 * @param {string} position mask-position.
 * @return {{x: number, y: number}|null} Focal point.
 */
export function focalPoint( position ) {
	const match = String( position )
		.trim()
		.match( /^(-?[\d.]+)%\s+(-?[\d.]+)%$/ );

	return match
		? {
				x: parseFloat( match[ 1 ] ) / 100,
				y: parseFloat( match[ 2 ] ) / 100,
		  }
		: null;
}

/**
 * mask-position for a focal point.
 *
 * @param {{x: number, y: number}} point Focal point.
 * @return {string} CSS value.
 */
export function positionFromPoint( { x, y } ) {
	return `${ Math.round( x * 100 ) }% ${ Math.round( y * 100 ) }%`;
}
