/**
 * Starting layouts for the Countdown, offered as block variations.
 *
 * Everything visible is a real GenerateBlocks block, marked with:
 *   data-countdown-part="days|hours|minutes|seconds"  the number (its text is replaced)
 *   data-countdown-unit="days|…"                       the unit's box, hidden with it
 *   data-countdown-part="timer"                        hidden when it ends
 *   data-countdown-part="ended"                        shown when it ends
 *   data-countdown-part="separator"                    hidden from screen readers
 *
 * Delete a unit's box to drop that unit: with no Days, the hours keep counting
 * past 24.
 */
import { __ } from '@wordpress/i18n';

import { visuallyHidden } from '../shared/gb';
import { variationIcons } from './icon';

const UNIT_LABELS = () => ( {
	days: __( 'Days', 'thingamablocks' ),
	hours: __( 'Hours', 'thingamablocks' ),
	minutes: __( 'Minutes', 'thingamablocks' ),
	seconds: __( 'Seconds', 'thingamablocks' ),
} );

const SHORT_LABELS = () => ( {
	days: __( 'd', 'thingamablocks' ),
	hours: __( 'h', 'thingamablocks' ),
	minutes: __( 'm', 'thingamablocks' ),
	seconds: __( 's', 'thingamablocks' ),
} );

const UNITS = [ 'days', 'hours', 'minutes', 'seconds' ];

/*
 * The look comes from GenerateBlocks Pro Global Styles the plugin creates
 * (includes/class-thingamablocks-global-styles.php): a base class for each
 * part, plus a modifier for the layout, e.g. tmb-countdown__number and
 * tmb-countdown__number--boxes. Edit a class to restyle every countdown.
 */
const classes = ( part, modifier ) => {
	const base = `tmb-countdown__${ part }`;

	return modifier ? [ base, `${ base }--${ modifier }` ] : [ base ];
};

const number = ( unit, modifier ) => [
	'generateblocks/text',
	{
		tagName: 'span',
		content: '00',
		htmlAttributes: { 'data-countdown-part': unit },
		globalClasses: classes( 'number', modifier ),
	},
];

const text = (
	content,
	globalClasses,
	tagName = 'span',
	htmlAttributes = {}
) => [
	'generateblocks/text',
	{ tagName, content, globalClasses, htmlAttributes },
];

const unitBox = ( unit, modifier, children ) => [
	'generateblocks/element',
	{
		// GB Elements can't be a <span>; an inline-flex <div> does the same job.
		tagName: 'div',
		htmlAttributes: { 'data-countdown-unit': unit },
		globalClasses: classes( 'unit', modifier ),
	},
	children,
];

const ended = ( message ) => [
	'generateblocks/text',
	{
		tagName: 'p',
		content: message,
		htmlAttributes: { 'data-countdown-part': 'ended' },
		globalClasses: classes( 'ended' ),
	},
];

const timer = ( modifier, children ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		htmlAttributes: { 'data-countdown-part': 'timer' },
		globalClasses: classes( 'timer', modifier ),
	},
	children,
];

const boxes = () => {
	const labels = UNIT_LABELS();

	return [
		timer(
			'',
			UNITS.map( ( unit ) =>
				unitBox( unit, 'boxes', [
					number( unit, 'boxes' ),
					text( labels[ unit ], classes( 'label' ) ),
				] )
			)
		),
		ended( __( 'This offer has ended.', 'thingamablocks' ) ),
	];
};

const inline = () => {
	const labels = SHORT_LABELS();
	const fullLabels = UNIT_LABELS();

	return [
		timer( 'inline', [
			text( __( 'Ends in', 'thingamablocks' ), classes( 'intro' ) ),
			...UNITS.map( ( unit ) =>
				unitBox( unit, 'inline', [
					number( unit, 'inline' ),
					// Screen readers would read "m" as a letter (or "metres"), so
					// the short label is visual only and the full word is read instead.
					text( labels[ unit ], classes( 'suffix' ), 'span', {
						'aria-hidden': 'true',
					} ),
					// Hidden by local styles, not a class: it must stay hidden even if
					// the classes are restyled.
					[
						'generateblocks/text',
						{
							tagName: 'span',
							content: fullLabels[ unit ],
							styles: visuallyHidden,
						},
					],
				] )
			),
		] ),
		ended( __( 'This offer has ended.', 'thingamablocks' ) ),
	];
};

const colons = () => {
	const labels = UNIT_LABELS();
	const children = [];

	UNITS.forEach( ( unit, index ) => {
		if ( index > 0 ) {
			children.push(
				text( ':', classes( 'separator' ), 'span', {
					'data-countdown-part': 'separator',
				} )
			);
		}

		children.push(
			unitBox( unit, 'large', [
				number( unit, 'large' ),
				text( labels[ unit ], classes( 'label', 'large' ) ),
			] )
		);
	} );

	return [
		timer( 'large', children ),
		ended( __( 'We’re live!', 'thingamablocks' ) ),
	];
};

export const variations = [
	{
		name: 'boxes',
		title: __( 'Boxes', 'thingamablocks' ),
		description: __( 'Each unit in its own box.', 'thingamablocks' ),
		icon: variationIcons.boxes,
		isDefault: true,
		innerBlocks: boxes(),
		scope: [ 'block' ],
	},
	{
		name: 'inline',
		title: __( 'Inline text', 'thingamablocks' ),
		description: __(
			'“Ends in 2d 5h 12m 9s”, for banners and buttons.',
			'thingamablocks'
		),
		icon: variationIcons.inline,
		// Reads like a sentence: "Ends in 5h 2m 9s", not "Ends in 00d 05h 02m 09s".
		attributes: { padNumbers: false, hideEmptyUnits: true },
		innerBlocks: inline(),
		scope: [ 'block' ],
	},
	{
		name: 'colons',
		title: __( 'Large numbers', 'thingamablocks' ),
		description: __(
			'Big numbers with colons, for launches.',
			'thingamablocks'
		),
		icon: variationIcons.colons,
		innerBlocks: colons(),
		scope: [ 'block' ],
	},
];
