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

import { variationIcons } from './icon';

const magnifier =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>';

/*
 * The look comes from GenerateBlocks Pro Global Styles the plugin creates
 * (includes/class-thingamablocks-global-styles.php): a base class for each
 * part, plus a modifier for the layout, e.g. tmb-search__field and
 * tmb-search__field--pill. Edit a class to restyle every search.
 */
const classes = ( name, modifier ) => {
	const base = `tmb-search__${ name }`;

	return modifier ? [ base, `${ base }--${ modifier }` ] : [ base ];
};

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

// Kept local, not a class: it fills the field in the editor (on the front end
// the block's own stylesheet sizes the real <input>), and the input already
// has the plugin's own tmb-search__input class.
const input = () =>
	part( 'input', 'generateblocks/text', {
		tagName: 'span',
		content: __( 'Search…', 'thingamablocks' ),
		styles: { flexGrow: '1' },
	} );

const wrapper = ( modifier, children ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		globalClasses: classes( 'wrapper', modifier ),
	},
	children,
];

const field = ( modifier, children ) =>
	part(
		'field',
		'generateblocks/element',
		{
			tagName: 'div',
			globalClasses: classes( 'field', modifier ),
		},
		children
	);

// A Text block set to <button>: with a label, or just the magnifier.
const button = ( name, label, modifier ) =>
	part( name, 'generateblocks/text', {
		tagName: 'button',
		content: label,
		...( label
			? {}
			: { icon: magnifier, iconOnly: true, iconLocation: 'before' } ),
		globalClasses: classes( 'button', modifier ),
	} );

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
			wrapper( 'bar', [
				field( 'bar', [ input() ] ),
				button( 'submit', __( 'Search', 'thingamablocks' ), 'bar' ),
			] ),
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
			field( 'pill', [ input(), button( 'submit', '', 'pill' ) ] ),
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
			field( 'underline', [
				input(),
				button( 'submit', '', 'underline' ),
			] ),
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
			wrapper( 'expand', [
				button( 'toggle', '', 'toggle' ),
				field( 'expand', [
					input(),
					button(
						'submit',
						__( 'Search', 'thingamablocks' ),
						'expand'
					),
				] ),
			] ),
		],
		scope: [ 'block' ],
	},
];
