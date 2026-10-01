<?php
/**
 * Let everyone who can edit posts save the Toggle's state attributes.
 *
 * The Toggle keeps its parts' saved markup in step with "Starts as":
 * aria-checked on a switch, aria-pressed on on/off buttons. WordPress's
 * content filter (kses) only allows a short list of ARIA attributes for
 * users without the unfiltered_html capability (authors, contributors, and
 * everyone but super admins on multisite), and strips these two. The saved
 * markup then no longer matches the block, and the editor reports the block
 * as invalid. They're plain ARIA states with no way to run code, so allow them.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'wp_kses_allowed_html', 'thingamablocks_allow_aria_state_attributes', 10, 2 );
/**
 * Add aria-checked and aria-pressed to every tag allowed in post content.
 *
 * @param array        $tags    Allowed tags and their attributes.
 * @param string|array $context Context name.
 * @return array
 */
function thingamablocks_allow_aria_state_attributes( $tags, $context ) {
	if ( 'post' !== $context || ! is_array( $tags ) ) {
		return $tags;
	}

	foreach ( $tags as $tag => $attributes ) {
		if ( is_array( $attributes ) ) {
			$tags[ $tag ]['aria-checked'] = true;
			$tags[ $tag ]['aria-pressed'] = true;
		}
	}

	return $tags;
}
