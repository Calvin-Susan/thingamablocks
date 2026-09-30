/**
 * Dark mode colours.
 *
 * Lists the theme's colour palette (GeneratePress global colours, or a block
 * theme's presets) and lets you pick a dark version of each. The plugin prints
 * them as CSS variable overrides under :root[data-color-scheme="dark"], so the
 * whole site follows without writing any CSS.
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	PanelColorSettings,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Button, Flex } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';

/**
 * The CSS variable behind a palette colour. GeneratePress palette colours are
 * already var(--name); a block theme's are --wp--preset--color--slug.
 *
 * @param {Object} color Palette entry.
 * @return {string} Custom property name.
 */
export function paletteVariable( color ) {
	const match = /^var\(\s*(--[\w-]+)\s*\)$/.exec( color.color || '' );

	return match ? match[ 1 ] : `--wp--preset--color--${ color.slug }`;
}

export function useThemePalette() {
	return useSelect( ( select ) => {
		const settings = select( blockEditorStore ).getSettings();
		const features = settings.__experimentalFeatures?.color?.palette;

		return features?.theme?.length ? features.theme : settings.colors || [];
	}, [] );
}

/**
 * Read a CSS variable's current (light) value from the editor canvas.
 *
 * @param {string} name Custom property name.
 * @return {string} Value, or ''.
 */
function readVariable( name ) {
	const frame = document.querySelector( 'iframe[name="editor-canvas"]' );
	const doc = frame?.contentDocument || document;
	const target = doc.body || doc.documentElement;

	return getComputedStyle( target ).getPropertyValue( name ).trim();
}

/**
 * Turn any CSS colour into #rrggbb using the browser, so saved values never
 * point back at a variable they override (which would create a cycle).
 *
 * @param {string} value CSS colour.
 * @return {string} Hex colour, or the input if it can't be resolved.
 */
function toHex( value ) {
	if ( ! value ) {
		return value;
	}

	const varMatch = /^var\(\s*(--[\w-]+)\s*\)$/.exec( value );
	const resolved = varMatch ? readVariable( varMatch[ 1 ] ) : value;

	const canvas = document.createElement( 'canvas' ).getContext( '2d' );
	canvas.fillStyle = '#000';
	canvas.fillStyle = resolved;

	return /^#[0-9a-f]{6}$/i.test( canvas.fillStyle ) ? canvas.fillStyle : resolved;
}

function hexToHsl( hex ) {
	const value = parseInt( hex.slice( 1 ), 16 );
	const r = ( ( value >> 16 ) & 255 ) / 255;
	const g = ( ( value >> 8 ) & 255 ) / 255;
	const b = ( value & 255 ) / 255;
	const max = Math.max( r, g, b );
	const min = Math.min( r, g, b );
	const l = ( max + min ) / 2;
	let h = 0;
	let s = 0;

	if ( max !== min ) {
		const d = max - min;
		s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );

		if ( max === r ) {
			h = ( g - b ) / d + ( g < b ? 6 : 0 );
		} else if ( max === g ) {
			h = ( b - r ) / d + 2;
		} else {
			h = ( r - g ) / d + 4;
		}

		h /= 6;
	}

	return [ h, s, l ];
}

function hslToHex( h, s, l ) {
	const hue = ( p, q, t ) => {
		if ( t < 0 ) {
			t += 1;
		}
		if ( t > 1 ) {
			t -= 1;
		}
		if ( t < 1 / 6 ) {
			return p + ( q - p ) * 6 * t;
		}
		if ( t < 1 / 2 ) {
			return q;
		}
		if ( t < 2 / 3 ) {
			return p + ( q - p ) * ( 2 / 3 - t ) * 6;
		}
		return p;
	};

	let r = l;
	let g = l;
	let b = l;

	if ( s ) {
		const q = l < 0.5 ? l * ( 1 + s ) : l + s - l * s;
		const p = 2 * l - q;
		r = hue( p, q, h + 1 / 3 );
		g = hue( p, q, h );
		b = hue( p, q, h - 1 / 3 );
	}

	return (
		'#' +
		[ r, g, b ]
			.map( ( channel ) =>
				Math.round( channel * 255 )
					.toString( 16 )
					.padStart( 2, '0' )
			)
			.join( '' )
	);
}

/**
 * Suggest dark versions of a whole palette.
 *
 * Neutrals flip their lightness (white backgrounds become near-black, dark
 * text becomes near-white), keeping their order with a minimum step between
 * them, so Base, Base 2 and Base 3 don't all collapse into the same black.
 * Saturated brand colours keep their hue and get lighter to stay readable.
 *
 * @param {Array} entries [ { name, hex } ] in light mode.
 * @return {Object} Map of name → dark hex.
 */
export function suggestDarkPalette( entries ) {
	const result = {};
	const neutrals = [];

	entries.forEach( ( { name, hex } ) => {
		if ( ! /^#[0-9a-f]{6}$/i.test( hex || '' ) ) {
			return;
		}

		const [ h, s, l ] = hexToHsl( hex );

		if ( s < 0.25 ) {
			neutrals.push( { name, h, s, l } );
		} else {
			result[ name ] = hslToHex( h, Math.min( s, 0.85 ), Math.max( l, 0.62 ) );
		}
	} );

	// Lightest first: it becomes the darkest background.
	neutrals.sort( ( a, b ) => b.l - a.l );

	let previous = 0.02;

	neutrals.forEach( ( { name, h, s, l } ) => {
		const target = Math.min( 0.95, Math.max( 1 - l, previous + 0.05, 0.07 ) );
		previous = target;
		// Keep a hint of the original tint so warm or cool greys stay that way.
		result[ name ] = hslToHex( h, Math.min( s, 0.12 ), target );
	} );

	return result;
}

export default function DarkPaletteSettings( { darkPalette, setAttributes } ) {
	const palette = useThemePalette();

	const setColor = useCallback(
		( name, value ) => {
			const next = { ...darkPalette };

			if ( value ) {
				next[ name ] = toHex( value );
			} else {
				delete next[ name ];
			}

			setAttributes( { darkPalette: next } );
		},
		[ darkPalette, setAttributes ]
	);

	if ( ! palette.length ) {
		return null;
	}

	const suggestAll = () =>
		setAttributes( {
			darkPalette: suggestDarkPalette(
				palette.map( ( color ) => ( {
					name: paletteVariable( color ),
					hex: toHex( color.color ),
				} ) )
			),
		} );

	return (
		<PanelColorSettings
			title={ __( 'Dark mode colours', 'toggle-for-generateblocks' ) }
			initialOpen={ false }
			colorSettings={ palette.map( ( color ) => {
				const name = paletteVariable( color );

				return {
					label: sprintf(
						/* translators: %s: colour name, e.g. "Base 3". */
						__( '%s in dark mode', 'toggle-for-generateblocks' ),
						color.name
					),
					value: darkPalette[ name ],
					onChange: ( value ) => setColor( name, value ),
				};
			} ) }
		>
			<p className="ogal-toggle-help">
				{ __(
					'Each theme colour can have a dark version. The site uses them whenever dark mode is on. Leave a colour empty to keep it the same.',
					'toggle-for-generateblocks'
				) }
			</p>
			<Flex justify="flex-start" gap={ 2 }>
				<Button variant="secondary" size="compact" onClick={ suggestAll }>
					{ __( 'Suggest dark colours', 'toggle-for-generateblocks' ) }
				</Button>
				{ Object.keys( darkPalette ).length > 0 && (
					<Button
						variant="tertiary"
						size="compact"
						isDestructive
						onClick={ () => setAttributes( { darkPalette: {} } ) }
					>
						{ __( 'Clear', 'toggle-for-generateblocks' ) }
					</Button>
				) }
			</Flex>
		</PanelColorSettings>
	);
}

/**
 * CSS that applies the dark palette. Used for the editor preview; the front
 * end gets the same rule from PHP.
 *
 * @param {Object} darkPalette Map of custom property → colour.
 * @param {string} selector    Selector to scope the variables to.
 * @return {string} CSS.
 */
export function darkPaletteCss( darkPalette, selector ) {
	const declarations = Object.entries( darkPalette )
		.filter( ( [ name ] ) => /^--[\w-]+$/.test( name ) )
		.map( ( [ name, value ] ) => `${ name }:${ value };` )
		.join( '' );

	return declarations ? `${ selector }{${ declarations }color-scheme:dark}` : '';
}
