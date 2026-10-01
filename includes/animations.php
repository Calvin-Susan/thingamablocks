<?php
/**
 * Entrance animations for GenerateBlocks blocks.
 *
 * The editor adds an "Entrance animation" panel to every GenerateBlocks block
 * and stores the choice in the block's own HTML attributes
 * (data-tmb-animate="fade-up", data-tmb-speed, data-tmb-delay,
 * data-tmb-animate-children), so GenerateBlocks saves and renders them like
 * any other attribute.
 *
 * On the front end nothing loads unless a block on the page uses one. The
 * first time such a block renders, this prints a few lines of CSS that hide
 * animated blocks until they animate in, and loads a ~1 KB script.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'init', 'thingamablocks_register_animation_scripts' );
/**
 * Register the front-end script, so it can be enqueued on demand.
 */
function thingamablocks_register_animation_scripts() {
	$asset_file = THINGAMABLOCKS_DIR . 'build/animations/view.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;

	wp_register_script(
		'thingamablocks-animations',
		plugins_url( 'build/animations/view.js', THINGAMABLOCKS_DIR . 'thingamablocks.php' ),
		$asset['dependencies'],
		$asset['version'],
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);
}

add_action( 'enqueue_block_editor_assets', 'thingamablocks_enqueue_animation_editor' );
/**
 * The "Entrance animation" panel in the block editor.
 */
function thingamablocks_enqueue_animation_editor() {
	$asset_file = THINGAMABLOCKS_DIR . 'build/animations/editor.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;

	wp_enqueue_script(
		'thingamablocks-animations-editor',
		plugins_url( 'build/animations/editor.js', THINGAMABLOCKS_DIR . 'thingamablocks.php' ),
		$asset['dependencies'],
		$asset['version'],
		true
	);

	wp_set_script_translations( 'thingamablocks-animations-editor', 'thingamablocks' );
}

add_filter( 'render_block', 'thingamablocks_animation_render_block', 20, 2 );
/**
 * When the first animated block on a page renders, load the script and put
 * the "hidden until animated" CSS just before it.
 *
 * @param string $content Rendered block.
 * @param array  $block   Parsed block.
 * @return string
 */
function thingamablocks_animation_render_block( $content, $block ) {
	static $printed = false;

	if ( $printed || is_admin() || false === strpos( $content, 'data-tmb-animate' ) ) {
		return $content;
	}

	// Only blocks rendered on the page, not in a REST or feed context.
	if ( wp_is_serving_rest_request() || is_feed() ) {
		return $content;
	}

	$printed = true;

	wp_enqueue_script( 'thingamablocks-animations' );

	return thingamablocks_animation_head_markup() . $content;
}

/**
 * The CSS and one-line script that hide animated blocks until they animate in.
 *
 * - Nothing is hidden unless JavaScript is running (the tmb-animate-js class),
 *   or for visitors who prefer reduced motion.
 * - If the animation script never arrives (blocked, or delayed by an
 *   optimisation plugin), a fail-safe shows everything after 4 seconds.
 *
 * @return string
 */
function thingamablocks_animation_head_markup() {
	$hidden = '.tmb-animate-js [data-tmb-animate]:not([data-tmb-animate-children]):not(.tmb-in),'
		. '.tmb-animate-js [data-tmb-animate-children]:not(.tmb-in)>*';

	$failsafe = '.tmb-animate-js:not(.tmb-animate-ready) [data-tmb-animate]:not([data-tmb-animate-children]):not(.tmb-in),'
		. '.tmb-animate-js:not(.tmb-animate-ready) [data-tmb-animate-children]:not(.tmb-in)>*';

	$css = '@media (prefers-reduced-motion:no-preference){'
		. $hidden . '{opacity:0}'
		. $failsafe . '{animation:tmb-animate-failsafe 0s 4s forwards}'
		. '}@keyframes tmb-animate-failsafe{to{opacity:1}}';

	$style = '<style id="tmb-animate-css">' . $css . '</style>';

	$script = wp_get_inline_script_tag(
		'document.documentElement.classList.add("tmb-animate-js")',
		array( 'id' => 'tmb-animate-js' )
	);

	return apply_filters( 'thingamablocks_animation_head_markup', $style . $script );
}
