/**
 * "Choose a starting layout" placeholder, shown when a block has no inner
 * blocks yet. Each layout is a block variation built from GenerateBlocks blocks.
 */
import {
	useBlockProps,
	store as blockEditorStore,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalBlockVariationPicker as BlockVariationPicker,
} from '@wordpress/block-editor';
import {
	createBlocksFromInnerBlocksTemplate,
	store as blocksStore,
} from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';

export default function VariationPlaceholder( {
	blockName,
	clientId,
	setAttributes,
	icon,
	label,
	instructions,
	onSelected,
} ) {
	const { variations, defaultVariation } = useSelect(
		( select ) => {
			const { getBlockVariations, getDefaultBlockVariation } =
				select( blocksStore );

			return {
				variations: getBlockVariations( blockName, 'block' ),
				defaultVariation: getDefaultBlockVariation(
					blockName,
					'block'
				),
			};
		},
		[ blockName ]
	);
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			<BlockVariationPicker
				icon={ icon }
				label={ label }
				instructions={ instructions }
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
							// Keep the parent selected, so its settings are what you see next.
							false
						);
					}

					onSelected?.( variation );
				} }
				allowSkip
			/>
		</div>
	);
}
