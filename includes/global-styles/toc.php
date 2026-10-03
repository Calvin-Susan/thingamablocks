<?php
/**
 * Default Global Styles for the Table of Contents' starting layouts
 * (src/toc/templates.js). Base classes before their modifiers.
 *
 * Sub-headings are nested copies of the list, item and link, so levels are
 * styled from the list: `& [data-toc-part="list"]` is a nested list.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// A function, so these helpers stay local (PHP files included at the top
// level would otherwise make them globals).
return static function () {
	$accent      = '#1e73be';
	$text        = '#222222';
	$muted       = '#575760';
	$line        = '#b2b2be';
	$nested      = '& [data-toc-part="list"]';
	$nested_link = $nested . ' [data-toc-part="link"]';
	$deeper_link = $nested . ' ' . $nested_link;

	return array(
		'tmb-toc__title'         => array(
			'marginBottom'  => '0.75rem',
			'color'         => $text,
			'fontSize'      => '0.875rem',
			'fontWeight'    => '600',
			'letterSpacing' => '0.04em',
			'textTransform' => 'uppercase',
		),
		'tmb-toc__list'          => array(
			'display'       => 'flex',
			'flexDirection' => 'column',
			'rowGap'        => '0.25rem',
			'marginTop'     => '0',
			'marginRight'   => '0',
			'marginBottom'  => '0',
			'marginLeft'    => '0',
			'paddingLeft'   => '0',
			'listStyleType' => 'none',
			$nested         => array(
				'marginTop'   => '0.25rem',
				'paddingLeft' => '1rem',
			),
		),
		// The line down the side belongs to the outer list; nested lists
		// indent their links instead, so the current link's marker sits on it.
		'tmb-toc__list--line'    => array(
			'borderLeftWidth' => '2px',
			'borderLeftStyle' => 'solid',
			'borderLeftColor' => $line,
			$nested           => array(
				'paddingLeft'     => '0',
				'borderLeftWidth' => '0',
			),
			$nested_link      => array(
				'paddingLeft' => '1.75rem',
			),
			$deeper_link      => array(
				'paddingLeft' => '2.5rem',
			),
		),
		'tmb-toc__item'          => array(
			'marginBottom' => '0',
		),
		'tmb-toc__link'          => array(
			// At least 24px tall, so it's an easy target (WCAG 2.5.8).
			'display'                      => 'block',
			'paddingTop'                   => '0.25rem',
			'paddingBottom'                => '0.25rem',
			'color'                        => $muted,
			'fontSize'                     => '0.9375rem',
			'lineHeight'                   => '1.4',
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
		// The section being read is marked aria-current by the script.
		'tmb-toc__link--line'    => array(
			'marginLeft'      => '-2px',
			'paddingLeft'     => '1rem',
			'borderLeftWidth' => '2px',
			'borderLeftStyle' => 'solid',
			'borderLeftColor' => 'transparent',
		),
		// The section being read (aria-current, set by the script). Its own
		// class, so removing it takes away just the highlight. The border
		// colour only shows on links with a border (the Sidebar line).
		'tmb-toc__link--current' => array(
			'&[aria-current]' => array(
				'borderLeftColor' => $accent,
				'color'           => $accent,
			),
		),
		'tmb-toc__chevron'       => array(
			'display' => 'inline-flex',
			'svg'     => array(
				'width'  => '1.25em',
				'height' => '1.25em',
			),
		),
		'tmb-toc__copy-icon'     => array(
			'display' => 'inline-flex',
			'color'   => $muted,
			'&:hover' => array(
				'color' => $accent,
			),
			'svg'     => array(
				'width'  => '0.7em',
				'height' => '0.7em',
			),
		),
	);
};
