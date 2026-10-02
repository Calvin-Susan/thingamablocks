/**
 * Editor for the Breadcrumbs block.
 *
 * The block holds three GenerateBlocks blocks used as templates: a link, a
 * separator and the current page. They're styled here once; on the site
 * they're repeated for every step of the trail, which is worked out on the
 * server for whatever page is being viewed.
 */
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	Notice,
	PanelBody,
	TextControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import VariationPlaceholder from '../shared/variation-placeholder';
import { breadcrumbsIcon } from './icon';

function TrailSettings( { attributes, setAttributes } ) {
	return (
		<PanelBody title={ __( 'Trail', 'thingamablocks' ) }>
			<div className="tmb-breadcrumbs-control">
				<ToggleGroupControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					isBlock
					label={ __( 'Home', 'thingamablocks' ) }
					value={ attributes.home }
					onChange={ ( value ) => setAttributes( { home: value } ) }
				>
					<ToggleGroupControlOption
						value="text"
						label={ __( 'Text', 'thingamablocks' ) }
					/>
					<ToggleGroupControlOption
						value="icon"
						label={ __( 'Icon', 'thingamablocks' ) }
					/>
					<ToggleGroupControlOption
						value="both"
						label={ __( 'Both', 'thingamablocks' ) }
					/>
				</ToggleGroupControl>
			</div>

			{ 'icon' !== attributes.home && (
				<div className="tmb-breadcrumbs-control">
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Home label', 'thingamablocks' ) }
						placeholder={ __( 'Home', 'thingamablocks' ) }
						value={ attributes.homeLabel }
						onChange={ ( value ) =>
							setAttributes( { homeLabel: value } )
						}
					/>
				</div>
			) }

			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Show the blog page on posts', 'thingamablocks' ) }
				help={ __(
					'Home › Blog › Category › Post. Uses the Posts page set in Settings → Reading.',
					'thingamablocks'
				) }
				checked={ attributes.showBlogPage }
				onChange={ ( value ) =>
					setAttributes( { showBlogPage: value } )
				}
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Show the category on posts', 'thingamablocks' ) }
				help={ __(
					'The primary category if your SEO plugin sets one, otherwise the first.',
					'thingamablocks'
				) }
				checked={ attributes.showCategory }
				onChange={ ( value ) =>
					setAttributes( { showCategory: value } )
				}
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Show the current page', 'thingamablocks' ) }
				help={ __( 'As the last step, not a link.', 'thingamablocks' ) }
				checked={ attributes.showCurrent }
				onChange={ ( value ) =>
					setAttributes( { showCurrent: value } )
				}
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Show on the home page', 'thingamablocks' ) }
				help={ __(
					'Off: hidden on the front page, where the trail would just be “Home”.',
					'thingamablocks'
				) }
				checked={ attributes.showOnHome }
				onChange={ ( value ) => setAttributes( { showOnHome: value } ) }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Collapse when it doesn’t fit', 'thingamablocks' ) }
				help={ __(
					'On small screens, long trails become Home › … › Parent › Page; the … button shows the rest.',
					'thingamablocks'
				) }
				checked={ attributes.collapse }
				onChange={ ( value ) => setAttributes( { collapse: value } ) }
			/>
		</PanelBody>
	);
}

function SeoSettings( { attributes, setAttributes } ) {
	return (
		<PanelBody
			title={ __( 'Search engines', 'thingamablocks' ) }
			initialOpen={ false }
		>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Breadcrumb structured data', 'thingamablocks' ) }
				help={ __(
					'Tells search engines the path to the page (schema.org BreadcrumbList), once per page. Turn off if your SEO plugin already adds it (Slim SEO does).',
					'thingamablocks'
				) }
				// "never" is the old setting's off.
				checked={ ! [ 'off', 'never' ].includes( attributes.schema ) }
				onChange={ ( value ) =>
					setAttributes( { schema: value ? 'on' : 'off' } )
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
				placeholder={ __( 'Breadcrumb', 'thingamablocks' ) }
				help={ __(
					'Names the breadcrumb navigation for screen readers.',
					'thingamablocks'
				) }
				value={ attributes.ariaLabel }
				onChange={ ( value ) => setAttributes( { ariaLabel: value } ) }
			/>
		</PanelBody>
	);
}

function BreadcrumbsEdit( { attributes, setAttributes, clientId } ) {
	const parts = useSelect(
		( select ) => {
			const found = new Set();
			const walk = ( blocks ) =>
				blocks.forEach( ( block ) => {
					if ( 'thingamablocks/breadcrumbs' === block.name ) {
						return;
					}

					const part =
						block.attributes?.htmlAttributes?.[
							'data-breadcrumb-part'
						];

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

	const blockProps = useBlockProps( { className: 'tmb-breadcrumbs' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		orientation: 'horizontal',
	} );

	return (
		<>
			<InspectorControls>
				<div className="tmb-breadcrumbs-notice">
					{ ! parts.includes( 'item' ) ? (
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'Add a GenerateBlocks Text block set to the <a> tag and set its “Breadcrumb part” to “Link to each page”.',
								'thingamablocks'
							) }
						</Notice>
					) : (
						<p className="tmb-breadcrumbs-help">
							{ __(
								'These blocks are templates: style them once and they’re repeated for every step, with each page’s title and link, wherever the block is placed.',
								'thingamablocks'
							) }
						</p>
					) }
				</div>
				<TrailSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<SeoSettings
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
		<BreadcrumbsEdit { ...props } />
	) : (
		<VariationPlaceholder
			{ ...props }
			blockName="thingamablocks/breadcrumbs"
			icon={ breadcrumbsIcon }
			label={ __( 'Breadcrumbs', 'thingamablocks' ) }
			instructions={ __(
				'Choose a starting style. The link, separator and current page are GenerateBlocks blocks you can restyle; the trail itself is built automatically for each page.',
				'thingamablocks'
			) }
		/>
	);
}
