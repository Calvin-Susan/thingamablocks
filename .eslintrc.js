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
			files: [
				'scripts/**/*.mjs',
				'webpack.config.js',
				'playwright.config.js',
				'.eslintrc.js',
			],
			env: { node: true, browser: false },
			rules: { 'no-console': 'off' },
		},
		{
			// Browser tests: Node, plus code that runs inside the page.
			files: [ 'tests/**/*.js' ],
			env: { node: true, browser: true },
			rules: {
				'jsdoc/no-undefined-types': 'off',
				'no-console': 'off',
				// Code passed to page.evaluate() runs in the page, not a React component.
				'@wordpress/no-global-active-element': 'off',
			},
		},
	],
};
