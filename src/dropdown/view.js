/**
 * Front-end behaviour for the Dropdown block.
 *
 * A disclosure (WAI-ARIA Authoring Practices): a <button aria-expanded
 * aria-controls> that shows and hides a drawer of links or anything else.
 * Not an ARIA "menu", which would make screen readers expect app-style arrow
 * key navigation.
 *
 * The server renders the drawer closed (an inline display:none) with the
 * ARIA attributes in place, so nothing flashes before this runs. Without
 * JavaScript a <noscript> rule shows every drawer, so nothing is unreachable.
 *
 * Closes on Escape (focus goes back to the button), a click outside, focus
 * moving out of it, and, by default, after an item in it is used. Only one
 * dropdown is open at a time.
 */
import { reveal } from './reveal';

const dropdowns = [];
const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' );

// Space kept between a drawer and the edge of the screen, in px.
const EDGE = 8;

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Place the drawer: below the button unless there's more room above, and
 * lined up with the button but kept on screen.
 *
 * @param {Object} dropdown Dropdown record.
 */
function position( dropdown ) {
	const { element, drawer, button, config } = dropdown;

	element.dataset.placement = 'bottom';
	drawer.style.left = '0px';

	const gap =
		parseFloat(
			getComputedStyle( element ).getPropertyValue( '--tmb-dropdown-gap' )
		) || 0;
	const anchor = button.getBoundingClientRect();
	const box = element.getBoundingClientRect();
	const height = drawer.offsetHeight;
	const width = drawer.offsetWidth;
	const below = window.innerHeight - anchor.bottom - gap;
	const above = anchor.top - gap;

	if ( height > below && above > below ) {
		element.dataset.placement = 'top';
	}

	// A margin on the drawer (a theme's list margin, say) shifts it; allow for it.
	let left = -( parseFloat( getComputedStyle( drawer ).marginLeft ) || 0 );

	if ( 'end' === config.align ) {
		left += box.width - width;
	} else if ( 'center' === config.align ) {
		left += ( box.width - width ) / 2;
	}

	// Keep it on screen (the document's width excludes the scrollbar).
	const viewport = document.documentElement.clientWidth;
	const margin = parseFloat( getComputedStyle( drawer ).marginLeft ) || 0;
	const overflowRight =
		box.left + left + margin + width - ( viewport - EDGE );

	if ( overflowRight > 0 ) {
		left -= overflowRight;
	}

	if ( box.left + left + margin < EDGE ) {
		left += EDGE - ( box.left + left + margin );
	}

	drawer.style.left = `${ Math.round( left ) }px`;
}

function animate( dropdown, reverse ) {
	dropdown.animation?.cancel();
	dropdown.animation = reducedMotion.matches
		? null
		: reveal( dropdown.drawer, {
				type: dropdown.config.animation,
				speed: dropdown.config.speed,
				placement: dropdown.element.dataset.placement,
				reverse,
		  } );

	return dropdown.animation;
}

function onViewportChange() {
	dropdowns.filter( ( dropdown ) => dropdown.open ).forEach( position );
}

let repositionQueued = false;

function queueReposition() {
	if ( ! repositionQueued ) {
		repositionQueued = true;
		window.requestAnimationFrame( () => {
			repositionQueued = false;
			onViewportChange();
		} );
	}
}

function open( dropdown ) {
	if ( dropdown.open ) {
		return;
	}

	dropdowns
		.filter(
			( other ) =>
				other.open && ! other.element.contains( dropdown.element )
		)
		.forEach( ( other ) => close( other ) );

	const { element, button, drawer } = dropdown;

	dropdown.open = true;
	element.classList.add( 'is-open' );
	button.setAttribute( 'aria-expanded', 'true' );
	drawer.style.removeProperty( 'display' );
	position( dropdown );
	animate( dropdown, false );

	window.addEventListener( 'resize', queueReposition, { passive: true } );
	window.addEventListener( 'scroll', queueReposition, {
		passive: true,
		capture: true,
	} );

	element.dispatchEvent(
		new CustomEvent( 'tmb-dropdown:open', {
			bubbles: true,
			detail: { dropdown: element },
		} )
	);
}

/**
 * Close a dropdown.
 *
 * @param {Object}  dropdown             Dropdown record.
 * @param {Object}  options              Options.
 * @param {boolean} options.restoreFocus Move focus back to the button.
 */
function close( dropdown, { restoreFocus = false } = {} ) {
	if ( ! dropdown.open ) {
		return;
	}

	const { element, button, drawer } = dropdown;

	dropdown.open = false;
	element.classList.remove( 'is-open' );
	button.setAttribute( 'aria-expanded', 'false' );

	if ( restoreFocus ) {
		button.focus();
	}

	const hide = () => {
		if ( ! dropdown.open ) {
			drawer.style.setProperty( 'display', 'none' );
			delete element.dataset.placement;
		}
	};
	const running = animate( dropdown, true );

	if ( running ) {
		running.onfinish = hide;
	} else {
		hide();
	}

	if ( ! dropdowns.some( ( other ) => other.open ) ) {
		window.removeEventListener( 'resize', queueReposition );
		window.removeEventListener( 'scroll', queueReposition, {
			capture: true,
		} );
	}

	element.dispatchEvent(
		new CustomEvent( 'tmb-dropdown:close', {
			bubbles: true,
			detail: { dropdown: element },
		} )
	);
}

function toggle( dropdown ) {
	if ( dropdown.open ) {
		close( dropdown );
	} else {
		open( dropdown );
	}
}

function setup( element ) {
	if ( element.tmbDropdown ) {
		return null;
	}

	let config;

	try {
		config = JSON.parse( element.dataset.tmbDropdown || '{}' );
	} catch ( e ) {
		return null;
	}

	if ( ! config || 'object' !== typeof config ) {
		return null;
	}

	// This dropdown's own parts, not those of one nested inside it.
	const own = ( selector ) =>
		[ ...element.querySelectorAll( selector ) ].find(
			( part ) => part.closest( '.tmb-dropdown' ) === element
		);
	const button = own( '[data-dropdown-part="button"]' );
	const drawer = own( '[data-dropdown-part="drawer"]' );

	if ( ! button || ! drawer ) {
		return null;
	}

	const dropdown = {
		element,
		config,
		button,
		drawer,
		open: false,
		animation: null,
	};

	element.tmbDropdown = dropdown;
	dropdowns.push( dropdown );

	button.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		toggle( dropdown );
	} );

	button.addEventListener( 'keydown', ( event ) => {
		// A button built from something other than <button> needs Space, and
		// Enter too unless it's a link (a link already turns Enter into a click).
		const isLink = 'A' === button.tagName && button.hasAttribute( 'href' );

		if (
			'BUTTON' !== button.tagName &&
			( ' ' === event.key || ( 'Enter' === event.key && ! isLink ) ) &&
			! event.repeat
		) {
			event.preventDefault();
			toggle( dropdown );
		}

		// Down arrow opens it and moves to the first item.
		if ( 'ArrowDown' === event.key ) {
			event.preventDefault();
			open( dropdown );
			drawer.querySelector( FOCUSABLE )?.focus();
		}
	} );

	// Focus moving to something outside closes it. (A click on empty space
	// inside the drawer moves focus nowhere and is handled as a click.)
	element.addEventListener( 'focusout', ( event ) => {
		if (
			dropdown.open &&
			event.relatedTarget &&
			! element.contains( event.relatedTarget )
		) {
			close( dropdown );
		}
	} );

	drawer.addEventListener( 'click', ( event ) => {
		const item = event.target.closest?.( 'a[href], button' );

		// Only items of this dropdown, not of one nested in its drawer.
		if (
			config.closeOnClick &&
			item &&
			drawer.contains( item ) &&
			item.closest( '.tmb-dropdown' ) === element
		) {
			close( dropdown, {
				restoreFocus:
					drawer.contains( drawer.ownerDocument.activeElement ) ||
					drawer.ownerDocument.activeElement === item,
			} );
		}
	} );

	return dropdown;
}

/**
 * Set up every dropdown inside `root` that isn't set up yet. Runs on page
 * load; call it again after adding dropdowns with AJAX.
 *
 * @param {ParentNode} root Where to look.
 */
function init( root = document ) {
	root.querySelectorAll( '.tmb-dropdown[data-tmb-dropdown]' ).forEach(
		setup
	);
}

document.addEventListener( 'click', ( event ) => {
	dropdowns
		.filter(
			( dropdown ) =>
				dropdown.open && ! dropdown.element.contains( event.target )
		)
		.forEach( ( dropdown ) => close( dropdown ) );
} );

document.addEventListener( 'keydown', ( event ) => {
	if ( 'Escape' !== event.key ) {
		return;
	}

	const focused = event.target.ownerDocument?.activeElement || event.target;

	// The innermost open dropdown around the focus (or any open one).
	const target =
		[ ...dropdowns ]
			.reverse()
			.find(
				( dropdown ) =>
					dropdown.open && dropdown.element.contains( focused )
			) || dropdowns.find( ( dropdown ) => dropdown.open );

	if ( target ) {
		close( target, {
			restoreFocus: target.element.contains( focused ),
		} );
	}
} );

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', () => init() );
} else {
	init();
}

/**
 * Find a dropdown by element or HTML anchor.
 *
 * @param {Element|string} target Element or anchor.
 * @return {Object|undefined} Dropdown record.
 */
function find( target ) {
	const element =
		'string' === typeof target ? document.getElementById( target ) : target;

	return element?.tmbDropdown;
}

window.tmbDropdown = {
	init,
	open: ( target ) => find( target ) && open( find( target ) ),
	close: ( target ) => find( target ) && close( find( target ) ),
	toggle: ( target ) => find( target ) && toggle( find( target ) ),
};
