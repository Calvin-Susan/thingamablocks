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

/**
 * Mirrors Ogal_Toggle_Render::is_safe_selector(): plain selector characters
 * only, with balanced brackets and quotes. Anything else is dropped on save.
 *
 * @param {string} value Selector.
 * @return {boolean} Whether the server will keep it.
 */
export function isSafeSelector( value ) {
	if ( ! /^[A-Za-z0-9_\-#.[\]="'~^$*|:(), >+]+$/.test( value ) ) {
		return false;
	}

	const stack = [];
	let quote = '';

	for ( const char of value ) {
		if ( quote ) {
			quote = char === quote ? '' : quote;
		} else if ( '"' === char || "'" === char ) {
			quote = char;
		} else if ( '(' === char || '[' === char ) {
			stack.push( char );
		} else if ( ( ')' === char && stack.pop() !== '(' ) || ( ']' === char && stack.pop() !== '[' ) ) {
			return false;
		}
	}

	return ! quote && ! stack.length;
}

const isPlainId = ( value ) => /^#?[A-Za-z][\w-]*$/.test( value );
const stripHash = ( value ) => value.replace( /^#/, '' );

export default function TargetsControl( { label, help, value = [], onChange } ) {
	const pageIds = usePageIds();

	const unsafe = value.filter( ( target ) => ! isSafeSelector( target ) );
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
			{ unsafe.length > 0 && (
				<p className="ogal-toggle-targets__missing">
					{ sprintf(
						/* translators: %s: comma-separated list of selectors. */
						__(
							'These will be ignored because they contain characters a selector can’t use here (such as @ ; { } or unbalanced brackets): %s',
							'toggle-for-generateblocks'
						),
						unsafe.join( ', ' )
					) }
				</p>
			) }
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
