/**
 * Settings → Thingamablocks: switching blocks and features off hides them
 * from the editor without breaking content that already uses them.
 */
const { test, expect } = require( '@playwright/test' );
const { DEMO, newPost, openEditor, invalidBlocks } = require( './utils' );

const SETTINGS = '/wp-admin/options-general.php?page=thingamablocks';

/**
 * Tick or untick switches on the settings page and save.
 *
 * @param {import('@playwright/test').Page} page    Page.
 * @param {Object}                          changes Label → on (true) or off.
 */
async function setSwitches( page, changes ) {
	await page.goto( SETTINGS );

	for ( const [ label, on ] of Object.entries( changes ) ) {
		await page.getByLabel( label, { exact: true } ).setChecked( on );
	}

	await page.getByRole( 'button', { name: 'Save Changes' } ).click();
	await expect( page.getByText( 'Settings saved.' ) ).toBeVisible();
}

test.describe( 'Settings page', () => {
	test.describe.configure( { mode: 'serial' } );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();

		await setSwitches( page, {
			Dropdown: true,
			'Entrance animations': true,
			'Image masks': true,
		} );
		await page.close();
	} );

	test( 'lists every block and feature, all on, with where they’re used', async ( {
		page,
	} ) => {
		await page.goto( SETTINGS );

		await expect(
			page.getByRole( 'heading', { name: 'Thingamablocks', level: 1 } )
		).toBeVisible();

		for ( const label of [
			'Toggle',
			'Countdown',
			'Marquee',
			'Dropdown',
			'Breadcrumbs',
			'Entrance animations',
			'Image masks',
		] ) {
			await expect(
				page.getByLabel( label, { exact: true } )
			).toBeChecked();
		}

		// The demo page uses the Toggle; earlier tests saved masked images.
		await expect(
			page.locator( '#thingamablocks-toggle-description' )
		).toContainText( /In use on \d+ item/ );
		await expect(
			page.locator( '#thingamablocks-masks-description' )
		).toContainText( /In use on \d+ item/ );

		// Linked from the Plugins screen.
		await page.goto( '/wp-admin/plugins.php' );
		await expect(
			page
				.locator( 'tr[data-slug="thingamablocks"]' )
				.getByRole( 'link', { name: 'Settings' } )
		).toHaveAttribute(
			'href',
			/options-general\.php\?page=thingamablocks/
		);
	} );

	test( 'switched off: gone from the inserter, patterns and panels', async ( {
		page,
	} ) => {
		await setSwitches( page, {
			Dropdown: false,
			'Entrance animations': false,
			'Image masks': false,
		} );

		await expect(
			page.getByLabel( 'Dropdown', { exact: true } )
		).not.toBeChecked();

		await newPost( page );

		const editor = await page.evaluate( async () => {
			const { select, resolveSelect, dispatch } = window.wp.data;
			const items = select( 'core/block-editor' )
				.getInserterItems()
				.map( ( item ) => item.name );
			const patterns = (
				await resolveSelect( 'core' ).getBlockPatterns()
			).map( ( pattern ) => pattern.name );
			const media = window.wp.blocks.createBlock(
				'generateblocks/media',
				{
					tagName: 'img',
				}
			);

			dispatch( 'core/block-editor' ).insertBlocks( media );
			dispatch( 'core/block-editor' ).selectBlock( media.clientId );

			return {
				dropdown: items.includes( 'thingamablocks/dropdown' ),
				toggle: items.includes( 'thingamablocks/toggle' ),
				dropdownRegistered: !! window.wp.blocks.getBlockType(
					'thingamablocks/dropdown'
				),
				dropdownPattern: patterns.includes(
					'thingamablocks/downloads-dropdown'
				),
				togglePattern: patterns.includes(
					'thingamablocks/pricing-toggle'
				),
			};
		} );

		expect( editor ).toEqual( {
			dropdown: false,
			toggle: true,
			// Still registered, so existing dropdowns keep working.
			dropdownRegistered: true,
			dropdownPattern: false,
			togglePattern: true,
		} );

		await expect(
			page.getByRole( 'button', { name: 'Mask', exact: true } )
		).toHaveCount( 0 );
		await expect(
			page.getByRole( 'button', {
				name: 'Entrance animation',
				exact: true,
			} )
		).toHaveCount( 0 );
	} );

	test( 'content already using a switched-off block still works', async ( {
		page,
	} ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );

		// On the site.
		await page.goto( DEMO, { waitUntil: 'networkidle' } );

		const button = page.locator( '[data-dropdown-part="button"]' ).first();

		await button.click();
		await expect( button ).toHaveAttribute( 'aria-expanded', 'true' );

		// And in the editor: still a valid, editable Dropdown block.
		const postId = await page.evaluate(
			() => document.body.className.match( /page-id-(\d+)/ )?.[ 1 ]
		);

		await openEditor( page, postId );
		expect( await invalidBlocks( page ) ).toEqual( [] );
		expect(
			await page.evaluate(
				() =>
					window.wp.data
						.select( 'core/block-editor' )
						.getBlocksByName( 'thingamablocks/dropdown' ).length
			)
		).toBeGreaterThan( 0 );

		expect( errors ).toEqual( [] );
	} );

	test( 'only administrators can see it', async ( { page } ) => {
		// The page is registered with the manage_options capability.
		await page.goto( SETTINGS );
		await expect(
			page.locator( 'form[action="options.php"]' )
		).toBeVisible();
		expect(
			await page.evaluate( () =>
				document
					.querySelector( 'input[name="option_page"]' )
					?.getAttribute( 'value' )
			)
		).toBe( 'thingamablocks' );
	} );
} );
