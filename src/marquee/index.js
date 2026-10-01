/**
 * Marquee block for GenerateBlocks.
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

import metadata from './block.json';
import Edit from './edit';
import { marqueeIcon } from './icon';
import { variations } from './templates';
import { toBlockObjects } from '../shared/gb';
import './parts';
import './editor.scss';

registerBlockType( metadata.name, {
	icon: marqueeIcon,
	edit: Edit,
	// The wrapper is rendered in PHP; only the inner GenerateBlocks blocks are saved.
	save: () => <InnerBlocks.Content />,
	variations,
	// In List View, show the direction: "Marquee · Left".
	__experimentalLabel: ( attributes, { context } ) => {
		if ( 'list-view' !== context ) {
			return undefined;
		}

		const labels = {
			left: __( 'Left', 'thingamablocks' ),
			right: __( 'Right', 'thingamablocks' ),
			up: __( 'Up', 'thingamablocks' ),
			down: __( 'Down', 'thingamablocks' ),
		};

		return `${ __( 'Marquee', 'thingamablocks' ) } · ${
			labels[ attributes.direction ] || labels.left
		}`;
	},
	example: {
		attributes: { fadeEdges: true },
		innerBlocks: toBlockObjects( variations[ 0 ].innerBlocks ),
	},
} );
