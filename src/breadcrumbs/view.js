/**
 * Front-end behaviour for the Breadcrumbs block: collapsing a long trail.
 *
 * When the trail doesn't fit on one line, the steps in the middle are hidden
 * (oldest first) and a "…" button takes their place: Home › … › Parent ›
 * Page. The button shows the full trail and moves focus to the first step
 * it revealed. Without JavaScript, the trail simply wraps.
 */

const trails = [];

/**
 * Whether the list fits on one line.
 *
 * @param {Element} list The <ol>.
 * @return {boolean} Fits.
 */
function fitsOnOneLine( list ) {
	const steps = [ ...list.children ].filter( ( step ) => ! step.hidden );
	const first = steps[ 0 ]?.getBoundingClientRect();
	const last = steps[ steps.length - 1 ]?.getBoundingClientRect();

	// Same line when the last step starts above the first one's bottom.
	return ! first || ! last || last.top < first.bottom - 1;
}

/**
 * The "…" step: a button, followed by a copy of the separator.
 *
 * @param {Object} trail Trail record.
 * @return {Element} The step.
 */
function moreStep( trail ) {
	const step = document.createElement( 'li' );
	const button = document.createElement( 'button' );
	const separator = trail.steps[ 0 ].querySelector(
		':scope > .tmb-breadcrumbs__separator'
	);

	step.className = 'tmb-breadcrumbs__step tmb-breadcrumbs__more-step';
	button.type = 'button';
	button.className = 'tmb-breadcrumbs__more';
	button.textContent = '…';
	button.setAttribute( 'aria-label', trail.label );
	button.setAttribute( 'aria-expanded', 'false' );
	button.addEventListener( 'click', () => expand( trail ) );

	step.append( button );

	if ( separator ) {
		step.append( separator.cloneNode( true ) );
	}

	return step;
}

function layout( trail ) {
	const { list, steps } = trail;

	if ( trail.expanded ) {
		return;
	}

	// Start from the full trail.
	steps.forEach( ( step ) => ( step.hidden = false ) );
	trail.more?.remove();
	trail.more = null;

	if ( fitsOnOneLine( list ) ) {
		return;
	}

	// Keep the first step (home) and the last two (parent and page).
	const middle = steps.slice( 1, -2 );

	if ( ! middle.length ) {
		return;
	}

	const fullHeight = list.offsetHeight;

	trail.more = moreStep( trail );
	steps[ 0 ].after( trail.more );

	for ( const step of middle ) {
		step.hidden = true;

		if ( fitsOnOneLine( list ) ) {
			return;
		}
	}

	// Still too long (a long page title on a phone, say) and no shorter for
	// hiding steps: show the whole trail rather than hiding it for nothing.
	if ( list.offsetHeight >= fullHeight ) {
		steps.forEach( ( step ) => ( step.hidden = false ) );
		trail.more.remove();
		trail.more = null;
	}
}

function expand( trail ) {
	const revealed = trail.steps.find( ( step ) => step.hidden );

	trail.expanded = true;
	trail.steps.forEach( ( step ) => ( step.hidden = false ) );
	trail.more?.remove();
	trail.more = null;

	// Focus the first step that was hidden, so keyboard users carry on there.
	// (A step without a link, from an SEO plugin's trail say, can't take
	// focus; then the first link does.)
	(
		revealed?.querySelector( 'a[href]' ) ||
		trail.list.querySelector( 'a[href]' )
	)?.focus();
}

function setup( element ) {
	if ( element.tmbBreadcrumbs ) {
		return;
	}

	let config;

	try {
		config = JSON.parse( element.dataset.tmbBreadcrumbs || '{}' );
	} catch ( e ) {
		return;
	}

	const list = element.querySelector( '.tmb-breadcrumbs__list' );

	if ( ! list ) {
		return;
	}

	const trail = {
		element,
		list,
		steps: [ ...list.children ],
		label: String( config?.more || '…' ),
		more: null,
		expanded: false,
	};

	element.tmbBreadcrumbs = trail;
	trails.push( trail );
	layout( trail );

	// Re-check when the space changes (rotating a phone, resizing).
	if ( 'ResizeObserver' in window ) {
		let width = 0;

		new ResizeObserver( ( entries ) => {
			const next = Math.round( entries[ 0 ].contentRect.width );

			if ( next !== width ) {
				width = next;
				layout( trail );
			}
		} ).observe( element );
	}
}

/**
 * Set up every collapsible trail inside `root`. Runs on page load; call it
 * again after adding breadcrumbs with AJAX.
 *
 * @param {ParentNode} root Where to look.
 */
function init( root = document ) {
	root.querySelectorAll( '.tmb-breadcrumbs[data-tmb-breadcrumbs]' ).forEach(
		setup
	);
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', () => init() );
} else {
	init();
}

// Fonts loading can change the widths.
document.fonts?.ready.then( () => trails.forEach( layout ) );

window.tmbBreadcrumbs = { init };
