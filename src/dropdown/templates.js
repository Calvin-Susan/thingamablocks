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

import { nameBlocks, partOf } from '../shared/gb';
import { variationIcons } from './icon';

const chevron =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>';

/*
 * The look comes from GenerateBlocks Pro Global Styles the plugin creates
 * (includes/class-thingamablocks-global-styles.php): a base class for each
 * part, plus a modifier for the layout, e.g. tmb-dropdown__drawer and
 * tmb-dropdown__drawer--panel. Edit a class to restyle every dropdown.
 * Positioning and the closed state aren't in the classes: they come from the
 * block itself (style.scss, view.js and the PHP renderer).
 */
const classes = ( part, modifier ) => {
	const base = `tmb-dropdown__${ part }`;

	return modifier ? [ base, `${ base }--${ modifier }` ] : [ base ];
};

const button = ( label ) => [
	'generateblocks/text',
	{
		tagName: 'button',
		content: label,
		icon: chevron,
		iconLocation: 'after',
		htmlAttributes: { 'data-dropdown-part': 'button' },
		globalClasses: classes( 'button' ),
	},
];

const drawer = ( tagName, children, modifier ) => [
	'generateblocks/element',
	{
		tagName,
		htmlAttributes: { 'data-dropdown-part': 'drawer' },
		globalClasses: classes( 'drawer', modifier ),
	},
	children,
];

const listItem = ( children ) => [
	'generateblocks/element',
	{
		tagName: 'li',
		globalClasses: classes( 'item' ),
	},
	children,
];

const text = ( content, part, tagName = 'span' ) => [
	'generateblocks/text',
	{ tagName, content, globalClasses: classes( part ) },
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
							globalClasses: classes( 'link', 'downloads' ),
						},
						[
							text( name, 'file-name' ),
							text( meta, 'file-meta' ),
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
							globalClasses: classes( 'link', 'simple' ),
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
				'title',
				'p'
			),
			text(
				__(
					'We usually reply within a few hours, Monday to Friday.',
					'thingamablocks'
				),
				'text',
				'p'
			),
			[
				'generateblocks/text',
				{
					tagName: 'a',
					content: __( 'Contact us', 'thingamablocks' ),
					htmlAttributes: { href: '#' },
					globalClasses: classes( 'cta' ),
				},
			],
		],
		// A panel needs room: its modifier sets a width (the others match the button).
		'panel'
	),
];

const layouts = [
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

// Names shown in List View.
const blockName = ( attributes ) => {
	switch ( partOf( attributes, 'dropdown' ) ) {
		case 'button':
			return __( 'Button', 'thingamablocks' );
		case 'drawer':
			return __( 'Drawer', 'thingamablocks' );
		case 'item':
			return __( 'List item', 'thingamablocks' );
		case 'link':
			return __( 'Link', 'thingamablocks' );
		case 'file-name':
			return __( 'File name', 'thingamablocks' );
		case 'file-meta':
			return __( 'File type and size', 'thingamablocks' );
		case 'title':
			return __( 'Title', 'thingamablocks' );
		case 'text':
			return __( 'Text', 'thingamablocks' );
		case 'cta':
			return __( 'Button link', 'thingamablocks' );
	}

	return '';
};

export const variations = layouts.map( ( layout ) => ( {
	...layout,
	innerBlocks: nameBlocks( layout.innerBlocks, blockName ),
} ) );
