/**
 * The default @wordpress/scripts build, plus the entrance-animations scripts,
 * which aren't blocks (they extend every GenerateBlocks block), so they have
 * no block.json for the build to discover.
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	entry: () => ( {
		...( 'function' === typeof defaultConfig.entry
			? defaultConfig.entry()
			: defaultConfig.entry ),
		'animations/editor': './src/animations/editor.js',
		'animations/view': './src/animations/view.js',
	} ),
};
