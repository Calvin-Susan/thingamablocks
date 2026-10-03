<?php
/**
 * Default Global Styles for the Share block's starting layouts
 * (src/share/templates.js). Base classes before their modifiers.
 *
 * The brand classes (tmb-share__button--linkedin…) colour only the icon:
 * brand marks need to be recognisable, and the text beside them keeps the
 * button's own colour (several brand colours are too light for text).
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// A function, so these helpers stay local (PHP files included at the top
// level would otherwise make them globals).
return static function () {
	$accent  = '#1e73be';
	$text    = '#222222';
	$muted   = '#575760';
	$line    = '#b2b2be';
	$surface = '#f7f8f9';
	$copied  = '#2e7d32';

	$classes = array(
		'tmb-share__row'          => array(
			'display'    => 'flex',
			'flexWrap'   => 'wrap',
			'alignItems' => 'center',
			'columnGap'  => '1rem',
			'rowGap'     => '0.5rem',
		),
		'tmb-share__label'        => array(
			'marginBottom' => '0',
			'color'        => $text,
			'fontSize'     => '0.9375rem',
			'fontWeight'   => '600',
		),
		'tmb-share__list'         => array(
			'display'       => 'flex',
			'flexWrap'      => 'wrap',
			'columnGap'     => '0.5rem',
			'rowGap'        => '0.5rem',
			'marginTop'     => '0',
			'marginRight'   => '0',
			'marginBottom'  => '0',
			'marginLeft'    => '0',
			'paddingLeft'   => '0',
			'listStyleType' => 'none',
		),
		'tmb-share__item'         => array(
			'marginBottom' => '0',
		),
		// A 40px round button (WCAG 2.5.8 asks for 24px).
		'tmb-share__button'       => array(
			'display'                      => 'inline-flex',
			'alignItems'                   => 'center',
			'justifyContent'               => 'center',
			'columnGap'                    => '0.5rem',
			'minWidth'                     => '2.5rem',
			'minHeight'                    => '2.5rem',
			'paddingTop'                   => '0.5rem',
			'paddingRight'                 => '0.5rem',
			'paddingBottom'                => '0.5rem',
			'paddingLeft'                  => '0.5rem',
			'borderTopWidth'               => '1px',
			'borderRightWidth'             => '1px',
			'borderBottomWidth'            => '1px',
			'borderLeftWidth'              => '1px',
			'borderTopStyle'               => 'solid',
			'borderRightStyle'             => 'solid',
			'borderBottomStyle'            => 'solid',
			'borderLeftStyle'              => 'solid',
			'borderTopColor'               => $line,
			'borderRightColor'             => $line,
			'borderBottomColor'            => $line,
			'borderLeftColor'              => $line,
			'borderTopLeftRadius'          => '999px',
			'borderTopRightRadius'         => '999px',
			'borderBottomRightRadius'      => '999px',
			'borderBottomLeftRadius'       => '999px',
			'backgroundColor'              => 'transparent',
			'color'                        => $text,
			'fontSize'                     => '0.875rem',
			'fontWeight'                   => '500',
			'lineHeight'                   => '1',
			'textDecoration'               => 'none',
			'cursor'                       => 'pointer',
			// GeneratePress colours a focused <button>; a clicked one shouldn't.
			'&:focus'                      => array(
				'backgroundColor' => 'transparent',
				'color'           => $text,
			),
			'&:is(:hover, :focus-visible)' => array(
				'borderTopColor'    => $muted,
				'borderRightColor'  => $muted,
				'borderBottomColor' => $muted,
				'borderLeftColor'   => $muted,
				'backgroundColor'   => $surface,
				'color'             => $text,
			),
			'&:focus-visible'              => array(
				'outlineWidth'  => '2px',
				'outlineStyle'  => 'solid',
				'outlineColor'  => $accent,
				'outlineOffset' => '2px',
			),
			// For a moment after Copy link copies.
			'&[data-copied]'               => array(
				'borderTopColor'    => $copied,
				'borderRightColor'  => $copied,
				'borderBottomColor' => $copied,
				'borderLeftColor'   => $copied,
			),
			'.gb-shape'                    => array(
				'display' => 'inline-flex',
			),
			'.gb-shape svg'                => array(
				'width'  => '1.125rem',
				'height' => '1.125rem',
			),
		),
		// Icon and name.
		'tmb-share__button--pill' => array(
			'paddingRight' => '1rem',
			'paddingLeft'  => '0.875rem',
		),
	);

	// Official brand colours (X, Threads and email keep the button's colour).
	$brands = array(
		'linkedin'  => '#0a66c2',
		'facebook'  => '#0866ff',
		'bluesky'   => '#1185fe',
		'reddit'    => '#ff4500',
		// WhatsApp's teal: its bright green is under 2:1 on white.
		'whatsapp'  => '#128c7e',
		// Telegram's darker blue: its usual one is under 3:1 on the hover
		// background.
		'telegram'  => '#0088cc',
		'pinterest' => '#e60023',
	);

	foreach ( $brands as $network => $color ) {
		$classes[ 'tmb-share__button--' . $network ] = array(
			'.gb-shape' => array(
				'color' => $color,
			),
		);
	}

	return $classes;
};
