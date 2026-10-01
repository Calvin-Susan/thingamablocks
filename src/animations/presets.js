/**
 * Entrance animation presets, shared by the front end and the editor preview.
 *
 * Each is the "from" state only: the browser animates from it to the block's
 * own styles. They use opacity and the individual translate/scale properties,
 * not transform, so a block's own GenerateBlocks transform (a rotate, a hover
 * lift) is left alone.
 */

export const ANIMATIONS = {
	fade: { opacity: 0 },
	'fade-up': { opacity: 0, translate: '0 1.5rem' },
	'fade-down': { opacity: 0, translate: '0 -1.5rem' },
	'fade-left': { opacity: 0, translate: '-2rem 0' },
	'fade-right': { opacity: 0, translate: '2rem 0' },
	zoom: { opacity: 0, scale: '0.92' },
};

export const SPEEDS = {
	fast: 400,
	normal: 700,
	slow: 1100,
};

// Quick start, gentle finish.
export const EASING = 'cubic-bezier(0.2, 0.65, 0.3, 1)';

/**
 * Animate an element in.
 *
 * @param {Element} element Element.
 * @param {string}  type    Preset name.
 * @param {number}  delay   Delay in ms.
 * @param {string}  speed   Speed name.
 * @return {Animation|null} The animation.
 */
export function animateIn( element, type, delay = 0, speed = 'normal' ) {
	// Own keys only: the names come from data attributes, so "constructor" etc. mustn't match.
	const has = ( map, key ) =>
		Object.prototype.hasOwnProperty.call( map, key );
	const from = has( ANIMATIONS, type ) ? ANIMATIONS[ type ] : null;

	if ( ! from || ! element.animate ) {
		return null;
	}

	// One keyframe at offset 0: the browser animates from it to the element's
	// own styles. (Without the offset a lone keyframe counts as the *end*.)
	// fill "backwards" keeps it hidden during the delay.
	return element.animate( [ { ...from, offset: 0 } ], {
		duration: has( SPEEDS, speed ) ? SPEEDS[ speed ] : SPEEDS.normal,
		delay,
		easing: EASING,
		fill: 'backwards',
	} );
}
