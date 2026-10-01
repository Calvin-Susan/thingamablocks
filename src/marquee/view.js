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

	// Copies scroll into view almost at once, so don't make their images wait.
	copy.querySelectorAll( 'img[loading="lazy"]' ).forEach( ( image ) =>
		image.setAttribute( 'loading', 'eager' )
	);

	// One playing video is enough; copies show their poster/first frame.
	copy.querySelectorAll( 'video' ).forEach( ( video ) => {
		video.removeAttribute( 'autoplay' );
		video.pause?.();
	} );

	// A marquee nested inside must not be set up again as a separate one.
	copy.querySelectorAll( '[data-tmb-marquee]' ).forEach( ( nested ) =>
		nested.removeAttribute( 'data-tmb-marquee' )
	);

	// Entrance animations inside a copy: show it as already animated.
	copy.querySelectorAll( '[data-tmb-animate]' ).forEach( ( animated ) =>
		animated.classList.add( 'tmb-in' )
	);
}

/**
 * The gap between the row's items, in px, so the same gap can be used where
 * the row repeats. A percentage or other relative gap is measured from the
 * first two items rather than parsed.
 *
 * @param {Element} items    Items row.
 * @param {boolean} vertical Up/down.
 * @param {number}  scale    Screen px per layout px.
 * @return {number} Gap in layout px.
 */
function gapOf( items, vertical, scale ) {
	const value = getComputedStyle( items )[ vertical ? 'rowGap' : 'columnGap' ];

	if ( /^-?[\d.]+px$/.test( value ) ) {
		return parseFloat( value );
	}

	const [ first, second ] = items.children;

	if ( ! first || ! second ) {
		return 0;
	}

	const a = first.getBoundingClientRect();
	const b = second.getBoundingClientRect();
	const gap = vertical ? b.top - a.bottom : Math.max( b.left - a.right, a.left - b.right );

	return Math.max( 0, gap / scale );
}

/**
 * Measure, add or remove copies, and (re)start the animation.
 *
 * @param {Object} marquee Marquee record.
 */
function layout( marquee ) {
	const { config, track, items, viewport } = marquee;
	const vertical = isVertical( config );

	if ( reducedMotion.matches ) {
		stop( marquee );
		return;
	}

	/*
	 * getBoundingClientRect() is in screen pixels, which include any scale on
	 * an ancestor (e.g. a block zooming in on entrance), while the animation
	 * moves in layout pixels. Divide by the viewport's own scale to convert.
	 */
	const viewportRect = viewport.getBoundingClientRect();
	const rawScale =
		( vertical
			? viewportRect.height / ( viewport.offsetHeight || 1 )
			: viewportRect.width / ( viewport.offsetWidth || 1 ) ) || 1;
	// offsetWidth is rounded, so only correct for a real scale, not rounding noise.
	const scale = Math.abs( rawScale - 1 ) < 0.02 ? 1 : rawScale;
	const gap = gapOf( items, vertical, scale );
	const rect = items.getBoundingClientRect();
	const size = ( vertical ? rect.height : rect.width ) / scale;
	const space = vertical ? viewport.clientHeight : viewport.clientWidth;

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

	/*
	 * The exact loop length is how far the first copy sits from the original:
	 * row + gap, with no rounding. (size + gap was only the estimate used to
	 * decide how many copies are needed.)
	 */
	const first = items.getBoundingClientRect();
	const copy = marquee.copies[ 0 ].getBoundingClientRect();
	const distance = ( vertical ? copy.top - first.top : copy.left - first.left ) / scale;

	if ( distance === marquee.distance && marquee.animation ) {
		return;
	}

	marquee.distance = distance;

	const axis = vertical ? 'Y' : 'X';
	// The track is always laid out left to right (see setup), so the maths is the same on RTL sites.
	const forwards = 'left' === config.direction || 'up' === config.direction;
	const sign = forwards ? -1 : 1;
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

	// Without motion, let people scroll to see everything, with no faded ends hiding the first and last items.
	const vertical = isVertical( marquee.config );
	marquee.viewport.style.setProperty( vertical ? 'overflow-y' : 'overflow-x', 'auto' );
	marquee.viewport.style.removeProperty( 'mask-image' );
	marquee.viewport.style.removeProperty( '-webkit-mask-image' );
	// The GB styles give the button display:flex, which would beat the hidden attribute.
	marquee.pauseButtons.forEach( ( button ) => button.style.setProperty( 'display', 'none', 'important' ) );
}

/**
 * Undo stop() when reduced motion is switched off again.
 *
 * @param {Object} marquee Marquee record.
 */
function restart( marquee ) {
	const { viewport, mask } = marquee;

	viewport.style.setProperty( 'overflow-x', 'hidden' );
	viewport.style.setProperty( 'overflow-y', 'hidden' );

	if ( mask ) {
		viewport.style.setProperty( 'mask-image', mask );
		viewport.style.setProperty( '-webkit-mask-image', mask );
	}

	marquee.pauseButtons.forEach( ( button ) => button.style.removeProperty( 'display' ) );
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

	/*
	 * The track sits in a clipping viewport that carries the edge fade, so the
	 * fade applies to the moving row only, not to the pause button. (The server
	 * puts the fade on the wrapper so the row looks right before this runs.)
	 */
	const viewport = document.createElement( 'div' );
	viewport.className = 'tmb-marquee__viewport';
	// contain: the viewport never grows to fit the track, even in a container
	// that sizes to its content (which would otherwise add copies forever).
	viewport.style.cssText = `overflow:hidden;contain:${ vertical ? 'size' : 'inline-size' };${
		vertical ? 'height:100%;' : 'width:100%;'
	}direction:ltr`;

	// The track runs left to right even on RTL sites, so the loop maths is the
	// same; the row keeps the page's direction for its own content.
	items.style.direction = getComputedStyle( element ).direction;

	const mask = element.style.getPropertyValue( 'mask-image' ) || element.style.getPropertyValue( '-webkit-mask-image' );

	if ( mask ) {
		viewport.style.setProperty( 'mask-image', mask );
		viewport.style.setProperty( '-webkit-mask-image', mask );
		element.style.removeProperty( 'mask-image' );
		element.style.removeProperty( '-webkit-mask-image' );
	}

	items.before( viewport );
	viewport.appendChild( track );
	track.appendChild( items );

	// Tabbing to a clipped link makes the browser scroll the viewport, which
	// would knock the loop out of line. The marquee pauses on focus instead.
	viewport.addEventListener( 'scroll', () => {
		// Only while moving: with reduced motion the row is meant to be scrolled.
		if ( element.tmbMarquee?.animation ) {
			viewport.scrollLeft = 0;
			viewport.scrollTop = 0;
		}
	} );

	const marquee = {
		element,
		config,
		items,
		track,
		viewport,
		mask,
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
		// A button with its own visible text ("Stop motion") should be named by
		// that text, not the server's default label for icon-only buttons.
		if ( button.textContent.trim() && 'tmbDefaultLabel' in button.dataset ) {
			button.removeAttribute( 'aria-label' );
		}

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

	// Mouse only: a tap on a touch screen would "hover" and never leave.
	element.addEventListener( 'pointerenter', ( event ) => {
		if ( 'mouse' === event.pointerType ) {
			marquee.hovered = true;
			updatePlayState( marquee );
		}
	} );
	element.addEventListener( 'pointerleave', () => {
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
		observer.observe( viewport );
	}

	// Don't burn CPU animating something nobody can see.
	if ( 'IntersectionObserver' in window ) {
		new IntersectionObserver( ( entries ) => {
			marquee.offscreen = ! entries[ entries.length - 1 ].isIntersecting;
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
			restart( marquee );
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
