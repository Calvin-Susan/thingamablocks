/**
 * Entrance animations on the front end.
 *
 * Blocks with data-tmb-animate="fade-up" (etc.) animate in the first time they
 * scroll into view. With data-tmb-animate-children="100" the block stays put
 * and its children animate in one after another, 100ms apart.
 *
 * Hiding: before this script arrives, CSS in <head> hides animated blocks
 * (only when JavaScript runs and the visitor hasn't asked for reduced motion),
 * with a fail-safe that shows them after 4s. Once the script is ready it only
 * hides blocks it is actually watching (marked .tmb-wait), so content it never
 * sees can't get stuck invisible. See includes/animations.php.
 */
import { animateIn } from './presets';

const SELECTOR = '[data-tmb-animate]';
const root = document.documentElement;

// Never let a "one by one" group take longer than this to start its last item.
const MAX_STAGGER = 1200;

let observer = null;

function reveal( element ) {
	const type = element.getAttribute( 'data-tmb-animate' );
	const speed = element.getAttribute( 'data-tmb-speed' ) || 'normal';
	const delay = Number( element.getAttribute( 'data-tmb-delay' ) ) || 0;
	const stagger = element.getAttribute( 'data-tmb-animate-children' );

	// Children that are actually shown (not <style>, <template> or hidden ones).
	const targets =
		null === stagger
			? [ element ]
			: [ ...element.children ].filter( ( child ) => child.getClientRects().length );
	const step = Number( stagger ) || 0;

	// Same frame: drop the "hidden" rule and start the animation from hidden.
	element.classList.add( 'tmb-in' );
	targets.forEach( ( target, index ) =>
		animateIn( target, type, delay + Math.min( index * step, MAX_STAGGER ), speed )
	);
}

function showWithoutAnimating( element ) {
	element.classList.add( 'tmb-in' );
}

function watch( element ) {
	if ( element.tmbAnimate || element.classList.contains( 'tmb-in' ) ) {
		return;
	}

	element.tmbAnimate = true;
	element.classList.add( 'tmb-wait' );
	observer.observe( element );
}

/**
 * Watch every animated block inside `container` that isn't watched yet. Runs
 * on page load and automatically for content added later; can also be called
 * by hand: window.tmbAnimate.init( container ).
 *
 * @param {ParentNode} container Where to look.
 */
function init( container = document ) {
	const elements = [
		...( container.matches?.( SELECTOR ) ? [ container ] : [] ),
		...container.querySelectorAll( SELECTOR ),
	];

	elements.forEach( observer ? watch : showWithoutAnimating );
}

function start() {
	const reduced = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	/*
	 * If the fail-safe has already shown everything (slow connection, or a
	 * "delay JavaScript" optimisation), animating now would make the page
	 * blink, so just leave it all visible.
	 */
	const late = performance.now() > 3800;

	if ( 'IntersectionObserver' in window && ! reduced && ! late ) {
		observer = new IntersectionObserver( ( entries ) =>
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting ) {
					observer.unobserve( entry.target );
					reveal( entry.target );
				} else if ( entry.boundingClientRect.bottom <= 0 && entry.boundingClientRect.height > 0 ) {
					// Already scrolled past (e.g. the visitor arrived via an #anchor
					// lower down): just show it, there's nothing to watch.
					observer.unobserve( entry.target );
					showWithoutAnimating( entry.target );
				}
			} )
		);
	}

	init();

	// From here on, only blocks marked .tmb-wait are hidden.
	root.classList.add( 'tmb-animate-ready' );

	// Pick up animated blocks added later (filters, infinite scroll, modals).
	// Mutation callbacks run before the next paint, so new blocks don't flash.
	if ( 'MutationObserver' in window ) {
		new MutationObserver( ( mutations ) =>
			mutations.forEach( ( mutation ) =>
				mutation.addedNodes.forEach( ( node ) => {
					if ( 1 === node.nodeType ) {
						init( node );
					}
				} )
			)
		).observe( document.body, { childList: true, subtree: true } );
	}
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', start );
} else {
	start();
}

window.tmbAnimate = { init };
