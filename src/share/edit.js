/**
 * Editor for the Share block.
 *
 * The block holds ordinary GenerateBlocks blocks; each share button is a
 * Text block set to a network in its "Share part" panel. Networks are added
 * here (a copy of the first button, so it matches), removed and reordered
 * as blocks.
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { Button, Notice, PanelBody, TextControl } from '@wordpress/components';
import { useDispatch, useRegistry, useSelect } from '@wordpress/data';

import VariationPlaceholder from '../shared/variation-placeholder';
import { shareIcon } from './icon';
import { NETWORKS, networkFor } from './networks';
import { hasBrandClass, withNetwork } from './network-attributes';
import { buttonAttributes } from './templates';

/**
 * The share buttons in the block (not in a Share block nested inside).
 *
 * @param {Array} blocks Inner blocks.
 * @return {Array} Button blocks.
 */
function findButtons( blocks ) {
	const found = [];
	const walk = ( list ) =>
		list.forEach( ( block ) => {
			if ( 'thingamablocks/share' === block.name ) {
				return;
			}

			if ( block.attributes?.htmlAttributes?.[ 'data-share-network' ] ) {
				found.push( block );
			}

			walk( block.innerBlocks );
		} );

	walk( blocks );

	return found;
}

// A copy for a new button: GenerateBlocks gives it its own ID.
const fresh = ( attributes ) => {
	const html = { ...( attributes.htmlAttributes || {} ) };

	delete html.id;

	return { ...attributes, uniqueId: '', css: '', htmlAttributes: html };
};

/**
 * Whether a block is an Element holding just one block (a button's <li>).
 *
 * @param {Object|null} block Block.
 * @return {boolean} A wrapper.
 */
const isWrapper = ( block ) =>
	block?.name === 'generateblocks/element' && 1 === block.innerBlocks.length;

function AddNetworks( { clientId } ) {
	// A string from the store, so the panel only re-renders when the
	// networks change.
	const used = useSelect(
		( select ) =>
			findButtons( select( blockEditorStore ).getBlocks( clientId ) )
				.map(
					( block ) =>
						block.attributes.htmlAttributes[ 'data-share-network' ]
				)
				.join( ' ' ),
		[ clientId ]
	);
	const registry = useRegistry();
	const { insertBlocks } = useDispatch( blockEditorStore );
	const unused = NETWORKS.filter(
		( network ) => ! used.split( ' ' ).includes( network.key )
	);

	if ( ! unused.length ) {
		return null;
	}

	const add = ( key ) => {
		const editor = registry.select( blockEditorStore );
		const parentOf = ( id ) =>
			editor.getBlock( editor.getBlockRootClientId( id ) );
		const buttons = findButtons( editor.getBlocks( clientId ) );
		const source = buttons[ 0 ];

		if ( ! source ) {
			insertBlocks(
				createBlock( 'generateblocks/text', buttonAttributes( key ) ),
				undefined,
				clientId
			);
			return;
		}

		const last = buttons[ buttons.length - 1 ];
		const button = createBlock(
			'generateblocks/text',
			fresh( {
				...source.attributes,
				...withNetwork(
					source.attributes,
					key,
					buttons.some( ( block ) =>
						hasBrandClass( block.attributes )
					)
				),
			} )
		);
		const item = parentOf( source.clientId );
		const lastItem = parentOf( last.clientId );

		// Buttons each in an item (<li>): copy the item too, after the last.
		if ( isWrapper( item ) && isWrapper( lastItem ) ) {
			const list = parentOf( lastItem.clientId );

			insertBlocks(
				createBlock(
					'generateblocks/element',
					fresh( {
						...item.attributes,
						metadata: {
							...item.attributes.metadata,
							name: networkFor( key ).label,
						},
					} ),
					[ button ]
				),
				editor.getBlockIndex( lastItem.clientId ) + 1,
				list.clientId
			);
			return;
		}

		insertBlocks(
			button,
			editor.getBlockIndex( last.clientId ) + 1,
			editor.getBlockRootClientId( last.clientId )
		);
	};

	return (
		<PanelBody title={ __( 'Add a network', 'thingamablocks' ) }>
			<p className="tmb-share-help">
				{ __(
					'Adds a copy of the first button, set to that network with its icon. Remove or reorder buttons as blocks.',
					'thingamablocks'
				) }
			</p>
			<div className="tmb-share-networks">
				{ unused.map( ( network ) => (
					<Button
						key={ network.key }
						variant="secondary"
						size="compact"
						onClick={ () => add( network.key ) }
						label={ sprintf(
							/* translators: %s: a network, e.g. LinkedIn. */
							__( 'Add %s', 'thingamablocks' ),
							network.label
						) }
						showTooltip={ false }
					>
						{ network.label }
					</Button>
				) ) }
			</div>
		</PanelBody>
	);
}

function ShareEdit( { attributes, setAttributes, clientId } ) {
	const count = useSelect(
		( select ) =>
			findButtons( select( blockEditorStore ).getBlocks( clientId ) )
				.length,
		[ clientId ]
	);
	const blockProps = useBlockProps( { className: 'tmb-share' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	return (
		<>
			<InspectorControls>
				<div className="tmb-share-notice">
					{ count ? (
						<p className="tmb-share-help">
							{ __(
								'Each button is a GenerateBlocks Text block: style it, or change its icon, like any other. Its link is made for the post being viewed. Set what a block does in its “Share part” panel.',
								'thingamablocks'
							) }
						</p>
					) : (
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'No share buttons yet: add a network below, or set a Text block’s “Share part” to a network.',
								'thingamablocks'
							) }
						</Notice>
					) }
				</div>
				<AddNetworks clientId={ clientId } />
				<PanelBody
					title={ __( 'Accessibility', 'thingamablocks' ) }
					initialOpen={ false }
				>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Label', 'thingamablocks' ) }
						placeholder={ __(
							'Share this post',
							'thingamablocks'
						) }
						help={ __(
							'Names the list of buttons for screen readers when there’s no label block.',
							'thingamablocks'
						) }
						value={ attributes.ariaLabel }
						onChange={ ( value ) =>
							setAttributes( { ariaLabel: value } )
						}
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
		<ShareEdit { ...props } />
	) : (
		<VariationPlaceholder
			{ ...props }
			blockName="thingamablocks/share"
			icon={ shareIcon }
			label={ __( 'Share', 'thingamablocks' ) }
			instructions={ __(
				'Choose a starting style. Every button is a GenerateBlocks block you can restyle, with its network’s icon already in place.',
				'thingamablocks'
			) }
		/>
	);
}
