/**
 * Front-end behaviour for the Toggle block.
 *
 * Each toggle is a `.ogal-toggle` wrapper with a JSON config in
 * `data-ogal-toggle`. Its parts are ordinary GenerateBlocks blocks marked with
 * `data-toggle`:
 *   - "switch": flips the state (role="switch", aria-checked)
 *   - "off" / "on": sets that state (aria-pressed on buttons, data-active always)
 *
 * State changes fire `ogal-toggle:change` on the wrapper (it bubbles), so
 * custom code can react: `document.addEventListener( 'ogal-toggle:change', … )`.
 */

const STORAGE_PREFIX = 'ogal-toggle:';
const HIDDEN_CLASS = 'ogal-toggle-hidden';
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
 * A bare word is an element ID; anything else is used as a CSS selector.
 *
 * @param {string} value ID or selector.
 * @return {string} CSS selector.
 */
function toSelector( value ) {
	return /^[A-Za-z][\w-]*$/.test( value ) ? `#${ value }` : value;
}

function queryAll( values = [] ) {
	const elements = new Set();

	values.forEach( ( value ) => {
		try {
			document
				.querySelectorAll( toSelector( value ) )
				.forEach( ( element ) => elements.add( element ) );
		} catch ( e ) {
			// An invalid selector typed in the editor shouldn't break the other targets.
		}
	} );

	return [ ...elements ];
}

function storageKey( toggle ) {
	return toggle.config.group || toggle.id;
}

function prefersReducedMotion() {
	return window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
}

function showElement( element, animation ) {
	if ( ! element.classList.contains( HIDDEN_CLASS ) ) {
		return;
	}

	element.classList.remove( HIDDEN_CLASS );

	if ( 'none' === animation || prefersReducedMotion() ) {
		return;
	}

	const enterClass = `ogal-toggle-enter-${ animation }`;
	element.classList.remove( enterClass );
	// Restart the animation if the element is shown again mid-animation.
	void element.offsetWidth;
	element.classList.add( enterClass );
	element.addEventListener(
		'animationend',
		() => element.classList.remove( enterClass ),
		{ once: true }
	);
}

function hideElement( element ) {
	element.classList.add( HIDDEN_CLASS );
}

const actions = {
	showHide( config, isOn ) {
		const show = queryAll( isOn ? config.showWhenOn : config.showWhenOff );
		const hide = queryAll(
			isOn ? config.showWhenOff : config.showWhenOn
		).filter( ( element ) => ! show.includes( element ) );

		hide.forEach( hideElement );
		show.forEach( ( element ) => showElement( element, config.animation ) );
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

			if ( 'BUTTON' === part.tagName ) {
				part.setAttribute( 'aria-pressed', active ? 'true' : 'false' );
			}
		} );
	} );
}

/**
 * Set a toggle's state, apply its action, and keep grouped toggles in sync.
 *
 * @param {Object}  toggle Toggle record.
 * @param {boolean} isOn   New state.
 * @param {Object}  opts   Options.
 */
function setState( toggle, isOn, { initial = false, user = false } = {} ) {
	if ( ! initial && toggle.isOn === isOn ) {
		return;
	}

	const { config } = toggle;
	const group = config.group;
	const members = group
		? toggles.filter( ( other ) => other.config.group === group )
		: [ toggle ];

	members.forEach( ( member ) => paint( member, isOn ) );

	const run = actions[ config.action ] || actions.none;
	run( config, isOn );

	if ( user && config.persist ) {
		writeStorage( storageKey( toggle ), isOn ? 'on' : 'off' );
	}

	toggle.element.dispatchEvent(
		new CustomEvent( 'ogal-toggle:change', {
			bubbles: true,
			detail: {
				state: isOn ? 'on' : 'off',
				isOn,
				group,
				action: config.action,
				initial,
				toggle: toggle.element,
			},
		} )
	);
}

function initialState( toggle ) {
	const { config } = toggle;

	if ( config.persist ) {
		const saved = readStorage( storageKey( toggle ) );

		if ( 'on' === saved || 'off' === saved ) {
			return 'on' === saved;
		}
	}

	if ( 'colorScheme' === config.action && config.followSystem ) {
		return window.matchMedia( '(prefers-color-scheme: dark)' ).matches;
	}

	// A toggle joining a group that is already set up follows the group.
	if ( config.group ) {
		const leader = toggles.find(
			( other ) =>
				other !== toggle &&
				other.config.group === config.group &&
				'boolean' === typeof other.isOn
		);

		if ( leader ) {
			return leader.isOn;
		}
	}

	return 'on' === config.defaultState;
}

/**
 * Give the switch an accessible name when none was set: use the "on" label's
 * text, e.g. "Annual", or fall back to the page's visible label next to it.
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

function setup( element, index ) {
	let config;

	try {
		config = JSON.parse( element.dataset.ogalToggle || '{}' );
	} catch ( e ) {
		return;
	}

	const toggle = {
		element,
		config,
		id: element.id || `ogal-toggle-${ index + 1 }`,
		isOn: undefined,
		// Only this toggle's own parts, not those of a toggle nested inside it.
		parts: ( type ) =>
			[ ...element.querySelectorAll( `[data-toggle="${ type }"]` ) ].filter(
				( part ) => part.closest( '.ogal-toggle' ) === element
			),
	};

	toggles.push( toggle );

	element.addEventListener( 'click', ( event ) => {
		const part = event.target.closest( '[data-toggle]' );

		if ( ! part || part.closest( '.ogal-toggle' ) !== element ) {
			return;
		}

		const type = part.getAttribute( 'data-toggle' );

		if ( 'switch' === type ) {
			setState( toggle, ! toggle.isOn, { user: true } );
		} else if ( 'on' === type || 'off' === type ) {
			setState( toggle, 'on' === type, { user: true } );
		} else {
			return;
		}

		// A part built as a link shouldn't navigate.
		if ( 'A' === part.tagName ) {
			event.preventDefault();
		}
	} );

	element.addEventListener( 'keydown', ( event ) => {
		const part = event.target.closest( '[data-toggle="switch"]' );

		// Native buttons already handle Space and Enter.
		if ( ! part || 'BUTTON' === part.tagName ) {
			return;
		}

		if ( ' ' === event.key || 'Enter' === event.key ) {
			event.preventDefault();
			setState( toggle, ! toggle.isOn, { user: true } );
		}
	} );

	ensureAccessibleName( toggle );
}

function init() {
	document
		.querySelectorAll( '.ogal-toggle[data-ogal-toggle]' )
		.forEach( setup );

	toggles.forEach( ( toggle ) => {
		if ( 'boolean' !== typeof toggle.isOn ) {
			setState( toggle, initialState( toggle ), { initial: true } );
		}
	} );

	// The script has taken over visibility; drop the no-flash rules.
	document
		.querySelectorAll( 'style.ogal-toggle-initial' )
		.forEach( ( style ) => style.remove() );

	// Follow the operating system's dark mode while the visitor hasn't chosen.
	window
		.matchMedia( '(prefers-color-scheme: dark)' )
		.addEventListener( 'change', ( event ) => {
			const toggle = toggles.find(
				( item ) =>
					'colorScheme' === item.config.action &&
					item.config.followSystem
			);

			if ( toggle && null === readStorage( storageKey( toggle ) ) ) {
				setState( toggle, event.matches );
			}
		} );

	// Small public API: window.ogalToggle.set( 'pricing', true ).
	window.ogalToggle = {
		get: ( key ) => {
			const toggle = toggles.find(
				( item ) => item.id === key || item.config.group === key
			);
			return toggle ? toggle.isOn : undefined;
		},
		set: ( key, isOn ) => {
			const toggle = toggles.find(
				( item ) => item.id === key || item.config.group === key
			);

			if ( toggle ) {
				setState( toggle, !! isOn, { user: true } );
			}
		},
	};
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
