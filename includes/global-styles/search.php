<?php
/**
 * Default Global Styles for the Search block's starting layouts
 * (src/search/templates.js). Base classes before their modifiers.
 *
 * Buttons set their hover, focus and pressed colours too: themes give every
 * <button> one (GeneratePress: a dark grey background on button:hover,
 * button:focus, button:active). A class with a pseudo-class outranks those.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// A function, so these helpers stay local (PHP files included at the top
// level would otherwise make them globals).
return static function () {
	$accent     = '#1e73be';
	$text       = '#222222';
	$subtle     = '#b2b2be';
	$surface    = '#f7f8f9';
	$border     = '#f0f0f0';
	$background = '#ffffff';

	$radius = static function ( $value ) {
		return array(
			'borderTopLeftRadius'     => $value,
			'borderTopRightRadius'    => $value,
			'borderBottomRightRadius' => $value,
			'borderBottomLeftRadius'  => $value,
		);
	};

	$padding = static function ( $y, $x = null ) {
		$x = null === $x ? $y : $x;

		return array(
			'paddingTop'    => $y,
			'paddingRight'  => $x,
			'paddingBottom' => $y,
			'paddingLeft'   => $x,
		);
	};

	$border_all = static function ( $width, $style, $value ) {
		return array(
			'borderTopWidth'    => $width,
			'borderRightWidth'  => $width,
			'borderBottomWidth' => $width,
			'borderLeftWidth'   => $width,
			'borderTopStyle'    => $style,
			'borderRightStyle'  => $style,
			'borderBottomStyle' => $style,
			'borderLeftStyle'   => $style,
			'borderTopColor'    => $value,
			'borderRightColor'  => $value,
			'borderBottomColor' => $value,
			'borderLeftColor'   => $value,
		);
	};

	$focus_ring = static function ( $offset ) use ( $accent ) {
		return array(
			'outlineWidth'  => '2px',
			'outlineStyle'  => 'solid',
			'outlineColor'  => $accent,
			'outlineOffset' => $offset,
		);
	};

	// Separate selectors rather than :is( … ): same specificity, and the
	// comma list compiles cleanly.
	$active = '&:hover, &:focus, &:active';

	$accent_button = array(
		'backgroundColor' => $accent,
		'color'           => $background,
		$active           => array(
			'backgroundColor' => $text,
			'color'           => $background,
		),
	);

	$plain_button = array(
		'backgroundColor' => 'transparent',
		'color'           => $text,
		$active           => array(
			'backgroundColor' => $surface,
			'color'           => $accent,
		),
	);

	$round_icon = array_merge(
		array(
			'flexShrink' => '0',
			'width'      => '2.5rem',
			'height'     => '2.5rem',
		),
		$padding( '0' ),
		$radius( '999px' )
	);

	return array(
		// The Element around the field and button (Bar), or around the
		// toggle and its pop-up field (Icon that opens).
		'tmb-search__wrapper'           => array(
			'display' => 'flex',
		),
		'tmb-search__wrapper--bar'      => array(
			'alignItems' => 'stretch',
			'columnGap'  => '0.5rem',
		),
		'tmb-search__wrapper--expand'   => array(
			'position' => 'relative',
			'display'  => 'inline-flex',
		),

		// The box around the input.
		'tmb-search__field'             => array(
			'display'         => 'flex',
			'alignItems'      => 'center',
			'columnGap'       => '0.5rem',
			'backgroundColor' => $background,
			'color'           => $text,
			'&:focus-within'  => $focus_ring( '2px' ),
		),
		'tmb-search__field--bar'        => array_merge(
			array( 'flexGrow' => '1' ),
			$padding( '0', '1rem' ),
			$radius( '0.5rem' ),
			$border_all( '1px', 'solid', $subtle )
		),
		'tmb-search__field--pill'       => array_merge(
			$padding( '0.3125rem' ),
			array( 'paddingLeft' => '1.25rem' ),
			$radius( '999px' ),
			$border_all( '1px', 'solid', $subtle )
		),
		'tmb-search__field--underline'  => array(
			'backgroundColor'   => 'transparent',
			'borderBottomWidth' => '2px',
			'borderBottomStyle' => 'solid',
			'borderBottomColor' => $text,
			'&:focus-within'    => array_merge(
				$focus_ring( '4px' ),
				array( 'borderBottomColor' => $accent )
			),
		),
		'tmb-search__field--expand'     => array_merge(
			array(
				'position' => 'absolute',
				'zIndex'   => '100',
				'top'      => 'calc(100% + 0.5rem)',
				'right'    => '0',
				'width'    => '20rem',
				'maxWidth' => 'calc(100vw - 2rem)',
			),
			$padding( '0.3125rem' ),
			array( 'paddingLeft' => '1rem' ),
			$radius( '0.5rem' ),
			$border_all( '1px', 'solid', $border ),
			array( 'boxShadow' => '0 12px 32px -12px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.06)' )
		),

		// The search button, and the Icon that opens layout's toggle.
		'tmb-search__button'            => array_merge(
			array(
				'display'        => 'inline-flex',
				'alignItems'     => 'center',
				'justifyContent' => 'center',
				'columnGap'      => '0.5rem',
			),
			$border_all( '0', 'none', 'transparent' ),
			array(
				'cursor'          => 'pointer',
				'fontWeight'      => '600',
				'lineHeight'      => '1',
				'transition'      => 'background-color 0.2s ease, color 0.2s ease',
				'&:focus-visible' => $focus_ring( '2px' ),
				'.gb-shape svg'   => array(
					'width'  => '1.25em',
					'height' => '1.25em',
				),
			)
		),
		'tmb-search__button--bar'       => array_merge(
			$padding( '0', '1.25rem' ),
			$radius( '0.5rem' ),
			$accent_button
		),
		'tmb-search__button--pill'      => array_merge( $round_icon, $accent_button ),
		'tmb-search__button--underline' => array_merge( $round_icon, $plain_button ),
		'tmb-search__button--toggle'    => array_merge(
			array(
				'width'  => '2.75rem',
				'height' => '2.75rem',
			),
			$padding( '0' ),
			$radius( '999px' ),
			$plain_button,
			array(
				'&[aria-expanded="true"]' => array(
					'backgroundColor' => $surface,
					'color'           => $accent,
				),
			)
		),
		'tmb-search__button--expand'    => array_merge(
			array( 'flexShrink' => '0' ),
			$padding( '0.625rem', '1rem' ),
			$radius( '0.375rem' ),
			$accent_button
		),
	);
};
