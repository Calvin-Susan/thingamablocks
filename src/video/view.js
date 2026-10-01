/**
 * Video backgrounds on the front end.
 *
 * The server renders a poster, an overlay and a hidden pause/play button
 * (see includes/class-thingamablocks-video-background.php); the video itself
 * is added here, only:
 *   - after the page has loaded (it never competes with the page itself),
 *   - when the container is on screen (and it pauses when it isn't, or
 *     when the tab is hidden),
 *   - for visitors who haven't asked for reduced motion or to save data,
 *     and haven't paused background videos before (remembered site-wide).
 * Those visitors keep the poster, with a play button to start it anyway.
 */
import { classify } from './source';
import './view.scss';

const STORAGE_KEY = 'tmb-video-paused';
const PHONE = '(max-width: 767px)';
const VIMEO = 'https://player.vimeo.com';
const EVENT = 'tmb-video:paused';

const remembered = {
	get() {
		try {
			return '1' === window.localStorage.getItem( STORAGE_KEY );
		} catch {
			return false;
		}
	},
	set( paused ) {
		try {
			if ( paused ) {
				window.localStorage.setItem( STORAGE_KEY, '1' );
			} else {
				window.localStorage.removeItem( STORAGE_KEY );
			}
		} catch {}
	},
};

const reducedMotion = () =>
	window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

// Data Saver on, or a 2G connection: keep the poster.
const savingData = () => {
	const connection = navigator.connection;

	return !! (
		connection &&
		( connection.saveData || /2g/.test( connection.effectiveType || '' ) )
	);
};

let pageLoaded = 'complete' === document.readyState;
const waiting = new Set();

if ( ! pageLoaded ) {
	window.addEventListener(
		'load',
		() => {
			pageLoaded = true;
			waiting.forEach( ( sync ) => sync() );
			waiting.clear();
		},
		{ once: true }
	);
}

/**
 * Check a source from the page (data attributes can be forged).
 *
 * @param {Object} source Source from the server.
 * @return {Object|null} Clean source.
 */
function cleanSource( source ) {
	if ( ! source || 'object' !== typeof source ) {
		return null;
	}

	if ( 'vimeo' === source.type && /^\d+$/.test( String( source.id ) ) ) {
		return {
			type: 'vimeo',
			id: String( source.id ),
			hash: /^[a-f0-9]{1,32}$/.test( source.hash || '' )
				? source.hash
				: '',
			ratio: /^\d+:\d+$/.test( source.ratio || '' )
				? source.ratio
				: '16:9',
		};
	}

	// Bunny (its own hostnames, or ones an admin allowed) and Vimeo files only:
	// the attribute could have been typed into a page by hand.
	const checked = classify(
		source.src,
		Array.isArray( window.tmbVideoHosts ) ? window.tmbVideoHosts : []
	);

	return 'file' === source.type && 'file' === checked.type
		? { type: 'file', src: source.src }
		: null;
}

/**
 * A <video> for a Bunny or Vimeo file.
 *
 * @param {Object}      source Source.
 * @param {Object}      config Settings.
 * @param {HTMLElement} layer  Background layer.
 * @param {Object}      events { playing, ended, failed }.
 * @return {Object} { play, pause, restart }.
 */
function fileVideo( source, config, layer, events ) {
	const video = document.createElement( 'video' );

	video.className = 'tmb-video-bg__video';
	video.muted = true;
	video.defaultMuted = true;
	video.playsInline = true;
	video.loop = !! config.loop;
	video.preload = 'auto';
	video.disablePictureInPicture = true;
	video.disableRemotePlayback = true;
	video.setAttribute( 'muted', '' );
	video.setAttribute( 'playsinline', '' );
	video.setAttribute( 'tabindex', '-1' );

	const rate = () => {
		video.defaultPlaybackRate = config.speed;
		video.playbackRate = config.speed;
	};

	video.addEventListener( 'loadedmetadata', rate );
	video.addEventListener( 'playing', events.playing );
	video.addEventListener( 'ended', events.ended );
	video.addEventListener( 'error', events.failed );
	video.src = source.src;
	rate();

	const poster = layer.querySelector( '.tmb-video-bg__poster' );
	layer.insertBefore( video, poster ? poster.nextSibling : layer.firstChild );

	// Only a refusal to autoplay counts (e.g. iOS Low Power Mode); a play
	// cut short by a pause (scrolled past, tab switched) is fine.
	const refused = ( error ) => {
		if ( 'NotAllowedError' === error?.name ) {
			events.blocked();
		}
	};

	return {
		play: () => video.play().catch( refused ),
		pause: () => video.pause(),
		restart() {
			video.currentTime = 0;
			return video.play().catch( refused );
		},
	};
}

/**
 * Vimeo's background player in an iframe, scaled to cover the container
 * and controlled with Vimeo's postMessage API (no Vimeo script on our side).
 *
 * @param {Object}      source Source.
 * @param {Object}      config Settings.
 * @param {HTMLElement} layer  Background layer.
 * @param {Object}      events { playing, ended, ready }.
 * @return {Object} { play, pause, restart }.
 */
function vimeoVideo( source, config, layer, events ) {
	const iframe = document.createElement( 'iframe' );
	const params = new URLSearchParams( {
		background: '1',
		autoplay: '1',
		muted: '1',
		loop: config.loop ? '1' : '0',
		autopause: '0',
		// No Vimeo tracking cookies.
		dnt: '1',
	} );

	if ( source.hash ) {
		params.set( 'h', source.hash );
	}

	iframe.className = 'tmb-video-bg__iframe';
	iframe.src = `${ VIMEO }/video/${ source.id }?${ params }`;
	iframe.title = 'Background video';
	iframe.setAttribute( 'tabindex', '-1' );
	iframe.setAttribute( 'allow', 'autoplay' );
	iframe.setAttribute( 'referrerpolicy', 'strict-origin-when-cross-origin' );

	const [ width, height ] = source.ratio.split( ':' ).map( Number );
	const cover = () => {
		const box = layer.getBoundingClientRect();
		const scale = Math.max( box.width / width, box.height / height );

		iframe.style.width = `${ Math.ceil( width * scale ) + 2 }px`;
		iframe.style.height = `${ Math.ceil( height * scale ) + 2 }px`;
	};

	cover();

	if ( 'ResizeObserver' in window ) {
		new window.ResizeObserver( cover ).observe( layer );
	}

	let endedOnce = false;

	const send = ( method, value ) =>
		iframe.contentWindow?.postMessage(
			JSON.stringify(
				value === undefined ? { method } : { method, value }
			),
			VIMEO
		);

	window.addEventListener( 'message', ( event ) => {
		if ( VIMEO !== event.origin || event.source !== iframe.contentWindow ) {
			return;
		}

		let data;

		try {
			data =
				'string' === typeof event.data
					? JSON.parse( event.data )
					: event.data;
		} catch {
			return;
		}

		if ( 'ready' === data?.event ) {
			send( 'addEventListener', 'play' );
			send( 'addEventListener', 'ended' );
			send( 'addEventListener', 'error' );

			// Background mode may loop regardless: stop at the end ourselves.
			if ( ! config.loop ) {
				send( 'addEventListener', 'timeupdate' );
			}

			// Autoplay may have started before we were listening for "play".
			send( 'getPaused' );

			if ( 1 !== config.speed ) {
				send( 'setPlaybackRate', config.speed );
			}

			// Commands sent before now were lost: play or pause as wanted.
			events.ready();
		} else if (
			'play' === data?.event ||
			'playing' === data?.event ||
			( 'getPaused' === data?.method && false === data?.value )
		) {
			events.playing();
		} else if ( 'ended' === data?.event ) {
			events.ended();
		} else if (
			'timeupdate' === data?.event &&
			data?.data?.percent >= 0.985 &&
			! endedOnce
		) {
			endedOnce = true;
			send( 'pause' );
			events.ended();
		} else if ( 'error' === data?.event ) {
			events.failed();
		}
	} );

	const poster = layer.querySelector( '.tmb-video-bg__poster' );
	layer.insertBefore(
		iframe,
		poster ? poster.nextSibling : layer.firstChild
	);

	return {
		play: () => send( 'play' ),
		pause: () => send( 'pause' ),
		restart() {
			endedOnce = false;
			send( 'setCurrentTime', 0 );
			send( 'play' );
		},
	};
}

function setup( container ) {
	if ( container.tmbVideo ) {
		return;
	}

	let config;

	try {
		config = JSON.parse( container.getAttribute( 'data-tmb-video' ) );
	} catch {
		return;
	}

	const layer = container.querySelector( ':scope > [data-tmb-video-layer]' );

	if ( ! layer || ! config || 'object' !== typeof config ) {
		return;
	}

	const phone = window.matchMedia( PHONE ).matches;

	// Poster only on phones: no video, nothing to pause.
	if ( phone && 'poster' === config.phones ) {
		return;
	}

	const source = cleanSource(
		phone && config.mobile ? config.mobile : config.src
	);

	if ( ! source ) {
		return;
	}

	config.loop = false !== config.loop;
	config.speed = [ 0.5, 0.75, 1, 1.25 ].includes( config.speed )
		? config.speed
		: 1;

	// This container's own button: the default one, or a GB button marked as it.
	const button =
		container.querySelector( ':scope > .tmb-video-bg__button' ) ||
		[ ...container.querySelectorAll( '[data-video-part="button"]' ) ].find(
			( element ) => element.closest( '.tmb-has-video' ) === container
		);

	const hasText =
		!! button &&
		! button.classList.contains( 'tmb-video-bg__button' ) &&
		'' !== button.textContent.trim();

	let wanted = ! ( reducedMotion() || savingData() || remembered.get() );
	let visible = false;
	let ended = false;
	let player = null;
	let broken = false;

	const playing = () => wanted && ! ended;

	const label = () => {
		if ( ! button ) {
			return;
		}

		button.setAttribute( 'data-state', playing() ? 'playing' : 'paused' );

		// A button with its own text keeps it as its name (what voice control
		// users say), and says whether it's pressed (paused) instead.
		if ( hasText ) {
			button.setAttribute( 'aria-pressed', playing() ? 'false' : 'true' );
			return;
		}

		button.setAttribute(
			'aria-label',
			button.getAttribute(
				playing() ? 'data-label-pause' : 'data-label-play'
			) ||
				( playing()
					? 'Pause background video'
					: 'Play background video' )
		);
	};

	const sync = () => {
		label();

		if ( ! pageLoaded ) {
			waiting.add( sync );
			return;
		}

		const run = playing() && visible && ! document.hidden && ! broken;

		if ( ! player ) {
			if ( run ) {
				player = ( 'vimeo' === source.type ? vimeoVideo : fileVideo )(
					source,
					config,
					layer,
					events
				);
				player.play();
			}

			return;
		}

		if ( run ) {
			player.play();
		} else {
			player.pause();
		}
	};

	const events = {
		ready: () => sync(),
		playing() {
			layer.classList.add( 'is-playing' );
		},
		ended() {
			if ( config.loop ) {
				return;
			}

			ended = true;

			if ( 'poster' === config.end ) {
				layer.classList.remove( 'is-playing' );
			}

			label();
		},
		// The browser wouldn't autoplay (e.g. iOS Low Power Mode): offer Play.
		blocked() {
			wanted = false;
			label();
		},
		// Couldn't load: keep the poster, and there's nothing to pause.
		failed() {
			broken = true;
			layer.classList.remove( 'is-playing' );
			layer
				.querySelector( '.tmb-video-bg__video, .tmb-video-bg__iframe' )
				?.remove();
			player = null;

			if ( button ) {
				button.hidden = true;
				button.style.display = 'none';
			}

			wanted = false;
		},
	};

	if ( button ) {
		button.hidden = false;
		button.style.removeProperty( 'display' );

		button.addEventListener( 'click', ( event ) => {
			event.preventDefault();

			if ( ended ) {
				ended = false;
				wanted = true;
				label();
				player?.restart();
				return;
			}

			wanted = ! wanted;
			remembered.set( ! wanted );
			sync();

			// Every background video on the page follows.
			document.dispatchEvent(
				new window.CustomEvent( EVENT, {
					detail: { paused: ! wanted, from: container },
				} )
			);
		} );

		if ( 'BUTTON' !== button.tagName ) {
			button.addEventListener( 'keydown', ( event ) => {
				if ( 'Enter' === event.key || ' ' === event.key ) {
					event.preventDefault();

					if ( ! event.repeat ) {
						button.click();
					}
				}
			} );
		}
	}

	document.addEventListener( EVENT, ( event ) => {
		if ( event.detail.from === container ) {
			return;
		}

		wanted = ! event.detail.paused && ! reducedMotion() && ! savingData();
		sync();
	} );

	document.addEventListener( 'visibilitychange', sync );

	// Reduced motion switched on while the page is open: stop.
	window
		.matchMedia( '(prefers-reduced-motion: reduce)' )
		.addEventListener?.( 'change', ( event ) => {
			if ( event.matches ) {
				wanted = false;
				sync();
			}
		} );

	if ( 'IntersectionObserver' in window ) {
		new window.IntersectionObserver(
			( entries ) => {
				visible = entries[ entries.length - 1 ].isIntersecting;
				sync();
			},
			{ rootMargin: '200px 0px' }
		).observe( container );
	} else {
		visible = true;
	}

	container.tmbVideo = {
		play() {
			wanted = true;
			sync();
		},
		pause() {
			wanted = false;
			sync();
		},
	};

	sync();
}

document.querySelectorAll( '.tmb-has-video[data-tmb-video]' ).forEach( setup );

window.tmbVideo = {
	init: ( root = document ) =>
		root
			.querySelectorAll( '.tmb-has-video[data-tmb-video]' )
			.forEach( setup ),
};
