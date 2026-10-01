/**
 * The Dropdown block: a disclosure button with a drawer.
 */
const { readFileSync } = require( 'node:fs' );
const { test, expect } = require( '@playwright/test' );
const { testPage, newPost, pluginAssets, invalidBlocks } = require( './utils' );

const AXE = readFileSync( require.resolve( 'axe-core/axe.min.js' ), 'utf8' );

/**
 * Block markup for a Dropdown layout, made by the editor itself so it's
 * exactly what GenerateBlocks saves.
 *
 * @param {import('@playwright/test').Page} page       Page (opens the editor).
 * @param {string}                          variation  Layout name.
 * @param {Object}                          attributes Dropdown attributes.
 * @return {Promise<string>} Markup.
 */
async function dropdownMarkup( page, variation, attributes = {} ) {
	await newPost( page );

	// Insert it so GenerateBlocks compiles each block's CSS (it does that in
	// the editor), then serialize what it would save.
	const clientId = await page.evaluate(
		( [ name, extra ] ) => {
			const {
				createBlock,
				getBlockVariations,
				createBlocksFromInnerBlocksTemplate,
			} = window.wp.blocks;
			const layout = getBlockVariations(
				'thingamablocks/dropdown',
				'block'
			).find( ( item ) => item.name === name );
			const block = createBlock(
				'thingamablocks/dropdown',
				{ ...layout.attributes, ...extra },
				createBlocksFromInnerBlocksTemplate( layout.innerBlocks )
			);

			window.wp.data
				.dispatch( 'core/block-editor' )
				.insertBlocks( block );

			return block.clientId;
		},
		[ variation, attributes ]
	);

	await page.waitForFunction( ( id ) => {
		const { getBlock } = window.wp.data.select( 'core/block-editor' );
		const all = [];
		const walk = ( block ) => {
			all.push( block );
			block.innerBlocks.forEach( walk );
		};

		walk( getBlock( id ) );

		return all
			.filter( ( block ) => block.name.startsWith( 'generateblocks/' ) )
			.every( ( block ) => block.attributes.css );
	}, clientId );

	return page.evaluate(
		( id ) =>
			window.wp.blocks.serialize( [
				window.wp.data.select( 'core/block-editor' ).getBlock( id ),
			] ),
		clientId
	);
}

/**
 * Wait until no drawer is animating (rather than a fixed delay).
 *
 * @param {import('@playwright/test').Page} page Page.
 */
async function settled( page ) {
	await expect
		.poll( () =>
			page.evaluate(
				() =>
					[
						...document.querySelectorAll(
							'[data-dropdown-part="drawer"]'
						),
					].filter( ( drawer ) => drawer.getAnimations().length )
						.length
			)
		)
		.toBe( 0 );
}

const paragraph = ( text ) =>
	`<!-- wp:paragraph --><p>${ text }</p><!-- /wp:paragraph -->`;

test.describe( 'Dropdown', () => {
	let url;

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();
		const downloads = await dropdownMarkup( page, 'downloads' );
		const links = await dropdownMarkup( page, 'links', {
			anchor: 'second-dropdown',
		} );

		url = await testPage(
			page,
			'tmb-test-dropdown',
			paragraph( 'Before' ) +
				downloads +
				paragraph( 'Between' ) +
				links +
				paragraph( 'After' )
		);
		await page.close();
	} );

	const first = ( page ) => ( {
		wrapper: page.locator( '.tmb-dropdown' ).first(),
		button: page.locator( '[data-dropdown-part="button"]' ).first(),
		drawer: page.locator( '[data-dropdown-part="drawer"]' ).first(),
	} );

	test( 'markup is right before the script runs; loads only its own files', async ( {
		page,
	} ) => {
		const { files } = await pluginAssets( page, url );

		expect( files ).toContainEqual(
			expect.stringMatching( 'build/dropdown/view.js' )
		);
		expect(
			files.filter( ( file ) =>
				/\/(index|editor)\.(js|css)$/.test( file )
			)
		).toEqual( [] );

		// Now without the script.
		await page.route( /dropdown\/view\.js/, ( route ) => route.abort() );
		await page.reload( { waitUntil: 'networkidle' } );

		const { button, drawer } = first( page );
		const id = await drawer.getAttribute( 'id' );

		await expect( drawer ).toBeHidden();
		await expect( button ).toHaveAttribute( 'type', 'button' );
		await expect( button ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( button ).toHaveAttribute( 'aria-controls', id );
		expect( await drawer.evaluate( ( element ) => element.tagName ) ).toBe(
			'UL'
		);
	} );

	test.describe( 'without JavaScript', () => {
		test.use( { javaScriptEnabled: false } );

		test( 'every drawer is shown, so nothing is out of reach', async ( {
			page,
		} ) => {
			await page.goto( url );
			await expect( first( page ).drawer ).toBeVisible();
			await expect(
				first( page ).drawer.getByRole( 'link' ).first()
			).toBeVisible();
		} );
	} );

	test( 'opens below the button, as wide as it, and turns the chevron', async ( {
		page,
	} ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );
		await page.setViewportSize( { width: 1280, height: 1200 } );
		await page.goto( url, { waitUntil: 'networkidle' } );

		const { wrapper, button, drawer } = first( page );

		await button.click();
		await expect( button ).toHaveAttribute( 'aria-expanded', 'true' );
		await expect( drawer ).toBeVisible();
		await expect( wrapper ).toHaveAttribute( 'data-placement', 'bottom' );

		// Let the reveal finish before measuring.
		await settled( page );
		const [ b, d ] = [
			await button.boundingBox(),
			await drawer.boundingBox(),
		];

		expect( Math.abs( d.x - b.x ) ).toBeLessThan( 1 );
		expect( Math.abs( d.width - b.width ) ).toBeLessThan( 1 );
		expect( d.y ).toBeGreaterThan( b.y + b.height );

		const rotated = await button
			.locator( '.gb-shape svg' )
			.evaluate( ( svg ) => getComputedStyle( svg ).transform );
		expect( rotated ).not.toBe( 'none' );

		expect( errors ).toEqual( [] );
	} );

	test( 'closes with Escape, a click outside, Tab away, and after an item is used', async ( {
		page,
	} ) => {
		await page.setViewportSize( { width: 1280, height: 1200 } );
		await page.goto( url, { waitUntil: 'networkidle' } );

		const { button, drawer } = first( page );

		// Escape: closes and puts focus back on the button.
		await button.click();
		await drawer.getByRole( 'link' ).first().focus();
		await page.keyboard.press( 'Escape' );
		await expect( button ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( button ).toBeFocused();
		await expect( drawer ).toBeHidden();

		// Click outside.
		await button.click();
		await page.locator( 'p', { hasText: 'After' } ).click();
		await expect( drawer ).toBeHidden();

		// Down arrow opens it and moves to the first item; Tab past the last closes it.
		await button.focus();
		await page.keyboard.press( 'ArrowDown' );
		await expect( drawer.getByRole( 'link' ).first() ).toBeFocused();
		await drawer.getByRole( 'link' ).last().focus();
		await page.keyboard.press( 'Tab' );
		await expect( button ).toHaveAttribute( 'aria-expanded', 'false' );

		// Using an item closes it and returns focus to the button.
		await button.click();
		await drawer.getByRole( 'link' ).first().click();
		await expect( drawer ).toBeHidden();
		await expect( button ).toBeFocused();
	} );

	test( 'only one dropdown is open at a time', async ( { page } ) => {
		await page.setViewportSize( { width: 1280, height: 1200 } );
		await page.goto( url, { waitUntil: 'networkidle' } );

		const buttons = page.locator( '[data-dropdown-part="button"]' );

		// The first drawer covers the second button (as on any page), so open
		// the second the way a keyboard user would.
		await buttons.nth( 0 ).click();
		await buttons.nth( 1 ).focus();
		await page.keyboard.press( 'Enter' );
		await expect( buttons.nth( 0 ) ).toHaveAttribute(
			'aria-expanded',
			'false'
		);
		await expect( buttons.nth( 1 ) ).toHaveAttribute(
			'aria-expanded',
			'true'
		);

		// The JavaScript API, by HTML anchor.
		await page.evaluate( () =>
			window.tmbDropdown.close( 'second-dropdown' )
		);
		await expect( buttons.nth( 1 ) ).toHaveAttribute(
			'aria-expanded',
			'false'
		);
	} );

	test( 'flips above the button when there isn’t room below', async ( {
		page,
	} ) => {
		await page.setViewportSize( { width: 1280, height: 800 } );
		await page.goto( url, { waitUntil: 'networkidle' } );

		const { wrapper, button, drawer } = first( page );

		// Make the window end just below the button (the page is too short
		// to scroll it there).
		const bottom = await button.evaluate(
			( element ) => element.getBoundingClientRect().bottom
		);
		await page.setViewportSize( {
			width: 1280,
			height: Math.ceil( bottom ) + 20,
		} );
		await button.click();
		await expect( wrapper ).toHaveAttribute( 'data-placement', 'top' );
		await settled( page );

		const [ b, d ] = [
			await button.boundingBox(),
			await drawer.boundingBox(),
		];
		expect( d.y + d.height ).toBeLessThan( b.y );
	} );

	test( 'stays on screen on a narrow window', async ( { page } ) => {
		const wide = await dropdownMarkup( page, 'panel', { align: 'end' } );
		const panelUrl = await testPage(
			page,
			'tmb-test-dropdown-panel',
			wide
		);

		await page.setViewportSize( { width: 360, height: 800 } );
		await page.goto( panelUrl, { waitUntil: 'networkidle' } );

		const { button, drawer } = first( page );

		await button.click();
		await settled( page );

		const box = await drawer.boundingBox();
		const viewport = await page.evaluate(
			() => document.documentElement.clientWidth
		);

		expect( box.x ).toBeGreaterThanOrEqual( 7 );
		expect( box.x + box.width ).toBeLessThanOrEqual( viewport - 7 );
	} );

	test.describe( 'with reduced motion', () => {
		test.use( { reducedMotion: 'reduce' } );

		test( 'opens without animating', async ( { page } ) => {
			await page.goto( url, { waitUntil: 'networkidle' } );

			const { button, drawer } = first( page );

			await button.click();
			expect(
				await drawer.evaluate(
					( element ) => element.getAnimations().length
				)
			).toBe( 0 );
			await expect( drawer ).toBeVisible();
		} );
	} );

	test( 'forged settings are harmless', async ( { page } ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );
		await page.goto( url, { waitUntil: 'networkidle' } );

		await page.evaluate( () => {
			const element = document.createElement( 'div' );
			element.className = 'tmb-dropdown';
			element.dataset.tmbDropdown = JSON.stringify( {
				animation: '__proto__',
				speed: 'constructor',
				align: 'toString',
			} );
			element.innerHTML =
				'<button data-dropdown-part="button" aria-expanded="false">x</button><div data-dropdown-part="drawer" style="display:none">y</div>';
			document.body.append( element );
			window.tmbDropdown.init();
			element.querySelector( 'button' ).click();
		} );

		await page.waitForTimeout( 300 );
		expect( errors ).toEqual( [] );
	} );

	test( 'no WCAG violations, open or closed', async ( { page } ) => {
		await page.goto( url, { waitUntil: 'networkidle' } );
		await page.addScriptTag( { content: AXE } );

		const scan = () =>
			page.evaluate( async () => {
				const result = await window.axe.run( '.entry-content', {
					runOnly: [
						'wcag2a',
						'wcag2aa',
						'wcag21a',
						'wcag21aa',
						'wcag22aa',
						'best-practice',
					],
				} );

				return result.violations.map(
					( violation ) =>
						`${ violation.id }: ${ violation.nodes
							.map( ( node ) => node.target.join( ' ' ) )
							.join( ', ' ) }`
				);
			} );

		expect( await scan() ).toEqual( [] );

		await first( page ).button.click();
		await settled( page );
		expect( await scan() ).toEqual( [] );
	} );

	test( 'editor: valid blocks; the drawer shows only while selected', async ( {
		page,
	} ) => {
		await newPost( page );

		const clientId = await page.evaluate( () => {
			const {
				createBlock,
				getBlockVariations,
				createBlocksFromInnerBlocksTemplate,
			} = window.wp.blocks;

			return getBlockVariations( 'thingamablocks/dropdown', 'block' )
				.map( ( layout ) => {
					const block = createBlock(
						'thingamablocks/dropdown',
						layout.attributes,
						createBlocksFromInnerBlocksTemplate(
							layout.innerBlocks
						)
					);
					window.wp.data
						.dispatch( 'core/block-editor' )
						.insertBlocks( block );
					return block.clientId;
				} )
				.shift();
		} );

		expect( await invalidBlocks( page ) ).toEqual( [] );

		const canvas = page.frameLocator( 'iframe[name="editor-canvas"]' );
		const wrapper = canvas.locator( `[data-block="${ clientId }"]` );

		await page.evaluate(
			( id ) =>
				window.wp.data
					.dispatch( 'core/block-editor' )
					.selectBlock( id ),
			clientId
		);
		await expect( wrapper ).toHaveClass( /is-open/ );
		await expect(
			wrapper.locator( '[data-dropdown-part="drawer"]' )
		).toBeVisible();

		await page.evaluate( () =>
			window.wp.data.dispatch( 'core/block-editor' ).clearSelectedBlock()
		);
		await expect( wrapper ).toHaveClass( /is-closed/ );
		await expect(
			wrapper.locator( '[data-dropdown-part="drawer"]' )
		).toBeHidden();
	} );

	test( 'opens from a script on another button’s click', async ( {
		page,
	} ) => {
		await page.setViewportSize( { width: 1280, height: 1200 } );
		await page.goto( url, { waitUntil: 'networkidle' } );

		await page.evaluate( () => {
			const opener = document.createElement( 'button' );
			opener.id = 'opener';
			opener.textContent = 'Open the second dropdown';
			opener.addEventListener( 'click', () =>
				window.tmbDropdown.open( 'second-dropdown' )
			);
			document.querySelector( '.entry-content' ).prepend( opener );
		} );

		await page.locator( '#opener' ).click();
		await expect(
			page.locator( '#second-dropdown [data-dropdown-part="button"]' )
		).toHaveAttribute( 'aria-expanded', 'true' );
	} );

	test( 'a drawer wider than the screen never makes the page scroll sideways', async ( {
		page,
	} ) => {
		await page.setViewportSize( { width: 360, height: 800 } );
		await page.goto( url, { waitUntil: 'networkidle' } );

		const { button, drawer } = first( page );

		await drawer.evaluate( ( element ) => {
			element.style.width = '500px';
		} );
		await button.click();
		await settled( page );

		const sizes = await page.evaluate( () => ( {
			scroll: document.documentElement.scrollWidth,
			client: document.documentElement.clientWidth,
		} ) );
		expect( sizes.scroll ).toBeLessThanOrEqual( sizes.client );
	} );

	test( 'on a right-to-left site, Start lines up with the right-hand edge', async ( {
		page,
	} ) => {
		await page.setViewportSize( { width: 1280, height: 1200 } );
		await page.goto( url, { waitUntil: 'networkidle' } );

		const { wrapper, button, drawer } = first( page );

		await wrapper.evaluate( ( element ) => {
			element.style.direction = 'rtl';
			// Away from the left edge, as on a right-to-left page.
			element.style.marginLeft = '600px';
			element.querySelector(
				'[data-dropdown-part="drawer"]'
			).style.width = '320px';
		} );
		await button.click();
		await settled( page );

		const [ b, d ] = [
			await button.boundingBox(),
			await drawer.boundingBox(),
		];
		expect( Math.abs( d.x + d.width - ( b.x + b.width ) ) ).toBeLessThan(
			1
		);
	} );

	test( 'a drawer without a button is left visible, not hidden for good', async ( {
		page,
	} ) => {
		const orphan = await testPage(
			page,
			'tmb-test-dropdown-orphan',
			'<!-- wp:thingamablocks/dropdown --><!-- wp:generateblocks/element {"uniqueId":"dd00aa11","tagName":"div","htmlAttributes":{"data-dropdown-part":"drawer"}} --><div class="gb-element-dd00aa11" data-dropdown-part="drawer"><!-- wp:paragraph --><p>Still here</p><!-- /wp:paragraph --></div><!-- /wp:generateblocks/element --><!-- /wp:thingamablocks/dropdown -->'
		);

		await page.goto( orphan, { waitUntil: 'networkidle' } );
		await expect( page.getByText( 'Still here' ) ).toBeVisible();
	} );
} );
