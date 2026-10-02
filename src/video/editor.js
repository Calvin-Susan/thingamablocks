/**
 * "Video background" panel on the GenerateBlocks Element block.
 *
 * The settings are stored as JSON in the Element's own HTML attributes
 * (data-tmb-video), so GenerateBlocks saves them like any other attribute.
 * The server checks them and adds the poster, overlay and button; the
 * front-end script adds the video (includes/class-thingamablocks-video-background.php).
 *
 * In the editor the poster (with the overlay) is shown as the container's
 * background, so editing stays quick: the video only plays on the site.
 */
import { __, sprintf } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import {
	BaseControl,
	Button,
	ColorPalette,
	FocalPointPicker,
	Notice,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- stable in practice; used across core.
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

import { bunnyMp4, classify } from './source';
import { useColorPalette } from '../shared/color-palette';
import './editor.scss';

const ELEMENT = 'generateblocks/element';
const KEY = 'data-tmb-video';

const hosts = () =>
	Array.isArray( window.tmbVideoHosts ) ? window.tmbVideoHosts : [];

const DEFAULTS = {
	loop: true,
	end: 'last',
	speed: 1,
	focus: '50% 50%',
	phones: 'video',
	overlay: '',
	opacity: 40,
	button: 'bottom-right',
	hero: false,
	ratio: '16:9',
};

const read = ( htmlAttributes ) => {
	try {
		const parsed = JSON.parse( htmlAttributes?.[ KEY ] || 'null' );
		return parsed && 'object' === typeof parsed ? parsed : null;
	} catch {
		return null;
	}
};

const MESSAGES = {
	invalid: () => __( 'That isn’t a web address.', 'thingamablocks' ),
	https: () => __( 'Use an https:// address.', 'thingamablocks' ),
	youtube: () =>
		__(
			'YouTube isn’t supported: use a Bunny or Vimeo video.',
			'thingamablocks'
		),
	host: () =>
		__(
			'Only Bunny (*.b-cdn.net, or a hostname added in Settings → Thingamablocks) and Vimeo videos can be used.',
			'thingamablocks'
		),
	'bunny-embed': () =>
		__(
			'That’s Bunny’s player link, which doesn’t include your library’s address. From the same “Video and asset links” panel, copy the HLS Playlist URL (or the Thumbnail URL) and paste it here instead: it’s turned into the video file automatically.',
			'thingamablocks'
		),
	hls: () =>
		__(
			'HLS streams (.m3u8) need a heavy player script. Use the MP4 version instead: in Bunny Stream, turn on “MP4 Fallback” in the library’s Encoding settings and use …/play_720p.mp4.',
			'thingamablocks'
		),
	'not-video': () =>
		__(
			'That doesn’t look like a video file: the address should end in .mp4 or .webm.',
			'thingamablocks'
		),
	'vimeo-page': () =>
		__(
			'Use the video’s address (vimeo.com/123456789) or a video file link from its Vimeo settings.',
			'thingamablocks'
		),
};

const describe = ( result ) => {
	if ( result.error ) {
		return MESSAGES[ result.error ]?.( result ) || MESSAGES.host();
	}

	return 'vimeo' === result.type
		? __(
				'Vimeo video: plays with Vimeo’s background player (needs a paid Vimeo plan; Vimeo loads a player for it). A video file link from Vimeo is lighter.',
				'thingamablocks'
		  )
		: __(
				'Video file: plays straight in the page, no player needed.',
				'thingamablocks'
		  );
};

function SourceField( { label, help, value, onChange, size = 720 } ) {
	const result = value ? classify( value, hosts() ) : null;
	// Whether the last paste was a Bunny link turned into its MP4 address.
	const [ converted, setConverted ] = useState( false );

	const change = ( next ) => {
		const mp4 = bunnyMp4( next, hosts(), size );

		setConverted( !! mp4 && mp4 !== next.trim() );
		onChange( mp4 || next );
	};

	return (
		<div className="tmb-video-control">
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				type="url"
				label={ label }
				help={ result ? describe( result ) : help }
				value={ value || '' }
				onChange={ change }
				placeholder="https://"
			/>
			{ converted && ! result?.error && (
				<Notice status="info" isDismissible={ false }>
					{ sprintf(
						/* translators: %s: video size, e.g. 720p. */
						__(
							'Turned that Bunny link into its video file (%s). If it doesn’t play, switch on “MP4 Fallback” in the library’s Encoding settings.',
							'thingamablocks'
						),
						`${ size }p`
					) }
				</Notice>
			) }
			{ result?.error && (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'This video won’t be used on the site.',
						'thingamablocks'
					) }
				</Notice>
			) }
		</div>
	);
}

function VideoPanel( { attributes, setAttributes } ) {
	const htmlAttributes = attributes.htmlAttributes || {};
	const stored = read( htmlAttributes );
	const settings = { ...DEFAULTS, ...( stored || {} ) };
	// The same colours GenerateBlocks' own pickers offer (GB Pro design tokens).
	const palette = useColorPalette( 'backgroundColor' );

	const posterUrl = useSelect(
		( select ) => {
			if ( ! settings.poster ) {
				return '';
			}

			const media = select( 'core' ).getMedia( settings.poster, {
				context: 'view',
			} );

			return (
				media?.media_details?.sizes?.large?.source_url ||
				media?.source_url ||
				''
			);
		},
		[ settings.poster ]
	);

	const update = ( next ) => {
		const merged = { ...settings, ...next };
		const updated = { ...htmlAttributes };
		const clean = {};

		delete updated[ KEY ];

		// Only what differs from the defaults, so the markup stays short.
		Object.entries( merged ).forEach( ( [ key, value ] ) => {
			if ( value !== DEFAULTS[ key ] && '' !== value && null !== value ) {
				clean[ key ] = value;
			}
		} );

		if ( ! clean.poster ) {
			delete clean.poster;
		}

		// "&", "<" and ">" escaped, so WordPress's content filter (for Authors
		// and Contributors) never sees them and can't turn "&" into "&amp;".
		if ( clean.src || clean.poster ) {
			updated[ KEY ] = JSON.stringify( clean )
				.replace( /&/g, '\\u0026' )
				.replace( /</g, '\\u003c' )
				.replace( />/g, '\\u003e' );
		}

		setAttributes( { htmlAttributes: updated } );
	};

	const source = settings.src ? classify( settings.src, hosts() ) : null;
	const [ fx, fy ] = String( settings.focus )
		.split( ' ' )
		.map( ( part ) => parseFloat( part ) / 100 );

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Video background', 'thingamablocks' ) }
				initialOpen={ !! stored }
				className="tmb-video-panel"
			>
				<SourceField
					label={ __( 'Video address', 'thingamablocks' ) }
					help={ __(
						'Bunny: paste the video’s HLS Playlist URL (or any link from its “Video and asset links”). Vimeo: the video’s address. Always muted.',
						'thingamablocks'
					) }
					value={ settings.src }
					onChange={ ( src ) => update( { src: src.trim() } ) }
				/>

				{ !! settings.src && (
					<>
						<BaseControl
							__nextHasNoMarginBottom
							id="tmb-video-poster"
							label={ __( 'Poster image', 'thingamablocks' ) }
							help={ __(
								'Shows straight away, while the video loads, and is all that visitors who prefer less motion or are saving data see. Use a frame from the video.',
								'thingamablocks'
							) }
						>
							<MediaUploadCheck>
								<MediaUpload
									allowedTypes={ [ 'image' ] }
									value={ settings.poster }
									onSelect={ ( media ) =>
										update( { poster: media.id } )
									}
									render={ ( { open } ) => (
										<div className="tmb-video-poster">
											{ posterUrl ? (
												<FocalPointPicker
													__nextHasNoMarginBottom
													label={ __(
														'Focal point (keeps it in frame on narrow screens)',
														'thingamablocks'
													) }
													url={ posterUrl }
													value={ {
														x: Number.isFinite( fx )
															? fx
															: 0.5,
														y: Number.isFinite( fy )
															? fy
															: 0.5,
													} }
													onChange={ ( point ) =>
														update( {
															focus: `${ Math.round(
																point.x * 100
															) }% ${ Math.round(
																point.y * 100
															) }%`,
														} )
													}
												/>
											) : null }
											<div className="tmb-video-poster__buttons">
												<Button
													variant="secondary"
													size="compact"
													onClick={ open }
												>
													{ settings.poster
														? __(
																'Replace',
																'thingamablocks'
														  )
														: __(
																'Choose an image',
																'thingamablocks'
														  ) }
												</Button>
												{ !! settings.poster && (
													<Button
														variant="tertiary"
														size="compact"
														isDestructive
														onClick={ () =>
															update( {
																poster: 0,
															} )
														}
													>
														{ __(
															'Remove',
															'thingamablocks'
														) }
													</Button>
												) }
											</div>
										</div>
									) }
								/>
							</MediaUploadCheck>
						</BaseControl>
						{ ! settings.poster && (
							<Notice status="warning" isDismissible={ false }>
								{ __(
									'Add a poster image: without one, the section is blank until the video loads, and for visitors who don’t get the video.',
									'thingamablocks'
								) }
							</Notice>
						) }

						<div className="tmb-video-control">
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __(
									'First thing on the page',
									'thingamablocks'
								) }
								help={ __(
									'For a hero: the poster loads straight away and first (it’s what the page’s loading score measures). Leave off for anything further down, so the poster loads when it’s needed.',
									'thingamablocks'
								) }
								checked={ !! settings.hero }
								onChange={ ( hero ) => update( { hero } ) }
							/>
						</div>

						<div className="tmb-video-control">
							<ToggleGroupControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								isBlock
								label={ __( 'Playback', 'thingamablocks' ) }
								value={ settings.loop ? 'loop' : 'once' }
								onChange={ ( value ) =>
									update( { loop: 'loop' === value } )
								}
							>
								<ToggleGroupControlOption
									value="loop"
									label={ __( 'Loop', 'thingamablocks' ) }
								/>
								<ToggleGroupControlOption
									value="once"
									label={ __(
										'Play once',
										'thingamablocks'
									) }
								/>
							</ToggleGroupControl>
						</div>

						{ ! settings.loop && (
							<div className="tmb-video-control">
								<ToggleGroupControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									isBlock
									label={ __(
										'When it ends',
										'thingamablocks'
									) }
									value={ settings.end }
									onChange={ ( end ) => update( { end } ) }
								>
									<ToggleGroupControlOption
										value="last"
										label={ __(
											'Stay on last frame',
											'thingamablocks'
										) }
									/>
									<ToggleGroupControlOption
										value="poster"
										label={ __(
											'Back to poster',
											'thingamablocks'
										) }
									/>
								</ToggleGroupControl>
							</div>
						) }

						<div className="tmb-video-control">
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __( 'Speed', 'thingamablocks' ) }
								value={ String( settings.speed ) }
								options={ [
									{
										value: '0.5',
										label: __(
											'Half speed',
											'thingamablocks'
										),
									},
									{
										value: '0.75',
										label: __(
											'Slow motion (0.75×)',
											'thingamablocks'
										),
									},
									{
										value: '1',
										label: __( 'Normal', 'thingamablocks' ),
									},
									{
										value: '1.25',
										label: __(
											'A little faster (1.25×)',
											'thingamablocks'
										),
									},
								] }
								onChange={ ( speed ) =>
									update( { speed: Number( speed ) } )
								}
							/>
						</div>

						<div className="tmb-video-control">
							<ToggleGroupControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								isBlock
								label={ __( 'On phones', 'thingamablocks' ) }
								value={ settings.phones }
								onChange={ ( phones ) => update( { phones } ) }
							>
								<ToggleGroupControlOption
									value="video"
									label={ __( 'Video', 'thingamablocks' ) }
								/>
								<ToggleGroupControlOption
									value="poster"
									label={ __(
										'Poster only',
										'thingamablocks'
									) }
								/>
							</ToggleGroupControl>
						</div>

						{ 'video' === settings.phones && (
							<SourceField
								label={ __(
									'Smaller video for phones (optional)',
									'thingamablocks'
								) }
								help={ __(
									'Screens under 768px wide play this instead. Paste the same Bunny link and you get the 480p version. Saves visitors’ data.',
									'thingamablocks'
								) }
								value={ settings.mobile }
								size={ 480 }
								onChange={ ( mobile ) =>
									update( { mobile: mobile.trim() } )
								}
							/>
						) }

						{ 'vimeo' === source?.type && (
							<div className="tmb-video-control">
								<SelectControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={ __(
										'Vimeo video shape',
										'thingamablocks'
									) }
									help={ __(
										'So Vimeo’s player can be scaled to fill the section.',
										'thingamablocks'
									) }
									value={ settings.ratio }
									options={ [
										'16:9',
										'21:9',
										'4:3',
										'1:1',
										'9:16',
									].map( ( value ) => ( {
										value,
										label: value,
									} ) ) }
									onChange={ ( ratio ) =>
										update( { ratio } )
									}
								/>
							</div>
						) }

						<BaseControl
							__nextHasNoMarginBottom
							id="tmb-video-overlay"
							label={ __( 'Overlay', 'thingamablocks' ) }
							help={ __(
								'A colour over the video, so text on it stays readable. Check the contrast against the poster.',
								'thingamablocks'
							) }
						>
							<ColorPalette
								colors={ palette }
								__experimentalIsRenderedInSidebar
								value={ settings.overlay }
								onChange={ ( overlay ) =>
									update( { overlay: overlay || '' } )
								}
								clearable
							/>
						</BaseControl>
						{ !! settings.overlay && (
							<RangeControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __(
									'Overlay opacity (%)',
									'thingamablocks'
								) }
								min={ 0 }
								max={ 90 }
								value={ settings.opacity }
								onChange={ ( opacity ) =>
									update( { opacity: opacity ?? 40 } )
								}
							/>
						) }

						<div className="tmb-video-control">
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __(
									'Pause button position',
									'thingamablocks'
								) }
								help={ __(
									'Always there: anything that moves for more than five seconds needs a way to pause it. To use your own, add a GenerateBlocks button inside this container and turn on “Video pause/play button” in its settings.',
									'thingamablocks'
								) }
								value={ settings.button }
								options={ [
									{
										value: 'bottom-right',
										label: __(
											'Bottom right',
											'thingamablocks'
										),
									},
									{
										value: 'bottom-left',
										label: __(
											'Bottom left',
											'thingamablocks'
										),
									},
									{
										value: 'top-right',
										label: __(
											'Top right',
											'thingamablocks'
										),
									},
									{
										value: 'top-left',
										label: __(
											'Top left',
											'thingamablocks'
										),
									},
								] }
								onChange={ ( button ) => update( { button } ) }
							/>
						</div>

						<Button
							variant="tertiary"
							isDestructive
							onClick={ () => {
								const updated = { ...htmlAttributes };
								delete updated[ KEY ];
								setAttributes( { htmlAttributes: updated } );
							} }
						>
							{ __(
								'Remove video background',
								'thingamablocks'
							) }
						</Button>
					</>
				) }
			</PanelBody>
		</InspectorControls>
	);
}

// The "this is the pause/play button" switch on a GB Text block inside a
// container with a video background.
function ButtonPartPanel( { attributes, setAttributes } ) {
	const htmlAttributes = attributes.htmlAttributes || {};
	const on = 'button' === htmlAttributes[ 'data-video-part' ];

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Video background', 'thingamablocks' ) }>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Video pause/play button', 'thingamablocks' ) }
					help={ __(
						'Pauses and plays the container’s video background, instead of the default round button. Use a Text block set to <button>; style it with &[data-state="playing"] / &[data-state="paused"]. Its label is set for screen readers.',
						'thingamablocks'
					) }
					checked={ on }
					onChange={ ( checked ) => {
						const updated = { ...htmlAttributes };

						delete updated[ 'data-video-part' ];

						if ( checked ) {
							updated[ 'data-video-part' ] = 'button';
						}

						setAttributes( { htmlAttributes: updated } );
					} }
				/>
			</PanelBody>
		</InspectorControls>
	);
}

const withVideoBackground = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { name, clientId, isSelected } = props;
		const isText = 'generateblocks/text' === name;

		const insideVideo = useSelect(
			( select ) => {
				if ( ! isText || ! isSelected ) {
					return false;
				}

				const store = select( blockEditorStore );

				return store
					.getBlockParentsByBlockName( clientId, ELEMENT )
					.some(
						( id ) =>
							!! store.getBlockAttributes( id )?.htmlAttributes?.[
								KEY
							]
					);
			},
			[ clientId, isText, isSelected ]
		);

		return (
			<>
				<BlockEdit { ...props } />
				{ ELEMENT === name && isSelected && (
					<VideoPanel
						attributes={ props.attributes }
						setAttributes={ props.setAttributes }
					/>
				) }
				{ insideVideo && (
					<ButtonPartPanel
						attributes={ props.attributes }
						setAttributes={ props.setAttributes }
					/>
				) }
			</>
		);
	},
	'withVideoBackground'
);

addFilter(
	'editor.BlockEdit',
	'thingamablocks/video-background',
	withVideoBackground
);

// In the editor, show the poster (and overlay) as the container's background.
const withPosterPreview = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const stored =
			ELEMENT === props.name
				? read( props.attributes.htmlAttributes )
				: null;
		// Only previewed when the site would show it (a usable video).
		const settings =
			stored?.src && ! classify( stored.src, hosts() ).error
				? stored
				: null;

		const posterUrl = useSelect(
			( select ) => {
				if ( ! settings?.poster ) {
					return '';
				}

				const media = select( 'core' ).getMedia( settings.poster, {
					context: 'view',
				} );

				return (
					media?.media_details?.sizes?.large?.source_url ||
					media?.source_url ||
					''
				);
			},
			[ settings?.poster ]
		);

		if ( ! posterUrl ) {
			return <BlockListBlock { ...props } />;
		}

		const opacity = ( settings.opacity ?? DEFAULTS.opacity ) / 100;
		const layers = [ `url("${ encodeURI( posterUrl ) }")` ];

		if ( settings.overlay && opacity > 0 ) {
			const tint = `color-mix(in srgb, ${
				settings.overlay
			} ${ Math.round( opacity * 100 ) }%, transparent)`;
			layers.unshift( `linear-gradient(${ tint }, ${ tint })` );
		}

		const wrapperProps = {
			...props.wrapperProps,
			style: {
				...( props.wrapperProps?.style || {} ),
				backgroundImage: layers.join( ', ' ),
				backgroundSize: 'cover',
				backgroundPosition: settings.focus || DEFAULTS.focus,
			},
		};

		return <BlockListBlock { ...props } wrapperProps={ wrapperProps } />;
	},
	'withPosterPreview'
);

addFilter(
	'editor.BlockListBlock',
	'thingamablocks/video-background-preview',
	withPosterPreview
);
