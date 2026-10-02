/**
 * What "fast", "normal" and "slow" mean in milliseconds. The defaults live
 * with each feature; Settings → Thingamablocks can change them site-wide,
 * handed over as window.tmbSpeeds (includes/speeds.php) only when changed.
 */

// Own keys only: speed names come from data attributes.
const own = ( map, key ) =>
	!! map && Object.prototype.hasOwnProperty.call( map, key );

/**
 * A speed in milliseconds.
 *
 * @param {string} scale    "dropdown" or "animations".
 * @param {string} speed    fast, normal or slow (from a data attribute, so checked).
 * @param {Object} defaults The feature's defaults, by speed.
 * @return {number} Milliseconds.
 */
export function duration( scale, speed, defaults ) {
	const name = own( defaults, speed ) ? speed : 'normal';
	const site = window.tmbSpeeds?.[ scale ];
	const value = own( site, name ) ? Number( site[ name ] ) : NaN;

	return Number.isFinite( value ) && value >= 0 && value <= 3000
		? value
		: defaults[ name ];
}
