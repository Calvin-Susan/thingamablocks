/**
 * "Toggle part" settings on GenerateBlocks blocks.
 *
 * Any GenerateBlocks block inside a Toggle can become one of its parts. The
 * choice is stored as data-toggle-part in the block's own htmlAttributes, which is
 * where GenerateBlocks keeps custom attributes, so it's also visible and
 * editable in GB's HTML Attributes panel.
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

// Attributes the Toggle manages on its parts; cleared when a block stops being one.
export const STATE_ATTRIBUTES = [
	'aria-checked',
	'aria-pressed',
	'data-active',
];

/**
 * The state attributes a part should carry, mirroring what the server and the
 * front-end script set. Only used for the editor preview and saved markup.
 *
 * @param {Object}  part Part: { type, tagName }.
 * @param {boolean} isOn Toggle state.
 * @return {Object} Attributes.
 */
export function stateAttributes( part, isOn ) {
	if ( 'switch' === part.type ) {
		return { 'aria-checked': isOn ? 'true' : 'false' };
	}

	if ( 'on' === part.type || 'off' === part.type ) {
		const active = ( 'on' === part.type ) === isOn;
		const attributes = { 'data-active': active ? 'true' : 'false' };

		if ( 'button' === part.tagName ) {
			attributes[ 'aria-pressed' ] = attributes[ 'data-active' ];
		}

		return attributes;
	}

	return {};
}

const withTogglePartControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, clientId, attributes, setAttributes, isSelected } = props;
		const isPartBlock = PART_BLOCKS.includes( name );

		const toggleClientId = useSelect(
			( select ) => {
				if ( ! isPartBlock || ! isSelected ) {
					return null;
				}

				const parents = select(
					blockEditorStore
				).getBlockParentsByBlockName(
					clientId,
					'thingamablocks/toggle',
					true
				);

				return parents[ 0 ] || null;
			},
			[ clientId, isPartBlock, isSelected ]
		);

		if ( ! toggleClientId ) {
			return <BlockEdit { ...props } />;
		}

		const htmlAttributes = attributes.htmlAttributes || {};
		const value = htmlAttributes[ 'data-toggle-part' ] || '';

		const onChange = ( next ) => {
			const updated = { ...htmlAttributes };

			STATE_ATTRIBUTES.forEach( ( key ) => delete updated[ key ] );

			if ( next ) {
				updated[ 'data-toggle-part' ] = next;
			} else {
				delete updated[ 'data-toggle-part' ];
			}

			setAttributes( { htmlAttributes: updated } );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody
						title={ __( 'Toggle part', 'thingamablocks' ) }
						className="tmb-toggle-part-panel"
					>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __(
								'Clicking this block',
								'thingamablocks'
							) }
							value={ value }
							options={ [
								{
									value: '',
									label: __(
										'Does nothing (decoration)',
										'thingamablocks'
									),
								},
								{
									value: 'switch',
									label: __(
										'Flips the toggle (switch)',
										'thingamablocks'
									),
								},
								{
									value: 'off',
									label: __(
										'Turns it off',
										'thingamablocks'
									),
								},
								{
									value: 'on',
									label: __(
										'Turns it on',
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
	'withTogglePartControl'
);

function helpText( value ) {
	switch ( value ) {
		case 'switch':
			return __(
				'Gets role="switch" and aria-checked. Style the on state with the nested selector &[aria-checked="true"], and the knob with &[aria-checked="true"] > *.',
				'thingamablocks'
			);
		case 'on':
		case 'off':
			return __(
				'Gets data-active="true" while its state is current. If it’s a button, or the toggle has no switch, it also works as a button for keyboard and screen readers (aria-pressed). Style the current state with the nested selector &[data-active="true"].',
				'thingamablocks'
			);
		default:
			return __(
				'Choose what happens when a visitor clicks this block.',
				'thingamablocks'
			);
	}
}

addFilter(
	'editor.BlockEdit',
	'thingamablocks/toggle-part-control',
	withTogglePartControl
);
