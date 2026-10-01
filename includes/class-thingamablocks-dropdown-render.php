<?php
/**
 * Front-end rendering for the Dropdown block.
 *
 * The visible parts are GenerateBlocks blocks: a button marked
 * data-dropdown-part="button" and a drawer marked data-dropdown-part="drawer".
 * The server renders the drawer closed and the button with its ARIA state,
 * so the markup is right before the script runs.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Dropdown block.
 */
class Thingamablocks_Dropdown_Render {
	/**
	 * Marks parts a dropdown has processed, so an outer dropdown leaves a
	 * nested one's parts alone.
	 */
	const OWNED = 'data-dropdown-owned';

	/**
	 * Render callback.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Saved inner-block HTML.
	 * @return string
	 */
	public static function render( $attributes, $content ) {
		$config = self::config( $attributes );
		$gap    = max( 0, min( 48, (int) ( $attributes['gap'] ?? 8 ) ) );

		$wrapper = array(
			'class'             => 'tmb-dropdown',
			'data-tmb-dropdown' => wp_json_encode( $config ),
			// Trailing ";" because WordPress before 7.0 joins block styles with a space.
			'style'             => '--tmb-dropdown-gap:' . $gap . 'px;',
		);

		if ( ! empty( $attributes['anchor'] ) ) {
			$wrapper['id'] = $attributes['anchor'];
		}

		return sprintf(
			'%1$s<div %2$s>%3$s</div>',
			self::no_script_style(),
			get_block_wrapper_attributes( $wrapper ),
			self::decorate_parts( $content )
		);
	}

	/**
	 * The config the front-end script reads.
	 *
	 * @param array $attributes Block attributes.
	 * @return array
	 */
	public static function config( $attributes ) {
		$pick = function ( $value, $allowed ) {
			return in_array( $value, $allowed, true ) ? $value : $allowed[0];
		};

		return array(
			'animation'    => $pick( $attributes['animation'] ?? 'slide', array( 'slide', 'none', 'fade', 'grow', 'unfold' ) ),
			'speed'        => $pick( $attributes['speed'] ?? 'normal', array( 'normal', 'fast', 'slow' ) ),
			'align'        => $pick( $attributes['align'] ?? 'start', array( 'start', 'center', 'end' ) ),
			'closeOnClick' => ! isset( $attributes['closeOnClick'] ) || ! empty( $attributes['closeOnClick'] ),
		);
	}

	/**
	 * Without JavaScript, show the drawer in the page flow, so its content is
	 * never out of reach. Printed with each dropdown (it's tiny), so it can't
	 * be lost if the first dropdown is rendered somewhere that's thrown away.
	 *
	 * @return string
	 */
	private static function no_script_style() {
		return '<noscript><style>.tmb-dropdown [data-dropdown-part="drawer"]{display:block!important;position:static!important}</style></noscript>';
	}

	/**
	 * Wire up the button and the drawer: the drawer starts closed and gets an
	 * ID; the button gets aria-expanded and aria-controls pointing at it.
	 *
	 * @param string $content Inner HTML.
	 * @return string
	 */
	private static function decorate_parts( $content ) {
		if ( '' === trim( $content ) || ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
			return $content;
		}

		// Only a complete dropdown is wired up: a drawer without a button
		// would be hidden for good, a button without a drawer would announce
		// a state it can't change.
		$parts     = array();
		$processor = new WP_HTML_Tag_Processor( $content );

		while ( $processor->next_tag() ) {
			$part = $processor->get_attribute( 'data-dropdown-part' );

			if ( is_string( $part ) && null === $processor->get_attribute( self::OWNED ) ) {
				$parts[ $part ] = true;
			}
		}

		if ( empty( $parts['button'] ) || empty( $parts['drawer'] ) ) {
			return $content;
		}

		// First the drawer, so its ID is known when the button comes first.
		$drawer_id = '';
		$processor = new WP_HTML_Tag_Processor( $content );

		while ( $processor->next_tag() ) {
			if ( 'drawer' !== $processor->get_attribute( 'data-dropdown-part' ) || null !== $processor->get_attribute( self::OWNED ) ) {
				continue;
			}

			$drawer_id = (string) $processor->get_attribute( 'id' );

			// Keep an ID set in GenerateBlocks (anchor links and CSS may use it);
			// HTML allows anything but spaces.
			if ( '' === $drawer_id || preg_match( '/\s/', $drawer_id ) ) {
				$drawer_id = wp_unique_id( 'tmb-dropdown-' );
				$processor->set_attribute( 'id', $drawer_id );
			}

			$style = rtrim( (string) $processor->get_attribute( 'style' ), '; ' );
			$processor->set_attribute( 'style', ( '' !== $style ? $style . ';' : '' ) . 'display:none' );
			$processor->set_attribute( self::OWNED, '' );
			break;
		}

		$processor = new WP_HTML_Tag_Processor( $processor->get_updated_html() );

		while ( $processor->next_tag() ) {
			if ( 'button' !== $processor->get_attribute( 'data-dropdown-part' ) || null !== $processor->get_attribute( self::OWNED ) ) {
				continue;
			}

			if ( 'BUTTON' === $processor->get_tag() ) {
				// Stop a button inside a form from submitting it.
				$processor->set_attribute( 'type', 'button' );
			} else {
				$processor->set_attribute( 'role', 'button' );
				$processor->set_attribute( 'tabindex', '0' );
			}

			$processor->set_attribute( 'aria-expanded', 'false' );

			if ( '' !== $drawer_id ) {
				$processor->set_attribute( 'aria-controls', $drawer_id );
			}

			$processor->set_attribute( self::OWNED, '' );
			break;
		}

		return $processor->get_updated_html();
	}
}
