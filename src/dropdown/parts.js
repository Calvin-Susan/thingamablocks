/**
 * "Dropdown part" settings on GenerateBlocks blocks inside a Dropdown, stored
 * as data-dropdown-part in the block's GenerateBlocks HTML attributes.
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

const PART_BLOCKS = [
	'generateblocks/element',
	'generateblocks/text',
	'generateblocks/shape',
	'generateblocks/media',
];

function helpText( value ) {
	if ( 'button' === value ) {
		return __(
			'Opens and closes the drawer. Use a GenerateBlocks Button set to the <button> tag. It gets aria-expanded="true" while open, for styling with &[aria-expanded="true"].',
			'thingamablocks'
		);
	}

	if ( 'drawer' === value ) {
		return __(
			'What opens. Put anything inside it. It’s as wide as the button unless you give it a width in the Styles panel.',
			'thingamablocks'
		);
	}

	return __( 'What this block is in the dropdown.', 'thingamablocks' );
}

const withDropdownPartControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, clientId, attributes, setAttributes, isSelected } = props;
		const isPartBlock = PART_BLOCKS.includes( name );

		const insideDropdown = useSelect(
			( select ) =>
				isPartBlock &&
				isSelected &&
				select( blockEditorStore ).getBlockParentsByBlockName(
					clientId,
					'thingamablocks/dropdown'
				).length > 0,
			[ clientId, isPartBlock, isSelected ]
		);

		if ( ! insideDropdown ) {
			return <BlockEdit { ...props } />;
		}

		const htmlAttributes = attributes.htmlAttributes || {};
		const value = htmlAttributes[ 'data-dropdown-part' ] || '';

		const onChange = ( next ) => {
			const updated = { ...htmlAttributes };

			if ( next ) {
				updated[ 'data-dropdown-part' ] = next;
			} else {
				delete updated[ 'data-dropdown-part' ];
			}

			setAttributes( { htmlAttributes: updated } );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody
						title={ __( 'Dropdown part', 'thingamablocks' ) }
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
										'Part of the content',
										'thingamablocks'
									),
								},
								{
									value: 'button',
									label: __(
										'The button that opens it',
										'thingamablocks'
									),
								},
								{
									value: 'drawer',
									label: __( 'The drawer', 'thingamablocks' ),
								},
							] }
							help={ helpText( value ) }
							onChange={ onChange }
						/>
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withDropdownPartControl'
);

addFilter(
	'editor.BlockEdit',
	'thingamablocks/dropdown-part-control',
	withDropdownPartControl
);
