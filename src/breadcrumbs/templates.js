/**
 * Starting layouts for the Breadcrumbs, offered as block variations.
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

import { nameBlocks, partOf } from '../shared/gb';
import { variationIcons } from './icon';

/*
 * The look comes from GenerateBlocks Pro Global Styles the plugin creates
 * (includes/class-thingamablocks-global-styles.php): a base class for each
 * part, plus a modifier for the Pills look, e.g. tmb-breadcrumbs__item and
 * tmb-breadcrumbs__item--pill. Edit a class to restyle every breadcrumb trail.
 */
const classes = ( name, modifier ) => {
	const base = `tmb-breadcrumbs__${ name }`;

	return modifier ? [ base, `${ base }--${ modifier }` ] : [ base ];
};

const part = ( name, tagName, content, globalClasses, htmlAttributes = {} ) => [
	'generateblocks/text',
	{
		tagName,
		content,
		htmlAttributes: { 'data-breadcrumb-part': name, ...htmlAttributes },
		globalClasses,
	},
];

const link = ( modifier ) =>
	part(
		'item',
		'a',
		__( 'Parent page', 'thingamablocks' ),
		classes( 'item', modifier ),
		{ href: '#' }
	);

// "divider", not "separator": the PHP renderer adds tmb-breadcrumbs__separator
// to every separator as a hook for the front-end script.
const separator = ( character ) =>
	part( 'separator', 'span', character, classes( 'divider' ) );

const current = ( modifier ) =>
	part(
		'current',
		'span',
		__( 'Current page', 'thingamablocks' ),
		classes( 'current', modifier )
	);

const layouts = [
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
		innerBlocks: [ link( 'pill' ), separator( '›' ), current( 'pill' ) ],
		scope: [ 'block' ],
	},
];

// Names shown in List View.
const blockName = ( attributes ) => {
	switch ( partOf( attributes, 'breadcrumbs' ) ) {
		case 'item':
			return __( 'Link (each page)', 'thingamablocks' );
		case 'divider':
			return __( 'Separator', 'thingamablocks' );
		case 'current':
			return __( 'Current page', 'thingamablocks' );
	}

	return '';
};

export const variations = layouts.map( ( layout ) => ( {
	...layout,
	innerBlocks: nameBlocks( layout.innerBlocks, blockName ),
} ) );
