/**
 * Breadcrumbs with SEO plugins: Yoast SEO and Rank Math (free versions,
 * installed from WordPress.org for the test, then deactivated).
 *
 * With an SEO plugin active, the block shows the plugin's trail (so visitors
 * see what search engines are told) and, on "Automatic", leaves the
 * structured data to it.
 */
const { test, expect } = require( '@playwright/test' );
const { rest, newPost } = require( './utils' );

/**
 * Install (if needed) and activate or deactivate a WordPress.org plugin.
 *
 * @param {import('@playwright/test').Page} page   Page.
 * @param {string}                          slug   Plugin slug.
 * @param {string}                          status active or inactive.
 */
async function setPlugin( page, slug, status ) {
	const installed = ( await rest( page, '/wp/v2/plugins' ) ).find(
		( plugin ) => plugin.plugin.startsWith( `${ slug }/` )
	);

	if ( ! installed && 'active' === status ) {
		await rest( page, '/wp/v2/plugins', {
			method: 'POST',
			data: { slug, status },
		} );
		return;
	}

	if ( installed ) {
		await rest( page, `/wp/v2/plugins/${ installed.plugin }`, {
			method: 'POST',
			data: { status },
		} );
	}
}

/**
 * The BreadcrumbList items on the page: ours (a standalone script) and an SEO
 * plugin's (inside its @graph).
 *
 * @param {import('@playwright/test').Page} page Page.
 * @return {Promise<{ours: Array, plugin: Array}>} Item names.
 */
function structuredData( page ) {
	return page.evaluate( () => {
		const result = { ours: [], plugin: [] };

		document
			.querySelectorAll( 'script[type="application/ld+json"]' )
			.forEach( ( script ) => {
				let data;

				try {
					data = JSON.parse( script.textContent );
				} catch ( e ) {
					return;
				}

				const names = ( list ) =>
					list.itemListElement.map( ( item ) => item.name );

				if ( 'BreadcrumbList' === data[ '@type' ] ) {
					result.ours.push( names( data ) );
				}

				( data[ '@graph' ] || [] )
					.filter( ( node ) => 'BreadcrumbList' === node[ '@type' ] )
					.forEach( ( node ) => result.plugin.push( names( node ) ) );
			} );

		return result;
	} );
}

const trail = ( page, selector = 'main nav.tmb-breadcrumbs' ) =>
	page
		.locator( selector )
		.first()
		.evaluate( ( nav ) =>
			[ ...nav.querySelectorAll( 'li' ) ].map( ( step ) =>
				step.querySelector( 'a, [aria-current]' ).textContent.trim()
			)
		);

test.describe( 'Breadcrumbs with SEO plugins', () => {
	test.describe.configure( { mode: 'serial', timeout: 180_000 } );

	let auto;
	let always;
	let own;

	test.beforeAll( async ( { browser } ) => {
		test.setTimeout( 180_000 );

		const page = await browser.newPage();
		const markup = async ( attributes ) => {
			await newPost( page );

			return page.evaluate( async ( extra ) => {
				const {
					createBlock,
					getBlockVariations,
					createBlocksFromInnerBlocksTemplate,
					serialize,
				} = window.wp.blocks;
				const layout = getBlockVariations(
					'thingamablocks/breadcrumbs',
					'block'
				)[ 0 ];
				const block = createBlock(
					'thingamablocks/breadcrumbs',
					{ ...layout.attributes, ...extra },
					createBlocksFromInnerBlocksTemplate( layout.innerBlocks )
				);

				window.wp.data
					.dispatch( 'core/block-editor' )
					.insertBlocks( block );
				await new Promise( ( resolve ) => setTimeout( resolve, 1500 ) );

				return serialize( [
					window.wp.data
						.select( 'core/block-editor' )
						.getBlock( block.clientId ),
				] );
			}, attributes );
		};

		const category = await rest( page, '/wp/v2/categories', {
			method: 'POST',
			data: { name: `SEO ${ Date.now() }` },
		} );
		const post = ( title, content ) =>
			rest( page, '/wp/v2/posts', {
				method: 'POST',
				data: {
					title,
					status: 'publish',
					categories: [ category.id ],
					content,
				},
			} );

		auto = await post( 'SEO automatic', await markup( {} ) );
		always = await post(
			'SEO always',
			await markup( { schema: 'always' } )
		);
		own = await post(
			'SEO own trail',
			await markup( { useSeoPlugin: false } )
		);
		auto.category = category.name;

		await page.close();
	} );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();

		await setPlugin( page, 'wordpress-seo', 'inactive' );
		await setPlugin( page, 'seo-by-rank-math', 'inactive' );
		await page.close();
	} );

	test( 'Yoast SEO: its trail is shown, and the structured data is left to it', async ( {
		page,
	} ) => {
		await setPlugin( page, 'wordpress-seo', 'active' );

		await page.goto( auto.link, { waitUntil: 'networkidle' } );

		const shown = await trail( page );
		const data = await structuredData( page );

		// Yoast's own BreadcrumbList, and nothing from the block.
		expect( data.plugin ).toHaveLength( 1 );
		expect( data.ours ).toEqual( [] );
		// What visitors see matches what Yoast tells search engines.
		expect( shown ).toEqual( data.plugin[ 0 ] );
		expect( shown.slice( -1 ) ).toEqual( [ 'SEO automatic' ] );

		// "Always" adds the block's own as well.
		await page.goto( always.link, { waitUntil: 'networkidle' } );
		expect( ( await structuredData( page ) ).ours ).toHaveLength( 1 );

		// The block's own trail when asked: includes the category.
		await page.goto( own.link, { waitUntil: 'networkidle' } );
		expect( await trail( page ) ).toContain( auto.category );
	} );

	test( 'Rank Math: with its breadcrumbs off, the block adds the structured data', async ( {
		page,
	} ) => {
		await setPlugin( page, 'wordpress-seo', 'inactive' );
		await setPlugin( page, 'seo-by-rank-math', 'active' );

		await page.goto( auto.link, { waitUntil: 'networkidle' } );

		const shown = await trail( page );

		expect( shown[ 0 ] ).toBeTruthy();
		expect( shown.slice( -1 ) ).toEqual( [ 'SEO automatic' ] );
		expect( ( await structuredData( page ) ).ours ).toEqual( [ shown ] );
	} );
} );
