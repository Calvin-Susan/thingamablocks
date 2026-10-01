/**
 * Turning an SVG into a CSS mask: clean it, flip it, and encode it as a
 * data: URL for mask-image (and back again, to show the current settings).
 *
 * SVGs can carry scripts, event handlers and links to other files, so only
 * plain shapes are kept: an allowlist of shape elements and presentation
 * attributes, nothing that can load or run anything. (A browser never runs
 * scripts in an SVG used as a CSS image anyway; cleaning also keeps the CSS
 * small.) The SVG is never uploaded to the Media Library: it's read in the
 * browser and stored, encoded, in the Image block's GenerateBlocks styles.
 */

// Largest cleaned SVG accepted, in characters. Masks are simple shapes; a
// file much bigger than this is usually an illustration with embedded images.
export const MAX_SVG_LENGTH = 100_000;

const SVG_NS = 'http://www.w3.org/2000/svg';
const FLIP_ID = /^tmb-flip-(x|y|xy)$/;

const ELEMENTS = new Set( [
	'svg',
	'g',
	'defs',
	'path',
	'rect',
	'circle',
	'ellipse',
	'line',
	'polyline',
	'polygon',
	'use',
	'symbol',
	'clipPath',
	'mask',
	'linearGradient',
	'radialGradient',
	'stop',
] );

const ATTRIBUTES = new Set( [
	'id',
	'viewBox',
	'preserveAspectRatio',
	'transform',
	'd',
	'points',
	'x',
	'y',
	'x1',
	'y1',
	'x2',
	'y2',
	'cx',
	'cy',
	'r',
	'rx',
	'ry',
	'fx',
	'fy',
	'width',
	'height',
	'pathLength',
	'fill',
	'fill-opacity',
	'fill-rule',
	'clip-rule',
	'opacity',
	'stroke',
	'stroke-width',
	'stroke-opacity',
	'stroke-linecap',
	'stroke-linejoin',
	'stroke-miterlimit',
	'stroke-dasharray',
	'stroke-dashoffset',
	'vector-effect',
	'clip-path',
	'mask',
	'href',
	'offset',
	'stop-color',
	'stop-opacity',
	'gradientUnits',
	'gradientTransform',
	'spreadMethod',
	'clipPathUnits',
	'maskUnits',
	'maskContentUnits',
] );

// Attributes that may only point at something inside the same SVG.
const LOCAL_REFERENCE = {
	href: /^#[\w-]+$/,
	'clip-path': /^url\(#[\w-]+\)$/,
	mask: /^url\(#[\w-]+\)$/,
	fill: /^(url\(#[\w-]+\)|[#\w(),.%\s-]+)$/,
	stroke: /^(url\(#[\w-]+\)|[#\w(),.%\s-]+)$/,
};

/**
 * Clean an SVG down to plain shapes.
 *
 * @param {string} source SVG markup.
 * @return {{svg: string}|{error: string}} The cleaned SVG, or why it can't be used.
 */
export function cleanSvg( source ) {
	const text = String( source || '' ).trim();

	if ( ! text ) {
		return { error: 'empty' };
	}

	const doc = new window.DOMParser().parseFromString( text, 'image/svg+xml' );
	const root = doc.documentElement;

	if (
		doc.querySelector( 'parsererror' ) ||
		'svg' !== root.localName ||
		SVG_NS !== root.namespaceURI
	) {
		return { error: 'invalid' };
	}

	cleanElement( root );

	// The shape must say how big it is, so it can be scaled to the image.
	if ( ! root.getAttribute( 'viewBox' ) ) {
		// Only absolute sizes: "100%" says nothing about the shape's proportions.
		const size = ( name ) => {
			const value = ( root.getAttribute( name ) || '' ).trim();
			return /^\d*\.?\d+(px)?$/.test( value ) ? parseFloat( value ) : 0;
		};
		const width = size( 'width' );
		const height = size( 'height' );

		if ( ! ( width > 0 && height > 0 ) ) {
			return { error: 'no-viewbox' };
		}

		root.setAttribute( 'viewBox', `0 0 ${ width } ${ height }` );
	}

	if ( ! viewBoxOf( root ) ) {
		return { error: 'no-viewbox' };
	}

	// The mask size comes from the CSS, not the file. And the shape keeps its
	// proportions unless the Size setting is Stretch: shapes made as section
	// dividers (like GenerateBlocks' own) say preserveAspectRatio="none",
	// which would make every size distort them. See buildMaskSvg().
	root.removeAttribute( 'width' );
	root.removeAttribute( 'height' );
	root.removeAttribute( 'preserveAspectRatio' );

	if (
		! root.querySelector(
			'path, rect, circle, ellipse, line, polyline, polygon, use'
		)
	) {
		return { error: 'no-shapes' };
	}

	const svg = new window.XMLSerializer()
		.serializeToString( root )
		.replace( /\s+/g, ' ' )
		.replace( /> </g, '><' );

	if ( svg.length > MAX_SVG_LENGTH ) {
		return { error: 'too-big' };
	}

	return { svg };
}

/**
 * Remove everything that isn't an allowed shape element or attribute.
 *
 * @param {Element} element Element to clean (in place).
 */
function cleanElement( element ) {
	[ ...element.attributes ].forEach( ( { name, value } ) => {
		const local = name.replace( /^xlink:/, '' );
		const pattern = LOCAL_REFERENCE[ local ];
		const keep =
			ATTRIBUTES.has( local ) &&
			! /^xmlns/.test( name ) &&
			( ! pattern || pattern.test( value.trim() ) ) &&
			// Belt and braces: nothing that could load something.
			! /(javascript|data|https?):|url\((?!#)/i.test( value ) &&
			// The flip marker is ours; a file can't claim to be flipped.
			! ( 'id' === local && FLIP_ID.test( value ) );

		element.removeAttribute( name );

		if ( keep ) {
			element.setAttribute( local, value );
		}
	} );

	[ ...element.childNodes ].forEach( ( child ) => {
		if ( 1 !== child.nodeType ) {
			// Text, comments and processing instructions aren't shapes.
			child.remove();
		} else if (
			SVG_NS !== child.namespaceURI ||
			! ELEMENTS.has( child.localName )
		) {
			child.remove();
		} else {
			cleanElement( child );
		}
	} );
}

/**
 * The viewBox as numbers.
 *
 * @param {Element} root <svg> element.
 * @return {number[]|null} [ minX, minY, width, height ].
 */
function viewBoxOf( root ) {
	const box = ( root.getAttribute( 'viewBox' ) || '' )
		.trim()
		.split( /[\s,]+/ )
		.map( Number );

	return 4 === box.length &&
		box.every( Number.isFinite ) &&
		box[ 2 ] > 0 &&
		box[ 3 ] > 0
		? box
		: null;
}

/**
 * The SVG as stored in mask-image: flipped as asked, and, for the Stretch
 * size only, allowed to distort to fill the image.
 *
 * @param {string}  svg     Cleaned SVG.
 * @param {string}  flip    '', 'x', 'y' or 'xy'.
 * @param {boolean} stretch Distort to fill (Size: Stretch).
 * @return {string} SVG.
 */
export function buildMaskSvg( svg, flip, stretch ) {
	const flipped = flipSvg( svg, flip );

	return stretch
		? flipped.replace( /^<svg\b/, '<svg preserveAspectRatio="none"' )
		: flipped;
}

/**
 * Mirror the shape. The flip is a wrapper group with a known id, so it can be
 * read back (and undone) from the stored mask.
 *
 * @param {string} svg  Cleaned SVG.
 * @param {string} flip '', 'x', 'y' or 'xy'.
 * @return {string} SVG.
 */
export function flipSvg( svg, flip ) {
	if ( ! flip ) {
		return svg;
	}

	const doc = new window.DOMParser().parseFromString( svg, 'image/svg+xml' );
	const root = doc.documentElement;
	const [ minX, minY, width, height ] = viewBoxOf( root );
	const flipX = flip.includes( 'x' );
	const flipY = flip.includes( 'y' );
	const group = doc.createElementNS( SVG_NS, 'g' );

	group.setAttribute( 'id', `tmb-flip-${ flip }` );
	group.setAttribute(
		'transform',
		`translate(${ flipX ? 2 * minX + width : 0 } ${
			flipY ? 2 * minY + height : 0
		}) scale(${ flipX ? -1 : 1 } ${ flipY ? -1 : 1 })`
	);

	// <defs> stay outside the flip; everything drawn goes inside.
	[ ...root.childNodes ]
		.filter( ( child ) => 'defs' !== child.localName )
		.forEach( ( child ) => group.appendChild( child ) );
	root.appendChild( group );

	return new window.XMLSerializer().serializeToString( root );
}

/**
 * Undo flipSvg(): the original shape and how it was flipped.
 *
 * @param {string} svg SVG.
 * @return {{svg: string, flip: string}} Unflipped SVG and flip.
 */
export function unflipSvg( svg ) {
	if ( ! svg ) {
		return { svg: '', flip: '' };
	}

	const doc = new window.DOMParser().parseFromString( svg, 'image/svg+xml' );
	const root = doc.documentElement;

	if ( doc.querySelector( 'parsererror' ) || 'svg' !== root.localName ) {
		return { svg: '', flip: '' };
	}

	const group = [ ...root.children ].find(
		( child ) => 'g' === child.localName && FLIP_ID.test( child.id )
	);

	if ( ! group ) {
		return { svg, flip: '' };
	}

	const flip = group.id.match( FLIP_ID )[ 1 ];

	[ ...group.childNodes ].forEach( ( child ) =>
		root.insertBefore( child, group )
	);
	group.remove();

	return { svg: new window.XMLSerializer().serializeToString( root ), flip };
}

/**
 * A mask-image value for an SVG. Everything outside plain letters and
 * numbers is percent-encoded, including quotes and brackets, so the value
 * can't end the url() or the CSS rule early. (GenerateBlocks rewrites the
 * url() quotes to single quotes when it compiles the CSS.)
 *
 * @param {string} svg SVG.
 * @return {string} CSS value.
 */
export function toMaskImage( svg ) {
	const encoded = encodeURIComponent( svg ).replace(
		/['()*!~]/g,
		( char ) => '%' + char.charCodeAt( 0 ).toString( 16 ).toUpperCase()
	);

	return `url("data:image/svg+xml,${ encoded }")`;
}

/**
 * The SVG inside a mask-image value made by toMaskImage(), if it is one.
 *
 * @param {string} value CSS value.
 * @return {string} SVG, or '' for anything else.
 */
export function fromMaskImage( value ) {
	const match = String( value || '' ).match(
		/^url\(\s*["']?data:image\/svg\+xml,([^"')]*)["']?\s*\)$/
	);

	if ( ! match ) {
		return '';
	}

	try {
		return decodeURIComponent( match[ 1 ] );
	} catch ( e ) {
		return '';
	}
}

/**
 * A data: URL for showing an SVG in an <img> (previews in the panel). An
 * <img> never runs scripts in an SVG, unlike inline markup.
 *
 * @param {string} svg SVG.
 * @return {string} URL.
 */
export function svgPreviewUrl( svg ) {
	return `data:image/svg+xml,${ encodeURIComponent( svg ) }`;
}
