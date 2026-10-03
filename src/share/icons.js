/**
 * The share icons as a "Share" set in GenerateBlocks' own icon picker, so
 * any GB block can use them, and a share button can switch back to one.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

import { NETWORKS, PATHS } from './networks';

addFilter(
	'generateblocks.editor.iconSVGSets',
	'thingamablocks/share-icons',
	( sets ) => ( {
		...sets,
		thingamablocksShare: {
			group: __( 'Share', 'thingamablocks' ),
			svgs: Object.fromEntries(
				NETWORKS.map( ( network ) => [
					network.key,
					{
						label: network.label,
						icon: (
							<svg
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="1em"
								height="1em"
								fill="currentColor"
							>
								<path d={ PATHS[ network.key ] } />
							</svg>
						),
					},
				] )
			),
		},
	} )
);
