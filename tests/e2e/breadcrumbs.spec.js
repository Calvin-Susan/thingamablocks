/**
 * The Breadcrumbs block: the trail on different kinds of page, its markup,
 * structured data, collapsing, and SEO plugin trails.
 */
const { readFileSync } = require( 'node:fs' );
const { test, expect } = require( '@playwright/test' );
const { rest, newPost, invalidBlocks } = require( './utils' );

const AXE = readFileSync( require.resolve( 'axe-core/axe.min.js' ), 'utf8' );

/**
 * Block markup for a Breadcrumbs style, made by the editor (so GenerateBlocks
 * has compiled each part's CSS).
 *
 * @param {import('@playwright/test').Page} page       Page.
 * @param {Object}                          attributes Block attributes.
 * @param {string}                          style      Variation name.
 * @return {Promise<string>} Markup.
 */
async function breadcrumbsMarkup( page, attributes = {}, style = 'chevrons' ) {
	await newPost( page );

	return page.evaluate(
		async ( [ name, extra ] ) => {
			const {
				createBlock,
				getBlockVariations,
				createBlocksFromInnerBlocksTemplate,
				serialize,
			} = window.wp.blocks;
			const layout = getBlockVariations(
				'thingamablocks/breadcrumbs',
				'block'
			).find( ( item ) => item.name === name );
			const block = createBlock(
				'thingamablocks/breadcrumbs',
				{ ...layout.attributes, ...extra },
				createBlocksFromInnerBlocksTemplate( layout.innerBlocks )
			);
			const { dispatch, select } = window.wp.data;

			dispatch( 'core/block-editor' ).insertBlocks( block );

			// GenerateBlocks compiles each part's CSS once it's in the editor.
			await new Promise( ( resolve ) => {
				const check = () =>
					select( 'core/block-editor' )
						.getBlock( block.clientId )
						.innerBlocks.every( ( inner ) => inner.attributes.css )
						? resolve()
						: setTimeout( check, 100 );
				check();
			} );

			return serialize( [
				select( 'core/block-editor' ).getBlock( block.clientId ),
			] );
		},
		[ style, attributes ]
	);
}

const trailText = ( page ) =>
	page
		.locator( 'nav.tmb-breadcrumbs' )
		.first()
		.evaluate( ( nav ) =>
			[ ...nav.querySelectorAll( 'li' ) ]
				.filter( ( step ) => ! step.hidden )
				.map( ( step ) =>
					step
						.querySelector(
							'a, [aria-current], .tmb-breadcrumbs__more'
						)
						.textContent.trim()
				)
		);

test.describe( 'Breadcrumbs', () => {
	test.describe.configure( { mode: 'serial' } );

	const site = {};

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();
		const markup = await breadcrumbsMarkup( page );
		const bare = await breadcrumbsMarkup( page, {
			showBlogPage: false,
			showCategory: false,
			home: 'icon',
		} );
		// The sidebar is narrow, so its copy doesn't collapse (the test reads
		// the whole trail).
		const sidebarMarkup = await breadcrumbsMarkup( page, {
			collapse: false,
		} );
		const make = ( path, data ) =>
			rest( page, path, { method: 'POST', data } );
		const stamp = Date.now();

		site.reading = await rest( page, '/wp/v2/settings' );
		site.front = await make( '/wp/v2/pages', {
			title: 'Welcome',
			status: 'publish',
			content: markup,
		} );
		site.blog = await make( '/wp/v2/pages', {
			title: 'Journal',
			status: 'publish',
		} );
		site.parent = await make( '/wp/v2/pages', {
			title: 'Services',
			status: 'publish',
		} );
		site.child = await make( '/wp/v2/pages', {
			title: 'Web design',
			status: 'publish',
			parent: site.parent.id,
			content: markup,
		} );
		site.category = await make( '/wp/v2/categories', {
			name: `Guides ${ stamp }`,
		} );
		site.subcategory = await make( '/wp/v2/categories', {
			name: `Tutorials ${ stamp }`,
			parent: site.category.id,
		} );
		site.post = await make( '/wp/v2/posts', {
			title: 'Five tips',
			status: 'publish',
			categories: [ site.subcategory.id ],
			content: markup + markup,
		} );
		site.barePost = await make( '/wp/v2/posts', {
			title: 'Plain post',
			status: 'publish',
			categories: [ site.subcategory.id ],
			content: bare,
		} );
		await make( '/wp/v2/settings', {
			show_on_front: 'page',
			page_on_front: site.front.id,
			page_for_posts: site.blog.id,
		} );

		// For archive, search and 404 pages: the block in the sidebar. (Creating
		// the widget doesn't add it to the sidebar by itself.)
		site.widget = await make( '/wp/v2/widgets', {
			id_base: 'block',
			sidebar: 'sidebar-1',
			instance: { raw: { content: sidebarMarkup } },
		} );
		site.sidebar = await rest( page, '/wp/v2/sidebars/sidebar-1' );
		await make( '/wp/v2/sidebars/sidebar-1', {
			widgets: [
				...site.sidebar.widgets.filter(
					( id ) => id !== site.widget.id
				),
				site.widget.id,
			],
		} );

		await page.close();
	} );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();

		await rest( page, `/wp/v2/widgets/${ site.widget.id }`, {
			method: 'DELETE',
			params: { force: 'true' },
		} );
		await rest( page, '/wp/v2/settings', {
			method: 'POST',
			data: {
				show_on_front: site.reading.show_on_front,
				page_on_front: site.reading.page_on_front,
				page_for_posts: site.reading.page_for_posts,
			},
		} );
		await page.close();
	} );

	test( 'a page: home, parent pages, then the current page', async ( {
		page,
	} ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );
		await page.goto( site.child.link, { waitUntil: 'networkidle' } );

		expect( await trailText( page ) ).toEqual( [
			'Home',
			'Services',
			'Web design',
		] );

		const nav = page.locator( 'main nav.tmb-breadcrumbs' );

		await expect( nav ).toHaveAttribute( 'aria-label', 'Breadcrumb' );
		await expect( nav.locator( 'ol > li' ) ).toHaveCount( 3 );
		await expect( nav.locator( '[aria-current="page"]' ) ).toHaveText(
			'Web design'
		);
		await expect(
			nav.getByRole( 'link', { name: 'Services' } )
		).toHaveAttribute( 'href', site.parent.link );
		// Separators between steps only, hidden from screen readers.
		await expect(
			nav.locator( '[data-breadcrumb-part="separator"]' )
		).toHaveCount( 2 );
		await expect(
			nav.locator(
				'[data-breadcrumb-part="separator"]:not([aria-hidden="true"])'
			)
		).toHaveCount( 0 );

		expect( errors ).toEqual( [] );
	} );

	test( 'a post: home, blog page, category with its parent, then the post', async ( {
		page,
	} ) => {
		await page.goto( site.post.link, { waitUntil: 'networkidle' } );

		expect( await trailText( page ) ).toEqual( [
			'Home',
			'Journal',
			site.category.name,
			site.subcategory.name,
			'Five tips',
		] );
	} );

	test( 'the blog page and category can be left out; home can be an icon', async ( {
		page,
	} ) => {
		await page.goto( site.barePost.link, { waitUntil: 'networkidle' } );

		const nav = page.locator( 'main nav.tmb-breadcrumbs' );

		await expect( nav.locator( 'ol > li' ) ).toHaveCount( 2 );
		// The icon is decorative; the link is still named "Home".
		await expect( nav.getByRole( 'link', { name: 'Home' } ) ).toBeVisible();
		await expect( nav.locator( 'a svg[aria-hidden="true"]' ) ).toHaveCount(
			1
		);
	} );

	test( 'archives, search results and the 404 page', async ( { page } ) => {
		await page.goto( site.subcategory.link, { waitUntil: 'networkidle' } );
		expect( await trailText( page ) ).toEqual( [
			'Home',
			'Journal',
			site.category.name,
			site.subcategory.name,
		] );

		await page.goto( '/?s=tips', { waitUntil: 'networkidle' } );
		expect( await trailText( page ) ).toEqual( [
			'Home',
			'Search results for “tips”',
		] );

		await page.goto( '/no-such-page-here/', { waitUntil: 'networkidle' } );
		expect( await trailText( page ) ).toEqual( [
			'Home',
			'Page not found',
		] );
	} );

	test( 'hidden on the home page by default', async ( { page } ) => {
		await page.goto( '/', { waitUntil: 'networkidle' } );
		await expect( page.locator( 'nav.tmb-breadcrumbs' ) ).toHaveCount( 0 );
	} );

	test( 'structured data: one BreadcrumbList per page, matching the trail', async ( {
		page,
	} ) => {
		// This post has the block twice, plus the sidebar one.
		await page.goto( site.post.link, { waitUntil: 'networkidle' } );

		const scripts = page.locator( 'script[type="application/ld+json"]' );

		await expect( scripts ).toHaveCount( 1 );

		const data = JSON.parse( await scripts.textContent() );

		expect( data[ '@type' ] ).toBe( 'BreadcrumbList' );
		expect(
			data.itemListElement.map( ( item ) => [ item.position, item.name ] )
		).toEqual( [
			[ 1, 'Home' ],
			[ 2, 'Journal' ],
			[ 3, site.category.name ],
			[ 4, site.subcategory.name ],
			[ 5, 'Five tips' ],
		] );
		expect( data.itemListElement[ 1 ].item ).toBe( site.blog.link );
	} );

	test.describe( 'on a phone', () => {
		test.use( { viewport: { width: 360, height: 800 } } );

		test( 'a long trail collapses; the … button shows it all', async ( {
			page,
		} ) => {
			await page.goto( site.post.link, { waitUntil: 'networkidle' } );

			const nav = page.locator( 'main nav.tmb-breadcrumbs' ).first();
			const more = nav.locator( '.tmb-breadcrumbs__more' );

			await expect( more ).toBeVisible();
			await expect( more ).toHaveAttribute(
				'aria-label',
				'Show the full path'
			);
			expect( ( await trailText( page ) )[ 0 ] ).toBe( 'Home' );
			expect( ( await trailText( page ) ).slice( -1 ) ).toEqual( [
				'Five tips',
			] );

			await more.focus();
			await page.keyboard.press( 'Enter' );

			await expect( more ).toHaveCount( 0 );
			await expect( nav.locator( 'li[hidden]' ) ).toHaveCount( 0 );
			// Focus moves to the first step that was hidden.
			await expect(
				nav.getByRole( 'link', { name: 'Journal' } )
			).toBeFocused();
		} );
	} );

	test( 'no WCAG violations', async ( { page } ) => {
		await page.goto( site.post.link, { waitUntil: 'networkidle' } );
		await page.addScriptTag( { content: AXE } );

		const violations = await page.evaluate( async () => {
			// This test page has the block three times (twice in the post and
			// in the sidebar), so "landmarks must be unique" is about the test
			// setup, not the block.
			const result = await window.axe.run( 'nav.tmb-breadcrumbs', {
				rules: { 'landmark-unique': { enabled: false } },
				runOnly: [
					'wcag2a',
					'wcag2aa',
					'wcag21a',
					'wcag21aa',
					'wcag22aa',
					'best-practice',
				],
			} );

			return result.violations.map( ( violation ) => violation.id );
		} );

		expect( violations ).toEqual( [] );
	} );

	test( 'editor: every style inserts as valid blocks', async ( { page } ) => {
		await newPost( page );

		await page.evaluate( () => {
			const {
				createBlock,
				getBlockVariations,
				createBlocksFromInnerBlocksTemplate,
			} = window.wp.blocks;

			getBlockVariations( 'thingamablocks/breadcrumbs', 'block' ).forEach(
				( layout ) =>
					window.wp.data
						.dispatch( 'core/block-editor' )
						.insertBlocks(
							createBlock(
								'thingamablocks/breadcrumbs',
								layout.attributes,
								createBlocksFromInnerBlocksTemplate(
									layout.innerBlocks
								)
							)
						)
			);
		} );

		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );
} );
