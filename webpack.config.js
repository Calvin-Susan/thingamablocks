/**
 * The default @wordpress/scripts build, plus the entrance-animations,
 * image-mask and FAQ-schema scripts, which aren't blocks (they extend
 * GenerateBlocks blocks), so they have no block.json for the build to
 * discover.
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
		'mask/editor': './src/mask/editor.js',
		'faq/editor': './src/faq/editor.js',
	} ),
};
