/**
 * Front-end behaviour for the Marquee block.
 *
 * The wrapper `.tmb-marquee` holds a GenerateBlocks block marked
 * `data-marquee-part="items"` (the row of logos, words…), and optionally a
 * button marked `data-marquee-part="pause"`.
 *
 * The script moves the items row into a track, adds just enough copies to
 * fill the space, and slides the track by exactly one row's length (plus the
 * gap) at a constant speed, then repeats. Because the copies are identical,
 * the loop has no visible seam. Speed is in pixels per second, so long and
 * short rows move at the same pace.
 *
 * It uses the Web Animations API rather than CSS keyframes, so "remove unused
 * CSS" optimisers can't break it and resizing doesn't make it jump.
 */

const marquees = [];
const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' );

function isVertical( config ) {
	return 'up' === config.direction || 'down' === config.direction;
}

/**
 * Hide a copy from screen readers and keyboard users: only the original row
 * is "real" content.
 *
 * @param {Element} copy Cloned row.
 */
function makeInert( copy ) {
	copy.setAttribute( 'aria-hidden', 'true' );
	copy.setAttribute( 'inert', '' );
	copy.removeAttribute( 'id' );
	copy.querySelectorAll( '[id]' ).forEach( ( element ) => element.removeAttribute( 'id' ) );
	copy.querySelectorAll( 'a, button, input, select, textarea, [tabindex]' ).forEach( ( element ) =>
		element.setAttribute( 'tabindex', '-1' )
	);
}

function gapOf( items, vertical ) {
	const style = getComputedStyle( items );
	const gap = parseFloat( vertical ? style.rowGap : style.columnGap );

	return Number.isFinite( gap ) ? gap : 0;
}

/**
 * Measure, add or remove copies, and (re)start the animation.
 *
 * @param {Object} marquee Marquee record.
 */
function layout( marquee ) {
	const { element, config, track, items } = marquee;
	const vertical = isVertical( config );

	if ( reducedMotion.matches ) {
		stop( marquee );
		return;
	}

	const gap = gapOf( items, vertical );
	const rect = items.getBoundingClientRect();
	const size = vertical ? rect.height : rect.width;
	const space = vertical ? element.clientHeight : element.clientWidth;

	if ( ! size || ! space ) {
		return;
	}

	// The gap between copies matches the gap between items, so the seam is invisible.
	track.style.gap = `${ gap }px`;

	// Enough copies to cover the space while the track slides by one row.
	const needed = Math.max( 1, Math.ceil( space / ( size + gap ) ) ) + 1;

	while ( marquee.copies.length < needed - 1 ) {
		const copy = items.cloneNode( true );
		makeInert( copy );
		track.appendChild( copy );
		marquee.copies.push( copy );
	}

	while ( marquee.copies.length > needed - 1 ) {
		marquee.copies.pop().remove();
	}

	const distance = size + gap;

	if ( distance === marquee.distance && marquee.animation ) {
		return;
	}

	marquee.distance = distance;

	const axis = vertical ? 'Y' : 'X';
	// RTL sites read right to left, so "left" flips there.
	const rtl = ! vertical && 'rtl' === getComputedStyle( element ).direction;
	const forwards = 'left' === config.direction || 'up' === config.direction;
	const sign = forwards !== rtl ? -1 : 1;
	const from = `translate${ axis }(${ sign < 0 ? 0 : -distance }px)`;
	const to = `translate${ axis }(${ sign < 0 ? -distance : 0 }px)`;
	const duration = ( distance / Math.max( 1, config.speed ) ) * 1000;

	// Keep the current position when the size changes, rather than jumping back.
	const progress = marquee.animation
		? ( marquee.animation.currentTime % marquee.animation.effect.getTiming().duration ) /
		  marquee.animation.effect.getTiming().duration
		: 0;

	marquee.animation?.cancel();
	marquee.animation = track.animate( [ { transform: from }, { transform: to } ], {
		duration,
		iterations: Infinity,
		easing: 'linear',
	} );
	marquee.animation.currentTime = progress * duration;

	updatePlayState( marquee );
}

function stop( marquee ) {
	marquee.animation?.cancel();
	marquee.animation = null;
	marquee.distance = 0;
	marquee.copies.forEach( ( copy ) => copy.remove() );
	marquee.copies = [];

	// Without motion, let people scroll to see everything.
	const vertical = isVertical( marquee.config );
	marquee.element.style.setProperty( vertical ? 'overflow-y' : 'overflow-x', 'auto' );
	marquee.pauseButtons.forEach( ( button ) => ( button.hidden = true ) );
}

function updatePlayState( marquee ) {
	const { animation } = marquee;

	if ( ! animation ) {
		return;
	}

	const paused =
		marquee.pausedByButton ||
		marquee.offscreen ||
		( marquee.config.pauseOnHover && ( marquee.hovered || marquee.focused ) );

	if ( paused && 'running' === animation.playState ) {
		animation.pause();
	} else if ( ! paused && 'paused' === animation.playState ) {
		animation.play();
	}

	marquee.element.classList.toggle( 'is-paused', paused );
}

function syncPauseButtons( marquee ) {
	marquee.pauseButtons.forEach( ( button ) => {
		button.setAttribute( 'aria-pressed', marquee.pausedByButton ? 'true' : 'false' );
	} );
}

function setup( element ) {
	if ( element.tmbMarquee ) {
		return null;
	}

	let config;

	try {
		config = JSON.parse( element.dataset.tmbMarquee || '{}' );
	} catch ( e ) {
		return null;
	}

	const own = ( selector ) =>
		[ ...element.querySelectorAll( selector ) ].filter(
			( part ) => part.closest( '.tmb-marquee' ) === element
		);

	const items = own( '[data-marquee-part="items"]' )[ 0 ];

	if ( ! items ) {
		return null;
	}

	const vertical = isVertical( config );

	// The track holds the original row and its copies, and is what moves.
	const track = document.createElement( 'div' );
	track.className = 'tmb-marquee__track';
	track.style.cssText = `display:flex;flex-direction:${ vertical ? 'column' : 'row' };width:${
		vertical ? '100%' : 'max-content'
	};will-change:transform`;
	items.before( track );
	track.appendChild( items );

	const marquee = {
		element,
		config,
		items,
		track,
		copies: [],
		animation: null,
		distance: 0,
		pausedByButton: false,
		hovered: false,
		focused: false,
		offscreen: false,
		pauseButtons: own( '[data-marquee-part="pause"]' ),
	};

	element.tmbMarquee = marquee;
	marquees.push( marquee );

	const togglePause = () => {
		marquee.pausedByButton = ! marquee.pausedByButton;
		syncPauseButtons( marquee );
		updatePlayState( marquee );
	};

	marquee.pauseButtons.forEach( ( button ) => {
		button.addEventListener( 'click', ( event ) => {
			event.preventDefault();
			togglePause();
		} );

		// A pause "button" built from a GB Element (a div) needs Space/Enter too.
		if ( 'BUTTON' !== button.tagName ) {
			button.addEventListener( 'keydown', ( event ) => {
				if ( ( ' ' === event.key || 'Enter' === event.key ) && ! event.repeat ) {
					event.preventDefault();
					togglePause();
				}
			} );
		}
	} );

	element.addEventListener( 'mouseenter', () => {
		marquee.hovered = true;
		updatePlayState( marquee );
	} );
	element.addEventListener( 'mouseleave', () => {
		marquee.hovered = false;
		updatePlayState( marquee );
	} );
	// Keyboard users tabbing to a link in the row get the same pause as a mouse hover.
	element.addEventListener( 'focusin', ( event ) => {
		marquee.focused = ! marquee.pauseButtons.includes( event.target );
		updatePlayState( marquee );
	} );
	element.addEventListener( 'focusout', () => {
		marquee.focused = false;
		updatePlayState( marquee );
	} );

	// Re-measure when the row or the space changes (images loading, resizing).
	if ( 'ResizeObserver' in window ) {
		const observer = new ResizeObserver( () => layout( marquee ) );
		observer.observe( items );
		observer.observe( element );
	}

	// Don't burn CPU animating something nobody can see.
	if ( 'IntersectionObserver' in window ) {
		new IntersectionObserver( ( [ entry ] ) => {
			marquee.offscreen = ! entry.isIntersecting;
			updatePlayState( marquee );
		} ).observe( element );
	}

	return marquee;
}

/**
 * Set up every marquee inside `root` that isn't set up yet. Runs on page
 * load; call it again after adding marquees with AJAX.
 *
 * @param {ParentNode} root Where to look.
 */
function init( root = document ) {
	[ ...root.querySelectorAll( '.tmb-marquee[data-tmb-marquee]' ) ]
		.map( setup )
		.filter( Boolean )
		.forEach( layout );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', () => init() );
} else {
	init();
}

// Images can change the row's size after load; ResizeObserver covers most
// cases, this covers browsers without it.
window.addEventListener( 'load', () => marquees.forEach( layout ) );

reducedMotion.addEventListener( 'change', () =>
	marquees.forEach( ( marquee ) => {
		if ( ! reducedMotion.matches ) {
			marquee.element.style.removeProperty( 'overflow-x' );
			marquee.element.style.removeProperty( 'overflow-y' );
			marquee.pauseButtons.forEach( ( button ) => ( button.hidden = false ) );
		}

		layout( marquee );
	} )
);

window.tmbMarquee = {
	init,
	/**
	 * Pause or resume a marquee, e.g. from custom code.
	 *
	 * @param {Element|string} target  The marquee element or its HTML anchor.
	 * @param {boolean}        [pause] Pause (true) or play (false); toggles if omitted.
	 */
	pause( target, pause ) {
		const element = 'string' === typeof target ? document.getElementById( target ) : target;
		const marquee = element?.tmbMarquee;

		if ( marquee ) {
			marquee.pausedByButton = undefined === pause ? ! marquee.pausedByButton : !! pause;
			syncPauseButtons( marquee );
			updatePlayState( marquee );
		}
	},
};
