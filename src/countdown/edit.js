/**
 * Editor for the Countdown block.
 *
 * A settings-only wrapper, like the Toggle: the numbers, labels, boxes and
 * "ended" message are GenerateBlocks blocks inside it.
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	BlockControls,
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	Button,
	CheckboxControl,
	DateTimePicker,
	Dropdown,
	Flex,
	FlexItem,
	Notice,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import {
	dateI18n,
	getSettings as getDateSettings,
	date as formatDate,
} from '@wordpress/date';
import { useEffect, useState } from '@wordpress/element';

import TargetsControl from '../shared/targets-control';
import VariationPlaceholder from '../shared/variation-placeholder';
import { CanvasContext, CanvasStyle, useCanvas } from '../shared/canvas-style';
import { countdownIcon } from './icon';
import { UNITS, nextRecurring, zonedToUtc } from './time';
import { partOf } from './parts';

const WEEKDAYS = () => [
	[ 1, __( 'Mon', 'thingamablocks' ) ],
	[ 2, __( 'Tue', 'thingamablocks' ) ],
	[ 3, __( 'Wed', 'thingamablocks' ) ],
	[ 4, __( 'Thu', 'thingamablocks' ) ],
	[ 5, __( 'Fri', 'thingamablocks' ) ],
	[ 6, __( 'Sat', 'thingamablocks' ) ],
	[ 0, __( 'Sun', 'thingamablocks' ) ],
];

/**
 * The site's time zone in the form the front end gets it from PHP's
 * wp_timezone_string(): an IANA name, or an offset like "+02:00".
 *
 * @return {string} Time zone.
 */
function siteTimeZone() {
	const { timezone } = getDateSettings();

	if ( timezone?.string ) {
		return timezone.string;
	}

	const offset = Number( timezone?.offset || 0 );
	const sign = offset < 0 ? '-' : '+';
	const minutes = Math.round( Math.abs( offset ) * 60 );

	return `${ sign }${ String( Math.floor( minutes / 60 ) ).padStart(
		2,
		'0'
	) }:${ String( minutes % 60 ).padStart( 2, '0' ) }`;
}

/**
 * The end date as a UTC timestamp, from the editor's site-time string.
 *
 * @param {string} value "Y-m-d\TH:i:s" in the site's time zone.
 * @return {number|null} ms since the epoch.
 */
function endDateToUtc( value ) {
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(
		value || ''
	);

	if ( ! match ) {
		return null;
	}

	return zonedToUtc(
		Number( match[ 1 ] ),
		Number( match[ 2 ] ) - 1,
		Number( match[ 3 ] ),
		Number( match[ 4 ] ),
		Number( match[ 5 ] ),
		siteTimeZone()
	);
}

/**
 * "in 2 days, 4 hours" / "ended 3 hours ago".
 *
 * @param {number} ms Time from now (negative = past).
 * @return {string} Text.
 */
function relative( ms ) {
	const abs = Math.abs( ms );
	const days = Math.floor( abs / 86400000 );
	const hours = Math.floor( ( abs % 86400000 ) / 3600000 );
	const minutes = Math.floor( ( abs % 3600000 ) / 60000 );

	const parts = [];

	if ( days ) {
		parts.push(
			/* translators: %d: number of days. */
			sprintf( _n( '%d day', '%d days', days, 'thingamablocks' ), days )
		);
	}

	if ( hours || days ) {
		parts.push(
			sprintf(
				/* translators: %d: number of hours. */
				_n( '%d hour', '%d hours', hours, 'thingamablocks' ),
				hours
			)
		);
	}

	if ( ! days ) {
		parts.push(
			sprintf(
				/* translators: %d: number of minutes. */
				_n( '%d minute', '%d minutes', minutes, 'thingamablocks' ),
				minutes
			)
		);
	}

	const span = parts.join( ', ' );

	return ms >= 0
		? /* translators: %s: a duration, e.g. "2 days, 4 hours". */ sprintf(
				__( 'in %s', 'thingamablocks' ),
				span
		  )
		: /* translators: %s: a duration, e.g. "2 days, 4 hours". */ sprintf(
				__( '%s ago', 'thingamablocks' ),
				span
		  );
}

function formatMoment( ms ) {
	const { formats } = getDateSettings();

	return dateI18n( `${ formats.date } ${ formats.time }`, new Date( ms ) );
}

function DateSettings( { endDate, setAttributes } ) {
	const end = endDateToUtc( endDate );
	const { formats } = getDateSettings();
	// The site's time format uses "a" or "A" (am/pm) when it's 12-hour; skip escaped characters.
	const is12Hour = /[aA]/.test( formats.time.replace( /\\./g, '' ) );

	return (
		<>
			<Dropdown
				popoverProps={ { placement: 'left-start' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						variant="secondary"
						onClick={ onToggle }
						aria-expanded={ isOpen }
						__next40pxDefaultSize
						className="tmb-countdown-date-button"
					>
						{ end
							? formatMoment( end )
							: __( 'Pick a date', 'thingamablocks' ) }
					</Button>
				) }
				renderContent={ () => (
					<div className="tmb-countdown-date-picker">
						<DateTimePicker
							currentDate={ endDate || undefined }
							is12Hour={ is12Hour }
							onChange={ ( value ) =>
								setAttributes( {
									endDate: ( value || '' ).slice( 0, 19 ),
								} )
							}
						/>
					</div>
				) }
			/>
			{ end && (
				<p className="tmb-countdown-help">
					{ end > Date.now()
						? /* translators: %s: e.g. "in 2 days, 4 hours". */ sprintf(
								__( 'Ends %s.', 'thingamablocks' ),
								relative( end - Date.now() )
						  )
						: /* translators: %s: e.g. "3 hours ago". */ sprintf(
								__( 'Ended %s.', 'thingamablocks' ),
								relative( end - Date.now() )
						  ) }
				</p>
			) }
		</>
	);
}

function EvergreenSettings( { attributes, setAttributes } ) {
	const total = attributes.evergreenMinutes;
	const days = Math.floor( total / 1440 );
	const hours = Math.floor( ( total % 1440 ) / 60 );
	const minutes = total % 60;

	const set = ( next ) => {
		const value = { days, hours, minutes, ...next };
		const sum =
			Math.max( 0, Number( value.days ) || 0 ) * 1440 +
			Math.max( 0, Number( value.hours ) || 0 ) * 60 +
			Math.max( 0, Number( value.minutes ) || 0 );

		setAttributes( { evergreenMinutes: Math.max( 1, sum ) } );
	};

	return (
		<>
			<Flex align="flex-start">
				<FlexItem>
					<NumberControl
						__next40pxDefaultSize
						label={ __( 'Days', 'thingamablocks' ) }
						min={ 0 }
						value={ days }
						onChange={ ( value ) => set( { days: value } ) }
					/>
				</FlexItem>
				<FlexItem>
					<NumberControl
						__next40pxDefaultSize
						label={ __( 'Hours', 'thingamablocks' ) }
						min={ 0 }
						max={ 23 }
						value={ hours }
						onChange={ ( value ) => set( { hours: value } ) }
					/>
				</FlexItem>
				<FlexItem>
					<NumberControl
						__next40pxDefaultSize
						label={ __( 'Minutes', 'thingamablocks' ) }
						min={ 0 }
						max={ 59 }
						value={ minutes }
						onChange={ ( value ) => set( { minutes: value } ) }
					/>
				</FlexItem>
			</Flex>
			<p className="tmb-countdown-help">
				{ __(
					'Each visitor gets their own deadline, counted from their first visit and remembered in their browser.',
					'thingamablocks'
				) }
			</p>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Start again when it ends', 'thingamablocks' ) }
				checked={ attributes.evergreenRestart }
				onChange={ ( value ) =>
					setAttributes( { evergreenRestart: value } )
				}
			/>
		</>
	);
}

function RecurringSettings( { attributes, setAttributes } ) {
	const { recurringTime, recurringDays } = attributes;
	const timeZone = siteTimeZone();
	const next = nextRecurring(
		Date.now(),
		recurringTime,
		recurringDays,
		timeZone
	);

	const toggleDay = ( day, checked ) => {
		const days = checked
			? [ ...recurringDays, day ]
			: recurringDays.filter( ( item ) => item !== day );

		// Every day ticked is the same as none: store it as "every day".
		setAttributes( {
			recurringDays: 7 === days.length ? [] : days.sort(),
		} );
	};

	const allDays = ! recurringDays.length;

	return (
		<>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				type="time"
				label={ __( 'Ends at', 'thingamablocks' ) }
				value={ recurringTime }
				// An emptied field keeps the last time rather than saving nothing.
				onChange={ ( value ) =>
					value && setAttributes( { recurringTime: value } )
				}
			/>
			<fieldset className="tmb-countdown-weekdays">
				<legend>{ __( 'On', 'thingamablocks' ) }</legend>
				{ WEEKDAYS().map( ( [ day, label ] ) => (
					<CheckboxControl
						key={ day }
						__nextHasNoMarginBottom
						label={ label }
						checked={ allDays || recurringDays.includes( day ) }
						onChange={ ( checked ) =>
							allDays
								? setAttributes( {
										recurringDays: WEEKDAYS()
											.map( ( [ d ] ) => d )
											.filter( ( d ) => d !== day )
											.sort(),
								  } )
								: toggleDay( day, checked )
						}
					/>
				) ) }
			</fieldset>
			<p className="tmb-countdown-help">
				{ next
					? sprintf(
							/* translators: %s: date and time. */
							__(
								'Next: %s. Then it starts over for the next one.',
								'thingamablocks'
							),
							formatMoment( next )
					  )
					: __( 'Pick at least one day.', 'thingamablocks' ) }
			</p>
		</>
	);
}

function TimingSettings( { attributes, setAttributes } ) {
	const { mode } = attributes;
	const { timezone } = getDateSettings();
	const offsetName = siteTimeZone();
	const zoneName =
		timezone?.string ||
		( '+00:00' === offsetName ? 'UTC' : `UTC${ offsetName }` );

	return (
		<PanelBody title={ __( 'Countdown', 'thingamablocks' ) }>
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Count down to', 'thingamablocks' ) }
				value={ mode }
				options={ [
					{
						value: 'date',
						label: __( 'A date and time', 'thingamablocks' ),
					},
					{
						value: 'evergreen',
						label: __(
							'A deadline per visitor (evergreen)',
							'thingamablocks'
						),
					},
					{
						value: 'recurring',
						label: __( 'A time that repeats', 'thingamablocks' ),
					},
				] }
				onChange={ ( value ) => setAttributes( { mode: value } ) }
			/>
			<div className="tmb-countdown-mode">
				{ 'date' === mode && (
					<DateSettings
						endDate={ attributes.endDate }
						setAttributes={ setAttributes }
					/>
				) }
				{ 'evergreen' === mode && (
					<EvergreenSettings
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				) }
				{ 'recurring' === mode && (
					<RecurringSettings
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				) }
			</div>
			{ 'evergreen' !== mode && (
				<p className="tmb-countdown-help">
					{ sprintf(
						/* translators: %s: time zone name. */
						__(
							'Times are in the site’s time zone (%s), set in Settings → General.',
							'thingamablocks'
						),
						zoneName
					) }
				</p>
			) }
		</PanelBody>
	);
}

function DisplaySettings( { attributes, setAttributes } ) {
	return (
		<PanelBody
			title={ __( 'Display', 'thingamablocks' ) }
			initialOpen={ false }
		>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Two-digit numbers', 'thingamablocks' ) }
				help={ __( 'Show 05 rather than 5.', 'thingamablocks' ) }
				checked={ attributes.padNumbers }
				onChange={ ( value ) => setAttributes( { padNumbers: value } ) }
			/>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ __( 'Hide units that reach zero', 'thingamablocks' ) }
				help={ __(
					'Drop leading units once they’re zero, e.g. hide Days on the last day. The last two units always show.',
					'thingamablocks'
				) }
				checked={ attributes.hideEmptyUnits }
				onChange={ ( value ) =>
					setAttributes( { hideEmptyUnits: value } )
				}
			/>
			<p className="tmb-countdown-help">
				{ __(
					'To drop a unit altogether, delete its box: the next unit keeps counting past its usual limit (e.g. 48 hours instead of 2 days).',
					'thingamablocks'
				) }
			</p>
		</PanelBody>
	);
}

function EndSettings( { attributes, setAttributes } ) {
	const neverEnds =
		'recurring' === attributes.mode ||
		( 'evergreen' === attributes.mode && attributes.evergreenRestart );

	return (
		<PanelBody
			title={ __( 'When it ends', 'thingamablocks' ) }
			initialOpen={ false }
		>
			{ neverEnds && (
				<Notice status="info" isDismissible={ false }>
					{ __(
						'This countdown starts its next run as soon as one ends, so these settings don’t come into play.',
						'thingamablocks'
					) }
				</Notice>
			) }
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'The countdown', 'thingamablocks' ) }
				value={ attributes.endAction }
				options={ [
					{
						value: 'message',
						label: __(
							'Shows its “ended” message',
							'thingamablocks'
						),
					},
					{
						value: 'zeros',
						label: __( 'Stays at zero', 'thingamablocks' ),
					},
					{
						value: 'hide',
						label: __( 'Disappears', 'thingamablocks' ),
					},
				] }
				onChange={ ( value ) => setAttributes( { endAction: value } ) }
			/>
			<TargetsControl
				label={ __( 'Also hide', 'thingamablocks' ) }
				value={ attributes.hideOnEnd }
				onChange={ ( value ) => setAttributes( { hideOnEnd: value } ) }
				help={ __(
					'Element IDs or CSS selectors, e.g. a sale banner or a “Buy now” button.',
					'thingamablocks'
				) }
			/>
			<TargetsControl
				label={ __( 'Also show', 'thingamablocks' ) }
				value={ attributes.showOnEnd }
				onChange={ ( value ) => setAttributes( { showOnEnd: value } ) }
				help={ __(
					'Hidden until it ends, e.g. a “Sold out” notice.',
					'thingamablocks'
				) }
			/>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				type="url"
				label={ __( 'Then go to (optional)', 'thingamablocks' ) }
				help={ __(
					'Send visitors to another page when it ends.',
					'thingamablocks'
				) }
				value={ attributes.redirectUrl }
				onChange={ ( value ) =>
					setAttributes( { redirectUrl: value } )
				}
			/>
		</PanelBody>
	);
}

function CountdownEdit( { attributes, setAttributes, clientId } ) {
	const [ previewEnded, setPreviewEnded ] = useState( false );
	const [ canvas, canvasRef ] = useCanvas();

	const parts = useSelect(
		( select ) => {
			const found = new Set();
			const walk = ( blocks ) =>
				blocks.forEach( ( block ) => {
					if ( 'thingamablocks/countdown' === block.name ) {
						return;
					}

					const part = partOf( block.attributes?.htmlAttributes );

					if ( part ) {
						found.add( part );
					}

					walk( block.innerBlocks );
				} );

			walk( select( blockEditorStore ).getBlocks( clientId ) );

			return [ ...found ].sort().join( ' ' );
		},
		[ clientId ]
	);

	// A new "date" countdown starts a week out, at the end of the day.
	useEffect( () => {
		if ( 'date' === attributes.mode && ! attributes.endDate ) {
			const inAWeek = new Date( Date.now() + 7 * 86400000 );
			setAttributes( {
				endDate: `${ formatDate( 'Y-m-d', inAWeek ) }T23:59:00`,
			} );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	const hasNumbers = UNITS.some( ( [ unit ] ) =>
		parts.includes( `part:${ unit }` )
	);
	const hasEnded = parts.includes( 'part:ended' );

	const blockProps = useBlockProps( {
		ref: canvasRef,
		className: `tmb-countdown ${
			previewEnded ? 'is-ended' : 'is-running'
		}`,
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps );

	// Show the parts for the state being previewed.
	const scope = `[data-block="${ clientId }"]`;
	let previewCss = previewEnded
		? `${ scope } [data-countdown-part="timer"]{${
				'message' === attributes.endAction
					? 'display:none!important'
					: ''
		  }}`
		: `${ scope } [data-countdown-part="ended"]{display:none!important}`;

	if ( previewEnded && 'hide' === attributes.endAction ) {
		previewCss += `${ scope }{opacity:.35}`;
	}

	return (
		<CanvasContext.Provider value={ canvas }>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ countdownIcon }
						isPressed={ previewEnded }
						label={
							previewEnded
								? __(
										'Previewing the ended state. Click to preview it running.',
										'thingamablocks'
								  )
								: __(
										'Previewing it running. Click to preview the ended state.',
										'thingamablocks'
								  )
						}
						onClick={ () => setPreviewEnded( ! previewEnded ) }
					>
						{ previewEnded
							? __( 'Ended', 'thingamablocks' )
							: __( 'Running', 'thingamablocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				{ ! hasNumbers && (
					<div className="tmb-countdown-notice">
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'No numbers yet. Select a GenerateBlocks Text block inside the countdown and set its “Countdown part” to a number.',
								'thingamablocks'
							) }
						</Notice>
					</div>
				) }
				<TimingSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<DisplaySettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<EndSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				{ 'message' === attributes.endAction && ! hasEnded && (
					<div className="tmb-countdown-notice">
						<Notice status="info" isDismissible={ false }>
							{ __(
								'There’s no “ended” message. Add a GenerateBlocks block inside the countdown and set its “Countdown part” to “Ended message”.',
								'thingamablocks'
							) }
						</Notice>
					</div>
				) }
			</InspectorControls>

			<CanvasStyle>{ previewCss }</CanvasStyle>
			<div { ...innerBlocksProps } />
		</CanvasContext.Provider>
	);
}

export default function Edit( props ) {
	const hasInnerBlocks = useSelect(
		( select ) =>
			select( blockEditorStore ).getBlockCount( props.clientId ) > 0,
		[ props.clientId ]
	);

	return hasInnerBlocks ? (
		<CountdownEdit { ...props } />
	) : (
		<VariationPlaceholder
			{ ...props }
			blockName="thingamablocks/countdown"
			icon={ countdownIcon }
			label={ __( 'Countdown', 'thingamablocks' ) }
			instructions={ __(
				'Choose a starting layout. Every part is a GenerateBlocks block, so you can restyle it afterwards.',
				'thingamablocks'
			) }
		/>
	);
}
