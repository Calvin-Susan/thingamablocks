<?php
/**
 * Image masks for the GenerateBlocks Image block.
 *
 * Editor only: the "Mask" panel writes mask-* CSS into the block's
 * GenerateBlocks styles, and GenerateBlocks compiles and prints it with the
 * rest of the block's CSS. Nothing from this feature loads on the front end.
 * The shape is an SVG cleaned in the editor and stored, encoded, in that CSS;
 * it's never uploaded to the Media Library.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'enqueue_block_editor_assets', 'thingamablocks_enqueue_mask_editor' );
/**
 * The "Mask" panel in the block editor.
 */
function thingamablocks_enqueue_mask_editor() {
	// Switched off in Settings → Thingamablocks: no panel (existing masks stay).
	if ( ! thingamablocks_is_enabled( 'masks' ) ) {
		return;
	}

	$asset_file = THINGAMABLOCKS_DIR . 'build/mask/editor.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;
	$base  = plugins_url( 'build/mask/', THINGAMABLOCKS_DIR . 'thingamablocks.php' );

	wp_enqueue_script(
		'thingamablocks-mask-editor',
		$base . 'editor.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);

	wp_set_script_translations( 'thingamablocks-mask-editor', 'thingamablocks' );

	if ( file_exists( THINGAMABLOCKS_DIR . 'build/mask/editor.css' ) ) {
		wp_enqueue_style( 'thingamablocks-mask-editor', $base . 'editor.css', array(), $asset['version'] );
	}
}
