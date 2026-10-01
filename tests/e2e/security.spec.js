/**
 * The front-end scripts read their settings from data attributes, which
 * anyone who can write HTML could forge. Forged settings must be harmless.
 */
const { test, expect } = require( '@playwright/test' );
const { DEMO } = require( './utils' );

test.describe( 'Forged block settings', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( DEMO, { waitUntil: 'networkidle' } );
	} );

	test( 'a countdown never follows a javascript: redirect', async ( {
		page,
	} ) => {
		await page.evaluate( () => {
			window.tmbPwned = false;
			const element = document.createElement( 'div' );
			element.className = 'tmb-countdown';
			element.dataset.tmbCountdown = JSON.stringify( {
				mode: 'date',
				end: 1000,
				redirectUrl: 'javascript:window.tmbPwned=true',
			} );
			document.body.append( element );
			window.tmbCountdown.init();
		} );

		await page.waitForTimeout( 1500 );
		expect( await page.evaluate( () => window.tmbPwned ) ).toBe( false );
	} );

	test( 'a toggle with a "__proto__" action doesn’t break the page', async ( {
		page,
	} ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );

		await page.evaluate( () => {
			const element = document.createElement( 'div' );
			element.className = 'tmb-toggle';
			element.dataset.tmbToggle = JSON.stringify( {
				action: '__proto__',
			} );
			element.innerHTML =
				'<div data-toggle-part="switch" role="switch" aria-checked="false" tabindex="0"></div>';
			document.body.append( element );
			window.tmbToggle.init();
			element.firstChild.click();
		} );

		expect( errors ).toEqual( [] );

		// The real toggles still work.
		await page.locator( '[data-toggle-part="on"]' ).first().click();
		await expect( page.locator( '#pricing-annual' ) ).toBeVisible();
	} );
} );
