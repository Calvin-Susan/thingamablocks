<?php
/**
 * Video backgrounds for GenerateBlocks Element blocks (containers).
 *
 * The editor's "Video background" panel stores the settings as JSON in the
 * Element's own HTML attributes (data-tmb-video). When that Element renders,
 * this checks every setting, rebuilds the JSON for the front-end script from
 * the clean values, and adds the background inside the Element:
 *
 *   - a poster image (from the Media Library, with srcset): what visitors see
 *     first, what the page's loading score measures, and all that visitors
 *     who prefer reduced motion or are saving data get;
 *   - an optional colour overlay, for text contrast;
 *   - a pause/play button (WCAG 2.2.2), unless the Element has its own GB
 *     button marked data-video-part="button".
 *
 * The video itself isn't in the HTML: the script adds it once the page has
 * loaded and the Element is on screen. Only Bunny (*.b-cdn.net, plus
 * hostnames an admin lists in Settings) and Vimeo are accepted, over HTTPS.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders video backgrounds and checks their sources.
 */
class Thingamablocks_Video_Background {

	const OPTION = 'thingamablocks_video_hosts';

	const POSITIONS = array( 'bottom-right', 'bottom-left', 'top-right', 'top-left' );

	const SPEEDS = array( 0.5, 0.75, 1, 1.25 );

	const RATIOS = array( '16:9', '21:9', '4:3', '1:1', '9:16' );

	/**
	 * Hook in.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_assets' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_setting' ) );
		add_filter( 'render_block_generateblocks/element', array( __CLASS__, 'render' ), 20, 2 );
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_editor' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'head_style' ) );
	}

	/**
	 * The front-end script and CSS, enqueued only by an Element with a video.
	 */
	public static function register_assets() {
		$asset_file = THINGAMABLOCKS_DIR . 'build/video/view.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;
		$base  = plugins_url( 'build/video/', THINGAMABLOCKS_DIR . 'thingamablocks.php' );

		wp_register_script(
			'thingamablocks-video',
			$base . 'view.js',
			$asset['dependencies'],
			$asset['version'],
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
		);

		wp_register_style( 'thingamablocks-video', $base . 'view.css', array(), $asset['version'] );

		// The script re-checks sources against the same hosts as here.
		$hosts = self::hosts();

		if ( $hosts ) {
			wp_add_inline_script( 'thingamablocks-video', 'window.tmbVideoHosts = ' . wp_json_encode( $hosts ) . ';', 'before' );
		}
	}

	/**
	 * Extra Bunny hostnames (Settings → Thingamablocks).
	 */
	public static function register_setting() {
		register_setting(
			'thingamablocks',
			self::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize_hosts' ),
				'default'           => array(),
			)
		);
	}

	/**
	 * Hostnames from the settings textarea: one per line (or comma
	 * separated), lower case, nothing but valid hostnames.
	 *
	 * @param mixed $input Submitted value.
	 * @return string[]
	 */
	public static function sanitize_hosts( $input ) {
		if ( is_string( $input ) ) {
			$input = preg_split( '/[\s,]+/', $input );
		}

		$hosts = array();

		foreach ( is_array( $input ) ? $input : array() as $host ) {
			$host = strtolower( trim( (string) $host ) );
			// Pasted a URL? Keep its hostname.
			$host = (string) ( wp_parse_url( false === strpos( $host, '//' ) ? 'https://' . $host : $host, PHP_URL_HOST ) ?? '' );

			if ( preg_match( '/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/', $host ) ) {
				$hosts[] = $host;
			}
		}

		return array_slice( array_values( array_unique( $hosts ) ), 0, 20 );
	}

	/**
	 * The extra Bunny hostnames allowed.
	 *
	 * @return string[]
	 */
	public static function hosts() {
		$hosts = get_option( self::OPTION, array() );

		return is_array( $hosts ) ? self::sanitize_hosts( $hosts ) : array();
	}

	/**
	 * What a video URL is: a Bunny or Vimeo video file (played in <video>), a
	 * Vimeo video (played with Vimeo's background player), or not allowed
	 * (with why). Mirrors src/video/source.js.
	 *
	 * @param mixed $url URL.
	 * @return array { type: 'file'|'vimeo', src?, id?, hash? } or { error }
	 */
	public static function classify( $url ) {
		if ( ! is_string( $url ) || '' === trim( $url ) || preg_match( '/[\s<>"\']/', trim( $url ) ) ) {
			return array( 'error' => 'invalid' );
		}

		$url   = trim( $url );
		$parts = wp_parse_url( $url );

		if ( empty( $parts['host'] ) || empty( $parts['scheme'] ) ) {
			return array( 'error' => 'invalid' );
		}

		if ( 'https' !== strtolower( $parts['scheme'] ) || isset( $parts['user'] ) || isset( $parts['pass'] ) || isset( $parts['port'] ) ) {
			return array( 'error' => 'https' );
		}

		$host = strtolower( $parts['host'] );
		$path = $parts['path'] ?? '/';
		$hash = '';

		if ( isset( $parts['query'] ) ) {
			parse_str( $parts['query'], $query );
			$hash = is_string( $query['h'] ?? null ) ? $query['h'] : '';
		}

		if ( 'vimeo.com' === $host || 'www.vimeo.com' === $host ) {
			if ( preg_match( '#^/(\d+)(?:/([a-f0-9]+))?/?$#', $path, $match ) ) {
				return self::vimeo( $match[1], $match[2] ?? $hash );
			}

			return array( 'error' => 'vimeo-page' );
		}

		if ( 'player.vimeo.com' === $host ) {
			if ( preg_match( '#^/video/(\d+)/?$#', $path, $match ) ) {
				return self::vimeo( $match[1], $hash );
			}

			if ( preg_match( '#^/(progressive_redirect|external)/#', $path ) ) {
				return array(
					'type' => 'file',
					'src'  => esc_url_raw( $url, array( 'https' ) ),
				);
			}

			return array( 'error' => 'vimeo-page' );
		}

		if ( self::ends_with( $host, '.vimeocdn.com' ) ) {
			return array(
				'type' => 'file',
				'src'  => esc_url_raw( $url, array( 'https' ) ),
			);
		}

		if ( 'iframe.mediadelivery.net' === $host || 'video.bunnycdn.com' === $host || 'player.mediadelivery.net' === $host ) {
			return array( 'error' => 'bunny-embed' );
		}

		if ( ! self::ends_with( $host, '.b-cdn.net' ) && ! in_array( $host, self::hosts(), true ) ) {
			return array( 'error' => preg_match( '/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/', $host ) ? 'youtube' : 'host' );
		}

		if ( preg_match( '/\.m3u8$/i', $path ) ) {
			return array( 'error' => 'hls' );
		}

		if ( ! preg_match( '/\.(mp4|webm|m4v|mov)$/i', $path ) ) {
			return array( 'error' => 'not-video' );
		}

		return array(
			'type' => 'file',
			'src'  => esc_url_raw( $url, array( 'https' ) ),
		);
	}

	/**
	 * A Vimeo video by ID (and, for unlisted videos, its privacy hash).
	 *
	 * @param string $id   Video ID.
	 * @param string $hash Privacy hash.
	 * @return array
	 */
	private static function vimeo( $id, $hash ) {
		return array(
			'type' => 'vimeo',
			'id'   => $id,
			'hash' => preg_match( '/^[a-f0-9]{1,32}$/', (string) $hash ) ? $hash : '',
		);
	}

	/**
	 * Whether a string ends with another (PHP 7.4 has no str_ends_with()).
	 *
	 * @param string $haystack String.
	 * @param string $needle   Ending.
	 * @return bool
	 */
	private static function ends_with( $haystack, $needle ) {
		return '' !== $needle && substr( $haystack, -strlen( $needle ) ) === $needle;
	}

	/**
	 * A CSS colour from the overlay setting, or ''. Hex, rgb()/hsl(), a
	 * named colour or a var() (theme and GeneratePress global colours).
	 *
	 * @param mixed $value Colour.
	 * @return string
	 */
	public static function color( $value ) {
		$value = is_string( $value ) ? trim( $value ) : '';

		if ( preg_match( '/^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla)\([0-9.,%\s\/deg]+\)|var\(--[A-Za-z0-9_-]+(,\s*#[0-9a-fA-F]{3,8})?\)|[a-zA-Z]{3,20})$/', $value ) ) {
			return $value;
		}

		return '';
	}

	/**
	 * The clean settings from the stored JSON, or null if there's no
	 * usable video.
	 *
	 * @param mixed $json Stored settings.
	 * @return array|null
	 */
	public static function settings( $json ) {
		$raw = is_string( $json ) ? json_decode( $json, true ) : null;

		if ( ! is_array( $raw ) ) {
			return null;
		}

		// Content saved before the editor escaped "&" may have had it turned
		// into "&amp;" by WordPress's content filter (Authors, Contributors).
		$url = function ( $value ) {
			return is_string( $value ) ? str_replace( '&amp;', '&', $value ) : '';
		};

		$source = self::classify( $url( $raw['src'] ?? '' ) );

		if ( isset( $source['error'] ) ) {
			return null;
		}

		$mobile = ! empty( $raw['mobile'] ) ? self::classify( $url( $raw['mobile'] ) ) : array( 'error' => 'none' );
		$focus  = is_string( $raw['focus'] ?? null ) && preg_match( '/^(\d{1,3}(\.\d+)?)% (\d{1,3}(\.\d+)?)%$/', $raw['focus'] ) ? $raw['focus'] : '50% 50%';
		$speed  = (float) ( $raw['speed'] ?? 1 );

		return array(
			'source'  => $source,
			'mobile'  => isset( $mobile['error'] ) ? null : $mobile,
			'poster'  => absint( $raw['poster'] ?? 0 ),
			'loop'    => ! isset( $raw['loop'] ) || false !== $raw['loop'],
			'end'     => 'poster' === ( $raw['end'] ?? '' ) ? 'poster' : 'last',
			'speed'   => in_array( $speed, self::SPEEDS, true ) ? $speed : 1,
			'focus'   => $focus,
			'phones'  => 'poster' === ( $raw['phones'] ?? '' ) ? 'poster' : 'video',
			'overlay' => self::color( $raw['overlay'] ?? '' ),
			'opacity' => max( 0, min( 90, (int) ( $raw['opacity'] ?? 40 ) ) ),
			'button'  => in_array( $raw['button'] ?? '', self::POSITIONS, true ) ? $raw['button'] : 'bottom-right',
			'hero'    => ! empty( $raw['hero'] ),
			'ratio'   => in_array( $raw['ratio'] ?? '', self::RATIOS, true ) ? $raw['ratio'] : '16:9',
		);
	}

	/**
	 * Add the background to an Element that has one.
	 *
	 * @param string $content Rendered block.
	 * @param array  $block   Parsed block.
	 * @return string
	 */
	public static function render( $content, $block ) {
		if ( false === strpos( $content, 'data-tmb-video' ) ) {
			return $content;
		}

		$json = $block['attrs']['htmlAttributes']['data-tmb-video'] ?? null;
		$tags = new WP_HTML_Tag_Processor( $content );

		if ( ! $tags->next_tag() ) {
			return $content;
		}

		$settings = null !== $json ? self::settings( $json ) : null;
		$tag      = strtolower( (string) $tags->get_tag() );
		$close    = strrpos( $content, '</' . $tag );

		// No usable video (none set, a source that isn't allowed, or the
		// attribute typed into the markup by hand): no background, no script.
		if ( ! $settings || false === $close ) {
			$tags->remove_attribute( 'data-tmb-video' );
			return $tags->get_updated_html();
		}

		// The front-end script reads this: rebuilt from the clean values only.
		$tags->set_attribute( 'data-tmb-video', wp_json_encode( self::script_config( $settings ) ) );
		$tags->add_class( 'tmb-has-video' );
		$content = $tags->get_updated_html();

		// This container's own button (not one belonging to a nested video).
		$own           = new Thingamablocks_Html( $content );
		$custom_button = $own->next_own_tag( 'data-video-part', 'button', 'data-tmb-video' );

		if ( $custom_button ) {
			self::wire_custom_button( $own );
			$content = $own->get_updated_html();
		}

		$background = self::layer( $settings ) . ( $custom_button ? '' : self::button( $settings ) );

		wp_enqueue_script( 'thingamablocks-video' );
		wp_enqueue_style( 'thingamablocks-video' );

		// At the end, so the container's first child is still its first
		// content (":first-child" and spacing rules are unchanged).
		$close = strrpos( $content, '</' . $tag );

		return substr_replace( $content, $background, $close, 0 );
	}

	/**
	 * In <head> when the page being viewed has a video background, so the
	 * layout is right before the content paints (enqueued while rendering,
	 * a classic theme would print it in the footer). The layer and poster
	 * also carry the few styles that matter inline, for anywhere else.
	 */
	public static function head_style() {
		$post = is_singular() ? get_queried_object() : null;

		if ( $post instanceof WP_Post && false !== strpos( $post->post_content, '"data-tmb-video":' ) ) {
			wp_enqueue_style( 'thingamablocks-video' );
		}
	}

	/**
	 * What the front-end script needs.
	 *
	 * @param array $settings Clean settings.
	 * @return array
	 */
	private static function script_config( $settings ) {
		$source = function ( $source ) use ( $settings ) {
			if ( ! $source ) {
				return null;
			}

			if ( 'vimeo' === $source['type'] ) {
				return array(
					'type'  => 'vimeo',
					'id'    => $source['id'],
					'hash'  => $source['hash'],
					'ratio' => $settings['ratio'],
				);
			}

			return array(
				'type' => 'file',
				'src'  => $source['src'],
			);
		};

		return array(
			'src'    => $source( $settings['source'] ),
			'mobile' => $source( $settings['mobile'] ),
			'loop'   => $settings['loop'],
			'end'    => $settings['end'],
			'speed'  => $settings['speed'],
			'phones' => $settings['phones'],
		);
	}

	/**
	 * The background layer: poster, overlay (the video is added by the script).
	 *
	 * @param array $settings Clean settings.
	 * @return string
	 */
	private static function layer( $settings ) {
		$poster = '';

		if ( $settings['poster'] && wp_attachment_is_image( $settings['poster'] ) ) {
			$poster = wp_get_attachment_image(
				$settings['poster'],
				'full',
				false,
				array(
					'class'         => 'tmb-video-bg__poster',
					'alt'           => '',
					// Right before the stylesheet arrives too (no layout shift).
					'style'         => 'position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;object-position:var(--tmb-video-focus,50% 50%)',
					'sizes'         => '100vw',
					'decoding'      => 'async',
					// The first thing on the page: load it straight away, first.
					'loading'       => $settings['hero'] ? false : 'lazy',
					'fetchpriority' => $settings['hero'] ? 'high' : 'auto',
				)
			);
		}

		$overlay = '';

		if ( '' !== $settings['overlay'] && $settings['opacity'] > 0 ) {
			$overlay = sprintf(
				'<div class="tmb-video-bg__overlay" style="%s"></div>',
				esc_attr( 'background-color:' . $settings['overlay'] . ';opacity:' . sprintf( '%.2F', $settings['opacity'] / 100 ) . ';' )
			);
		}

		// Once per page: the container holds the layer even before (or
		// without) the stylesheet. Zero specificity, so a position set in
		// GenerateBlocks still wins. Inside the layer, which is the
		// container's last child, so it can't upset any layout rules.
		static $critical = false;

		$style = '';

		if ( ! $critical ) {
			$critical = true;
			$style    = '<style>:where(.tmb-has-video){position:relative;isolation:isolate}</style>';
		}

		return sprintf(
			'<div class="tmb-video-bg" data-tmb-video-layer aria-hidden="true" inert style="%1$s">%4$s%2$s%3$s</div>',
			esc_attr( 'position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none;--tmb-video-focus:' . $settings['focus'] . ';' ),
			$poster,
			$overlay,
			$style
		);
	}

	/**
	 * The pause/play button. Hidden until the script shows it (with no
	 * script, nothing moves and there's nothing to pause).
	 *
	 * @param array $settings Clean settings.
	 * @return string
	 */
	private static function button( $settings ) {
		$pause = '<svg class="tmb-video-bg__icon-pause" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
		$play  = '<svg class="tmb-video-bg__icon-play" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.14v13.72a.5.5 0 0 0 .76.43l10.6-6.86a.5.5 0 0 0 0-.86L8.76 4.71A.5.5 0 0 0 8 5.14Z"/></svg>';

		return sprintf(
			'<button type="button" class="tmb-video-bg__button" data-position="%1$s" aria-label="%2$s" data-label-pause="%2$s" data-label-play="%3$s" hidden>%4$s%5$s</button>',
			esc_attr( $settings['button'] ),
			esc_attr__( 'Pause background video', 'thingamablocks' ),
			esc_attr__( 'Play background video', 'thingamablocks' ),
			$pause,
			$play
		);
	}

	/**
	 * Your own GB button as the pause/play button: a real button, with the
	 * labels for the script, hidden until the script shows it.
	 *
	 * @param WP_HTML_Tag_Processor $tags Processor, on the button.
	 */
	private static function wire_custom_button( $tags ) {
		if ( 'BUTTON' === $tags->get_tag() ) {
			$tags->set_attribute( 'type', 'button' );
		} else {
			$tags->set_attribute( 'role', 'button' );
			$tags->set_attribute( 'tabindex', '0' );
		}

		$tags->set_attribute( 'data-label-pause', __( 'Pause background video', 'thingamablocks' ) );
		$tags->set_attribute( 'data-label-play', __( 'Play background video', 'thingamablocks' ) );

		$style = rtrim( (string) $tags->get_attribute( 'style' ), '; ' );
		$tags->set_attribute( 'style', ( '' !== $style ? $style . ';' : '' ) . 'display:none' );
	}

	/**
	 * The "Video background" panel in the editor.
	 */
	public static function enqueue_editor() {
		// Switched off in Settings → Thingamablocks: no panel (existing videos keep playing).
		if ( ! thingamablocks_is_enabled( 'video' ) ) {
			return;
		}

		$asset_file = THINGAMABLOCKS_DIR . 'build/video/editor.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'thingamablocks-video-editor',
			plugins_url( 'build/video/editor.js', THINGAMABLOCKS_DIR . 'thingamablocks.php' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_add_inline_script(
			'thingamablocks-video-editor',
			'window.tmbVideoHosts = ' . wp_json_encode( self::hosts() ) . ';',
			'before'
		);

		wp_set_script_translations( 'thingamablocks-video-editor', 'thingamablocks' );

		if ( file_exists( THINGAMABLOCKS_DIR . 'build/video/editor.css' ) ) {
			wp_enqueue_style( 'thingamablocks-video-editor', plugins_url( 'build/video/editor.css', THINGAMABLOCKS_DIR . 'thingamablocks.php' ), array(), $asset['version'] );
		}
	}
}

Thingamablocks_Video_Background::init();
