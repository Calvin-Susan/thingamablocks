/**
 * The Table of Contents block: the list built from the post's headings, the
 * IDs headings get, jumping and the current section, copy-link buttons,
 * forged settings and the editor.
 */
const { readFileSync } = require( 'node:fs' );
const { test, expect } = require( '@playwright/test' );
const { rest, newPost, testPage, invalidBlocks } = require( './utils' );

const AXE = readFileSync( require.resolve( 'axe-core/axe.min.js' ), 'utf8' );

/**
 * Block markup for a Table of Contents layout, made by the editor (so
 * GenerateBlocks has given each part its ID).
 *
 * @param {import('@playwright/test').Page} page       Page.
 * @param {Object}                          attributes Block attributes.
 * @param {string}                          style      Variation name.
 * @param {boolean}                         copyIcon   Add the copy-link icon.
 * @return {Promise<string>} Markup.
 */
async function tocMarkup( page, attributes = {}, style = 'line', copyIcon ) {
	await newPost( page );

	return page.evaluate(
		async ( [ name, extra, withIcon ] ) => {
			const {
				createBlock,
				getBlockVariations,
				createBlocksFromInnerBlocksTemplate,
				serialize,
			} = window.wp.blocks;
			const layout = getBlockVariations(
				'thingamablocks/toc',
				'block'
			).find( ( item ) => item.name === name );
			const inner = createBlocksFromInnerBlocksTemplate(
				layout.innerBlocks
			);

			if ( withIcon ) {
				inner.push(
					createBlock( 'generateblocks/shape', {
						html: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle></svg>',
						htmlAttributes: { 'data-toc-part': 'copy' },
						globalClasses: [ 'tmb-toc__copy-icon' ],
					} )
				);
			}

			const block = createBlock(
				'thingamablocks/toc',
				{ ...layout.attributes, ...extra },
				inner
			);
			const { dispatch, select } = window.wp.data;

			dispatch( 'core/block-editor' ).insertBlocks( block );

			// GenerateBlocks gives each part its ID once it's in the editor.
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
		},
		[ style, attributes, copyIcon ]
	);
}

/**
 * A core Heading block.
 *
 * @param {number} level               Level.
 * @param {string} text                Inner HTML.
 * @param {Object} options             Options.
 * @param {string} [options.anchor]    ID.
 * @param {string} [options.className] Extra class.
 * @return {string} Block markup.
 */
const h = ( level, text, { anchor, className } = {} ) => {
	const attributes = {
		...( 2 !== level ? { level } : {} ),
		...( anchor ? { anchor } : {} ),
		...( className ? { className } : {} ),
	};
	const json = Object.keys( attributes ).length
		? ' ' + JSON.stringify( attributes )
		: '';

	return `<!-- wp:heading${ json } --><h${ level } class="wp-block-heading${
		className ? ' ' + className : ''
	}"${
		anchor ? ` id="${ anchor }"` : ''
	}>${ text }</h${ level }><!-- /wp:heading -->`;
};

const spacer =
	'<!-- wp:spacer {"height":"700px"} --><div style="height:700px" aria-hidden="true" class="wp-block-spacer"></div><!-- /wp:spacer -->';

test.describe( 'Table of Contents', () => {
	test.describe.configure( { mode: 'serial' } );

	const site = {};

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();
		const pattern = await rest( page, '/wp/v2/blocks', {
			method: 'POST',
			data: {
				title: `TOC pattern ${ Date.now() }`,
				status: 'publish',
				content: h( 2, 'From a pattern' ),
			},
		} );

		site.pattern = pattern.id;

		const toc = await tocMarkup(
			page,
			{ copyLinks: true, offset: 80 },
			'line',
			true
		);
		const body = [
			h( 2, 'Getting started' ),
			spacer,
			h( 3, 'Install it' ),
			spacer,
			h( 3, "Don't <em>panic</em>" ),
			h( 4, 'Too deep' ),
			spacer,
			h( 2, 'Getting started' ),
			spacer,
			h( 2, 'Has an anchor', { anchor: 'custom-anchor' } ),
			h( 2, 'Skipped', { className: 'tmb-toc-skip' } ),
			spacer,
			'<!-- wp:generateblocks/text {"uniqueId":"7c0c0001","tagName":"h2"} --><h2 class="gb-text gb-text-7c0c0001">From GenerateBlocks</h2><!-- /wp:generateblocks/text -->',
			spacer,
			`<!-- wp:block {"ref":${ pattern.id }} /-->`,
			spacer,
			h( 2, 'Café crème' ),
			h( 2, "A 6' fence" ),
			h( 2, 'Content' ),
			h( 2, '{{post_title}}' ),
			spacer,
		].join( '\n\n' );

		site.full = await testPage( page, 'tmb-test-toc', toc + body );
		site.plain = await testPage(
			page,
			'tmb-test-toc-plain',
			( await tocMarkup( page, {}, 'list' ) ) +
				h( 2, 'One' ) +
				h( 3, 'One point one' ) +
				h( 2, 'Two' )
		);
		site.empty = await testPage(
			page,
			'tmb-test-toc-empty',
			( await tocMarkup( page, {}, 'list' ) ) +
				'<!-- wp:paragraph --><p>No headings here.</p><!-- /wp:paragraph -->'
		);

		await page.close();
	} );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();

		if ( site.pattern ) {
			await rest( page, `/wp/v2/blocks/${ site.pattern }`, {
				method: 'DELETE',
				params: { force: 'true' },
			} );
		}

		await page.close();
	} );

	test( 'lists the post’s headings, nested, linked to the IDs headings get', async ( {
		page,
	} ) => {
		await page.goto( site.full );

		const nav = page.getByRole( 'navigation', {
			name: 'Table of contents',
		} );
		await expect( nav ).toBeVisible();

		const tree = await nav.evaluate( ( element ) => {
			const read = ( list ) =>
				[ ...list.children ].map( ( item ) => {
					const link = item.querySelector(
						':scope > [data-toc-part="link"]'
					);
					const nested = item.querySelector(
						':scope > [data-toc-part="list"]'
					);

					return {
						text: link.textContent,
						href: link.getAttribute( 'href' ),
						level: item.dataset.level,
						tag: item.tagName,
						...( nested ? { children: read( nested ) } : {} ),
					};
				} );

			return read( element.querySelector( '[data-toc-part="list"]' ) );
		} );

		expect( tree ).toEqual( [
			{
				text: 'Getting started',
				href: '#getting-started',
				level: '2',
				tag: 'LI',
				children: [
					{
						text: 'Install it',
						href: '#install-it',
						level: '3',
						tag: 'LI',
					},
					{
						text: 'Don’t panic',
						href: '#dont-panic',
						level: '3',
						tag: 'LI',
					},
				],
			},
			{
				text: 'Getting started',
				href: '#getting-started-2',
				level: '2',
				tag: 'LI',
			},
			{
				text: 'Has an anchor',
				href: '#custom-anchor',
				level: '2',
				tag: 'LI',
			},
			{
				text: 'From GenerateBlocks',
				href: '#from-generateblocks',
				level: '2',
				tag: 'LI',
			},
			{
				text: 'From a pattern',
				href: '#from-a-pattern',
				level: '2',
				tag: 'LI',
			},
			{ text: 'Café crème', href: '#cafe-creme', level: '2', tag: 'LI' },
			// WordPress turns the ' into a prime (′) on the page; the ID still
			// matches. Theme IDs (#content) are never taken.
			{ text: 'A 6′ fence', href: '#a-6-fence', level: '2', tag: 'LI' },
			{ text: 'Content', href: '#content-2', level: '2', tag: 'LI' },
		] );

		// Every link reaches its heading; skipped and too-deep headings still
		// get an ID, they're just not listed.
		const ids = await page.evaluate( () =>
			[ ...document.querySelectorAll( '.entry-content :is(h2,h3,h4)' ) ]
				.filter( ( element ) => ! element.closest( '.tmb-toc' ) )
				.map( ( element ) => element.id )
		);
		expect( ids ).toEqual( [
			'getting-started',
			'install-it',
			'dont-panic',
			'too-deep',
			'getting-started-2',
			'custom-anchor',
			'skipped',
			'from-generateblocks',
			'from-a-pattern',
			'cafe-creme',
			'a-6-fence',
			'content-2',
			// A dynamic tag's text isn't known until rendered: not listed.
			'post_title',
		] );

		// The parts keep their GenerateBlocks classes; nested lists don't
		// repeat the first list's ID.
		await expect(
			nav.locator( '[data-toc-part="link"]' ).first()
		).toHaveClass( /tmb-toc__link tmb-toc__link--line/ );
		await expect(
			nav.locator( '[data-toc-part="link"]' ).first()
		).toHaveClass( /tmb-toc__link--current/ );
		// Only the outer list has an ID (for the collapse button).
		await expect( nav.locator( '[id]' ) ).toHaveCount( 1 );
		await expect( nav.locator( '[id]' ) ).toHaveClass( /tmb-toc__panel/ );
	} );

	test( 'a link scrolls to its heading below the offset, focuses it and marks it current', async ( {
		page,
	} ) => {
		await page.setViewportSize( { width: 1200, height: 800 } );
		await page.goto( site.full );

		const nav = page.getByRole( 'navigation', {
			name: 'Table of contents',
		} );
		const link = nav.getByRole( 'link', { name: 'Install it' } );
		const target = page.locator( '#install-it' );

		// WordPress's admin bar adds its height (scroll-padding) to the offset.
		const expected =
			80 +
			( await page.evaluate(
				() =>
					parseFloat(
						window.getComputedStyle( document.documentElement )
							.scrollPaddingTop
					) || 0
			) );

		await link.click();

		await expect
			.poll( () =>
				target.evaluate( ( element ) =>
					Math.round( element.getBoundingClientRect().top )
				)
			)
			.toBe( expected );
		expect( await page.evaluate( () => window.location.hash ) ).toBe(
			'#install-it'
		);
		await expect( target ).toBeFocused();
		await expect( link ).toHaveAttribute( 'aria-current', 'true' );
		await expect( nav.locator( '[aria-current]' ) ).toHaveCount( 1 );

		// Scrolling on: the section being read follows.
		await page
			.locator( '#from-generateblocks' )
			.evaluate( ( element ) =>
				window.scrollTo(
					0,
					element.getBoundingClientRect().top + window.scrollY - 100
				)
			);
		await expect(
			nav.getByRole( 'link', { name: 'From GenerateBlocks' } )
		).toHaveAttribute( 'aria-current', 'true' );

		// At the very bottom, the last heading on screen.
		await page.evaluate( () =>
			window.scrollTo( 0, document.documentElement.scrollHeight )
		);
		await expect(
			nav.getByRole( 'link', { name: 'Content' } )
		).toHaveAttribute( 'aria-current', 'true' );

		// Above the first heading, nothing.
		await page.evaluate( () => window.scrollTo( 0, 0 ) );
		await expect( nav.locator( '[aria-current]' ) ).toHaveCount( 0 );

		// A link opened from elsewhere lands below the offset too (CSS
		// scroll-margin, before any script).
		await page.goto( site.full + '#custom-anchor' );
		await expect
			.poll( () =>
				page
					.locator( '#custom-anchor' )
					.evaluate( ( element ) =>
						Math.round( element.getBoundingClientRect().top )
					)
			)
			.toBe( expected );
	} );

	test( 'copy-link buttons copy a link to their heading', async ( {
		page,
		context,
		baseURL,
	} ) => {
		await context.grantPermissions( [
			'clipboard-read',
			'clipboard-write',
		] );
		await page.goto( site.full );

		const target = page.locator( '#install-it' );
		const button = target.getByRole( 'button', { name: 'Copy link' } );

		// Listed headings only.
		await expect( page.locator( '.tmb-toc__copy-button' ) ).toHaveCount(
			10
		);
		await expect(
			page.locator( '#skipped .tmb-toc__copy-button' )
		).toHaveCount( 0 );
		await expect(
			page.locator( '#too-deep .tmb-toc__copy-button' )
		).toHaveCount( 0 );

		// Hidden until the heading is hovered; the icon is the block's Shape.
		await target.scrollIntoViewIfNeeded();
		await expect( button ).toHaveCSS( 'opacity', '0' );
		await target.hover();
		await expect( button ).toHaveCSS( 'opacity', '1' );
		await expect( button.locator( 'svg circle' ) ).toHaveCount( 1 );

		await button.click();

		expect(
			await page.evaluate( () => window.navigator.clipboard.readText() )
		).toBe( new URL( site.full + '#install-it', baseURL ).href );
		await expect( button.locator( '.tmb-toc__copied' ) ).toBeVisible();
		// On a solid background, readable over the text behind it.
		await expect( button.locator( '.tmb-toc__copied' ) ).not.toHaveCSS(
			'background-color',
			'rgba(0, 0, 0, 0)'
		);
		await expect( page.getByRole( 'status' ) ).toHaveText( 'Link copied' );

		// The heading's name stays its text plus the button.
		await expect(
			page.getByRole( 'heading', { name: /^Install it/ } )
		).toBeVisible();
	} );

	test( 'collapses below its breakpoint, showing the section being read', async ( {
		page,
	} ) => {
		await page.setViewportSize( { width: 375, height: 800 } );
		await page.goto( site.full );

		const nav = page.getByRole( 'navigation', {
			name: 'Table of contents',
		} );
		const toggle = nav.getByRole( 'button', { name: /On this page/ } );
		const list = nav.locator( '.tmb-toc__panel' );

		// Closed from the start, the title is the button.
		await expect( list ).toBeHidden();
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( toggle ).toHaveAttribute(
			'aria-controls',
			await list.getAttribute( 'id' )
		);
		await expect( nav.locator( '.tmb-toc__title-text' ) ).toBeHidden();
		await expect(
			page.locator( 'style#tmb-toc-collapse-768' )
		).toHaveCount( 1 );

		// While closed it shows where you are.
		await page
			.locator( '#install-it' )
			.evaluate( ( element ) =>
				window.scrollTo(
					0,
					element.getBoundingClientRect().top + window.scrollY - 50
				)
			);
		await expect( toggle.locator( '.tmb-toc__toggle-current' ) ).toHaveText(
			'Install it'
		);
		await page.evaluate( () => window.scrollTo( 0, 0 ) );

		await toggle.click();
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
		await expect( list ).toBeVisible();

		// Escape closes it, back on the button.
		await page.keyboard.press( 'Escape' );
		await expect( list ).toBeHidden();
		await expect( toggle ).toBeFocused();

		// A link closes it and goes to the heading.
		await toggle.click();
		await nav.getByRole( 'link', { name: 'Has an anchor' } ).click();
		await expect( list ).toBeHidden();
		await expect( page.locator( '#custom-anchor' ) ).toBeFocused();

		// Wider than the breakpoint: a plain title and an open list.
		await page.setViewportSize( { width: 1000, height: 800 } );
		await expect( toggle ).toBeHidden();
		await expect( list ).toBeVisible();
		await expect( nav.locator( '.tmb-toc__title-text' ) ).toBeVisible();
	} );

	test( 'without the setting there are no copy-link buttons', async ( {
		page,
	} ) => {
		await page.goto( site.plain );

		await expect(
			page.getByRole( 'navigation', { name: 'Table of contents' } )
		).toBeVisible();
		await expect( page.locator( '.tmb-toc__copy-button' ) ).toHaveCount(
			0
		);
		await expect( page.locator( 'template' ) ).toHaveCount( 0 );

		// No offset set: no offset style.
		await expect(
			page.locator( '#thingamablocks-toc-offset-inline-css' )
		).toHaveCount( 0 );
	} );

	test( 'nothing without headings, or away from a single post', async ( {
		page,
	} ) => {
		await page.goto( site.empty );
		await expect( page.locator( '.tmb-toc' ) ).toHaveCount( 0 );

		// The test pages are pages; their ToC would render in a listing too,
		// but only single posts and pages have one. Search results list them.
		await page.goto( '/?s=Test%3A+tmb-test-toc' );
		await expect( page.locator( '.tmb-toc' ) ).toHaveCount( 0 );
	} );

	test( 'forged settings and heading markup are cleaned', async ( {
		page,
	} ) => {
		const markup = (
			await tocMarkup(
				page,
				{
					levels: [ 2, 9, '<b>' ],
					offset: 99999,
					collapseBelow: 99999,
					ariaLabel: '"><img src=x onerror=alert(1)>',
				},
				'list'
			)
		)
			// Forge values the editor wouldn't save.
			.replace( '"levels":[2,9,"\\u003cb\\u003e"]', '"levels":[9,"x"]' );
		const url = await testPage(
			page,
			'tmb-test-toc-forged',
			markup +
				h(
					2,
					'Bold <strong>move</strong> &lt;script&gt;alert(1)&lt;/script&gt;'
				) +
				h( 3, 'Third' )
		);
		const dialogs = [];

		page.on( 'dialog', ( dialog ) => {
			// Leaving the editor asks first; that's not the page.
			if ( 'beforeunload' === dialog.type() ) {
				dialog.accept();
				return;
			}

			dialogs.push( dialog.message() );
			dialog.dismiss();
		} );
		await page.goto( url );

		const nav = page.locator( 'nav.tmb-toc' );

		// Bad levels fall back to H2 and H3.
		await expect( nav.locator( '[data-toc-part="link"]' ) ).toHaveText( [
			'Bold move <script>alert(1)</script>',
			'Third',
		] );
		// Tags are stripped from the label.
		await expect( nav ).toHaveAttribute( 'aria-label', '">' );
		await expect( nav.locator( 'img, script' ) ).toHaveCount( 0 );
		expect(
			await page
				.locator( '#thingamablocks-toc-offset-inline-css' )
				.textContent()
		).toContain( 'scroll-margin-top:500px' );
		await expect(
			page.locator( 'style#tmb-toc-collapse-3000' )
		).toHaveCount( 1 );
		expect( dialogs ).toEqual( [] );
	} );

	test( 'no accessibility violations', async ( { page } ) => {
		await page.goto( site.full );
		await page.locator( '#install-it' ).hover();
		await page.addScriptTag( { content: AXE } );

		const violations = await page.evaluate( async () => {
			const result = await window.axe.run(
				{ include: [ 'nav.tmb-toc', '.entry-content' ] },
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

			return result.violations.map(
				( violation ) =>
					`${ violation.id }: ${ violation.nodes
						.map( ( node ) => node.target.join( ' ' ) )
						.join( ', ' ) }`
			);
		} );

		expect( violations ).toEqual( [] );
	} );

	test( 'in the editor: layouts are valid and the copy-link setting adds its icon', async ( {
		page,
	} ) => {
		await newPost( page );

		const counts = await page.evaluate( async () => {
			const { createBlock, createBlocksFromInnerBlocksTemplate } =
				window.wp.blocks;
			const { dispatch } = window.wp.data;
			const layouts = window.wp.blocks.getBlockVariations(
				'thingamablocks/toc',
				'block'
			);
			const blocks = layouts.map( ( layout ) =>
				createBlock(
					'thingamablocks/toc',
					layout.attributes,
					createBlocksFromInnerBlocksTemplate( layout.innerBlocks )
				)
			);

			dispatch( 'core/block-editor' ).insertBlocks( blocks );
			dispatch( 'core/block-editor' ).selectBlock( blocks[ 0 ].clientId );

			return layouts.length;
		} );

		expect( counts ).toBe( 2 );

		const icons = () =>
			page.evaluate( () => {
				const found = [];
				const walk = ( blocks ) =>
					blocks.forEach( ( block ) => {
						if (
							'copy' ===
							block.attributes.htmlAttributes?.[ 'data-toc-part' ]
						) {
							found.push( block.name );
						}
						walk( block.innerBlocks );
					} );

				walk(
					window.wp.data.select( 'core/block-editor' ).getBlocks()
				);

				return found;
			} );

		const toggle = page.getByRole( 'checkbox', {
			name: 'Copy-link buttons',
		} );

		await toggle.check();
		expect( await icons() ).toEqual( [ 'generateblocks/shape' ] );
		await toggle.uncheck();
		expect( await icons() ).toEqual( [] );

		// At least one heading level stays ticked.
		await page.getByRole( 'checkbox', { name: 'H3' } ).uncheck();
		await expect(
			page.getByRole( 'checkbox', { name: 'H2' } )
		).toBeChecked();
		await expect(
			page.getByRole( 'checkbox', { name: 'H2' } )
		).toBeDisabled();

		expect( await invalidBlocks( page ) ).toEqual( [] );

		const markup = await page.evaluate( () =>
			window.wp.blocks.serialize(
				window.wp.data.select( 'core/block-editor' ).getBlocks()
			)
		);
		expect( await invalidBlocks( page, markup ) ).toEqual( [] );
	} );
} );
