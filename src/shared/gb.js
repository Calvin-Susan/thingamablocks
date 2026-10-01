/**
 * Small helpers for fitting in with GenerateBlocks.
 */

// GenerateBlocks colours block icons with this class, so ours match its blocks.
export const GB_ICON_CLASS = 'gblocks-block-icon';

/**
 * The inserter's preview wants block objects rather than a template array.
 *
 * @param {Array} template Block template ([ name, attributes, innerBlocks ]).
 * @return {Array} Block objects.
 */
export const toBlockObjects = ( template = [] ) =>
	template.map( ( [ name, attributes, innerBlocks ] ) => ( {
		name,
		attributes,
		innerBlocks: toBlockObjects( innerBlocks ),
	} ) );

/*
 * GenerateBlocks style helpers: GB stores longhand properties.
 */
export const radius = ( value ) => ( {
	borderTopLeftRadius: value,
	borderTopRightRadius: value,
	borderBottomRightRadius: value,
	borderBottomLeftRadius: value,
} );

export const padding = ( y, x = y ) => ( {
	paddingTop: y,
	paddingRight: x,
	paddingBottom: y,
	paddingLeft: x,
} );

export const border = ( width, style, value ) => ( {
	borderTopWidth: width,
	borderRightWidth: width,
	borderBottomWidth: width,
	borderLeftWidth: width,
	borderTopStyle: style,
	borderRightStyle: style,
	borderBottomStyle: style,
	borderLeftStyle: style,
	borderTopColor: value,
	borderRightColor: value,
	borderBottomColor: value,
	borderLeftColor: value,
} );

// GeneratePress global colours, with fallbacks for other themes.
export const color = {
	accent: 'var(--accent, #1e73be)',
	text: 'var(--contrast, #222222)',
	muted: 'var(--contrast-2, #575760)',
	subtle: 'var(--contrast-3, #b2b2be)',
	surface: 'var(--base-2, #f7f8f9)',
	border: 'var(--base, #f0f0f0)',
	background: 'var(--base-3, #ffffff)',
};

/**
 * GenerateBlocks styles that hide text visually but keep it for screen
 * readers (the usual "screen-reader-text" technique).
 */
export const visuallyHidden = {
	position: 'absolute',
	width: '1px',
	height: '1px',
	overflow: 'hidden',
	clipPath: 'inset(50%)',
	whiteSpace: 'nowrap',
};
