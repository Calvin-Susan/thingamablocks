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
	__experimentalBlockVariationPicker as BlockVariationPicker,
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
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import {
	createBlocksFromInnerBlocksTemplate,
	store as blocksStore,
} from '@wordpress/blocks';

import TargetsControl from './targets-control';
import { toggleIcon } from './icon';
import { stateAttributes } from './parts';

const ACTION_OPTIONS = [
	{
		value: 'showHide',
		label: __( 'Show / hide elements', 'toggle-for-generateblocks' ),
	},
	{
		value: 'colorScheme',
		label: __( 'Light / dark mode', 'toggle-for-generateblocks' ),
	},
	{
		value: 'toggleClass',
		label: __( 'Add / remove a class', 'toggle-for-generateblocks' ),
	},
	{
		value: 'none',
		label: __( 'Nothing (custom code)', 'toggle-for-generateblocks' ),
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
			if ( 'ogal/toggle' === block.name ) {
				return;
			}

			const type = block.attributes?.htmlAttributes?.[ 'data-toggle' ];

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

function Placeholder( { clientId, setAttributes } ) {
	const { variations, defaultVariation } = useSelect( ( select ) => {
		const { getBlockVariations, getDefaultBlockVariation } =
			select( blocksStore );

		return {
			variations: getBlockVariations( 'ogal/toggle', 'block' ),
			defaultVariation: getDefaultBlockVariation( 'ogal/toggle', 'block' ),
		};
	}, [] );
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			<BlockVariationPicker
				icon={ toggleIcon }
				label={ __( 'Toggle', 'toggle-for-generateblocks' ) }
				instructions={ __(
					'Choose a starting layout. Every part is a GenerateBlocks block, so you can restyle it afterwards.',
					'toggle-for-generateblocks'
				) }
				variations={ variations }
				onSelect={ ( variation = defaultVariation ) => {
					if ( variation.attributes ) {
						setAttributes( variation.attributes );
					}

					if ( variation.innerBlocks ) {
						replaceInnerBlocks(
							clientId,
							createBlocksFromInnerBlocksTemplate(
								variation.innerBlocks
							),
							true
						);
					}
				} }
				allowSkip
			/>
		</div>
	);
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
		<PanelBody title={ __( 'Toggle behaviour', 'toggle-for-generateblocks' ) }>
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'When toggled', 'toggle-for-generateblocks' ) }
				value={ action }
				options={ ACTION_OPTIONS }
				onChange={ ( value ) => setAttributes( { action: value } ) }
			/>

			{ 'showHide' === action && (
				<>
					<TargetsControl
						label={ __( 'Show when off', 'toggle-for-generateblocks' ) }
						value={ showWhenOff }
						onChange={ ( value ) => setAttributes( { showWhenOff: value } ) }
						help={ __(
							'Element IDs (e.g. monthly-prices) or CSS selectors. Hidden when the toggle is on.',
							'toggle-for-generateblocks'
						) }
					/>
					<TargetsControl
						label={ __( 'Show when on', 'toggle-for-generateblocks' ) }
						value={ showWhenOn }
						onChange={ ( value ) => setAttributes( { showWhenOn: value } ) }
						help={ __(
							'Hidden when the toggle is off.',
							'toggle-for-generateblocks'
						) }
					/>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Reveal animation', 'toggle-for-generateblocks' ) }
						value={ animation }
						options={ [
							{ value: 'none', label: __( 'None', 'toggle-for-generateblocks' ) },
							{ value: 'fade', label: __( 'Fade', 'toggle-for-generateblocks' ) },
							{
								value: 'slide',
								label: __( 'Fade and slide up', 'toggle-for-generateblocks' ),
							},
						] }
						onChange={ ( value ) => setAttributes( { animation: value } ) }
					/>
					<p className="ogal-toggle-help">
						{ __(
							'Give an element an ID in its Settings → HTML Attributes (GenerateBlocks) or Advanced → HTML anchor.',
							'toggle-for-generateblocks'
						) }
					</p>
				</>
			) }

			{ 'colorScheme' === action && (
				<>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Match the visitor’s system setting', 'toggle-for-generateblocks' ) }
						help={ __(
							'Until they use the toggle, start in dark mode if their device is set to dark.',
							'toggle-for-generateblocks'
						) }
						checked={ followSystem }
						onChange={ ( value ) => setAttributes( { followSystem: value } ) }
					/>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Also add a class to <html>', 'toggle-for-generateblocks' ) }
						help={ __(
							'Optional, e.g. is-dark. The toggle always sets data-color-scheme="dark" or "light" on <html>.',
							'toggle-for-generateblocks'
						) }
						value={ htmlClass }
						onChange={ ( value ) => setAttributes( { htmlClass: value } ) }
					/>
					<Notice status="info" isDismissible={ false }>
						{ __(
							'Dark mode colours come from your CSS. With GeneratePress, override the global colour variables, e.g. [data-color-scheme="dark"] { --base-3: #111; --contrast: #f2f2f2; }. The choice is remembered, and all dark mode toggles on the site stay in sync.',
							'toggle-for-generateblocks'
						) }
					</Notice>
				</>
			) }

			{ 'toggleClass' === action && (
				<>
					<TargetsControl
						label={ __( 'Elements', 'toggle-for-generateblocks' ) }
						value={ classTargets }
						onChange={ ( value ) => setAttributes( { classTargets: value } ) }
						help={ __(
							'Element IDs or CSS selectors, e.g. site-header, body, .card',
							'toggle-for-generateblocks'
						) }
					/>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Class names', 'toggle-for-generateblocks' ) }
						help={ __( 'Separate several with spaces.', 'toggle-for-generateblocks' ) }
						value={ classNames }
						onChange={ ( value ) => setAttributes( { classNames: value } ) }
					/>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'The class is', 'toggle-for-generateblocks' ) }
						value={ classMode }
						options={ [
							{
								value: 'addWhenOn',
								label: __( 'Added when on', 'toggle-for-generateblocks' ),
							},
							{
								value: 'removeWhenOn',
								label: __( 'Removed when on', 'toggle-for-generateblocks' ),
							},
						] }
						onChange={ ( value ) => setAttributes( { classMode: value } ) }
					/>
				</>
			) }

			{ 'none' === action && (
				<p className="ogal-toggle-help">
					{ __(
						'The toggle only changes its own state. Listen for the ogal-toggle:change event to run your own code, or style the "on" state with the .is-on class on the toggle.',
						'toggle-for-generateblocks'
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
		<PanelBody title={ __( 'State', 'toggle-for-generateblocks' ) }>
			<ToggleGroupControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				isBlock
				label={ __( 'Starts as', 'toggle-for-generateblocks' ) }
				help={
					isColorScheme
						? __(
								'Used when there’s no saved choice and the system setting isn’t followed.',
								'toggle-for-generateblocks'
						  )
						: __(
								'The editor shows this state, so switch it to style the “on” look.',
								'toggle-for-generateblocks'
						  )
				}
				value={ defaultState }
				onChange={ ( value ) => setAttributes( { defaultState: value } ) }
			>
				<ToggleGroupControlOption
					value="off"
					label={ __( 'Off', 'toggle-for-generateblocks' ) }
				/>
				<ToggleGroupControlOption
					value="on"
					label={ __( 'On', 'toggle-for-generateblocks' ) }
				/>
			</ToggleGroupControl>

			{ ! isColorScheme && (
				<>
					<CheckboxControl
						__nextHasNoMarginBottom
						label={ __( 'Remember the visitor’s choice', 'toggle-for-generateblocks' ) }
						help={ __(
							'Saved in their browser and restored on their next visit.',
							'toggle-for-generateblocks'
						) }
						checked={ persist }
						onChange={ ( value ) => setAttributes( { persist: value } ) }
					/>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Sync group', 'toggle-for-generateblocks' ) }
						help={ __(
							'Toggles with the same group name stay in sync, e.g. a billing toggle at the top and bottom of a pricing page.',
							'toggle-for-generateblocks'
						) }
						value={ group }
						onChange={ ( value ) => setAttributes( { group: value } ) }
					/>
				</>
			) }
		</PanelBody>
	);
}

function AccessibilitySettings( { attributes, setAttributes, parts } ) {
	const hasSwitch = parts.some( ( part ) => 'switch' === part.type );
	const hasOnLabel = parts.some( ( part ) => 'on' === part.type );
	const needsLabel = hasSwitch && ! hasOnLabel && ! attributes.ariaLabel;

	return (
		<PanelBody
			title={ __( 'Accessibility', 'toggle-for-generateblocks' ) }
			initialOpen={ needsLabel }
		>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Switch label', 'toggle-for-generateblocks' ) }
				help={ __(
					'What screen readers announce for the switch, e.g. “Annual billing” or “Dark mode”. Leave empty to use the “on” label’s text.',
					'toggle-for-generateblocks'
				) }
				value={ attributes.ariaLabel }
				onChange={ ( value ) => setAttributes( { ariaLabel: value } ) }
			/>
			{ needsLabel && (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'This switch has no visible “on” label, so give it a label here.',
						'toggle-for-generateblocks'
					) }
				</Notice>
			) }
		</PanelBody>
	);
}

function PartsSummary( { parts } ) {
	const count = ( type ) => parts.filter( ( part ) => type === part.type ).length;

	if ( parts.length ) {
		return (
			<PanelBody
				title={ __( 'Toggle parts', 'toggle-for-generateblocks' ) }
				initialOpen={ false }
			>
				<ul className="ogal-toggle-parts">
					<li>
						{ sprintf(
							/* translators: %d: number of blocks. */
							__( 'Switch (flips on/off): %d', 'toggle-for-generateblocks' ),
							count( 'switch' )
						) }
					</li>
					<li>
						{ sprintf(
							/* translators: %d: number of blocks. */
							__( 'Turns off: %d', 'toggle-for-generateblocks' ),
							count( 'off' )
						) }
					</li>
					<li>
						{ sprintf(
							/* translators: %d: number of blocks. */
							__( 'Turns on: %d', 'toggle-for-generateblocks' ),
							count( 'on' )
						) }
					</li>
				</ul>
				<p className="ogal-toggle-help">
					{ __(
						'Any GenerateBlocks block inside the toggle can become a part: select it and use its “Toggle part” panel. Style the on state with &[aria-checked="true"] on a switch or &[data-active="true"] on a label or button.',
						'toggle-for-generateblocks'
					) }
				</p>
			</PanelBody>
		);
	}

	return (
		<div className="ogal-toggle-notice">
			<Notice status="warning" isDismissible={ false }>
				{ __(
					'Nothing inside this toggle is clickable yet. Select a GenerateBlocks block inside it and choose a “Toggle part”.',
					'toggle-for-generateblocks'
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
			const next = {
				...part.htmlAttributes,
				...stateAttributes( part, isOn ),
			};

			const changed = Object.keys( next ).some(
				( key ) => next[ key ] !== part.htmlAttributes?.[ key ]
			);

			if ( changed ) {
				__unstableMarkNextChangeAsNotPersistent?.();
				updateBlockAttributes( part.clientId, { htmlAttributes: next } );
			}
		} );
	}, [ parts, defaultState ] );
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

	useSyncPartState( parts, defaultState );

	const blockProps = useBlockProps( {
		className: `ogal-toggle ${ isOn ? 'is-on' : 'is-off' }`,
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ toggleIcon }
						isPressed={ isOn }
						label={
							isOn
								? __( 'Showing the “on” state. Click to show “off”.', 'toggle-for-generateblocks' )
								: __( 'Showing the “off” state. Click to show “on”.', 'toggle-for-generateblocks' )
						}
						onClick={ () =>
							setAttributes( { defaultState: isOn ? 'off' : 'on' } )
						}
					>
						{ isOn
							? __( 'On', 'toggle-for-generateblocks' )
							: __( 'Off', 'toggle-for-generateblocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PartsSummary parts={ parts } />
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
				<PanelBody
					title={ __( 'Help', 'toggle-for-generateblocks' ) }
					initialOpen={ false }
				>
					<p className="ogal-toggle-help">
						{ __(
							'The toggle fires an ogal-toggle:change event and exposes window.ogalToggle.get( group ) and .set( group, true ) for custom code.',
							'toggle-for-generateblocks'
						) }
					</p>
					<ExternalLink href="https://ogalweb.com/">
						{ __( 'Toggle for GenerateBlocks', 'toggle-for-generateblocks' ) }
					</ExternalLink>
				</PanelBody>
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

	return hasInnerBlocks ? <ToggleEdit { ...props } /> : <Placeholder { ...props } />;
}
