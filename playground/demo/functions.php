<?php
/**
 * Helpers for the local test site's demo sections (playground/demo/*.php),
 * which the Playground blueprint renders into the "Thingamablocks demo" page.
 * Not part of the plugin.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'thingamablocks_pattern_json_string' ) ) {
	/**
	 * Encode a string for use inside a JSON string in a block comment, without the
	 * surrounding quotes. Used by the pattern files for translated attribute values
	 * (e.g. "ariaLabel"). JSON_HEX_TAG / JSON_HEX_AMP keep "<", ">" and "&" from
	 * breaking out of the block comment.
	 *
	 * @param string $text Text to encode.
	 * @return string
	 */
	function thingamablocks_pattern_json_string( $text ) {
		$json = substr( (string) wp_json_encode( (string) $text, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE ), 1, -1 );

		// As serialize_block_attributes() does: "--" would end the block comment early.
		return str_replace( '--', '\u002d\u002d', $json );
	}
}
