/**
 * Front-end behaviour for the Toggle block.
 *
 * Each toggle is a `.ogal-toggle` wrapper with a JSON config in
 * `data-ogal-toggle`. Its parts are ordinary GenerateBlocks blocks marked with
 * `data-toggle-part`:
 *   - "switch": flips the state (role="switch", aria-checked)
 *   - "off" / "on": sets that state (data-active always; aria-pressed when the
 *     part is a button, or when it is the toggle's only kind of control)
 *
 * State changes fire `ogal-toggle:change` on the wrapper (it bubbles), so
 * custom code can react: `document.addEventListener( 'ogal-toggle:change', … )`.
 */

const STORAGE_PREFIX = 'ogal-toggle:';
const HIDDEN_CLASS = 'ogal-toggle-hidden';
const PART = 'data-toggle-part';
const toggles = [];

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

/**
 * A bare word is an element ID ("monthly"), unless no element has that ID and
 * it's a tag name like "body" or "html". Anything else is a CSS selector.
 *
 * @param {string} value ID or selector.
 * @return {Element[]} Matching elements.
 */
function resolve( value ) {
	if ( /^[A-Za-z][\w-]*$/.test( value ) ) {
		const byId = document.getElementById( value );

		if ( byId ) {
			return [ byId ];
		}
	}

	try {
		return [ ...document.querySelectorAll( value ) ];
	} catch ( e ) {
		// An invalid selector typed in the editor shouldn't break the other targets.
		return [];
	}
}

function queryAll( values = [] ) {
	const elements = new Set();

	values.forEach( ( value ) =>
		resolve( value ).forEach( ( element ) => elements.add( element ) )
	);

	return [ ...elements ];
}

function prefersReducedMotion() {
	return window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
}

/*
 * Hiding uses an inline display:none !important as well as a class. The class
 * is a styling hook; the inline style keeps working when a "remove unused CSS"
 * optimisation strips rules for classes that only appear after JS runs.
 */
function hideElement( element ) {
	element.classList.add( HIDDEN_CLASS );
	element.style.setProperty( 'display', 'none', 'important' );
}

function showElement( element, animation, initial ) {
	const wasHidden = element.classList.contains( HIDDEN_CLASS );

	element.classList.remove( HIDDEN_CLASS );

	if ( 'none' === element.style.getPropertyValue( 'display' ) ) {
		element.style.removeProperty( 'display' );
	}

	if ( ! wasHidden || initial || 'none' === animation || prefersReducedMotion() ) {
		return;
	}

	const enterClass = `ogal-toggle-enter-${ animation }`;
	const keyframes =
		'slide' === animation
			? [
					{ opacity: 0, transform: 'translateY(0.75rem)' },
					{ opacity: 1, transform: 'none' },
			  ]
			: [ { opacity: 0 }, { opacity: 1 } ];

	element.classList.add( enterClass );
	// Web Animations rather than CSS keyframes, for the same "unused CSS" reason.
	const running = element.animate( keyframes, {
		duration: 'slide' === animation ? 350 : 300,
		easing: 'ease',
	} );
	running.onfinish = running.oncancel = () =>
		element.classList.remove( enterClass );
}

const actions = {
	showHide( config, isOn, initial ) {
		const show = queryAll( isOn ? config.showWhenOn : config.showWhenOff );
		const hide = queryAll(
			isOn ? config.showWhenOff : config.showWhenOn
		).filter( ( element ) => ! show.includes( element ) );

		hide.forEach( hideElement );
		show.forEach( ( element ) =>
			showElement( element, config.animation, initial )
		);
	},

	colorScheme( config, isOn ) {
		const root = document.documentElement;
		const scheme = isOn ? 'dark' : 'light';

		root.setAttribute( 'data-color-scheme', scheme );
		root.style.colorScheme = scheme;

		( config.htmlClass || '' )
			.split( ' ' )
			.filter( Boolean )
			.forEach( ( name ) => root.classList.toggle( name, isOn ) );
	},

	toggleClass( config, isOn ) {
		const names = ( config.classNames || '' ).split( ' ' ).filter( Boolean );
		const add = 'removeWhenOn' === config.classMode ? ! isOn : isOn;

		queryAll( config.classTargets ).forEach( ( element ) =>
			names.forEach( ( name ) => element.classList.toggle( name, add ) )
		);
	},

	none() {},
};

/**
 * Update one toggle's own markup to match its state.
 *
 * @param {Object}  toggle Toggle record.
 * @param {boolean} isOn   New state.
 */
function paint( toggle, isOn ) {
	const { element } = toggle;

	toggle.isOn = isOn;
	element.classList.toggle( 'is-on', isOn );
	element.classList.toggle( 'is-off', ! isOn );

	toggle.parts( 'switch' ).forEach( ( part ) =>
		part.setAttribute( 'aria-checked', isOn ? 'true' : 'false' )
	);

	[ 'on', 'off' ].forEach( ( side ) => {
		const active = ( 'on' === side ) === isOn;

		toggle.parts( side ).forEach( ( part ) => {
			part.setAttribute( 'data-active', active ? 'true' : 'false' );

			if ( part.hasAttribute( 'aria-pressed' ) ) {
				part.setAttribute( 'aria-pressed', active ? 'true' : 'false' );
			}
		} );
	} );
}

function groupMembers( toggle ) {
	const { group } = toggle.config;

	return group
		? toggles.filter( ( other ) => other.config.group === group )
		: [ toggle ];
}

/**
 * Set a toggle's state, apply its action, and keep grouped toggles in sync.
 * Every member of a group runs its own action, so two toggles in one group can
 * each control their own section of the page.
 *
 * @param {Object}  toggle Toggle record.
 * @param {boolean} isOn   New state.
 * @param {Object}  opts   Options.
 */
function setState( toggle, isOn, { initial = false, user = false } = {} ) {
	if ( ! initial && toggle.isOn === isOn ) {
		return;
	}

	const members = groupMembers( toggle );
	const ran = new Set();

	members.forEach( ( member ) => {
		paint( member, isOn );

		// Identical configs (the same toggle placed twice) only need to run once.
		const signature = JSON.stringify( member.config );

		if ( ! ran.has( signature ) ) {
			ran.add( signature );
			( actions[ member.config.action ] || actions.none )(
				member.config,
				isOn,
				initial
			);
		}
	} );

	if ( user && members.some( ( member ) => member.config.persist ) ) {
		writeStorage( toggle.storageKey, isOn ? 'on' : 'off' );
	}

	toggle.element.dispatchEvent(
		new CustomEvent( 'ogal-toggle:change', {
			bubbles: true,
			detail: {
				state: isOn ? 'on' : 'off',
				isOn,
				group: toggle.config.group,
				action: toggle.config.action,
				initial,
				toggle: toggle.element,
			},
		} )
	);
}

function initialState( toggle ) {
	const members = groupMembers( toggle );

	// A saved choice from any member of the group wins.
	for ( const member of members ) {
		if ( member.config.persist ) {
			const saved = readStorage( member.storageKey );

			if ( 'on' === saved || 'off' === saved ) {
				return 'on' === saved;
			}
		}
	}

	const { config } = toggle;

	if ( 'colorScheme' === config.action ) {
		// The <head> script may already have applied the system preference.
		const applied = document.documentElement.getAttribute( 'data-color-scheme' );

		if ( 'dark' === applied || 'light' === applied ) {
			return 'dark' === applied;
		}

		if ( config.followSystem ) {
			return window.matchMedia( '(prefers-color-scheme: dark)' ).matches;
		}
	}

	return 'on' === config.defaultState;
}

/**
 * Give the switch an accessible name when none was set: use the "on" label's
 * text, e.g. "Annual".
 *
 * @param {Object} toggle Toggle record.
 */
function ensureAccessibleName( toggle ) {
	toggle.parts( 'switch' ).forEach( ( part ) => {
		if (
			part.hasAttribute( 'aria-label' ) ||
			part.hasAttribute( 'aria-labelledby' ) ||
			part.textContent.trim()
		) {
			return;
		}

		const onLabel = toggle.parts( 'on' )[ 0 ];

		if ( onLabel && onLabel.textContent.trim() ) {
			if ( ! onLabel.id ) {
				onLabel.id = `${ toggle.id }-on-label`;
			}

			part.setAttribute( 'aria-labelledby', onLabel.id );
		}
	} );
}

/**
 * The part an event belongs to, if it belongs to this toggle (not a toggle
 * nested inside it).
 *
 * @param {Event}   event   DOM event.
 * @param {Element} element Toggle wrapper.
 * @return {Element|null} Part.
 */
function ownPart( event, element ) {
	const part = event.target.closest( `[${ PART }]` );

	return part && part.closest( '.ogal-toggle' ) === element ? part : null;
}

function activate( toggle, part ) {
	const type = part.getAttribute( PART );

	if ( 'switch' === type ) {
		setState( toggle, ! toggle.isOn, { user: true } );
		return true;
	}

	if ( 'on' === type || 'off' === type ) {
		setState( toggle, 'on' === type, { user: true } );
		return true;
	}

	return false;
}

function setup( element ) {
	if ( element.ogalToggle ) {
		return null;
	}

	let config;

	try {
		config = JSON.parse( element.dataset.ogalToggle || '{}' );
	} catch ( e ) {
		return null;
	}

	const position = [
		...document.querySelectorAll( '.ogal-toggle[data-ogal-toggle]' ),
	].indexOf( element );
	const id = element.id || `ogal-toggle-${ position + 1 }`;

	const toggle = {
		element,
		config,
		id,
		// A group or an HTML anchor gives a stable key; otherwise fall back to the
		// page path and position, so toggles on different pages don't collide.
		storageKey:
			config.group ||
			element.id ||
			`${ window.location.pathname }#${ position }`,
		isOn: undefined,
		// Only this toggle's own parts, not those of a toggle nested inside it.
		parts: ( type ) =>
			[ ...element.querySelectorAll( `[${ PART }="${ type }"]` ) ].filter(
				( part ) => part.closest( '.ogal-toggle' ) === element
			),
	};

	element.ogalToggle = toggle;
	toggles.push( toggle );

	element.addEventListener( 'click', ( event ) => {
		const part = ownPart( event, element );

		if ( part && activate( toggle, part ) && 'A' === part.tagName ) {
			// A part built as a link shouldn't navigate.
			event.preventDefault();
		}
	} );

	element.addEventListener( 'keydown', ( event ) => {
		const part = ownPart( event, element );

		// Native buttons already turn Space and Enter into clicks.
		if ( ! part || 'BUTTON' === part.tagName || event.repeat ) {
			return;
		}

		// Only parts the server made keyboard-focusable take key presses.
		if ( ! part.hasAttribute( 'tabindex' ) ) {
			return;
		}

		if ( ' ' === event.key || 'Enter' === event.key ) {
			event.preventDefault();
			activate( toggle, part );
		}
	} );

	ensureAccessibleName( toggle );

	return toggle;
}

/**
 * Set up every toggle inside `root` that isn't set up yet. Runs on page load;
 * call it again after adding toggles with AJAX: `window.ogalToggle.init()`.
 *
 * @param {ParentNode} root Where to look.
 */
function init( root = document ) {
	const added = [ ...root.querySelectorAll( '.ogal-toggle[data-ogal-toggle]' ) ]
		.map( setup )
		.filter( Boolean );

	added.forEach( ( toggle ) => {
		if ( 'boolean' === typeof toggle.isOn ) {
			return;
		}

		// A toggle joining a group that is already running follows the group.
		const leader = groupMembers( toggle ).find(
			( other ) => other !== toggle && 'boolean' === typeof other.isOn
		);

		if ( leader ) {
			paint( toggle, leader.isOn );
			( actions[ toggle.config.action ] || actions.none )(
				toggle.config,
				leader.isOn,
				true
			);
			return;
		}

		setState( toggle, initialState( toggle ), { initial: true } );
	} );

	// The script has taken over visibility; drop the no-flash rules.
	document
		.querySelectorAll( 'style.ogal-toggle-initial' )
		.forEach( ( style ) => style.remove() );
}

function find( key ) {
	return toggles.find(
		( item ) => item.id === key || item.config.group === key
	);
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', () => init() );
} else {
	init();
}

// Follow the operating system's dark mode while the visitor hasn't chosen.
window
	.matchMedia( '(prefers-color-scheme: dark)' )
	.addEventListener( 'change', ( event ) => {
		const toggle = toggles.find(
			( item ) =>
				'colorScheme' === item.config.action && item.config.followSystem
		);

		if ( toggle && null === readStorage( toggle.storageKey ) ) {
			setState( toggle, event.matches );
		}
	} );

// Small public API, e.g. window.ogalToggle.set( 'billing', true ).
window.ogalToggle = {
	init,
	get: ( key ) => find( key )?.isOn,
	set: ( key, isOn ) => {
		const toggle = find( key );

		if ( toggle ) {
			setState( toggle, !! isOn, { user: true } );
		}
	},
};
