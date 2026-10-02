/**
 * Video backgrounds on GenerateBlocks Elements. Bunny and Vimeo are faked
 * in the browser: requests to the test Bunny host get a tiny recorded
 * video (fixtures/background.webm), and Vimeo's player address gets a
 * stand-in page that answers Vimeo's postMessage API.
 */
const { readFileSync } = require( 'node:fs' );
const { test, expect } = require( '@playwright/test' );
const { testPage, testImage, newPost, pluginAssets } = require( './utils' );

const AXE = readFileSync( require.resolve( 'axe-core/axe.min.js' ), 'utf8' );
const VIDEO = readFileSync( require.resolve( './fixtures/background.webm' ) );
const BUNNY = 'https://vz-test.b-cdn.net/abc/play_720p.mp4';
const BUNNY_PHONE = 'https://vz-test.b-cdn.net/abc/play_480p.mp4';

// Vimeo's player, faked like the real one: it autoplays, says it's ready,
// answers getPaused, and doesn't announce "play" for a video already playing.
const VIMEO_STUB = `<!doctype html><script>
const tell = ( data ) => parent.postMessage( JSON.stringify( data ), '*' );
addEventListener( 'message', ( event ) => {
	const data = JSON.parse( event.data );
	tell( { event: 'log', data } );
	if ( 'getPaused' === data.method ) tell( { method: 'getPaused', value: false } );
} );
tell( { event: 'ready' } );
</script>`;

/**
 * Fake Bunny and Vimeo for this page.
 *
 * @param {import('@playwright/test').Page} page Page.
 */
async function fakeHosts( page ) {
	await page.route( 'https://vz-test.b-cdn.net/**', ( route ) =>
		route.fulfill( { body: VIDEO, contentType: 'video/webm' } )
	);
	await page.route( 'https://video.example-bunny.com/**', ( route ) =>
		route.fulfill( { body: VIDEO, contentType: 'video/webm' } )
	);
	await page.route( 'https://player.vimeo.com/video/**', ( route ) =>
		route.fulfill( { body: VIMEO_STUB, contentType: 'text/html' } )
	);
}

/**
 * A GB Element with a video background, as GenerateBlocks saves it.
 *
 * @param {Object} settings Video settings.
 * @param {string} inner    Content inside.
 * @param {string} id       Unique ID.
 * @return {string} Block markup.
 */
function section( settings, inner = '', id = 'f1f1f1f1' ) {
	const json = JSON.stringify( settings );
	const attribute = json
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /</g, '&lt;' );

	return `<!-- wp:generateblocks/element ${ JSON.stringify( {
		uniqueId: id,
		tagName: 'section',
		styles: { minHeight: '360px', color: '#ffffff' },
		css: `.gb-element-${ id }{color:#ffffff;min-height:360px}`,
		htmlAttributes: { 'data-tmb-video': json },
	} ) } --><section class="gb-element-${ id }" data-tmb-video="${ attribute }"><!-- wp:paragraph --><p>Text over the video</p><!-- /wp:paragraph -->${ inner }</section><!-- /wp:generateblocks/element -->`;
}

const video = ( page ) => page.locator( '.tmb-video-bg__video' ).first();
const button = ( page ) =>
	page.getByRole( 'button', { name: /background video/ } ).first();
const isPlaying = ( page ) =>
	video( page ).evaluate(
		( element ) => ! element.paused && element.currentTime > 0
	);

test.describe( 'Video background', () => {
	test.describe.configure( { mode: 'serial' } );

	const urls = {};
	let poster;

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();
		poster = await testImage( page );

		urls.bunny = await testPage(
			page,
			'tmb-test-video',
			section( {
				src: BUNNY,
				mobile: BUNNY_PHONE,
				poster: poster.id,
				overlay: '#000000',
				opacity: 50,
				speed: 0.75,
			} )
		);
		urls.once = await testPage(
			page,
			'tmb-test-video-once',
			section( {
				src: BUNNY,
				poster: poster.id,
				loop: false,
				end: 'poster',
			} )
		);
		urls.phones = await testPage(
			page,
			'tmb-test-video-phones',
			section( {
				src: BUNNY,
				poster: poster.id,
				phones: 'poster',
				hero: true,
			} )
		);
		urls.vimeo = await testPage(
			page,
			'tmb-test-video-vimeo',
			section( {
				src: 'https://vimeo.com/76979871/abc123',
				poster: poster.id,
			} )
		);
		urls.below = await testPage(
			page,
			'tmb-test-video-below',
			'<!-- wp:spacer {"height":"2500px"} --><div style="height:2500px" aria-hidden="true" class="wp-block-spacer"></div><!-- /wp:spacer -->' +
				section( { src: BUNNY, poster: poster.id } )
		);
		urls.custom = await testPage(
			page,
			'tmb-test-video-custom',
			section(
				{ src: BUNNY, poster: poster.id },
				'<!-- wp:generateblocks/text {"uniqueId":"f2f2f2f2","tagName":"button","htmlAttributes":{"data-video-part":"button"}} --><button class="gb-text gb-text-f2f2f2f2" data-video-part="button">Pause</button><!-- /wp:generateblocks/text -->'
			)
		);
		urls.forged = await testPage(
			page,
			'tmb-test-video-forged',
			section( {
				src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				poster: poster.id,
			} ) +
				section(
					{ src: 'https://evil.example.com/a.mp4' },
					'',
					'f3f3f3f3'
				) +
				section(
					{ src: 'javascript:alert(1)//.mp4' },
					'',
					'f4f4f4f4'
				) +
				section(
					{
						src: BUNNY,
						overlay:
							'red;background-image:url(https://evil.example.com/x)',
						focus: '1%;x',
						button: '"><script>',
						speed: 99,
					},
					'',
					'f5f5f5f5'
				)
		);
		urls.host = await testPage(
			page,
			'tmb-test-video-host',
			section( {
				src: 'https://video.example-bunny.com/a/play_720p.mp4',
			} )
		);

		await page.close();
	} );

	test.afterEach( async ( { page } ) => {
		await page
			.evaluate( () => localStorage.removeItem( 'tmb-video-paused' ) )
			.catch( () => {} );
	} );

	test( 'the server renders the poster, overlay and a hidden button; no <video> yet', async ( {
		page,
	} ) => {
		await page.route( '**/build/video/view.js*', ( route ) =>
			route.abort()
		);
		await page.goto( urls.bunny );

		const layer = page.locator( '[data-tmb-video-layer]' );
		await expect( layer ).toHaveAttribute( 'aria-hidden', 'true' );
		await expect(
			layer.locator( 'img.tmb-video-bg__poster' )
		).toHaveAttribute( 'alt', '' );
		await expect(
			layer.locator( 'img.tmb-video-bg__poster' )
		).toHaveAttribute( 'loading', 'lazy' );
		await expect(
			layer.locator( '.tmb-video-bg__overlay' )
		).toHaveAttribute( 'style', /background-color:#000000;opacity:0\.5/ );
		await expect( page.locator( 'video' ) ).toHaveCount( 0 );

		// Without the script there's nothing to pause, so no button.
		await expect( page.locator( '.tmb-video-bg__button' ) ).toBeHidden();
		await expect( page.locator( 'section.tmb-has-video' ) ).toHaveCSS(
			'position',
			'relative'
		);
	} );

	test( 'plays muted, inline and at its speed once the page has loaded, with a pause button', async ( {
		page,
	} ) => {
		await fakeHosts( page );
		await page.goto( urls.bunny, { waitUntil: 'load' } );

		await expect.poll( () => isPlaying( page ) ).toBe( true );

		const state = await video( page ).evaluate( ( element ) => ( {
			src: element.currentSrc,
			muted: element.muted,
			inline: element.playsInline,
			loop: element.loop,
			controls: element.controls,
			rate: element.playbackRate,
			tabindex: element.getAttribute( 'tabindex' ),
		} ) );

		expect( state ).toEqual( {
			src: 'https://vz-test.b-cdn.net/abc/play_720p.mp4',
			muted: true,
			inline: true,
			loop: true,
			controls: false,
			rate: 0.75,
			tabindex: '-1',
		} );

		await expect( page.locator( '.tmb-video-bg' ) ).toHaveClass(
			/is-playing/
		);
		await expect( button( page ) ).toHaveAccessibleName(
			'Pause background video'
		);
		await expect( button( page ) ).toHaveAttribute( 'type', 'button' );
	} );

	test( 'pausing is remembered, across pages', async ( { page } ) => {
		await fakeHosts( page );
		await page.goto( urls.bunny, { waitUntil: 'load' } );
		await expect.poll( () => isPlaying( page ) ).toBe( true );

		await button( page ).click();
		await expect( button( page ) ).toHaveAccessibleName(
			'Play background video'
		);
		expect(
			await video( page ).evaluate( ( element ) => element.paused )
		).toBe( true );

		// Another page with a background video: starts paused, never loads it.
		await page.goto( urls.once, { waitUntil: 'load' } );
		await page.waitForTimeout( 500 );
		await expect( page.locator( 'video' ) ).toHaveCount( 0 );
		await expect( button( page ) ).toHaveAccessibleName(
			'Play background video'
		);

		// Playing it again clears the choice.
		await button( page ).click();
		await expect.poll( () => isPlaying( page ) ).toBe( true );
		expect(
			await page.evaluate( () =>
				localStorage.getItem( 'tmb-video-paused' )
			)
		).toBeNull();
	} );

	test( 'your own GB button replaces the default one', async ( { page } ) => {
		await fakeHosts( page );
		await page.goto( urls.custom, { waitUntil: 'load' } );

		await expect( page.locator( '.tmb-video-bg__button' ) ).toHaveCount(
			0
		);
		const own = page.locator( '[data-video-part="button"]' );
		await expect( own ).toBeVisible();
		await expect( own ).toHaveAttribute( 'type', 'button' );
		await expect( own ).toHaveAttribute( 'data-state', 'playing' );

		// It has its own text, so that stays its name; it says it's pressed instead.
		await expect( own ).toHaveAccessibleName( 'Pause' );
		await expect( own ).toHaveAttribute( 'aria-pressed', 'false' );

		await own.click();
		await expect( own ).toHaveAttribute( 'data-state', 'paused' );
		await expect( own ).toHaveAttribute( 'aria-pressed', 'true' );
	} );

	test( 'only loads when it’s on screen, and pauses when it isn’t', async ( {
		page,
	} ) => {
		await fakeHosts( page );
		await page.goto( urls.below, { waitUntil: 'load' } );
		await page.waitForTimeout( 500 );
		await expect( page.locator( 'video' ) ).toHaveCount( 0 );

		await page.locator( 'section.tmb-has-video' ).scrollIntoViewIfNeeded();
		await expect.poll( () => isPlaying( page ) ).toBe( true );

		await page.evaluate( () => window.scrollTo( 0, 0 ) );
		await expect
			.poll( () =>
				video( page ).evaluate( ( element ) => element.paused )
			)
			.toBe( true );
		// Paused because it's off screen, not by the visitor: the button still says Pause.
		await expect( button( page ) ).toHaveAccessibleName(
			'Pause background video'
		);
	} );

	test( 'play once can end on the poster; Play starts it again', async ( {
		page,
	} ) => {
		await fakeHosts( page );
		await page.goto( urls.once, { waitUntil: 'load' } );

		await expect( video( page ) ).toHaveJSProperty( 'loop', false );
		await expect( button( page ) ).toHaveAccessibleName(
			'Play background video',
			{
				timeout: 15000,
			}
		);
		await expect( page.locator( '.tmb-video-bg' ) ).not.toHaveClass(
			/is-playing/
		);

		await button( page ).click();
		await expect.poll( () => isPlaying( page ) ).toBe( true );
	} );

	test.describe( 'on a phone', () => {
		test.use( { viewport: { width: 375, height: 700 } } );

		test( 'plays the smaller phone video', async ( { page } ) => {
			await fakeHosts( page );
			await page.goto( urls.bunny, { waitUntil: 'load' } );
			await expect
				.poll( () =>
					video( page ).evaluate( ( element ) => element.currentSrc )
				)
				.toBe( BUNNY_PHONE );
		} );

		test( '“poster only on phones” loads no video and shows no button', async ( {
			page,
		} ) => {
			await fakeHosts( page );
			await page.goto( urls.phones, { waitUntil: 'load' } );
			await page.waitForTimeout( 500 );
			await expect( page.locator( 'video' ) ).toHaveCount( 0 );
			await expect(
				page.locator( '.tmb-video-bg__button' )
			).toBeHidden();

			// "First thing on the page": the poster loads straight away, first.
			const img = page.locator( 'img.tmb-video-bg__poster' );
			await expect( img ).not.toHaveAttribute( 'loading', /./ );
			await expect( img ).toHaveAttribute( 'fetchpriority', 'high' );
		} );
	} );

	test.describe( 'with reduced motion', () => {
		test.use( { reducedMotion: 'reduce' } );

		test( 'shows the poster and offers Play', async ( { page } ) => {
			await fakeHosts( page );
			await page.goto( urls.bunny, { waitUntil: 'load' } );
			await page.waitForTimeout( 500 );
			await expect( page.locator( 'video' ) ).toHaveCount( 0 );
			await expect( button( page ) ).toHaveAccessibleName(
				'Play background video'
			);

			await button( page ).click();
			await expect.poll( () => isPlaying( page ) ).toBe( true );
		} );
	} );

	test( 'with Data Saver on, shows the poster and offers Play', async ( {
		page,
	} ) => {
		await page.addInitScript( () =>
			Object.defineProperty( navigator, 'connection', {
				value: { saveData: true, effectiveType: '4g' },
			} )
		);
		await fakeHosts( page );
		await page.goto( urls.bunny, { waitUntil: 'load' } );
		await page.waitForTimeout( 500 );
		await expect( page.locator( 'video' ) ).toHaveCount( 0 );
		await expect( button( page ) ).toHaveAccessibleName(
			'Play background video'
		);
	} );

	test( 'Vimeo: its background player, no tracking, controlled by the button', async ( {
		page,
	} ) => {
		await fakeHosts( page );
		const commands = [];
		await page.exposeFunction( 'tmbLog', ( data ) =>
			commands.push( data )
		);
		await page.addInitScript( () =>
			window.addEventListener( 'message', ( event ) => {
				try {
					const data = JSON.parse( event.data );
					if ( 'log' === data.event ) {
						window.tmbLog( data.data.method );
					}
				} catch {}
			} )
		);
		await page.goto( urls.vimeo, { waitUntil: 'load' } );

		const iframe = page.locator( 'iframe.tmb-video-bg__iframe' );
		await expect( iframe ).toHaveAttribute(
			'src',
			'https://player.vimeo.com/video/76979871?background=1&autoplay=1&muted=1&loop=1&autopause=0&dnt=1&h=abc123'
		);
		await expect( iframe ).toHaveAttribute( 'tabindex', '-1' );
		await expect( iframe ).toHaveAttribute( 'title', 'Background video' );
		await expect( page.locator( '.tmb-video-bg' ) ).toHaveClass(
			/is-playing/
		);

		await button( page ).click();
		await expect.poll( () => commands ).toContain( 'pause' );

		// Scaled to cover the section (16:9 into a wider, shorter box).
		const sizes = await page.evaluate( () => {
			const box = document
				.querySelector( '.tmb-video-bg' )
				.getBoundingClientRect();
			const frame = document
				.querySelector( 'iframe' )
				.getBoundingClientRect();
			return frame.width >= box.width && frame.height >= box.height;
		} );
		expect( sizes ).toBe( true );
	} );

	test( 'nested containers each keep their own button', async ( {
		page,
	} ) => {
		await fakeHosts( page );
		const inner = section(
			{ src: BUNNY },
			'<!-- wp:generateblocks/text {"uniqueId":"f7f7f7f7","tagName":"button","htmlAttributes":{"data-video-part":"button"}} --><button class="gb-text gb-text-f7f7f7f7" data-video-part="button">Inner pause</button><!-- /wp:generateblocks/text -->',
			'f8f8f8f8'
		);
		const url = await testPage(
			page,
			'tmb-test-video-nested',
			section( { src: BUNNY }, inner, 'f9f9f9f9' )
		);

		await page.goto( url, { waitUntil: 'load' } );

		const outer = page.locator( '.gb-element-f9f9f9f9' );
		// The outer one gets the default button: the inner's button isn't its.
		await expect(
			outer.locator( ':scope > .tmb-video-bg__button' )
		).toBeVisible();
		await expect(
			page.locator( '.gb-element-f8f8f8f8 > .tmb-video-bg__button' )
		).toHaveCount( 0 );
		await expect(
			page.getByRole( 'button', { name: 'Inner pause' } )
		).toBeVisible();

		// The layers go last: the first child is still the content.
		expect(
			await outer.evaluate(
				( element ) => element.firstElementChild.tagName
			)
		).toBe( 'P' );
	} );

	test( 'scrolling straight past doesn’t leave it stuck paused', async ( {
		page,
	} ) => {
		await fakeHosts( page );
		await page.goto( urls.below, { waitUntil: 'load' } );

		for ( let i = 0; i < 4; i++ ) {
			await page.evaluate( () =>
				window.scrollTo( 0, document.body.scrollHeight )
			);
			await page.evaluate( () => window.scrollTo( 0, 0 ) );
		}

		await page.locator( 'section.tmb-has-video' ).scrollIntoViewIfNeeded();
		await expect.poll( () => isPlaying( page ) ).toBe( true );
		await expect( button( page ) ).toHaveAccessibleName(
			'Pause background video'
		);
	} );

	test( 'the layout is right before the stylesheet loads (no jump)', async ( {
		page,
	} ) => {
		await page.route( '**/build/video/view.css*', ( route ) =>
			route.abort()
		);
		await page.goto( urls.bunny );

		const box = await page.locator( 'section.tmb-has-video' ).boundingBox();
		const image = await page
			.locator( 'img.tmb-video-bg__poster' )
			.boundingBox();

		expect( Math.round( image.width ) ).toBe( Math.round( box.width ) );
		expect( Math.round( image.height ) ).toBe( Math.round( box.height ) );
	} );

	test( 'the stylesheet is in <head> on a page with a video background', async ( {
		page,
	} ) => {
		await page.goto( urls.bunny );
		await expect(
			page.locator( 'head link[href*="build/video/view.css"]' )
		).toHaveCount( 1 );
	} );

	test( 'URLs with "&" survive WordPress’s content filter', async ( {
		page,
	} ) => {
		await fakeHosts( page );
		// What an Author's save used to leave: "&" turned into "&amp;".
		const url = await testPage(
			page,
			'tmb-test-video-amp',
			section( { src: `${ BUNNY }?token=abc&amp;expires=123` } )
		);

		await page.goto( url, { waitUntil: 'load' } );
		await expect
			.poll( () =>
				video( page ).evaluate( ( element ) => element.currentSrc )
			)
			.toBe( `${ BUNNY }?token=abc&expires=123` );
	} );

	test( 'a video typed into a Custom HTML block is ignored', async ( {
		page,
	} ) => {
		const requests = [];
		page.on( 'request', ( request ) => requests.push( request.url() ) );
		await fakeHosts( page );

		const forged = JSON.stringify( {
			src: { type: 'file', src: 'https://tracker.example.com/x.mp4' },
		} ).replace( /"/g, '&quot;' );
		const url = await testPage(
			page,
			'tmb-test-video-html',
			`<!-- wp:html --><div class="tmb-has-video" data-tmb-video="${ forged }" style="height:200px"><div data-tmb-video-layer></div></div><!-- /wp:html -->` +
				section( { src: BUNNY } )
		);

		await page.goto( url, { waitUntil: 'load' } );
		await page.locator( 'section.tmb-has-video' ).scrollIntoViewIfNeeded();
		await expect.poll( () => isPlaying( page ) ).toBe( true );
		await page.waitForTimeout( 500 );

		await expect( page.locator( 'video' ) ).toHaveCount( 1 );
		expect(
			requests.filter( ( item ) => item.includes( 'tracker' ) )
		).toEqual( [] );
	} );

	test( 'only Bunny and Vimeo are allowed; forged settings are cleaned', async ( {
		page,
	} ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );
		const requests = [];
		page.on( 'request', ( request ) => requests.push( request.url() ) );
		await fakeHosts( page );

		await page.goto( urls.forged, { waitUntil: 'load' } );
		await page.waitForTimeout( 800 );

		// YouTube, another host and javascript: get no background at all.
		for ( const id of [ 'f1f1f1f1', 'f3f3f3f3', 'f4f4f4f4' ] ) {
			const element = page.locator( `.gb-element-${ id }` );
			await expect( element ).not.toHaveAttribute(
				'data-tmb-video',
				/./
			);
			await expect( element.locator( '.tmb-video-bg' ) ).toHaveCount( 0 );
		}

		// The Bunny one works, with its bad settings replaced by safe ones.
		const good = page.locator( '.gb-element-f5f5f5f5' );
		const config = JSON.parse(
			await good.getAttribute( 'data-tmb-video' )
		);
		expect( config.speed ).toBe( 1 );
		await expect( good.locator( '.tmb-video-bg__overlay' ) ).toHaveCount(
			0
		);
		await expect( good.locator( '.tmb-video-bg' ) ).toHaveAttribute(
			'style',
			/--tmb-video-focus:50% 50%;$/
		);
		await expect( good.locator( '.tmb-video-bg__button' ) ).toHaveAttribute(
			'data-position',
			'bottom-right'
		);

		expect(
			requests.filter( ( url ) => /evil|youtube/.test( url ) )
		).toEqual( [] );
		expect( errors ).toEqual( [] );
	} );

	test( 'a Bunny hostname added in Settings is allowed', async ( {
		page,
	} ) => {
		await page.goto( urls.host );
		await expect( page.locator( '.tmb-video-bg' ) ).toHaveCount( 0 );

		await page.goto( '/wp-admin/options-general.php?page=thingamablocks' );
		await page
			.getByLabel( 'Your own Bunny hostnames' )
			.fill( 'https://video.example-bunny.com/some/path\nnot a host!' );
		await page.getByRole( 'button', { name: 'Save Changes' } ).click();
		await expect(
			page.getByLabel( 'Your own Bunny hostnames' )
		).toHaveValue( 'video.example-bunny.com' );

		await fakeHosts( page );
		await page.goto( urls.host, { waitUntil: 'load' } );
		await expect.poll( () => isPlaying( page ) ).toBe( true );

		// Tidy up.
		await page.goto( '/wp-admin/options-general.php?page=thingamablocks' );
		await page.getByLabel( 'Your own Bunny hostnames' ).fill( '' );
		await page.getByRole( 'button', { name: 'Save Changes' } ).click();
	} );

	test( 'scripts and styles load only on pages with a video background', async ( {
		page,
	} ) => {
		const plain = await testPage(
			page,
			'tmb-test-video-none',
			'<!-- wp:generateblocks/element {"uniqueId":"f6f6f6f6","tagName":"section"} --><section class="gb-element-f6f6f6f6"><!-- wp:paragraph --><p>No video</p><!-- /wp:paragraph --></section><!-- /wp:generateblocks/element -->'
		);

		const none = await pluginAssets( page, plain );
		expect(
			none.files.filter( ( file ) => file.includes( 'video' ) )
		).toEqual( [] );

		await fakeHosts( page );
		const some = await pluginAssets( page, urls.bunny );
		expect( some.files ).toContainEqual(
			expect.stringMatching( 'build/video/view.js' )
		);
		expect( some.files ).toContainEqual(
			expect.stringMatching( 'build/video/view.css' )
		);
	} );

	test( 'no WCAG violations', async ( { page } ) => {
		await fakeHosts( page );

		for ( const url of [ urls.bunny, urls.vimeo, urls.custom ] ) {
			await page.goto( url, { waitUntil: 'load' } );
			await page.waitForTimeout( 800 );
			await page.addScriptTag( { content: AXE } );

			const violations = await page.evaluate( async () => {
				const result = await window.axe.run( '.tmb-has-video', {
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

	test( 'the overlay picker offers GB Pro design tokens', async ( {
		page,
	} ) => {
		// GB Pro isn't installed here: stand in for the tokens it gives the editor.
		await page.addInitScript( () => {
			window.gbDesignTokens = {
				tokens: [
					{
						name: '--brand-ink',
						type: 'color',
						label: 'Brand ink',
						category: 'Palette',
						scope: [ 'color', 'backgroundColor' ],
						value: '#111111',
					},
					{
						name: '--brand-text-only',
						type: 'color',
						label: 'Text only',
						category: 'Palette',
						scope: [ 'color' ],
						value: '#222222',
					},
					{
						name: '--brand-space',
						type: 'unit',
						label: 'Space',
						scope: [ 'paddingTop' ],
						value: '1rem',
					},
				],
			};
		} );
		await newPost( page );

		const clientId = await page.evaluate( ( src ) => {
			const block = window.wp.blocks.createBlock(
				'generateblocks/element',
				{
					tagName: 'section',
					htmlAttributes: {
						'data-tmb-video': JSON.stringify( { src } ),
					},
				}
			);
			window.wp.data
				.dispatch( 'core/block-editor' )
				.insertBlocks( block );
			window.wp.data
				.dispatch( 'core/block-editor' )
				.selectBlock( block.clientId );
			return block.clientId;
		}, BUNNY );

		const panel = page.locator( '.tmb-video-panel' );
		await expect( panel ).toBeVisible();

		// Only colour tokens that apply to backgrounds, under their category.
		await expect( panel ).toContainText( 'Palette' );
		await expect(
			panel.getByRole( 'option', { name: /Brand ink/ } )
		).toBeVisible();
		await expect(
			panel.getByRole( 'option', { name: /Text only/ } )
		).toHaveCount( 0 );

		await panel.getByRole( 'option', { name: /Brand ink/ } ).click();

		const stored = await page.evaluate(
			( id ) =>
				JSON.parse(
					window.wp.data
						.select( 'core/block-editor' )
						.getBlockAttributes( id ).htmlAttributes[
						'data-tmb-video'
					]
				),
			clientId
		);
		expect( stored.overlay ).toBe( 'var(--brand-ink)' );
	} );

	test( 'the editor panel writes the settings and previews the poster', async ( {
		page,
	} ) => {
		await newPost( page );
		const clientId = await page.evaluate( () => {
			const block = window.wp.blocks.createBlock(
				'generateblocks/element',
				{
					tagName: 'section',
				}
			);
			window.wp.data
				.dispatch( 'core/block-editor' )
				.insertBlocks( block );
			window.wp.data
				.dispatch( 'core/block-editor' )
				.selectBlock( block.clientId );
			return block.clientId;
		} );

		const panel = page.locator( '.tmb-video-panel' );
		await panel.getByRole( 'button', { name: 'Video background' } ).click();

		const field = panel.getByLabel( 'Video address' );
		await field.fill( 'https://www.youtube.com/watch?v=x' );
		await expect( panel ).toContainText( 'YouTube isn’t supported' );
		await field.fill(
			'https://iframe.mediadelivery.net/play/123456/8f7e6d5c-1a2b-4c3d-9e8f-0a1b2c3d4e5f'
		);
		await expect( panel ).toContainText(
			'https://YOUR-CDN-HOSTNAME.b-cdn.net/8f7e6d5c-1a2b-4c3d-9e8f-0a1b2c3d4e5f/play_720p.mp4'
		);
		await field.fill( 'https://vz-x.b-cdn.net/a/playlist.m3u8' );
		await expect( panel ).toContainText( 'HLS streams' );
		await field.fill( BUNNY );
		await expect( panel ).toContainText(
			'Video file: plays straight in the page'
		);
		await expect( panel ).toContainText( 'Add a poster image' );

		await panel.getByRole( 'radio', { name: 'Play once' } ).click();
		await panel.getByRole( 'radio', { name: 'Back to poster' } ).click();

		const stored = await page.evaluate(
			( id ) =>
				JSON.parse(
					window.wp.data
						.select( 'core/block-editor' )
						.getBlockAttributes( id ).htmlAttributes[
						'data-tmb-video'
					]
				),
			clientId
		);
		expect( stored ).toEqual( { src: BUNNY, loop: false, end: 'poster' } );

		// "&" is stored escaped, so WordPress's content filter can't change it.
		await field.fill( `${ BUNNY }?a=1&b=2` );
		const raw = await page.evaluate(
			( id ) =>
				window.wp.data
					.select( 'core/block-editor' )
					.getBlockAttributes( id ).htmlAttributes[
					'data-tmb-video'
				],
			clientId
		);
		expect( raw ).not.toContain( '&' );
		expect( JSON.parse( raw ).src ).toBe( `${ BUNNY }?a=1&b=2` );
		await field.fill( BUNNY );

		// The poster shows as the section's background in the editor.
		await page.evaluate(
			( [ id, posterId ] ) => {
				const attributes = window.wp.data
					.select( 'core/block-editor' )
					.getBlockAttributes( id );
				const settings = JSON.parse(
					attributes.htmlAttributes[ 'data-tmb-video' ]
				);
				window.wp.data
					.dispatch( 'core/block-editor' )
					.updateBlockAttributes( id, {
						htmlAttributes: {
							...attributes.htmlAttributes,
							'data-tmb-video': JSON.stringify( {
								...settings,
								poster: posterId,
							} ),
						},
					} );
			},
			[ clientId, poster.id ]
		);

		const canvas = page.frameLocator( 'iframe[name="editor-canvas"]' );
		await expect
			.poll( () =>
				canvas
					.locator(
						`.block-editor-block-list__block[data-block="${ clientId }"]`
					)
					.evaluate( ( element ) => element.style.backgroundImage )
			)
			.toContain( 'tmb-test-photo' );
	} );
} );
