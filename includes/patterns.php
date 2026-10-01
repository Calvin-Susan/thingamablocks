<?php
/**
 * Block patterns: ready-made sections that use the Toggle.
 *
 * Pattern markup lives in /patterns as PHP files: block markup exported from
 * the editor (so it stays exactly what GenerateBlocks saves), with the visible
 * text wrapped in translation functions. Patterns are registered with
 * 'filePath', so WordPress only includes a file when that pattern's content is
 * actually needed (inserter, editor), not on every request.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'init', 'thingamablocks_register_patterns' );
/**
 * Register the pattern category and patterns.
 */
function thingamablocks_register_patterns() {
	if ( ! function_exists( 'register_block_pattern' ) || ! defined( 'GENERATEBLOCKS_VERSION' ) ) {
		return;
	}

	register_block_pattern_category(
		'thingamablocks-toggles',
		array( 'label' => __( 'Toggles', 'thingamablocks' ) )
	);

	register_block_pattern_category(
		'thingamablocks-countdowns',
		array( 'label' => __( 'Countdowns', 'thingamablocks' ) )
	);

	register_block_pattern_category(
		'thingamablocks-marquees',
		array( 'label' => __( 'Marquees', 'thingamablocks' ) )
	);

	$patterns = array(
		'pricing-toggle'   => array(
			'title'       => __( 'Pricing table with monthly/annual toggle', 'thingamablocks' ),
			'description' => __( 'Three plans with a segmented toggle that switches between monthly and annual prices.', 'thingamablocks' ),
			'keywords'    => array( 'pricing', 'plans', 'monthly', 'annual', 'toggle' ),
			'categories'  => array( 'thingamablocks-toggles' ),
		),
		'sale-banner'      => array(
			'title'       => __( 'Sale banner with countdown', 'thingamablocks' ),
			'description' => __( 'A slim banner with an inline countdown. The whole banner disappears when the sale ends.', 'thingamablocks' ),
			'keywords'    => array( 'sale', 'banner', 'countdown', 'offer', 'promo' ),
			'categories'  => array( 'thingamablocks-countdowns' ),
		),
		'logo-marquee'     => array(
			'title'       => __( 'Logo strip: “Trusted by…”', 'thingamablocks' ),
			'description' => __( 'A small heading above an endlessly scrolling row of logos. Swap the placeholders for your clients’ logos.', 'thingamablocks' ),
			'keywords'    => array( 'logos', 'clients', 'trusted by', 'marquee', 'partners' ),
			'categories'  => array( 'thingamablocks-marquees' ),
		),
		'launch-countdown' => array(
			'title'       => __( 'Launch countdown', 'thingamablocks' ),
			'description' => __( 'A “coming soon” section with large countdown numbers and a message for when it’s live.', 'thingamablocks' ),
			'keywords'    => array( 'launch', 'coming soon', 'countdown', 'timer' ),
			'categories'  => array( 'thingamablocks-countdowns' ),
		),
	);

	foreach ( $patterns as $slug => $pattern ) {
		$file = THINGAMABLOCKS_DIR . 'patterns/' . $slug . '.php';

		if ( ! is_readable( $file ) ) {
			continue;
		}

		register_block_pattern(
			'thingamablocks/' . $slug,
			array_merge( $pattern, array( 'filePath' => $file ) )
		);
	}
}

/**
 * Encode a string for use inside a JSON string in a block comment, without the
 * surrounding quotes. Used by the pattern files for translated attribute values
 * (e.g. "ariaLabel"). JSON_HEX_TAG / JSON_HEX_AMP keep "<", ">" and "&" from
 * breaking out of the block comment.
 *
 * @param string $text Text to encode.
 * @return string
 */
function thingamablocks_pattern_json_string( $text ) {
	return substr( (string) wp_json_encode( (string) $text, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE ), 1, -1 );
}
