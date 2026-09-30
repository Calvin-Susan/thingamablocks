<?php
/**
 * Light/dark mode support.
 *
 * A colour-scheme toggle saves the visitor's choice in localStorage. To avoid
 * a flash of the wrong scheme on the next page load, a tiny script in <head>
 * applies the saved choice before the page paints, and the toggle's dark mode
 * colours are printed as CSS variable overrides.
 *
 * Both are only printed while a published post (page, GeneratePress Element,
 * template part…) contains a colour-scheme toggle. Each such post's settings
 * are tracked separately, so removing the toggle or trashing the post turns
 * them off again.
 *
 * @package ToggleForGenerateBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option storing colour-scheme settings per post:
 * array( post_id => array( 'followSystem', 'htmlClass', 'palette', 'modified' ) ).
 */
const OGAL_TOGGLE_COLOR_SCHEME_OPTION = 'ogal_toggle_color_scheme';

add_action( 'save_post', 'ogal_toggle_track_color_scheme_toggle', 10, 2 );
/**
 * Record (or forget) a post's colour-scheme toggle settings when it's saved.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 */
function ogal_toggle_track_color_scheme_toggle( $post_id, $post ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	$settings = null;

	if ( 'publish' === $post->post_status && false !== strpos( $post->post_content, 'wp:ogal/toggle' ) ) {
		$settings = ogal_toggle_find_color_scheme_settings( parse_blocks( $post->post_content ) );
	}

	ogal_toggle_set_color_scheme_entry( $post_id, $settings );
}

add_action( 'deleted_post', 'ogal_toggle_forget_color_scheme_toggle' );
add_action( 'trashed_post', 'ogal_toggle_forget_color_scheme_toggle' );
/**
 * Forget a post's colour-scheme toggle when it's trashed or deleted.
 *
 * @param int $post_id Post ID.
 */
function ogal_toggle_forget_color_scheme_toggle( $post_id ) {
	ogal_toggle_set_color_scheme_entry( $post_id, null );
}

/**
 * Store or remove one post's entry.
 *
 * @param int        $post_id  Post ID.
 * @param array|null $settings Settings, or null to remove.
 */
function ogal_toggle_set_color_scheme_entry( $post_id, $settings ) {
	$entries = get_option( OGAL_TOGGLE_COLOR_SCHEME_OPTION, array() );

	// Older format (a single settings array) from 0.1 development builds.
	if ( ! is_array( $entries ) || isset( $entries['followSystem'] ) ) {
		$entries = array();
	}

	if ( null === $settings ) {
		if ( ! isset( $entries[ $post_id ] ) ) {
			return;
		}

		unset( $entries[ $post_id ] );
	} else {
		$settings['modified'] = time();
		$entries[ $post_id ]  = $settings;
	}

	if ( empty( $entries ) ) {
		delete_option( OGAL_TOGGLE_COLOR_SCHEME_OPTION );
	} else {
		update_option( OGAL_TOGGLE_COLOR_SCHEME_OPTION, $entries, true );
	}
}

/**
 * The settings in use: the most recently saved colour-scheme toggle wins.
 *
 * @return array|null
 */
function ogal_toggle_get_color_scheme_settings() {
	$entries = get_option( OGAL_TOGGLE_COLOR_SCHEME_OPTION, array() );

	if ( ! is_array( $entries ) || empty( $entries ) || isset( $entries['followSystem'] ) ) {
		return null;
	}

	uasort(
		$entries,
		function ( $a, $b ) {
			return ( $b['modified'] ?? 0 ) <=> ( $a['modified'] ?? 0 );
		}
	);

	return reset( $entries );
}

/**
 * Find the first colour-scheme toggle in a block tree.
 *
 * @param array $blocks Parsed blocks.
 * @return array|null
 */
function ogal_toggle_find_color_scheme_settings( $blocks ) {
	foreach ( $blocks as $block ) {
		if ( 'ogal/toggle' === $block['blockName'] && 'colorScheme' === ( $block['attrs']['action'] ?? '' ) ) {
			$config = Ogal_Toggle_Render::config( $block['attrs'] );

			return array(
				'followSystem' => $config['followSystem'],
				'htmlClass'    => $config['htmlClass'],
				'palette'      => ogal_toggle_clean_palette( $block['attrs']['darkPalette'] ?? array() ),
			);
		}

		if ( ! empty( $block['innerBlocks'] ) ) {
			$found = ogal_toggle_find_color_scheme_settings( $block['innerBlocks'] );

			if ( null !== $found ) {
				return $found;
			}
		}
	}

	return null;
}

/**
 * Keep only custom property names and plain colour values.
 *
 * @param mixed $palette Map of custom property => colour.
 * @return array
 */
function ogal_toggle_clean_palette( $palette ) {
	if ( ! is_array( $palette ) ) {
		return array();
	}

	$clean = array();

	foreach ( $palette as $name => $value ) {
		if ( ! is_string( $name ) || ! is_string( $value ) || ! preg_match( '/^--[A-Za-z0-9_-]+$/', $name ) ) {
			continue;
		}

		$value = trim( $value );

		// Hex, or rgb()/hsl()/oklch() and friends with plain numeric arguments.
		if ( preg_match( '/^#[0-9a-fA-F]{3,8}$/', $value ) || preg_match( '/^(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\([0-9.,%\s\/+-]+\)$/', $value ) ) {
			$clean[ $name ] = $value;
		}
	}

	return $clean;
}

add_action( 'wp_head', 'ogal_toggle_print_color_scheme_head', 1 );
/**
 * Apply the saved (or system) colour scheme before the page paints, and print
 * the dark mode colours.
 */
function ogal_toggle_print_color_scheme_head() {
	$settings = ogal_toggle_get_color_scheme_settings();

	if ( ! $settings || ! apply_filters( 'ogal_toggle_print_color_scheme_script', true ) ) {
		return;
	}

	$palette = ogal_toggle_clean_palette( $settings['palette'] ?? array() );

	if ( $palette ) {
		$declarations = '';

		foreach ( $palette as $name => $value ) {
			$declarations .= $name . ':' . $value . ';';
		}

		// Both values are pattern-matched above, so they can't break out of the rule.
		printf(
			'<style id="ogal-toggle-dark-palette">:root[data-color-scheme="dark"]{%s}</style>' . "\n",
			$declarations // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		);
	}

	$follow_system = ! empty( $settings['followSystem'] );
	$html_class    = Ogal_Toggle_Render::clean_class_names( $settings['htmlClass'] ?? '' );

	// Kept dependency-free and tiny: it runs on every page.
	$script = sprintf(
		'(function(d,s,f,c){try{s=localStorage.getItem("ogal-toggle:color-scheme")}catch(e){}' .
		'if(s!=="on"&&s!=="off"){if(!f)return;s=matchMedia("(prefers-color-scheme: dark)").matches?"on":"off"}' .
		'var k=s==="on"?"dark":"light";d.setAttribute("data-color-scheme",k);d.style.colorScheme=k;' .
		'if(c)c.split(" ").forEach(function(n){d.classList.toggle(n,s==="on")})})(document.documentElement,null,%s,%s);',
		$follow_system ? 'true' : 'false',
		wp_json_encode( $html_class )
	);

	wp_print_inline_script_tag( $script, array( 'id' => 'ogal-toggle-color-scheme' ) );
}
