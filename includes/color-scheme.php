<?php
/**
 * Light/dark mode support.
 *
 * A colour-scheme toggle saves the visitor's choice in localStorage. To avoid
 * a flash of the wrong scheme on the next page load, a tiny script in <head>
 * applies the saved choice before the page paints. The site's own CSS does the
 * rest: colours written with light-dark() follow the color-scheme it sets.
 *
 * It's only printed while a published post (page, GeneratePress Element,
 * template part…) contains a colour-scheme toggle. Each such post's settings
 * are tracked separately, so removing the toggle or trashing the post turns
 * them off again.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option storing colour-scheme settings per post:
 * array( post_id => array( 'followSystem', 'htmlClass', 'modified' ) ).
 */
const THINGAMABLOCKS_COLOR_SCHEME_OPTION = 'thingamablocks_color_scheme';

add_action( 'save_post', 'thingamablocks_track_color_scheme_toggle', 10, 2 );
/**
 * Record (or forget) a post's colour-scheme toggle settings when it's saved.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 */
function thingamablocks_track_color_scheme_toggle( $post_id, $post ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	/*
	 * The <head> script and <html> class affect every page, so only people who
	 * can change the site's appearance can set them. A dark mode toggle saved
	 * by anyone else still works on its page; it just doesn't change the
	 * site-wide settings.
	 */
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}

	$settings = null;

	if ( 'publish' === $post->post_status && false !== strpos( $post->post_content, 'wp:thingamablocks/toggle' ) ) {
		$settings = thingamablocks_find_color_scheme_settings( parse_blocks( $post->post_content ) );
	}

	thingamablocks_set_color_scheme_entry( $post_id, $settings );
}

add_action( 'deleted_post', 'thingamablocks_forget_color_scheme_toggle' );
add_action( 'trashed_post', 'thingamablocks_forget_color_scheme_toggle' );
/**
 * Forget a post's colour-scheme toggle when it's trashed or deleted.
 *
 * @param int $post_id Post ID.
 */
function thingamablocks_forget_color_scheme_toggle( $post_id ) {
	thingamablocks_set_color_scheme_entry( $post_id, null );
}

/**
 * Store or remove one post's entry.
 *
 * @param int        $post_id  Post ID.
 * @param array|null $settings Settings, or null to remove.
 */
function thingamablocks_set_color_scheme_entry( $post_id, $settings ) {
	$entries = get_option( THINGAMABLOCKS_COLOR_SCHEME_OPTION, array() );

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
		delete_option( THINGAMABLOCKS_COLOR_SCHEME_OPTION );
	} else {
		update_option( THINGAMABLOCKS_COLOR_SCHEME_OPTION, $entries, true );
	}
}

/**
 * The settings in use: the most recently saved colour-scheme toggle wins.
 *
 * @return array|null
 */
function thingamablocks_get_color_scheme_settings() {
	$entries = get_option( THINGAMABLOCKS_COLOR_SCHEME_OPTION, array() );

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
function thingamablocks_find_color_scheme_settings( $blocks ) {
	foreach ( $blocks as $block ) {
		if ( 'thingamablocks/toggle' === $block['blockName'] && 'colorScheme' === ( $block['attrs']['action'] ?? '' ) ) {
			$config = Thingamablocks_Toggle_Render::config( $block['attrs'] );

			return array(
				'followSystem' => $config['followSystem'],
				'htmlClass'    => $config['htmlClass'],
			);
		}

		if ( ! empty( $block['innerBlocks'] ) ) {
			$found = thingamablocks_find_color_scheme_settings( $block['innerBlocks'] );

			if ( null !== $found ) {
				return $found;
			}
		}
	}

	return null;
}

add_action( 'wp_head', 'thingamablocks_print_color_scheme_head', 1 );
/**
 * Apply the saved (or system) colour scheme before the page paints.
 */
function thingamablocks_print_color_scheme_head() {
	$settings = thingamablocks_get_color_scheme_settings();

	if ( ! $settings || ! apply_filters( 'thingamablocks_print_color_scheme_script', true ) ) {
		return;
	}

	$follow_system = ! empty( $settings['followSystem'] );
	$html_class    = Thingamablocks_Toggle_Render::clean_class_names( $settings['htmlClass'] ?? '' );

	// Kept dependency-free and tiny: it runs on every page.
	$script = sprintf(
		'(function(d,s,f,c){try{s=localStorage.getItem("tmb-toggle:color-scheme")}catch(e){}' .
		'if(s!=="on"&&s!=="off"){if(!f)return;s=matchMedia("(prefers-color-scheme: dark)").matches?"on":"off"}' .
		'var k=s==="on"?"dark":"light";d.setAttribute("data-color-scheme",k);d.style.colorScheme=k;' .
		'if(c)c.split(" ").forEach(function(n){d.classList.toggle(n,s==="on")})})(document.documentElement,null,%s,%s);',
		$follow_system ? 'true' : 'false',
		wp_json_encode( $html_class )
	);

	wp_print_inline_script_tag( $script, array( 'id' => 'tmb-toggle-color-scheme' ) );
}
