/**
 * The drawer's reveal animations, shared by the front end and the editor's
 * preview. Web Animations rather than CSS keyframes, so "remove unused CSS"
 * optimisers can't break them.
 */

import { duration } from '../shared/speeds';

// Defaults; Settings → Thingamablocks → Speeds can change them.
export const DURATIONS = { fast: 150, normal: 250, slow: 400 };

const EASING = 'cubic-bezier(0.2, 0, 0, 1)';

/**
 * Keyframes for revealing the drawer. "top" means the drawer opens above the
 * button (flipped), so movement and unfolding run the other way.
 *
 * @param {string} type      none, fade, slide, grow or unfold.
 * @param {string} placement bottom or top.
 * @return {Array|null} Keyframes, or null for no animation.
 */
export function revealKeyframes( type, placement = 'bottom' ) {
	const up = 'top' === placement;

	switch ( type ) {
		case 'fade':
			return [ { opacity: 0 }, { opacity: 1 } ];
		case 'slide':
			return [
				{
					opacity: 0,
					transform: `translateY(${ up ? '' : '-' }0.5rem)`,
				},
				{ opacity: 1, transform: 'none' },
			];
		case 'grow':
			return [
				{
					opacity: 0,
					transform: 'scale(0.95)',
					transformOrigin: up ? 'bottom' : 'top',
				},
				{
					opacity: 1,
					transform: 'none',
					transformOrigin: up ? 'bottom' : 'top',
				},
			];
		case 'unfold':
			return [
				{ clipPath: up ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)' },
				{ clipPath: 'inset(0 0 0 0)' },
			];
		default:
			return null;
	}
}

/**
 * Play the reveal (or, reversed, the hide) on an element.
 *
 * @param {Element} element           Drawer.
 * @param {Object}  options           Options.
 * @param {string}  options.type      Animation type.
 * @param {string}  options.speed     fast, normal or slow.
 * @param {string}  options.placement bottom or top.
 * @param {boolean} options.reverse   Play backwards (closing).
 * @return {Animation|null} The animation.
 */
export function reveal( element, { type, speed, placement, reverse = false } ) {
	const keyframes = revealKeyframes( type, placement );

	if ( ! keyframes || ! element.animate ) {
		return null;
	}

	return element.animate( reverse ? [ ...keyframes ].reverse() : keyframes, {
		duration: duration( 'dropdown', speed, DURATIONS ),
		easing: EASING,
	} );
}
