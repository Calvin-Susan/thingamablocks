<?php
/**
 * Light/dark mode support.
 *
 * A colour-scheme toggle saves the visitor's choice in localStorage. To avoid
 * a flash of the wrong scheme on the next page load, a tiny script in <head>
 * applies the saved choice before the page paints. That script is only printed
 * once a colour-scheme toggle has been saved somewhere on the site.
 *
 * @package ToggleForGenerateBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Option that stores the colour-scheme settings used by the head script:
 * array( 'followSystem' => bool, 'htmlClass' => string ).
 */
const OGAL_TOGGLE_COLOR_SCHEME_OPTION = 'ogal_toggle_color_scheme';

add_action( 'save_post', 'ogal_toggle_detect_color_scheme_toggle', 10, 2 );
/**
 * Remember the colour-scheme settings when a post containing a colour-scheme
 * toggle is saved. This includes GeneratePress Elements and template parts,
 * which is where a site-wide dark mode switch usually lives.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post object.
 */
function ogal_toggle_detect_color_scheme_toggle( $post_id, $post ) {
	if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}

	if ( 'publish' !== $post->post_status || false === strpos( $post->post_content, 'wp:ogal/toggle' ) ) {
		return;
	}

	$settings = ogal_toggle_find_color_scheme_settings( parse_blocks( $post->post_content ) );

	if ( null !== $settings ) {
		update_option( OGAL_TOGGLE_COLOR_SCHEME_OPTION, $settings );
	}
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

add_action( 'wp_head', 'ogal_toggle_print_color_scheme_script', 1 );
/**
 * Apply the saved (or system) colour scheme before the page paints.
 */
function ogal_toggle_print_color_scheme_script() {
	$settings = get_option( OGAL_TOGGLE_COLOR_SCHEME_OPTION );

	if ( ! is_array( $settings ) || ! apply_filters( 'ogal_toggle_print_color_scheme_script', true ) ) {
		return;
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
