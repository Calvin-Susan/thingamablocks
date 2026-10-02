<?php
/**
 * Default Global Styles for the Countdown's starting layouts
 * (src/countdown/templates.js). Base classes before their modifiers.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// A function, so these helpers stay local (PHP files included at the top
// level would otherwise make them globals).
return static function () {
	$text   = '#222222';
	$muted  = '#575760';
	$subtle = '#b2b2be';

	return array(
		'tmb-countdown__timer'          => array(
			'display'   => 'flex',
			'flexWrap'  => 'wrap',
			'columnGap' => '0.75rem',
			'rowGap'    => '0.75rem',
		),
		'tmb-countdown__timer--inline'  => array(
			'display'    => 'inline-flex',
			'alignItems' => 'baseline',
			'columnGap'  => '0.5rem',
			'color'      => $text,
		),
		'tmb-countdown__timer--large'   => array(
			'alignItems' => 'flex-start',
			'columnGap'  => '0.5rem',
			'rowGap'     => '1rem',
		),
		'tmb-countdown__unit'           => array(
			'display'       => 'flex',
			'flexDirection' => 'column',
			'alignItems'    => 'center',
		),
		'tmb-countdown__unit--boxes'    => array(
			'minWidth'                => '4.75rem',
			'paddingTop'              => '1rem',
			'paddingRight'            => '0.75rem',
			'paddingBottom'           => '1rem',
			'paddingLeft'             => '0.75rem',
			'borderTopLeftRadius'     => '0.5rem',
			'borderTopRightRadius'    => '0.5rem',
			'borderBottomRightRadius' => '0.5rem',
			'borderBottomLeftRadius'  => '0.5rem',
			'borderTopWidth'          => '1px',
			'borderRightWidth'        => '1px',
			'borderBottomWidth'       => '1px',
			'borderLeftWidth'         => '1px',
			'borderTopStyle'          => 'solid',
			'borderRightStyle'        => 'solid',
			'borderBottomStyle'       => 'solid',
			'borderLeftStyle'         => 'solid',
			'borderTopColor'          => '#f0f0f0',
			'borderRightColor'        => '#f0f0f0',
			'borderBottomColor'       => '#f0f0f0',
			'borderLeftColor'         => '#f0f0f0',
			'backgroundColor'         => '#f7f8f9',
		),
		'tmb-countdown__unit--inline'   => array(
			'display'       => 'inline-flex',
			'flexDirection' => 'row',
			'alignItems'    => 'baseline',
			'columnGap'     => '0.125rem',
		),
		'tmb-countdown__unit--large'    => array(
			'minWidth' => '4.5rem',
		),
		'tmb-countdown__number'         => array(
			'display'            => 'block',
			'fontVariantNumeric' => 'tabular-nums',
			'fontWeight'         => '700',
			'lineHeight'         => '1',
			'color'              => $text,
		),
		'tmb-countdown__number--boxes'  => array(
			'fontSize' => '2.25rem',
		),
		'tmb-countdown__number--inline' => array(
			'display'    => 'inline',
			'lineHeight' => 'inherit',
		),
		'tmb-countdown__number--large'  => array(
			'fontSize'      => '3rem',
			'letterSpacing' => '-0.02em',
		),
		'tmb-countdown__label'          => array(
			'marginTop'     => '0.375rem',
			'fontSize'      => '0.75rem',
			'fontWeight'    => '600',
			'letterSpacing' => '0.08em',
			'textTransform' => 'uppercase',
			'color'         => $muted,
		),
		'tmb-countdown__label--large'   => array(
			'marginTop'  => '0.5rem',
			'fontWeight' => '400',
		),
		'tmb-countdown__intro'          => array(
			'color' => $muted,
		),
		'tmb-countdown__suffix'         => array(
			'color' => $muted,
		),
		'tmb-countdown__separator'      => array(
			'fontSize'   => '3rem',
			'fontWeight' => '300',
			'lineHeight' => '1',
			'color'      => $subtle,
		),
		'tmb-countdown__ended'          => array(
			'marginBottom' => '0',
			'fontWeight'   => '600',
			'color'        => $text,
		),
	);
};
