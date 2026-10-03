/**
 * Front-end behaviour for Share buttons that need a script (only loaded on
 * pages with one): Copy link copies the post's address, and "Share…" opens
 * the device's share sheet, shown only where there is one. Network buttons
 * are plain links and need nothing.
 */

const COPY = '[data-share-network="copy"]';
const NATIVE = '[data-share-network="native"]';

/**
 * The block's settings: the post's address and title (written by PHP).
 *
 * @param {Element} button A button.
 * @return {Object|null} Settings.
 */
function settingsFor( button ) {
	const root = button.closest( '.tmb-share[data-tmb-share]' );
	let settings;

	try {
		settings = JSON.parse( root?.dataset.tmbShare || 'null' );
	} catch ( e ) {
		return null;
	}

	if ( ! settings || 'object' !== typeof settings ) {
		return null;
	}

	// Only ever a web address of this kind.
	let url;

	try {
		url = new URL( String( settings.url ), window.location.href );
	} catch ( e ) {
		return null;
	}

	if ( ! /^https?:$/.test( url.protocol ) ) {
		return null;
	}

	return {
		root,
		url: url.href,
		title: String( settings.title || '' ),
		copied: String( settings.copied || '' ),
		failed: String( settings.failed || '' ),
	};
}

function announce( root, text ) {
	const status = root.querySelector( ':scope > .tmb-share__status' );

	if ( status ) {
		status.textContent = '';
		window.setTimeout( () => ( status.textContent = text ), 100 );
	}
}

/**
 * The older way to copy, for pages the Clipboard API won't work on (not on
 * https, say). Focus goes back to the button afterwards.
 *
 * @param {string}  text   Text.
 * @param {Element} button The button.
 * @return {boolean} Copied.
 */
function copyOldWay( text, button ) {
	const area = document.createElement( 'textarea' );
	let copied = false;

	area.value = text;
	area.setAttribute( 'readonly', '' );
	area.setAttribute( 'aria-hidden', 'true' );
	area.style.position = 'fixed';
	area.style.top = '-9999px';
	document.body.append( area );
	area.select();

	try {
		copied = document.execCommand( 'copy' );
	} catch ( e ) {
		copied = false;
	}

	area.remove();
	button.focus();

	return copied;
}

async function copy( button, settings ) {
	let message = settings.copied;

	try {
		await window.navigator.clipboard.writeText( settings.url );
	} catch ( e ) {
		if ( ! copyOldWay( settings.url, button ) ) {
			// No way to copy. On another page, go to the post, so its
			// address is in the address bar; on the post, say so.
			if ( settings.url !== window.location.href.split( '#' )[ 0 ] ) {
				window.location.assign( settings.url );
				return;
			}

			message = settings.failed;
		}
	}

	// The visible name doesn't change (voice control users say what they
	// see); the message shows beside it and is announced once.
	let note = button.querySelector( ':scope > .tmb-share__copied' );

	if ( ! note ) {
		note = document.createElement( 'span' );
		note.className = 'tmb-share__copied';
		note.setAttribute( 'aria-hidden', 'true' );
		button.append( note );
	}

	note.textContent = message;
	note.hidden = false;

	if ( message === settings.copied ) {
		button.setAttribute( 'data-copied', 'true' );
	}

	announce( settings.root, message );

	window.clearTimeout( button.tmbShareTimer );
	button.tmbShareTimer = window.setTimeout(
		() => {
			note.hidden = true;
			button.removeAttribute( 'data-copied' );
		},
		message === settings.copied ? 2000 : 5000
	);
}

document.addEventListener( 'click', ( event ) => {
	const button = event.target.closest?.( `${ COPY }, ${ NATIVE }` );
	const settings = button && settingsFor( button );

	if ( ! settings ) {
		return;
	}

	event.preventDefault();

	if ( button.matches( COPY ) ) {
		copy( button, settings );
	} else if ( 'function' === typeof window.navigator.share ) {
		// Closing the share sheet rejects; that's fine.
		window.navigator
			.share( { title: settings.title, url: settings.url } )
			.catch( () => {} );
	}
} );

/**
 * Show the "Share…" buttons inside `root`, where the device has a share
 * sheet. Runs on page load; call it again after adding Share blocks with
 * AJAX.
 *
 * @param {ParentNode} root Where to look.
 */
function init( root = document ) {
	if ( 'function' !== typeof window.navigator.share ) {
		return;
	}

	root.querySelectorAll( `.tmb-share ${ NATIVE }[hidden]` ).forEach(
		( button ) => ( button.hidden = false )
	);
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', () => init() );
} else {
	init();
}

window.tmbShare = { init };
