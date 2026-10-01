<?php
/**
 * Block patterns: ready-made sections that use the Toggle.
 *
 * Pattern markup lives in /patterns as plain block HTML, exported from the
 * editor, so it stays exactly what GenerateBlocks saves.
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
		'launch-countdown' => array(
			'title'       => __( 'Launch countdown', 'thingamablocks' ),
			'description' => __( 'A “coming soon” section with large countdown numbers and a message for when it’s live.', 'thingamablocks' ),
			'keywords'    => array( 'launch', 'coming soon', 'countdown', 'timer' ),
			'categories'  => array( 'thingamablocks-countdowns' ),
		),
	);

	foreach ( $patterns as $slug => $pattern ) {
		$file = THINGAMABLOCKS_DIR . 'patterns/' . $slug . '.html';

		if ( ! is_readable( $file ) ) {
			continue;
		}

		register_block_pattern(
			'thingamablocks/' . $slug,
			array_merge(
				$pattern,
				array(
					'content' => file_get_contents( $file ), // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
				)
			)
		);
	}
}
