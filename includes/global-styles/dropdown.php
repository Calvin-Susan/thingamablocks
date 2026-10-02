<?php
/**
 * Default Global Styles for the Dropdown's starting layouts
 * (src/dropdown/templates.js). Base classes before their modifiers.
 *
 * Only the look is here. Positioning (below or above the button, as wide as
 * the button, kept on screen) and the closed state stay in the block's own
 * stylesheet, script and renderer, so they keep working if a class is
 * restyled or removed.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// A function, so these helpers stay local (PHP files included at the top
// level would otherwise make them globals).
return static function () {
	// Hovered, focused or open (a variable keeps the array aligned).
	$hover_open = '&:is(:hover, :focus-visible), &[aria-expanded="true"]';

	$accent     = '#1e73be';
	$text       = '#222222';
	$muted      = '#575760';
	$surface    = '#f7f8f9';
	$border     = '#f0f0f0';
	$background = '#ffffff';

	// Shared by the button and the drawer, so they look like a pair.
	$corner = '0.5rem';

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

	$no_margin = array(
		'marginTop'    => '0',
		'marginRight'  => '0',
		'marginBottom' => '0',
		'marginLeft'   => '0',
	);

	$focus_ring = array(
		'outlineWidth'  => '2px',
		'outlineStyle'  => 'solid',
		'outlineColor'  => $accent,
		'outlineOffset' => '2px',
	);

	return array(
		// The button that opens and closes it (a GB Text block set to <button>).
		// The :hover/:focus-visible rule is two classes' worth of specificity,
		// so it beats the theme's button:hover / button:focus colours.
		'tmb-dropdown__button'          => array_merge(
			array(
				'display'        => 'inline-flex',
				'alignItems'     => 'center',
				'justifyContent' => 'space-between',
				'columnGap'      => '0.75rem',
			),
			$padding( '0.75rem', '1.25rem' ),
			$radius( $corner ),
			$border_all( '0', 'none', 'transparent' ),
			array(
				'backgroundColor' => $accent,
				'color'           => $background,
				'fontSize'        => '1rem',
				'fontWeight'      => '600',
				'lineHeight'      => '1.2',
				'cursor'          => 'pointer',
				'transition'      => 'background-color 0.2s ease',
			),
			array(
				$hover_open                             => array(
					'backgroundColor' => $text,
					'color'           => $background,
				),
				'&:focus-visible'                       => $focus_ring,
				'.gb-shape svg'                         => array(
					'width'      => '1.1em',
					'height'     => '1.1em',
					'transition' => 'transform 0.2s ease',
				),
				'&[aria-expanded="true"] .gb-shape svg' => array(
					'transform' => 'rotate(180deg)',
				),
			)
		),

		// What opens. Margins reset because themes give lists one
		// (GeneratePress: 3em on the left).
		'tmb-dropdown__drawer'          => array_merge(
			array(
				'display'       => 'flex',
				'flexDirection' => 'column',
				'rowGap'        => '0.125rem',
			),
			$no_margin,
			$padding( '0.375rem' ),
			$radius( $corner ),
			$border_all( '1px', 'solid', $border ),
			array(
				'backgroundColor' => $background,
				'color'           => $text,
				'boxShadow'       => '0 12px 32px -12px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.06)',
				'listStyleType'   => 'none',
			)
		),
		// A panel needs room: it sets its own width (the others match the button).
		'tmb-dropdown__drawer--panel'   => array_merge(
			array(
				'width'  => '18rem',
				'rowGap' => '0.5rem',
			),
			$padding( '1rem' )
		),

		// A row (<li>) in a list drawer.
		'tmb-dropdown__item'            => $no_margin,

		// A link that fills the row, with a hover tint.
		'tmb-dropdown__link'            => array_merge(
			array( 'display' => 'block' ),
			$padding( '0.5rem', '0.75rem' ),
			$radius( '0.25rem' ),
			array(
				'color'                        => $text,
				'textDecoration'               => 'none',
				'transition'                   => 'background-color 0.15s ease',
				'&:is(:hover, :focus-visible)' => array(
					'backgroundColor' => $surface,
					'color'           => $accent,
				),
				'&:focus-visible'              => array_merge(
					$focus_ring,
					array( 'outlineOffset' => '-2px' )
				),
			)
		),
		// Downloads: the file's name above its type and size.
		'tmb-dropdown__link--downloads' => array(
			'display'       => 'flex',
			'flexDirection' => 'column',
			'rowGap'        => '0.125rem',
		),
		'tmb-dropdown__link--simple'    => array(
			'fontSize'   => '0.9375rem',
			'fontWeight' => '500',
		),

		// Downloads: a file's name and its type and size.
		'tmb-dropdown__file-name'       => array(
			'fontSize'   => '0.9375rem',
			'fontWeight' => '600',
			'lineHeight' => '1.3',
		),
		'tmb-dropdown__file-meta'       => array(
			'fontSize'   => '0.8125rem',
			'lineHeight' => '1.3',
			'color'      => $muted,
		),

		// Panel: a title, a line of text and a call-to-action link.
		'tmb-dropdown__title'           => array(
			'marginBottom' => '0',
			'fontSize'     => '1rem',
			'fontWeight'   => '600',
		),
		'tmb-dropdown__text'            => array(
			'marginBottom' => '0',
			'fontSize'     => '0.875rem',
			'color'        => $muted,
		),
		'tmb-dropdown__cta'             => array_merge(
			array(
				'display'   => 'inline-flex',
				'alignSelf' => 'flex-start',
				'marginTop' => '0.25rem',
			),
			$padding( '0.5rem', '0.875rem' ),
			$radius( '0.375rem' ),
			array(
				'backgroundColor'              => $accent,
				'color'                        => $background,
				'fontSize'                     => '0.875rem',
				'fontWeight'                   => '600',
				'textDecoration'               => 'none',
				'&:is(:hover, :focus-visible)' => array(
					'backgroundColor' => $text,
					'color'           => $background,
				),
				'&:focus-visible'              => $focus_ring,
			)
		),
	);
};
