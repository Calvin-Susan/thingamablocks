/**
 * "Table of contents part" settings on GenerateBlocks blocks inside a Table
 * of Contents, stored as data-toc-part in the block's GenerateBlocks HTML
 * attributes.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

// Which block each part can be. Matches render() in the PHP render class.
const PARTS = {
	title: 'generateblocks/text',
	chevron: 'generateblocks/shape',
	list: 'generateblocks/element',
	item: 'generateblocks/element',
	link: 'generateblocks/text',
	copy: 'generateblocks/shape',
};

function helpText( value ) {
	switch ( value ) {
		case 'title':
			return __(
				'The title. Below the “Collapse below” width it becomes the button that opens and closes the list, showing the section being read.',
				'thingamablocks'
			);
		case 'chevron':
			return __(
				'The icon in the open/close button on small screens (turned over while open). Not shown on wider screens.',
				'thingamablocks'
			);
		case 'list':
			return __(
				'The list of headings: an Element set to <ul> or <ol>. Sub-headings get a nested copy of it.',
				'thingamablocks'
			);
		case 'item':
			return __(
				'Repeated for every heading: an Element set to <li>, inside the list.',
				'thingamablocks'
			);
		case 'link':
			return __(
				'The heading’s link, inside the item: a Text block set to <a>. Gets each heading’s text, and aria-current for the section being read: the tmb-toc__link--current class highlights it (remove the class for no highlight).',
				'thingamablocks'
			);
		case 'copy':
			return __(
				'The icon for the copy-link buttons on headings (when they’re switched on). Not shown in the table of contents itself.',
				'thingamablocks'
			);
	}

	return __(
		'Blocks that aren’t parts are shown as they are.',
		'thingamablocks'
	);
}

const LABELS = {
	title: __( 'Title', 'thingamablocks' ),
	chevron: __( 'Toggle icon (small screens)', 'thingamablocks' ),
	list: __( 'List', 'thingamablocks' ),
	item: __( 'Item (each heading)', 'thingamablocks' ),
	link: __( 'Link', 'thingamablocks' ),
	copy: __( 'Copy-link icon', 'thingamablocks' ),
};

const withTocPartControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, clientId, attributes, setAttributes, isSelected } = props;
		const isPartBlock = Object.values( PARTS ).includes( name );

		const insideToc = useSelect(
			( select ) =>
				isPartBlock &&
				isSelected &&
				select( blockEditorStore ).getBlockParentsByBlockName(
					clientId,
					'thingamablocks/toc'
				).length > 0,
			[ clientId, isPartBlock, isSelected ]
		);

		if ( ! insideToc ) {
			return <BlockEdit { ...props } />;
		}

		const htmlAttributes = attributes.htmlAttributes || {};
		const value = htmlAttributes[ 'data-toc-part' ] || '';

		const onChange = ( next ) => {
			const updated = { ...htmlAttributes };

			if ( next ) {
				updated[ 'data-toc-part' ] = next;
			} else {
				delete updated[ 'data-toc-part' ];
			}

			setAttributes( { htmlAttributes: updated } );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody
						title={ __(
							'Table of contents part',
							'thingamablocks'
						) }
					>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'This block is', 'thingamablocks' ) }
							value={ value }
							options={ [
								{
									value: '',
									label: __(
										'Not a part (shown as it is)',
										'thingamablocks'
									),
								},
								...Object.keys( PARTS )
									.filter(
										( part ) => PARTS[ part ] === name
									)
									.map( ( part ) => ( {
										value: part,
										label: LABELS[ part ],
									} ) ),
							] }
							help={ helpText( value ) }
							onChange={ onChange }
						/>
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withTocPartControl'
);

addFilter(
	'editor.BlockEdit',
	'thingamablocks/toc-part-control',
	withTocPartControl
);
