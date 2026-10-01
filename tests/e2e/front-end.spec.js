/**
 * The blocks on the demo page: behaviour, accessibility markup, and no JS errors.
 */
const { test, expect } = require( '@playwright/test' );
const { DEMO } = require( './utils' );

test.describe( 'Front end (demo page)', () => {
	let errors;

	test.beforeEach( async ( { page } ) => {
		errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );
		page.on(
			'console',
			( message ) =>
				'error' === message.type() && errors.push( message.text() )
		);
		await page.goto( DEMO, { waitUntil: 'networkidle' } );
	} );

	test.afterEach( () => {
		expect( errors, 'JavaScript errors' ).toEqual( [] );
	} );

	test( 'pricing toggle switches plans', async ( { page } ) => {
		const annual = page.locator( '#pricing-annual' );
		const monthly = page.locator( '#pricing-monthly' );
		const button = page.locator( '[data-toggle-part="on"]' ).first();

		await expect( annual ).toBeHidden();
		await expect( button ).toHaveAttribute( 'aria-pressed', 'false' );

		await button.click();

		await expect( annual ).toBeVisible();
		await expect( monthly ).toBeHidden();
		await expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
		await expect(
			page.locator( '[role="group"][aria-label]' ).first()
		).toBeVisible();
	} );

	test( 'countdowns are named timers, with full unit words for screen readers', async ( {
		page,
	} ) => {
		const timers = page.locator( '.tmb-countdown' );

		for ( const timer of await timers.all() ) {
			await expect( timer ).toHaveAttribute( 'role', 'timer' );
			await expect( timer ).toHaveAttribute( 'aria-label', /Countdown/ );
		}

		// The sale banner's "d h m s" are visual only.
		const short = page.locator( '#sale-banner [aria-hidden="true"]' );
		await expect( short ).toHaveText( [ 'd', 'h', 'm', 's' ] );
	} );

	test( 'marquee: pause button first, copies hidden from assistive tech', async ( {
		page,
	} ) => {
		const marquee = page.locator( '.tmb-marquee' ).first();
		const first = await marquee.evaluate(
			( element ) =>
				element.querySelector(
					'a, button, [tabindex]:not([tabindex="-1"])'
				)?.dataset.marqueePart
		);

		expect( first ).toBe( 'pause' );
		await expect(
			marquee
				.locator( '.tmb-marquee__track > [aria-hidden="true"][inert]' )
				.first()
		).toBeAttached();

		const pause = marquee.locator( '[data-marquee-part="pause"]' );
		await pause.click();
		await expect( pause ).toHaveAttribute( 'aria-pressed', 'true' );
		await expect( marquee ).toHaveClass( /is-paused/ );
	} );
} );

test.describe( 'Reduced motion', () => {
	test.use( { reducedMotion: 'reduce' } );

	test( 'marquees stop, and nothing is left hidden', async ( { page } ) => {
		await page.goto( DEMO, { waitUntil: 'networkidle' } );

		for ( const viewport of await page
			.locator( '.tmb-marquee__viewport' )
			.all() ) {
			const state = await viewport.evaluate( ( element ) => ( {
				overflows: element.scrollWidth > element.clientWidth,
				tabindex: element.getAttribute( 'tabindex' ),
				animations: element
					.querySelector( '.tmb-marquee__track' )
					.getAnimations().length,
			} ) );

			expect( state.animations ).toBe( 0 );

			// A row that needs scrolling must be reachable by keyboard.
			if ( state.overflows ) {
				expect( state.tabindex ).toBe( '0' );
			}
		}

		await expect(
			page.locator( '[data-marquee-part="pause"]' ).first()
		).toBeHidden();
	} );
} );
