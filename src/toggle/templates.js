/**
 * Starting layouts for the Toggle, offered as block variations.
 *
 * Everything visible is a real GenerateBlocks block (Element, Text, Shape), so
 * after inserting, each part is styled in the normal GB Styles panel. Colours
 * use the GeneratePress global colour variables, with fallbacks for other
 * themes.
 *
 * State styling hooks, all relative to the part itself (GB nested selectors
 * start with "&"):
 *   switch:          &[aria-checked="true"]
 *   knob in switch:  &[aria-checked="true"] > *   (set on the switch)
 *   on/off parts:    &[data-active="true"]
 */
import { __ } from '@wordpress/i18n';

const color = {
	accent: 'var(--accent, #1e73be)',
	track: 'var(--contrast-3, #b2b2be)',
	knob: 'var(--base-3, #ffffff)',
	text: 'var(--contrast, #222222)',
	muted: 'var(--contrast-2, #575760)',
	surface: 'var(--base-2, #f7f8f9)',
	border: 'var(--base, #f0f0f0)',
};

const radius = ( value ) => ( {
	borderTopLeftRadius: value,
	borderTopRightRadius: value,
	borderBottomRightRadius: value,
	borderBottomLeftRadius: value,
} );

const padding = ( y, x = y ) => ( {
	paddingTop: y,
	paddingRight: x,
	paddingBottom: y,
	paddingLeft: x,
} );

const border = ( width, style, value ) => ( {
	borderTopWidth: width,
	borderRightWidth: width,
	borderBottomWidth: width,
	borderLeftWidth: width,
	borderTopStyle: style,
	borderRightStyle: style,
	borderBottomStyle: style,
	borderLeftStyle: style,
	borderTopColor: value,
	borderRightColor: value,
	borderBottomColor: value,
	borderLeftColor: value,
} );

const focusRing = {
	'&:focus-visible': {
		outlineWidth: '2px',
		outlineStyle: 'solid',
		outlineColor: color.accent,
		outlineOffset: '3px',
	},
};

/**
 * The classic pill switch: a track with a knob that slides across.
 *
 * @param {Array} knobChildren Inner blocks for the knob (icons).
 * @return {Array} Block template.
 */
export const switchTrack = ( knobChildren = [] ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		htmlAttributes: { 'data-toggle': 'switch' },
		styles: {
			display: 'inline-flex',
			alignItems: 'center',
			flexShrink: '0',
			width: '3.25rem',
			height: '1.75rem',
			...padding( '0.1875rem' ),
			...radius( '999px' ),
			backgroundColor: color.track,
			cursor: 'pointer',
			transition: 'background-color 0.2s ease',
			'&[aria-checked="true"]': {
				backgroundColor: color.accent,
			},
			'&[aria-checked="true"] > *': {
				transform: 'translateX(1.5rem)',
			},
			...focusRing,
		},
	},
	[
		[
			'generateblocks/element',
			{
				tagName: 'div',
				styles: {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: '1.375rem',
					height: '1.375rem',
					...radius( '50%' ),
					backgroundColor: color.knob,
					boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
					transition: 'transform 0.2s ease',
				},
			},
			knobChildren,
		],
	],
];

const label = ( text, side ) => [
	'generateblocks/text',
	{
		tagName: 'span',
		content: text,
		htmlAttributes: { 'data-toggle': side },
		styles: {
			color: color.muted,
			fontWeight: '500',
			transition: 'color 0.2s ease',
			'&[data-active="true"]': {
				color: color.text,
			},
		},
	},
];

const row = ( children ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		styles: {
			display: 'inline-flex',
			alignItems: 'center',
			columnGap: '0.75rem',
		},
	},
	children,
];

const segment = ( text, side ) => [
	'generateblocks/text',
	{
		tagName: 'button',
		content: text,
		htmlAttributes: { 'data-toggle': side, type: 'button' },
		styles: {
			...padding( '0.5em', '1.25em' ),
			...radius( '999px' ),
			...border( '0', 'none', 'transparent' ),
			backgroundColor: 'transparent',
			color: color.muted,
			fontSize: '0.9375rem',
			fontWeight: '600',
			lineHeight: '1.2',
			cursor: 'pointer',
			transition: 'background-color 0.2s ease, color 0.2s ease',
			'&:hover': {
				backgroundColor: color.border,
				color: color.text,
			},
			'&[data-active="true"], &[data-active="true"]:hover': {
				backgroundColor: color.accent,
				color: color.knob,
			},
			...focusRing,
		},
	},
];

const segmented = ( offText, onText ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		htmlAttributes: { role: 'group' },
		styles: {
			display: 'inline-flex',
			alignItems: 'center',
			columnGap: '0.25rem',
			...padding( '0.25rem' ),
			...radius( '999px' ),
			...border( '1px', 'solid', color.border ),
			backgroundColor: color.surface,
		},
	},
	[ segment( offText, 'off' ), segment( onText, 'on' ) ],
];

const icon = ( svg, showWhenOn ) => [
	'generateblocks/shape',
	{
		html: svg,
		styles: {
			display: showWhenOn ? 'none' : 'flex',
			color: color.muted,
			svg: {
				width: '0.875rem',
				height: '0.875rem',
			},
		},
	},
];

const sun =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>';
const moon =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

/**
 * The dark-mode switch swaps the knob icon with the state. The swap is styled
 * on the switch itself so it stays in one place in the GB Styles panel.
 */
const darkModeSwitch = () => {
	const [ name, attributes, children ] = switchTrack( [
		icon( sun, false ),
		icon( moon, true ),
	] );

	return [
		name,
		{
			...attributes,
			styles: {
				...attributes.styles,
				'&[aria-checked="true"] .gb-shape:first-child': {
					display: 'none',
				},
				'&[aria-checked="true"] .gb-shape:last-child': {
					display: 'flex',
				},
			},
		},
		children,
	];
};

export const variations = [
	{
		name: 'switch-labels',
		title: __( 'Switch with labels', 'toggle-for-generateblocks' ),
		description: __(
			'Two labels either side of a switch, e.g. Monthly / Annual.',
			'toggle-for-generateblocks'
		),
		isDefault: true,
		attributes: { action: 'showHide' },
		innerBlocks: [
			row( [
				label( __( 'Monthly', 'toggle-for-generateblocks' ), 'off' ),
				switchTrack(),
				label( __( 'Annual', 'toggle-for-generateblocks' ), 'on' ),
			] ),
		],
		scope: [ 'block' ],
	},
	{
		name: 'segmented',
		title: __( 'Segmented buttons', 'toggle-for-generateblocks' ),
		description: __(
			'Two buttons side by side; the active one is highlighted.',
			'toggle-for-generateblocks'
		),
		attributes: { action: 'showHide' },
		innerBlocks: [
			segmented(
				__( 'Monthly', 'toggle-for-generateblocks' ),
				__( 'Annual', 'toggle-for-generateblocks' )
			),
		],
		scope: [ 'block' ],
	},
	{
		name: 'switch',
		title: __( 'Switch', 'toggle-for-generateblocks' ),
		description: __(
			'Just the switch. Give it an accessible label in the settings.',
			'toggle-for-generateblocks'
		),
		attributes: { action: 'showHide' },
		innerBlocks: [ switchTrack() ],
		scope: [ 'block' ],
	},
	{
		name: 'dark-mode',
		title: __( 'Dark mode switch', 'toggle-for-generateblocks' ),
		description: __(
			'A sun/moon switch that changes the page between light and dark.',
			'toggle-for-generateblocks'
		),
		attributes: {
			action: 'colorScheme',
			ariaLabel: __( 'Dark mode', 'toggle-for-generateblocks' ),
		},
		innerBlocks: [ darkModeSwitch() ],
		scope: [ 'block', 'inserter' ],
		keywords: [ 'dark', 'light', 'theme', 'color scheme' ],
	},
];
