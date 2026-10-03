/**
 * Settings → Thingamablocks: switching blocks and features off hides them
 * from the editor without breaking content that already uses them.
 */
const { test, expect } = require( '@playwright/test' );
const { DEMO, rest, newPost, openEditor, invalidBlocks } = require( './utils' );

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

	// Something for the Image masks count to find, whatever ran before.
	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();

		await rest( page, '/wp/v2/posts', {
			method: 'POST',
			data: {
				title: 'Settings: masked image',
				status: 'draft',
				content:
					'<!-- wp:generateblocks/media {"uniqueId":"ab34cd56","tagName":"img","styles":{"maskImage":"url(\\u0022data:image/svg+xml,%3Csvg%3E%3C/svg%3E\\u0022)"},"htmlAttributes":{"src":"https://example.com/x.png","alt":"x"}} --><img class="gb-media-ab34cd56" src="https://example.com/x.png" alt="x"/><!-- /wp:generateblocks/media -->',
			},
		} );
		await page.close();
	} );

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
			'Search',
			'Table of Contents',
			'Share',
			'Entrance animations',
			'Image masks',
			'FAQ schema',
		] ) {
			await expect(
				page.getByLabel( label, { exact: true } )
			).toBeChecked();
		}

		// The demo page uses the Toggle; beforeAll saved a masked image.
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

	test( 'switched off: gone from the inserter and panels', async ( {
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
			const { select, dispatch } = window.wp.data;
			const items = select( 'core/block-editor' )
				.getInserterItems()
				.map( ( item ) => item.name );
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
			};
		} );

		expect( editor ).toEqual( {
			dropdown: false,
			toggle: true,
			// Still registered, so existing dropdowns keep working.
			dropdownRegistered: true,
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
		// Still there and editable. (Whether WordPress lets a block that's out
		// of the inserter be duplicated depends on the editor, so it isn't
		// tested; the settings page says so.)
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

	test( 'the switches are switches, and switching one saves', async ( {
		page,
	} ) => {
		await page.goto( SETTINGS );
		await expect(
			page.getByRole( 'switch', { name: 'Search', exact: true } )
		).toBeChecked();

		await setSwitches( page, { Search: false } );
		await page.reload();
		await expect(
			page.getByRole( 'switch', { name: 'Search', exact: true } )
		).not.toBeChecked();

		await setSwitches( page, { Search: true } );
		await expect(
			page.getByRole( 'switch', { name: 'Search', exact: true } )
		).toBeChecked();
	} );

	test( 'saves through the WordPress settings form', async ( { page } ) => {
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
