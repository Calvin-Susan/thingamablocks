<?php
/**
 * Front-end rendering for the Marquee block.
 *
 * The visible parts are GenerateBlocks blocks: a row marked
 * data-marquee-part="items" and an optional button marked
 * data-marquee-part="pause". The wrapper's clipping, edge fade and (for
 * vertical marquees) height are inline styles, so the strip looks right
 * before the script starts and doesn't depend on a stylesheet.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Marquee block.
 */
class Thingamablocks_Marquee_Render {
	/**
	 * Marks parts a marquee has processed, so an outer marquee leaves a nested
	 * one's parts alone.
	 */
	const OWNED = 'data-marquee-owned';

	/**
	 * Render callback.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Saved inner-block HTML.
	 * @return string
	 */
	public static function render( $attributes, $content ) {
		$config   = self::config( $attributes );
		$vertical = in_array( $config['direction'], array( 'up', 'down' ), true );

		$styles = array( 'position:relative', 'overflow:hidden' );

		if ( $vertical ) {
			$styles[] = 'height:' . self::length( $attributes['height'] ?? '', '20rem' );
		}

		if ( ! isset( $attributes['fadeEdges'] ) || ! empty( $attributes['fadeEdges'] ) ) {
			$fade  = self::length( $attributes['fadeWidth'] ?? '', '10%' );
			$side  = $vertical ? 'to bottom' : 'to right';
			$mask  = "linear-gradient({$side},transparent,#000 {$fade},#000 calc(100% - {$fade}),transparent)";

			$styles[] = '-webkit-mask-image:' . $mask;
			$styles[] = 'mask-image:' . $mask;
		}

		$wrapper = array(
			'class'           => 'tmb-marquee',
			'data-tmb-marquee' => wp_json_encode( $config ),
			// Trailing ";" because WordPress before 7.0 joins block styles with a space.
			'style'           => implode( ';', $styles ) . ';',
		);

		if ( ! empty( $attributes['anchor'] ) ) {
			$wrapper['id'] = $attributes['anchor'];
		}

		$label = sanitize_text_field( $attributes['ariaLabel'] ?? '' );

		if ( $label ) {
			$wrapper['role']       = 'region';
			$wrapper['aria-label'] = $label;
		}

		return sprintf(
			'<div %1$s>%2$s</div>',
			get_block_wrapper_attributes( $wrapper ),
			self::decorate_parts( $content, $vertical )
		);
	}

	/**
	 * The config the front-end script reads.
	 *
	 * @param array $attributes Block attributes.
	 * @return array
	 */
	public static function config( $attributes ) {
		$direction = $attributes['direction'] ?? 'left';

		return array(
			'speed'        => max( 5, min( 1000, (float) ( $attributes['speed'] ?? 50 ) ) ),
			'direction'    => in_array( $direction, array( 'left', 'right', 'up', 'down' ), true ) ? $direction : 'left',
			'pauseOnHover' => ! isset( $attributes['pauseOnHover'] ) || ! empty( $attributes['pauseOnHover'] ),
		);
	}

	/**
	 * A CSS length like "10%", "4rem" or "120px"; anything else gets the default.
	 *
	 * @param string $value   Length.
	 * @param string $default Default.
	 * @return string
	 */
	public static function length( $value, $default ) {
		$value = is_string( $value ) ? trim( $value ) : '';

		return preg_match( '/^\d{1,4}(\.\d+)?(px|rem|em|%|vw|vh|svh|dvh)$/D', $value ) ? $value : $default;
	}

	/**
	 * Keep the items row on one line at its natural size, and set up the pause
	 * button, before the script runs.
	 *
	 * @param string $content  Inner HTML.
	 * @param bool   $vertical Whether it scrolls up/down.
	 * @return string
	 */
	private static function decorate_parts( $content, $vertical ) {
		if ( '' === trim( $content ) || ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
			return $content;
		}

		$processor = new WP_HTML_Tag_Processor( $content );

		while ( $processor->next_tag() ) {
			$part = $processor->get_attribute( 'data-marquee-part' );

			if ( ! is_string( $part ) || null !== $processor->get_attribute( self::OWNED ) ) {
				continue;
			}

			$processor->set_attribute( self::OWNED, '' );

			if ( 'items' === $part ) {
				// The row keeps its natural length; the script measures it.
				$extra = $vertical ? 'flex-shrink:0' : 'flex-shrink:0;width:max-content;flex-wrap:nowrap';
				$style = (string) $processor->get_attribute( 'style' );
				$processor->set_attribute( 'style', rtrim( $style, '; ' ) . ( $style ? ';' : '' ) . $extra );
			}

			if ( 'pause' === $part ) {
				if ( 'BUTTON' === $processor->get_tag() ) {
					$processor->set_attribute( 'type', 'button' );
				} else {
					$processor->set_attribute( 'role', 'button' );
					$processor->set_attribute( 'tabindex', '0' );
				}

				$processor->set_attribute( 'aria-pressed', 'false' );

				if ( null === $processor->get_attribute( 'aria-label' ) ) {
					$processor->set_attribute( 'aria-label', __( 'Pause the scrolling', 'thingamablocks' ) );
				}
			}
		}

		return $processor->get_updated_html();
	}
}
