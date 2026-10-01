/**
 * "FAQ schema" panel on GenerateBlocks Pro's Accordion block.
 *
 * Switching it on stores data-tmb-faq="true" in the accordion's own HTML
 * attributes. The structured data itself is built on the server from the
 * rendered accordion (includes/class-thingamablocks-faq-schema.php), so it
 * always matches the text; this panel only previews which questions it'll
 * contain.
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { Notice, PanelBody, ToggleControl } from '@wordpress/components';

const ACCORDION = 'generateblocks-pro/accordion';
const KEY = 'data-tmb-faq';

/**
 * Plain text from rich text (a string, or a RichTextData object).
 *
 * @param {*} value Content attribute.
 * @return {string} Text.
 */
function toText( value ) {
	const html = String( value ?? '' );
	const doc = new window.DOMParser().parseFromString( html, 'text/html' );

	return ( doc.body.textContent || '' ).replace( /\s+/g, ' ' ).trim();
}

/**
 * All the text in a block and the blocks inside it (icons excluded).
 *
 * @param {Object} block Block.
 * @return {string} Text.
 */
function blockText( block ) {
	if ( block.name === 'generateblocks-pro/accordion-toggle-icon' ) {
		return '';
	}

	return [
		toText( block.attributes?.content ),
		...block.innerBlocks.map( blockText ),
	]
		.filter( Boolean )
		.join( ' ' );
}

/**
 * The accordion's items as the schema will see them.
 *
 * @param {Object} accordion Accordion block.
 * @return {Array<{question: string, answered: boolean}>} Items.
 */
function readItems( accordion ) {
	return accordion.innerBlocks
		.filter( ( item ) => item.name === 'generateblocks-pro/accordion-item' )
		.map( ( item ) => {
			const toggle = item.innerBlocks.find(
				( inner ) =>
					inner.name === 'generateblocks-pro/accordion-toggle'
			);
			const content = item.innerBlocks.find(
				( inner ) =>
					inner.name === 'generateblocks-pro/accordion-content'
			);

			return {
				question: toggle ? blockText( toggle ) : '',
				// Text only: images and embeds are left out of the schema.
				answered: content ? !! blockText( content ) : false,
			};
		} );
}

function FaqPanel( { attributes, setAttributes, clientId } ) {
	const htmlAttributes = attributes.htmlAttributes || {};
	const on = 'true' === htmlAttributes[ KEY ];

	// The block (with everything inside it) changes only when its content does.
	const block = useSelect(
		( select ) =>
			on ? select( blockEditorStore ).getBlock( clientId ) : null,
		[ clientId, on ]
	);
	const items = useMemo(
		() => ( block ? readItems( block ) : [] ),
		[ block ]
	);
	const included = items.filter( ( item ) => item.question && item.answered );
	const skipped = items.length - included.length;

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'FAQ schema', 'thingamablocks' ) }
				initialOpen={ on }
			>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Add FAQ structured data', 'thingamablocks' ) }
					help={ __(
						'Tells search engines this accordion is a list of questions and answers (schema.org FAQPage). Each item’s title is the question and its content the answer, read from the accordion every time the page loads, so they always match. Several FAQ accordions on one page are combined.',
						'thingamablocks'
					) }
					checked={ on }
					onChange={ ( checked ) => {
						const updated = { ...htmlAttributes };

						delete updated[ KEY ];

						if ( checked ) {
							updated[ KEY ] = 'true';
						}

						setAttributes( { htmlAttributes: updated } );
					} }
				/>
				{ on && (
					<div style={ { marginTop: '16px' } }>
						<p style={ { margin: '0 0 8px', fontWeight: 500 } }>
							{ sprintf(
								/* translators: %d: number of questions. */
								_n(
									'%d question in the schema:',
									'%d questions in the schema:',
									included.length,
									'thingamablocks'
								),
								included.length
							) }
						</p>
						{ included.length > 0 && (
							<ol style={ { margin: '0 0 8px 20px' } }>
								{ included.map( ( item, index ) => (
									<li key={ index }>{ item.question }</li>
								) ) }
							</ol>
						) }
						{ skipped > 0 && (
							<Notice status="warning" isDismissible={ false }>
								{ sprintf(
									/* translators: %d: number of accordion items. */
									_n(
										'%d item is left out because its title or content is empty.',
										'%d items are left out because their title or content is empty.',
										skipped,
										'thingamablocks'
									),
									skipped
								) }
							</Notice>
						) }
					</div>
				) }
			</PanelBody>
		</InspectorControls>
	);
}

const withFaqPanel = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => (
		<>
			<BlockEdit { ...props } />
			{ ACCORDION === props.name && props.isSelected && (
				<FaqPanel
					attributes={ props.attributes }
					setAttributes={ props.setAttributes }
					clientId={ props.clientId }
				/>
			) }
		</>
	),
	'withFaqPanel'
);

addFilter( 'editor.BlockEdit', 'thingamablocks/faq-schema', withFaqPanel );
