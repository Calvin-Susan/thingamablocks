/**
 * Editor for the Dropdown block.
 *
 * A settings-only wrapper: the button and the drawer are GenerateBlocks
 * blocks inside it. In the editor the drawer sits in the page flow and shows
 * while the dropdown or anything in it is selected, so it can be edited; the
 * toolbar's "Preview" button plays the reveal animation.
 */
import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	Notice,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useRef } from '@wordpress/element';

import VariationPlaceholder from '../shared/variation-placeholder';
import { dropdownIcon } from './icon';
import { DURATIONS, reveal } from './reveal';
import { speedsHelp } from '../shared/speeds-help';

function DrawerSettings( { attributes, setAttributes } ) {
	const { animation, speed, align, gap, closeOnClick } = attributes;

	return (
		<PanelBody title={ __( 'Drawer', 'thingamablocks' ) }>
			<div className="tmb-dropdown-control">
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Reveal animation', 'thingamablocks' ) }
					value={ animation }
					options={ [
						{
							value: 'none',
							label: __( 'None', 'thingamablocks' ),
						},
						{
							value: 'fade',
							label: __( 'Fade', 'thingamablocks' ),
						},
						{
							value: 'slide',
							label: __( 'Slide down', 'thingamablocks' ),
						},
						{
							value: 'grow',
							label: __( 'Grow', 'thingamablocks' ),
						},
						{
							value: 'unfold',
							label: __( 'Unfold', 'thingamablocks' ),
						},
					] }
					help={ __(
						'Plays in reverse when it closes. Visitors who ask their device for reduced motion see it open without animation.',
						'thingamablocks'
					) }
					onChange={ ( value ) =>
						setAttributes( { animation: value } )
					}
				/>
			</div>
			{ 'none' !== animation && (
				<div className="tmb-dropdown-control">
					<ToggleGroupControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						isBlock
						label={ __( 'Speed', 'thingamablocks' ) }
						help={ speedsHelp( 'dropdown', DURATIONS ) }
						value={ speed }
						onChange={ ( value ) =>
							setAttributes( { speed: value } )
						}
					>
						<ToggleGroupControlOption
							value="fast"
							label={ __( 'Fast', 'thingamablocks' ) }
						/>
						<ToggleGroupControlOption
							value="normal"
							label={ __( 'Normal', 'thingamablocks' ) }
						/>
						<ToggleGroupControlOption
							value="slow"
							label={ __( 'Slow', 'thingamablocks' ) }
						/>
					</ToggleGroupControl>
				</div>
			) }
			<div className="tmb-dropdown-control">
				<ToggleGroupControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					isBlock
					label={ __(
						'Line up with the button’s',
						'thingamablocks'
					) }
					help={ __(
						'Matters when the drawer is wider than the button. It opens below the button, flips above it when there isn’t room, and moves sideways to stay on screen.',
						'thingamablocks'
					) }
					value={ align }
					onChange={ ( value ) => setAttributes( { align: value } ) }
				>
					<ToggleGroupControlOption
						value="start"
						label={ __( 'Start', 'thingamablocks' ) }
					/>
					<ToggleGroupControlOption
						value="center"
						label={ __( 'Centre', 'thingamablocks' ) }
					/>
					<ToggleGroupControlOption
						value="end"
						label={ __( 'End', 'thingamablocks' ) }
					/>
				</ToggleGroupControl>
			</div>
			<div className="tmb-dropdown-control">
				<RangeControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __(
						'Space between button and drawer (px)',
						'thingamablocks'
					) }
					min={ 0 }
					max={ 48 }
					value={ gap }
					onChange={ ( value ) =>
						setAttributes( { gap: value ?? 8 } )
					}
				/>
			</div>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __(
					'Close when an item is clicked',
					'thingamablocks'
				) }
				help={ __(
					'Closes after a link or button inside it is used, and puts keyboard focus back on the dropdown’s button.',
					'thingamablocks'
				) }
				checked={ closeOnClick }
				onChange={ ( value ) =>
					setAttributes( { closeOnClick: value } )
				}
			/>
		</PanelBody>
	);
}

function DropdownEdit( { attributes, setAttributes, clientId, isSelected } ) {
	const wrapperRef = useRef();

	const { parts, hasSelectedChild } = useSelect(
		( select ) => {
			const store = select( blockEditorStore );
			const found = new Set();
			const walk = ( blocks ) =>
				blocks.forEach( ( block ) => {
					if ( 'thingamablocks/dropdown' === block.name ) {
						return;
					}

					const part =
						block.attributes?.htmlAttributes?.[
							'data-dropdown-part'
						];

					if ( part ) {
						found.add( part );
					}

					walk( block.innerBlocks );
				} );

			walk( store.getBlocks( clientId ) );

			return {
				parts: [ ...found ].sort().join( ' ' ),
				hasSelectedChild: store.hasSelectedInnerBlock( clientId, true ),
			};
		},
		[ clientId ]
	);

	const open = isSelected || hasSelectedChild;

	const blockProps = useBlockProps( {
		ref: wrapperRef,
		className: `tmb-dropdown ${ open ? 'is-open' : 'is-closed' }`,
		style: { '--tmb-dropdown-gap': `${ Number( attributes.gap ) || 0 }px` },
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	const preview = () => {
		const drawer = wrapperRef.current?.querySelector(
			'[data-dropdown-part="drawer"]'
		);

		if ( drawer ) {
			reveal( drawer, {
				type: attributes.animation,
				speed: attributes.speed,
			} );
		}
	};

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ dropdownIcon }
						label={ __(
							'Preview the reveal animation',
							'thingamablocks'
						) }
						disabled={ 'none' === attributes.animation || ! open }
						onClick={ preview }
					>
						{ __( 'Preview', 'thingamablocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				{ ( ! parts.includes( 'button' ) ||
					! parts.includes( 'drawer' ) ) && (
					<div className="tmb-dropdown-notice">
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'A dropdown needs a button and a drawer. Select a GenerateBlocks block inside it and set its “Dropdown part”.',
								'thingamablocks'
							) }
						</Notice>
					</div>
				) }
				<DrawerSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}

export default function Edit( props ) {
	const hasInnerBlocks = useSelect(
		( select ) =>
			select( blockEditorStore ).getBlockCount( props.clientId ) > 0,
		[ props.clientId ]
	);

	return hasInnerBlocks ? (
		<DropdownEdit { ...props } />
	) : (
		<VariationPlaceholder
			{ ...props }
			blockName="thingamablocks/dropdown"
			icon={ dropdownIcon }
			label={ __( 'Dropdown', 'thingamablocks' ) }
			instructions={ __(
				'Choose a starting layout. The button and everything in the drawer are GenerateBlocks blocks, so you can style and change them freely.',
				'thingamablocks'
			) }
		/>
	);
}
