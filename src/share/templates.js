/**
 * Starting layouts for the Share block, offered as block variations.
 *
 * Everything is a real GenerateBlocks block: a row holding a label and a
 * list, and in the list one item per network, each with a share button (a
 * Text block, <a> for networks, <button> for Copy link and Share…) marked
 *   data-share-network="x|linkedin|…|copy|native"
 * with the network's icon as its GB icon. Add, remove and reorder networks
 * as blocks; change an icon in GB's icon picker.
 *   data-share-part="label"  names the list for screen readers
 *   data-share-part="list"   the list of buttons
 */
import { __ } from '@wordpress/i18n';

import { nameBlocks } from '../shared/gb';
import { variationIcons } from './icon';
import { iconFor, networkFor, BRANDS } from './networks';

/*
 * The look comes from GenerateBlocks Pro Global Styles the plugin creates
 * (includes/class-thingamablocks-global-styles.php): tmb-share__row, __label,
 * __list, __item, __button, plus __button--pill for icon and name, and
 * __button--linkedin… for brand-coloured icons.
 */

/**
 * A share button's attributes for a network.
 *
 * @param {string}  key           Network key.
 * @param {Object}  options       Options.
 * @param {boolean} options.pill  Icon and name (otherwise icon only).
 * @param {boolean} options.brand Brand-coloured icon.
 * @return {Object} GB Text attributes.
 */
export const buttonAttributes = (
	key,
	{ pill = false, brand = false } = {}
) => {
	const network = networkFor( key );
	const isLink = 'link' === network.type;
	const classes = [ 'tmb-share__button' ];

	if ( pill ) {
		classes.push( 'tmb-share__button--pill' );
	}

	if ( brand && BRANDS.includes( key ) ) {
		classes.push( `tmb-share__button--${ key }` );
	}

	return {
		tagName: isLink ? 'a' : 'button',
		content: pill ? network.label : '',
		icon: iconFor( key ),
		iconOnly: ! pill,
		htmlAttributes: {
			'data-share-network': key,
			...( isLink ? { href: '#' } : {} ),
		},
		globalClasses: classes,
	};
};

// Each item is named after its network in List View ("LinkedIn > Button").
const item = ( key, options ) => [
	'generateblocks/element',
	{
		tagName: 'li',
		globalClasses: [ 'tmb-share__item' ],
		metadata: { name: networkFor( key ).label },
	},
	[ [ 'generateblocks/text', buttonAttributes( key, options ) ] ],
];

const DEFAULT_NETWORKS = [ 'x', 'linkedin', 'facebook', 'email', 'copy' ];

const row = ( options ) => [
	'generateblocks/element',
	{ tagName: 'div', globalClasses: [ 'tmb-share__row' ] },
	[
		[
			'generateblocks/text',
			{
				tagName: 'p',
				content: __( 'Share:', 'thingamablocks' ),
				htmlAttributes: { 'data-share-part': 'label' },
				globalClasses: [ 'tmb-share__label' ],
			},
		],
		[
			'generateblocks/element',
			{
				tagName: 'ul',
				htmlAttributes: { 'data-share-part': 'list' },
				globalClasses: [ 'tmb-share__list' ],
			},
			DEFAULT_NETWORKS.map( ( key ) => item( key, options ) ),
		],
	],
];

/**
 * The name List View shows for a block in the layout.
 *
 * @param {Object} attributes Block attributes.
 * @return {string} Name, or ''.
 */
export const blockName = ( attributes ) => {
	const classes = attributes.globalClasses || [];
	const html = attributes.htmlAttributes || {};

	if ( html[ 'data-share-network' ] ) {
		return __( 'Button', 'thingamablocks' );
	}

	if ( 'label' === html[ 'data-share-part' ] ) {
		return __( 'Label', 'thingamablocks' );
	}

	if ( 'list' === html[ 'data-share-part' ] ) {
		return __( 'Buttons', 'thingamablocks' );
	}

	if ( classes.includes( 'tmb-share__row' ) ) {
		return __( 'Row', 'thingamablocks' );
	}

	// Items keep their network's name.
	return '';
};

const layouts = [
	{
		name: 'icons',
		title: __( 'Icons', 'thingamablocks' ),
		description: __(
			'A row of round icon buttons in your text colour.',
			'thingamablocks'
		),
		icon: variationIcons.icons,
		isDefault: true,
		innerBlocks: [ row( {} ) ],
		scope: [ 'block' ],
	},
	{
		name: 'pills',
		title: __( 'Pills', 'thingamablocks' ),
		description: __(
			'Rounded buttons with each network’s icon and name.',
			'thingamablocks'
		),
		icon: variationIcons.pills,
		innerBlocks: [ row( { pill: true } ) ],
		scope: [ 'block' ],
	},
	{
		name: 'brand',
		title: __( 'Brand icons', 'thingamablocks' ),
		description: __(
			'Round icon buttons with each network’s brand colour on the icon.',
			'thingamablocks'
		),
		icon: variationIcons.brand,
		innerBlocks: [ row( { brand: true } ) ],
		scope: [ 'block' ],
	},
];

export const variations = layouts.map( ( layout ) => ( {
	...layout,
	innerBlocks: nameBlocks( layout.innerBlocks, blockName ),
} ) );
