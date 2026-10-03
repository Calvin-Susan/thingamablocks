/**
 * Editor for the Table of Contents block.
 *
 * The block holds GenerateBlocks blocks used as templates: a list, one item
 * and its link. They're styled here once; on the site the item is repeated
 * for every heading of the post being viewed.
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';
import {
	CheckboxControl,
	Notice,
	PanelBody,
	TextControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';

import VariationPlaceholder from '../shared/variation-placeholder';
import { tocIcon } from './icon';
import { copyIcon } from './templates';

const LEVELS = [ 1, 2, 3, 4, 5, 6 ];

/**
 * Blocks inside the table of contents marked as a part, by part (not
 * looking inside a table of contents nested in this one).
 *
 * @param {Array} blocks Inner blocks.
 * @return {Object} Part name => client IDs.
 */
function findParts( blocks ) {
	const found = {};
	const walk = ( list ) =>
		list.forEach( ( block ) => {
			if ( 'thingamablocks/toc' === block.name ) {
				return;
			}

			const part = block.attributes?.htmlAttributes?.[ 'data-toc-part' ];

			if ( part ) {
				( found[ part ] = found[ part ] || [] ).push( block.clientId );
			}

			walk( block.innerBlocks );
		} );

	walk( blocks );

	return found;
}

function HeadingSettings( { attributes, setAttributes } ) {
	const levels = attributes.levels?.length ? attributes.levels : [ 2, 3 ];

	const onChange = ( level, checked ) => {
		const next = checked
			? [ ...levels, level ].sort( ( a, b ) => a - b )
			: levels.filter( ( item ) => item !== level );

		if ( next.length ) {
			setAttributes( { levels: next } );
		}
	};

	return (
		<PanelBody title={ __( 'Headings', 'thingamablocks' ) }>
			<fieldset className="tmb-toc-fieldset">
				<legend className="tmb-toc-legend">
					{ __( 'Include', 'thingamablocks' ) }
				</legend>
				<div className="tmb-toc-levels">
					{ LEVELS.map( ( level ) => (
						<CheckboxControl
							key={ level }
							__nextHasNoMarginBottom
							label={ sprintf(
								/* translators: %d: heading level, 1–6. */
								__( 'H%d', 'thingamablocks' ),
								level
							) }
							checked={ levels.includes( level ) }
							// Always at least one level.
							disabled={
								1 === levels.length && levels.includes( level )
							}
							onChange={ ( checked ) =>
								onChange( level, checked )
							}
						/>
					) ) }
				</div>
				<p className="tmb-toc-help">
					{ __(
						'Headings of the post being viewed; at least one level. Leave one out by giving it the class tmb-toc-skip (Advanced → Additional CSS class).',
						'thingamablocks'
					) }
				</p>
			</fieldset>
		</PanelBody>
	);
}

function LinkSettings( { attributes, setAttributes, clientId, parts } ) {
	const { insertBlocks, removeBlocks } = useDispatch( blockEditorStore );
	const innerCount = useSelect(
		( select ) => select( blockEditorStore ).getBlockCount( clientId ),
		[ clientId ]
	);

	const onCopyLinks = ( value ) => {
		setAttributes( { copyLinks: value } );

		// The icon is a Shape in the block, styled like any other; it's only
		// there while the buttons are on.
		if ( value && ! parts.copy ) {
			insertBlocks(
				createBlocksFromInnerBlocksTemplate( [ copyIcon ] ),
				innerCount,
				clientId,
				false
			);
		} else if ( ! value && parts.copy ) {
			removeBlocks( parts.copy, false );
		}
	};

	return (
		<PanelBody title={ __( 'Links', 'thingamablocks' ) }>
			<div className="tmb-toc-control">
				<NumberControl
					__next40pxDefaultSize
					label={ __( 'Scroll offset (px)', 'thingamablocks' ) }
					help={ __(
						'Room left above a heading when a link jumps to it, so a sticky header doesn’t cover it. Works for links shared from elsewhere too.',
						'thingamablocks'
					) }
					min={ 0 }
					max={ 500 }
					step={ 1 }
					value={ attributes.offset || '' }
					placeholder="0"
					onChange={ ( value ) =>
						setAttributes( {
							offset: Math.min(
								500,
								Math.max( 0, parseInt( value, 10 ) || 0 )
							),
						} )
					}
				/>
			</div>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Copy-link buttons', 'thingamablocks' ) }
				help={ __(
					'Adds a button to each listed heading, shown on hover or focus, that copies a link to it. Its icon is the “Copy-link icon” block in here: style it like any Shape.',
					'thingamablocks'
				) }
				checked={ !! attributes.copyLinks }
				onChange={ onCopyLinks }
			/>
		</PanelBody>
	);
}

function SmallScreenSettings( { attributes, setAttributes } ) {
	return (
		<PanelBody title={ __( 'Small screens', 'thingamablocks' ) }>
			<NumberControl
				__next40pxDefaultSize
				label={ __( 'Collapse below (px)', 'thingamablocks' ) }
				help={ __(
					'Narrower than this, the list starts closed and the title becomes a button that opens it, showing the section being read. Empty: never collapse.',
					'thingamablocks'
				) }
				min={ 0 }
				max={ 3000 }
				step={ 1 }
				value={ attributes.collapseBelow || '' }
				placeholder={ __( 'Never', 'thingamablocks' ) }
				onChange={ ( value ) =>
					setAttributes( {
						collapseBelow: Math.min(
							3000,
							Math.max( 0, parseInt( value, 10 ) || 0 )
						),
					} )
				}
			/>
		</PanelBody>
	);
}

function AccessibilitySettings( { attributes, setAttributes } ) {
	return (
		<PanelBody
			title={ __( 'Accessibility', 'thingamablocks' ) }
			initialOpen={ false }
		>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Label', 'thingamablocks' ) }
				placeholder={ __( 'Table of contents', 'thingamablocks' ) }
				help={ __(
					'Names the navigation for screen readers.',
					'thingamablocks'
				) }
				value={ attributes.ariaLabel }
				onChange={ ( value ) => setAttributes( { ariaLabel: value } ) }
			/>
		</PanelBody>
	);
}

function TocEdit( { attributes, setAttributes, clientId } ) {
	// A string from the store (a new object each time would re-render on
	// every change in the editor).
	const partsJson = useSelect(
		( select ) =>
			JSON.stringify(
				findParts( select( blockEditorStore ).getBlocks( clientId ) )
			),
		[ clientId ]
	);
	const parts = useMemo( () => JSON.parse( partsJson ), [ partsJson ] );
	const missing = [ 'list', 'item', 'link' ].filter(
		( part ) => ! parts[ part ]
	);

	const blockProps = useBlockProps( { className: 'tmb-toc' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	return (
		<>
			<InspectorControls>
				<div className="tmb-toc-notice">
					{ missing.length ? (
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'Needs a list (an Element set to <ul>), an item inside it (an Element set to <li>) and a link inside that (a Text block set to <a>), each set as that “Table of contents part”. Missing parts become a plain list.',
								'thingamablocks'
							) }
						</Notice>
					) : (
						<p className="tmb-toc-help">
							{ __(
								'The list, item and link are templates: style them once and the item is repeated for every heading of the post being viewed, sub-headings in a nested copy of the list. The link’s tmb-toc__link--current class highlights the section being read; remove it for no highlight.',
								'thingamablocks'
							) }
						</p>
					) }
				</div>
				<HeadingSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<LinkSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
					clientId={ clientId }
					parts={ parts }
				/>
				<SmallScreenSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<AccessibilitySettings
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
		<TocEdit { ...props } />
	) : (
		<VariationPlaceholder
			{ ...props }
			blockName="thingamablocks/toc"
			icon={ tocIcon }
			label={ __( 'Table of Contents', 'thingamablocks' ) }
			instructions={ __(
				'Choose a starting style. The title, list, item and link are GenerateBlocks blocks you can restyle; the list itself is built from the headings of the post being viewed.',
				'thingamablocks'
			) }
		/>
	);
}
