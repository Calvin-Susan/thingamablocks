/**
 * Front-end behaviour for the Table of Contents block.
 *
 * - A link scrolls smoothly to its heading (instantly for visitors who prefer
 *   reduced motion), updates the address and moves keyboard focus to the
 *   heading, so Tab carries on from there.
 * - The link for the section being read gets aria-current="true": the last
 *   heading scrolled past the top quarter of the window (at the very bottom
 *   of the page, the last heading on screen). It only shows if the link is
 *   styled for it. A table of contents that scrolls in its own box keeps the
 *   current link in view there.
 * - With copy-link buttons on, each listed heading gets a button (the icon
 *   from the block's template) that copies a link to it.
 * - With Collapse on, below the breakpoint the title is a button that opens
 *   and closes the list, showing the section being read while it's closed.
 *   A link closes it again. (The server prints it closed, and the CSS that
 *   decides which screens collapse.)
 *
 * Without JavaScript the links are ordinary jump links.
 */
import { duration } from '../shared/speeds';

// The Dropdown's speeds (Settings → Thingamablocks → Speeds).
const SPEEDS = { fast: 150, normal: 250, slow: 400 };

const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' );
const tocs = [];
let frame = 0;
let status = null;

/**
 * The heading a link points to, if it's a heading on this page.
 *
 * @param {Element} link Link.
 * @return {Element|null} Heading.
 */
function headingFor( link ) {
	const hash = link.getAttribute( 'href' ) || '';

	if ( '#' !== hash.charAt( 0 ) || hash.length < 2 ) {
		return null;
	}

	let target = document.getElementById( hash.slice( 1 ) );

	if ( ! target ) {
		try {
			target = document.getElementById(
				decodeURIComponent( hash.slice( 1 ) )
			);
		} catch ( e ) {
			return null;
		}
	}

	return target && /^H[1-6]$/.test( target.tagName ) ? target : null;
}

const behavior = () => ( reducedMotion.matches ? 'auto' : 'smooth' );

/**
 * The box a table of contents scrolls in (a sticky sidebar with a fixed
 * height, say), if it isn't the page.
 *
 * @param {Object} toc Table of contents record.
 * @return {Element|null} Scrolling box.
 */
function scrollBox( toc ) {
	const page = toc.entries[ 0 ].heading;

	for (
		let box = toc.element;
		box && box !== document.body && ! box.contains( page );
		box = box.parentElement
	) {
		const { overflowY } = window.getComputedStyle( box );

		if (
			( 'auto' === overflowY || 'scroll' === overflowY ) &&
			box.scrollHeight > box.clientHeight
		) {
			return box;
		}
	}

	return null;
}

/**
 * Keep the current link in view in its table of contents' own box.
 *
 * @param {Object}  toc  Table of contents record.
 * @param {Element} link Current link.
 */
function reveal( toc, link ) {
	const box = scrollBox( toc );

	if ( ! box ) {
		return;
	}

	const item = link.getBoundingClientRect();
	const area = box.getBoundingClientRect();
	const room = 16;
	let delta = 0;

	if ( item.top < area.top + room ) {
		delta = item.top - area.top - room;
	} else if ( item.bottom > area.bottom - room ) {
		delta = item.bottom - area.bottom + room;
	}

	if ( delta ) {
		box.scrollBy( { top: delta, behavior: behavior() } );
	}
}

function setCurrent( toc, entry ) {
	if ( entry === toc.current ) {
		return;
	}

	toc.current?.link.removeAttribute( 'aria-current' );
	entry?.link.setAttribute( 'aria-current', 'true' );
	toc.current = entry;

	if ( toc.toggle?.current ) {
		toc.toggle.current.textContent = entry
			? entry.link.textContent.trim()
			: '';
	}

	if ( entry ) {
		reveal( toc, entry.link );
	}
}

/**
 * Work out the section being read.
 *
 * @param {Object} toc Table of contents record.
 */
function currentFor( toc ) {
	if ( toc.pinned ) {
		return toc.current;
	}

	const height = window.innerHeight;
	const atBottom =
		height + window.scrollY >= document.documentElement.scrollHeight - 2;
	// The top quarter, or just below the scroll offset (a sticky header) if
	// that's lower.
	const line = atBottom ? height - 1 : Math.max( height / 4, toc.offset + 8 );
	let current = null;

	for ( const entry of toc.entries ) {
		if ( entry.heading.getBoundingClientRect().top > line ) {
			break;
		}

		current = entry;
	}

	return current;
}

const update = ( toc ) => setCurrent( toc, currentFor( toc ) );

function schedule() {
	if ( ! frame ) {
		frame = window.requestAnimationFrame( () => {
			frame = 0;

			// Read every table of contents' position first, then change
			// them (no layout work in between).
			const next = tocs.map( currentFor );

			tocs.forEach( ( toc, index ) => setCurrent( toc, next[ index ] ) );
		} );
	}
}

/**
 * Go to a heading: scroll to it, put it in the address and focus it.
 *
 * @param {Object} toc   Table of contents record.
 * @param {Object} entry Link and heading.
 */
function go( toc, entry ) {
	const { heading } = entry;
	const hash = '#' + encodeURIComponent( heading.id );

	if ( isCollapsed( toc ) ) {
		setOpen( toc, false, false );
	}

	// While the page scrolls there, the link clicked stays current (rather
	// than each section passed lighting up in turn).
	setCurrent( toc, entry );
	toc.pinned = true;
	window.clearTimeout( toc.release );

	const release = () => {
		window.clearTimeout( toc.release );
		toc.pinned = false;
		schedule();
	};

	window.addEventListener( 'scrollend', release, { once: true } );
	toc.release = window.setTimeout( release, 1500 );

	heading.scrollIntoView( { behavior: behavior(), block: 'start' } );

	if ( window.location.hash !== hash ) {
		window.history.pushState( null, '', hash );
	}

	if ( ! heading.hasAttribute( 'tabindex' ) ) {
		heading.setAttribute( 'tabindex', '-1' );
	}

	heading.focus( { preventScroll: true } );
}

/**
 * Whether the list is in its collapsible form (below the breakpoint, where
 * the toggle button shows).
 *
 * @param {Object} toc Table of contents record.
 * @return {boolean} Collapsible.
 */
function isCollapsed( toc ) {
	return !! toc.toggle && toc.toggle.button.getClientRects().length > 0;
}

/**
 * Open or close the list.
 *
 * @param {Object}  toc     Table of contents record.
 * @param {boolean} open    Open.
 * @param {boolean} animate Animate (unless reduced motion is preferred).
 */
function setOpen( toc, open, animate ) {
	const { button, panel } = toc.toggle;
	const ms =
		animate && ! reducedMotion.matches
			? duration( 'dropdown', 'normal', SPEEDS )
			: 0;

	toc.animation?.cancel();
	button.setAttribute( 'aria-expanded', String( open ) );

	if ( open ) {
		toc.element.setAttribute( 'data-open', '' );
	}

	if ( ! ms ) {
		if ( ! open ) {
			toc.element.removeAttribute( 'data-open' );
		}

		return;
	}

	const height = `${ panel.offsetHeight }px`;
	const frames = [
		{ height: '0px', overflow: 'hidden' },
		{ height, overflow: 'hidden' },
	];

	toc.animation = panel.animate( open ? frames : frames.reverse(), {
		duration: ms,
		easing: open ? 'ease-out' : 'ease-in',
	} );

	if ( ! open ) {
		toc.animation.onfinish = () =>
			toc.element.removeAttribute( 'data-open' );
	}
}

/**
 * Set up the toggle button, if the block collapses on small screens.
 *
 * @param {Object} toc Table of contents record.
 */
function setupToggle( toc ) {
	const button = toc.element.querySelector( '.tmb-toc__toggle' );
	const panel = toc.element.querySelector( '.tmb-toc__panel' );

	if ( ! button || ! panel ) {
		return;
	}

	toc.toggle = {
		button,
		panel,
		current: button.querySelector( '.tmb-toc__toggle-current' ),
	};

	button.addEventListener( 'click', () =>
		setOpen( toc, 'true' !== button.getAttribute( 'aria-expanded' ), true )
	);

	// Escape closes it, back to the button.
	toc.element.addEventListener( 'keydown', ( event ) => {
		if (
			'Escape' === event.key &&
			isCollapsed( toc ) &&
			'true' === button.getAttribute( 'aria-expanded' )
		) {
			setOpen( toc, false, true );
			button.focus();
		}
	} );
}

/**
 * Say something to screen readers, once.
 *
 * @param {string} text Message.
 */
function announce( text ) {
	status.textContent = '';
	window.setTimeout( () => ( status.textContent = text ), 100 );
}

async function copyLink( heading, button, config ) {
	const url = new URL( window.location.href );

	url.hash = heading.id;

	try {
		await window.navigator.clipboard.writeText( url.href );
	} catch ( e ) {
		// No clipboard (a page not on https, say): go to the heading, so the
		// link is in the address bar to copy.
		window.location.hash = heading.id;
		return;
	}

	button.setAttribute( 'data-copied', 'true' );
	button.querySelector( '.tmb-toc__copied' ).hidden = false;
	announce( config.copied );

	window.clearTimeout( button.tmbTimer );
	button.tmbTimer = window.setTimeout( () => {
		button.removeAttribute( 'data-copied' );
		button.querySelector( '.tmb-toc__copied' ).hidden = true;
	}, 2000 );
}

/**
 * Add a copy-link button to each listed heading.
 *
 * @param {Object} toc    Table of contents record.
 * @param {Object} config Labels.
 */
function addCopyButtons( toc, config ) {
	const template = toc.element.querySelector(
		':scope > template.tmb-toc__copy-template'
	);

	if (
		! template ||
		'string' !== typeof config.copy ||
		'string' !== typeof config.copied
	) {
		return;
	}

	if ( ! status ) {
		status = document.createElement( 'div' );
		status.className = 'tmb-toc__status';
		status.setAttribute( 'role', 'status' );
		document.body.append( status );
	}

	toc.entries.forEach( ( { heading } ) => {
		// Another table of contents on the page may have added one.
		if ( heading.querySelector( ':scope > .tmb-toc__copy-button' ) ) {
			return;
		}

		const button = document.createElement( 'button' );
		const copied = document.createElement( 'span' );

		button.type = 'button';
		button.className = 'tmb-toc__copy-button';
		button.setAttribute( 'aria-label', config.copy );
		button.append( template.content.cloneNode( true ) );

		// Shown briefly after copying; screen readers hear the announcement.
		copied.className = 'tmb-toc__copied';
		copied.textContent = config.copied;
		copied.hidden = true;
		copied.setAttribute( 'aria-hidden', 'true' );
		button.append( copied );

		button.addEventListener( 'click', () =>
			copyLink( heading, button, config )
		);
		heading.append( button );
	} );
}

function setup( element ) {
	if ( element.tmbToc ) {
		return;
	}

	let config;

	try {
		config = JSON.parse( element.dataset.tmbToc || '{}' ) || {};
	} catch ( e ) {
		return;
	}

	const entries = [ ...element.querySelectorAll( 'a[href^="#"]' ) ]
		.map( ( link ) => ( { link, heading: headingFor( link ) } ) )
		.filter( ( entry ) => entry.heading )
		.sort( ( a, b ) =>
			// eslint-disable-next-line no-bitwise -- a DOM position flag.
			a.heading.compareDocumentPosition( b.heading ) &
			window.Node.DOCUMENT_POSITION_FOLLOWING
				? -1
				: 1
		);

	if ( ! entries.length ) {
		return;
	}

	const toc = {
		element,
		entries,
		current: null,
		toggle: null,
		animation: null,
		pinned: false,
		release: 0,
		// The scroll offset setting (CSS scroll-margin on headings).
		offset:
			parseFloat(
				window.getComputedStyle( entries[ 0 ].heading ).scrollMarginTop
			) || 0,
	};

	element.tmbToc = toc;
	tocs.push( toc );

	element.addEventListener( 'click', ( event ) => {
		const link = event.target.closest?.( 'a[href^="#"]' );
		const entry = link && entries.find( ( item ) => item.link === link );

		// Leave a click that opens a new tab alone.
		if (
			! entry ||
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		event.preventDefault();
		go( toc, entry );
	} );

	setupToggle( toc );
	addCopyButtons( toc, config );
	update( toc );
}

/**
 * Set up every table of contents inside `root`. Runs on page load; call it
 * again after adding one with AJAX.
 *
 * @param {ParentNode} root Where to look.
 */
function init( root = document ) {
	root.querySelectorAll( 'nav.tmb-toc[data-tmb-toc]' ).forEach( setup );
}

window.addEventListener( 'scroll', schedule, { passive: true } );
window.addEventListener( 'resize', schedule, { passive: true } );

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', () => init() );
} else {
	init();
}

window.tmbToc = { init };
