/**
 * Starting layouts for the Dropdown, offered as block variations.
 *
 * Everything visible is a real GenerateBlocks block, marked with:
 *   data-dropdown-part="button"  the button that opens and closes it (a GB
 *                                Button, i.e. a Text block set to <button>)
 *   data-dropdown-part="drawer"  what opens: a GB Element holding anything
 *
 * State styling is on the button: &[aria-expanded="true"] while open (the
 * layouts use it to turn the chevron). The drawer is as wide as the button
 * unless it's given a width of its own in the Styles panel.
 */
import { __ } from '@wordpress/i18n';

import { border, color, padding, radius } from '../shared/gb';
import { variationIcons } from './icon';

const chevron =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>';

// Shared by the button and the drawer, so they look like a pair.
const corner = '0.5rem';

const focusRing = {
	'&:focus-visible': {
		outlineWidth: '2px',
		outlineStyle: 'solid',
		outlineColor: color.accent,
		outlineOffset: '2px',
	},
};

const button = ( label ) => [
	'generateblocks/text',
	{
		tagName: 'button',
		content: label,
		icon: chevron,
		iconLocation: 'after',
		htmlAttributes: { 'data-dropdown-part': 'button' },
		styles: {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			columnGap: '0.75rem',
			...padding( '0.75rem', '1.25rem' ),
			...radius( corner ),
			...border( '0', 'none', 'transparent' ),
			backgroundColor: color.accent,
			color: color.background,
			fontSize: '1rem',
			fontWeight: '600',
			lineHeight: '1.2',
			cursor: 'pointer',
			transition: 'background-color 0.2s ease',
			'&:is(:hover, :focus-visible), &[aria-expanded="true"]': {
				backgroundColor: color.text,
				color: color.background,
			},
			...focusRing,
			'.gb-shape svg': {
				width: '1.1em',
				height: '1.1em',
				transition: 'transform 0.2s ease',
			},
			'&[aria-expanded="true"] .gb-shape svg': {
				transform: 'rotate(180deg)',
			},
		},
	},
];

const drawerStyles = {
	display: 'flex',
	flexDirection: 'column',
	rowGap: '0.125rem',
	// Themes give lists a margin (GeneratePress: 3em on the left).
	marginTop: '0',
	marginRight: '0',
	marginBottom: '0',
	marginLeft: '0',
	...padding( '0.375rem' ),
	...radius( corner ),
	...border( '1px', 'solid', color.border ),
	backgroundColor: color.background,
	color: color.text,
	boxShadow:
		'0 12px 32px -12px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.06)',
	listStyleType: 'none',
};

const drawer = ( tagName, children, styles = {} ) => [
	'generateblocks/element',
	{
		tagName,
		htmlAttributes: { 'data-dropdown-part': 'drawer' },
		styles: { ...drawerStyles, ...styles },
	},
	children,
];

// One row in the drawer: a link that fills the row, with a hover tint.
const rowLink = {
	display: 'flex',
	flexDirection: 'column',
	rowGap: '0.125rem',
	...padding( '0.5rem', '0.75rem' ),
	...radius( '0.25rem' ),
	color: color.text,
	textDecoration: 'none',
	transition: 'background-color 0.15s ease',
	'&:is(:hover, :focus-visible)': {
		backgroundColor: color.surface,
		color: color.accent,
	},
	...focusRing,
	'&:focus-visible': {
		...focusRing[ '&:focus-visible' ],
		outlineOffset: '-2px',
	},
};

const listItem = ( children ) => [
	'generateblocks/element',
	{
		tagName: 'li',
		styles: {
			marginTop: '0',
			marginRight: '0',
			marginBottom: '0',
			marginLeft: '0',
		},
	},
	children,
];

const text = ( content, styles, tagName = 'span' ) => [
	'generateblocks/text',
	{ tagName, content, styles },
];

const downloads = () => {
	const files = [
		[
			__( 'Brochure', 'thingamablocks' ),
			__( 'PDF · 2.4 MB', 'thingamablocks' ),
		],
		[
			__( 'Price list', 'thingamablocks' ),
			__( 'XLSX · 48 KB', 'thingamablocks' ),
		],
		[
			__( 'Logo pack', 'thingamablocks' ),
			__( 'ZIP · 6.1 MB', 'thingamablocks' ),
		],
	];

	return [
		button( __( 'Downloads', 'thingamablocks' ) ),
		drawer(
			'ul',
			files.map( ( [ name, meta ] ) =>
				listItem( [
					[
						'generateblocks/element',
						{
							tagName: 'a',
							htmlAttributes: { href: '#' },
							styles: rowLink,
						},
						[
							text( name, {
								fontSize: '0.9375rem',
								fontWeight: '600',
								lineHeight: '1.3',
							} ),
							text( meta, {
								fontSize: '0.8125rem',
								lineHeight: '1.3',
								color: color.muted,
							} ),
						],
					],
				] )
			)
		),
	];
};

const links = () => {
	const items = [
		__( 'Documentation', 'thingamablocks' ),
		__( 'Support', 'thingamablocks' ),
		__( 'Changelog', 'thingamablocks' ),
	];

	return [
		button( __( 'Resources', 'thingamablocks' ) ),
		drawer(
			'ul',
			items.map( ( label ) =>
				listItem( [
					[
						'generateblocks/text',
						{
							tagName: 'a',
							content: label,
							htmlAttributes: { href: '#' },
							styles: {
								...rowLink,
								display: 'block',
								fontSize: '0.9375rem',
								fontWeight: '500',
							},
						},
					],
				] )
			)
		),
	];
};

const panel = () => [
	button( __( 'Need help?', 'thingamablocks' ) ),
	drawer(
		'div',
		[
			text(
				__( 'Talk to a real person', 'thingamablocks' ),
				{ marginBottom: '0', fontSize: '1rem', fontWeight: '600' },
				'p'
			),
			text(
				__(
					'We usually reply within a few hours, Monday to Friday.',
					'thingamablocks'
				),
				{ marginBottom: '0', fontSize: '0.875rem', color: color.muted },
				'p'
			),
			[
				'generateblocks/text',
				{
					tagName: 'a',
					content: __( 'Contact us', 'thingamablocks' ),
					htmlAttributes: { href: '#' },
					styles: {
						display: 'inline-flex',
						alignSelf: 'flex-start',
						marginTop: '0.25rem',
						...padding( '0.5rem', '0.875rem' ),
						...radius( '0.375rem' ),
						backgroundColor: color.accent,
						color: color.background,
						fontSize: '0.875rem',
						fontWeight: '600',
						textDecoration: 'none',
						'&:is(:hover, :focus-visible)': {
							backgroundColor: color.text,
							color: color.background,
						},
						...focusRing,
					},
				},
			],
		],
		// A panel needs room: this layout sets its own width (the others match the button).
		{ width: '18rem', rowGap: '0.5rem', ...padding( '1rem' ) }
	),
];

export const variations = [
	{
		name: 'downloads',
		title: __( 'Downloads', 'thingamablocks' ),
		description: __(
			'A button that opens a list of files, each with its type and size.',
			'thingamablocks'
		),
		icon: variationIcons.downloads,
		isDefault: true,
		innerBlocks: downloads(),
		scope: [ 'block' ],
	},
	{
		name: 'links',
		title: __( 'Simple links', 'thingamablocks' ),
		description: __(
			'A button that opens a plain list of links.',
			'thingamablocks'
		),
		icon: variationIcons.links,
		innerBlocks: links(),
		scope: [ 'block' ],
	},
	{
		name: 'panel',
		title: __( 'Panel', 'thingamablocks' ),
		description: __(
			'A button that opens a panel for any content: text, buttons, images.',
			'thingamablocks'
		),
		icon: variationIcons.panel,
		innerBlocks: panel(),
		scope: [ 'block' ],
	},
];
