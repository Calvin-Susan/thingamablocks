/**
 * ESLint: the WordPress rules (via wp-scripts), plus browser globals for the
 * front-end scripts and Node for the build scripts.
 */
module.exports = {
	root: true,
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	env: { browser: true },
	rules: {
		'jsdoc/no-undefined-types': [
			'error',
			{ definedTypes: [ 'ParentNode', 'IntersectionObserverEntry' ] },
		],
	},
	overrides: [
		{
			files: [ 'scripts/**/*.mjs', 'webpack.config.js', '.eslintrc.js' ],
			env: { node: true, browser: false },
			rules: { 'no-console': 'off' },
		},
	],
};
