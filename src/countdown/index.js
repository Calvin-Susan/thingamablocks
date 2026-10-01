/**
 * Countdown block for GenerateBlocks.
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

import metadata from './block.json';
import Edit from './edit';
import { countdownIcon } from './icon';
import { variations } from './templates';
import { toBlockObjects } from '../shared/gb';
import './parts';
import './editor.scss';

registerBlockType( metadata.name, {
	icon: countdownIcon,
	edit: Edit,
	// The wrapper is rendered in PHP; only the inner GenerateBlocks blocks are saved.
	save: () => <InnerBlocks.Content />,
	variations,
	// In List View, say what it counts down to.
	__experimentalLabel: ( attributes, { context } ) => {
		if ( 'list-view' !== context ) {
			return undefined;
		}

		const labels = {
			date: __( 'Date', 'thingamablocks' ),
			evergreen: __( 'Evergreen', 'thingamablocks' ),
			recurring: __( 'Recurring', 'thingamablocks' ),
		};

		return `${ __( 'Countdown', 'thingamablocks' ) } · ${ labels[ attributes.mode ] || labels.date }`;
	},
	example: {
		innerBlocks: toBlockObjects( variations[ 0 ].innerBlocks ),
	},
} );
