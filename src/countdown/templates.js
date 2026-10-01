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

import { border, color, padding, radius } from '../shared/gb';
import { variationIcons } from './icon';

const UNIT_LABELS = () => ( {
	days: __( 'Days', 'toggle-for-generateblocks' ),
	hours: __( 'Hours', 'toggle-for-generateblocks' ),
	minutes: __( 'Minutes', 'toggle-for-generateblocks' ),
	seconds: __( 'Seconds', 'toggle-for-generateblocks' ),
} );

const SHORT_LABELS = () => ( {
	days: __( 'd', 'toggle-for-generateblocks' ),
	hours: __( 'h', 'toggle-for-generateblocks' ),
	minutes: __( 'm', 'toggle-for-generateblocks' ),
	seconds: __( 's', 'toggle-for-generateblocks' ),
} );

const UNITS = [ 'days', 'hours', 'minutes', 'seconds' ];

// Numbers keep the same width as they change, so the layout doesn't jiggle.
const tabular = { fontVariantNumeric: 'tabular-nums' };

const number = ( unit, styles ) => [
	'generateblocks/text',
	{
		tagName: 'span',
		content: '00',
		htmlAttributes: { 'data-countdown-part': unit },
		styles: { display: 'block', ...tabular, ...styles },
	},
];

const text = ( content, styles, tagName = 'span', htmlAttributes = {} ) => [
	'generateblocks/text',
	{ tagName, content, styles, htmlAttributes },
];

const ended = ( message ) => [
	'generateblocks/text',
	{
		tagName: 'p',
		content: message,
		htmlAttributes: { 'data-countdown-part': 'ended' },
		styles: {
			marginBottom: '0',
			fontWeight: '600',
			color: color.text,
		},
	},
];

const timer = ( styles, children ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		htmlAttributes: { 'data-countdown-part': 'timer' },
		styles,
	},
	children,
];

const boxes = () => {
	const labels = UNIT_LABELS();

	return [
		timer(
			{ display: 'flex', flexWrap: 'wrap', columnGap: '0.75rem', rowGap: '0.75rem' },
			UNITS.map( ( unit ) => [
				'generateblocks/element',
				{
					tagName: 'div',
					htmlAttributes: { 'data-countdown-unit': unit },
					styles: {
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						minWidth: '4.75rem',
						...padding( '1rem', '0.75rem' ),
						...radius( '0.5rem' ),
						...border( '1px', 'solid', color.border ),
						backgroundColor: color.surface,
					},
				},
				[
					number( unit, {
						fontSize: '2.25rem',
						fontWeight: '700',
						lineHeight: '1',
						color: color.text,
					} ),
					text( labels[ unit ], {
						marginTop: '0.375rem',
						fontSize: '0.75rem',
						fontWeight: '600',
						letterSpacing: '0.08em',
						textTransform: 'uppercase',
						color: color.muted,
					} ),
				],
			] )
		),
		ended( __( 'This offer has ended.', 'toggle-for-generateblocks' ) ),
	];
};

const inline = () => {
	const labels = SHORT_LABELS();

	return [
		timer(
			{
				display: 'inline-flex',
				flexWrap: 'wrap',
				alignItems: 'baseline',
				columnGap: '0.5rem',
				color: color.text,
			},
			[
				text( __( 'Ends in', 'toggle-for-generateblocks' ), { color: color.muted } ),
				...UNITS.map( ( unit ) => [
					'generateblocks/element',
					{
						// GB Elements can't be a <span>; an inline-flex <div> does the same job.
						tagName: 'div',
						htmlAttributes: { 'data-countdown-unit': unit },
						styles: { display: 'inline-flex', alignItems: 'baseline', columnGap: '0.125rem' },
					},
					[
						number( unit, { display: 'inline', fontWeight: '700' } ),
						text( labels[ unit ], { color: color.muted } ),
					],
				] ),
			]
		),
		ended( __( 'This offer has ended.', 'toggle-for-generateblocks' ) ),
	];
};

const colons = () => {
	const labels = UNIT_LABELS();
	const children = [];

	UNITS.forEach( ( unit, index ) => {
		if ( index > 0 ) {
			children.push(
				text(
					':',
					{
						fontSize: '3rem',
						fontWeight: '300',
						lineHeight: '1',
						color: color.subtle,
					},
					'span',
					{ 'data-countdown-part': 'separator' }
				)
			);
		}

		children.push( [
			'generateblocks/element',
			{
				tagName: 'div',
				htmlAttributes: { 'data-countdown-unit': unit },
				styles: {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					minWidth: '4.5rem',
				},
			},
			[
				number( unit, {
					fontSize: '3rem',
					fontWeight: '700',
					lineHeight: '1',
					letterSpacing: '-0.02em',
					color: color.text,
				} ),
				text( labels[ unit ], {
					marginTop: '0.5rem',
					fontSize: '0.75rem',
					letterSpacing: '0.08em',
					textTransform: 'uppercase',
					color: color.muted,
				} ),
			],
		] );
	} );

	return [
		timer(
			{
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'flex-start',
				columnGap: '0.5rem',
				rowGap: '1rem',
			},
			children
		),
		ended( __( 'We’re live!', 'toggle-for-generateblocks' ) ),
	];
};

export const variations = [
	{
		name: 'boxes',
		title: __( 'Boxes', 'toggle-for-generateblocks' ),
		description: __( 'Each unit in its own box.', 'toggle-for-generateblocks' ),
		icon: variationIcons.boxes,
		isDefault: true,
		innerBlocks: boxes(),
		scope: [ 'block' ],
	},
	{
		name: 'inline',
		title: __( 'Inline text', 'toggle-for-generateblocks' ),
		description: __( '“Ends in 2d 5h 12m 9s”, for banners and buttons.', 'toggle-for-generateblocks' ),
		icon: variationIcons.inline,
		// Reads like a sentence: "Ends in 5h 2m 9s", not "Ends in 00d 05h 02m 09s".
		attributes: { padNumbers: false, hideEmptyUnits: true },
		innerBlocks: inline(),
		scope: [ 'block' ],
	},
	{
		name: 'colons',
		title: __( 'Large numbers', 'toggle-for-generateblocks' ),
		description: __( 'Big numbers with colons, for launches.', 'toggle-for-generateblocks' ),
		icon: variationIcons.colons,
		innerBlocks: colons(),
		scope: [ 'block' ],
	},
];
