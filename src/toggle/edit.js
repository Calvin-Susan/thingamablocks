/**
 * Editor for the Toggle block.
 *
 * Like GB Pro's Accordion and Tabs, the Toggle is a settings-only wrapper: its
 * visible parts are GenerateBlocks blocks inside it, styled with GB's own
 * Styles panel. This component holds the behaviour settings and keeps the
 * parts' state attributes in step with "Starts as", so the editor shows the
 * state you're styling.
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
	CheckboxControl,
	ExternalLink,
	Notice,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';

import TargetsControl from '../shared/targets-control';
import VariationPlaceholder from '../shared/variation-placeholder';
import { CanvasContext, CanvasStyle, useCanvas } from '../shared/canvas-style';
import { toggleIcon } from './icon';
import { stateAttributes, STATE_ATTRIBUTES } from './parts';

const ACTION_OPTIONS = [
	{
		value: 'showHide',
		label: __( 'Show / hide elements', 'thingamablocks' ),
	},
	{
		value: 'colorScheme',
		label: __( 'Light / dark mode', 'thingamablocks' ),
	},
	{
		value: 'toggleClass',
		label: __( 'Add / remove a class', 'thingamablocks' ),
	},
	{
		value: 'none',
		label: __( 'Nothing (custom code)', 'thingamablocks' ),
	},
];

/**
 * Every descendant block marked as a toggle part, with its part type.
 * Stops at a nested Toggle, whose parts belong to it.
 *
 * @param {Function} select   Registry select.
 * @param {string}   clientId Toggle client ID.
 * @return {Array} Parts.
 */
function collectParts( select, clientId ) {
	const { getBlocks } = select( blockEditorStore );
	const parts = [];

	const walk = ( blocks ) =>
		blocks.forEach( ( block ) => {
			if ( 'thingamablocks/toggle' === block.name ) {
				return;
			}

			const type =
				block.attributes?.htmlAttributes?.[ 'data-toggle-part' ];

			if ( type ) {
				parts.push( {
					clientId: block.clientId,
					type,
					name: block.name,
					tagName: block.attributes.tagName,
					htmlAttributes: block.attributes.htmlAttributes,
				} );
			}

			walk( block.innerBlocks );
		} );

	walk( getBlocks( clientId ) );

	return parts;
}

function BehaviourSettings( { attributes, setAttributes } ) {
	const {
		action,
		showWhenOff,
		showWhenOn,
		animation,
		classTargets,
		classNames,
		classMode,
		followSystem,
		htmlClass,
	} = attributes;

	return (
		<PanelBody title={ __( 'Toggle behaviour', 'thingamablocks' ) }>
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'When toggled', 'thingamablocks' ) }
				value={ action }
				options={ ACTION_OPTIONS }
				onChange={ ( value ) => setAttributes( { action: value } ) }
			/>

			{ 'showHide' === action && (
				<>
					<TargetsControl
						label={ __( 'Show when off', 'thingamablocks' ) }
						value={ showWhenOff }
						onChange={ ( value ) =>
							setAttributes( { showWhenOff: value } )
						}
						help={ __(
							'Element IDs (e.g. monthly-prices) or CSS selectors. Hidden when the toggle is on.',
							'thingamablocks'
						) }
					/>
					<TargetsControl
						label={ __( 'Show when on', 'thingamablocks' ) }
						value={ showWhenOn }
						onChange={ ( value ) =>
							setAttributes( { showWhenOn: value } )
						}
						help={ __(
							'Hidden when the toggle is off.',
							'thingamablocks'
						) }
					/>
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
								label: __(
									'Fade and slide up',
									'thingamablocks'
								),
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { animation: value } )
						}
					/>
					<p className="tmb-toggle-help">
						{ __(
							'Give an element an ID in its Settings → HTML Attributes (GenerateBlocks) or Advanced → HTML anchor.',
							'thingamablocks'
						) }
					</p>
				</>
			) }

			{ 'colorScheme' === action && (
				<>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __(
							'Match the visitor’s system setting',
							'thingamablocks'
						) }
						help={ __(
							'Until they use the toggle, start in dark mode if their device is set to dark.',
							'thingamablocks'
						) }
						checked={ followSystem }
						onChange={ ( value ) =>
							setAttributes( { followSystem: value } )
						}
					/>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __(
							'Also add a class to <html>',
							'thingamablocks'
						) }
						help={ __(
							'Optional, e.g. is-dark. The toggle always sets data-color-scheme="dark" or "light" on <html>.',
							'thingamablocks'
						) }
						value={ htmlClass }
						onChange={ ( value ) =>
							setAttributes( { htmlClass: value } )
						}
					/>
					<p className="tmb-toggle-help">
						{ __(
							'The toggle sets the CSS color-scheme on <html>, so colours written with light-dark() switch on their own. For anything else, style [data-color-scheme="dark"] in your CSS. The visitor’s choice is remembered, and every dark mode toggle on the site stays in sync.',
							'thingamablocks'
						) }
					</p>
				</>
			) }

			{ 'toggleClass' === action && (
				<>
					<TargetsControl
						label={ __( 'Elements', 'thingamablocks' ) }
						value={ classTargets }
						onChange={ ( value ) =>
							setAttributes( { classTargets: value } )
						}
						help={ __(
							'Element IDs or CSS selectors, e.g. my-banner, body, .card',
							'thingamablocks'
						) }
					/>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Class names', 'thingamablocks' ) }
						help={ __(
							'Separate several with spaces.',
							'thingamablocks'
						) }
						value={ classNames }
						onChange={ ( value ) =>
							setAttributes( { classNames: value } )
						}
					/>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'The class is', 'thingamablocks' ) }
						value={ classMode }
						options={ [
							{
								value: 'addWhenOn',
								label: __( 'Added when on', 'thingamablocks' ),
							},
							{
								value: 'removeWhenOn',
								label: __(
									'Removed when on',
									'thingamablocks'
								),
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { classMode: value } )
						}
					/>
				</>
			) }

			{ 'none' === action && (
				<p className="tmb-toggle-help">
					{ __(
						'The toggle only changes its own state. Listen for the tmb-toggle:change event to run your own code, or style the "on" state with the .is-on class on the toggle.',
						'thingamablocks'
					) }
				</p>
			) }
		</PanelBody>
	);
}

function StateSettings( { attributes, setAttributes } ) {
	const { action, defaultState, persist, group } = attributes;
	const isColorScheme = 'colorScheme' === action;

	return (
		<PanelBody title={ __( 'State', 'thingamablocks' ) }>
			<ToggleGroupControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				isBlock
				label={ __( 'Starts as', 'thingamablocks' ) }
				help={
					isColorScheme
						? __(
								'Used when there’s no saved choice and the system setting isn’t followed.',
								'thingamablocks'
						  )
						: __(
								'The editor shows this state, so switch it to style the “on” look.',
								'thingamablocks'
						  )
				}
				value={ defaultState }
				onChange={ ( value ) =>
					setAttributes( { defaultState: value } )
				}
			>
				<ToggleGroupControlOption
					value="off"
					label={ __( 'Off', 'thingamablocks' ) }
				/>
				<ToggleGroupControlOption
					value="on"
					label={ __( 'On', 'thingamablocks' ) }
				/>
			</ToggleGroupControl>

			{ ! isColorScheme && (
				<>
					<CheckboxControl
						__nextHasNoMarginBottom
						label={ __(
							'Remember the visitor’s choice',
							'thingamablocks'
						) }
						help={ __(
							'Saved in their browser and restored on their next visit.',
							'thingamablocks'
						) }
						checked={ persist }
						onChange={ ( value ) =>
							setAttributes( { persist: value } )
						}
					/>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Sync group', 'thingamablocks' ) }
						help={ __(
							'Toggles with the same group name stay in sync, e.g. a billing toggle at the top and bottom of a pricing page.',
							'thingamablocks'
						) }
						value={ group }
						onChange={ ( value ) =>
							setAttributes( {
								// Same rules as the server: lowercase, a-z 0-9 - _.
								group: value
									.toLowerCase()
									.replace( /[^a-z0-9_-]+/g, '-' ),
							} )
						}
					/>
				</>
			) }
		</PanelBody>
	);
}

function AccessibilitySettings( { attributes, setAttributes, parts } ) {
	const hasSwitch = parts.some( ( part ) => 'switch' === part.type );
	const hasOnLabel = parts.some( ( part ) => 'on' === part.type );
	// A switch needs a name; so does a pair of buttons, whose group is announced by name.
	const needsLabel =
		! attributes.ariaLabel && ( hasSwitch ? ! hasOnLabel : hasOnLabel );

	return (
		<PanelBody
			title={ __( 'Accessibility', 'thingamablocks' ) }
			initialOpen={ needsLabel }
		>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Switch label', 'thingamablocks' ) }
				help={ __(
					'What screen readers announce for the switch, e.g. “Annual billing” or “Dark mode”. Leave empty to use the “on” label’s text.',
					'thingamablocks'
				) }
				value={ attributes.ariaLabel }
				onChange={ ( value ) => setAttributes( { ariaLabel: value } ) }
			/>
			{ needsLabel && (
				<Notice status="warning" isDismissible={ false }>
					{ hasSwitch
						? __(
								'This switch has no visible “on” label, so give it a label here.',
								'thingamablocks'
						  )
						: __(
								'Screen readers announce these buttons as a group, so give the group a label here, e.g. “Billing period”.',
								'thingamablocks'
						  ) }
				</Notice>
			) }
		</PanelBody>
	);
}

function PartsSummary( { parts } ) {
	const count = ( type ) =>
		parts.filter( ( part ) => type === part.type ).length;

	if ( parts.length ) {
		return (
			<PanelBody
				title={ __( 'Toggle parts', 'thingamablocks' ) }
				initialOpen={ false }
			>
				<ul className="tmb-toggle-parts">
					<li>
						{ sprintf(
							/* translators: %d: number of blocks. */
							__( 'Switch (flips on/off): %d', 'thingamablocks' ),
							count( 'switch' )
						) }
					</li>
					<li>
						{ sprintf(
							/* translators: %d: number of blocks. */
							__( 'Turns off: %d', 'thingamablocks' ),
							count( 'off' )
						) }
					</li>
					<li>
						{ sprintf(
							/* translators: %d: number of blocks. */
							__( 'Turns on: %d', 'thingamablocks' ),
							count( 'on' )
						) }
					</li>
				</ul>
				<p className="tmb-toggle-help">
					{ __(
						'Any GenerateBlocks block inside the toggle can become a part: select it and use its “Toggle part” panel. Style the on state with &[aria-checked="true"] on a switch or &[data-active="true"] on a label or button.',
						'thingamablocks'
					) }
				</p>
			</PanelBody>
		);
	}

	return (
		<div className="tmb-toggle-notice">
			<Notice status="warning" isDismissible={ false }>
				{ __(
					'Nothing inside this toggle is clickable yet. Select a GenerateBlocks block inside it and choose a “Toggle part”.',
					'thingamablocks'
				) }
			</Notice>
		</div>
	);
}

/**
 * Keep the parts' aria/data state in step with "Starts as". The saved HTML
 * then matches the initial state, and the editor preview shows it.
 *
 * @param {Array}  parts        Toggle parts.
 * @param {string} defaultState "on" or "off".
 */
function useSyncPartState( parts, defaultState ) {
	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const { __unstableMarkNextChangeAsNotPersistent } =
		useDispatch( blockEditorStore );

	useEffect( () => {
		const isOn = 'on' === defaultState;

		parts.forEach( ( part ) => {
			const next = { ...part.htmlAttributes };

			// Drop state attributes that no longer apply (e.g. the tag changed
			// from button to div), then add the current ones.
			STATE_ATTRIBUTES.forEach( ( key ) => delete next[ key ] );
			Object.assign( next, stateAttributes( part, isOn ) );

			const keys = new Set( [
				...Object.keys( next ),
				...Object.keys( part.htmlAttributes || {} ),
			] );
			const changed = [ ...keys ].some(
				( key ) => next[ key ] !== part.htmlAttributes?.[ key ]
			);

			if ( changed ) {
				__unstableMarkNextChangeAsNotPersistent?.();
				updateBlockAttributes( part.clientId, {
					htmlAttributes: next,
				} );
			}
		} );
	}, [
		parts,
		defaultState,
		updateBlockAttributes,
		__unstableMarkNextChangeAsNotPersistent,
	] );
}

/**
 * While the Toggle (or anything in it) is selected, dim the elements that the
 * current "Starts as" state hides, so it's clear what the toggle controls.
 * GenerateBlocks doesn't print IDs on blocks in the editor, so targets are
 * matched to blocks by their ID attribute and styled by client ID.
 *
 * @param {Object}  props            Props.
 * @param {Object}  props.attributes Toggle attributes.
 * @param {string}  props.clientId   Toggle client ID.
 * @param {boolean} props.isActive   Whether the toggle or a child is selected.
 */
function TargetPreview( { attributes, clientId, isActive } ) {
	const { action, defaultState, showWhenOff, showWhenOn } = attributes;
	const isOn = 'on' === defaultState;
	const hiddenIds = ( isOn ? showWhenOff : showWhenOn )
		.filter(
			( id ) => ! ( isOn ? showWhenOn : showWhenOff ).includes( id )
		)
		.join( ' ' );

	const hiddenClientIds = useSelect(
		( select ) => {
			if ( ! isActive || 'showHide' !== action || ! hiddenIds ) {
				return '';
			}

			const { getClientIdsWithDescendants, getBlockAttributes } =
				select( blockEditorStore );
			const wanted = hiddenIds.split( ' ' );

			return getClientIdsWithDescendants()
				.filter( ( id ) => {
					if ( id === clientId ) {
						return false;
					}

					const blockAttributes = getBlockAttributes( id ) || {};
					const htmlId =
						blockAttributes.htmlAttributes?.id ||
						blockAttributes.anchor;

					return htmlId && wanted.includes( htmlId );
				} )
				.join( ' ' );
		},
		[ isActive, action, hiddenIds, clientId ]
	);

	if ( ! hiddenClientIds ) {
		return null;
	}

	const selectors = hiddenClientIds
		.split( ' ' )
		.map( ( id ) => `[data-block="${ id }"]` )
		.join( ',' );

	return (
		<CanvasStyle>
			{ `${ selectors }{opacity:.35;outline:2px dashed currentColor;outline-offset:4px;transition:opacity .2s}` }
		</CanvasStyle>
	);
}

function ToggleEdit( { attributes, setAttributes, clientId } ) {
	const { defaultState } = attributes;

	const partsKey = useSelect(
		// A string, so the selector's result is stable between renders.
		( select ) => JSON.stringify( collectParts( select, clientId ) ),
		[ clientId ]
	);

	const parts = useMemo( () => JSON.parse( partsKey ), [ partsKey ] );
	const isOn = 'on' === defaultState;

	const isActive = useSelect(
		( select ) => {
			const { isBlockSelected, hasSelectedInnerBlock } =
				select( blockEditorStore );

			return (
				isBlockSelected( clientId ) ||
				hasSelectedInnerBlock( clientId, true )
			);
		},
		[ clientId ]
	);

	useSyncPartState( parts, defaultState );

	const [ canvas, canvasRef ] = useCanvas();

	const blockProps = useBlockProps( {
		ref: canvasRef,
		className: `tmb-toggle ${ isOn ? 'is-on' : 'is-off' }`,
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	return (
		<CanvasContext.Provider value={ canvas }>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ toggleIcon }
						isPressed={ isOn }
						label={
							isOn
								? __(
										'Showing the “on” state. Click to show “off”.',
										'thingamablocks'
								  )
								: __(
										'Showing the “off” state. Click to show “on”.',
										'thingamablocks'
								  )
						}
						onClick={ () =>
							setAttributes( {
								defaultState: isOn ? 'off' : 'on',
							} )
						}
					>
						{ isOn
							? __( 'On', 'thingamablocks' )
							: __( 'Off', 'thingamablocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				{ parts.length === 0 && <PartsSummary parts={ parts } /> }
				<BehaviourSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<StateSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<AccessibilitySettings
					attributes={ attributes }
					setAttributes={ setAttributes }
					parts={ parts }
				/>
				{ parts.length > 0 && <PartsSummary parts={ parts } /> }
				<PanelBody
					title={ __( 'Help', 'thingamablocks' ) }
					initialOpen={ false }
				>
					<p className="tmb-toggle-help">
						{ __(
							'The toggle fires an tmb-toggle:change event and exposes window.tmbToggle.get( group ) and .set( group, true ) for custom code.',
							'thingamablocks'
						) }
					</p>
					<ExternalLink href="https://ogalweb.com/">
						{ __( 'Thingamablocks', 'thingamablocks' ) }
					</ExternalLink>
				</PanelBody>
			</InspectorControls>

			{ 'colorScheme' === attributes.action && isOn && (
				// Preview dark mode in the editor while the toggle shows its "on" state.
				<CanvasStyle data-tmb-dark-preview="">
					{ ':root:root{color-scheme:dark}' }
				</CanvasStyle>
			) }
			<TargetPreview
				attributes={ attributes }
				clientId={ clientId }
				isActive={ isActive }
			/>
			<div { ...innerBlocksProps } />
		</CanvasContext.Provider>
	);
}

export default function Edit( props ) {
	const hasInnerBlocks = useSelect(
		( select ) =>
			select( blockEditorStore ).getBlockCount( props.clientId ) > 0,
		[ props.clientId ]
	);

	return hasInnerBlocks ? (
		<ToggleEdit { ...props } />
	) : (
		<VariationPlaceholder
			{ ...props }
			blockName="thingamablocks/toggle"
			icon={ toggleIcon }
			label={ __( 'Toggle', 'thingamablocks' ) }
			instructions={ __(
				'Choose a starting layout. Every part is a GenerateBlocks block, so you can restyle it afterwards.',
				'thingamablocks'
			) }
		/>
	);
}
