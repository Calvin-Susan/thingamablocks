/**
 * Editor only: the Speed controls' help text. Kept out of speeds.js so the
 * front-end scripts that use duration() don't pull in wp-i18n.
 */
import { __, sprintf } from '@wordpress/i18n';

import { duration } from './speeds';

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
