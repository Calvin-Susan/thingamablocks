/**
 * "Marquee part" settings on GenerateBlocks blocks inside a Marquee, stored
 * as data-marquee-part in the block's GenerateBlocks HTML attributes.
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
	if ( 'items' === value ) {
		return __(
			'This block scrolls. Put the logos, images or words inside it, and set the space between them with its gap.',
			'thingamablocks'
		);
	}

	if ( 'pause' === value ) {
		return __(
			'Pauses and restarts the scrolling. It gets aria-pressed="true" while paused, for styling with &[aria-pressed="true"].',
			'thingamablocks'
		);
	}

	return __( 'What this block is in the marquee.', 'thingamablocks' );
}

const withMarqueePartControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, clientId, attributes, setAttributes, isSelected } = props;
		const isPartBlock = PART_BLOCKS.includes( name );

		const insideMarquee = useSelect(
			( select ) =>
				isPartBlock &&
				isSelected &&
				select( blockEditorStore ).getBlockParentsByBlockName(
					clientId,
					'thingamablocks/marquee'
				).length > 0,
			[ clientId, isPartBlock, isSelected ]
		);

		if ( ! insideMarquee ) {
			return <BlockEdit { ...props } />;
		}

		const htmlAttributes = attributes.htmlAttributes || {};
		const value = htmlAttributes[ 'data-marquee-part' ] || '';

		const onChange = ( next ) => {
			const updated = { ...htmlAttributes };

			if ( next ) {
				updated[ 'data-marquee-part' ] = next;
			} else {
				delete updated[ 'data-marquee-part' ];
			}

			setAttributes( { htmlAttributes: updated } );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody title={ __( 'Marquee part', 'thingamablocks' ) }>
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
									value: 'items',
									label: __(
										'The row that scrolls',
										'thingamablocks'
									),
								},
								{
									value: 'pause',
									label: __(
										'Pause button',
										'thingamablocks'
									),
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
	'withMarqueePartControl'
);

addFilter(
	'editor.BlockEdit',
	'thingamablocks/marquee-part-control',
	withMarqueePartControl
);
