/**
 * Share block for GenerateBlocks.
 */
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

import metadata from './block.json';
import Edit from './edit';
import { shareIcon } from './icon';
import { variations } from './templates';
import { toBlockObjects } from '../shared/gb';
import './parts';
import './icons';
import './editor.scss';
import './style.scss';

registerBlockType( metadata.name, {
	icon: shareIcon,
	edit: Edit,
	// PHP fills in each button's link for the post being viewed; only the
	// GenerateBlocks blocks are saved.
	save: () => <InnerBlocks.Content />,
	variations,
	example: {
		innerBlocks: toBlockObjects( variations[ 0 ].innerBlocks ),
	},
} );
