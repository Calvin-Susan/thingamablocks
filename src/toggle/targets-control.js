/**
 * Pick the elements a toggle controls.
 *
 * Suggests every HTML ID on the page (GenerateBlocks keeps IDs in
 * htmlAttributes.id; core blocks use the "anchor" attribute), and shows
 * whether each chosen target was found, so a typo is obvious.
 */
import { __, sprintf } from '@wordpress/i18n';
import { FormTokenField } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { store as blockEditorStore } from '@wordpress/block-editor';

export function usePageIds() {
	// Joined into a string so the selector returns a stable value between renders.
	const joined = useSelect( ( select ) => {
		const { getClientIdsWithDescendants, getBlockAttributes } =
			select( blockEditorStore );
		const ids = new Set();

		getClientIdsWithDescendants().forEach( ( clientId ) => {
			const attributes = getBlockAttributes( clientId ) || {};
			const id = attributes.htmlAttributes?.id || attributes.anchor;

			if ( id && 'string' === typeof id ) {
				ids.add( id );
			}
		} );

		return [ ...ids ].sort().join( ' ' );
	}, [] );

	return useMemo( () => ( joined ? joined.split( ' ' ) : [] ), [ joined ] );
}

const isPlainId = ( value ) => /^#?[A-Za-z][\w-]*$/.test( value );
const stripHash = ( value ) => value.replace( /^#/, '' );

export default function TargetsControl( { label, help, value = [], onChange } ) {
	const pageIds = usePageIds();

	const missing = value.filter(
		( target ) => isPlainId( target ) && ! pageIds.includes( stripHash( target ) )
	);

	return (
		<div className="ogal-toggle-targets">
			<FormTokenField
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ label }
				value={ value }
				suggestions={ pageIds.filter( ( id ) => ! value.includes( id ) ) }
				onChange={ ( tokens ) =>
					onChange(
						tokens
							.map( ( token ) =>
								( 'string' === typeof token ? token : token.value ).trim()
							)
							// "#pricing" and "pricing" mean the same thing; store the bare ID.
							.map( ( token ) => ( isPlainId( token ) ? stripHash( token ) : token ) )
							.filter( Boolean )
					)
				}
				__experimentalExpandOnFocus
				help={ help || '' }
			/>
			{ missing.length > 0 && (
				<p className="ogal-toggle-targets__missing">
					{ sprintf(
						/* translators: %s: comma-separated list of element IDs. */
						__(
							'Not found on this page: %s. That’s fine if it lives in a header, footer or other template part.',
							'toggle-for-generateblocks'
						),
						missing.join( ', ' )
					) }
				</p>
			) }
		</div>
	);
}
