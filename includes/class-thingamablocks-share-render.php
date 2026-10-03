<?php
/**
 * Front-end rendering for the Share block.
 *
 * The block holds ordinary GenerateBlocks blocks. Each share button is a GB
 * Text block marked with data-share-network ("x", "linkedin", "copy"…),
 * styled and given its icon in GB like any other Text block. PHP fills in
 * each button for the post being viewed: the network's share link (built
 * here from a fixed list, so a saved or forged href never reaches the page),
 * target/rel, and a name for icon-only buttons ("Share on LinkedIn"). A
 * Text block marked data-share-part="label" names the list
 * (data-share-part="list") for screen readers.
 *
 * Nothing is tracked and nothing loads from the networks. A small script
 * loads only for a Copy link or "Share…" button.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Share block.
 */
class Thingamablocks_Share_Render {

	/**
	 * A share button: a link or button carrying data-share-network. (GB
	 * renders these as one element with no nested <a>/<button>.)
	 */
	const BUTTON = '#<(a|button)\b((?:[^>"\']|"[^"]*"|\'[^\']*\')*?\sdata-share-network="([a-z]+)"(?:[^>"\']|"[^"]*"|\'[^\']*\')*)>(.*?)</\1>#is';

	/**
	 * Whether a Share block has been shown on this page.
	 *
	 * @var bool
	 */
	private static $shown = false;

	/**
	 * Hook up.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_script' ) );
	}

	/**
	 * The copy/share script, enqueued only by a block with one of those
	 * buttons.
	 */
	public static function register_script() {
		$asset_file = THINGAMABLOCKS_DIR . 'build/share/view.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_register_script(
			'thingamablocks-share',
			plugins_url( 'build/share/view.js', THINGAMABLOCKS_DIR . 'thingamablocks.php' ),
			$asset['dependencies'],
			$asset['version'],
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
		);
	}

	/**
	 * The networks: what a button's name says, and which kind of button it
	 * is. Matches src/share/networks.js.
	 *
	 * @return array Key => [ name, type: link|copy|native ].
	 */
	public static function networks() {
		return array(
			'x'         => array( 'X', 'link' ),
			'linkedin'  => array( 'LinkedIn', 'link' ),
			'facebook'  => array( 'Facebook', 'link' ),
			'bluesky'   => array( 'Bluesky', 'link' ),
			'threads'   => array( 'Threads', 'link' ),
			'reddit'    => array( 'Reddit', 'link' ),
			'whatsapp'  => array( 'WhatsApp', 'link' ),
			'telegram'  => array( 'Telegram', 'link' ),
			'pinterest' => array( 'Pinterest', 'link' ),
			'email'     => array( __( 'Email', 'thingamablocks' ), 'link' ),
			'copy'      => array( __( 'Copy link', 'thingamablocks' ), 'copy' ),
			'native'    => array( __( 'Share', 'thingamablocks' ), 'native' ),
		);
	}

	/**
	 * A network's share link. Every network is a fixed pattern; the post's
	 * address and title are encoded into it.
	 *
	 * @param string $network Network key.
	 * @param string $url     Post address.
	 * @param string $title   Post title (plain text).
	 * @return string Share link, or '' for an unknown network.
	 */
	public static function share_url( $network, $url, $title ) {
		$url   = rawurlencode( $url );
		$title = rawurlencode( $title );
		$both  = $title . '%20' . $url;

		$patterns = array(
			'x'         => 'https://x.com/intent/post?text=' . $title . '&url=' . $url,
			// LinkedIn, Facebook and Pinterest read the title (and image) from
			// the page's Open Graph tags.
			'linkedin'  => 'https://www.linkedin.com/sharing/share-offsite/?url=' . $url,
			'facebook'  => 'https://www.facebook.com/sharer/sharer.php?u=' . $url,
			'pinterest' => 'https://www.pinterest.com/pin/create/button/?url=' . $url . '&description=' . $title,
			'bluesky'   => 'https://bsky.app/intent/compose?text=' . $both,
			'threads'   => 'https://www.threads.net/intent/post?text=' . $title . '&url=' . $url,
			'reddit'    => 'https://www.reddit.com/submit?url=' . $url . '&title=' . $title,
			'whatsapp'  => 'https://api.whatsapp.com/send?text=' . $both,
			'telegram'  => 'https://t.me/share/url?url=' . $url . '&text=' . $title,
			'email'     => 'mailto:?subject=' . $title . '&body=' . $url,
		);

		return $patterns[ $network ] ?? '';
	}

	/**
	 * The post to share: the block's post (inside a Query Loop, each post),
	 * otherwise the current one.
	 *
	 * @param WP_Block|null $block Block instance.
	 * @return WP_Post|null
	 */
	private static function post( $block ) {
		if ( $block instanceof WP_Block && ! empty( $block->context['postId'] ) ) {
			return get_post( (int) $block->context['postId'] );
		}

		// Away from a single post and outside a loop (an archive's header,
		// say), there's no one post to share.
		if ( ! is_singular() && ! in_the_loop() ) {
			return null;
		}

		$id = (int) get_the_ID();

		return $id ? get_post( $id ) : null;
	}

	/**
	 * Render callback.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Inner blocks, rendered by GenerateBlocks.
	 * @param WP_Block $block      Block instance.
	 * @return string
	 */
	public static function render( $attributes, $content, $block = null ) {
		$post = self::post( $block );
		$url  = $post ? get_permalink( $post ) : '';

		if ( ! $url || false === strpos( $content, 'data-share-network=' ) ) {
			return self::nothing();
		}

		// The title as written (get_the_title() would add "Private:"), with
		// curly quotes as on the page.
		$title    = html_entity_decode( wp_strip_all_tags( wptexturize( get_post_field( 'post_title', $post ) ) ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$networks = self::networks();
		$types    = array();

		$replaced = preg_replace_callback(
			self::BUTTON,
			function ( $found ) use ( $networks, $url, $title, &$types ) {
				$tags = new WP_HTML_Tag_Processor( $found[0] );
				$tags->next_tag();

				$network = $found[3];

				// An unknown network is left as it is, minus any link.
				if ( ! isset( $networks[ $network ] ) ) {
					$tags->remove_attribute( 'href' );
					return $tags->get_updated_html();
				}

				list( $name, $type ) = $networks[ $network ];

				$types[ $type ] = true;
				$is_link        = 'A' === $tags->get_tag();

				if ( 'link' === $type && ! $is_link ) {
					// A network needs a link; a <button> set to one would do
					// nothing, so it's left out.
					return '';
				}

				if ( 'link' === $type ) {
					// The tag processor escapes the value itself.
					$tags->set_attribute( 'href', esc_url_raw( self::share_url( $network, $url, $title ), array( 'https', 'mailto' ) ) );

					if ( 'email' === $network ) {
						$tags->remove_attribute( 'target' );
					} else {
						$tags->set_attribute( 'target', '_blank' );
						$tags->set_attribute( 'rel', 'noopener noreferrer nofollow' );
					}
				} elseif ( $is_link ) {
					// Copy and Share are buttons; as a link (and without the
					// script) they go to the post.
					$tags->set_attribute( 'href', esc_url_raw( $url ) );
				} else {
					$tags->set_attribute( 'type', 'button' );
				}

				// Shown by the script only where the device has a share sheet.
				if ( 'native' === $type ) {
					$tags->set_attribute( 'hidden', true );
				}

				// Icon only: name it.
				$text = trim( wp_strip_all_tags( (string) preg_replace( '#<svg\b.*?</svg>#is', '', $found[4] ) ) );

				if ( '' === $text && null === $tags->get_attribute( 'aria-label' ) ) {
					$tags->set_attribute( 'aria-label', self::label( $network, $name ) );
				}

				return $tags->get_updated_html();
			},
			$content
		);

		if ( null === $replaced || ! $types ) {
			return self::nothing();
		}

		self::$shown = true;

		$content = self::label_list( $replaced, $attributes );
		$script  = isset( $types['copy'] ) || isset( $types['native'] );

		if ( $script ) {
			wp_enqueue_script( 'thingamablocks-share' );

			// Announces "Link copied". Printed now, empty, so screen readers
			// are already listening when it changes.
			$content .= '<span class="tmb-share__status" role="status"></span>';
		}

		$wrapper = array( 'class' => 'tmb-share' );

		if ( $script ) {
			$wrapper['data-tmb-share'] = wp_json_encode(
				array(
					'url'    => esc_url_raw( $url ),
					'title'  => $title,
					'copied' => __( 'Link copied', 'thingamablocks' ),
					'failed' => __( 'Copy the address from the address bar', 'thingamablocks' ),
				)
			);
		}

		if ( ! empty( $attributes['anchor'] ) ) {
			$wrapper['id'] = $attributes['anchor'];
		}

		return sprintf( '<div %1$s>%2$s</div>', get_block_wrapper_attributes( $wrapper ), $content );
	}

	/**
	 * Nothing to show: take back the stylesheet WordPress queued for the
	 * block, unless another Share block on the page uses it.
	 *
	 * @return string ''.
	 */
	private static function nothing() {
		if ( ! self::$shown ) {
			wp_dequeue_style( 'thingamablocks-share-view-style' );
		}

		return '';
	}

	/**
	 * An icon-only button's name.
	 *
	 * @param string $network Network key.
	 * @param string $name    Network name.
	 * @return string
	 */
	private static function label( $network, $name ) {
		if ( 'email' === $network ) {
			return __( 'Share by email', 'thingamablocks' );
		}

		if ( 'copy' === $network || 'native' === $network ) {
			return $name;
		}

		/* translators: %s: a social network, e.g. LinkedIn. */
		return sprintf( __( 'Share on %s', 'thingamablocks' ), $name );
	}

	/**
	 * Name the list for screen readers: by the label block if there is one
	 * ("Share this:"), otherwise by the Label setting.
	 *
	 * @param string $content    Markup.
	 * @param array  $attributes Block attributes.
	 * @return string
	 */
	private static function label_list( $content, $attributes ) {
		$list = Thingamablocks_Html::element( $content, 'data-share-part', 'list' );

		if ( ! $list ) {
			return $content;
		}

		$label = Thingamablocks_Html::element( $content, 'data-share-part', 'label' );
		$name  = array();

		if ( $label && '' !== trim( wp_strip_all_tags( substr( $content, $label['inner_start'], $label['inner_end'] - $label['inner_start'] ) ) ) ) {
			$id = $label['attributes']['id'] ?? '';
			$id = is_string( $id ) && '' !== $id ? $id : wp_unique_id( 'tmb-share-label-' );

			$name['aria-labelledby'] = $id;
			$content                 = substr_replace( $content, self::set( substr( $content, $label['start'], $label['inner_start'] - $label['start'] ), array( 'id' => $id ) ), $label['start'], $label['inner_start'] - $label['start'] );
			// Positions after the label moved.
			$list = Thingamablocks_Html::element( $content, 'data-share-part', 'list' );
		} else {
			$aria = sanitize_text_field( $attributes['ariaLabel'] ?? '' );

			$name['aria-label'] = '' !== $aria ? $aria : __( 'Share this post', 'thingamablocks' );
		}

		return substr_replace( $content, self::set( substr( $content, $list['start'], $list['inner_start'] - $list['start'] ), $name ), $list['start'], $list['inner_start'] - $list['start'] );
	}

	/**
	 * Set attributes on an opening tag.
	 *
	 * @param string $tag        Opening tag.
	 * @param array  $attributes Name => value.
	 * @return string
	 */
	private static function set( $tag, $attributes ) {
		$tags = new WP_HTML_Tag_Processor( $tag );

		if ( $tags->next_tag() ) {
			foreach ( $attributes as $name => $value ) {
				$tags->set_attribute( $name, $value );
			}
		}

		return $tags->get_updated_html();
	}
}

Thingamablocks_Share_Render::init();
