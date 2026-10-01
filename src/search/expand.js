/**
 * The Search block's "expanding" style: a button that opens and closes the
 * field. Only loaded on pages with a search that uses it.
 *
 * The server renders the field hidden and the button with
 * aria-expanded="false" and aria-controls. Opening moves focus to the
 * input; Escape closes it and returns focus to the button; clicking or
 * tabbing away closes it. A field that would stick out of the screen is
 * moved sideways to fit.
 */
const SPEED = 160;
const MARGIN = 8;

/**
 * Move a positioned field sideways so it stays on screen.
 *
 * @param {HTMLElement} field Field.
 */
function fit( field ) {
	field.style.translate = '';

	if ( 'static' === getComputedStyle( field ).position ) {
		return;
	}

	const rect = field.getBoundingClientRect();
	const width = document.documentElement.clientWidth;
	let shift = 0;

	if ( rect.left < MARGIN ) {
		shift = MARGIN - rect.left;
	} else if ( rect.right > width - MARGIN ) {
		shift = Math.max( width - MARGIN - rect.right, MARGIN - rect.left );
	}

	if ( shift ) {
		field.style.translate = `${ Math.round( shift ) }px 0`;
	}
}

function setup( form ) {
	const toggle = form.querySelector(
		'[data-search-part="toggle"][aria-controls]'
	);
	// Looked up inside this form: with the same search in a desktop and a
	// mobile header, a field ID set in GenerateBlocks appears twice.
	const field = toggle
		? form.querySelector(
				`[id="${ CSS.escape(
					toggle.getAttribute( 'aria-controls' )
				) }"]`
		  )
		: null;

	if ( ! field || form.tmbSearch ) {
		return;
	}

	const input = form.querySelector( 'input[data-search-part="input"]' );
	const still = () =>
		window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ||
		! field.animate;
	let animation = null;

	const isOpen = () => 'true' === toggle.getAttribute( 'aria-expanded' );

	const refit = () => fit( field );

	const open = () => {
		if ( isOpen() ) {
			return;
		}

		window.addEventListener( 'resize', refit );

		animation?.cancel();
		toggle.setAttribute( 'aria-expanded', 'true' );
		field.style.display = '';
		fit( field );

		if ( ! still() ) {
			// Opacity only: the field's translate is used to keep it on screen.
			animation = field.animate( [ { opacity: 0 }, { opacity: 1 } ], {
				duration: SPEED,
				easing: 'ease-out',
			} );
		}

		input?.focus();
	};

	const close = ( returnFocus ) => {
		if ( ! isOpen() ) {
			return;
		}

		const hide = () => {
			field.style.display = 'none';
		};

		animation?.cancel();
		window.removeEventListener( 'resize', refit );
		toggle.setAttribute( 'aria-expanded', 'false' );

		if ( returnFocus ) {
			toggle.focus();
		}

		if ( still() ) {
			hide();
			return;
		}

		animation = field.animate( [ { opacity: 1 }, { opacity: 0 } ], {
			duration: SPEED * 0.75,
			easing: 'ease-in',
		} );
		animation.onfinish = hide;
	};

	toggle.addEventListener( 'click', ( event ) => {
		event.preventDefault();

		if ( isOpen() ) {
			close( false );
		} else {
			open();
		}
	} );

	// A toggle that isn't a <button> got role="button": Enter and Space press it.
	if ( 'BUTTON' !== toggle.tagName ) {
		toggle.addEventListener( 'keydown', ( event ) => {
			if ( 'Enter' === event.key || ' ' === event.key ) {
				event.preventDefault();

				if ( ! event.repeat ) {
					toggle.click();
				}
			}
		} );
	}

	form.addEventListener( 'keydown', ( event ) => {
		if ( 'Escape' === event.key && isOpen() ) {
			event.preventDefault();
			close( true );
		}
	} );

	// Clicking or tabbing anywhere else closes it.
	document.addEventListener( 'pointerdown', ( event ) => {
		if ( isOpen() && ! form.contains( event.target ) ) {
			close( false );
		}
	} );

	form.addEventListener( 'focusout', ( event ) => {
		if ( event.relatedTarget && ! form.contains( event.relatedTarget ) ) {
			close( false );
		}
	} );

	form.tmbSearch = { open, close: () => close( false ) };
}

document.querySelectorAll( '.tmb-search' ).forEach( setup );
