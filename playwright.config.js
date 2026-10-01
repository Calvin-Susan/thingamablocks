/**
 * Browser tests (npm run test:e2e).
 *
 * They run against the local WordPress Playground site (npm run playground):
 * free GenerateBlocks + GeneratePress and a "Thingamablocks demo" page built
 * from the patterns. If the site isn't running, Playwright starts it.
 *
 * Locally the tests use your installed Google Chrome; in CI, Playwright's own
 * Chromium (npx playwright install chromium).
 */
const { existsSync } = require( 'node:fs' );
const { defineConfig } = require( '@playwright/test' );

const SYSTEM_CHROME =
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const useSystemChrome = ! process.env.CI && existsSync( SYSTEM_CHROME );

module.exports = defineConfig( {
	testDir: './tests/e2e',
	// One WordPress site is shared by every test, so run them one at a time.
	workers: 1,
	fullyParallel: false,
	timeout: 90_000,
	expect: { timeout: 10_000 },
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [ [ 'github' ], [ 'list' ] ] : 'list',
	use: {
		baseURL: 'http://127.0.0.1:9400',
		trace: 'retain-on-failure',
		launchOptions: useSystemChrome ? { executablePath: SYSTEM_CHROME } : {},
	},
	webServer: {
		command:
			'npx wp-playground-cli start --no-auto-mount --mount=./:/wordpress/wp-content/plugins/thingamablocks --blueprint=playground/blueprint.json --port=9400 --skip-browser',
		// A port check: every page answers with Playground's auto-login redirect first.
		port: 9400,
		reuseExistingServer: ! process.env.CI,
		timeout: 300_000,
		stdout: 'ignore',
		stderr: 'pipe',
	},
} );
