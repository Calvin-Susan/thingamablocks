/**
 * What "fast", "normal" and "slow" mean in milliseconds. The defaults live
 * with each feature; Settings → Thingamablocks can change them site-wide,
 * handed over as window.tmbSpeeds (includes/speeds.php) only when changed.
 */
import { __, sprintf } from '@wordpress/i18n';

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

/**
 * "Fast 150 ms · Normal 250 ms · Slow 400 ms", for the Speed control's help.
 *
 * @param {string} scale    "dropdown" or "animations".
 * @param {Object} defaults The feature's defaults, by speed.
 * @return {string} Help text.
 */
export function speedsHelp( scale, defaults ) {
	return sprintf(
		/* translators: 1: fast, 2: normal, 3: slow, in milliseconds. */
		__(
			'Fast %1$d ms · Normal %2$d ms · Slow %3$d ms. Change them for the whole site in Settings → Thingamablocks.',
			'thingamablocks'
		),
		duration( scale, 'fast', defaults ),
		duration( scale, 'normal', defaults ),
		duration( scale, 'slow', defaults )
	);
}
