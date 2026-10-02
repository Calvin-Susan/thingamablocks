<?php
/**
 * Default Global Styles for the Marquee's starting layouts
 * (src/marquee/templates.js). Base classes before their modifiers.
 *
 * The items row's display:flex (and the vertical layout's flex-direction)
 * stay local on the block: the scrolling depends on them, so they mustn't
 * go if a class is restyled or removed.
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
	$muted      = '#575760';
	$subtle     = '#b2b2be';
	$surface    = '#f7f8f9';
	$border     = '#f0f0f0';
	$background = '#ffffff';

	return array(
		'tmb-marquee__pause'           => array(
			'position'                                     => 'absolute',
			'zIndex'                                       => '2',
			'right'                                        => '0.5rem',
			'bottom'                                       => '0.5rem',
			'display'                                      => 'flex',
			'alignItems'                                   => 'center',
			'justifyContent'                               => 'center',
			'width'                                        => '2rem',
			'height'                                       => '2rem',
			'borderTopLeftRadius'                          => '50%',
			'borderTopRightRadius'                         => '50%',
			'borderBottomRightRadius'                      => '50%',
			'borderBottomLeftRadius'                       => '50%',
			'borderTopWidth'                               => '1px',
			'borderRightWidth'                             => '1px',
			'borderBottomWidth'                            => '1px',
			'borderLeftWidth'                              => '1px',
			'borderTopStyle'                               => 'solid',
			'borderRightStyle'                             => 'solid',
			'borderBottomStyle'                            => 'solid',
			'borderLeftStyle'                              => 'solid',
			'borderTopColor'                               => $border,
			'borderRightColor'                             => $border,
			'borderBottomColor'                            => $border,
			'borderLeftColor'                              => $border,
			'backgroundColor'                              => $background,
			'color'                                        => $muted,
			'cursor'                                       => 'pointer',
			'opacity'                                      => '0.75',
			'transition'                                   => 'opacity 0.2s ease',
			'&:is(:hover, :focus-visible)'                 => array(
				'opacity' => '1',
				'color'   => $text,
			),
			'&:focus-visible'                              => array(
				'outlineWidth'  => '2px',
				'outlineStyle'  => 'solid',
				'outlineColor'  => $accent,
				'outlineOffset' => '2px',
			),
			'.gb-shape svg'                                => array(
				'width'  => '0.875rem',
				'height' => '0.875rem',
			),
			// Pause icon while moving, play icon once paused.
			'& .gb-shape:last-child'                       => array(
				'display' => 'none',
			),
			'&[aria-pressed="true"] .gb-shape:first-child' => array(
				'display' => 'none',
			),
			'&[aria-pressed="true"] .gb-shape:last-child'  => array(
				'display' => 'flex',
			),
		),
		// Vertically centred on the right, rather than in the corner.
		'tmb-marquee__pause--middle'   => array(
			'top'       => '50%',
			'bottom'    => 'auto',
			'marginTop' => '-1rem',
		),
		'tmb-marquee__items'           => array(
			'alignItems' => 'center',
		),
		'tmb-marquee__items--logos'    => array(
			'columnGap'     => '4rem',
			'paddingTop'    => '1.5rem',
			'paddingRight'  => '0',
			'paddingBottom' => '1.5rem',
			'paddingLeft'   => '0',
		),
		'tmb-marquee__items--messages' => array(
			'columnGap' => '2rem',
		),
		'tmb-marquee__items--headline' => array(
			'columnGap'     => '2.5rem',
			'paddingTop'    => '1rem',
			'paddingRight'  => '0',
			'paddingBottom' => '1rem',
			'paddingLeft'   => '0',
		),
		'tmb-marquee__items--quotes'   => array(
			'alignItems' => 'stretch',
			'rowGap'     => '1rem',
		),
		'tmb-marquee__logo'            => array(
			'display' => 'flex',
			'color'   => $subtle,
			'svg'     => array(
				'width'  => 'auto',
				'height' => '2rem',
			),
		),
		'tmb-marquee__band'            => array(
			'backgroundColor' => $accent,
			'paddingTop'      => '0.875rem',
			'paddingRight'    => '0',
			'paddingBottom'   => '0.875rem',
			'paddingLeft'     => '0',
		),
		// White on the accent band (was GP's base-3, which turns dark in dark mode).
		'tmb-marquee__message'         => array(
			'whiteSpace' => 'nowrap',
			'fontSize'   => '1rem',
			'fontWeight' => '600',
			'color'      => $background,
		),
		'tmb-marquee__headline'        => array(
			'whiteSpace'    => 'nowrap',
			'fontSize'      => 'clamp(2.5rem, 7vw, 5.5rem)',
			'fontWeight'    => '800',
			'lineHeight'    => '1.1',
			'letterSpacing' => '-0.03em',
			'color'         => $text,
		),
		'tmb-marquee__headline--muted' => array(
			'color' => $muted,
		),
		'tmb-marquee__star'            => array(
			'display' => 'flex',
		),
		'tmb-marquee__star--messages'  => array(
			'color'   => $background,
			'opacity' => '0.6',
			'svg'     => array(
				'width'  => '0.875rem',
				'height' => '0.875rem',
			),
		),
		'tmb-marquee__star--headline'  => array(
			'color' => $accent,
			'svg'   => array(
				'width'  => 'clamp(1.5rem, 3vw, 2.5rem)',
				'height' => 'clamp(1.5rem, 3vw, 2.5rem)',
			),
		),
		'tmb-marquee__card'            => array(
			'marginTop'               => '0',
			'marginRight'             => '0',
			'marginBottom'            => '0',
			'marginLeft'              => '0',
			'paddingTop'              => '1.25rem',
			'paddingRight'            => '1.5rem',
			'paddingBottom'           => '1.25rem',
			'paddingLeft'             => '1.5rem',
			'borderTopLeftRadius'     => '0.75rem',
			'borderTopRightRadius'    => '0.75rem',
			'borderBottomRightRadius' => '0.75rem',
			'borderBottomLeftRadius'  => '0.75rem',
			'borderTopWidth'          => '1px',
			'borderRightWidth'        => '1px',
			'borderBottomWidth'       => '1px',
			'borderLeftWidth'         => '1px',
			'borderTopStyle'          => 'solid',
			'borderRightStyle'        => 'solid',
			'borderBottomStyle'       => 'solid',
			'borderLeftStyle'         => 'solid',
			'borderTopColor'          => $border,
			'borderRightColor'        => $border,
			'borderBottomColor'       => $border,
			'borderLeftColor'         => $border,
			'backgroundColor'         => $surface,
		),
		'tmb-marquee__quote'           => array(
			'marginBottom' => '0.5rem',
			'color'        => $text,
		),
		'tmb-marquee__author'          => array(
			'fontSize'   => '0.875rem',
			'fontWeight' => '600',
			'color'      => $muted,
		),
	);
};
