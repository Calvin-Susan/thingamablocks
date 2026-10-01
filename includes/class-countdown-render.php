<?php
/**
 * Front-end rendering for the Countdown block.
 *
 * Like the Toggle, the Countdown's visible parts are GenerateBlocks blocks
 * saved as static HTML. On render, the numbers are filled in with the real
 * time left and the timer/ended parts are shown or hidden, so the page is
 * right before any JavaScript runs (and stays sensible without it). The
 * script then keeps it ticking and corrects anything a page cache froze.
 *
 * @package ToggleForGenerateBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Countdown block.
 */
class Ogal_Countdown_Render {
	/**
	 * Units, largest first, with their length in seconds.
	 */
	const UNITS = array(
		'days'    => 86400,
		'hours'   => 3600,
		'minutes' => 60,
		'seconds' => 1,
	);

	/**
	 * Render callback.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Saved inner-block HTML.
	 * @return string
	 */
	public static function render( $attributes, $content ) {
		$config = self::config( $attributes );
		$now    = time();
		$end    = self::end_time( $config, $now );

		// Evergreen deadlines are per visitor, so the server shows the full duration.
		$left  = null === $end ? 0 : $end - $now;
		$ended = 'date' === $config['mode'] && null !== $end && $left <= 0;

		$content = self::decorate_parts( $content, $config, max( 0, $left ), $ended );

		$wrapper = array(
			'class'               => 'ogal-countdown ' . ( $ended ? 'is-ended' : 'is-running' ),
			'role'                => 'timer',
			'data-ogal-countdown' => wp_json_encode( $config ),
		);

		if ( ! empty( $attributes['anchor'] ) ) {
			$wrapper['id'] = $attributes['anchor'];
		}

		if ( $ended && 'hide' === $config['endAction'] ) {
			$wrapper['style'] = 'display:none!important';
		}

		// Elements to reveal when it ends start hidden, and vice versa.
		$initial_hidden = $ended ? $config['hideOnEnd'] : $config['showOnEnd'];

		return sprintf(
			'%1$s<div %2$s>%3$s</div>',
			Ogal_Blocks_Sanitize::hide_style( $initial_hidden, 'ogal-countdown-initial' ),
			get_block_wrapper_attributes( $wrapper ),
			$content
		);
	}

	/**
	 * Clean the attributes into the config the front-end script reads.
	 *
	 * @param array $attributes Block attributes.
	 * @return array
	 */
	public static function config( $attributes ) {
		$mode = $attributes['mode'] ?? 'date';

		if ( ! in_array( $mode, array( 'date', 'evergreen', 'recurring' ), true ) ) {
			$mode = 'date';
		}

		$end_action = $attributes['endAction'] ?? 'message';

		$config = array(
			'mode'           => $mode,
			'pad'            => ! isset( $attributes['padNumbers'] ) || ! empty( $attributes['padNumbers'] ),
			'hideEmptyUnits' => ! empty( $attributes['hideEmptyUnits'] ),
			'endAction'      => in_array( $end_action, array( 'message', 'zeros', 'hide' ), true ) ? $end_action : 'message',
			'showOnEnd'      => Ogal_Blocks_Sanitize::selectors( $attributes['showOnEnd'] ?? array() ),
			'hideOnEnd'      => Ogal_Blocks_Sanitize::selectors( $attributes['hideOnEnd'] ?? array() ),
			'redirectUrl'    => esc_url_raw( $attributes['redirectUrl'] ?? '' ),
		);

		if ( 'date' === $mode ) {
			$end           = self::parse_date( $attributes['endDate'] ?? '' );
			$config['end'] = null === $end ? null : $end * 1000;
		}

		if ( 'evergreen' === $mode ) {
			$config['evergreenMinutes'] = max( 1, min( 525600, (int) ( $attributes['evergreenMinutes'] ?? 1440 ) ) );
			$config['evergreenRestart'] = ! empty( $attributes['evergreenRestart'] );
		}

		if ( 'recurring' === $mode ) {
			$time = $attributes['recurringTime'] ?? '17:00';

			$config['time']     = preg_match( '/^([01]?\d|2[0-3]):[0-5]\d$/D', $time ) ? $time : '17:00';
			$config['days']     = self::clean_days( $attributes['recurringDays'] ?? array() );
			$config['timeZone'] = wp_timezone_string();
		}

		return $config;
	}

	/**
	 * Parse the editor's "Y-m-d\TH:i:s" date, which is in the site's time zone.
	 *
	 * @param string $value Date.
	 * @return int|null Unix timestamp.
	 */
	public static function parse_date( $value ) {
		if ( ! is_string( $value ) || ! preg_match( '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/D', $value ) ) {
			return null;
		}

		$format = strlen( $value ) > 16 ? 'Y-m-d\TH:i:s' : 'Y-m-d\TH:i';
		$date   = DateTimeImmutable::createFromFormat( $format, $value, wp_timezone() );

		return $date ? $date->getTimestamp() : null;
	}

	/**
	 * Weekday numbers 0 (Sunday) to 6.
	 *
	 * @param mixed $days Days.
	 * @return int[]
	 */
	private static function clean_days( $days ) {
		if ( ! is_array( $days ) ) {
			return array();
		}

		$days = array_unique( array_map( 'intval', $days ) );

		return array_values(
			array_filter(
				$days,
				function ( $day ) {
					return $day >= 0 && $day <= 6;
				}
			)
		);
	}

	/**
	 * When the countdown ends, as seen by the server.
	 *
	 * @param array $config Config.
	 * @param int   $now    Unix timestamp.
	 * @return int|null Unix timestamp.
	 */
	private static function end_time( $config, $now ) {
		if ( 'date' === $config['mode'] ) {
			return null === $config['end'] ? null : (int) ( $config['end'] / 1000 );
		}

		if ( 'evergreen' === $config['mode'] ) {
			return $now + $config['evergreenMinutes'] * 60;
		}

		return self::next_recurring( $now, $config['time'], $config['days'] );
	}

	/**
	 * The next time a recurring countdown ends.
	 *
	 * @param int    $now  Unix timestamp.
	 * @param string $time "HH:MM" in the site's time zone.
	 * @param int[]  $days Allowed weekdays; empty = every day.
	 * @return int|null
	 */
	public static function next_recurring( $now, $time, $days ) {
		list( $hour, $minute ) = array_map( 'intval', explode( ':', $time ) );

		$today = ( new DateTimeImmutable( '@' . $now ) )->setTimezone( wp_timezone() )->setTime( 0, 0 );

		for ( $add = 0; $add <= 7; $add++ ) {
			$day = $today->modify( "+{$add} days" );

			if ( $days && ! in_array( (int) $day->format( 'w' ), $days, true ) ) {
				continue;
			}

			$candidate = $day->setTime( $hour, $minute )->getTimestamp();

			if ( $candidate > $now ) {
				return $candidate;
			}
		}

		return null;
	}

	/**
	 * Fill in the numbers and show/hide the timer and ended parts.
	 *
	 * @param string $content Inner HTML.
	 * @param array  $config  Config.
	 * @param int    $left    Seconds left.
	 * @param bool   $ended   Whether it has ended.
	 * @return string
	 */
	private static function decorate_parts( $content, $config, $left, $ended ) {
		if ( '' === trim( $content ) ) {
			return $content;
		}

		// Which units have a number part; the largest one absorbs the rest.
		$present = array();

		foreach ( array_keys( self::UNITS ) as $unit ) {
			if ( false !== strpos( $content, 'data-countdown-part="' . $unit . '"' ) ) {
				$present[] = $unit;
			}
		}

		$values    = array();
		$remaining = $left;

		foreach ( $present as $unit ) {
			$values[ $unit ] = intdiv( $remaining, self::UNITS[ $unit ] );
			$remaining      -= $values[ $unit ] * self::UNITS[ $unit ];
		}

		/*
		 * Replace each number part's text. GenerateBlocks saves a Text block's
		 * content directly inside its tag, e.g.
		 * <span class="gb-text gb-text-1a2b" data-countdown-part="days">00</span>.
		 */
		$content = preg_replace_callback(
			'#(<([a-z][a-z0-9]*)\b[^>]*\bdata-countdown-part="(days|hours|minutes|seconds)"[^>]*>)[^<]*(</\2>)#i',
			function ( $match ) use ( $values, $config ) {
				$value = $values[ $match[3] ] ?? 0;
				$text  = $config['pad'] ? str_pad( (string) $value, 2, '0', STR_PAD_LEFT ) : (string) $value;

				return $match[1] . $text . $match[4];
			},
			$content
		);

		if ( ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
			return $content;
		}

		$processor = new WP_HTML_Tag_Processor( $content );

		while ( $processor->next_tag() ) {
			$part = $processor->get_attribute( 'data-countdown-part' );

			$hidden = ( 'ended' === $part && ! $ended )
				|| ( 'timer' === $part && $ended && 'message' === $config['endAction'] );

			// Separators and other decoration shouldn't be read out every second.
			if ( 'separator' === $part ) {
				$processor->set_attribute( 'aria-hidden', 'true' );
			}

			if ( $hidden ) {
				$style = (string) $processor->get_attribute( 'style' );
				$processor->set_attribute( 'style', rtrim( $style, '; ' ) . ( $style ? ';' : '' ) . 'display:none!important' );
			}
		}

		return $processor->get_updated_html();
	}
}
