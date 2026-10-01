/**
 * Search block: each starting style built in the editor (so GenerateBlocks
 * compiles its CSS, as it would for a user), then checked on the site:
 * markup and names, searching only chosen content types, the expanding
 * style's keyboard behaviour, no-JavaScript fallback, assets and axe.
 */
const { readFileSync } = require( 'node:fs' );
const { test, expect } = require( '@playwright/test' );
const { rest, testPage, newPost, pluginAssets } = require( './utils' );

const AXE = readFileSync( require.resolve( 'axe-core/axe.min.js' ), 'utf8' );
const WORD = 'zebracornish';

/**
 * Build a Search block from a starting style in the editor and return its
 * saved markup.
 *
 * @param {import('@playwright/test').Page} page       Page.
 * @param {string}                          variation  Variation name.
 * @param {Object}                          attributes Block attributes.
 * @return {Promise<string>} Block markup.
 */
async function buildSearch( page, variation, attributes = {} ) {
	await newPost( page );

	return page.evaluate(
		async ( [ name, extra ] ) => {
			const { createBlock, getBlockVariations, serialize } =
				window.wp.blocks;
			const { createBlocksFromInnerBlocksTemplate } = window.wp.blocks;
			const { dispatch, select } = window.wp.data;
			const found = getBlockVariations(
				'thingamablocks/search',
				'block'
			).find( ( item ) => item.name === name );
			const block = createBlock(
				'thingamablocks/search',
				extra,
				createBlocksFromInnerBlocksTemplate( found.innerBlocks )
			);

			dispatch( 'core/block-editor' ).insertBlocks( block );

			// Wait for GenerateBlocks to give every block an ID and its CSS.
			const all = () => {
				const list = [];
				const walk = ( blocks ) =>
					blocks.forEach( ( item ) => {
						list.push( item );
						walk( item.innerBlocks );
					} );
				walk( select( 'core/block-editor' ).getBlocks() );
				return list.filter( ( item ) =>
					item.name.startsWith( 'generateblocks/' )
				);
			};

			for ( let i = 0; i < 40; i++ ) {
				if (
					all().every(
						( item ) =>
							item.attributes.uniqueId && item.attributes.css
					)
				) {
					break;
				}
				await new Promise( ( resolve ) => setTimeout( resolve, 250 ) );
			}

			return serialize( select( 'core/block-editor' ).getBlocks() );
		},
		[ variation, attributes ]
	);
}

test.describe( 'Search block', () => {
	test.describe.configure( { mode: 'serial' } );

	const urls = {};

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();

		urls.bar = await testPage(
			page,
			'tmb-test-search-bar',
			await buildSearch( page, 'bar', { label: 'Search the site' } )
		);
		urls.pages = await testPage(
			page,
			'tmb-test-search-pages',
			await buildSearch( page, 'pill', { postTypes: [ 'page' ] } )
		);
		urls.posts = await testPage(
			page,
			'tmb-test-search-posts',
			await buildSearch( page, 'underline', { postTypes: [ 'post' ] } )
		);
		urls.expand = await testPage(
			page,
			'tmb-test-search-expand',
			await buildSearch( page, 'expand' )
		);

		// Something to find: a post and a page with the same unusual word.
		for ( const [ type, title ] of [
			[ 'posts', 'Search test post' ],
			[ 'pages', 'Search test page' ],
		] ) {
			const slug = `tmb-${ type }-${ WORD }`;
			const [ existing ] = await rest( page, `/wp/v2/${ type }`, {
				params: { slug, context: 'edit' },
			} );

			if ( ! existing ) {
				await rest( page, `/wp/v2/${ type }`, {
					method: 'POST',
					data: {
						title,
						slug,
						status: 'publish',
						content: `<!-- wp:paragraph --><p>${ WORD }</p><!-- /wp:paragraph -->`,
					},
				} );
			}
		}

		await page.close();
	} );

	const results = ( page ) =>
		page.locator( 'main .entry-title' ).allInnerTexts();

	test( 'is a search landmark with a named input and button', async ( {
		page,
	} ) => {
		await page.goto( urls.bar );

		const form = page.locator( 'main' ).getByRole( 'search' );
		await expect( form ).toHaveAttribute( 'method', 'get' );
		await expect( form ).toHaveAttribute(
			'action',
			/127\.0\.0\.1:9400\/$/
		);

		const input = form.getByRole( 'searchbox', {
			name: 'Search the site',
		} );
		await expect( input ).toHaveAttribute( 'name', 's' );
		await expect( input ).toHaveAttribute( 'placeholder', 'Search…' );
		await expect(
			form.getByRole( 'button', { name: 'Search' } )
		).toHaveAttribute( 'type', 'submit' );

		// No content types chosen: no limit sent.
		await expect( form.locator( 'input[type="hidden"]' ) ).toHaveCount( 0 );

		// The theme's input styling is reset; the field carries the look.
		const look = await input.evaluate( ( element ) => {
			const style = getComputedStyle( element );
			return [ style.borderTopWidth, style.backgroundColor ];
		} );
		expect( look ).toEqual( [ '0px', 'rgba(0, 0, 0, 0)' ] );
	} );

	test( 'an icon-only button is named after the label', async ( {
		page,
	} ) => {
		await page.goto( urls.posts );
		await expect(
			page
				.locator( 'main' )
				.getByRole( 'search' )
				.getByRole( 'button', { name: 'Search' } )
		).toBeVisible();
	} );

	test( 'searches everything by default', async ( { page } ) => {
		await page.goto( urls.bar );
		await page
			.locator( '.tmb-search' )
			.getByRole( 'searchbox' )
			.fill( WORD );
		await page.keyboard.press( 'Enter' );
		await page.waitForURL( /[?&]s=/ );

		const titles = await results( page );
		expect( titles ).toContain( 'Search test post' );
		expect( titles ).toContain( 'Search test page' );
	} );

	test( 'searches only pages when asked (which WordPress can’t by itself)', async ( {
		page,
	} ) => {
		await page.goto( urls.pages );
		await expect(
			page.locator( '.tmb-search input[name="tmb_types"]' )
		).toHaveValue( 'page' );

		await page
			.locator( '.tmb-search' )
			.getByRole( 'searchbox' )
			.fill( WORD );
		await page
			.locator( '.tmb-search' )
			.getByRole( 'button', { name: 'Search' } )
			.click();
		await page.waitForURL( /tmb_types=page/ );

		const titles = await results( page );
		expect( titles ).toContain( 'Search test page' );
		expect( titles ).not.toContain( 'Search test post' );
	} );

	test( 'searches only posts with WordPress’s own post_type', async ( {
		page,
	} ) => {
		await page.goto( urls.posts );
		await expect(
			page.locator( '.tmb-search input[name="post_type"]' )
		).toHaveValue( 'post' );

		await page
			.locator( '.tmb-search' )
			.getByRole( 'searchbox' )
			.fill( WORD );
		await page.keyboard.press( 'Enter' );
		await page.waitForURL( /post_type=post/ );

		const titles = await results( page );
		expect( titles ).toContain( 'Search test post' );
		expect( titles ).not.toContain( 'Search test page' );
	} );

	test( 'a forged list only lets public types through', async ( {
		page,
	} ) => {
		await page.goto(
			`/?s=${ WORD }&tmb_types=wp_template,nope,${ encodeURIComponent(
				'page"><x'
			) },page`
		);

		const titles = await results( page );
		expect( titles ).toContain( 'Search test page' );
		expect( titles ).not.toContain( 'Search test post' );
	} );

	test( 'the expanding style opens, focuses the input and closes with Escape', async ( {
		page,
	} ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );
		await page.goto( urls.expand, { waitUntil: 'networkidle' } );

		const toggle = page.locator( '[data-search-part="toggle"]' );
		const field = page.locator( '[data-search-part="field"]' );

		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( toggle ).toHaveAccessibleName( 'Search' );
		await expect( toggle ).toHaveAttribute( 'type', 'button' );
		await expect( field ).toBeHidden();

		await toggle.click();
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
		await expect( field ).toBeVisible();
		await expect(
			page.locator( '.tmb-search' ).getByRole( 'searchbox' )
		).toBeFocused();

		// Set to line up with the icon's right edge, but the icon is near the
		// left of the screen here: it's moved to stay on screen.
		const box = await field.boundingBox();
		expect( box.x ).toBeGreaterThanOrEqual( 0 );

		await page.keyboard.press( 'Escape' );
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( field ).toBeHidden();
		await expect( toggle ).toBeFocused();

		// Keyboard: open, then Tab out of the form closes it.
		await page.keyboard.press( 'Enter' );
		await expect( field ).toBeVisible();
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Tab' );
		await expect( field ).toBeHidden();

		expect( errors ).toEqual( [] );
	} );

	test( 'clicking outside closes the expanding style', async ( { page } ) => {
		await page.goto( urls.expand, { waitUntil: 'networkidle' } );
		await page.locator( '[data-search-part="toggle"]' ).click();
		await expect(
			page.locator( '[data-search-part="field"]' )
		).toBeVisible();

		await page.locator( 'h1' ).first().click();
		await expect(
			page.locator( '[data-search-part="field"]' )
		).toBeHidden();
	} );

	test( 'every starting style is valid in the editor', async ( { page } ) => {
		for ( const name of [ 'bar', 'pill', 'underline', 'expand' ] ) {
			const markup = await buildSearch( page, name );
			const invalid = await page.evaluate( ( content ) => {
				const bad = [];
				const walk = ( blocks ) =>
					blocks.forEach( ( block ) => {
						if ( ! block.isValid ) {
							bad.push( block.name );
						}
						walk( block.innerBlocks );
					} );
				walk( window.wp.blocks.parse( content ) );
				return bad;
			}, markup );

			expect( invalid, name ).toEqual( [] );
		}
	} );

	test( 'parts keep their GB class and ID; any tag can be the label', async ( {
		page,
	} ) => {
		const text = ( id, tagName, html, extra = {} ) =>
			`<!-- wp:generateblocks/text ${ JSON.stringify( {
				uniqueId: id,
				tagName,
				htmlAttributes: extra,
			} ) } --><${ tagName } class="gb-text gb-text-${ id }"${ Object.entries(
				extra
			)
				.map( ( [ key, value ] ) => ` ${ key }="${ value }"` )
				.join(
					''
				) }>${ html }</${ tagName }><!-- /wp:generateblocks/text -->`;

		const url = await testPage(
			page,
			'tmb-test-search-parts',
			'<!-- wp:thingamablocks/search {"label":"Not used"} -->' +
				text( 'sa000001', 'h3', 'Find <em>stuff</em>', {
					'data-search-part': 'label',
				} ) +
				'<!-- wp:generateblocks/element {"uniqueId":"sa000002","tagName":"div","htmlAttributes":{"data-search-part":"field"}} --><div class="gb-element-sa000002" data-search-part="field">' +
				text( 'sa000003', 'span', 'Cost $1 \\ <b>bold</b> &amp; more', {
					id: 'my-input',
					'data-search-part': 'input',
				} ) +
				'</div><!-- /wp:generateblocks/element -->' +
				text(
					'sa000004',
					'button',
					'<span class="gb-shape"><svg aria-hidden="true"></svg></span><span>Go</span>',
					{ 'data-search-part': 'submit' }
				) +
				'<!-- /wp:thingamablocks/search -->'
		);

		await page.goto( url );

		const input = page.locator( '#my-input' );
		await expect( input ).toHaveAttribute( 'type', 'search' );
		await expect( input ).toHaveClass( /tmb-search__input/ );
		await expect( input ).toHaveClass( /gb-text-sa000003/ );
		await expect( input ).toHaveAttribute(
			'placeholder',
			'Cost $1 \\ bold & more'
		);
		await expect( input ).not.toHaveAttribute( 'aria-label', /./ );
		await expect( input ).toHaveAccessibleName( 'Find stuff' );

		// The heading became a <label>, kept on its own line.
		const label = page.locator( 'label[data-search-part="label"]' );
		await expect( label ).toHaveAttribute( 'for', 'my-input' );
		await expect( label ).toHaveClass( /tmb-search__label--block/ );

		// Nothing left over: the field holds just the input.
		expect(
			await page
				.locator( '[data-search-part="field"]' )
				.evaluate( ( field ) => field.innerHTML.trim() )
		).toMatch( /^<input [^>]*>$/ );

		// A button with text needs no extra name, and nothing internal leaks.
		const submit = page.locator( '[data-search-part="submit"]' );
		await expect( submit ).not.toHaveAttribute( 'aria-label', /./ );
		await expect( submit ).toHaveAttribute( 'type', 'submit' );
		expect( await page.content() ).not.toContain( 'data-search-label' );
	} );

	test( 'two expanding searches with the same field ID both work', async ( {
		page,
	} ) => {
		const markup = ( await buildSearch( page, 'expand' ) ).replace(
			'"data-search-part":"field"',
			'"id":"same-field","data-search-part":"field"'
		);
		const html = markup.replace(
			/(<div class="gb-element-[^"]+") data-search-part="field"/,
			'$1 id="same-field" data-search-part="field"'
		);
		const url = await testPage(
			page,
			'tmb-test-search-twice',
			html + '\n\n' + html
		);

		await page.goto( url, { waitUntil: 'networkidle' } );

		const second = page.locator( '.tmb-search' ).nth( 1 );
		await second.locator( '[data-search-part="toggle"]' ).click();
		await expect(
			second.locator( '[data-search-part="field"]' )
		).toBeVisible();
		await expect(
			page
				.locator( '.tmb-search' )
				.first()
				.locator( '[data-search-part="field"]' )
		).toBeHidden();
	} );

	test.describe( 'without JavaScript', () => {
		test.use( { javaScriptEnabled: false } );

		test( 'the expanding style shows the field and hides the toggle', async ( {
			page,
		} ) => {
			await page.goto( urls.expand );
			await expect(
				page.locator( '[data-search-part="field"]' )
			).toBeVisible();
			await expect(
				page.locator( '[data-search-part="toggle"]' )
			).toBeHidden();
		} );
	} );

	test( 'only the expanding style loads a script', async ( { page } ) => {
		const bar = await pluginAssets( page, urls.bar );
		expect(
			bar.files.filter( ( file ) => file.endsWith( '.js' ) )
		).toEqual( [] );

		const expand = await pluginAssets( page, urls.expand );
		expect( expand.files ).toContainEqual(
			expect.stringMatching( 'build/search/expand.js' )
		);
	} );

	test( 'no WCAG violations', async ( { page } ) => {
		for ( const url of [ urls.bar, urls.pages, urls.posts, urls.expand ] ) {
			await page.goto( url, { waitUntil: 'networkidle' } );
			await page.addScriptTag( { content: AXE } );

			const violations = await page.evaluate( async () => {
				const result = await window.axe.run( '.tmb-search', {
					runOnly: [ 'wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa' ],
				} );
				return result.violations.map(
					( violation ) =>
						`${ violation.id }: ${ violation.nodes
							.map( ( node ) => node.target.join( ' ' ) )
							.join( ', ' ) }`
				);
			} );

			expect( violations, url ).toEqual( [] );
		}
	} );
} );
