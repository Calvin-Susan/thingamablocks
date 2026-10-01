/**
 * Nothing from the plugin loads on pages that don't use it, and only the
 * front-end files load on pages that do.
 */
const { test, expect } = require( '@playwright/test' );
const { DEMO, testPage, pluginAssets } = require( './utils' );

test.describe( 'Asset loading', () => {
	test( 'pages without the blocks load nothing from the plugin', async ( {
		page,
	} ) => {
		const plain = await testPage(
			page,
			'tmb-test-plain',
			'<!-- wp:paragraph --><p>Just a paragraph.</p><!-- /wp:paragraph -->'
		);

		for ( const url of [ '/', '/sample-page/', plain ] ) {
			const { files, inline } = await pluginAssets( page, url );

			expect( files, `files on ${ url }` ).toEqual( [] );
			expect( inline, `inline styles/scripts on ${ url }` ).toEqual( [] );
		}
	} );

	test( 'the demo page loads each block’s front-end files and nothing else', async ( {
		page,
	} ) => {
		const { files, inline } = await pluginAssets( page, DEMO );

		for ( const block of [ 'toggle', 'countdown', 'marquee' ] ) {
			expect( files ).toContainEqual(
				expect.stringMatching( `build/${ block }/view.js` )
			);
		}

		// Small stylesheets are inlined by WordPress, larger ones linked.
		expect(
			files.some( ( file ) =>
				file.includes( 'build/toggle/style-index' )
			) ||
				inline.includes( 'thingamablocks-toggle-view-style-inline-css' )
		).toBeTruthy();

		// Editor files never load on the front end.
		expect(
			files.filter( ( file ) =>
				/\/(index|editor)\.(js|css)$/.test( file )
			)
		).toEqual( [] );
	} );

	test( 'animation CSS and script load only on pages with an animated block', async ( {
		page,
	} ) => {
		const url = await testPage(
			page,
			'tmb-test-animated',
			'<!-- wp:generateblocks/element {"uniqueId":"a1a1a1a1","tagName":"div","htmlAttributes":{"data-tmb-animate":"fade-up"}} --><div class="gb-element-a1a1a1a1" data-tmb-animate="fade-up">Hello</div><!-- /wp:generateblocks/element -->'
		);

		const animated = await pluginAssets( page, url );
		expect( animated.files ).toContainEqual(
			expect.stringMatching( 'build/animations/view.js' )
		);
		await expect( page.locator( 'head #tmb-animate-css' ) ).toHaveCount(
			1
		);

		const demo = await pluginAssets( page, DEMO );
		expect(
			demo.files.filter( ( file ) => file.includes( 'animations' ) )
		).toEqual( [] );
		expect( demo.inline ).not.toContain( 'tmb-animate-css' );
	} );
} );
