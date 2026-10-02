/**
 * Settings → Thingamablocks → Speeds: what Fast / Normal / Slow mean, site-wide.
 */
const { test, expect } = require( '@playwright/test' );
const { DEMO, testPage } = require( './utils' );

const SETTINGS = '/wp-admin/options-general.php?page=thingamablocks';

/**
 * Fill the speed fields (label → value, '' for the default) and save.
 *
 * @param {import('@playwright/test').Page} page   Page.
 * @param {Object}                          values Field id suffix → value.
 */
async function setSpeeds( page, values ) {
	await page.goto( SETTINGS );

	for ( const [ field, value ] of Object.entries( values ) ) {
		await page.locator( `#thingamablocks-speeds-${ field }` ).fill( value );
	}

	await page.getByRole( 'button', { name: 'Save Changes' } ).click();
	await expect( page.getByText( 'Settings saved.' ) ).toBeVisible();
}

const ALL_DEFAULT = {
	'dropdown-fast': '',
	'dropdown-normal': '',
	'dropdown-slow': '',
	'animations-fast': '',
	'animations-normal': '',
	'animations-slow': '',
};

test.describe( 'Speeds', () => {
	test.describe.configure( { mode: 'serial' } );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();
		await setSpeeds( page, ALL_DEFAULT );
		await page.close();
	} );

	test( 'the settings show the defaults and keep only changed, sensible values', async ( {
		page,
	} ) => {
		await setSpeeds( page, ALL_DEFAULT );

		const placeholders = await page
			.locator( '.tmb-speeds input' )
			.evaluateAll( ( inputs ) =>
				inputs.map( ( input ) => input.placeholder )
			);
		expect( placeholders ).toEqual( [
			'150',
			'250',
			'400',
			'400',
			'700',
			'1100',
		] );

		// Fields are labelled for screen readers ("Fast (milliseconds)") and grouped.
		await expect(
			page
				.getByRole( 'group', { name: 'Dropdown speed' } )
				.getByLabel( /Normal/ )
		).toBeVisible();

		// 600 and 2500 changed; "150" is the default so isn't stored. (The fields only allow 0–3000; the server clamps too.)
		await setSpeeds( page, {
			...ALL_DEFAULT,
			'dropdown-fast': '150',
			'dropdown-normal': '600',
			'animations-fast': '2500',
		} );

		await expect(
			page.locator( '#thingamablocks-speeds-dropdown-fast' )
		).toHaveValue( '' );
		await expect(
			page.locator( '#thingamablocks-speeds-dropdown-normal' )
		).toHaveValue( '600' );
		await expect(
			page.locator( '#thingamablocks-speeds-animations-fast' )
		).toHaveValue( '2500' );
	} );

	test( 'a dropdown opens at the site’s Normal speed', async ( { page } ) => {
		await page.goto( DEMO );

		expect( await page.evaluate( () => window.tmbSpeeds ) ).toEqual( {
			dropdown: { normal: 600 },
			animations: { fast: 2500 },
		} );

		const button = page.locator( '[data-dropdown-part="button"]' ).first();
		await button.scrollIntoViewIfNeeded();
		await button.click();

		const durations = await page
			.locator( '[data-dropdown-part="drawer"]' )
			.first()
			.evaluate( ( drawer ) =>
				drawer
					.getAnimations()
					.map(
						( animation ) => animation.effect.getTiming().duration
					)
			);
		expect( durations ).toContain( 600 );
	} );

	test( 'pages without dropdowns or animations get nothing', async ( {
		page,
	} ) => {
		const plain = await testPage(
			page,
			'tmb-test-speeds-plain',
			'<!-- wp:paragraph --><p>Just a paragraph.</p><!-- /wp:paragraph -->'
		);
		await page.goto( plain );

		expect( await page.evaluate( () => window.tmbSpeeds ) ).toBeUndefined();
	} );

	test( 'the editor previews and help text use the site’s speeds', async ( {
		page,
	} ) => {
		await page.goto( '/wp-admin/post-new.php' );
		await page.waitForFunction(
			() => window.wp?.blocks?.getBlockType( 'thingamablocks/dropdown' ),
			null,
			{ timeout: 60_000 }
		);

		expect( await page.evaluate( () => window.tmbSpeeds ) ).toEqual( {
			dropdown: { normal: 600 },
			animations: { fast: 2500 },
		} );
	} );

	test( 'with nothing changed, nothing is printed', async ( { page } ) => {
		await setSpeeds( page, ALL_DEFAULT );
		await page.goto( DEMO );

		expect( await page.evaluate( () => window.tmbSpeeds ) ).toBeUndefined();
	} );
} );
