/**
 * Front-end behaviour for the Countdown block.
 *
 * Each countdown is a `.tmb-countdown` wrapper with a JSON config in
 * `data-tmb-countdown`. Its parts are ordinary GenerateBlocks blocks:
 *   - data-countdown-part="days|hours|minutes|seconds": numbers, rewritten each tick
 *   - data-countdown-unit="days|…": a unit's box (number + label), hidden with it
 *   - data-countdown-part="timer": hidden when it ends (if set to show a message)
 *   - data-countdown-part="ended": shown when it ends
 *
 * When a countdown ends it fires `tmb-countdown:end` on the wrapper (it bubbles).
 */
import { UNITS, nextRecurring, splitRemaining } from './time';

const STORAGE_PREFIX = 'tmb-countdown:';
const countdowns = [];
let timer = null;

function readStorage( key ) {
	try {
		return window.localStorage.getItem( STORAGE_PREFIX + key );
	} catch ( e ) {
		return null;
	}
}

function writeStorage( key, value ) {
	try {
		window.localStorage.setItem( STORAGE_PREFIX + key, value );
	} catch ( e ) {}
}

// Bare words that may also mean a tag, mirroring Thingamablocks_Sanitize::TAG_TARGETS.
const TAG_TARGETS = [ 'html', 'body', 'main', 'header', 'footer', 'nav', 'aside', 'article', 'section' ];

function resolve( value ) {
	try {
		if ( /^[A-Za-z][\w-]*$/.test( value ) ) {
			const byId = [ ...document.querySelectorAll( `[id="${ value }"]` ) ];

			if ( byId.length || ! TAG_TARGETS.includes( value ) ) {
				return byId;
			}
		}

		return [ ...document.querySelectorAll( value ) ];
	} catch ( e ) {
		return [];
	}
}

function queryAll( values = [] ) {
	return [ ...new Set( values.flatMap( resolve ) ) ];
}

// Inline !important, so "remove unused CSS" optimisers can't undo it.
function hide( element ) {
	element.style.setProperty( 'display', 'none', 'important' );
}

function show( element ) {
	if ( 'none' === element.style.getPropertyValue( 'display' ) ) {
		element.style.removeProperty( 'display' );
	}
}

/**
 * Write a number into a part without wiping anything else in it (e.g. a GB
 * Text block's icon): replace its last non-empty text node.
 *
 * @param {Element} element Number part.
 * @param {string}  text    Number.
 */
function setNumber( element, text ) {
	if ( ! element.children.length ) {
		if ( element.textContent !== text ) {
			element.textContent = text;
		}
		return;
	}

	const walker = document.createTreeWalker( element, NodeFilter.SHOW_TEXT );
	let target = null;

	while ( walker.nextNode() ) {
		if ( walker.currentNode.nodeValue.trim() ) {
			target = walker.currentNode;
		}
	}

	if ( target && target.nodeValue !== text ) {
		target.nodeValue = text;
	}
}

function pad( value, config ) {
	return config.pad ? String( value ).padStart( 2, '0' ) : String( value );
}

/**
 * When the current run of this countdown ends, in ms since the epoch.
 *
 * @param {Object} countdown Countdown record.
 * @param {number} now       Now.
 * @return {number|null} End time.
 */
function endTime( countdown, now ) {
	const { config } = countdown;

	if ( 'recurring' === config.mode ) {
		return nextRecurring( now, config.time, config.days, config.timeZone );
	}

	if ( 'evergreen' === config.mode ) {
		const duration = Math.max( 1, config.evergreenMinutes ) * 60000;
		// Fall back to this page view's deadline if the browser blocks storage.
		let end = Number( readStorage( countdown.key ) ) || countdown.evergreenEnd;

		// First visit, or a finished run that should start over.
		if ( ! end || ( end <= now && config.evergreenRestart ) ) {
			end = now + duration;
			writeStorage( countdown.key, String( end ) );
		}

		countdown.evergreenEnd = end;

		return end;
	}

	return config.end || null;
}

function paintNumbers( countdown, ms ) {
	const { config, parts } = countdown;
	const values = splitRemaining( ms, countdown.present );
	// Keep at least the two smallest units visible, so it never shows nothing.
	const alwaysShown = countdown.present.slice( -2 );
	let leading = true;

	countdown.present.forEach( ( unit ) => {
		const value = values[ unit ];
		const text = pad( value, config );

		parts[ unit ].forEach( ( element ) => setNumber( element, text ) );

		if ( config.hideEmptyUnits ) {
			const empty = leading && 0 === value && ! alwaysShown.includes( unit );
			const boxes = countdown.units[ unit ].length
				? countdown.units[ unit ]
				: parts[ unit ];

			boxes.forEach( ( box ) => {
				( empty ? hide : show )( box );

				// A separator right after a hidden unit ("00 : 14") goes with it.
				const next = box.nextElementSibling;

				if ( next && 'separator' === next.getAttribute( 'data-countdown-part' ) ) {
					( empty ? hide : show )( next );
				}
			} );
		}

		leading = leading && 0 === value;
	} );
}

function setEnded( countdown, ended, initial ) {
	const { config, element, parts } = countdown;

	if ( countdown.ended === ended ) {
		return;
	}

	countdown.ended = ended;
	element.classList.toggle( 'is-ended', ended );
	element.classList.toggle( 'is-running', ! ended );

	const showMessage = ended && 'message' === config.endAction;

	parts.timer.forEach( showMessage ? hide : show );
	parts.ended.forEach( ended ? show : hide );

	if ( 'hide' === config.endAction ) {
		( ended ? hide : show )( element );
	}

	queryAll( config.showOnEnd ).forEach( ended ? show : hide );
	queryAll( config.hideOnEnd ).forEach( ended ? hide : show );

	if ( ! ended ) {
		return;
	}

	if ( ! initial ) {
		announceEnd( countdown );
	}

	element.dispatchEvent(
		new CustomEvent( 'tmb-countdown:end', {
			bubbles: true,
			detail: { countdown: element, mode: config.mode, initial },
		} )
	);

	if ( config.redirectUrl ) {
		redirect( config.redirectUrl );
	}
}

/**
 * Go to the "when it ends" page, unless it's the page we're on: "/offer" and
 * "/offer/" count as the same, since WordPress redirects one to the other.
 *
 * @param {string} url Redirect URL.
 */
function redirect( url ) {
	try {
		const target = new URL( url, window.location.href );
		const path = ( location ) => location.origin + location.pathname.replace( /\/+$/, '' );

		if ( path( target ) !== path( window.location ) ) {
			window.location.assign( target.href );
		}
	} catch ( e ) {
		// A malformed URL just means no redirect.
	}
}

/**
 * Tell screen reader users the countdown has ended. The countdown itself is a
 * role="timer" region, which isn't read out as it changes (good for the
 * ticking numbers), so the ended message is announced from a live region.
 *
 * @param {Object} countdown Countdown record.
 */
function announceEnd( countdown ) {
	const message = countdown.parts.ended.map( ( part ) => part.textContent.trim() ).join( ' ' );

	if ( message && countdown.live ) {
		countdown.live.textContent = message;
	}
}

function update( countdown, initial = false ) {
	const now = Date.now();

	if ( ! countdown.end || ( countdown.end <= now && 'date' !== countdown.config.mode ) ) {
		// Recurring and restarting evergreen countdowns roll on to their next run.
		const next = endTime( countdown, now );

		if ( next && next !== countdown.end && countdown.end && ! initial ) {
			countdown.element.dispatchEvent(
				new CustomEvent( 'tmb-countdown:restart', {
					bubbles: true,
					detail: { countdown: countdown.element, end: next },
				} )
			);
		}

		countdown.end = next;
	}

	if ( ! countdown.end ) {
		// No date set: nothing to count. Keep "Also show" targets hidden and stop ticking.
		setEnded( countdown, false, initial );
		countdown.idle = true;
		return;
	}

	countdown.idle = false;

	const left = countdown.end - now;

	paintNumbers( countdown, left );
	setEnded( countdown, left <= 0, initial );
}

function tick() {
	countdowns.forEach( ( countdown ) => {
		try {
			update( countdown );
		} catch ( e ) {
			// One broken countdown mustn't stop the others.
		}
	} );

	const running = countdowns.some( ( countdown ) => ! countdown.ended && ! countdown.idle );

	// Wake just after the next whole second, so seconds change on time.
	timer = running ? window.setTimeout( tick, 1005 - ( Date.now() % 1000 ) ) : null;
}

function setup( element ) {
	if ( element.tmbCountdown ) {
		return null;
	}

	let config;

	try {
		config = JSON.parse( element.dataset.tmbCountdown || '{}' );
	} catch ( e ) {
		return null;
	}

	const own = ( selector ) =>
		[ ...element.querySelectorAll( selector ) ].filter(
			( part ) => part.closest( '.tmb-countdown' ) === element
		);

	const parts = {
		timer: own( '[data-countdown-part="timer"]' ),
		ended: own( '[data-countdown-part="ended"]' ),
	};
	const units = {};

	UNITS.forEach( ( [ unit ] ) => {
		parts[ unit ] = own( `[data-countdown-part="${ unit }"]` );
		units[ unit ] = own( `[data-countdown-unit="${ unit }"]` );
	} );

	const position = [
		...document.querySelectorAll( '.tmb-countdown[data-tmb-countdown]' ),
	].indexOf( element );

	const countdown = {
		element,
		config,
		parts,
		units,
		present: UNITS.map( ( [ unit ] ) => unit ).filter( ( unit ) => parts[ unit ].length ),
		// Evergreen deadlines are per visitor: keyed by anchor, else page and position.
		key: element.id ? `id:${ element.id }` : `path:${ window.location.pathname }#${ position }`,
		end: null,
		ended: undefined,
		idle: false,
		evergreenEnd: null,
		live: null,
	};

	if ( parts.ended.length ) {
		countdown.live = document.createElement( 'span' );
		countdown.live.className = 'tmb-countdown-live';
		countdown.live.setAttribute( 'aria-live', 'polite' );
		countdown.live.style.cssText =
			'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
		element.after( countdown.live );
	}

	element.tmbCountdown = countdown;
	countdowns.push( countdown );

	return countdown;
}

/**
 * Set up every countdown inside `root` that isn't set up yet. Runs on page
 * load; call it again after adding countdowns with AJAX.
 *
 * @param {ParentNode} root Where to look.
 */
function init( root = document ) {
	const added = [ ...root.querySelectorAll( '.tmb-countdown[data-tmb-countdown]' ) ]
		.map( setup )
		.filter( Boolean );

	added.forEach( ( countdown ) => update( countdown, true ) );

	document
		.querySelectorAll( 'style.tmb-countdown-initial' )
		.forEach( ( style ) => style.remove() );

	if ( ! timer ) {
		tick();
	}
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', () => init() );
} else {
	init();
}

// Timers are throttled in background tabs; catch up straight away on return.
document.addEventListener( 'visibilitychange', () => {
	if ( 'visible' === document.visibilityState ) {
		window.clearTimeout( timer );
		tick();
	}
} );

window.tmbCountdown = {
	init,
	/**
	 * Restart an evergreen countdown for this visitor (handy when testing).
	 *
	 * @param {string} [id] The countdown's HTML anchor; all evergreen countdowns if omitted.
	 */
	reset( id ) {
		countdowns
			.filter( ( item ) => 'evergreen' === item.config.mode && ( ! id || item.element.id === id ) )
			.forEach( ( item ) => {
				try {
					window.localStorage.removeItem( STORAGE_PREFIX + item.key );
				} catch ( e ) {}

				item.end = null;
				item.ended = undefined;
				update( item, true );
			} );

		if ( ! timer ) {
			tick();
		}
	},
};
