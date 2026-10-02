<?php
/**
 * Default Global Styles for the Toggle's starting layouts
 * (src/toggle/templates.js). Base classes before their modifiers.
 *
 * State styling is on the part itself: the switch's
 * &[aria-checked="true"] (and the knob inside it, > *), the labels' and
 * segments' &[data-active="true"].
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// A function, so these helpers stay local (PHP files included at the top
// level would otherwise make them globals).
return static function () {
	// The current choice, hovered or not (a variable keeps the array aligned).
	$active = '&[data-active="true"], &[data-active="true"]:hover';

	$accent  = '#1e73be';
	$text    = '#222222';
	$muted   = '#575760';
	$surface = '#f7f8f9';
	$border  = '#f0f0f0';
	$white   = '#ffffff';

	// A fixed mid grey, so the off switch has at least 3:1 contrast against
	// the white knob and against the page in both light and dark mode
	// (WCAG 1.4.11).
	$track = '#767680';

	// The knob and its icons stay fixed colours so the switch reads the same
	// in light and dark mode (the theme's base colours flip in dark mode).
	$knob      = '#ffffff';
	$knob_icon = '#575760';

	$focus_ring = array(
		'outlineWidth'  => '2px',
		'outlineStyle'  => 'solid',
		'outlineColor'  => $accent,
		'outlineOffset' => '3px',
	);

	return array(
		'tmb-toggle__switch'            => array(
			'display'                    => 'inline-flex',
			'alignItems'                 => 'center',
			'flexShrink'                 => '0',
			'width'                      => '3.25rem',
			'height'                     => '1.75rem',
			'paddingTop'                 => '0.1875rem',
			'paddingRight'               => '0.1875rem',
			'paddingBottom'              => '0.1875rem',
			'paddingLeft'                => '0.1875rem',
			'borderTopLeftRadius'        => '999px',
			'borderTopRightRadius'       => '999px',
			'borderBottomRightRadius'    => '999px',
			'borderBottomLeftRadius'     => '999px',
			'backgroundColor'            => $track,
			'cursor'                     => 'pointer',
			'transition'                 => 'background-color 0.2s ease',
			'&[aria-checked="true"]'     => array(
				'backgroundColor' => $accent,
			),
			// Margin rather than transform, so the knob slides the right way
			// on RTL sites.
			'&[aria-checked="true"] > *' => array(
				'marginInlineStart' => '1.5rem',
			),
			'&:focus-visible'            => $focus_ring,
		),
		// The dark-mode switch swaps the knob's sun icon for the moon when on.
		'tmb-toggle__switch--dark-mode' => array(
			'&[aria-checked="true"] .gb-shape:first-child' => array(
				'display' => 'none',
			),
			'&[aria-checked="true"] .gb-shape:last-child'  => array(
				'display' => 'flex',
			),
		),
		'tmb-toggle__knob'              => array(
			'display'                 => 'flex',
			'alignItems'              => 'center',
			'justifyContent'          => 'center',
			'width'                   => '1.375rem',
			'height'                  => '1.375rem',
			'borderTopLeftRadius'     => '50%',
			'borderTopRightRadius'    => '50%',
			'borderBottomRightRadius' => '50%',
			'borderBottomLeftRadius'  => '50%',
			'backgroundColor'         => $knob,
			'boxShadow'               => '0 1px 3px rgba(0, 0, 0, 0.25)',
			'transition'              => 'margin 0.2s ease',
		),
		'tmb-toggle__icon'              => array(
			'display' => 'flex',
			'color'   => $knob_icon,
			'svg'     => array(
				'width'  => '0.875rem',
				'height' => '0.875rem',
			),
		),
		// The icon shown when the switch is on: hidden until then.
		'tmb-toggle__icon--on'          => array(
			'display' => 'none',
		),
		'tmb-toggle__row'               => array(
			'display'    => 'inline-flex',
			'alignItems' => 'center',
			'columnGap'  => '0.75rem',
		),
		'tmb-toggle__label'             => array(
			'color'                 => $muted,
			'fontWeight'            => '500',
			'transition'            => 'color 0.2s ease',
			'&[data-active="true"]' => array(
				'color' => $text,
			),
		),
		'tmb-toggle__segments'          => array(
			'display'                 => 'inline-flex',
			'alignItems'              => 'center',
			'columnGap'               => '0.25rem',
			'paddingTop'              => '0.25rem',
			'paddingRight'            => '0.25rem',
			'paddingBottom'           => '0.25rem',
			'paddingLeft'             => '0.25rem',
			'borderTopLeftRadius'     => '999px',
			'borderTopRightRadius'    => '999px',
			'borderBottomRightRadius' => '999px',
			'borderBottomLeftRadius'  => '999px',
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
		'tmb-toggle__segment'           => array(
			'paddingTop'              => '0.5em',
			'paddingRight'            => '1.25em',
			'paddingBottom'           => '0.5em',
			'paddingLeft'             => '1.25em',
			'borderTopLeftRadius'     => '999px',
			'borderTopRightRadius'    => '999px',
			'borderBottomRightRadius' => '999px',
			'borderBottomLeftRadius'  => '999px',
			'borderTopWidth'          => '0',
			'borderRightWidth'        => '0',
			'borderBottomWidth'       => '0',
			'borderLeftWidth'         => '0',
			'borderTopStyle'          => 'none',
			'borderRightStyle'        => 'none',
			'borderBottomStyle'       => 'none',
			'borderLeftStyle'         => 'none',
			'borderTopColor'          => 'transparent',
			'borderRightColor'        => 'transparent',
			'borderBottomColor'       => 'transparent',
			'borderLeftColor'         => 'transparent',
			'backgroundColor'         => 'transparent',
			'color'                   => $muted,
			'fontSize'                => '0.9375rem',
			'fontWeight'              => '600',
			'lineHeight'              => '1.2',
			'cursor'                  => 'pointer',
			'transition'              => 'background-color 0.2s ease, color 0.2s ease',
			'&:hover'                 => array(
				'backgroundColor' => $border,
				'color'           => $text,
			),
			$active                   => array(
				'backgroundColor' => $accent,
				'color'           => $white,
			),
			'&:focus-visible'         => $focus_ring,
		),
	);
};
