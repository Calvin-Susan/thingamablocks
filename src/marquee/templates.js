/**
 * Starting layouts for the Marquee, offered as block variations.
 *
 * Everything visible is a real GenerateBlocks block:
 *   data-marquee-part="items"  the row that scrolls; put anything inside it
 *   data-marquee-part="pause"  a pause/play button (needed for accessibility:
 *                              moving content must be pausable, WCAG 2.2.2)
 *
 * The gap between items is the row's own gap; the script reads the computed
 * gap and uses it where the row repeats, so the loop has no seam.
 */
import { __ } from '@wordpress/i18n';

import { variationIcons } from './icon';

/*
 * The look comes from GenerateBlocks Pro Global Styles the plugin creates
 * (includes/class-thingamablocks-global-styles.php): a base class for each
 * part, plus a modifier for the layout, e.g. tmb-marquee__items and
 * tmb-marquee__items--logos. Edit a class to restyle every marquee.
 *
 * The items row's display:flex (and flex-direction for vertical layouts)
 * stays local: the scrolling depends on the row being a flex row/column, so
 * it mustn't be lost if a class is restyled or removed.
 */
const classes = ( part, modifier ) => {
	const base = `tmb-marquee__${ part }`;

	return modifier ? [ base, `${ base }--${ modifier }` ] : [ base ];
};

const shape = ( html, globalClasses = [] ) => [
	'generateblocks/shape',
	{ html, globalClasses },
];

const text = ( content, globalClasses, tagName = 'span' ) => [
	'generateblocks/text',
	{ tagName, content, globalClasses },
];

const items = ( modifier, children, styles = {} ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		htmlAttributes: { 'data-marquee-part': 'items' },
		styles: { display: 'flex', ...styles },
		globalClasses: classes( 'items', modifier ),
	},
	children,
];

const pauseIcon =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>';
const playIcon =
	'<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z"></path></svg>';

/**
 * A small round pause/play button, in the bottom corner or (modifier
 * "middle") vertically centred on the right. It shows the pause icon while
 * moving and the play icon once paused (aria-pressed="true").
 *
 * @param {string} [modifier] Position modifier.
 * @return {Array} Block template.
 */
const pauseButton = ( modifier ) => [
	'generateblocks/element',
	{
		tagName: 'div',
		htmlAttributes: { 'data-marquee-part': 'pause' },
		globalClasses: classes( 'pause', modifier ),
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
	pauseButton( 'middle' ),
	items(
		'logos',
		logoMarks.map( ( mark ) =>
			shape(
				`<svg aria-hidden="true" viewBox="0 0 112 32" fill="currentColor">${ mark }</svg>`,
				classes( 'logo' )
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
		children.push( text( line, classes( 'message' ) ) );
		children.push( shape( star, classes( 'star', 'messages' ) ) );
	} );

	return [
		pauseButton( 'middle' ),
		[
			'generateblocks/element',
			{ tagName: 'div', globalClasses: classes( 'band' ) },
			[ items( 'messages', children ) ],
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
			text( word, classes( 'headline', index % 2 ? 'muted' : '' ) )
		);
		children.push( shape( star, classes( 'star', 'headline' ) ) );
	} );

	return [ pauseButton(), items( 'headline', children ) ];
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
			'quotes',
			cards.map( ( [ quote, name ] ) => [
				'generateblocks/element',
				{ tagName: 'figure', globalClasses: classes( 'card' ) },
				[
					text( quote, classes( 'quote' ), 'p' ),
					text( name, classes( 'author' ), 'figcaption' ),
				],
			] ),
			{ flexDirection: 'column' }
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
