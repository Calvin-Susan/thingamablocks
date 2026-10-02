/**
 * Starting layouts for the Toggle, offered as block variations.
 *
 * Everything visible is a real GenerateBlocks block (Element, Text, Shape).
 * The look comes from GenerateBlocks Pro Global Styles the plugin creates
 * (includes/global-styles/toggle.php): a base class for each part, plus a
 * modifier for a layout's differences, e.g. tmb-toggle__switch and
 * tmb-toggle__switch--dark-mode. Edit a class to restyle every toggle.
 *
 * State styling hooks, all relative to the part itself (GB nested selectors
 * start with "&"):
 *   switch:          &[aria-checked="true"]
 *   knob in switch:  &[aria-checked="true"] > *   (set on the switch)
 *   on/off parts:    &[data-active="true"]
 */
import { __ } from '@wordpress/i18n';

import { variationIcons } from './icon';

const classes = ( part, modifier ) => {
	const base = `tmb-toggle__${ part }`;

	return modifier ? [ base, `${ base }--${ modifier }` ] : [ base ];
};

/**
 * The classic pill switch: a track with a knob that slides across.
 *
 * @param {Array}  knobChildren Inner blocks for the knob (icons).
 * @param {string} modifier     Class modifier for the layout, if any.
 * @return {Array} Block template.
 */
export const switchTrack = ( knobChildren = [], modifier = '' ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		htmlAttributes: { 'data-toggle-part': 'switch' },
		globalClasses: classes( 'switch', modifier ),
	},
	[
		[
			'generateblocks/element',
			{
				tagName: 'div',
				globalClasses: classes( 'knob' ),
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
		htmlAttributes: { 'data-toggle-part': side },
		globalClasses: classes( 'label' ),
	},
];

const row = ( children ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		globalClasses: classes( 'row' ),
	},
	children,
];

const segment = ( text, side ) => [
	'generateblocks/text',
	{
		tagName: 'button',
		content: text,
		htmlAttributes: { 'data-toggle-part': side, type: 'button' },
		globalClasses: classes( 'segment' ),
	},
];

const segmented = ( offText, onText ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		htmlAttributes: { role: 'group' },
		globalClasses: classes( 'segments' ),
	},
	[ segment( offText, 'off' ), segment( onText, 'on' ) ],
];

// The knob's icons are a fixed colour, so the switch reads the same in light
// and dark mode. The one for the on state is hidden until then.
const icon = ( svg, showWhenOn ) => [
	'generateblocks/shape',
	{
		html: svg,
		globalClasses: classes( 'icon', showWhenOn ? 'on' : '' ),
	},
];

const sun =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>';
const moon =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

/**
 * The dark-mode switch swaps the knob icon with the state. The swap is styled
 * on the switch itself (tmb-toggle__switch--dark-mode) so it stays in one
 * place.
 */
const darkModeSwitch = () =>
	switchTrack( [ icon( sun, false ), icon( moon, true ) ], 'dark-mode' );

export const variations = [
	{
		name: 'switch-labels',
		icon: variationIcons[ 'switch-labels' ],
		title: __( 'Switch with labels', 'thingamablocks' ),
		description: __(
			'Two labels either side of a switch, e.g. Monthly / Annual.',
			'thingamablocks'
		),
		isDefault: true,
		attributes: { action: 'showHide' },
		innerBlocks: [
			row( [
				label( __( 'Monthly', 'thingamablocks' ), 'off' ),
				switchTrack(),
				label( __( 'Annual', 'thingamablocks' ), 'on' ),
			] ),
		],
		scope: [ 'block' ],
	},
	{
		name: 'segmented',
		icon: variationIcons.segmented,
		title: __( 'Segmented buttons', 'thingamablocks' ),
		description: __(
			'Two buttons side by side; the active one is highlighted.',
			'thingamablocks'
		),
		attributes: {
			action: 'showHide',
			ariaLabel: __( 'Billing period', 'thingamablocks' ),
		},
		innerBlocks: [
			segmented(
				__( 'Monthly', 'thingamablocks' ),
				__( 'Annual', 'thingamablocks' )
			),
		],
		scope: [ 'block' ],
	},
	{
		name: 'switch',
		icon: variationIcons.switch,
		title: __( 'Switch', 'thingamablocks' ),
		description: __(
			'Just the switch. Give it an accessible label in the settings.',
			'thingamablocks'
		),
		attributes: { action: 'showHide' },
		innerBlocks: [ switchTrack() ],
		scope: [ 'block' ],
	},
	{
		name: 'dark-mode',
		icon: variationIcons[ 'dark-mode' ],
		title: __( 'Dark mode switch', 'thingamablocks' ),
		description: __(
			'A sun/moon switch that changes the page between light and dark.',
			'thingamablocks'
		),
		attributes: {
			action: 'colorScheme',
			ariaLabel: __( 'Dark mode', 'thingamablocks' ),
		},
		innerBlocks: [ darkModeSwitch() ],
		scope: [ 'block', 'inserter' ],
		keywords: [ 'dark', 'light', 'theme', 'color scheme' ],
	},
];
