/**
 * Time maths for the Countdown, shared by the front end and the editor.
 *
 * Dates are set in the site's time zone (Settings → General), not the
 * visitor's, so "ends Friday at 5 pm" means 5 pm where the business is.
 */

export const UNITS = [
	[ 'days', 86400 ],
	[ 'hours', 3600 ],
	[ 'minutes', 60 ],
	[ 'seconds', 1 ],
];

/**
 * Offset (ms) of a time zone from UTC at a given moment. Handles IANA names
 * ("America/New_York", with daylight saving) and fixed offsets ("+02:00"),
 * which WordPress uses when the site is set to "UTC+2" rather than a city.
 *
 * @param {number} utcMs    Moment, in ms since the epoch.
 * @param {string} timeZone Time zone.
 * @return {number} Offset in ms (positive east of UTC).
 */
export function zoneOffset( utcMs, timeZone ) {
	const fixed = /^([+-])(\d{1,2}):?(\d{2})$/.exec( timeZone || '' );

	if ( fixed ) {
		const minutes = Number( fixed[ 2 ] ) * 60 + Number( fixed[ 3 ] );
		return ( '-' === fixed[ 1 ] ? -1 : 1 ) * minutes * 60000;
	}

	if ( ! timeZone || 'UTC' === timeZone ) {
		return 0;
	}

	try {
		const parts = {};

		new Intl.DateTimeFormat( 'en-US', {
			timeZone,
			hourCycle: 'h23',
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
		} )
			.formatToParts( new Date( utcMs ) )
			.forEach( ( { type, value } ) => ( parts[ type ] = Number( value ) ) );

		const asUtc = Date.UTC(
			parts.year,
			parts.month - 1,
			parts.day,
			parts.hour,
			parts.minute,
			parts.second
		);

		return asUtc - Math.floor( utcMs / 1000 ) * 1000;
	} catch ( e ) {
		return 0;
	}
}

/**
 * The UTC moment for a wall-clock time in a time zone.
 *
 * @param {number} year     Year.
 * @param {number} month    Month, 0-11.
 * @param {number} day      Day of the month.
 * @param {number} hour     Hour, 0-23.
 * @param {number} minute   Minute.
 * @param {string} timeZone Time zone.
 * @return {number} ms since the epoch.
 */
export function zonedToUtc( year, month, day, hour, minute, timeZone ) {
	const guess = Date.UTC( year, month, day, hour, minute );
	const offset = zoneOffset( guess, timeZone );
	let utc = guess - offset;

	// Near a daylight-saving change the offset at the answer can differ.
	const corrected = zoneOffset( utc, timeZone );

	if ( corrected !== offset ) {
		utc = guess - corrected;
	}

	return utc;
}

/**
 * The next time a recurring countdown ends, e.g. 17:00 on weekdays.
 *
 * @param {number}   nowMs    Now.
 * @param {string}   time     "HH:MM" in the site's time zone.
 * @param {number[]} days     Weekdays it runs on (0 = Sunday); empty = every day.
 * @param {string}   timeZone Site time zone.
 * @return {number|null} ms since the epoch, or null if no day is allowed.
 */
export function nextRecurring( nowMs, time, days, timeZone ) {
	const match = /^(\d{1,2}):(\d{2})$/.exec( time || '' );

	if ( ! match ) {
		return null;
	}

	const hour = Math.min( 23, Number( match[ 1 ] ) );
	const minute = Math.min( 59, Number( match[ 2 ] ) );
	// Today's date in the site's time zone.
	const local = new Date( nowMs + zoneOffset( nowMs, timeZone ) );

	for ( let add = 0; add <= 7; add++ ) {
		const day = new Date(
			Date.UTC(
				local.getUTCFullYear(),
				local.getUTCMonth(),
				local.getUTCDate() + add
			)
		);

		if ( days && days.length && ! days.includes( day.getUTCDay() ) ) {
			continue;
		}

		const candidate = zonedToUtc(
			day.getUTCFullYear(),
			day.getUTCMonth(),
			day.getUTCDate(),
			hour,
			minute,
			timeZone
		);

		if ( candidate > nowMs ) {
			return candidate;
		}
	}

	return null;
}

/**
 * Split the time left into the units the countdown shows. The largest unit
 * shown absorbs the rest: with no "days" part, 2 days show as 48 hours.
 *
 * @param {number}   ms      Time left.
 * @param {string[]} present Units that have a number part.
 * @return {Object} { days, hours, minutes, seconds } for the present units.
 */
export function splitRemaining( ms, present ) {
	// Round up, so the display reaches 00 at the moment it ends, not a second early.
	let left = Math.max( 0, Math.ceil( ms / 1000 ) );
	const values = {};

	UNITS.forEach( ( [ unit, seconds ] ) => {
		if ( present.includes( unit ) ) {
			values[ unit ] = Math.floor( left / seconds );
			left -= values[ unit ] * seconds;
		}
	} );

	return values;
}
