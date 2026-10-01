<?php
/**
 * HTML helper for the Search block: finds a part's whole element.
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
class Thingamablocks_Search_Html extends WP_HTML_Tag_Processor {

	/**
	 * Elements that have no closing tag.
	 */
	const VOID = array( 'AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'SOURCE', 'TRACK', 'WBR' );

	/**
	 * The first element with data-search-part="$part": its tag, attributes
	 * and byte positions, or null.
	 *
	 * @param string $part Part name.
	 * @return array|null { tag, attributes, start, inner_start, inner_end, end }
	 */
	public function find_part( $part ) {
		while ( $this->next_tag() ) {
			if ( $part !== $this->get_attribute( 'data-search-part' ) ) {
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
	 * Find a part in some markup.
	 *
	 * @param string $html Markup.
	 * @param string $part Part name.
	 * @return array|null See find_part().
	 */
	public static function part( $html, $part ) {
		if ( false === strpos( $html, 'data-search-part="' . $part . '"' ) ) {
			return null;
		}

		return ( new self( $html ) )->find_part( $part );
	}
}
