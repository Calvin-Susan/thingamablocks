/**
 * "Share part" settings on GenerateBlocks blocks inside a Share block:
 * which network a Text block shares to (data-share-network), or that it's
 * the label / an Element is the list (data-share-part).
 */
import { __, sprintf } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Button, PanelBody, SelectControl } from '@wordpress/components';
import { useDispatch, useRegistry, useSelect } from '@wordpress/data';

import { NETWORKS, iconFor, networkFor } from './networks';
import {
	defaultIconOf,
	hasBrandClass,
	withNetwork,
} from './network-attributes';

function helpText( value ) {
	if ( 'label' === value ) {
		return __(
			'Names the list of buttons for screen readers (“Share:”).',
			'thingamablocks'
		);
	}

	if ( 'list' === value ) {
		return __(
			'The list of share buttons: an Element set to <ul>, with an <li> around each button.',
			'thingamablocks'
		);
	}

	if ( 'copy' === value ) {
		return __(
			'Copies the post’s address. Shows “Link copied” for a moment (and data-copied, to style).',
			'thingamablocks'
		);
	}

	if ( 'native' === value ) {
		return __(
			'Opens the device’s own share sheet (phones, tablets, some computers). Hidden where there isn’t one.',
			'thingamablocks'
		);
	}

	if ( networkFor( value ) ) {
		return __(
			'The link is made for the post being viewed. Icon only? It’s named for screen readers (“Share on …”).',
			'thingamablocks'
		);
	}

	return __(
		'Blocks that aren’t parts are shown as they are.',
		'thingamablocks'
	);
}

const withSharePartControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, clientId, attributes, setAttributes, isSelected } = props;
		const isText = 'generateblocks/text' === name;
		const isPartBlock = isText || 'generateblocks/element' === name;

		// Primitives from the store (a new object each time would re-render
		// on every change in the editor): whether this is inside a Share
		// block, and whether its buttons use brand colours.
		const share = useSelect(
			( select ) => {
				if ( ! isPartBlock || ! isSelected ) {
					return '';
				}

				const editor = select( blockEditorStore );
				const [ id ] = editor
					.getBlockParentsByBlockName(
						clientId,
						'thingamablocks/share'
					)
					.slice( -1 );

				if ( ! id ) {
					return '';
				}

				let brand = false;
				const walk = ( blocks ) =>
					blocks.forEach( ( block ) => {
						brand = brand || hasBrandClass( block.attributes );
						walk( block.innerBlocks );
					} );
				walk( editor.getBlocks( id ) );

				return brand ? 'brand' : 'plain';
			},
			[ clientId, isPartBlock, isSelected ]
		);
		const registry = useRegistry();
		const { updateBlockAttributes } = useDispatch( blockEditorStore );

		if ( ! share ) {
			return <BlockEdit { ...props } />;
		}

		const html = attributes.htmlAttributes || {};
		const value =
			html[ 'data-share-network' ] || html[ 'data-share-part' ] || '';
		const network = networkFor( html[ 'data-share-network' ] );
		const customIcon =
			network &&
			attributes.icon &&
			defaultIconOf( attributes.icon ) !== network.key;

		const onChange = ( next ) => {
			const updated = { ...html };

			if ( networkFor( next ) ) {
				setAttributes(
					withNetwork( attributes, next, 'brand' === share )
				);

				// The item around it is named after its network.
				const editor = registry.select( blockEditorStore );
				const parent = editor.getBlock(
					editor.getBlockRootClientId( clientId )
				);
				const old = network?.label;

				if (
					parent?.name === 'generateblocks/element' &&
					( ! parent.attributes.metadata?.name ||
						parent.attributes.metadata?.name === old )
				) {
					updateBlockAttributes( parent.clientId, {
						metadata: {
							...parent.attributes.metadata,
							name: networkFor( next ).label,
						},
					} );
				}

				return;
			}

			delete updated[ 'data-share-network' ];
			delete updated[ 'data-share-part' ];

			if ( next ) {
				updated[ 'data-share-part' ] = next;
			}

			setAttributes( { htmlAttributes: updated } );
		};

		const options = isText
			? [
					{ value: 'label', label: __( 'Label', 'thingamablocks' ) },
					...NETWORKS.map( ( item ) => ( {
						value: item.key,
						label: sprintf(
							/* translators: %s: a network, e.g. LinkedIn. */
							__( 'Share button: %s', 'thingamablocks' ),
							item.label
						),
					} ) ),
			  ]
			: [ { value: 'list', label: __( 'List', 'thingamablocks' ) } ];

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody title={ __( 'Share part', 'thingamablocks' ) }>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'This block is', 'thingamablocks' ) }
							value={ value }
							options={ [
								{
									value: '',
									label: __(
										'Not a part (shown as it is)',
										'thingamablocks'
									),
								},
								...options,
							] }
							help={ helpText( value ) }
							onChange={ onChange }
						/>
						{ customIcon && (
							<Button
								variant="secondary"
								size="compact"
								className="tmb-share-default-icon"
								onClick={ () =>
									setAttributes( {
										icon: iconFor( network.key ),
									} )
								}
							>
								{ sprintf(
									/* translators: %s: a network, e.g. LinkedIn. */
									__( 'Use the %s icon', 'thingamablocks' ),
									network.label
								) }
							</Button>
						) }
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withSharePartControl'
);

addFilter(
	'editor.BlockEdit',
	'thingamablocks/share-part-control',
	withSharePartControl
);
