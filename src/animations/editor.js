/**
 * "Entrance animation" panel on every GenerateBlocks block.
 *
 * The settings are stored in the block's own GenerateBlocks HTML attributes,
 * so GenerateBlocks saves and renders them; nothing about its markup changes.
 */
import { __, sprintf } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { getBlockType } from '@wordpress/blocks';
import {
	Button,
	FormTokenField,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

import { animateIn, SPEEDS } from './presets';
import { speedsHelp } from '../shared/speeds';
import { usePageIds } from '../shared/targets-control';

const KEYS = {
	type: 'data-tmb-animate',
	speed: 'data-tmb-speed',
	delay: 'data-tmb-delay',
	children: 'data-tmb-animate-children',
	replay: 'data-tmb-replay',
};

// What "replay everything on the page" is stored as (not a valid ID).
const WHOLE_PAGE = '*';
const isPlainId = ( value ) => /^[A-Za-z][\w-]*$/.test( value );

/**
 * GenerateBlocks 2 blocks (and GB Pro's) keep custom attributes in
 * htmlAttributes; the old v1 blocks don't, so they're left out.
 *
 * @param {string} name Block name.
 * @return {boolean} Whether the panel applies.
 */
function supportsAnimation( name ) {
	return (
		/^generateblocks(-pro)?\//.test( name ) &&
		!! getBlockType( name )?.attributes?.htmlAttributes
	);
}

function preview( clientId, settings ) {
	const frame = document.querySelector( 'iframe[name="editor-canvas"]' );
	const doc = frame?.contentDocument || document;
	const element = doc.querySelector( `[data-block="${ clientId }"]` );

	if ( ! element || ! settings.type ) {
		return;
	}

	if ( null === settings.children ) {
		animateIn( element, settings.type, 0, settings.speed );
		return;
	}

	// Inner blocks are wrapped in the editor; animate each block wrapper.
	[
		...element.querySelectorAll(
			':scope > .block-editor-block-list__block, :scope > * > .block-editor-block-list__block'
		),
	]
		.filter(
			( child ) =>
				child.parentElement.closest( '[data-block]' ) === element
		)
		.forEach( ( child, index ) =>
			animateIn(
				child,
				settings.type,
				index * ( Number( settings.children ) || 0 ),
				settings.speed
			)
		);
}

function AnimationPanel( { attributes, setAttributes, clientId } ) {
	const htmlAttributes = attributes.htmlAttributes || {};
	const blockCount = useSelect(
		( select ) => select( blockEditorStore ).getBlockCount( clientId ),
		[ clientId ]
	);
	// "One by one" only makes sense for a block with blocks inside it.
	const hasInnerBlocks =
		blockCount > 1 || null !== ( htmlAttributes[ KEYS.children ] ?? null );

	const settings = {
		type: htmlAttributes[ KEYS.type ] || '',
		speed: htmlAttributes[ KEYS.speed ] || 'normal',
		delay: Number( htmlAttributes[ KEYS.delay ] ) || 0,
		children: htmlAttributes[ KEYS.children ] ?? null,
	};

	const update = ( next ) => {
		const merged = { ...settings, ...next };
		const updated = { ...htmlAttributes };

		Object.values( KEYS )
			.filter( ( key ) => KEYS.replay !== key )
			.forEach( ( key ) => delete updated[ key ] );

		// Only store what differs from the defaults, so markup stays tidy.
		if ( merged.type ) {
			updated[ KEYS.type ] = merged.type;

			if ( 'normal' !== merged.speed ) {
				updated[ KEYS.speed ] = merged.speed;
			}

			if ( merged.delay ) {
				updated[ KEYS.delay ] = String( merged.delay );
			}

			if ( null !== merged.children ) {
				updated[ KEYS.children ] = String( merged.children );
			}
		}

		setAttributes( { htmlAttributes: updated } );
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Entrance animation', 'thingamablocks' ) }
				initialOpen={
					!! settings.type ||
					undefined !== htmlAttributes[ KEYS.replay ]
				}
				className="tmb-animation-panel"
			>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Animation', 'thingamablocks' ) }
					value={ settings.type }
					options={ [
						{ value: '', label: __( 'None', 'thingamablocks' ) },
						{
							value: 'fade',
							label: __( 'Fade in', 'thingamablocks' ),
						},
						{
							value: 'fade-up',
							label: __( 'Fade up', 'thingamablocks' ),
						},
						{
							value: 'fade-down',
							label: __( 'Fade down', 'thingamablocks' ),
						},
						{
							value: 'fade-left',
							label: __(
								'Slide in from the left',
								'thingamablocks'
							),
						},
						{
							value: 'fade-right',
							label: __(
								'Slide in from the right',
								'thingamablocks'
							),
						},
						{
							value: 'zoom',
							label: __( 'Zoom in', 'thingamablocks' ),
						},
					] }
					help={ __(
						'Plays once, when the block scrolls into view. Best kept off the first thing visitors see (like a hero heading or image): it stays hidden until the script runs, which can slow the page’s loading score (LCP).',
						'thingamablocks'
					) }
					onChange={ ( type ) => {
						update( { type } );

						if ( type ) {
							// Show the chosen animation straight away.
							window.setTimeout(
								() =>
									preview( clientId, { ...settings, type } ),
								50
							);
						}
					} }
				/>

				{ settings.type && (
					<>
						<div className="tmb-animation-control">
							<ToggleGroupControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								isBlock
								label={ __( 'Speed', 'thingamablocks' ) }
								help={ speedsHelp( 'animations', SPEEDS ) }
								value={ settings.speed }
								onChange={ ( speed ) => update( { speed } ) }
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
						<RangeControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Delay (ms)', 'thingamablocks' ) }
							min={ 0 }
							max={ 2000 }
							step={ 100 }
							value={ settings.delay }
							onChange={ ( delay ) =>
								update( { delay: delay || 0 } )
							}
						/>
						{ hasInnerBlocks && (
							<div className="tmb-animation-control">
								<ToggleControl
									__nextHasNoMarginBottom
									label={ __(
										'Animate the blocks inside one by one',
										'thingamablocks'
									) }
									help={ __(
										'The block itself stays put, and each block inside it animates in turn. Great for grids and cards; for a query loop, set it on the Looper.',
										'thingamablocks'
									) }
									checked={ null !== settings.children }
									onChange={ ( on ) =>
										update( { children: on ? 100 : null } )
									}
								/>
								{ null !== settings.children && (
									<RangeControl
										__next40pxDefaultSize
										__nextHasNoMarginBottom
										label={ __(
											'Time between each (ms)',
											'thingamablocks'
										) }
										min={ 50 }
										max={ 500 }
										step={ 25 }
										value={
											Number( settings.children ) || 100
										}
										onChange={ ( children ) =>
											update( {
												children: children || 100,
											} )
										}
									/>
								) }
							</div>
						) }
						<Button
							variant="secondary"
							size="compact"
							onClick={ () => preview( clientId, settings ) }
						>
							{ __( 'Preview', 'thingamablocks' ) }
						</Button>
					</>
				) }
				{ /* On a container, the whole container would become the button. */ }
				{ ( 0 === blockCount ||
					undefined !== htmlAttributes[ KEYS.replay ] ) && (
					<ReplayControl
						value={ htmlAttributes[ KEYS.replay ] }
						onChange={ ( replay ) => {
							const updated = { ...htmlAttributes };

							delete updated[ KEYS.replay ];

							if ( undefined !== replay ) {
								updated[ KEYS.replay ] = replay;
							}

							setAttributes( { htmlAttributes: updated } );
						} }
					/>
				) }
			</PanelBody>
		</InspectorControls>
	);
}

/**
 * Make the block a button that plays the animations in some blocks again.
 *
 * @param {Object}   props
 * @param {string}   props.value    Space-separated IDs, "*" or undefined (off).
 * @param {Function} props.onChange New value.
 */
function ReplayControl( { value, onChange } ) {
	const pageIds = usePageIds();
	const on = undefined !== value;
	const ids =
		on && WHOLE_PAGE !== value
			? value.split( /\s+/ ).filter( Boolean )
			: [];
	const missing = ids.filter( ( id ) => ! pageIds.includes( id ) );

	return (
		<div className="tmb-animation-control tmb-animation-replay">
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Replay button', 'thingamablocks' ) }
				help={ __(
					'Clicking this block plays the entrance animations again. Best on a Text block set to Button. Hidden for visitors who prefer reduced motion.',
					'thingamablocks'
				) }
				checked={ on }
				onChange={ ( checked ) =>
					onChange( checked ? WHOLE_PAGE : undefined )
				}
			/>
			{ on && (
				<>
					<FormTokenField
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __(
							'Replay the blocks with these IDs',
							'thingamablocks'
						) }
						value={ ids }
						suggestions={ pageIds.filter(
							( id ) => ! ids.includes( id )
						) }
						onChange={ ( tokens ) => {
							const next = tokens
								.map( ( token ) =>
									( 'string' === typeof token
										? token
										: token.value
									)
										.trim()
										.replace( /^#/, '' )
								)
								.filter( isPlainId );

							onChange(
								next.length
									? [ ...new Set( next ) ].join( ' ' )
									: WHOLE_PAGE
							);
						} }
						__experimentalExpandOnFocus
						__experimentalShowHowTo={ false }
						help={
							ids.length
								? __(
										'Plays the animations inside these blocks (and on them) again.',
										'thingamablocks'
								  )
								: __(
										'Empty: replays every animation on the page. Add a section’s HTML ID to replay just that section.',
										'thingamablocks'
								  )
						}
					/>
					{ missing.length > 0 && (
						<p
							style={ {
								margin: '8px 0 0',
								color: '#b26200',
								fontSize: '12px',
							} }
						>
							{ sprintf(
								/* translators: %s: comma-separated list of element IDs. */
								__(
									'Not found on this page: %s. That’s fine if it lives in a header, footer or other template part.',
									'thingamablocks'
								),
								missing.join( ', ' )
							) }
						</p>
					) }
				</>
			) }
		</div>
	);
}

const withEntranceAnimation = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! props.isSelected || ! supportsAnimation( props.name ) ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<>
				<BlockEdit { ...props } />
				<AnimationPanel
					attributes={ props.attributes }
					setAttributes={ props.setAttributes }
					clientId={ props.clientId }
				/>
			</>
		);
	},
	'withEntranceAnimation'
);

addFilter(
	'editor.BlockEdit',
	'thingamablocks/entrance-animation',
	withEntranceAnimation
);
