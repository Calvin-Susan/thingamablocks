<?php
/**
 * FAQ structured data for GenerateBlocks Pro's Accordion block.
 *
 * The editor adds an "FAQ schema" panel to the Accordion; switching it on
 * stores data-tmb-faq="true" in the accordion's own HTML attributes. When an
 * accordion like that renders, each item's toggle becomes a question and its
 * content the answer, read from the rendered blocks themselves, so the
 * structured data always matches what visitors see. All FAQ accordions on a
 * page are combined into one schema.org FAQPage, printed in the footer.
 *
 * Accordion markup (GB Pro 2.x):
 *   generateblocks-pro/accordion
 *     generateblocks-pro/accordion-item
 *       generateblocks-pro/accordion-toggle   (title Text block + toggle icon)
 *       generateblocks-pro/accordion-content  (any blocks)
 *
 * Blocks render inside out (an item's toggle and content before the item,
 * the items before the accordion), so the question and answer are collected
 * as they render, in a stack (accordions can be nested), and handed to the
 * accordion when it finishes.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Collects questions and answers while accordions render, and prints them.
 */
class Thingamablocks_Faq_Schema {

	const ACCORDION = 'generateblocks-pro/accordion';
	const ITEM      = 'generateblocks-pro/accordion-item';
	const TOGGLE    = 'generateblocks-pro/accordion-toggle';
	const CONTENT   = 'generateblocks-pro/accordion-content';

	/**
	 * One frame per accordion being rendered: its finished items, and the
	 * question/answer of the item being rendered.
	 *
	 * @var array
	 */
	private static $stack = array();

	/**
	 * Questions and answers for this page's FAQPage, keyed by question.
	 *
	 * @var array
	 */
	private static $entities = array();

	/**
	 * Hook in.
	 */
	public static function init() {
		// Last of all: after anything that short-circuits a block, and after
		// block conditions (which empty a hidden block) have run. The
		// block-specific render filters run after the general one.
		add_filter( 'pre_render_block', array( __CLASS__, 'before' ), PHP_INT_MAX, 2 );

		foreach ( array( self::ACCORDION, self::ITEM, self::TOGGLE, self::CONTENT ) as $name ) {
			add_filter( 'render_block_' . $name, array( __CLASS__, 'after' ), PHP_INT_MAX, 2 );
		}

		// Late, so FAQ accordions in overlays or footer Elements are included.
		add_action( 'wp_footer', array( __CLASS__, 'print_schema' ), 100 );
		add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_editor' ) );
	}

	/**
	 * An accordion is about to render: start collecting its items.
	 *
	 * @param string|null $pre   Short-circuited output.
	 * @param array       $block Parsed block.
	 * @return string|null
	 */
	public static function before( $pre, $block ) {
		if ( null === $pre && self::ACCORDION === ( $block['blockName'] ?? '' ) ) {
			self::$stack[] = array(
				'items'    => array(),
				'question' => '',
				'answer'   => '',
			);
		}

		return $pre;
	}

	/**
	 * Collect each part as it renders; queue the accordion's items when it's done.
	 *
	 * @param string $content Rendered block.
	 * @param array  $block   Parsed block.
	 * @return string
	 */
	public static function after( $content, $block ) {
		$name = $block['blockName'] ?? '';

		if ( ! self::$stack ) {
			return $content;
		}

		$frame = count( self::$stack ) - 1;

		switch ( $name ) {
			case self::TOGGLE:
				self::$stack[ $frame ]['question'] = self::question( $content );
				break;

			case self::CONTENT:
				self::$stack[ $frame ]['answer'] = self::answer( $content );
				break;

			case self::ITEM:
				// An item hidden by a block condition renders as nothing: leave it out.
				if ( '' !== trim( $content ) && '' !== self::$stack[ $frame ]['question'] && '' !== self::$stack[ $frame ]['answer'] ) {
					self::$stack[ $frame ]['items'][] = array( self::$stack[ $frame ]['question'], self::$stack[ $frame ]['answer'] );
				}

				self::$stack[ $frame ]['question'] = '';
				self::$stack[ $frame ]['answer']   = '';
				break;

			case self::ACCORDION:
				$items = array_pop( self::$stack )['items'];

				if ( '' !== trim( $content ) && self::is_faq( $block ) ) {
					self::queue( $items );
				}
				break;
		}

		return $content;
	}

	/**
	 * Whether an accordion has FAQ schema switched on.
	 *
	 * @param array $block Parsed block.
	 * @return bool
	 */
	public static function is_faq( $block ) {
		$value = $block['attrs']['htmlAttributes']['data-tmb-faq'] ?? '';

		return is_string( $value ) && 'true' === $value;
	}

	/**
	 * The question: the toggle's text, without its icon.
	 *
	 * @param string $html Rendered toggle.
	 * @return string
	 */
	public static function question( $html ) {
		return self::plain_text( self::remove_elements( $html ) );
	}

	/**
	 * The answer: the content's HTML, kept to the tags Google reads in FAQ
	 * answers (headings, paragraphs, lists, links, line breaks and bold or
	 * italic text), with no attributes except a link's href.
	 *
	 * @param string $html Rendered content.
	 * @return string
	 */
	public static function answer( $html ) {
		$allowed = array(
			'a'      => array( 'href' => true ),
			'br'     => array(),
			'p'      => array(),
			'div'    => array(),
			'ul'     => array(),
			'ol'     => array(),
			'li'     => array(),
			'b'      => array(),
			'strong' => array(),
			'i'      => array(),
			'em'     => array(),
			'h1'     => array(),
			'h2'     => array(),
			'h3'     => array(),
			'h4'     => array(),
			'h5'     => array(),
			'h6'     => array(),
		);

		$html = wp_kses( self::remove_elements( $html ), $allowed );
		$html = (string) preg_replace( '/\s+/u', ' ', $html );
		$html = trim( (string) preg_replace( '#\s*(</?(?:div|p|ul|ol|li|h[1-6]|br)\b[^>]*>)\s*#u', '$1', $html ) );

		// Wrappers left empty by the cleaning (images, icons, spacers), however deep.
		do {
			$before = $html;
			$html   = (string) preg_replace( '#<(div|p)></\1>#', '', $html );
		} while ( $html !== $before );

		// Bare <div>s around everything (the content block's own, layout wrappers).
		while ( self::is_wrapped( $html ) ) {
			$html = substr( $html, 5, -6 );
		}

		return '' === self::plain_text( $html ) ? '' : $html;
	}

	/**
	 * Whether cleaned HTML is one <div> around everything else (not two
	 * sibling <div>s, like "<div>A</div><div>B</div>").
	 *
	 * @param string $html Cleaned HTML (bare tags only).
	 * @return bool
	 */
	private static function is_wrapped( $html ) {
		if ( 0 !== strpos( $html, '<div>' ) || '</div>' !== substr( $html, -6 ) ) {
			return false;
		}

		$depth = 0;

		preg_match_all( '#<(/?)div>#', $html, $tags, PREG_SET_ORDER | PREG_OFFSET_CAPTURE );

		foreach ( $tags as $tag ) {
			$depth += '' === $tag[1][0] ? 1 : -1;

			// Closed before the end: the first <div> doesn't wrap everything.
			if ( 0 === $depth && $tag[0][1] < strlen( $html ) - 6 ) {
				return false;
			}
		}

		return 0 === $depth;
	}

	/**
	 * Remove elements whose text isn't content (scripts, styles, icons,
	 * hidden templates), with everything inside them.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	private static function remove_elements( $html ) {
		return (string) preg_replace( '#<(script|style|svg|template|noscript)\b[^>]*>.*?</\1>#isu', '', $html );
	}

	/**
	 * Text with tags removed, entities decoded and spaces collapsed.
	 *
	 * @param string $html HTML.
	 * @return string
	 */
	private static function plain_text( $html ) {
		$text = html_entity_decode( wp_strip_all_tags( $html ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );

		return trim( (string) preg_replace( '/\s+/u', ' ', $text ) );
	}

	/**
	 * Add an accordion's items to the page's FAQPage.
	 *
	 * @param array $items Question and answer pairs.
	 */
	private static function queue( $items ) {
		// Only on a single post or page (an archive showing several posts'
		// content isn't one FAQ), and not in a REST response or feed.
		if ( ! $items || ! is_singular() || is_admin() || is_feed() || wp_is_serving_rest_request() ) {
			return;
		}

		foreach ( $items as $item ) {
			// The same question twice (an accordion repeated in a template) is listed once.
			if ( ! isset( self::$entities[ $item[0] ] ) ) {
				self::$entities[ $item[0] ] = $item[1];
			}
		}
	}

	/**
	 * The FAQPage structured data for this page, if any.
	 *
	 * @return array|null
	 */
	public static function data() {
		if ( ! self::$entities ) {
			return null;
		}

		// Yoast SEO's and Rank Math's FAQ blocks add their own FAQPage: one per page.
		$post         = get_queried_object();
		$seo_faq_page = $post instanceof WP_Post && ( has_block( 'yoast/faq-block', $post ) || has_block( 'rank-math/faq-block', $post ) );
		$questions    = array();

		foreach ( self::$entities as $question => $answer ) {
			$questions[] = array(
				'@type'          => 'Question',
				'name'           => (string) $question,
				'acceptedAnswer' => array(
					'@type' => 'Answer',
					'text'  => $answer,
				),
			);
		}

		/**
		 * Filters the FAQPage structured data built from FAQ accordions.
		 * Return null to print nothing (e.g. if an SEO plugin adds it). It's
		 * null already when the page has a Yoast SEO or Rank Math FAQ block.
		 *
		 * @param array|null $data FAQPage data.
		 */
		return apply_filters(
			'thingamablocks_faq_schema',
			$seo_faq_page ? null : array(
				'@context'   => 'https://schema.org',
				'@type'      => 'FAQPage',
				'mainEntity' => $questions,
			)
		);
	}

	/**
	 * Print the FAQPage, once, in the footer.
	 */
	public static function print_schema() {
		$data           = self::data();
		self::$entities = array();

		if ( empty( $data ) ) {
			return;
		}

		// JSON with "<", ">" and "&" escaped can't end the script element.
		echo '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * The "FAQ schema" panel in the block editor.
	 */
	public static function enqueue_editor() {
		// Switched off in Settings → Thingamablocks: no panel (existing FAQ accordions keep their schema).
		if ( ! thingamablocks_is_enabled( 'faq' ) ) {
			return;
		}

		$asset_file = THINGAMABLOCKS_DIR . 'build/faq/editor.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_enqueue_script(
			'thingamablocks-faq-editor',
			plugins_url( 'build/faq/editor.js', THINGAMABLOCKS_DIR . 'thingamablocks.php' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_set_script_translations( 'thingamablocks-faq-editor', 'thingamablocks' );
	}
}

Thingamablocks_Faq_Schema::init();
