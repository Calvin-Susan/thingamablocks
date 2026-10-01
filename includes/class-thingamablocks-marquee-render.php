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
		$mask   = '';

		if ( $vertical ) {
			$styles[] = 'height:' . self::length( $attributes['height'] ?? '', '20rem' );
		}

		if ( ! isset( $attributes['fadeEdges'] ) || ! empty( $attributes['fadeEdges'] ) ) {
			$fade = self::length( $attributes['fadeWidth'] ?? '', '10%' );
			$side = $vertical ? 'to bottom' : 'to right';
			$mask = "linear-gradient({$side},transparent,#000 {$fade},#000 calc(100% - {$fade}),transparent)";
		}

		$wrapper = array(
			'class'            => 'tmb-marquee',
			'data-tmb-marquee' => wp_json_encode( $config ),
			// Trailing ";" because WordPress before 7.0 joins block styles with a space.
			'style'            => implode( ';', $styles ) . ';',
		);

		if ( ! empty( $attributes['anchor'] ) ) {
			$wrapper['id'] = $attributes['anchor'];
		}

		$label = sanitize_text_field( $attributes['ariaLabel'] ?? '' );

		if ( $label ) {
			$wrapper['role']       = 'region';
			$wrapper['aria-label'] = $label;
		}

		$html = sprintf(
			'<div %1$s>%2$s</div>',
			get_block_wrapper_attributes( $wrapper ),
			self::decorate_parts( $content, $vertical )
		);

		/*
		 * WordPress's style filter in get_block_wrapper_attributes() drops
		 * mask-image, so the edge fade is added to the rendered tag. It's built
		 * only from a validated length, so it's safe as-is. The script moves it
		 * to an inner layer so the pause button isn't faded.
		 */
		if ( $mask && class_exists( 'WP_HTML_Tag_Processor' ) ) {
			$processor = new WP_HTML_Tag_Processor( $html );

			if ( $processor->next_tag() ) {
				$style = rtrim( (string) $processor->get_attribute( 'style' ), '; ' );
				$processor->set_attribute( 'style', $style . ';-webkit-mask-image:' . $mask . ';mask-image:' . $mask );
				$html = $processor->get_updated_html();
			}
		}

		return $html;
	}

	/**
	 * The config the front-end script reads.
	 *
	 * @param array $attributes Block attributes.
	 * @return array
	 */
	public static function config( $attributes ) {
		$direction = $attributes['direction'] ?? 'left';
		$label     = sanitize_text_field( $attributes['ariaLabel'] ?? '' );

		return array(
			'speed'        => max( 5, min( 1000, (float) ( $attributes['speed'] ?? 50 ) ) ),
			'direction'    => in_array( $direction, array( 'left', 'right', 'up', 'down' ), true ) ? $direction : 'left',
			'pauseOnHover' => ! isset( $attributes['pauseOnHover'] ) || ! empty( $attributes['pauseOnHover'] ),
			// Names the row when reduced motion turns it into a scrollable, focusable area.
			'scrollLabel'  => '' !== $label ? $label : __( 'Scrolling content', 'thingamablocks' ),
		);
	}

	/**
	 * A CSS length like "10%", "4rem" or "120px"; anything else gets the default.
	 *
	 * @param string $value    Length.
	 * @param string $fallback Default.
	 * @return string
	 */
	public static function length( $value, $fallback ) {
		$value = is_string( $value ) ? trim( $value ) : '';

		return preg_match( '/^(\d{1,4}(\.\d+)?|\.\d+)(px|rem|em|%|vw|vh|svh|dvh)$/D', $value ) ? $value : $fallback;
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

				// A name for icon-only buttons; the script drops it if the button has visible text.
				if ( null === $processor->get_attribute( 'aria-label' ) ) {
					$processor->set_attribute( 'aria-label', __( 'Pause the scrolling', 'thingamablocks' ) );
					$processor->set_attribute( 'data-tmb-default-label', '' );
				}
			}
		}

		return $processor->get_updated_html();
	}
}
