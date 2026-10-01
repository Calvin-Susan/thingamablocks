/**
 * "Breadcrumb part" settings on GenerateBlocks blocks inside Breadcrumbs,
 * stored as data-breadcrumb-part in the block's GenerateBlocks HTML attributes.
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
	if ( 'item' === value ) {
		return __(
			'The link for each step of the trail. Style it once; it’s repeated with each page’s title and link. Use a GenerateBlocks Text block set to the <a> tag.',
			'thingamablocks'
		);
	}

	if ( 'separator' === value ) {
		return __(
			'Shown between steps, and hidden from screen readers.',
			'thingamablocks'
		);
	}

	if ( 'current' === value ) {
		return __(
			'The current page, at the end of the trail (not a link). It gets aria-current="page".',
			'thingamablocks'
		);
	}

	return __(
		'Only blocks set as a part are used; others in the Breadcrumbs block aren’t shown.',
		'thingamablocks'
	);
}

const withBreadcrumbPartControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, clientId, attributes, setAttributes, isSelected } = props;
		const isPartBlock = PART_BLOCKS.includes( name );

		const insideBreadcrumbs = useSelect(
			( select ) =>
				isPartBlock &&
				isSelected &&
				select( blockEditorStore ).getBlockParentsByBlockName(
					clientId,
					'thingamablocks/breadcrumbs'
				).length > 0,
			[ clientId, isPartBlock, isSelected ]
		);

		if ( ! insideBreadcrumbs ) {
			return <BlockEdit { ...props } />;
		}

		const htmlAttributes = attributes.htmlAttributes || {};
		const value = htmlAttributes[ 'data-breadcrumb-part' ] || '';

		const onChange = ( next ) => {
			const updated = { ...htmlAttributes };

			if ( next ) {
				updated[ 'data-breadcrumb-part' ] = next;
			} else {
				delete updated[ 'data-breadcrumb-part' ];
			}

			setAttributes( { htmlAttributes: updated } );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody
						title={ __( 'Breadcrumb part', 'thingamablocks' ) }
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
										'Not a part (not shown)',
										'thingamablocks'
									),
								},
								{
									value: 'item',
									label: __(
										'Link to each page',
										'thingamablocks'
									),
								},
								{
									value: 'separator',
									label: __( 'Separator', 'thingamablocks' ),
								},
								{
									value: 'current',
									label: __(
										'The current page',
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
	'withBreadcrumbPartControl'
);

addFilter(
	'editor.BlockEdit',
	'thingamablocks/breadcrumb-part-control',
	withBreadcrumbPartControl
);
