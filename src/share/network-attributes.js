/**
 * Turning a GB Text block into a share button for a network, used by the
 * "Share button" panel and the block's "Add a network" buttons.
 */
import { iconFor, networkFor, BRANDS, PATHS } from './networks';

const BRAND_CLASSES = BRANDS.map( ( key ) => `tmb-share__button--${ key }` );

/**
 * Which network's default icon an icon is, if it's one of ours.
 *
 * @param {string} icon SVG markup.
 * @return {string|undefined} Network key.
 */
export const defaultIconOf = ( icon = '' ) =>
	Object.keys( PATHS ).find( ( key ) =>
		String( icon ).includes( `d="${ PATHS[ key ] }"` )
	);

/**
 * Whether a block uses brand-coloured icons.
 *
 * @param {Object} attributes Block attributes.
 * @return {boolean} Brand.
 */
export const hasBrandClass = ( attributes ) =>
	( attributes.globalClasses || [] ).some( ( name ) =>
		BRAND_CLASSES.includes( name )
	);

/**
 * The attributes that make a share button for a network. The icon changes
 * only while it's a default one (an icon of your own stays); a name that
 * was the old network's becomes the new one's.
 *
 * @param {Object}  attributes Current attributes.
 * @param {string}  key        Network key.
 * @param {boolean} brand      Give it the network's brand class.
 * @return {Object} Attributes to set.
 */
export function withNetwork( attributes, key, brand ) {
	const network = networkFor( key );
	const html = { ...( attributes.htmlAttributes || {} ) };
	const previous = networkFor( html[ 'data-share-network' ] );
	const isLink = 'link' === network.type;
	const text = String( attributes.content ?? '' );

	delete html[ 'data-share-part' ];
	// A name for the old network would be wrong; icon-only buttons get one
	// for the new network on the site.
	delete html[ 'aria-label' ];
	html[ 'data-share-network' ] = key;

	if ( isLink ) {
		html.href = html.href || '#';
	} else {
		delete html.href;
		delete html.target;
		delete html.rel;
	}

	const classes = ( attributes.globalClasses || [] ).filter(
		( name ) => ! BRAND_CLASSES.includes( name )
	);

	if ( brand && BRANDS.includes( key ) ) {
		classes.push( `tmb-share__button--${ key }` );
	}

	return {
		tagName: isLink ? 'a' : 'button',
		htmlAttributes: html,
		icon:
			! attributes.icon || defaultIconOf( attributes.icon )
				? iconFor( key )
				: attributes.icon,
		content: previous && text === previous.label ? network.label : text,
		globalClasses: classes,
	};
}
