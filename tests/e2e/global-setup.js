/**
 * Wait until the Playground site is fully set up before any test runs.
 *
 * The server's port opens before the blueprint has finished (installing
 * GenerateBlocks and GeneratePress, building the demo page), so on a fresh
 * site the first tests could otherwise see a missing demo page.
 */
const { chromium } = require( '@playwright/test' );
const config = require( '../../playwright.config' );

module.exports = async () => {
	const browser = await chromium.launch( config.use.launchOptions );
	const page = await browser.newPage( { baseURL: config.use.baseURL } );
	const deadline = Date.now() + 300_000;

	try {
		while ( Date.now() < deadline ) {
			const response = await page
				.goto( '/thingamablocks-demo/' )
				.catch( () => null );

			if (
				response?.ok() &&
				( await page.locator( '.tmb-marquee' ).count() )
			) {
				return;
			}

			await page.waitForTimeout( 2000 );
		}

		throw new Error(
			'The Playground site never finished setting up (no demo page after 5 minutes).'
		);
	} finally {
		await browser.close();
	}
};
