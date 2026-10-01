/**
 * "Mask" panel on the GenerateBlocks Image block.
 *
 * Shapes come from the GenerateBlocks shape library (its built-in shapes and
 * any added to it, e.g. GB Pro's Asset Library) or from an SVG uploaded or
 * pasted here. The mask is written into the block's GenerateBlocks styles as
 * mask-* CSS, at the breakpoint the editor is previewing, and GenerateBlocks
 * compiles it with the rest of the block's CSS. Nothing loads on the front
 * end. See ./styles.js and ./svg.js.
 */
import { __, sprintf } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useEffect, useMemo, useState } from '@wordpress/element';
import {
	Button,
	FocalPointPicker,
	FormFileUpload,
	Modal,
	Notice,
	PanelBody,
	TabPanel,
	TextareaControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';

import { cleanSvg, flipSvg, svgPreviewUrl, MAX_SVG_LENGTH } from './svg';
import {
	getLevels,
	readMask,
	writeMask,
	clearMask,
	hasOwnMask,
	focalPoint,
	positionFromPoint,
	STRETCH,
} from './styles';
import './editor.scss';

const BLOCK = 'generateblocks/media';
const SIZES = [ 'contain', 'cover', STRETCH ];

// What each size does to the shape. Only Stretch distorts it.
const SIZE_HELP = () => ( {
	contain: __(
		'The whole shape fits inside the image, keeping its proportions.',
		'thingamablocks'
	),
	cover: __(
		'The shape fills the image, keeping its proportions, so its edges may be cut off.',
		'thingamablocks'
	),
	[ STRETCH ]: __(
		'The shape is stretched to fill the image exactly, so it may look squashed. Good for edge shapes like waves.',
		'thingamablocks'
	),
	custom: __(
		'The shape’s width; its height follows its proportions.',
		'thingamablocks'
	),
} );

function errorMessage( error ) {
	switch ( error ) {
		case 'empty':
			return __(
				'Paste SVG code or choose an .svg file.',
				'thingamablocks'
			);
		case 'no-viewbox':
			return __(
				'This SVG has no viewBox (or width and height), so it can’t be scaled to the image.',
				'thingamablocks'
			);
		case 'no-shapes':
			return __(
				'No shapes were found in this SVG (only paths, rectangles, circles, ellipses, lines and polygons can be used as a mask).',
				'thingamablocks'
			);
		case 'too-big':
			return sprintf(
				/* translators: %d: size limit in kilobytes. */
				__(
					'This SVG is too detailed to use as a mask (over %d KB after cleaning). Try simplifying it.',
					'thingamablocks'
				),
				Math.round( MAX_SVG_LENGTH / 1000 )
			);
		default:
			return __( 'This isn’t a valid SVG file.', 'thingamablocks' );
	}
}

/**
 * The shapes in the GenerateBlocks shape library, cleaned for use as masks.
 *
 * @return {Array} Groups: { label, shapes: [ { key, label, svg } ] }.
 */
function libraryShapes() {
	const library = window.generateBlocksInfo?.svgShapes || {};

	return Object.entries( library )
		.map( ( [ groupKey, group ] ) => ( {
			key: groupKey,
			label: group?.group || groupKey,
			shapes: Object.entries( group?.svgs || {} )
				.map( ( [ key, shape ] ) => ( {
					key,
					label: shape?.label || key,
					...cleanSvg( shape?.icon ),
				} ) )
				.filter( ( shape ) => shape.svg ),
		} ) )
		.filter( ( group ) => group.shapes.length );
}

function ShapePreview( { svg, flip = '', label } ) {
	return (
		<span className="tmb-mask-preview">
			<img
				src={ svgPreviewUrl( flipSvg( svg, flip ) ) }
				alt={ label || '' }
			/>
		</span>
	);
}

function ShapeModal( { onChoose, onClose } ) {
	const groups = useMemo( libraryShapes, [] );
	const [ code, setCode ] = useState( '' );
	const [ error, setError ] = useState( '' );

	const use = ( source ) => {
		const result = cleanSvg( source );

		if ( result.error ) {
			setError( errorMessage( result.error ) );
			return;
		}

		onChoose( result.svg );
	};

	const tabs = [
		{ name: 'library', title: __( 'Shape library', 'thingamablocks' ) },
		{ name: 'upload', title: __( 'Upload or paste', 'thingamablocks' ) },
	];

	return (
		<Modal
			title={ __( 'Choose a mask shape', 'thingamablocks' ) }
			onRequestClose={ onClose }
			size="medium"
			className="tmb-mask-modal"
		>
			<TabPanel tabs={ tabs } onSelect={ () => setError( '' ) }>
				{ ( tab ) =>
					'library' === tab.name ? (
						<div className="tmb-mask-library">
							{ ! groups.length && (
								<p>
									{ __(
										'The GenerateBlocks shape library is empty.',
										'thingamablocks'
									) }
								</p>
							) }
							{ groups.map( ( group ) => (
								<div
									key={ group.key }
									className="tmb-mask-library__group"
								>
									<h2>{ group.label }</h2>
									<div className="tmb-mask-library__grid">
										{ group.shapes.map( ( shape ) => (
											<Button
												key={ shape.key }
												className="tmb-mask-library__shape"
												label={ shape.label }
												showTooltip
												onClick={ () =>
													onChoose( shape.svg )
												}
											>
												<ShapePreview
													svg={ shape.svg }
												/>
											</Button>
										) ) }
									</div>
								</div>
							) ) }
							<p className="description">
								{ __(
									'These are the shapes from the GenerateBlocks shape library, including any you’ve added (for example in GenerateBlocks Pro’s Asset Library).',
									'thingamablocks'
								) }
							</p>
						</div>
					) : (
						<div className="tmb-mask-upload">
							<FormFileUpload
								accept=".svg,image/svg+xml"
								variant="secondary"
								onChange={ async ( event ) => {
									const file = event.target.files?.[ 0 ];

									// Don't read a huge file just to reject it.
									if ( file && file.size > 2_000_000 ) {
										setError( errorMessage( 'too-big' ) );
									} else if ( file ) {
										use( await file.text() );
									}
								} }
							>
								{ __(
									'Choose an .svg file',
									'thingamablocks'
								) }
							</FormFileUpload>
							<TextareaControl
								__nextHasNoMarginBottom
								label={ __(
									'Or paste SVG code',
									'thingamablocks'
								) }
								value={ code }
								onChange={ setCode }
								rows={ 6 }
							/>
							<Button
								variant="primary"
								onClick={ () => use( code ) }
							>
								{ __( 'Use this SVG', 'thingamablocks' ) }
							</Button>
							<p className="description">
								{ __(
									'The file isn’t added to your Media Library. It’s cleaned down to its shapes (anything that could run code or load other files is removed) and stored with this image. The solid parts of the shape show the image; empty parts are see-through.',
									'thingamablocks'
								) }
							</p>
						</div>
					)
				}
			</TabPanel>
			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }
		</Modal>
	);
}

function MaskPanel( { attributes, setAttributes } ) {
	const [ choosing, setChoosing ] = useState( false );
	const device = useSelect(
		( select ) => select( 'core/editor' )?.getDeviceType?.() || 'Desktop',
		[]
	);
	const levels = getLevels();
	const level = Math.max(
		0,
		levels.findIndex( ( item ) => item.device === device )
	);
	const { styles } = attributes;
	// Reading parses the stored SVG; only redo it when the styles change.
	const { settings } = useMemo(
		() => readMask( styles, level ),
		[ styles, level ]
	);
	const hasOwn = hasOwnMask( styles, level );
	const point = focalPoint( settings.position );
	const [ customSize, setCustomSize ] = useState( settings.size );

	useEffect( () => setCustomSize( settings.size ), [ settings.size ] );

	// The image itself, for the position picker, unless it's a dynamic tag.
	const src = attributes.htmlAttributes?.src || '';
	const pickerUrl = useMemo(
		() =>
			/^(https?:)?\/\/|^\//.test( src ) && ! src.includes( '{{' )
				? src
				: svgPreviewUrl( settings.svg ),
		[ src, settings.svg ]
	);

	const update = ( changes ) =>
		setAttributes( { styles: writeMask( styles, level, changes ) } );
	const sizeMode = SIZES.includes( settings.size ) ? settings.size : 'custom';
	const flipped = ( axis ) => settings.flip.includes( axis );
	const toggleFlip = ( axis ) => {
		const x = 'x' === axis ? ! flipped( 'x' ) : flipped( 'x' );
		const y = 'y' === axis ? ! flipped( 'y' ) : flipped( 'y' );

		update( { flip: ( x ? 'x' : '' ) + ( y ? 'y' : '' ) } );
	};

	const deviceLabel = {
		Desktop: __( 'Desktop', 'thingamablocks' ),
		Tablet: __( 'Tablet', 'thingamablocks' ),
		Mobile: __( 'Mobile', 'thingamablocks' ),
	}[ levels[ level ].device ];

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Mask', 'thingamablocks' ) }
				initialOpen={ !! settings.svg }
				className="tmb-mask-panel"
			>
				<p className="tmb-mask-panel__device">
					{ 0 === level
						? __(
								'Editing: Desktop (tablet and mobile inherit these settings). Switch the editor’s preview device to change them for smaller screens.',
								'thingamablocks'
						  )
						: sprintf(
								/* translators: %s: device name (Tablet, Mobile). */
								__(
									'Editing: %s. Anything you change here applies to this screen size and smaller; the rest is inherited.',
									'thingamablocks'
								),
								deviceLabel
						  ) }
				</p>

				{ settings.svg ? (
					<div className="tmb-mask-panel__shape">
						<ShapePreview
							svg={ settings.svg }
							flip={ settings.flip }
							label={ __(
								'Current mask shape',
								'thingamablocks'
							) }
						/>
						<div className="tmb-mask-panel__shape-actions">
							<Button
								variant="secondary"
								size="compact"
								onClick={ () => setChoosing( true ) }
							>
								{ __( 'Replace shape', 'thingamablocks' ) }
							</Button>
							<Button
								variant="tertiary"
								size="compact"
								isDestructive
								onClick={ () =>
									setAttributes( {
										// Desktop: remove everywhere. Smaller: switch an inherited mask off here.
										styles:
											0 === level
												? clearMask( styles, 0 )
												: writeMask( styles, level, {
														svg: '',
												  } ),
									} )
								}
							>
								{ 0 === level
									? __( 'Remove mask', 'thingamablocks' )
									: __(
											'Remove at this size',
											'thingamablocks'
									  ) }
							</Button>
						</div>
					</div>
				) : (
					<Button
						variant="secondary"
						onClick={ () => setChoosing( true ) }
					>
						{ __( 'Choose a shape', 'thingamablocks' ) }
					</Button>
				) }

				{ settings.svg && (
					<>
						<ToggleGroupControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							isBlock
							label={ __( 'Size', 'thingamablocks' ) }
							help={ SIZE_HELP()[ sizeMode ] }
							value={ sizeMode }
							onChange={ ( mode ) =>
								update( {
									size: 'custom' === mode ? '80%' : mode,
								} )
							}
						>
							<ToggleGroupControlOption
								value="contain"
								label={ __( 'Contain', 'thingamablocks' ) }
							/>
							<ToggleGroupControlOption
								value="cover"
								label={ __( 'Cover', 'thingamablocks' ) }
							/>
							<ToggleGroupControlOption
								value="100% 100%"
								label={ __( 'Stretch', 'thingamablocks' ) }
							/>
							<ToggleGroupControlOption
								value="custom"
								label={ __( 'Custom', 'thingamablocks' ) }
							/>
						</ToggleGroupControl>

						{ 'custom' === sizeMode && (
							<UnitControl
								__next40pxDefaultSize
								label={ __( 'Shape width', 'thingamablocks' ) }
								value={ customSize }
								units={ [
									{ value: '%', label: '%' },
									{ value: 'px', label: 'px' },
									{ value: 'rem', label: 'rem' },
								] }
								onChange={ ( value ) => {
									// Let the field be cleared while typing; only store valid sizes.
									setCustomSize( value || '' );

									if (
										/^\d+(\.\d+)?(%|px|rem)$/.test(
											value || ''
										)
									) {
										update( { size: value } );
									}
								} }
							/>
						) }

						<FocalPointPicker
							__nextHasNoMarginBottom
							label={ __( 'Position', 'thingamablocks' ) }
							url={ pickerUrl }
							value={ point || { x: 0.5, y: 0.5 } }
							onChange={ ( position ) =>
								update( {
									position: positionFromPoint( position ),
								} )
							}
							help={
								point
									? undefined
									: sprintf(
											/* translators: %s: CSS mask-position value. */
											__(
												'Currently “%s” (set in the Styles panel). Moving the point replaces it.',
												'thingamablocks'
											),
											settings.position
									  )
							}
						/>

						<div
							role="group"
							aria-labelledby="tmb-mask-flip-label"
							className="tmb-mask-panel__flip-group"
						>
							<p
								id="tmb-mask-flip-label"
								className="tmb-mask-panel__label"
							>
								{ __( 'Flip', 'thingamablocks' ) }
							</p>
							<div className="tmb-mask-panel__flip">
								<Button
									variant="secondary"
									size="compact"
									isPressed={ flipped( 'x' ) }
									onClick={ () => toggleFlip( 'x' ) }
								>
									{ __( 'Horizontally', 'thingamablocks' ) }
								</Button>
								<Button
									variant="secondary"
									size="compact"
									isPressed={ flipped( 'y' ) }
									onClick={ () => toggleFlip( 'y' ) }
								>
									{ __( 'Vertically', 'thingamablocks' ) }
								</Button>
							</div>
						</div>

						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Repeat the shape', 'thingamablocks' ) }
							checked={ 'no-repeat' !== settings.repeat }
							onChange={ ( repeat ) =>
								update( {
									repeat: repeat ? 'repeat' : 'no-repeat',
								} )
							}
						/>
					</>
				) }

				{ level > 0 && hasOwn && (
					<Button
						variant="link"
						onClick={ () =>
							setAttributes( {
								styles: clearMask( styles, level ),
							} )
						}
					>
						{ sprintf(
							/* translators: %s: device name (Tablet, Mobile). */
							__(
								'Reset %s to inherited settings',
								'thingamablocks'
							),
							deviceLabel
						) }
					</Button>
				) }
			</PanelBody>

			{ choosing && (
				<ShapeModal
					onClose={ () => setChoosing( false ) }
					onChoose={ ( svg ) => {
						setChoosing( false );
						update( { svg } );
					} }
				/>
			) }
		</InspectorControls>
	);
}

const withMaskPanel = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => (
		<>
			<BlockEdit { ...props } />
			{ BLOCK === props.name && props.isSelected && (
				<MaskPanel { ...props } />
			) }
		</>
	),
	'withThingamablocksMaskPanel'
);

addFilter( 'editor.BlockEdit', 'thingamablocks/mask', withMaskPanel );
