<?php
/**
 * Front-end rendering for the Toggle block.
 *
 * The Toggle's visible parts are ordinary GenerateBlocks blocks saved as static
 * HTML. This class wraps them and adds the accessibility attributes and state
 * on the server, so the markup is correct before any JavaScript runs and an
 * editor can't accidentally remove role="switch" or aria-checked.
 *
 * @package ToggleForGenerateBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Toggle block.
 */
class Ogal_Toggle_Render {
	/**
	 * Actions the block understands. Anything else falls back to "none".
	 */
	const ACTIONS = array( 'showHide', 'colorScheme', 'toggleClass', 'none' );

	/**
	 * Counter for generated IDs, so aria-controls always has something to point at.
	 *
	 * @var int
	 */
	private static $instance = 0;

	/**
	 * Render callback.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Saved inner-block HTML.
	 * @param WP_Block $block      Block instance.
	 * @return string
	 */
	public static function render( $attributes, $content, $block = null ) {
		self::$instance++;

		$config = self::config( $attributes );
		$is_on  = 'on' === $config['defaultState'];

		$content = self::decorate_parts( $content, $config, $is_on );

		$wrapper = get_block_wrapper_attributes(
			array(
				'class'            => 'ogal-toggle ' . ( $is_on ? 'is-on' : 'is-off' ),
				'data-ogal-toggle' => wp_json_encode( $config ),
			)
		);

		return sprintf(
			'%1$s<div %2$s>%3$s</div>',
			self::initial_visibility_css( $config, $is_on ),
			$wrapper,
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
		$action = $attributes['action'] ?? 'showHide';

		if ( ! in_array( $action, self::ACTIONS, true ) ) {
			$action = 'none';
		}

		$config = array(
			'action'       => $action,
			'defaultState' => 'on' === ( $attributes['defaultState'] ?? 'off' ) ? 'on' : 'off',
			'persist'      => ! empty( $attributes['persist'] ),
			'group'        => sanitize_key( $attributes['group'] ?? '' ),
			'ariaLabel'    => sanitize_text_field( $attributes['ariaLabel'] ?? '' ),
		);

		if ( 'showHide' === $action ) {
			$config['showWhenOff'] = self::clean_selectors( $attributes['showWhenOff'] ?? array() );
			$config['showWhenOn']  = self::clean_selectors( $attributes['showWhenOn'] ?? array() );
			$config['animation']   = in_array( $attributes['animation'] ?? 'none', array( 'none', 'fade', 'slide' ), true ) ? $attributes['animation'] : 'none';
		}

		if ( 'toggleClass' === $action ) {
			$config['classTargets'] = self::clean_selectors( $attributes['classTargets'] ?? array() );
			$config['classNames']   = self::clean_class_names( $attributes['classNames'] ?? '' );
			$config['classMode']    = 'removeWhenOn' === ( $attributes['classMode'] ?? '' ) ? 'removeWhenOn' : 'addWhenOn';
		}

		if ( 'colorScheme' === $action ) {
			// The colour scheme is page-wide, so every colour-scheme toggle shares one state.
			$config['group']        = 'color-scheme';
			$config['persist']      = true;
			$config['followSystem'] = ! isset( $attributes['followSystem'] ) || ! empty( $attributes['followSystem'] );
			$config['htmlClass']    = self::clean_class_names( $attributes['htmlClass'] ?? '' );
		}

		return $config;
	}

	/**
	 * Add roles, state and click targets to the inner GenerateBlocks parts.
	 *
	 * Parts are marked in the editor with data-toggle="switch|on|off" (in the
	 * block's HTML Attributes, or the "Toggle part" panel this plugin adds).
	 *
	 * @param string $content Inner HTML.
	 * @param array  $config  Toggle config.
	 * @param bool   $is_on   Initial state.
	 * @return string
	 */
	private static function decorate_parts( $content, $config, $is_on ) {
		if ( ! class_exists( 'WP_HTML_Tag_Processor' ) || '' === trim( $content ) ) {
			return $content;
		}

		$controls = self::controls_attribute( $config );

		$processor = new WP_HTML_Tag_Processor( $content );

		while ( $processor->next_tag() ) {
			$part = $processor->get_attribute( 'data-toggle' );

			if ( ! is_string( $part ) ) {
				continue;
			}

			$is_button = 'BUTTON' === $processor->get_tag();

			if ( 'switch' === $part ) {
				$processor->set_attribute( 'role', 'switch' );
				$processor->set_attribute( 'aria-checked', $is_on ? 'true' : 'false' );

				if ( $is_button ) {
					$processor->set_attribute( 'type', 'button' );
				} else {
					$processor->set_attribute( 'tabindex', '0' );
				}

				if ( $controls ) {
					$processor->set_attribute( 'aria-controls', $controls );
				}

				if ( $config['ariaLabel'] && null === $processor->get_attribute( 'aria-label' ) ) {
					$processor->set_attribute( 'aria-label', $config['ariaLabel'] );
				}
			} elseif ( 'on' === $part || 'off' === $part ) {
				$active = ( 'on' === $part ) === $is_on;
				$processor->set_attribute( 'data-active', $active ? 'true' : 'false' );

				if ( $is_button ) {
					$processor->set_attribute( 'type', 'button' );
					$processor->set_attribute( 'aria-pressed', $active ? 'true' : 'false' );

					if ( $controls ) {
						$processor->set_attribute( 'aria-controls', $controls );
					}
				}
			}
		}

		return $processor->get_updated_html();
	}

	/**
	 * Space-separated IDs for aria-controls. Only plain IDs count; class or
	 * attribute selectors can't be referenced by aria-controls.
	 *
	 * @param array $config Toggle config.
	 * @return string
	 */
	private static function controls_attribute( $config ) {
		$selectors = array_merge(
			$config['showWhenOff'] ?? array(),
			$config['showWhenOn'] ?? array(),
			$config['classTargets'] ?? array()
		);

		$ids = array();

		foreach ( $selectors as $selector ) {
			if ( preg_match( '/^#?([A-Za-z][\w\-]*)$/', $selector, $match ) ) {
				$ids[] = $match[1];
			}
		}

		return implode( ' ', array_unique( $ids ) );
	}

	/**
	 * Hide the targets that start hidden before the script runs, so a pricing
	 * table doesn't flash both plans on load. The script removes this rule
	 * once it has taken over.
	 *
	 * @param array $config Toggle config.
	 * @param bool  $is_on  Initial state.
	 * @return string
	 */
	private static function initial_visibility_css( $config, $is_on ) {
		if ( 'showHide' !== $config['action'] ) {
			return '';
		}

		$hidden = $is_on ? $config['showWhenOff'] : $config['showWhenOn'];
		$shown  = $is_on ? $config['showWhenOn'] : $config['showWhenOff'];

		// An element listed on both sides stays visible.
		$hidden = array_diff( $hidden, $shown );

		if ( empty( $hidden ) ) {
			return '';
		}

		$selectors = array_map( array( __CLASS__, 'to_css_selector' ), $hidden );

		return sprintf(
			'<style class="ogal-toggle-initial">%s{display:none!important}</style>',
			esc_html( implode( ',', $selectors ) )
		);
	}

	/**
	 * A bare word is an ID; anything else is used as a CSS selector.
	 *
	 * @param string $selector ID or selector.
	 * @return string
	 */
	public static function to_css_selector( $selector ) {
		if ( preg_match( '/^[A-Za-z][\w\-]*$/', $selector ) ) {
			return '#' . $selector;
		}

		return $selector;
	}

	/**
	 * Clean a list of IDs/selectors. Characters that could close the <style>
	 * element or start a new declaration block are dropped.
	 *
	 * @param mixed $selectors List of selectors.
	 * @return array
	 */
	public static function clean_selectors( $selectors ) {
		if ( is_string( $selectors ) ) {
			$selectors = preg_split( '/\s*,\s*/', $selectors );
		}

		if ( ! is_array( $selectors ) ) {
			return array();
		}

		$clean = array();

		foreach ( $selectors as $selector ) {
			if ( ! is_string( $selector ) ) {
				continue;
			}

			$selector = trim( preg_replace( '/[<>{};\\\\]/', '', $selector ) );

			if ( '' !== $selector && strlen( $selector ) <= 200 ) {
				$clean[] = $selector;
			}
		}

		return array_values( array_unique( $clean ) );
	}

	/**
	 * Clean a space-separated list of class names.
	 *
	 * @param string $class_names Class names.
	 * @return string
	 */
	public static function clean_class_names( $class_names ) {
		if ( ! is_string( $class_names ) ) {
			return '';
		}

		$classes = array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $class_names ) ) );

		return implode( ' ', $classes );
	}
}
