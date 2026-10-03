/**
 * Starting layouts for the Table of Contents, offered as block variations.
 *
 * Everything visible is a real GenerateBlocks block. The list, its item and
 * the item's link are templates: on the site the item is repeated for every
 * heading, and headings under it get a nested copy of the list.
 *   data-toc-part="list"  the list (an Element, <ul> or <ol>)
 *   data-toc-part="item"  each entry (an Element, <li>)
 *   data-toc-part="link"  the heading's link (a Text block, <a>)
 *   data-toc-part="title" the title; below the "Collapse below" width it
 *                         becomes the button that opens the list
 *   data-toc-part="chevron" the toggle button's icon (a Shape), only shown
 *                         while collapsed
 *   data-toc-part="copy"  the copy-link icon (a Shape), added by the
 *                         "Copy-link buttons" setting
 * Anything else is shown as it is.
 *
 * The link's tmb-toc__link--current class styles the section being read
 * (&[aria-current]); remove it from the link for no highlight.
 */
import { __ } from '@wordpress/i18n';

import { nameBlocks } from '../shared/gb';
import { variationIcons } from './icon';

/*
 * The look comes from GenerateBlocks Pro Global Styles the plugin creates
 * (includes/class-thingamablocks-global-styles.php): a base class for each
 * part, plus a modifier for the layout, e.g. tmb-toc__link and
 * tmb-toc__link--line. Edit a class to restyle every table of contents.
 */
const classes = ( part, modifier ) => {
	const base = `tmb-toc__${ part }`;

	return modifier ? [ base, `${ base }--${ modifier }` ] : [ base ];
};

const title = [
	'generateblocks/text',
	{
		tagName: 'p',
		content: __( 'On this page', 'thingamablocks' ),
		htmlAttributes: { 'data-toc-part': 'title' },
		globalClasses: classes( 'title' ),
	},
];

const chevron = [
	'generateblocks/shape',
	{
		html: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>',
		htmlAttributes: { 'data-toc-part': 'chevron' },
		globalClasses: classes( 'chevron' ),
	},
];

const list = ( modifier ) => [
	'generateblocks/element',
	{
		tagName: 'ul',
		htmlAttributes: { 'data-toc-part': 'list' },
		globalClasses: classes( 'list', modifier ),
	},
	[
		[
			'generateblocks/element',
			{
				tagName: 'li',
				htmlAttributes: { 'data-toc-part': 'item' },
				globalClasses: classes( 'item' ),
			},
			[
				[
					'generateblocks/text',
					{
						tagName: 'a',
						content: __( 'Heading', 'thingamablocks' ),
						htmlAttributes: { 'data-toc-part': 'link', href: '#' },
						globalClasses: [
							...classes( 'link', modifier ),
							'tmb-toc__link--current',
						],
					},
				],
			],
		],
	],
];

const linkIcon =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';

// Names shown in List View.
const blockName = ( attributes ) => {
	switch ( attributes.htmlAttributes?.[ 'data-toc-part' ] ) {
		case 'list':
			return __( 'List', 'thingamablocks' );
		case 'item':
			return __( 'Item (each heading)', 'thingamablocks' );
		case 'link':
			return __( 'Link', 'thingamablocks' );
		case 'copy':
			return __( 'Copy-link icon', 'thingamablocks' );
		case 'title':
			return __( 'Title', 'thingamablocks' );
		case 'chevron':
			return __( 'Toggle icon (small screens)', 'thingamablocks' );
	}

	return '';
};

/**
 * The copy-link icon, added when "Copy-link buttons" is switched on.
 */
export const copyIcon = nameBlocks(
	[
		[
			'generateblocks/shape',
			{
				html: linkIcon,
				htmlAttributes: { 'data-toc-part': 'copy' },
				globalClasses: classes( 'copy-icon' ),
			},
		],
	],
	blockName
)[ 0 ];

const layouts = [
	{
		name: 'list',
		title: __( 'List', 'thingamablocks' ),
		description: __(
			'A title and a plain list of headings, sub-headings indented.',
			'thingamablocks'
		),
		icon: variationIcons.list,
		isDefault: true,
		attributes: { collapseBelow: 768 },
		innerBlocks: [ title, chevron, list() ],
		scope: [ 'block' ],
	},
	{
		name: 'line',
		title: __( 'Sidebar line', 'thingamablocks' ),
		description: __(
			'A line down the side that marks the section being read. Made for a sticky sidebar.',
			'thingamablocks'
		),
		icon: variationIcons.line,
		attributes: { collapseBelow: 768 },
		innerBlocks: [ title, chevron, list( 'line' ) ],
		scope: [ 'block' ],
	},
];

export const variations = layouts.map( ( layout ) => ( {
	...layout,
	innerBlocks: nameBlocks( layout.innerBlocks, blockName ),
} ) );
