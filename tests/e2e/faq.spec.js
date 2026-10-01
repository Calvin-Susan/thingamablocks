/**
 * FAQ schema for GenerateBlocks Pro's Accordion. GB Pro can't be installed
 * here, but WordPress runs render filters on blocks it doesn't know, so the
 * pages below use the markup GB Pro 2.x saves; the editor test registers
 * stand-ins for the Accordion blocks.
 */
const { test, expect } = require( '@playwright/test' );
const { testPage, newPost } = require( './utils' );

let counter = 0;
const uid = () => ( 0xa0000000 + ++counter ).toString( 16 );

const text = ( content ) => {
	const id = uid();
	return `<!-- wp:generateblocks/text {"uniqueId":"${ id }","tagName":"span"} --><span class="gb-text gb-text-${ id }">${ content }</span><!-- /wp:generateblocks/text -->`;
};

const paragraph = ( html ) =>
	`<!-- wp:paragraph --><p>${ html }</p><!-- /wp:paragraph -->`;

const item = ( question, answer ) => {
	const ids = [ uid(), uid(), uid(), uid() ];

	return (
		`<!-- wp:generateblocks-pro/accordion-item {"uniqueId":"${ ids[ 0 ] }","tagName":"div"} --><div class="gb-accordion__item gb-accordion__item-${ ids[ 0 ] }">` +
		`<!-- wp:generateblocks-pro/accordion-toggle {"uniqueId":"${ ids[ 1 ] }","tagName":"div","htmlAttributes":{"id":"gb-accordion-toggle-${ ids[ 1 ] }"}} --><div class="gb-accordion__toggle gb-accordion__toggle-${ ids[ 1 ] }" id="gb-accordion-toggle-${ ids[ 1 ] }">` +
		( question ? text( question ) : '' ) +
		`<!-- wp:generateblocks-pro/accordion-toggle-icon {"uniqueId":"${ ids[ 2 ] }","tagName":"span"} --><span class="gb-accordion__toggle-icon gb-accordion__toggle-icon-${ ids[ 2 ] }"><span class="gb-accordion__toggle-icon-open"><svg viewBox="0 0 10 10"><title>Open</title><path d="M0 0h10"></path></svg></span></span><!-- /wp:generateblocks-pro/accordion-toggle-icon -->` +
		`</div><!-- /wp:generateblocks-pro/accordion-toggle -->` +
		`<!-- wp:generateblocks-pro/accordion-content {"uniqueId":"${ ids[ 3 ] }","tagName":"div","htmlAttributes":{"id":"gb-accordion-content-${ ids[ 3 ] }"}} --><div class="gb-accordion__content" id="gb-accordion-content-${ ids[ 3 ] }">${ answer }</div><!-- /wp:generateblocks-pro/accordion-content -->` +
		`</div><!-- /wp:generateblocks-pro/accordion-item -->`
	);
};

const accordion = ( faq, items ) => {
	const id = uid();
	const attributes = { uniqueId: id, tagName: 'div' };

	if ( faq ) {
		attributes.htmlAttributes = { 'data-tmb-faq': 'true' };
	}

	return `<!-- wp:generateblocks-pro/accordion ${ JSON.stringify(
		attributes
	) } --><div class="gb-accordion"${
		faq ? ' data-tmb-faq="true"' : ''
	}>${ items.join( '' ) }</div><!-- /wp:generateblocks-pro/accordion -->`;
};

/**
 * Every JSON-LD FAQPage on the page.
 *
 * @param {import('@playwright/test').Page} page Page.
 * @return {Promise<Object[]>} FAQPage data.
 */
function faqPages( page ) {
	return page.evaluate( () =>
		[ ...document.querySelectorAll( 'script[type="application/ld+json"]' ) ]
			.map( ( script ) => JSON.parse( script.textContent ) )
			.filter( ( data ) => 'FAQPage' === data[ '@type' ] )
	);
}

test.describe( 'FAQ schema', () => {
	let url;

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();

		url = await testPage(
			page,
			'tmb-test-faq',
			accordion( true, [
				item(
					'What is it?',
					paragraph(
						'Answer with <strong>bold</strong> and a <a href="https://example.com/" class="x" target="_blank">link</a>.'
					) +
						'<style>.x{color:red}</style>' +
						'<!-- wp:image --><figure class="wp-block-image"><img src="https://example.com/a.png" alt="A picture"/></figure><!-- /wp:image -->'
				),
				// No title: left out.
				item( '', paragraph( 'Orphan answer' ) ),
				// No answer: left out.
				item( 'Nothing to say?', '' ),
				// Only a picture: nothing Google reads, so left out.
				item(
					'Picture only?',
					'<!-- wp:image --><figure class="wp-block-image"><img src="https://example.com/b.png" alt=""/></figure><!-- /wp:image -->'
				),
				// A nested accordion: its items belong to it, not to this one.
				item(
					'Can they nest?',
					paragraph( 'Yes.' ) +
						accordion( false, [
							item( 'Inner question?', paragraph( 'Inner' ) ),
						] )
				),
			] ) +
				accordion( true, [
					item(
						'Is &lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt; safe?',
						paragraph( 'It &amp; it’s fine.' )
					),
					// Repeated question: listed once.
					item( 'What is it?', paragraph( 'Again' ) ),
				] ) +
				accordion( false, [
					item( 'Not an FAQ?', paragraph( 'Right.' ) ),
				] )
		);
		await page.close();
	} );

	test( 'one FAQPage, built from every FAQ accordion on the page', async ( {
		page,
	} ) => {
		const dialogs = [];
		page.on( 'dialog', ( dialog ) => {
			dialogs.push( dialog.message() );
			dialog.dismiss();
		} );
		await page.goto( url );

		const faqs = await faqPages( page );
		expect( faqs ).toHaveLength( 1 );
		expect( faqs[ 0 ][ '@context' ] ).toBe( 'https://schema.org' );

		const questions = faqs[ 0 ].mainEntity;
		expect( questions.map( ( question ) => question.name ) ).toEqual( [
			'What is it?',
			'Can they nest?',
			'Is </script><script>alert(1)</script> safe?',
		] );

		for ( const question of questions ) {
			expect( question[ '@type' ] ).toBe( 'Question' );
			expect( question.acceptedAnswer[ '@type' ] ).toBe( 'Answer' );
		}

		// Allowed tags only; no attributes but href; no CSS, icons or images.
		expect( questions[ 0 ].acceptedAnswer.text ).toBe(
			'<p>Answer with <strong>bold</strong> and a <a href="https://example.com/">link</a>.</p>'
		);
		expect( questions[ 2 ].acceptedAnswer.text ).toBe(
			'<p>It &amp; it’s fine.</p>'
		);

		// The question text in the page is untouched; nothing ran.
		expect( dialogs ).toEqual( [] );
	} );

	test( 'no FAQ accordion, no FAQPage', async ( { page } ) => {
		const plain = await testPage(
			page,
			'tmb-test-faq-off',
			accordion( false, [
				item( 'Just an accordion?', paragraph( 'Yes.' ) ),
			] )
		);

		await page.goto( plain );
		expect( await faqPages( page ) ).toEqual( [] );
		await expect( page.locator( '.gb-accordion' ) ).toBeVisible();
	} );

	test( 'a Yoast SEO FAQ block on the page has the FAQPage to itself', async ( {
		page,
	} ) => {
		const withYoast = await testPage(
			page,
			'tmb-test-faq-yoast',
			'<!-- wp:yoast/faq-block {"questions":[]} --><div class="schema-faq wp-block-yoast-faq-block"></div><!-- /wp:yoast/faq-block -->' +
				accordion( true, [ item( 'Ours?', paragraph( 'Not here.' ) ) ] )
		);

		await page.goto( withYoast );
		expect( await faqPages( page ) ).toEqual( [] );
	} );

	test( 'the editor panel switches it on and previews the questions', async ( {
		page,
	} ) => {
		await newPost( page );

		const result = await page.evaluate( async () => {
			const { registerBlockType, createBlock } = window.wp.blocks;
			const { createElement } = window.wp.element;
			const { useBlockProps, useInnerBlocksProps } =
				window.wp.blockEditor;
			const { dispatch } = window.wp.data;

			// Stand-ins for GB Pro's Accordion blocks.
			[
				'accordion',
				'accordion-item',
				'accordion-toggle',
				'accordion-toggle-icon',
				'accordion-content',
			].forEach( ( part ) => {
				const name = `generateblocks-pro/${ part }`;

				if ( ! window.wp.blocks.getBlockType( name ) ) {
					registerBlockType( name, {
						apiVersion: 3,
						title: part,
						category: 'design',
						attributes: {
							htmlAttributes: { type: 'object', default: {} },
						},
						edit: function Edit() {
							return createElement(
								'div',
								useInnerBlocksProps( useBlockProps() )
							);
						},
						save: () => null,
					} );
				}
			} );

			const faqItem = ( question, answer ) =>
				createBlock( 'generateblocks-pro/accordion-item', {}, [
					createBlock( 'generateblocks-pro/accordion-toggle', {}, [
						createBlock( 'generateblocks/text', {
							tagName: 'span',
							content: question,
						} ),
						createBlock(
							'generateblocks-pro/accordion-toggle-icon'
						),
					] ),
					createBlock(
						'generateblocks-pro/accordion-content',
						{},
						answer
							? [
									createBlock( 'core/paragraph', {
										content: answer,
									} ),
							  ]
							: []
					),
				] );

			const block = createBlock( 'generateblocks-pro/accordion', {}, [
				faqItem( 'First <em>question</em>?', 'One' ),
				faqItem( 'Second?', 'Two' ),
				faqItem( 'Unanswered?', '' ),
			] );

			dispatch( 'core/block-editor' ).insertBlocks( block );
			dispatch( 'core/block-editor' ).selectBlock( block.clientId );

			return block.clientId;
		} );

		const panel = page.locator( '.components-panel__body', {
			has: page.getByRole( 'button', { name: 'FAQ schema' } ),
		} );
		await expect( panel ).toBeVisible();
		await panel.getByRole( 'button', { name: 'FAQ schema' } ).click();
		await panel.getByLabel( 'Add FAQ structured data' ).check();

		await expect( panel ).toContainText( '2 questions in the schema' );
		await expect( panel.locator( 'li' ) ).toHaveText( [
			'First question?',
			'Second?',
		] );
		await expect( panel ).toContainText( '1 item is left out' );

		const htmlAttributes = await page.evaluate(
			( clientId ) =>
				window.wp.data
					.select( 'core/block-editor' )
					.getBlockAttributes( clientId ).htmlAttributes,
			result
		);
		expect( htmlAttributes ).toEqual( { 'data-tmb-faq': 'true' } );

		await panel.getByLabel( 'Add FAQ structured data' ).uncheck();
		expect(
			await page.evaluate(
				( clientId ) =>
					window.wp.data
						.select( 'core/block-editor' )
						.getBlockAttributes( clientId ).htmlAttributes,
				result
			)
		).toEqual( {} );
	} );
} );
