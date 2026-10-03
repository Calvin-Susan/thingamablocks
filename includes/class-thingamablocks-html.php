<?php
/**
 * HTML helper: finds a whole element in block markup, or where an opening
 * tag ends (used by the Search block and video backgrounds), and puts new
 * text into a part template (Breadcrumbs, Table of Contents).
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Finds a whole element (opening tag to its matching closing tag) in block
 * markup. WP_HTML_Tag_Processor visits tags; its bookmarks give their byte
 * positions, so the element can be cut out or replaced exactly, however
 * deeply other tags are nested inside it.
 */
class Thingamablocks_Html extends WP_HTML_Tag_Processor {

	/**
	 * Elements that have no closing tag.
	 */
	const VOID = array( 'AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'SOURCE', 'TRACK', 'WBR' );

	/**
	 * Where the first tag's opening tag ends (its byte offset), or null.
	 *
	 * @param string $html Markup.
	 * @return int|null
	 */
	public static function first_tag_end( $html ) {
		$tags = new self( $html );

		if ( ! $tags->next_tag() ) {
			return null;
		}

		$tags->set_bookmark( 'tmb-first' );

		return $tags->bookmarks['tmb-first']->start + $tags->bookmarks['tmb-first']->length;
	}

	/**
	 * The first element whose $attribute is $value: its tag, attributes and
	 * byte positions, or null.
	 *
	 * @param string $attribute Attribute name.
	 * @param string $value     Attribute value.
	 * @return array|null { tag, attributes, start, inner_start, inner_end, end }
	 */
	public function find( $attribute, $value ) {
		while ( $this->next_tag() ) {
			if ( $value !== $this->get_attribute( $attribute ) ) {
				continue;
			}

			$tag        = $this->get_tag();
			$attributes = array();

			foreach ( (array) $this->get_attribute_names_with_prefix( '' ) as $name ) {
				$attributes[ $name ] = $this->get_attribute( $name );
			}

			$this->set_bookmark( 'tmb-open' );
			$open = $this->bookmarks['tmb-open'];

			$found = array(
				'tag'         => $tag,
				'attributes'  => $attributes,
				'start'       => $open->start,
				'inner_start' => $open->start + $open->length,
			);

			if ( in_array( $tag, self::VOID, true ) ) {
				$found['inner_end'] = $found['inner_start'];
				$found['end']       = $found['inner_start'];
				return $found;
			}

			$depth = 1;

			while ( $this->next_tag( array( 'tag_closers' => 'visit' ) ) ) {
				if ( $tag !== $this->get_tag() ) {
					continue;
				}

				$depth += $this->is_tag_closer() ? -1 : 1;

				if ( 0 === $depth ) {
					$this->set_bookmark( 'tmb-close' );
					$close = $this->bookmarks['tmb-close'];

					$found['inner_end'] = $close->start;
					$found['end']       = $close->start + $close->length;
					return $found;
				}
			}

			return null;
		}

		return null;
	}

	/**
	 * Move to the first tag inside the current element (the first tag of the
	 * markup) whose $attribute is $value, skipping the insides of nested
	 * elements that have $nested (e.g. a container with its own video).
	 *
	 * @param string $attribute Attribute name.
	 * @param string $value     Attribute value.
	 * @param string $nested    Attribute that marks a nested element to skip.
	 * @return bool Whether one was found (the processor is then on it).
	 */
	public function next_own_tag( $attribute, $value, $nested ) {
		$first = true;

		while ( $this->next_tag() ) {
			if ( $first ) {
				$first = false;
				continue;
			}

			if ( null !== $this->get_attribute( $nested ) ) {
				$this->skip_element();
				continue;
			}

			if ( $value === $this->get_attribute( $attribute ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Move past the end of the current element.
	 */
	private function skip_element() {
		$tag = $this->get_tag();

		if ( in_array( $tag, self::VOID, true ) ) {
			return;
		}

		$depth = 1;

		while ( $this->next_tag( array( 'tag_closers' => 'visit' ) ) ) {
			if ( $tag === $this->get_tag() ) {
				$depth += $this->is_tag_closer() ? -1 : 1;

				if ( 0 === $depth ) {
					return;
				}
			}
		}
	}

	/**
	 * Replace the text of a one-element template (a GB Text block, say) with
	 * $text_html, keeping its tag and any icon.
	 *
	 * @param string $html      Template markup.
	 * @param string $text_html Escaped text HTML.
	 * @return string HTML.
	 */
	public static function replace_text( $html, $text_html ) {
		$literal = str_replace( array( '\\', '$' ), array( '\\\\', '\\$' ), $text_html );

		// A GB Text block with an icon keeps its text in an inner span.
		$replaced = preg_replace( '#(<span class="gb-text">).*?(</span>)#s', '${1}' . $literal . '${2}', $html, 1, $count );

		if ( $count ) {
			return $replaced;
		}

		return (string) preg_replace( '#^(\s*<[^>]+>).*(</[a-zA-Z0-9]+>\s*)$#s', '${1}' . $literal . '${2}', $html );
	}

	/**
	 * Find an element in some markup by an attribute's value.
	 *
	 * @param string $html      Markup.
	 * @param string $attribute Attribute name.
	 * @param string $value     Attribute value.
	 * @return array|null See find().
	 */
	public static function element( $html, $attribute, $value ) {
		if ( false === strpos( $html, $attribute . '="' . $value . '"' ) ) {
			return null;
		}

		return ( new self( $html ) )->find( $attribute, $value );
	}
}
