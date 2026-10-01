/**
 * Editor for the Search block.
 *
 * A settings-only wrapper: the field, input and buttons are GenerateBlocks
 * blocks inside it. On the site the wrapper is a <form role="search">, and
 * the "input" part becomes a real search input (see
 * includes/class-thingamablocks-search-render.php).
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	CheckboxControl,
	Notice,
	PanelBody,
	TextControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';

import VariationPlaceholder from '../shared/variation-placeholder';
import { searchIcon } from './icon';

function ContentTypes( { value, onChange } ) {
	// The store's own (cached) list; null while it loads.
	const all = useSelect(
		( select ) => select( 'core' ).getPostTypes( { per_page: -1 } ),
		[]
	);
	const types = useMemo(
		() =>
			( all || [] )
				.filter(
					( type ) => type.viewable && 'attachment' !== type.slug
				)
				.map( ( type ) => ( { slug: type.slug, name: type.name } ) ),
		[ all ]
	);

	// Chosen types the site no longer has (a plugin was switched off) stay listed.
	const missing = all
		? value.filter(
				( slug ) => ! types.some( ( type ) => type.slug === slug )
		  )
		: [];

	const toggle = ( slug, checked ) =>
		onChange(
			checked
				? [ ...value, slug ]
				: value.filter( ( item ) => item !== slug )
		);

	return (
		<fieldset className="tmb-search-types">
			<legend>{ __( 'Search only', 'thingamablocks' ) }</legend>
			{ types.map( ( type ) => (
				<CheckboxControl
					key={ type.slug }
					__nextHasNoMarginBottom
					label={ type.name }
					checked={ value.includes( type.slug ) }
					onChange={ ( checked ) => toggle( type.slug, checked ) }
				/>
			) ) }
			{ missing.map( ( slug ) => (
				<CheckboxControl
					key={ slug }
					__nextHasNoMarginBottom
					label={ sprintf(
						/* translators: %s: post type slug. */
						__( '%s (not found on this site)', 'thingamablocks' ),
						slug
					) }
					checked
					onChange={ () => toggle( slug, false ) }
				/>
			) ) }
			<p className="components-base-control__help">
				{ value.length
					? __(
							'Results only include these. The results page is your theme’s normal search page.',
							'thingamablocks'
					  )
					: __(
							'Nothing ticked: searches everything, like WordPress’s own search.',
							'thingamablocks'
					  ) }
			</p>
		</fieldset>
	);
}

function SearchEdit( { attributes, setAttributes, clientId } ) {
	const parts = useSelect(
		( select ) => {
			const found = new Set();
			const walk = ( blocks ) =>
				blocks.forEach( ( block ) => {
					const value =
						block.attributes?.htmlAttributes?.[
							'data-search-part'
						];

					if ( value ) {
						found.add( value );
					}

					// Only a real <button> runs the search.
					if (
						'submit' === value &&
						'button' !== block.attributes?.tagName
					) {
						found.add( 'submit-not-button' );
					}

					walk( block.innerBlocks );
				} );

			walk( select( blockEditorStore ).getBlocks( clientId ) );

			return [ ...found ].sort().join( ' ' );
		},
		[ clientId ]
	);

	const blockProps = useBlockProps( {
		className: `tmb-search${
			parts.includes( 'toggle' ) ? ' has-toggle' : ''
		}`,
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	return (
		<>
			<InspectorControls>
				{ ! parts.includes( 'input' ) && (
					<div className="tmb-search-notice">
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'A search needs an input. Select a GenerateBlocks Text block inside it and set its “Search part” to The input.',
								'thingamablocks'
							) }
						</Notice>
					</div>
				) }
				{ parts.includes( 'submit-not-button' ) && (
					<div className="tmb-search-notice">
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'The search button should be a Text block set to the <button> tag: anything else doesn’t run the search when clicked (Enter in the field still does).',
								'thingamablocks'
							) }
						</Notice>
					</div>
				) }
				<PanelBody title={ __( 'Search', 'thingamablocks' ) }>
					<ContentTypes
						value={ attributes.postTypes || [] }
						onChange={ ( postTypes ) =>
							setAttributes( { postTypes } )
						}
					/>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Label', 'thingamablocks' ) }
						placeholder={ __( 'Search', 'thingamablocks' ) }
						help={ __(
							'Read out by screen readers for the input and for icon-only buttons (unless there’s a visible label part). Say what’s searched, e.g. “Search products”.',
							'thingamablocks'
						) }
						value={ attributes.label }
						onChange={ ( label ) => setAttributes( { label } ) }
					/>
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

	return hasInnerBlocks ? (
		<SearchEdit { ...props } />
	) : (
		<VariationPlaceholder
			{ ...props }
			blockName="thingamablocks/search"
			icon={ searchIcon }
			label={ __( 'Search', 'thingamablocks' ) }
			instructions={ __(
				'Choose a starting style. The field and buttons are GenerateBlocks blocks, so you can style and change them freely.',
				'thingamablocks'
			) }
		/>
	);
}
