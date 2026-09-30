<?php
/**
 * Plugin Name:       Toggle for GenerateBlocks
 * Description:       A Toggle block for GenerateBlocks. It's built from native GenerateBlocks blocks, so you style it with the GB Styles panel, and it can show/hide elements, switch light/dark mode, or toggle classes.
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Requires Plugins:  generateblocks
 * Author:            OGAL Web Design
 * Author URI:        https://ogalweb.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       toggle-for-generateblocks
 *
 * @package ToggleForGenerateBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'OGAL_TOGGLE_VERSION', '0.1.0' );
define( 'OGAL_TOGGLE_DIR', plugin_dir_path( __FILE__ ) );

require_once OGAL_TOGGLE_DIR . 'includes/class-render.php';
require_once OGAL_TOGGLE_DIR . 'includes/color-scheme.php';
require_once OGAL_TOGGLE_DIR . 'includes/patterns.php';

add_action( 'init', 'ogal_toggle_register_block' );
/**
 * Register the Toggle block from its built block.json.
 */
function ogal_toggle_register_block() {
	if ( ! file_exists( OGAL_TOGGLE_DIR . 'build/toggle/block.json' ) ) {
		return;
	}

	register_block_type(
		OGAL_TOGGLE_DIR . 'build/toggle',
		array(
			'render_callback' => array( 'Ogal_Toggle_Render', 'render' ),
		)
	);
}

add_filter( 'block_categories_all', 'ogal_toggle_block_category', 20 );
/**
 * Make sure the GenerateBlocks category exists, so the Toggle sits with the GB
 * blocks. GenerateBlocks registers it itself; this only covers GB being
 * inactive, so the block never ends up uncategorised.
 *
 * @param array $categories Registered categories.
 * @return array
 */
function ogal_toggle_block_category( $categories ) {
	foreach ( $categories as $category ) {
		if ( 'generateblocks' === $category['slug'] ) {
			return $categories;
		}
	}

	$categories[] = array(
		'slug'  => 'generateblocks',
		'title' => __( 'GenerateBlocks', 'toggle-for-generateblocks' ),
	);

	return $categories;
}

add_action( 'admin_notices', 'ogal_toggle_missing_generateblocks_notice' );
/**
 * The Toggle is assembled from GenerateBlocks blocks, so it needs GB 2.x.
 * WordPress enforces "Requires Plugins" for activation; this catches GB being
 * deactivated later, or an old 1.x version.
 */
function ogal_toggle_missing_generateblocks_notice() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	if ( defined( 'GENERATEBLOCKS_VERSION' ) && version_compare( GENERATEBLOCKS_VERSION, '2.0.0', '>=' ) ) {
		return;
	}

	printf(
		'<div class="notice notice-warning"><p>%s</p></div>',
		esc_html__( 'Toggle for GenerateBlocks needs GenerateBlocks 2.0 or newer to be active.', 'toggle-for-generateblocks' )
	);
}
