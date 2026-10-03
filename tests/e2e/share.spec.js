/**
 * The Share block: links made for the post, names for icon-only buttons,
 * Copy link and Share…, loading, forged markup, and the editor (layouts,
 * adding networks, the Share part panel).
 */
const { readFileSync } = require( 'node:fs' );
const { test, expect } = require( '@playwright/test' );
const { rest, newPost, pluginAssets, invalidBlocks } = require( './utils' );

const AXE = readFileSync( require.resolve( 'axe-core/axe.min.js' ), 'utf8' );

/**
 * Block markup for a Share layout, made by the editor (so GenerateBlocks has
 * given each block its ID).
 *
 * @param {import('@playwright/test').Page} page  Page.
 * @param {string}                          style Variation name.
 * @return {Promise<string>} Markup.
 */
async function shareMarkup( page, style = 'icons' ) {
	await newPost( page );

	return page.evaluate( async ( name ) => {
		const {
			createBlock,
			getBlockVariations,
			createBlocksFromInnerBlocksTemplate,
			serialize,
		} = window.wp.blocks;
		const layout = getBlockVariations(
			'thingamablocks/share',
			'block'
		).find( ( item ) => item.name === name );
		const block = createBlock(
			'thingamablocks/share',
			{},
			createBlocksFromInnerBlocksTemplate( layout.innerBlocks )
		);
		const { dispatch, select } = window.wp.data;

		dispatch( 'core/block-editor' ).insertBlocks( block );

		const ready = ( blocks ) =>
			blocks.every(
				( item ) =>
					item.attributes.uniqueId && ready( item.innerBlocks )
			);

		await new Promise( ( resolve ) => {
			const check = () =>
				ready(
					select( 'core/block-editor' ).getBlock( block.clientId )
						.innerBlocks
				)
					? resolve()
					: setTimeout( check, 100 );
			check();
		} );

		return serialize( [
			select( 'core/block-editor' ).getBlock( block.clientId ),
		] );
	}, style );
}

/**
 * Create (or update) a published post.
 *
 * @param {import('@playwright/test').Page} page    Page.
 * @param {string}                          slug    Slug.
 * @param {string}                          title   Title.
 * @param {string}                          content Block markup.
 * @return {Promise<{url: string, link: string}>} Path and full address.
 */
async function testPost( page, slug, title, content ) {
	const [ existing ] = await rest( page, '/wp/v2/posts', {
		params: { slug, status: 'publish,draft', context: 'edit' },
	} );
	const data = { slug, title, status: 'publish', content };
	const saved = existing
		? await rest( page, `/wp/v2/posts/${ existing.id }`, {
				method: 'POST',
				data,
		  } )
		: await rest( page, '/wp/v2/posts', { method: 'POST', data } );

	return { url: new URL( saved.link ).pathname, link: saved.link };
}

const TITLE = 'Tips & tricks: "quoted" <b>ideas</b>';
const PLAIN_TITLE = 'Tips & tricks: “quoted” ideas';

test.describe( 'Share', () => {
	test.describe.configure( { mode: 'serial' } );

	const site = {};

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();

		site.icons = await testPost(
			page,
			'tmb-test-share',
			TITLE,
			await shareMarkup( page, 'icons' )
		);
		site.pills = await testPost(
			page,
			'tmb-test-share-pills',
			'Pills',
			await shareMarkup( page, 'pills' )
		);

		// Links only: no Copy link button, so no script.
		const linksOnly = ( await shareMarkup( page, 'icons' ) ).replace(
			/<!-- wp:generateblocks\/element \{[^}]*"tagName":"li"(?:(?!<!-- \/wp:generateblocks\/element -->).)*data-share-network="copy"(?:(?!<!-- \/wp:generateblocks\/element -->).)*<!-- \/wp:generateblocks\/element -->/s,
			''
		);
		site.linksOnly = await testPost(
			page,
			'tmb-test-share-links',
			'Links only',
			linksOnly
		);

		await page.close();
	} );

	test( 'each button links to its network with the post’s address and title', async ( {
		page,
	} ) => {
		await page.goto( site.icons.url );

		const share = page.locator( '.tmb-share' );
		const url = encodeURIComponent( site.icons.link );
		const title = encodeURIComponent( PLAIN_TITLE );
		const link = ( name ) => share.getByRole( 'link', { name } );

		await expect( link( 'Share on X' ) ).toHaveAttribute(
			'href',
			`https://x.com/intent/post?text=${ title }&url=${ url }`
		);
		await expect( link( 'Share on LinkedIn' ) ).toHaveAttribute(
			'href',
			`https://www.linkedin.com/sharing/share-offsite/?url=${ url }`
		);
		await expect( link( 'Share on Facebook' ) ).toHaveAttribute(
			'href',
			`https://www.facebook.com/sharer/sharer.php?u=${ url }`
		);
		await expect( link( 'Share by email' ) ).toHaveAttribute(
			'href',
			`mailto:?subject=${ title }&body=${ url }`
		);

		// Networks open in a new tab; email doesn't.
		await expect( link( 'Share on X' ) ).toHaveAttribute(
			'target',
			'_blank'
		);
		await expect( link( 'Share on X' ) ).toHaveAttribute(
			'rel',
			'noopener noreferrer nofollow'
		);
		await expect( link( 'Share by email' ) ).not.toHaveAttribute(
			'target',
			/./
		);

		// Copy link is a real button; the icons are the networks' own.
		const copy = share.getByRole( 'button', { name: 'Copy link' } );
		await expect( copy ).toHaveAttribute( 'type', 'button' );
		await expect( link( 'Share on X' ).locator( 'svg' ) ).toHaveCount( 1 );

		// The list is named by the label.
		const list = share.getByRole( 'list', { name: 'Share:' } );
		await expect( list ).toBeVisible();
		await expect( list.getByRole( 'listitem' ) ).toHaveCount( 5 );
	} );

	test( 'buttons with a visible name aren’t given another one', async ( {
		page,
	} ) => {
		await page.goto( site.pills.url );

		const x = page.locator( '[data-share-network="x"]' );

		await expect( x ).toHaveText( 'X' );
		await expect( x ).not.toHaveAttribute( 'aria-label', /./ );
		await expect(
			page.getByRole( 'button', { name: 'Copy link' } )
		).toHaveText( 'Copy link' );
	} );

	test( 'Copy link copies the address and says so', async ( {
		page,
		context,
	} ) => {
		await context.grantPermissions( [
			'clipboard-read',
			'clipboard-write',
		] );
		await page.goto( site.icons.url );

		const copy = page.getByRole( 'button', { name: 'Copy link' } );

		await copy.click();

		expect(
			await page.evaluate( () => window.navigator.clipboard.readText() )
		).toBe( site.icons.link );
		await expect( copy ).toHaveAttribute( 'data-copied', 'true' );
		await expect( copy.locator( '.tmb-share__copied' ) ).toBeVisible();
		await expect( copy.locator( '.tmb-share__copied' ) ).not.toHaveCSS(
			'background-color',
			'rgba(0, 0, 0, 0)'
		);
		await expect( page.getByRole( 'status' ) ).toHaveText( 'Link copied' );
		// Its name stays what it shows.
		await expect(
			page.getByRole( 'button', { name: 'Copy link', exact: true } )
		).toBeVisible();
	} );

	test( 'when copying isn’t possible, it says so', async ( { page } ) => {
		await page.addInitScript( () => {
			Object.defineProperty( window.navigator, 'clipboard', {
				value: { writeText: () => Promise.reject( new Error() ) },
			} );
			document.execCommand = () => false;
		} );
		await page.goto( site.icons.url );

		const copy = page.getByRole( 'button', { name: 'Copy link' } );

		await copy.click();
		await expect( page.getByRole( 'status' ) ).toHaveText(
			'Copy the address from the address bar'
		);
		await expect( copy ).not.toHaveAttribute( 'data-copied', /./ );
	} );

	test( 'Share… shows only where there’s a share sheet', async ( {
		page,
		browser,
	} ) => {
		// A post with a Share… button, added from the editor's network list.
		await newPost( page );
		const markup = await page.evaluate( () => {
			const { createBlock, serialize } = window.wp.blocks;

			return serialize( [
				createBlock( 'thingamablocks/share', {}, [
					createBlock( 'generateblocks/text', {
						uniqueId: '5ae0aa01',
						tagName: 'button',
						content: 'Share',
						htmlAttributes: { 'data-share-network': 'native' },
					} ),
				] ),
			] );
		} );
		const post = await testPost(
			page,
			'tmb-test-share-native',
			'Native share',
			markup
		);

		const without = await browser.newPage();
		await without.addInitScript( () => {
			delete window.Navigator.prototype.share;
		} );
		await without.goto( post.url );
		await expect(
			without.locator( '[data-share-network="native"]' )
		).toBeHidden();
		await without.close();

		await page.addInitScript( () => {
			window.Navigator.prototype.share = function ( data ) {
				window.tmbShared = data;
				return Promise.resolve();
			};
		} );
		await page.goto( post.url );

		const button = page.getByRole( 'button', { name: 'Share' } );

		await expect( button ).toBeVisible();
		await button.click();
		expect( await page.evaluate( () => window.tmbShared ) ).toEqual( {
			title: 'Native share',
			url: post.link,
		} );
	} );

	test( 'the script loads only with Copy link or Share…', async ( {
		page,
	} ) => {
		const withCopy = await pluginAssets( page, site.icons.url );
		const linksOnly = await pluginAssets( page, site.linksOnly.url );

		expect( withCopy.files ).toContainEqual(
			expect.stringMatching( 'build/share/view.js' )
		);
		expect( linksOnly.files ).not.toContainEqual(
			expect.stringMatching( 'build/share/view.js' )
		);

		await page.goto( site.linksOnly.url );
		await expect( page.locator( '.tmb-share__status' ) ).toHaveCount( 0 );
		await expect( page.locator( '[data-tmb-share]' ) ).toHaveCount( 0 );
	} );

	test( 'saved or forged links never reach the page', async ( { page } ) => {
		const markup = `<!-- wp:thingamablocks/share -->
<!-- wp:generateblocks/text {"uniqueId":"5ae0bb01","tagName":"a","content":"Evil","htmlAttributes":{"data-share-network":"javascript","href":"javascript:alert(1)"}} -->
<a class="gb-text gb-text-5ae0bb01" data-share-network="javascript" href="javascript:alert(1)">Evil</a>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"5ae0bb02","tagName":"a","content":"X","htmlAttributes":{"data-share-network":"x","href":"https://evil.example/"}} -->
<a class="gb-text gb-text-5ae0bb02" data-share-network="x" href="https://evil.example/">X</a>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"5ae0bb03","tagName":"a","content":"LinkedIn","htmlAttributes":{"title":"a \u003e b","data-share-network":"linkedin","href":"#"}} -->
<a class="gb-text gb-text-5ae0bb03" title="a &gt; b" data-share-network="linkedin" href="#">LinkedIn</a>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"5ae0bb04","tagName":"button","content":"Reddit","htmlAttributes":{"data-share-network":"reddit"}} -->
<button class="gb-text gb-text-5ae0bb04" data-share-network="reddit">Reddit</button>
<!-- /wp:generateblocks/text -->
<!-- /wp:thingamablocks/share -->`;
		const post = await testPost(
			page,
			'tmb-test-share-forged',
			'Forged',
			markup
		);
		const dialogs = [];

		page.on( 'dialog', ( dialog ) => {
			dialogs.push( dialog.message() );
			dialog.dismiss();
		} );
		await page.goto( post.url );

		await expect(
			page.locator( '[data-share-network="javascript"]' )
		).not.toHaveAttribute( 'href', /./ );
		await expect(
			page.locator( '[data-share-network="x"]' )
		).toHaveAttribute( 'href', /^https:\/\/x\.com\/intent\/post\?/ );
		await expect(
			page.locator( '[data-share-network="linkedin"]' )
		).toHaveAttribute( 'href', /^https:\/\/www\.linkedin\.com\// );
		// A network set on a <button> can't link anywhere: left out.
		await expect(
			page.locator( '[data-share-network="reddit"]' )
		).toHaveCount( 0 );
		await page.locator( '[data-share-network="javascript"]' ).click();
		expect( dialogs ).toEqual( [] );
	} );

	test( 'no accessibility violations', async ( { page } ) => {
		for ( const url of [ site.icons.url, site.pills.url ] ) {
			await page.goto( url );
			await page.addScriptTag( { content: AXE } );

			const violations = await page.evaluate( async () => {
				const result = await window.axe.run( '.tmb-share', {
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

			expect( violations, url ).toEqual( [] );
		}
	} );

	test( 'in the editor: layouts are valid, networks can be added and switched', async ( {
		page,
	} ) => {
		await newPost( page );

		const clientId = await page.evaluate( () => {
			const { createBlock, createBlocksFromInnerBlocksTemplate } =
				window.wp.blocks;
			const { dispatch } = window.wp.data;
			const layouts = window.wp.blocks.getBlockVariations(
				'thingamablocks/share',
				'block'
			);
			const blocks = layouts.map( ( layout ) =>
				createBlock(
					'thingamablocks/share',
					{},
					createBlocksFromInnerBlocksTemplate( layout.innerBlocks )
				)
			);

			dispatch( 'core/block-editor' ).insertBlocks( blocks );
			dispatch( 'core/block-editor' ).selectBlock( blocks[ 2 ].clientId );

			return blocks[ 2 ].clientId;
		} );

		const buttons = () =>
			page.evaluate( ( id ) => {
				const found = [];
				const walk = ( blocks ) =>
					blocks.forEach( ( block ) => {
						const network =
							block.attributes.htmlAttributes?.[
								'data-share-network'
							];

						if ( network ) {
							found.push( {
								network,
								tag: block.attributes.tagName,
								icon: !! block.attributes.icon,
								brand: block.attributes.globalClasses.includes(
									`tmb-share__button--${ network }`
								),
							} );
						}
						walk( block.innerBlocks );
					} );

				walk(
					window.wp.data.select( 'core/block-editor' ).getBlocks( id )
				);

				return found;
			}, clientId );

		// Brand layout: adding Reddit copies the first button, with Reddit's
		// icon and brand class, in its own list item.
		await page.getByRole( 'button', { name: 'Add Reddit' } ).click();

		expect( ( await buttons() ).slice( -1 ) ).toEqual( [
			{ network: 'reddit', tag: 'a', icon: true, brand: true },
		] );
		await expect(
			page.getByRole( 'button', { name: 'Add Reddit' } )
		).toHaveCount( 0 );

		// Switching a button to Copy link makes it a <button>, with its icon.
		const linkedin = await page.evaluate( ( id ) => {
			const { select, dispatch } = window.wp.data;
			const find = ( blocks ) => {
				for ( const block of blocks ) {
					if (
						'linkedin' ===
						block.attributes.htmlAttributes?.[
							'data-share-network'
						]
					) {
						return block;
					}
					const inner = find( block.innerBlocks );
					if ( inner ) {
						return inner;
					}
				}
			};
			const block = find( select( 'core/block-editor' ).getBlocks( id ) );

			dispatch( 'core/block-editor' ).selectBlock( block.clientId );

			return block.attributes.icon;
		}, clientId );

		await page
			.getByLabel( 'This block is' )
			.selectOption( { label: 'Share button: Copy link' } );

		const switched = await page.evaluate(
			() =>
				window.wp.data.select( 'core/block-editor' ).getSelectedBlock()
					.attributes
		);

		expect( switched.tagName ).toBe( 'button' );
		expect( switched.htmlAttributes.href ).toBeUndefined();
		expect( switched.icon ).not.toBe( linkedin );
		expect( switched.globalClasses ).not.toContain(
			'tmb-share__button--linkedin'
		);

		// An icon of your own stays when the network changes.
		await page.evaluate( () => {
			const { select, dispatch } = window.wp.data;

			dispatch( 'core/block-editor' ).updateBlockAttributes(
				select( 'core/block-editor' ).getSelectedBlockClientId(),
				{
					icon: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"></circle></svg>',
				}
			);
		} );
		await page
			.getByLabel( 'This block is' )
			.selectOption( { label: 'Share button: Telegram' } );
		expect(
			await page.evaluate(
				() =>
					window.wp.data
						.select( 'core/block-editor' )
						.getSelectedBlock().attributes.icon
			)
		).toContain( '<circle' );
		await page
			.getByRole( 'button', { name: 'Use the Telegram icon' } )
			.click();
		expect(
			await page.evaluate(
				() =>
					window.wp.data
						.select( 'core/block-editor' )
						.getSelectedBlock().attributes.icon
			)
		).not.toContain( '<circle' );

		expect( await invalidBlocks( page ) ).toEqual( [] );

		const markup = await page.evaluate( () =>
			window.wp.blocks.serialize(
				window.wp.data.select( 'core/block-editor' ).getBlocks()
			)
		);
		expect( await invalidBlocks( page, markup ) ).toEqual( [] );
	} );
} );
