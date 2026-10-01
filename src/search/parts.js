/**
 * "Search part" settings on GenerateBlocks blocks inside a Search block,
 * stored as data-search-part in the block's GenerateBlocks HTML attributes.
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

const HELP = {
	field: () =>
		__(
			'The box around the input. Style its border, background, padding, font and colour: the input takes on its font and colour, and the box gets a focus outline while you type (change it with &:focus-within).',
			'thingamablocks'
		),
	input: () =>
		__(
			'Becomes the text input on the site. Its text here is the placeholder. Put it inside the field.',
			'thingamablocks'
		),
	submit: () =>
		__(
			'Runs the search. Use a Text block set to <button>. Icon only is fine: it’s named after the block’s label for screen readers.',
			'thingamablocks'
		),
	label: () =>
		__(
			'A visible label for the input (a Text block). Without one, the block’s label is read out by screen readers instead.',
			'thingamablocks'
		),
	toggle: () =>
		__(
			'Opens and closes the field (put the field next to it, not inside it). The field starts hidden on the site; the button gets aria-expanded="true" while it’s open.',
			'thingamablocks'
		),
};

const withSearchPartControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, clientId, attributes, setAttributes, isSelected } = props;
		const isPartBlock = PART_BLOCKS.includes( name );

		const insideSearch = useSelect(
			( select ) =>
				isPartBlock &&
				isSelected &&
				select( blockEditorStore ).getBlockParentsByBlockName(
					clientId,
					'thingamablocks/search'
				).length > 0,
			[ clientId, isPartBlock, isSelected ]
		);

		if ( ! insideSearch ) {
			return <BlockEdit { ...props } />;
		}

		const htmlAttributes = attributes.htmlAttributes || {};
		const value = htmlAttributes[ 'data-search-part' ] || '';

		const onChange = ( next ) => {
			const updated = { ...htmlAttributes };

			if ( next ) {
				updated[ 'data-search-part' ] = next;
			} else {
				delete updated[ 'data-search-part' ];
			}

			setAttributes( { htmlAttributes: updated } );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody title={ __( 'Search part', 'thingamablocks' ) }>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'This block is', 'thingamablocks' ) }
							value={ value }
							options={ [
								{
									value: '',
									label: __(
										'Just part of the layout',
										'thingamablocks'
									),
								},
								{
									value: 'field',
									label: __(
										'The field (box around the input)',
										'thingamablocks'
									),
								},
								{
									value: 'input',
									label: __(
										'The input (its text is the placeholder)',
										'thingamablocks'
									),
								},
								{
									value: 'submit',
									label: __(
										'The search button',
										'thingamablocks'
									),
								},
								{
									value: 'label',
									label: __(
										'A visible label',
										'thingamablocks'
									),
								},
								{
									value: 'toggle',
									label: __(
										'A button that opens the field',
										'thingamablocks'
									),
								},
							] }
							help={
								HELP[ value ]?.() ||
								__(
									'What this block is in the search form.',
									'thingamablocks'
								)
							}
							onChange={ onChange }
						/>
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withSearchPartControl'
);

addFilter(
	'editor.BlockEdit',
	'thingamablocks/search-part-control',
	withSearchPartControl
);
