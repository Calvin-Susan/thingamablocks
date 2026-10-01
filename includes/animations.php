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

/**
 * Set once any published content uses an entrance animation, so the small
 * hiding CSS is only printed in <head> on sites that use them.
 */
const THINGAMABLOCKS_ANIMATIONS_OPTION = 'thingamablocks_animations_used';

add_action( 'save_post', 'thingamablocks_animation_note_usage', 10, 2 );
/**
 * Remember that the site uses entrance animations.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post.
 */
function thingamablocks_animation_note_usage( $post_id, $post ) {
	if ( wp_is_post_revision( $post_id ) || get_option( THINGAMABLOCKS_ANIMATIONS_OPTION ) ) {
		return;
	}

	if ( false !== strpos( $post->post_content, 'data-tmb-animate' ) ) {
		update_option( THINGAMABLOCKS_ANIMATIONS_OPTION, 1, true );
	}
}

add_action( 'wp_head', 'thingamablocks_animation_print_head', 2 );
/**
 * Print the hiding CSS in <head>, where it can't upset any block's layout
 * (inside a container it would count as a child for :first-child rules and
 * "one by one" timing). It's about 600 bytes and does nothing on pages
 * without animated blocks.
 */
function thingamablocks_animation_print_head() {
	if ( ! get_option( THINGAMABLOCKS_ANIMATIONS_OPTION ) || ! apply_filters( 'thingamablocks_animations_print_css', true ) ) {
		return;
	}

	thingamablocks_animation_markup_printed( true );

	echo thingamablocks_animation_head_markup(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static CSS and a core-built script tag.
}

/**
 * Whether the hiding CSS has been printed on this page.
 *
 * @param bool|null $set Mark as printed.
 * @return bool
 */
function thingamablocks_animation_markup_printed( $set = null ) {
	static $printed = false;

	if ( null !== $set ) {
		$printed = (bool) $set;
	}

	return $printed;
}

add_filter( 'render_block', 'thingamablocks_animation_render_block', 20, 2 );
/**
 * When an animated block renders, make sure the script is loaded. If the CSS
 * wasn't printed in <head> (the first animated content on a site, or content
 * from somewhere that isn't a post), put it just before the block instead and
 * remember for next time.
 *
 * @param string $content Rendered block.
 * @param array  $block   Parsed block.
 * @return string
 */
function thingamablocks_animation_render_block( $content, $block ) {
	if ( is_admin() || false === strpos( $content, 'data-tmb-animate' ) ) {
		return $content;
	}

	// Only blocks rendered on the page, not in a REST or feed context.
	if ( wp_is_serving_rest_request() || is_feed() ) {
		return $content;
	}

	wp_enqueue_script( 'thingamablocks-animations' );

	if ( thingamablocks_animation_markup_printed() ) {
		return $content;
	}

	if ( ! get_option( THINGAMABLOCKS_ANIMATIONS_OPTION ) ) {
		update_option( THINGAMABLOCKS_ANIMATIONS_OPTION, 1, true );
	}

	// Rendered before <head> was printed (block themes): <head> will print it.
	if ( ! did_action( 'wp_head' ) ) {
		return $content;
	}

	thingamablocks_animation_markup_printed( true );

	return thingamablocks_animation_head_markup() . $content;
}

/**
 * The CSS and one-line script that hide animated blocks until they animate in.
 *
 * - Nothing is hidden unless JavaScript is running (html.tmb-animate-js) and
 *   only on screens, for visitors who haven't asked for reduced motion.
 * - Before the animation script arrives, every animated block is hidden, with
 *   a fail-safe that shows them after 4 seconds if the script never comes.
 * - After it arrives (html.tmb-animate-ready), only blocks the script is
 *   watching (.tmb-wait) are hidden, so nothing can get stuck invisible.
 *
 * @return string
 */
function thingamablocks_animation_head_markup() {
	$before = '.tmb-animate-js:not(.tmb-animate-ready) [data-tmb-animate]:not([data-tmb-animate-children]):not(.tmb-in),'
		. '.tmb-animate-js:not(.tmb-animate-ready) [data-tmb-animate-children]:not(.tmb-in)>*';

	$after = '.tmb-animate-ready .tmb-wait[data-tmb-animate]:not([data-tmb-animate-children]):not(.tmb-in),'
		. '.tmb-animate-ready .tmb-wait[data-tmb-animate-children]:not(.tmb-in)>*';

	$css = '@media screen and (prefers-reduced-motion:no-preference){'
		. $before . '{opacity:0;animation:tmb-animate-failsafe 0s 4s forwards}'
		. $after . '{opacity:0}'
		. '}@keyframes tmb-animate-failsafe{to{opacity:1}}';

	$style = '<style id="tmb-animate-css">' . $css . '</style>';

	$script = wp_get_inline_script_tag(
		'document.documentElement.classList.add("tmb-animate-js")',
		array( 'id' => 'tmb-animate-js' )
	);

	return apply_filters( 'thingamablocks_animation_head_markup', $style . $script );
}
