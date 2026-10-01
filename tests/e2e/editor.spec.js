/**
 * The editor: blocks and patterns load as valid blocks.
 *
 * The demo page is created by the Playground blueprint without a logged-in
 * user, so WordPress's content filter (kses) runs on it just as it does for
 * Authors and Contributors. If the filter strips an attribute the blocks
 * save, the blocks come back "invalid" here.
 */
const { test, expect } = require( '@playwright/test' );
const { DEMO, openEditor, invalidBlocks } = require( './utils' );

test.describe( 'Editor', () => {
	test( 'the demo page has no invalid blocks', async ( { page } ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );

		await page.goto( DEMO );
		const postId = await page.evaluate(
			() => document.body.className.match( /page-id-(\d+)/ )?.[ 1 ]
		);

		await openEditor( page, postId );
		await page.waitForTimeout( 2000 );

		expect( await invalidBlocks( page ) ).toEqual( [] );
		expect( errors ).toEqual( [] );
	} );

	test( 'every pattern is registered and parses as valid blocks', async ( {
		page,
	} ) => {
		await page.goto( '/wp-admin/post-new.php?post_type=page' );
		await page.waitForFunction(
			() => window.wp?.blocks && window.wp?.data,
			null,
			{ timeout: 60_000 }
		);

		const patterns = await page.evaluate( async () =>
			( await window.wp.data.resolveSelect( 'core' ).getBlockPatterns() )
				.filter( ( pattern ) =>
					pattern.name.startsWith( 'thingamablocks/' )
				)
				.map( ( { name, content } ) => ( { name, content } ) )
		);

		expect( patterns.map( ( pattern ) => pattern.name ).sort() ).toEqual( [
			'thingamablocks/downloads-dropdown',
			'thingamablocks/launch-countdown',
			'thingamablocks/logo-marquee',
			'thingamablocks/pricing-toggle',
			'thingamablocks/sale-banner',
		] );

		for ( const pattern of patterns ) {
			expect(
				await invalidBlocks( page, pattern.content ),
				pattern.name
			).toEqual( [] );
		}
	} );

	test( 'each block can be inserted from the inserter', async ( {
		page,
	} ) => {
		await page.goto( '/wp-admin/post-new.php' );
		await page.waitForFunction(
			() => window.wp?.blocks && window.wp?.data,
			null,
			{ timeout: 60_000 }
		);

		const names = await page.evaluate( () =>
			window.wp.blocks
				.getBlockTypes()
				.filter( ( type ) => type.name.startsWith( 'thingamablocks/' ) )
				.map( ( type ) => type.name )
				.sort()
		);

		expect( names ).toEqual( [
			'thingamablocks/countdown',
			'thingamablocks/dropdown',
			'thingamablocks/marquee',
			'thingamablocks/toggle',
		] );

		// Insert each block's default layout and check it's valid.
		const invalid = await page.evaluate( ( blockNames ) => {
			const { createBlock, getBlockVariations } = window.wp.blocks;
			const { createBlocksFromInnerBlocksTemplate } = window.wp.blocks;
			const bad = [];

			blockNames.forEach( ( name ) => {
				const variation =
					getBlockVariations( name, 'block' ).find(
						( item ) => item.isDefault
					) || getBlockVariations( name, 'block' )[ 0 ];
				const block = createBlock(
					name,
					variation?.attributes,
					createBlocksFromInnerBlocksTemplate(
						variation?.innerBlocks || []
					)
				);
				const markup = window.wp.blocks.serialize( [ block ] );
				const walk = ( blocks ) =>
					blocks.forEach( ( item ) => {
						if ( ! item.isValid ) {
							bad.push( `${ name }: ${ item.name }` );
						}
						walk( item.innerBlocks );
					} );

				walk( window.wp.blocks.parse( markup ) );
			} );

			return bad;
		}, names );

		expect( invalid ).toEqual( [] );
	} );
} );
