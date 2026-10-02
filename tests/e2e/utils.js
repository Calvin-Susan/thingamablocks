/**
 * Helpers shared by the browser tests.
 */
const { readFileSync } = require( 'node:fs' );
const { expect } = require( '@playwright/test' );

const DEMO = '/thingamablocks-demo/';

/**
 * Call the WordPress REST API as the logged-in admin (Playground logs every
 * visitor in automatically). The REST nonce comes from admin-ajax.
 *
 * @param {import('@playwright/test').Page} page             Any page in the context.
 * @param {string}                          path             REST route, e.g. "/wp/v2/pages".
 * @param {Object}                          options          Request options.
 * @param {string}                          [options.method] HTTP method.
 * @param {Object}                          [options.data]   Request body.
 * @param {Object}                          [options.params] Query parameters.
 * @return {Promise<any>} JSON response.
 */
async function rest( page, path, { method = 'GET', data, params = {} } = {} ) {
	// The first request logs the context in.
	if ( ! page.tmbNonce ) {
		await page.request.get( '/wp-admin/' );
		const response = await page.request.get(
			'/wp-admin/admin-ajax.php?action=rest-nonce'
		);
		page.tmbNonce = ( await response.text() ).trim();
	}

	const query = new URLSearchParams( { rest_route: path, ...params } );
	const response = await page.request.fetch( `/?${ query }`, {
		method,
		headers: { 'X-WP-Nonce': page.tmbNonce },
		data,
	} );

	expect(
		response.ok(),
		`${ method } ${ path }: ${ await response.text() }`
	).toBeTruthy();

	return response.json();
}

/**
 * Create a published test page, or update it if it exists (so repeated test
 * runs don't pile up pages).
 *
 * @param {import('@playwright/test').Page} page    Any page in the context.
 * @param {string}                          slug    Page slug.
 * @param {string}                          content Block markup.
 * @return {Promise<string>} The page's URL.
 */
async function testPage( page, slug, content ) {
	const [ existing ] = await rest( page, '/wp/v2/pages', {
		params: { slug, status: 'publish,draft', context: 'edit' },
	} );
	const data = { slug, title: `Test: ${ slug }`, status: 'publish', content };
	const saved = existing
		? await rest( page, `/wp/v2/pages/${ existing.id }`, {
				method: 'POST',
				data,
		  } )
		: await rest( page, '/wp/v2/pages', { method: 'POST', data } );

	return new URL( saved.link ).pathname;
}

/**
 * Every URL the page requests from the plugin, plus inline <style>/<script>
 * elements it prints, while loading `url`.
 *
 * @param {import('@playwright/test').Page} page Page.
 * @param {string}                          url  URL.
 * @return {Promise<{files: string[], inline: string[]}>} Plugin assets.
 */
async function pluginAssets( page, url ) {
	const files = [];
	const listener = ( request ) => {
		if ( request.url().includes( '/plugins/thingamablocks/' ) ) {
			files.push(
				new URL( request.url() ).pathname.replace(
					/.*\/thingamablocks\//,
					''
				)
			);
		}
	};

	page.on( 'request', listener );
	await page.goto( url, { waitUntil: 'networkidle' } );
	page.off( 'request', listener );

	const inline = await page.$$eval( 'style, script', ( elements ) =>
		elements
			.map( ( element ) => element.id || element.className )
			.filter( ( name ) => /^(tmb-|thingamablocks-)/.test( name ) )
			// The test site's stand-in for GB Pro's Global Styles (see
			// THINGAMABLOCKS_PRINT_DEFAULT_STYLES): on real sites GB Pro prints these.
			.filter(
				( name ) => name !== 'thingamablocks-default-styles-inline-css'
			)
	);

	return { files, inline };
}

/**
 * Open a post in the block editor and wait until its blocks are loaded.
 *
 * @param {import('@playwright/test').Page} page   Page.
 * @param {number}                          postId Post ID.
 */
async function openEditor( page, postId ) {
	await page.goto( `/wp-admin/post.php?post=${ postId }&action=edit` );
	await page.waitForFunction(
		() =>
			window.wp?.data?.select( 'core/block-editor' )?.getBlocks().length >
			0,
		null,
		{ timeout: 60_000 }
	);
}

/**
 * Names of invalid blocks ("This block contains unexpected or invalid
 * content") in the editor, or in parsed markup.
 *
 * @param {import('@playwright/test').Page} page     Editor page.
 * @param {string}                          [markup] Parse this instead of the open post.
 * @return {Promise<string[]>} Invalid block names.
 */
function invalidBlocks( page, markup ) {
	return page.evaluate( ( content ) => {
		const bad = [];
		const walk = ( blocks ) =>
			blocks.forEach( ( block ) => {
				if ( ! block.isValid ) {
					bad.push( block.name );
				}
				walk( block.innerBlocks );
			} );

		walk(
			content
				? window.wp.blocks.parse( content )
				: window.wp.data.select( 'core/block-editor' ).getBlocks()
		);

		return bad;
	}, markup );
}

/**
 * Upload the test photo to the Media Library once, and reuse it afterwards.
 *
 * @param {import('@playwright/test').Page} page Any page in the context.
 * @return {Promise<{id: number, url: string}>} The attachment.
 */
async function testImage( page ) {
	const [ existing ] = await rest( page, '/wp/v2/media', {
		params: { search: 'tmb-test-photo' },
	} );

	if ( existing ) {
		return { id: existing.id, url: existing.source_url };
	}

	const response = await page.request.post( '/?rest_route=/wp/v2/media', {
		headers: {
			'X-WP-Nonce': page.tmbNonce,
			'Content-Type': 'image/png',
			'Content-Disposition': 'attachment; filename=tmb-test-photo.png',
		},
		data: readFileSync( require.resolve( './fixtures/photo.png' ) ),
	} );
	const media = await response.json();

	expect( response.ok(), JSON.stringify( media ) ).toBeTruthy();

	return { id: media.id, url: media.source_url };
}

/**
 * Open a new, empty post in the editor, with the welcome guide off and the
 * block settings sidebar open.
 *
 * @param {import('@playwright/test').Page} page Page.
 */
async function newPost( page ) {
	await page.goto( '/wp-admin/post-new.php' );
	await page.waitForFunction(
		() => window.wp?.blocks?.getBlockType( 'generateblocks/media' ),
		null,
		{ timeout: 60_000 }
	);
	await page.evaluate( () => {
		window.wp.data
			.dispatch( 'core/preferences' )
			.set( 'core/edit-post', 'welcomeGuide', false );
		window.wp.data
			.dispatch( 'core/edit-post' )
			.openGeneralSidebar( 'edit-post/block' );
	} );
}

module.exports = {
	DEMO,
	rest,
	testPage,
	testImage,
	newPost,
	pluginAssets,
	openEditor,
	invalidBlocks,
};
