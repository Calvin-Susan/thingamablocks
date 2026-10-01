/**
 * Starting styles for the Search block, offered as block variations.
 *
 * Everything visible is a real GenerateBlocks block, marked with
 * data-search-part:
 *   field   the box around the input: style its border, background, font
 *           and colour here (the input takes on its font and colour)
 *   input   a Text block that becomes the text input; its text is the
 *           placeholder
 *   submit  the search button (a Text block set to <button>)
 *   toggle  the "expanding" style's button that opens the field
 */
import { __ } from '@wordpress/i18n';

import { border, color, padding, radius } from '../shared/gb';
import { variationIcons } from './icon';

const magnifier =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>';

const focusRing = ( offset = '2px' ) => ( {
	outlineWidth: '2px',
	outlineStyle: 'solid',
	outlineColor: color.accent,
	outlineOffset: offset,
} );

const part = ( name, block, attributes, children ) => [
	block,
	{
		...attributes,
		htmlAttributes: {
			...( attributes.htmlAttributes || {} ),
			'data-search-part': name,
		},
	},
	children,
];

const input = () =>
	part( 'input', 'generateblocks/text', {
		tagName: 'span',
		content: __( 'Search…', 'thingamablocks' ),
		styles: { flexGrow: '1' },
	} );

const field = ( styles, children ) =>
	part(
		'field',
		'generateblocks/element',
		{
			tagName: 'div',
			styles: {
				display: 'flex',
				alignItems: 'center',
				columnGap: '0.5rem',
				backgroundColor: color.background,
				color: color.text,
				'&:focus-within': focusRing(),
				...styles,
			},
		},
		children
	);

// A Text block set to <button>: with a label, or just the magnifier.
const button = ( name, label, styles ) =>
	part( name, 'generateblocks/text', {
		tagName: 'button',
		content: label,
		...( label
			? {}
			: { icon: magnifier, iconOnly: true, iconLocation: 'before' } ),
		styles: {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			columnGap: '0.5rem',
			...border( '0', 'none', 'transparent' ),
			cursor: 'pointer',
			fontWeight: '600',
			lineHeight: '1',
			transition: 'background-color 0.2s ease, color 0.2s ease',
			'&:focus-visible': focusRing(),
			'.gb-shape svg': { width: '1.25em', height: '1.25em' },
			...styles,
		},
	} );

const accentButton = {
	backgroundColor: color.accent,
	color: color.background,
	// Set these too: themes give every <button> a hover, focus and pressed
	// background (GeneratePress: a dark grey).
	'&:is(:hover, :focus, :active)': {
		backgroundColor: color.text,
		color: color.background,
	},
};

const plainButton = {
	backgroundColor: 'transparent',
	color: color.text,
	'&:is(:hover, :focus, :active)': {
		backgroundColor: color.surface,
		color: color.accent,
	},
};

const corner = '0.5rem';

export const variations = [
	{
		name: 'bar',
		title: __( 'Bar with button', 'thingamablocks' ),
		description: __(
			'A search field with a button beside it.',
			'thingamablocks'
		),
		icon: variationIcons.bar,
		isDefault: true,
		innerBlocks: [
			[
				'generateblocks/element',
				{
					tagName: 'div',
					styles: {
						display: 'flex',
						alignItems: 'stretch',
						columnGap: '0.5rem',
					},
				},
				[
					field(
						{
							flexGrow: '1',
							...padding( '0', '1rem' ),
							...radius( corner ),
							...border( '1px', 'solid', color.subtle ),
						},
						[ input() ]
					),
					button( 'submit', __( 'Search', 'thingamablocks' ), {
						...padding( '0', '1.25rem' ),
						...radius( corner ),
						...accentButton,
					} ),
				],
			],
		],
		scope: [ 'block' ],
	},
	{
		name: 'pill',
		title: __( 'Pill, button inside', 'thingamablocks' ),
		description: __(
			'A rounded field with a round search button inside it.',
			'thingamablocks'
		),
		icon: variationIcons.pill,
		innerBlocks: [
			field(
				{
					...padding( '0.3125rem', '0.3125rem', '0.3125rem' ),
					paddingLeft: '1.25rem',
					...radius( '999px' ),
					...border( '1px', 'solid', color.subtle ),
				},
				[
					input(),
					button( 'submit', '', {
						flexShrink: '0',
						width: '2.5rem',
						height: '2.5rem',
						...padding( '0' ),
						...radius( '999px' ),
						...accentButton,
					} ),
				]
			),
		],
		scope: [ 'block' ],
	},
	{
		name: 'underline',
		title: __( 'Underline', 'thingamablocks' ),
		description: __(
			'Just a line and an icon, for headers and sidebars.',
			'thingamablocks'
		),
		icon: variationIcons.underline,
		innerBlocks: [
			field(
				{
					backgroundColor: 'transparent',
					borderBottomWidth: '2px',
					borderBottomStyle: 'solid',
					borderBottomColor: color.text,
					'&:focus-within': {
						...focusRing( '4px' ),
						borderBottomColor: color.accent,
					},
				},
				[
					input(),
					button( 'submit', '', {
						flexShrink: '0',
						width: '2.5rem',
						height: '2.5rem',
						...padding( '0' ),
						...radius( '999px' ),
						...plainButton,
					} ),
				]
			),
		],
		scope: [ 'block' ],
	},
	{
		name: 'expand',
		title: __( 'Icon that opens a search', 'thingamablocks' ),
		description: __(
			'Just a search icon until it’s clicked, then the field opens below it.',
			'thingamablocks'
		),
		icon: variationIcons.expand,
		innerBlocks: [
			[
				'generateblocks/element',
				{
					tagName: 'div',
					styles: {
						position: 'relative',
						display: 'inline-flex',
					},
				},
				[
					button( 'toggle', '', {
						width: '2.75rem',
						height: '2.75rem',
						...padding( '0' ),
						...radius( '999px' ),
						...plainButton,
						'&[aria-expanded="true"]': {
							backgroundColor: color.surface,
							color: color.accent,
						},
					} ),
					field(
						{
							position: 'absolute',
							zIndex: '100',
							top: 'calc(100% + 0.5rem)',
							right: '0',
							width: '20rem',
							maxWidth: 'calc(100vw - 2rem)',
							...padding( '0.3125rem' ),
							paddingLeft: '1rem',
							...radius( corner ),
							...border( '1px', 'solid', color.border ),
							boxShadow:
								'0 12px 32px -12px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.06)',
						},
						[
							input(),
							button(
								'submit',
								__( 'Search', 'thingamablocks' ),
								{
									flexShrink: '0',
									...padding( '0.625rem', '1rem' ),
									...radius( '0.375rem' ),
									...accentButton,
								}
							),
						]
					),
				],
			],
		],
		scope: [ 'block' ],
	},
];
