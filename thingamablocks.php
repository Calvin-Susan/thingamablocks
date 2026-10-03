<?php
/**
 * Plugin Name:       Thingamablocks
 * Description:       A completely unnecessary ultimate add-ons power-pack for GenerateBlocks.
 * Version:           1.1.0
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Requires Plugins:  generateblocks
 * Author:            OGAL Web Design
 * Author URI:        https://ogalweb.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       thingamablocks
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'THINGAMABLOCKS_VERSION', '1.1.0' );
define( 'THINGAMABLOCKS_DIR', plugin_dir_path( __FILE__ ) );

require_once THINGAMABLOCKS_DIR . 'includes/settings.php';
require_once THINGAMABLOCKS_DIR . 'includes/speeds.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-sanitize.php';
require_once THINGAMABLOCKS_DIR . 'includes/kses.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-toggle-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-countdown-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-marquee-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-dropdown-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-breadcrumbs-trail.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-breadcrumbs-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-html.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-search-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-toc-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/color-scheme.php';
require_once THINGAMABLOCKS_DIR . 'includes/animations.php';
require_once THINGAMABLOCKS_DIR . 'includes/mask.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-faq-schema.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-video-background.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-global-styles.php';

add_action( 'init', 'thingamablocks_register_blocks' );
/**
 * Register the blocks from their built block.json files.
 */
function thingamablocks_register_blocks() {
	$blocks = array(
		'toggle'      => array( 'Thingamablocks_Toggle_Render', 'render' ),
		'countdown'   => array( 'Thingamablocks_Countdown_Render', 'render' ),
		'marquee'     => array( 'Thingamablocks_Marquee_Render', 'render' ),
		'dropdown'    => array( 'Thingamablocks_Dropdown_Render', 'render' ),
		'breadcrumbs' => array( 'Thingamablocks_Breadcrumbs_Render', 'render' ),
		'search'      => array( 'Thingamablocks_Search_Render', 'render' ),
		'toc'         => array( 'Thingamablocks_Toc_Render', 'render' ),
	);

	foreach ( $blocks as $folder => $render ) {
		if ( ! file_exists( THINGAMABLOCKS_DIR . "build/{$folder}/block.json" ) ) {
			continue;
		}

		register_block_type(
			THINGAMABLOCKS_DIR . "build/{$folder}",
			array( 'render_callback' => $render )
		);
	}
}

add_action( 'wp_enqueue_scripts', 'thingamablocks_head_block_styles' );
/**
 * Load the blocks' small front-end stylesheets in <head> on a post that uses
 * them. WordPress otherwise adds a block's stylesheet when the block renders,
 * which on a classic theme (GeneratePress) can be after <head>, so the block
 * shows unstyled for a moment. Blocks outside the post (an Element, a widget)
 * still get theirs the usual way.
 */
function thingamablocks_head_block_styles() {
	$post = is_singular() ? get_post() : null;

	if ( ! $post || false === strpos( $post->post_content, '<!-- wp:thingamablocks/' ) ) {
		return;
	}

	foreach ( array( 'toggle', 'dropdown', 'breadcrumbs', 'search', 'toc' ) as $name ) {
		$handle = generate_block_asset_handle( 'thingamablocks/' . $name, 'viewStyle' );

		if ( has_block( 'thingamablocks/' . $name, $post ) && wp_style_is( $handle, 'registered' ) ) {
			wp_enqueue_style( $handle );
		}
	}
}

add_action( 'admin_init', 'thingamablocks_add_options' );
/**
 * Create the options read on the front end, so a missing one doesn't cost a
 * database query on every page view.
 */
function thingamablocks_add_options() {
	foreach ( array( 'thingamablocks_video_hosts', 'thingamablocks_speeds', 'thingamablocks_color_scheme' ) as $option ) {
		if ( false === get_option( $option ) ) {
			add_option( $option, array(), '', true );
		}
	}
}

add_filter( 'block_categories_all', 'thingamablocks_block_category', 20 );
/**
 * Make sure the GenerateBlocks category exists, so the Toggle sits with the GB
 * blocks. GenerateBlocks registers it itself; this only covers GB being
 * inactive, so the block never ends up uncategorised.
 *
 * @param array $categories Registered categories.
 * @return array
 */
function thingamablocks_block_category( $categories ) {
	foreach ( $categories as $category ) {
		if ( 'generateblocks' === $category['slug'] ) {
			return $categories;
		}
	}

	$categories[] = array(
		'slug'  => 'generateblocks',
		'title' => __( 'GenerateBlocks', 'thingamablocks' ),
	);

	return $categories;
}

add_action( 'admin_notices', 'thingamablocks_missing_generateblocks_notice' );
/**
 * The Toggle is assembled from GenerateBlocks blocks, so it needs GB 2.x.
 * WordPress enforces "Requires Plugins" for activation; this catches GB being
 * deactivated later, or an old 1.x version.
 */
function thingamablocks_missing_generateblocks_notice() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	if ( defined( 'GENERATEBLOCKS_VERSION' ) && version_compare( GENERATEBLOCKS_VERSION, '2.0.0', '>=' ) ) {
		return;
	}

	printf(
		'<div class="notice notice-warning"><p>%s</p></div>',
		esc_html__( 'Thingamablocks needs GenerateBlocks 2.0 or newer to be active.', 'thingamablocks' )
	);
}
