<?php
/**
 * Default Global Styles for the Breadcrumbs' starting layouts
 * (src/breadcrumbs/templates.js). Base classes before their modifiers.
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
	$surface    = '#f7f8f9';
	$border     = '#f0f0f0';
	$background = '#ffffff';

	return array(
		'tmb-breadcrumbs__item'          => array(
			// At least 24px tall, so it's an easy target (WCAG 2.5.8).
			'display'                      => 'inline-block',
			'paddingTop'                   => '0.25rem',
			'paddingBottom'                => '0.25rem',
			'color'                        => $muted,
			'fontSize'                     => '0.9375rem',
			'lineHeight'                   => '1.25',
			'textDecoration'               => 'none',
			'&:is(:hover, :focus-visible)' => array(
				'color'          => $accent,
				'textDecoration' => 'underline',
			),
			'&:focus-visible'              => array(
				'outlineWidth'  => '2px',
				'outlineStyle'  => 'solid',
				'outlineColor'  => $accent,
				'outlineOffset' => '2px',
			),
		),
		'tmb-breadcrumbs__item--pill'    => array(
			'paddingRight'                 => '0.75rem',
			'paddingLeft'                  => '0.75rem',
			'borderTopLeftRadius'          => '999px',
			'borderTopRightRadius'         => '999px',
			'borderBottomRightRadius'      => '999px',
			'borderBottomLeftRadius'       => '999px',
			'lineHeight'                   => '1.5',
			'backgroundColor'              => $surface,
			'color'                        => $text,
			'&:is(:hover, :focus-visible)' => array(
				'backgroundColor' => $border,
				'color'           => $text,
				'textDecoration'  => 'none',
			),
		),
		'tmb-breadcrumbs__divider'       => array(
			'color'    => $muted,
			'fontSize' => '0.9375rem',
		),
		'tmb-breadcrumbs__current'       => array(
			'color'      => $text,
			'fontSize'   => '0.9375rem',
			'fontWeight' => '500',
		),
		'tmb-breadcrumbs__current--pill' => array(
			'display'                 => 'inline-block',
			'paddingTop'              => '0.25rem',
			'paddingRight'            => '0.75rem',
			'paddingBottom'           => '0.25rem',
			'paddingLeft'             => '0.75rem',
			'borderTopLeftRadius'     => '999px',
			'borderTopRightRadius'    => '999px',
			'borderBottomRightRadius' => '999px',
			'borderBottomLeftRadius'  => '999px',
			'lineHeight'              => '1.5',
			'backgroundColor'         => $accent,
			'color'                   => $background,
			'fontWeight'              => '600',
		),
	);
};
