<?php
/**
 * Sanitising helpers shared by the blocks.
 *
 * @package ToggleForGenerateBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cleans targets (IDs/selectors), class names and colours typed into block
 * settings. Contributors can save block attributes, so everything that ends
 * up in markup or a <style> element goes through here.
 */
class Ogal_Blocks_Sanitize {
	/**
	 * Bare words treated as tag names rather than IDs when used as a target.
	 */
	const TAG_TARGETS = array( 'html', 'body', 'main', 'header', 'footer', 'nav', 'aside', 'article', 'section' );

	/**
	 * A bare word is an ID (except common tag names like body); anything else
	 * is used as a CSS selector.
	 *
	 * @param string $selector ID or selector.
	 * @return string
	 */
	public static function to_css_selector( $selector ) {
		if ( ! in_array( $selector, self::TAG_TARGETS, true ) && preg_match( '/^[A-Za-z][\w\-]*$/', $selector ) ) {
			return '#' . $selector;
		}

		return $selector;
	}

	/**
	 * Clean a list of IDs/selectors. Characters that could close the <style>
	 * element, open a comment or start a new declaration block are dropped.
	 *
	 * @param mixed $selectors List of selectors.
	 * @return array
	 */
	public static function selectors( $selectors ) {
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

			$selector = trim( $selector );

			if ( '' !== $selector && strlen( $selector ) <= 200 && self::is_safe_selector( $selector ) ) {
				$clean[] = $selector;
			}
		}

		return array_values( array_unique( $clean ) );
	}

	/**
	 * Whether a selector is safe to print inside a <style> element.
	 *
	 * Only characters that plain selectors use are allowed: no "<" (which could
	 * close the element), no "{", "}", ";" or "\\" (declarations, escapes) and
	 * no "@" (at-rules such as @import). Brackets, parentheses and quotes must
	 * balance, so an open "(" can't swallow the rule that follows it.
	 *
	 * @param string $selector Selector.
	 * @return bool
	 */
	public static function is_safe_selector( $selector ) {
		if ( ! preg_match( '/^[A-Za-z0-9_\-#.\[\]="\'~^$*|:(), >+]+$/D', $selector ) ) {
			return false;
		}

		$stack = array();
		$quote = '';
		$pairs = array(
			')' => '(',
			']' => '[',
		);

		foreach ( str_split( $selector ) as $char ) {
			if ( $quote ) {
				if ( $char === $quote ) {
					$quote = '';
				}
				continue;
			}

			if ( '"' === $char || "'" === $char ) {
				$quote = $char;
			} elseif ( '(' === $char || '[' === $char ) {
				$stack[] = $char;
			} elseif ( isset( $pairs[ $char ] ) && array_pop( $stack ) !== $pairs[ $char ] ) {
				return false;
			}
		}

		return '' === $quote && empty( $stack );
	}

	/**
	 * Clean a space-separated list of class names.
	 *
	 * @param string $class_names Class names.
	 * @return string
	 */
	public static function class_names( $class_names ) {
		if ( ! is_string( $class_names ) ) {
			return '';
		}

		$classes = array_filter( array_map( 'sanitize_html_class', preg_split( '/\s+/', $class_names ) ) );

		return implode( ' ', $classes );
	}

	/**
	 * Space-separated plain IDs from a list of targets, for aria-controls.
	 *
	 * @param array $selectors Cleaned targets.
	 * @return string
	 */
	public static function ids_attribute( $selectors ) {
		$ids = array();

		foreach ( $selectors as $selector ) {
			if ( in_array( $selector, self::TAG_TARGETS, true ) ) {
				continue;
			}

			if ( preg_match( '/^#?([A-Za-z][\w\-]*)$/D', $selector, $match ) ) {
				$ids[] = $match[1];
			}
		}

		return implode( ' ', array_unique( $ids ) );
	}

	/**
	 * A no-flash <style> that hides targets until the script takes over.
	 * Ambiguous tag-name targets are left to the script.
	 *
	 * @param array  $selectors Cleaned targets.
	 * @param string $class     Class for the <style>, which the script removes.
	 * @return string
	 */
	public static function hide_style( $selectors, $class ) {
		$rules = '';

		foreach ( $selectors as $selector ) {
			if ( in_array( $selector, self::TAG_TARGETS, true ) ) {
				continue;
			}

			// One rule per selector, so an invalid selector only voids its own rule.
			$rules .= self::to_css_selector( $selector ) . '{display:none!important}';
		}

		if ( '' === $rules ) {
			return '';
		}

		// Not escaped: <style> is raw text, and selectors() only lets through safe, balanced selectors.
		return '<style class="' . esc_attr( $class ) . '">' . $rules . '</style>';
	}
}
