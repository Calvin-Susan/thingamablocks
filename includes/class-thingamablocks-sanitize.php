<?php
/**
 * Sanitising helpers shared by the blocks.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Cleans targets (IDs/selectors), class names and colours typed into block
 * settings. Contributors can save block attributes, so everything that ends
 * up in markup or a <style> element goes through here.
 */
class Thingamablocks_Sanitize {
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
	 * Never "<" (which could close the element), "\\" escapes, control
	 * characters, "{", "}", ";" (declarations), "@" (at-rules like an
	 * import), comments or url(): not even inside quotes, because a browser
	 * and this check could disagree about where a quoted string ends (an
	 * unquoted url( treats quotes differently). Outside quotes, only selector
	 * punctuation, letters, digits and non-ASCII letters. Brackets,
	 * parentheses and quotes must balance, so an open "(" can't swallow the
	 * rule that follows it.
	 *
	 * @param string $selector Selector.
	 * @return bool
	 */
	public static function is_safe_selector( $selector ) {
		// Nowhere, quoted or not: "<" (it could close the <style>), escapes, line
		// breaks, anything that starts a declaration block or at-rule, comments, url().
		if ( preg_match( '/[<\\\\{};@\x00-\x1f\x7f]|\/\*|url\s*\(/i', $selector ) ) {
			return false;
		}

		$stack = array();
		$quote = '';
		$pairs = array(
			')' => '(',
			']' => '[',
		);
		$chars = preg_split( '//u', $selector, -1, PREG_SPLIT_NO_EMPTY );

		if ( false === $chars ) {
			return false; // Not valid UTF-8.
		}

		foreach ( $chars as $char ) {
			// Inside quotes ([href="/pricing"]) anything else goes.
			if ( $quote ) {
				if ( $char === $quote ) {
					$quote = '';
				}
				continue;
			}

			// Outside quotes: selector punctuation, letters, digits, and non-ASCII (IDs in other scripts).
			if ( strlen( $char ) === 1 && ! preg_match( '/[A-Za-z0-9_\-#.\[\]="\'~^$*|:(), >+]/', $char ) ) {
				return false;
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
	 * The CSS rules that hide targets: one rule per selector, so an invalid
	 * selector only voids its own rule. Ambiguous tag-name targets are left to
	 * the script.
	 *
	 * @param array $selectors Cleaned targets.
	 * @return string
	 */
	public static function hide_rules( $selectors ) {
		$rules = '';

		foreach ( $selectors as $selector ) {
			// "header" could be id="header" or every <header>; only the script can tell.
			if ( in_array( $selector, self::TAG_TARGETS, true ) ) {
				continue;
			}

			$rules .= self::to_css_selector( $selector ) . '{display:none!important}';
		}

		return $rules;
	}

	/**
	 * A no-flash <style> that hides targets until the script takes over.
	 *
	 * @param array  $selectors  Cleaned targets.
	 * @param string $class_name Class for the <style>, which the script removes.
	 * @return string
	 */
	public static function hide_style( $selectors, $class_name ) {
		$rules = self::hide_rules( $selectors );

		if ( '' === $rules ) {
			return '';
		}

		// Not escaped: <style> is raw text (entities would break selectors like
		// [data-plan="annual"]), and selectors() only lets through safe, balanced selectors.
		return '<style class="' . esc_attr( $class_name ) . '">' . $rules . '</style>';
	}
}
