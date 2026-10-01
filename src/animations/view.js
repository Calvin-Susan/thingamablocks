/**
 * Entrance animations on the front end.
 *
 * Blocks with data-tmb-animate="fade-up" (etc.) animate in the first time they
 * scroll into view. With data-tmb-animate-children="100" the block stays put
 * and its children animate in one after another, 100ms apart.
 *
 * Until then they're hidden by a few lines of CSS that the server prints only
 * after this script is known to be on the page (see includes/animations.php),
 * and only for visitors who haven't asked for reduced motion.
 */
import { animateIn } from './presets';

const SELECTOR = '[data-tmb-animate]';

// Tell the fail-safe CSS the script has arrived.
document.documentElement.classList.add( 'tmb-animate-ready' );

function reveal( element ) {
	const type = element.getAttribute( 'data-tmb-animate' );
	const speed = element.getAttribute( 'data-tmb-speed' ) || 'normal';
	const delay = Number( element.getAttribute( 'data-tmb-delay' ) ) || 0;
	const stagger = element.getAttribute( 'data-tmb-animate-children' );

	const targets = null === stagger ? [ element ] : [ ...element.children ];
	const step = Number( stagger ) || 0;

	// Same frame: drop the "hidden" rule and start the animation from hidden.
	element.classList.add( 'tmb-in' );
	targets.forEach( ( target, index ) => animateIn( target, type, delay + index * step, speed ) );
}

function init( root = document ) {
	const elements = [ ...root.querySelectorAll( SELECTOR ) ].filter(
		( element ) => ! element.classList.contains( 'tmb-in' ) && ! element.tmbAnimate
	);

	if ( ! elements.length ) {
		return;
	}

	if ( ! ( 'IntersectionObserver' in window ) || window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
		elements.forEach( ( element ) => element.classList.add( 'tmb-in' ) );
		return;
	}

	const observer = new IntersectionObserver(
		( entries ) =>
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting ) {
					observer.unobserve( entry.target );
					reveal( entry.target );
				}
			} ),
		// Start a little before the block is fully in view, so it's moving as it arrives.
		{ rootMargin: '0px 0px -8% 0px', threshold: 0 }
	);

	elements.forEach( ( element ) => {
		element.tmbAnimate = true;
		observer.observe( element );
	} );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', () => init() );
} else {
	init();
}

// For content added later (AJAX, infinite scroll): window.tmbAnimate.init( container ).
window.tmbAnimate = { init };
