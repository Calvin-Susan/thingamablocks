/**
 * "Countdown part" settings on GenerateBlocks blocks inside a Countdown.
 *
 * The choice is stored in the block's own GenerateBlocks HTML attributes, as
 * data-countdown-part (numbers, timer, ended, separator) or
 * data-countdown-unit (a unit's box).
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls, store as blockEditorStore } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

const PART_BLOCKS = [ 'generateblocks/element', 'generateblocks/text', 'generateblocks/shape' ];

export function partOptions( blockName ) {
	const options = [
		{ value: '', label: __( 'None (decoration or label)', 'toggle-for-generateblocks' ) },
		{ value: 'part:days', label: __( 'Days number', 'toggle-for-generateblocks' ) },
		{ value: 'part:hours', label: __( 'Hours number', 'toggle-for-generateblocks' ) },
		{ value: 'part:minutes', label: __( 'Minutes number', 'toggle-for-generateblocks' ) },
		{ value: 'part:seconds', label: __( 'Seconds number', 'toggle-for-generateblocks' ) },
		{ value: 'unit:days', label: __( 'Days box', 'toggle-for-generateblocks' ) },
		{ value: 'unit:hours', label: __( 'Hours box', 'toggle-for-generateblocks' ) },
		{ value: 'unit:minutes', label: __( 'Minutes box', 'toggle-for-generateblocks' ) },
		{ value: 'unit:seconds', label: __( 'Seconds box', 'toggle-for-generateblocks' ) },
		{ value: 'part:timer', label: __( 'Timer (hidden when it ends)', 'toggle-for-generateblocks' ) },
		{ value: 'part:ended', label: __( 'Ended message (shown when it ends)', 'toggle-for-generateblocks' ) },
		{ value: 'part:separator', label: __( 'Separator', 'toggle-for-generateblocks' ) },
	];

	// Numbers replace the block's text, so only Text blocks can be numbers.
	return 'generateblocks/text' === blockName
		? options
		: options.filter( ( option ) => ! /^part:(days|hours|minutes|seconds)$/.test( option.value ) );
}

/**
 * The part a block is, as "part:days", "unit:hours", … or ''.
 *
 * @param {Object} htmlAttributes GenerateBlocks HTML attributes.
 * @return {string} Part.
 */
export function partOf( htmlAttributes = {} ) {
	if ( htmlAttributes[ 'data-countdown-part' ] ) {
		return `part:${ htmlAttributes[ 'data-countdown-part' ] }`;
	}

	if ( htmlAttributes[ 'data-countdown-unit' ] ) {
		return `unit:${ htmlAttributes[ 'data-countdown-unit' ] }`;
	}

	return '';
}

function helpText( value ) {
	if ( /^part:(days|hours|minutes|seconds)$/.test( value ) ) {
		return __(
			'This block’s text is replaced with the number. Leave a placeholder like 00 in it.',
			'toggle-for-generateblocks'
		);
	}

	if ( value.startsWith( 'unit:' ) ) {
		return __(
			'The box around a number and its label. It’s hidden with the number when “Hide units that reach zero” is on.',
			'toggle-for-generateblocks'
		);
	}

	if ( 'part:separator' === value ) {
		return __( 'Hidden from screen readers, e.g. a colon between numbers.', 'toggle-for-generateblocks' );
	}

	return __( 'What this block is in the countdown.', 'toggle-for-generateblocks' );
}

const withCountdownPartControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, clientId, attributes, setAttributes, isSelected } = props;
		const isPartBlock = PART_BLOCKS.includes( name );

		const insideCountdown = useSelect(
			( select ) =>
				isPartBlock &&
				isSelected &&
				select( blockEditorStore ).getBlockParentsByBlockName( clientId, 'ogal/countdown' )
					.length > 0,
			[ clientId, isPartBlock, isSelected ]
		);

		if ( ! insideCountdown ) {
			return <BlockEdit { ...props } />;
		}

		const htmlAttributes = attributes.htmlAttributes || {};
		const value = partOf( htmlAttributes );

		const onChange = ( next ) => {
			const updated = { ...htmlAttributes };

			delete updated[ 'data-countdown-part' ];
			delete updated[ 'data-countdown-unit' ];

			if ( next ) {
				const [ kind, part ] = next.split( ':' );
				updated[ 'part' === kind ? 'data-countdown-part' : 'data-countdown-unit' ] = part;
			}

			setAttributes( { htmlAttributes: updated } );
		};

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody title={ __( 'Countdown part', 'toggle-for-generateblocks' ) }>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'This block is', 'toggle-for-generateblocks' ) }
							value={ value }
							options={ partOptions( name ) }
							help={ helpText( value ) }
							onChange={ onChange }
						/>
					</PanelBody>
				</InspectorControls>
			</>
		);
	},
	'withCountdownPartControl'
);

addFilter( 'editor.BlockEdit', 'ogal-countdown/countdown-part-control', withCountdownPartControl );
