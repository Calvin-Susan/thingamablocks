/**
 * Toggle block for GenerateBlocks.
 */
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

import metadata from './block.json';
import Edit from './edit';
import { toggleIcon } from './icon';
import { variations } from './templates';
import './parts';
import './editor.scss';
import './style.scss';

// The preview in the inserter wants block objects rather than a template array.
const toBlockObjects = ( template = [] ) =>
	template.map( ( [ name, attributes, innerBlocks ] ) => ( {
		name,
		attributes,
		innerBlocks: toBlockObjects( innerBlocks ),
	} ) );

registerBlockType( metadata.name, {
	icon: toggleIcon,
	edit: Edit,
	// The wrapper is rendered in PHP; only the inner GenerateBlocks blocks are saved.
	save: () => <InnerBlocks.Content />,
	variations,
	example: {
		innerBlocks: toBlockObjects( variations[ 0 ].innerBlocks ),
	},
} );
