/**
 * Automated WCAG 2.2 AA scan (axe-core) of the plugin's output on the demo
 * page, in light and dark mode. Automated checks catch roughly a third of
 * accessibility problems; keyboard and screen reader behaviour is tested in
 * the other specs.
 */
const { readFileSync } = require( 'node:fs' );
const { test, expect } = require( '@playwright/test' );
const { DEMO } = require( './utils' );

const AXE = readFileSync( require.resolve( 'axe-core/axe.min.js' ), 'utf8' );

for ( const colorScheme of [ 'light', 'dark' ] ) {
	test.describe( `Accessibility (${ colorScheme })`, () => {
		test.use( { colorScheme } );

		test( 'no WCAG violations in the plugin’s output', async ( {
			page,
		} ) => {
			await page.goto( DEMO, { waitUntil: 'networkidle' } );
			// Let the countdowns tick and the marquees lay out.
			await page.waitForTimeout( 1500 );
			await page.addScriptTag( { content: AXE } );

			const violations = await page.evaluate( async () => {
				// Only the page content: the theme's header, sidebar and footer aren't ours.
				const result = await window.axe.run(
					document.querySelector( '.entry-content' ),
					{
						runOnly: [
							'wcag2a',
							'wcag2aa',
							'wcag21a',
							'wcag21aa',
							'wcag22aa',
							'best-practice',
						],
					}
				);

				return result.violations.map( ( violation ) => ( {
					rule: violation.id,
					impact: violation.impact,
					elements: violation.nodes.map( ( node ) =>
						node.target.join( ' ' )
					),
				} ) );
			} );

			expect( violations ).toEqual( [] );
		} );
	} );
}
