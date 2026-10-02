<?php
/**
 * Entrance animations for GenerateBlocks blocks.
 *
 * The editor adds an "Entrance animation" panel to every GenerateBlocks block
 * and stores the choice in the block's own HTML attributes
 * (data-tmb-animate="fade-up", data-tmb-speed, data-tmb-delay,
 * data-tmb-animate-children), so GenerateBlocks saves and renders them like
 * any other attribute. (To play a section's animations again from a button
 * of your own: window.tmbAnimate.replay( element ).)
 *
 * On the front end nothing loads unless a block on the page uses one. Then
 * this prints a few lines of CSS that hide animated blocks until they animate
 * in (in <head> where possible), and loads a ~1.6 KB (gzipped) script.
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
	// Switched off in Settings → Thingamablocks: no panel (animated blocks still animate).
	if ( ! thingamablocks_is_enabled( 'animations' ) ) {
		return;
	}

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

add_action( 'wp_head', 'thingamablocks_animation_print_head', 2 );
/**
 * Print the hiding CSS in <head> when this page is known to have animated
 * blocks: in <head> it can't upset any block's layout (inside a container it
 * would count as a child for :first-child rules). That's known when a block
 * theme has already rendered the page (block templates render before <head>),
 * or when the post being viewed uses an animation. Any other page with an
 * animated block (from a GeneratePress Element, a widget, an archive) gets it
 * just before that block instead; pages without one get nothing at all.
 */
function thingamablocks_animation_print_head() {
	if ( ! apply_filters( 'thingamablocks_animations_print_css', true ) ) {
		return;
	}

	$post = is_singular() ? get_queried_object() : null;
	$used = thingamablocks_animation_seen() || ( $post instanceof WP_Post && thingamablocks_animation_in( $post->post_content ) );

	if ( ! $used ) {
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

/**
 * Whether an animated block was rendered before <head> was printed (block
 * themes render the whole template first).
 *
 * @param bool|null $set Mark as seen.
 * @return bool
 */
function thingamablocks_animation_seen( $set = null ) {
	static $seen = false;

	if ( null !== $set ) {
		$seen = (bool) $set;
	}

	return $seen;
}

/**
 * Whether some markup has an animated block.
 *
 * @param string $content Markup.
 * @return bool
 */
function thingamablocks_animation_in( $content ) {
	return false !== strpos( $content, 'data-tmb-animate' );
}

add_filter( 'render_block', 'thingamablocks_animation_render_block', 20 );
/**
 * When an animated block renders, load the script (in the footer, deferred).
 * If the CSS wasn't printed in <head>, put it just before the block instead.
 *
 * @param string $content Rendered block.
 * @return string
 */
function thingamablocks_animation_render_block( $content ) {
	if ( is_admin() || ! thingamablocks_animation_in( $content ) ) {
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

	// Rendered before <head> was printed (block themes): <head> will print it,
	// unless a filter has turned that off, in which case print it here.
	if ( ! did_action( 'wp_head' ) && apply_filters( 'thingamablocks_animations_print_css', true ) ) {
		thingamablocks_animation_seen( true );
		return $content;
	}

	// Rendered while <head> is being printed (e.g. an SEO plugin building a
	// description from the content): not part of the page's body.
	if ( doing_action( 'wp_head' ) ) {
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
