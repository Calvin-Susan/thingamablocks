/**
 * The colours to offer in the plugin's colour pickers.
 *
 * With GenerateBlocks Pro's Design Tokens, the same colours GenerateBlocks'
 * own pickers show: colour tokens whose "Applies to" includes the property,
 * grouped by their category, stored as var(--token) so they follow any later
 * change to the token. Otherwise, the theme's palette (GeneratePress global
 * colours, or a block theme's presets).
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * GB Pro's colour tokens for a CSS property, grouped by category.
 *
 * @param {string} property Camel-case CSS property, e.g. "backgroundColor".
 * @return {Array} Palette groups ([{ name, colors }]), or [] without tokens.
 */
export function tokenPalette( property ) {
	const tokens = window.gbDesignTokens?.tokens;

	if ( ! Array.isArray( tokens ) ) {
		return [];
	}

	const groups = new Map();

	tokens
		.filter(
			( token ) =>
				'color' === token?.type &&
				/^--[A-Za-z0-9_-]+$/.test( token.name || '' ) &&
				Array.isArray( token.scope ) &&
				token.scope.includes( property )
		)
		.forEach( ( token ) => {
			const group =
				token.category || __( 'Design tokens', 'thingamablocks' );

			if ( ! groups.has( group ) ) {
				groups.set( group, [] );
			}

			groups.get( group ).push( {
				name: token.label || token.name,
				slug: token.name.slice( 2 ),
				color: `var(${ token.name })`,
			} );
		} );

	return [ ...groups ].map( ( [ name, colors ] ) => ( { name, colors } ) );
}

/**
 * The palette for a colour picker: design tokens if there are any for the
 * property, otherwise the theme's palette.
 *
 * @param {string} property Camel-case CSS property the colour is used for.
 * @return {Array} Colours (flat) or palette groups.
 */
export function useColorPalette( property = 'backgroundColor' ) {
	const theme = useSelect( ( select ) => {
		const settings = select( blockEditorStore ).getSettings();
		const features = settings.__experimentalFeatures?.color?.palette;

		return features?.theme?.length ? features.theme : settings.colors;
	}, [] );

	return useMemo( () => {
		const groups = tokenPalette( property );

		return groups.length ? groups : theme || [];
	}, [ property, theme ] );
}
