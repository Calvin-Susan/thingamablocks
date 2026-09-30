<?php
/**
 * Block patterns: ready-made sections that use the Toggle.
 *
 * Pattern markup lives in /patterns as plain block HTML, exported from the
 * editor, so it stays exactly what GenerateBlocks saves.
 *
 * @package ToggleForGenerateBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'init', 'ogal_toggle_register_patterns' );
/**
 * Register the pattern category and patterns.
 */
function ogal_toggle_register_patterns() {
	if ( ! function_exists( 'register_block_pattern' ) || ! defined( 'GENERATEBLOCKS_VERSION' ) ) {
		return;
	}

	register_block_pattern_category(
		'ogal-toggle',
		array( 'label' => __( 'Toggles', 'toggle-for-generateblocks' ) )
	);

	$patterns = array(
		'pricing-toggle' => array(
			'title'       => __( 'Pricing table with monthly/annual toggle', 'toggle-for-generateblocks' ),
			'description' => __( 'Three plans with a segmented toggle that switches between monthly and annual prices.', 'toggle-for-generateblocks' ),
			'keywords'    => array( 'pricing', 'plans', 'monthly', 'annual', 'toggle' ),
		),
	);

	foreach ( $patterns as $slug => $pattern ) {
		$file = OGAL_TOGGLE_DIR . 'patterns/' . $slug . '.html';

		if ( ! is_readable( $file ) ) {
			continue;
		}

		register_block_pattern(
			'ogal-toggle/' . $slug,
			array_merge(
				$pattern,
				array(
					'categories' => array( 'ogal-toggle' ),
					'content'    => file_get_contents( $file ), // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
				)
			)
		);
	}
}
