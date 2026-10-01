/**
 * Image masks: the "Mask" panel on the GenerateBlocks Image block.
 */
const { test, expect } = require( '@playwright/test' );
const {
	testImage,
	newPost,
	pluginAssets,
	invalidBlocks,
} = require( './utils' );

const fixture = ( name ) => require.resolve( `./fixtures/${ name }` );

// The SVG inside a mask-image value written by the panel.
const decode = ( value ) =>
	decodeURIComponent(
		( value.match( /data:image\/svg\+xml,([^"')]*)/ ) || [] )[ 1 ] || ''
	);

test.describe( 'Image mask', () => {
	test.describe.configure( { mode: 'serial' } );

	let postUrl;
	let postId;

	test( 'the panel writes the mask into GenerateBlocks styles, per breakpoint', async ( {
		page,
	} ) => {
		const dialogs = [];
		page.on( 'dialog', ( dialog ) => {
			dialogs.push( dialog.message() );
			dialog.dismiss();
		} );

		const image = await testImage( page );
		await newPost( page );

		// Two images: one plain, one linked (for the focus ring check).
		await page.evaluate( ( { id, url } ) => {
			const { createBlock } = window.wp.blocks;
			const attributes = {
				tagName: 'img',
				mediaId: id,
				htmlAttributes: {
					src: url,
					alt: 'Test photo',
					width: '400',
					height: '300',
				},
			};

			window.wp.data
				.dispatch( 'core/editor' )
				.editPost( { title: 'Test: mask', status: 'publish' } );
			window.wp.data.dispatch( 'core/block-editor' ).insertBlocks( [
				createBlock( 'generateblocks/media', attributes ),
				createBlock( 'generateblocks/media', {
					...attributes,
					linkHtmlAttributes: { href: '#linked' },
				} ),
			] );
		}, image );

		const blocks = await page.evaluate( () =>
			window.wp.data
				.select( 'core/block-editor' )
				.getBlocks()
				.map( ( block ) => block.clientId )
		);
		const select = ( clientId ) =>
			page.evaluate(
				( id ) =>
					window.wp.data
						.dispatch( 'core/block-editor' )
						.selectBlock( id ),
				clientId
			);
		const styles = ( clientId ) =>
			page.evaluate(
				( id ) =>
					window.wp.data
						.select( 'core/block-editor' )
						.getBlockAttributes( id ).styles,
				clientId
			);
		const css = ( clientId ) =>
			page.evaluate(
				( id ) =>
					window.wp.data
						.select( 'core/block-editor' )
						.getBlockAttributes( id ).css,
				clientId
			);
		const panel = page.locator( '.tmb-mask-panel' );

		// First image: a shape from the GenerateBlocks library.
		// The panel starts closed on an image without a mask.
		const openPanel = async () => {
			const toggle = page.getByRole( 'button', {
				name: 'Mask',
				exact: true,
			} );

			if ( 'true' !== ( await toggle.getAttribute( 'aria-expanded' ) ) ) {
				await toggle.click();
			}
		};

		await select( blocks[ 0 ] );
		await openPanel();
		await panel.getByRole( 'button', { name: 'Choose a shape' } ).click();

		const modal = page.getByRole( 'dialog', {
			name: 'Choose a mask shape',
		} );
		await expect(
			modal.locator( '.tmb-mask-library__shape' ).first()
		).toBeVisible();
		await modal.locator( '.tmb-mask-library__shape' ).first().click();
		await expect( modal ).toBeHidden();

		let current = await styles( blocks[ 0 ] );
		expect( current.maskImage ).toMatch( /^url\("data:image\/svg\+xml,/ );
		expect( current ).toMatchObject( {
			maskSize: 'contain',
			maskPosition: '50% 50%',
			maskRepeat: 'no-repeat',
		} );
		expect( await css( blocks[ 0 ] ) ).toContain( 'mask-image:url(' );

		// Replace it with an uploaded SVG full of things that must not survive.
		await panel.getByRole( 'button', { name: 'Replace shape' } ).click();
		await modal.getByRole( 'tab', { name: 'Upload or paste' } ).click();
		const chooser = page.waitForEvent( 'filechooser' );
		await modal
			.getByRole( 'button', { name: 'Choose an .svg file' } )
			.click();
		await ( await chooser ).setFiles( fixture( 'malicious.svg' ) );
		await expect( modal ).toBeHidden();

		const cleaned = decode( ( await styles( blocks[ 0 ] ) ).maskImage );
		expect( cleaned ).toContain( '<circle' );
		for ( const bad of [
			'script',
			'onload',
			'onclick',
			'foreignObject',
			'<image',
			'<style',
			'https:',
			'javascript:',
			'<a ',
			'style=',
		] ) {
			expect( cleaned, `cleaned SVG contains ${ bad }` ).not.toContain(
				bad
			);
		}

		// Then a real shape, flipped, on both images.
		for ( const clientId of blocks ) {
			await select( clientId );

			await openPanel();

			await panel
				.getByRole( 'button', { name: /Choose a shape|Replace shape/ } )
				.click();
			await modal.getByRole( 'tab', { name: 'Upload or paste' } ).click();
			await modal
				.getByLabel( 'Or paste SVG code' )
				.fill(
					require( 'node:fs' ).readFileSync(
						fixture( 'blob.svg' ),
						'utf8'
					)
				);
			await modal.getByRole( 'button', { name: 'Use this SVG' } ).click();
			await expect( modal ).toBeHidden();
		}

		await select( blocks[ 0 ] );
		await panel.getByRole( 'button', { name: 'Horizontally' } ).click();
		current = await styles( blocks[ 0 ] );
		expect( decode( current.maskImage ) ).toContain( 'tmb-flip-x' );
		await expect(
			panel.getByRole( 'button', { name: 'Horizontally' } )
		).toHaveAttribute( 'aria-pressed', 'true' );

		// Tablet: only what changes is written, under GB's tablet breakpoint.
		await page.evaluate( () =>
			window.wp.data.dispatch( 'core/editor' ).setDeviceType( 'Tablet' )
		);
		await expect( panel ).toContainText( 'Editing: Tablet' );
		await panel.getByRole( 'radio', { name: 'Cover' } ).click();

		current = await styles( blocks[ 0 ] );
		expect( current[ '@media (max-width:1024px)' ] ).toEqual( {
			maskSize: 'cover',
		} );
		expect( current.maskSize ).toBe( 'contain' );
		expect( await css( blocks[ 0 ] ) ).toMatch(
			/@media \(max-width:1024px\)\{\.gb-media-\w+\{mask-size:cover\}\}/
		);

		// Back on desktop, the desktop value is untouched.
		await page.evaluate( () =>
			window.wp.data.dispatch( 'core/editor' ).setDeviceType( 'Desktop' )
		);
		await expect(
			panel.getByRole( 'radio', { name: 'Contain' } )
		).toBeChecked();

		// Save and publish.
		await page.evaluate( () =>
			window.wp.data.dispatch( 'core/editor' ).savePost()
		);
		await page.waitForFunction(
			() =>
				! window.wp.data.select( 'core/editor' ).isSavingPost() &&
				window.wp.data.select( 'core/editor' ).getCurrentPost()
					.status === 'publish'
		);

		postUrl = await page.evaluate( () =>
			window.wp.data.select( 'core/editor' ).getPermalink()
		);
		postId = await page.evaluate( () =>
			window.wp.data.select( 'core/editor' ).getCurrentPostId()
		);

		expect( dialogs ).toEqual( [] );
	} );

	test( 'the front end shows the mask, with tablet overrides, and loads nothing from the plugin', async ( {
		page,
	} ) => {
		const { files, inline } = await pluginAssets(
			page,
			new URL( postUrl ).pathname
		);

		expect( files ).toEqual( [] );
		expect( inline ).toEqual( [] );

		const mask = () =>
			page
				.locator( 'img[alt="Test photo"]' )
				.first()
				.evaluate( ( element ) => {
					const style = getComputedStyle( element );
					return {
						image: style.maskImage,
						size: style.maskSize,
						repeat: style.maskRepeat,
					};
				} );

		await page.setViewportSize( { width: 1280, height: 800 } );
		let current = await mask();
		expect( current.image ).toContain( 'data:image/svg+xml' );
		expect( current.size ).toBe( 'contain' );
		expect( current.repeat ).toBe( 'no-repeat' );

		await page.setViewportSize( { width: 900, height: 800 } );
		current = await mask();
		expect( current.size ).toBe( 'cover' );
		expect( current.image ).toContain( 'data:image/svg+xml' );
	} );

	test( 'a linked masked image keeps a visible focus ring', async ( {
		page,
	} ) => {
		await page.goto( new URL( postUrl ).pathname, {
			waitUntil: 'networkidle',
		} );

		const link = page.locator( 'a[href="#linked"]' );
		await link.focus();

		// The mask is on the image; the focus outline is drawn by the link around it.
		const state = await link.evaluate( ( element ) => ( {
			focused:
				element.matches( ':focus-visible' ) ||
				element === document.activeElement,
			outline: getComputedStyle( element ).outlineStyle,
			linkMask: getComputedStyle( element ).maskImage,
			imageMask: getComputedStyle( element.querySelector( 'img' ) )
				.maskImage,
		} ) );

		expect( state.focused ).toBe( true );
		expect( state.outline ).not.toBe( 'none' );
		expect( state.linkMask ).toBe( 'none' );
		expect( state.imageMask ).toContain( 'data:image/svg+xml' );
	} );

	test( 'the saved post reopens with valid blocks and the panel shows the settings', async ( {
		page,
	} ) => {
		await page.goto( `/wp-admin/post.php?post=${ postId }&action=edit` );
		await page.waitForFunction(
			() =>
				window.wp?.data?.select( 'core/block-editor' )?.getBlocks()
					.length > 1,
			null,
			{ timeout: 60_000 }
		);
		await page.evaluate( () =>
			window.wp.data
				.dispatch( 'core/preferences' )
				.set( 'core/edit-post', 'welcomeGuide', false )
		);

		expect( await invalidBlocks( page ) ).toEqual( [] );

		await page.evaluate( () => {
			const [ first ] = window.wp.data
				.select( 'core/block-editor' )
				.getBlocks();
			window.wp.data
				.dispatch( 'core/edit-post' )
				.openGeneralSidebar( 'edit-post/block' );
			window.wp.data
				.dispatch( 'core/block-editor' )
				.selectBlock( first.clientId );
		} );

		const panel = page.locator( '.tmb-mask-panel' );
		await expect(
			panel.getByRole( 'button', { name: 'Replace shape' } )
		).toBeVisible();
		await expect(
			panel.getByRole( 'button', { name: 'Horizontally' } )
		).toHaveAttribute( 'aria-pressed', 'true' );
	} );
} );
