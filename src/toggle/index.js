/**
 * Toggle block for GenerateBlocks.
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

import metadata from './block.json';
import Edit from './edit';
import { toggleIcon } from './icon';
import { variations } from './templates';
import { toBlockObjects } from '../shared/gb';
import './parts';
import './editor.scss';
import './style.scss';

registerBlockType( metadata.name, {
	icon: toggleIcon,
	edit: Edit,
	// The wrapper is rendered in PHP; only the inner GenerateBlocks blocks are saved.
	save: () => <InnerBlocks.Content />,
	variations,
	// In List View, say what the toggle does: "Toggle · Light / dark mode".
	__experimentalLabel: ( attributes, { context } ) => {
		if ( 'list-view' !== context ) {
			return undefined;
		}

		const labels = {
			showHide: __( 'Show / hide', 'thingamablocks' ),
			colorScheme: __( 'Light / dark mode', 'thingamablocks' ),
			toggleClass: __( 'Class', 'thingamablocks' ),
			none: __( 'Custom', 'thingamablocks' ),
		};

		return `${ __( 'Toggle', 'thingamablocks' ) } · ${
			labels[ attributes.action ] || labels.none
		}`;
	},
	example: {
		innerBlocks: toBlockObjects( variations[ 0 ].innerBlocks ),
	},
} );
