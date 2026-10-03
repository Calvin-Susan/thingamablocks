/**
 * Table of Contents block for GenerateBlocks.
 */
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

import metadata from './block.json';
import Edit from './edit';
import { tocIcon } from './icon';
import { variations } from './templates';
import { toBlockObjects } from '../shared/gb';
import './parts';
import './editor.scss';
import './style.scss';

registerBlockType( metadata.name, {
	icon: tocIcon,
	edit: Edit,
	// The list is built in PHP from the post's headings; only the part
	// templates are saved.
	save: () => <InnerBlocks.Content />,
	variations,
	example: {
		innerBlocks: toBlockObjects( variations[ 0 ].innerBlocks ),
	},
} );
