<?php
/**
 * Plugin Name:       Thingamablocks
 * Description:       A completely unnecessary ultimate add-ons power-pack for GenerateBlocks.
 * Version:           0.1.0
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

define( 'THINGAMABLOCKS_VERSION', '0.1.0' );
define( 'THINGAMABLOCKS_DIR', plugin_dir_path( __FILE__ ) );

require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-sanitize.php';
require_once THINGAMABLOCKS_DIR . 'includes/kses.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-toggle-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-countdown-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-marquee-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-dropdown-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-breadcrumbs-trail.php';
require_once THINGAMABLOCKS_DIR . 'includes/class-thingamablocks-breadcrumbs-render.php';
require_once THINGAMABLOCKS_DIR . 'includes/color-scheme.php';
require_once THINGAMABLOCKS_DIR . 'includes/patterns.php';
require_once THINGAMABLOCKS_DIR . 'includes/animations.php';
require_once THINGAMABLOCKS_DIR . 'includes/mask.php';

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

add_action( 'enqueue_block_editor_assets', 'thingamablocks_breadcrumbs_editor_data' );
/**
 * Tell the Breadcrumbs block's settings which SEO plugin is active.
 */
function thingamablocks_breadcrumbs_editor_data() {
	wp_add_inline_script(
		generate_block_asset_handle( 'thingamablocks/breadcrumbs', 'editorScript' ),
		'window.tmbBreadcrumbsEditor = ' . wp_json_encode( array( 'plugin' => Thingamablocks_Breadcrumbs_Trail::seo_plugin() ) ) . ';',
		'before'
	);
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
