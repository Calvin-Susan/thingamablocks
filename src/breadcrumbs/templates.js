/**
 * Starting styles for the Breadcrumbs, offered as block variations.
 *
 * Each is three GenerateBlocks Text blocks, styled once and repeated for
 * every step of the trail on the site:
 *   data-breadcrumb-part="item"       the link to each page (an <a>)
 *   data-breadcrumb-part="separator"  between steps
 *   data-breadcrumb-part="current"    the current page, at the end
 *
 * Separators are characters, not icons, so the saved markup is plain text
 * (inline SVG would be removed for Authors and Contributors).
 */
import { __ } from '@wordpress/i18n';

import { color, padding, radius } from '../shared/gb';
import { variationIcons } from './icon';

const focusRing = {
	'&:focus-visible': {
		outlineWidth: '2px',
		outlineStyle: 'solid',
		outlineColor: color.accent,
		outlineOffset: '2px',
	},
};

const part = ( name, tagName, content, styles, htmlAttributes = {} ) => [
	'generateblocks/text',
	{
		tagName,
		content,
		htmlAttributes: { 'data-breadcrumb-part': name, ...htmlAttributes },
		styles,
	},
];

const link = ( styles = {} ) =>
	part(
		'item',
		'a',
		__( 'Parent page', 'thingamablocks' ),
		{
			// At least 24px tall, so it's an easy target (WCAG 2.5.8).
			display: 'inline-block',
			paddingTop: '0.25rem',
			paddingBottom: '0.25rem',
			color: color.muted,
			fontSize: '0.9375rem',
			lineHeight: '1.25',
			textDecoration: 'none',
			'&:is(:hover, :focus-visible)': {
				color: color.accent,
				textDecoration: 'underline',
			},
			...focusRing,
			...styles,
		},
		{ href: '#' }
	);

const separator = ( character, styles = {} ) =>
	part( 'separator', 'span', character, {
		color: color.muted,
		fontSize: '0.9375rem',
		...styles,
	} );

const current = ( styles = {} ) =>
	part( 'current', 'span', __( 'Current page', 'thingamablocks' ), {
		color: color.text,
		fontSize: '0.9375rem',
		fontWeight: '500',
		...styles,
	} );

const pill = {
	display: 'inline-block',
	...padding( '0.25rem', '0.75rem' ),
	...radius( '999px' ),
	lineHeight: '1.5',
};

export const variations = [
	{
		name: 'chevrons',
		title: __( 'Chevrons', 'thingamablocks' ),
		description: __( 'Home › Blog › Post', 'thingamablocks' ),
		icon: variationIcons.chevrons,
		isDefault: true,
		innerBlocks: [ link(), separator( '›' ), current() ],
		scope: [ 'block' ],
	},
	{
		name: 'slashes',
		title: __( 'Slashes', 'thingamablocks' ),
		description: __( 'Home / Blog / Post', 'thingamablocks' ),
		icon: variationIcons.slashes,
		innerBlocks: [ link(), separator( '/' ), current() ],
		scope: [ 'block' ],
	},
	{
		name: 'pills',
		title: __( 'Pills', 'thingamablocks' ),
		description: __(
			'Each step in a soft rounded box; the current page in your accent colour.',
			'thingamablocks'
		),
		icon: variationIcons.pills,
		innerBlocks: [
			link( {
				...pill,
				backgroundColor: color.surface,
				color: color.text,
				'&:is(:hover, :focus-visible)': {
					backgroundColor: color.border,
					color: color.text,
					textDecoration: 'none',
				},
			} ),
			separator( '›', { color: color.muted } ),
			current( {
				...pill,
				backgroundColor: color.accent,
				color: color.background,
				fontWeight: '600',
			} ),
		],
		scope: [ 'block' ],
	},
];
