/**
 * Behaviour that needs its own test pages: remembered toggle choices,
 * entrance animations, and keyboard focus in a moving marquee.
 */
const { test, expect } = require( '@playwright/test' );
const { testPage } = require( './utils' );

const paragraph = ( id, text ) =>
	`<!-- wp:paragraph --><p id="${ id }">${ text }</p><!-- /wp:paragraph -->`;

test.describe( 'Toggle: remembered choice', () => {
	let url;

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();
		url = await testPage(
			page,
			'tmb-test-persist',
			paragraph( 'tgt-a', 'A' ) +
				paragraph( 'tgt-b', 'B' ) +
				'<!-- wp:thingamablocks/toggle {"group":"ptest","persist":true,"showWhenOff":["tgt-a"],"showWhenOn":["tgt-b"]} --><!-- wp:generateblocks/element {"uniqueId":"aa11bb22","tagName":"div","styles":{"width":"3rem","height":"1.5rem","backgroundColor":"#767680"},"css":".gb-element-aa11bb22{background-color:#767680;height:1.5rem;width:3rem}","htmlAttributes":{"data-toggle-part":"switch","aria-checked":"false"}} --><div class="gb-element-aa11bb22" data-toggle-part="switch" aria-checked="false"></div><!-- /wp:generateblocks/element --><!-- /wp:thingamablocks/toggle -->'
		);
		await page.close();
	} );

	test( 'is applied before the main script runs (no flash)', async ( {
		page,
	} ) => {
		// Block the Toggle's script: only the small inline restore script runs.
		await page.route( /toggle\/view\.js/, ( route ) => route.abort() );
		await page.goto( url );
		await page.evaluate( () =>
			localStorage.setItem( 'tmb-toggle:group:ptest', 'on' )
		);
		await page.reload( { waitUntil: 'networkidle' } );

		await expect( page.locator( '#tgt-a' ) ).toBeHidden();
		await expect( page.locator( '#tgt-b' ) ).toBeVisible();
		await expect(
			page.locator( '[data-toggle-part="switch"]' )
		).toHaveAttribute( 'aria-checked', 'true' );
		await expect( page.locator( '.tmb-toggle' ) ).toHaveClass( /is-on/ );
	} );

	test( 'with nothing saved, the server’s default stands', async ( {
		page,
	} ) => {
		await page.goto( url );
		await page.evaluate( () =>
			localStorage.removeItem( 'tmb-toggle:group:ptest' )
		);
		await page.reload( { waitUntil: 'networkidle' } );

		await expect( page.locator( '#tgt-a' ) ).toBeVisible();
		await expect( page.locator( '#tgt-b' ) ).toBeHidden();
	} );

	test( 'a click is remembered on the next visit', async ( { page } ) => {
		await page.goto( url, { waitUntil: 'networkidle' } );
		await page.evaluate( () =>
			localStorage.removeItem( 'tmb-toggle:group:ptest' )
		);
		await page.locator( '[data-toggle-part="switch"]' ).click();
		await page.reload( { waitUntil: 'networkidle' } );

		await expect( page.locator( '#tgt-b' ) ).toBeVisible();
		await page.evaluate( () =>
			localStorage.removeItem( 'tmb-toggle:group:ptest' )
		);
	} );
} );

test.describe( 'Entrance animations', () => {
	let url;

	const animated = ( id, extra = '' ) =>
		`<!-- wp:generateblocks/element {"uniqueId":"${ id }","tagName":"div","htmlAttributes":{"data-tmb-animate":"fade-up"${
			extra ? ',"data-tmb-delay":"2000"' : ''
		}}} --><div class="gb-element-${ id }" data-tmb-animate="fade-up"${ extra }><a href="#x" id="link-${ id }">Link ${ id }</a></div><!-- /wp:generateblocks/element -->`;

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();
		url = await testPage(
			page,
			'tmb-test-animations',
			animated( 'cc11dd22' ) +
				'<!-- wp:spacer {"height":"3000px"} --><div style="height:3000px" aria-hidden="true" class="wp-block-spacer"></div><!-- /wp:spacer -->' +
				animated( 'ee11ff22', ' data-tmb-delay="2000"' )
		);
		await page.close();
	} );

	test( 'blocks animate in when seen; keyboard focus reveals one at once', async ( {
		page,
	} ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );
		await page.goto( url, { waitUntil: 'networkidle' } );

		const opacity = ( selector ) =>
			page
				.locator( selector )
				.evaluate( ( element ) => getComputedStyle( element ).opacity );

		await expect
			.poll( () => opacity( '.gb-element-cc11dd22' ) )
			.toBe( '1' );
		expect( await opacity( '.gb-element-ee11ff22' ) ).toBe( '0' );

		// Tabbing to a link inside a block that's still waiting (and has a 2s delay).
		await page.locator( '#link-ee11ff22' ).focus();
		await expect
			.poll( () => opacity( '.gb-element-ee11ff22' ), { timeout: 500 } )
			.toBe( '1' );

		expect( errors ).toEqual( [] );
	} );

	test( 'forged preset names are ignored', async ( { page } ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );
		await page.goto( url, { waitUntil: 'networkidle' } );

		await page.evaluate( () => {
			const element = document.createElement( 'div' );
			element.dataset.tmbAnimate = 'constructor';
			element.dataset.tmbSpeed = 'constructor';
			element.textContent = 'x';
			document.body.prepend( element );
		} );

		await page.waitForTimeout( 500 );
		expect( errors ).toEqual( [] );
	} );

	test.describe( 'with reduced motion', () => {
		test.use( { reducedMotion: 'reduce' } );

		test( 'nothing is hidden', async ( { page } ) => {
			await page.goto( url, { waitUntil: 'networkidle' } );

			for ( const block of await page
				.locator( '[data-tmb-animate]' )
				.all() ) {
				expect(
					await block.evaluate(
						( element ) => getComputedStyle( element ).opacity
					)
				).toBe( '1' );
			}
		} );
	} );
} );

test.describe( 'Marquee: keyboard focus', () => {
	test.use( { viewport: { width: 700, height: 600 } } );

	test( 'a focused link is paused fully in view', async ( { page } ) => {
		let links = '';

		for ( let i = 0; i < 8; i++ ) {
			const id = `ab12cd${ 10 + i }`;
			links += `<!-- wp:generateblocks/text {"uniqueId":"${ id }","tagName":"a","htmlAttributes":{"href":"#m${ i }"}} --><a class="gb-text gb-text-${ id }" href="#m${ i }">Item number ${ i } link</a><!-- /wp:generateblocks/text -->`;
		}

		const url = await testPage(
			page,
			'tmb-test-marquee-focus',
			`<!-- wp:thingamablocks/marquee {"speed":400} --><!-- wp:generateblocks/element {"uniqueId":"ff00ee11","tagName":"div","styles":{"display":"flex","columnGap":"3rem"},"htmlAttributes":{"data-marquee-part":"items"}} --><div class="gb-element-ff00ee11" data-marquee-part="items">${ links }</div><!-- /wp:generateblocks/element --><!-- /wp:thingamablocks/marquee -->`
		);

		await page.goto( url, { waitUntil: 'networkidle' } );
		await page.waitForTimeout( 2000 );

		for ( const i of [ 0, 4, 7 ] ) {
			await page
				.locator( `a[href="#m${ i }"]:not([tabindex="-1"])` )
				.focus();
			await page.waitForTimeout( 100 );

			const state = await page.evaluate( () => {
				const viewport = document
					.querySelector( '.tmb-marquee__viewport' )
					.getBoundingClientRect();
				const link = document.activeElement.getBoundingClientRect();

				return {
					inView:
						link.left >= viewport.left - 1 &&
						link.right <= viewport.right + 1,
					paused: document
						.querySelector( '.tmb-marquee' )
						.classList.contains( 'is-paused' ),
				};
			} );

			expect( state, `link ${ i }` ).toEqual( {
				inView: true,
				paused: true,
			} );

			await page.evaluate( () => document.activeElement.blur() );
			await page.waitForTimeout( 800 );
		}
	} );
} );
