/**
 * Starting layouts for the Marquee, offered as block variations.
 *
 * Everything visible is a real GenerateBlocks block:
 *   data-marquee-part="items"  the row that scrolls; put anything inside it
 *   data-marquee-part="pause"  a pause/play button (needed for accessibility:
 *                              moving content must be pausable, WCAG 2.2.2)
 *
 * The gap between items is the row's own GB gap; the script uses the same gap
 * where the row repeats, so the loop has no seam.
 */
import { __ } from '@wordpress/i18n';

import { border, color, padding, radius } from '../shared/gb';
import { variationIcons } from './icon';

const shape = ( html, styles = {} ) => [
	'generateblocks/shape',
	{ html, styles },
];

const text = ( content, styles, tagName = 'span' ) => [
	'generateblocks/text',
	{ tagName, content, styles },
];

const items = ( styles, children ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		htmlAttributes: { 'data-marquee-part': 'items' },
		styles: { display: 'flex', alignItems: 'center', ...styles },
	},
	children,
];

const pauseIcon =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>';
const playIcon =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z"></path></svg>';

/**
 * A small round pause/play button in the corner. It shows the pause icon while
 * moving and the play icon once paused (aria-pressed="true").
 *
 * @param {Object} position Position styles.
 * @return {Array} Block template.
 */
const pauseButton = ( position = { right: '0.5rem', bottom: '0.5rem' } ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		htmlAttributes: { 'data-marquee-part': 'pause' },
		styles: {
			position: 'absolute',
			zIndex: '2',
			...position,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: '2rem',
			height: '2rem',
			...radius( '50%' ),
			...border( '1px', 'solid', color.border ),
			backgroundColor: color.background,
			color: color.muted,
			cursor: 'pointer',
			opacity: '0.75',
			transition: 'opacity 0.2s ease',
			'&:is(:hover, :focus-visible)': { opacity: '1', color: color.text },
			'&:focus-visible': {
				outlineWidth: '2px',
				outlineStyle: 'solid',
				outlineColor: color.accent,
				outlineOffset: '2px',
			},
			'.gb-shape svg': { width: '0.875rem', height: '0.875rem' },
			'& .gb-shape:last-child': { display: 'none' },
			'&[aria-pressed="true"] .gb-shape:first-child': { display: 'none' },
			'&[aria-pressed="true"] .gb-shape:last-child': { display: 'flex' },
		},
	},
	[ shape( pauseIcon ), shape( playIcon ) ],
];

// Placeholder "logos": simple marks with a wordmark bar, to swap for real images.
const logoMarks = [
	'<circle cx="16" cy="16" r="12"></circle><rect x="36" y="11" width="64" height="10" rx="5"></rect>',
	'<rect x="4" y="4" width="24" height="24" rx="6"></rect><rect x="36" y="11" width="56" height="10" rx="5"></rect>',
	'<path d="M16 3 29 27H3Z"></path><rect x="36" y="11" width="72" height="10" rx="5"></rect>',
	'<path d="M4 16a12 12 0 0 1 24 0v12H4Z"></path><rect x="36" y="11" width="48" height="10" rx="5"></rect>',
	'<path d="M16 3l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z"></path><rect x="36" y="11" width="64" height="10" rx="5"></rect>',
	'<rect x="4" y="8" width="10" height="16" rx="2"></rect><rect x="18" y="4" width="10" height="24" rx="2"></rect><rect x="36" y="11" width="60" height="10" rx="5"></rect>',
];

// The pause button comes first in each layout, so keyboard users reach it
// before the links in the row. It's absolutely positioned, so the order
// doesn't change the look.
const logos = () => [
	pauseButton( { right: '0.5rem', top: '50%', marginTop: '-1rem' } ),
	items(
		{ columnGap: '4rem', ...padding( '1.5rem', '0' ) },
		logoMarks.map( ( mark ) =>
			shape(
				`<svg aria-hidden="true" viewBox="0 0 112 32" fill="currentColor">${ mark }</svg>`,
				{
					display: 'flex',
					color: color.subtle,
					svg: { width: 'auto', height: '2rem' },
				}
			)
		)
	),
];

const star =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z"></path></svg>';

const messages = () => {
	const lines = [
		__( 'Free shipping on orders over $50', 'thingamablocks' ),
		__( '30-day returns', 'thingamablocks' ),
		__( 'Rated 4.9 by 2,000+ customers', 'thingamablocks' ),
		__( 'Made in small batches', 'thingamablocks' ),
	];
	const children = [];

	lines.forEach( ( line ) => {
		children.push(
			text( line, {
				whiteSpace: 'nowrap',
				fontSize: '1rem',
				fontWeight: '600',
				// base-3 is white normally and dark in dark mode, so the text stays readable on the accent.
				color: 'var(--base-3, #ffffff)',
			} )
		);
		children.push(
			shape( star, {
				display: 'flex',
				color: 'var(--base-3, #ffffff)',
				opacity: '0.6',
				svg: { width: '0.875rem', height: '0.875rem' },
			} )
		);
	} );

	return [
		pauseButton( { right: '0.5rem', top: '50%', marginTop: '-1rem' } ),
		[
			'generateblocks/element',
			{
				tagName: 'div',
				styles: {
					backgroundColor: color.accent,
					...padding( '0.875rem', '0' ),
				},
			},
			[ items( { columnGap: '2rem' }, children ) ],
		],
	];
};

const headline = () => {
	const words = [
		__( 'Let’s make something great', 'thingamablocks' ),
		__( 'Available for new projects', 'thingamablocks' ),
	];
	const children = [];

	[ ...words, ...words ].forEach( ( word, index ) => {
		children.push(
			text( word, {
				whiteSpace: 'nowrap',
				fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
				fontWeight: '800',
				lineHeight: '1.1',
				letterSpacing: '-0.03em',
				color: index % 2 ? color.muted : color.text,
			} )
		);
		children.push(
			shape( star, {
				display: 'flex',
				color: color.accent,
				svg: {
					width: 'clamp(1.5rem, 3vw, 2.5rem)',
					height: 'clamp(1.5rem, 3vw, 2.5rem)',
				},
			} )
		);
	} );

	return [
		pauseButton(),
		items( { columnGap: '2.5rem', ...padding( '1rem', '0' ) }, children ),
	];
};

const quotes = () => {
	const cards = [
		[
			__(
				'“Fast, friendly, and the site looks incredible.”',
				'thingamablocks'
			),
			__( 'Sam R.', 'thingamablocks' ),
		],
		[
			__(
				'“They took the stress out of the whole project.”',
				'thingamablocks'
			),
			__( 'Priya K.', 'thingamablocks' ),
		],
		[
			__(
				'“Our enquiries doubled in the first month.”',
				'thingamablocks'
			),
			__( 'Jordan T.', 'thingamablocks' ),
		],
		[
			__(
				'“Clear, honest and on time. Would hire again.”',
				'thingamablocks'
			),
			__( 'Alex M.', 'thingamablocks' ),
		],
	];

	return [
		pauseButton(),
		items(
			{ flexDirection: 'column', alignItems: 'stretch', rowGap: '1rem' },
			cards.map( ( [ quote, name ] ) => [
				'generateblocks/element',
				{
					tagName: 'figure',
					styles: {
						marginTop: '0',
						marginRight: '0',
						marginBottom: '0',
						marginLeft: '0',
						...padding( '1.25rem', '1.5rem' ),
						...radius( '0.75rem' ),
						...border( '1px', 'solid', color.border ),
						backgroundColor: color.surface,
					},
				},
				[
					text(
						quote,
						{ marginBottom: '0.5rem', color: color.text },
						'p'
					),
					text(
						name,
						{
							fontSize: '0.875rem',
							fontWeight: '600',
							color: color.muted,
						},
						'figcaption'
					),
				],
			] )
		),
	];
};

export const variations = [
	{
		name: 'logos',
		title: __( 'Logo strip', 'thingamablocks' ),
		description: __(
			'Client or partner logos. Swap the placeholders for your images.',
			'thingamablocks'
		),
		icon: variationIcons.logos,
		isDefault: true,
		attributes: {
			speed: 40,
			ariaLabel: __( 'Our clients', 'thingamablocks' ),
		},
		innerBlocks: logos(),
		scope: [ 'block' ],
	},
	{
		name: 'messages',
		title: __( 'Message ticker', 'thingamablocks' ),
		description: __(
			'A coloured band of short messages, like an announcement bar.',
			'thingamablocks'
		),
		icon: variationIcons.messages,
		attributes: { speed: 60, fadeEdges: false },
		innerBlocks: messages(),
		scope: [ 'block' ],
	},
	{
		name: 'headline',
		title: __( 'Big scrolling headline', 'thingamablocks' ),
		description: __(
			'Large words drifting across the page.',
			'thingamablocks'
		),
		icon: variationIcons.headline,
		attributes: { speed: 45, fadeWidth: '15%' },
		innerBlocks: headline(),
		scope: [ 'block' ],
	},
	{
		name: 'quotes',
		title: __( 'Vertical quotes', 'thingamablocks' ),
		description: __(
			'Cards scrolling upwards, e.g. testimonials.',
			'thingamablocks'
		),
		icon: variationIcons.quotes,
		attributes: { speed: 30, direction: 'up', height: '22rem' },
		innerBlocks: quotes(),
		scope: [ 'block' ],
	},
];
