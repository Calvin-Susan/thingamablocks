/**
 * Editor for the Marquee block.
 *
 * A settings-only wrapper: the scrolling row and the pause button are
 * GenerateBlocks blocks inside it. In the editor it stands still, so its
 * contents can be edited; the toolbar's "Preview" button plays the motion.
 */
import { __, sprintf } from '@wordpress/i18n';
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
	TextControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';

import VariationPlaceholder from '../shared/variation-placeholder';
import { marqueeIcon } from './icon';

const isVertical = ( direction ) => 'up' === direction || 'down' === direction;

/**
 * The wrapper's clipping, edge fade and height, matching the front end.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Style object.
 */
function wrapperStyle( attributes ) {
	const vertical = isVertical( attributes.direction );
	const style = { position: 'relative', overflow: 'hidden' };

	if ( vertical ) {
		style.height = attributes.height || '20rem';
	}

	if ( attributes.fadeEdges ) {
		const fade = attributes.fadeWidth || '10%';
		const mask = `linear-gradient(${ vertical ? 'to bottom' : 'to right' },transparent,#000 ${ fade },#000 calc(100% - ${ fade }),transparent)`;
		style.WebkitMaskImage = mask;
		style.maskImage = mask;
	}

	return style;
}

/**
 * Play the motion in the editor: the row slides by its own length at the
 * chosen speed. (The front end adds copies so there's no gap; the preview
 * just shows speed and direction.)
 *
 * @param {Object}  wrapperRef Ref to the block wrapper.
 * @param {boolean} playing    Whether the preview is on.
 * @param {Object}  attributes Block attributes.
 */
function usePreview( wrapperRef, playing, attributes ) {
	const { speed, direction } = attributes;

	useEffect( () => {
		const wrapper = wrapperRef.current;
		const row = wrapper?.querySelector( '[data-marquee-part="items"]' );

		if ( ! playing || ! row ) {
			return undefined;
		}

		const vertical = isVertical( direction );
		const size = vertical ? row.offsetHeight : row.offsetWidth;
		const forwards = 'left' === direction || 'up' === direction;
		const axis = vertical ? 'Y' : 'X';
		const offset = forwards ? -size : size;

		const animation = row.animate(
			[ { transform: `translate${ axis }(0)` }, { transform: `translate${ axis }(${ offset }px)` } ],
			{ duration: ( size / Math.max( 1, speed ) ) * 1000, iterations: Infinity, easing: 'linear' }
		);

		return () => animation.cancel();
	}, [ playing, speed, direction, wrapperRef ] );
}

function MotionSettings( { attributes, setAttributes } ) {
	const { speed, direction, height, pauseOnHover } = attributes;

	return (
		<PanelBody title={ __( 'Motion', 'thingamablocks' ) }>
			<RangeControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Speed', 'thingamablocks' ) }
				help={ sprintf(
					/* translators: %d: speed in pixels per second. */
					__( '%d pixels per second. The same speed whatever the length of the row.', 'thingamablocks' ),
					speed
				) }
				min={ 5 }
				max={ 300 }
				value={ speed }
				onChange={ ( value ) => setAttributes( { speed: value || 50 } ) }
			/>
			<ToggleGroupControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				isBlock
				label={ __( 'Direction', 'thingamablocks' ) }
				value={ direction }
				onChange={ ( value ) => setAttributes( { direction: value } ) }
			>
				<ToggleGroupControlOption value="left" label={ __( 'Left', 'thingamablocks' ) } />
				<ToggleGroupControlOption value="right" label={ __( 'Right', 'thingamablocks' ) } />
				<ToggleGroupControlOption value="up" label={ __( 'Up', 'thingamablocks' ) } />
				<ToggleGroupControlOption value="down" label={ __( 'Down', 'thingamablocks' ) } />
			</ToggleGroupControl>
			{ isVertical( direction ) && (
				<div className="tmb-marquee-control">
					<UnitControl
						__next40pxDefaultSize
						label={ __( 'Height', 'thingamablocks' ) }
						help={ __( 'An up/down marquee needs a fixed height to scroll within.', 'thingamablocks' ) }
						value={ height }
						units={ [
							{ value: 'rem', label: 'rem' },
							{ value: 'px', label: 'px' },
							{ value: 'vh', label: 'vh' },
						] }
						onChange={ ( value ) => setAttributes( { height: value || '20rem' } ) }
					/>
				</div>
			) }
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Pause on hover', 'thingamablocks' ) }
				help={ __( 'Also pauses while a link inside it has keyboard focus.', 'thingamablocks' ) }
				checked={ pauseOnHover }
				onChange={ ( value ) => setAttributes( { pauseOnHover: value } ) }
			/>
		</PanelBody>
	);
}

function EdgeSettings( { attributes, setAttributes } ) {
	return (
		<PanelBody title={ __( 'Edges', 'thingamablocks' ) } initialOpen={ false }>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Fade the edges', 'thingamablocks' ) }
				help={ __( 'Items fade in and out at the ends instead of being cut off.', 'thingamablocks' ) }
				checked={ attributes.fadeEdges }
				onChange={ ( value ) => setAttributes( { fadeEdges: value } ) }
			/>
			{ attributes.fadeEdges && (
				<div className="tmb-marquee-control">
					<UnitControl
						__next40pxDefaultSize
						label={ __( 'Fade width', 'thingamablocks' ) }
						value={ attributes.fadeWidth }
						units={ [
							{ value: '%', label: '%' },
							{ value: 'rem', label: 'rem' },
							{ value: 'px', label: 'px' },
						] }
						onChange={ ( value ) => setAttributes( { fadeWidth: value || '10%' } ) }
					/>
				</div>
			) }
		</PanelBody>
	);
}

function AccessibilitySettings( { attributes, setAttributes, hasPause } ) {
	return (
		<PanelBody title={ __( 'Accessibility', 'thingamablocks' ) } initialOpen={ ! hasPause }>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Label', 'thingamablocks' ) }
				help={ __(
					'Optional. Names the marquee for screen readers, e.g. “Our clients”. Copies made for the loop are hidden from them automatically, and visitors who prefer reduced motion get a still row they can scroll.',
					'thingamablocks'
				) }
				value={ attributes.ariaLabel }
				onChange={ ( value ) => setAttributes( { ariaLabel: value } ) }
			/>
			{ ! hasPause && (
				<div className="tmb-marquee-control">
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'There’s no pause button. Accessibility guidelines (WCAG 2.2.2) ask that anything moving for more than 5 seconds can be paused. Add a GenerateBlocks block and set its “Marquee part” to “Pause button”.',
							'thingamablocks'
						) }
					</Notice>
				</div>
			) }
		</PanelBody>
	);
}

function MarqueeEdit( { attributes, setAttributes, clientId } ) {
	const [ previewing, setPreviewing ] = useState( false );
	const wrapperRef = useRef();

	const parts = useSelect(
		( select ) => {
			const found = new Set();
			const walk = ( blocks ) =>
				blocks.forEach( ( block ) => {
					if ( 'thingamablocks/marquee' === block.name ) {
						return;
					}

					const part = block.attributes?.htmlAttributes?.[ 'data-marquee-part' ];

					if ( part ) {
						found.add( part );
					}

					walk( block.innerBlocks );
				} );

			walk( select( blockEditorStore ).getBlocks( clientId ) );

			return [ ...found ].sort().join( ' ' );
		},
		[ clientId ]
	);

	usePreview( wrapperRef, previewing, attributes );

	const blockProps = useBlockProps( {
		ref: wrapperRef,
		className: 'tmb-marquee',
		style: wrapperStyle( attributes ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ marqueeIcon }
						isPressed={ previewing }
						label={
							previewing
								? __( 'Stop the preview', 'thingamablocks' )
								: __( 'Preview the motion', 'thingamablocks' )
						}
						onClick={ () => setPreviewing( ! previewing ) }
					>
						{ previewing ? __( 'Stop', 'thingamablocks' ) : __( 'Preview', 'thingamablocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				{ ! parts.includes( 'items' ) && (
					<div className="tmb-marquee-notice">
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'Nothing will scroll yet. Select the GenerateBlocks Container holding your logos or words and set its “Marquee part” to “The row that scrolls”.',
								'thingamablocks'
							) }
						</Notice>
					</div>
				) }
				<MotionSettings attributes={ attributes } setAttributes={ setAttributes } />
				<EdgeSettings attributes={ attributes } setAttributes={ setAttributes } />
				<AccessibilitySettings
					attributes={ attributes }
					setAttributes={ setAttributes }
					hasPause={ parts.includes( 'pause' ) }
				/>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}

export default function Edit( props ) {
	const hasInnerBlocks = useSelect(
		( select ) => select( blockEditorStore ).getBlockCount( props.clientId ) > 0,
		[ props.clientId ]
	);

	return hasInnerBlocks ? (
		<MarqueeEdit { ...props } />
	) : (
		<VariationPlaceholder
			{ ...props }
			blockName="thingamablocks/marquee"
			icon={ marqueeIcon }
			label={ __( 'Marquee', 'thingamablocks' ) }
			instructions={ __(
				'Choose a starting layout. Everything inside is a GenerateBlocks block, so you can swap in your own logos, images or words.',
				'thingamablocks'
			) }
		/>
	);
}
