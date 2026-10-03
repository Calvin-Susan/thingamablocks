<?php
/**
 * Front-end rendering for the Table of Contents block, and IDs for headings.
 *
 * The block holds GenerateBlocks blocks that act as templates, styled in the
 * GB Styles panel: a list marked data-toc-part="list" (an Element, <ul> or
 * <ol>), an item inside it marked "item" (an Element, <li>) and a link inside
 * that marked "link" (a Text block, <a>). The item is repeated for every
 * heading of the post being viewed, with the heading's text and #id; headings
 * under it go in a nested copy of the list. Anything else in the block (a
 * title, say) is shown as it is, inside <nav aria-label="Table of contents">.
 * An optional Shape marked "copy" is the icon for the copy-link buttons the
 * front-end script adds to the headings.
 *
 * Headings without an ID get one from their text (#getting-started), added to
 * the post content on single posts and pages, so the list's links have
 * somewhere to go. IDs set by hand are kept.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Table of Contents block and gives headings IDs.
 */
class Thingamablocks_Toc_Render {

	/**
	 * A heading: level, attributes, inner HTML. (Headings can't contain
	 * headings, so the first matching closing tag ends it.)
	 */
	const HEADING = '#<h([1-6])(\s[^>]*)?>(.*?)</h\1\s*>#is';

	/**
	 * Headings with this class are left out of tables of contents.
	 */
	const SKIP_CLASS = 'tmb-toc-skip';

	/**
	 * IDs themes use for page parts (GeneratePress's among them), never
	 * given to a heading: "Content" becomes #content-2.
	 */
	const RESERVED = array( 'content', 'page', 'main', 'primary', 'secondary', 'masthead', 'site-navigation', 'comments', 'respond', 'right-sidebar', 'left-sidebar', 'footer' );

	/**
	 * Whether a table of contents has been shown on this page.
	 *
	 * @var bool
	 */
	private static $rendered = false;

	/**
	 * Whether a table of contents has been shown (with headings) on this
	 * page.
	 *
	 * @var bool
	 */
	private static $shown = false;

	/**
	 * Whether the scroll offset style has been added.
	 *
	 * @var bool
	 */
	private static $offset_added = false;

	/**
	 * Hook up.
	 */
	public static function init() {
		// After blocks (9), wpautop (10) and shortcodes (11), so headings from
		// any of them get an ID.
		add_filter( 'the_content', array( __CLASS__, 'add_heading_ids' ), 20 );
	}

	/**
	 * Render callback.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Inner blocks, rendered by GenerateBlocks.
	 * @param WP_Block $block      Block instance (unused).
	 * @return string
	 */
	public static function render( $attributes, $content, $block = null ) {
		unset( $block );

		$post = self::post();

		if ( ! $post ) {
			return self::nothing();
		}

		self::$rendered = true;

		$options  = self::options( $attributes );
		$headings = array_values(
			array_filter(
				self::headings( $post ),
				function ( $heading ) use ( $options ) {
					return ! $heading['skip'] && '' !== $heading['text'] && in_array( $heading['level'], $options['levels'], true );
				}
			)
		);

		if ( ! $headings ) {
			return self::nothing();
		}

		self::$shown = true;

		// The copy-link icon is a template for the script, not shown here.
		$icon = self::cut( $content, 'copy' );

		// The chevron only shows in the collapsed toggle button.
		$chevron = self::cut( $content, 'chevron' );

		$list      = Thingamablocks_Html::element( $content, 'data-toc-part', 'list' );
		$templates = self::templates( $content, $list );
		$index     = 0;
		$markup    = self::list_html( self::tree( $headings, $index ), $templates, true );
		$panel     = '';

		// Collapsing: the list goes in a plain box the button opens and
		// closes (so the list's own display, flex say, is left alone).
		if ( $options['collapse'] ) {
			$panel  = wp_unique_id( 'tmb-toc-panel-' );
			$markup = '<div class="tmb-toc__panel" id="' . esc_attr( $panel ) . '">' . $markup . '</div>';
		}

		$content = $list
			? substr_replace( $content, $markup, $list['start'], $list['end'] - $list['start'] )
			: $content . $markup;

		if ( $options['collapse'] ) {
			$content = self::add_toggle( $content, $panel, $chevron, $options['label'] );
		}

		$config = array();

		if ( $options['copy'] && '' !== $icon ) {
			$config = array(
				'copy'   => __( 'Copy link', 'thingamablocks' ),
				'copied' => __( 'Link copied', 'thingamablocks' ),
			);

			$content .= '<template class="tmb-toc__copy-template">' . $icon . '</template>';
		}

		$wrapper = array(
			'class'        => 'tmb-toc',
			'aria-label'   => $options['label'],
			'data-tmb-toc' => wp_json_encode( (object) $config ),
		);

		if ( $options['collapse'] ) {
			$wrapper['data-tmb-collapse'] = (string) $options['collapse'];
		}

		if ( ! empty( $attributes['anchor'] ) ) {
			$wrapper['id'] = $attributes['anchor'];
		}

		self::add_offset( $options['offset'] );

		return sprintf(
			'%1$s<nav %2$s>%3$s</nav>',
			$options['collapse'] ? self::style_for( $options['collapse'] ) : '',
			get_block_wrapper_attributes( $wrapper ),
			$content
		);
	}

	/**
	 * Nothing to show (no headings, or not a single post): take back the
	 * script and stylesheet WordPress queued for the block, unless another
	 * table of contents on the page uses them.
	 *
	 * @return string ''.
	 */
	private static function nothing() {
		if ( ! self::$shown ) {
			wp_dequeue_script( 'thingamablocks-toc-view-script' );
			wp_dequeue_style( 'thingamablocks-toc-view-style' );
		}

		return '';
	}

	/**
	 * Clean block attributes into options.
	 *
	 * @param array $attributes Block attributes.
	 * @return array
	 */
	public static function options( $attributes ) {
		$levels = array();

		foreach ( (array) ( $attributes['levels'] ?? array( 2, 3 ) ) as $level ) {
			$level = is_numeric( $level ) ? (int) $level : 0;

			if ( $level >= 1 && $level <= 6 && ! in_array( $level, $levels, true ) ) {
				$levels[] = $level;
			}
		}

		$pixels = function ( $value, $max ) {
			return is_numeric( $value ) ? (int) round( min( $max, max( 0, (float) $value ) ) ) : 0;
		};

		$label = sanitize_text_field( $attributes['ariaLabel'] ?? '' );

		return array(
			'levels'   => $levels ? $levels : array( 2, 3 ),
			'offset'   => $pixels( $attributes['offset'] ?? 0, 500 ),
			// Collapse below this width (0: never).
			'collapse' => $pixels( $attributes['collapseBelow'] ?? 0, 3000 ),
			'label'    => '' !== $label ? $label : __( 'Table of contents', 'thingamablocks' ),
			'copy'     => ! empty( $attributes['copyLinks'] ),
		);
	}

	/**
	 * The post whose headings are listed: the single post or page being
	 * viewed, unless it's password protected.
	 *
	 * @return WP_Post|null
	 */
	private static function post() {
		if ( ! is_singular() ) {
			return null;
		}

		$post = get_queried_object();

		if ( ! $post instanceof WP_Post || post_password_required( $post ) ) {
			return null;
		}

		return $post;
	}

	/**
	 * A post's headings, read from its saved blocks (including synced
	 * patterns) without rendering them, so nothing runs twice. For a post
	 * split with page breaks, only the page being viewed.
	 *
	 * @param WP_Post $post Post.
	 * @return array See scan().
	 */
	public static function headings( $post ) {
		static $cache = array();

		$content = $post->post_content;
		$page    = 1;

		if ( false !== strpos( $content, '<!--nextpage-->' ) ) {
			$pages   = explode( '<!--nextpage-->', $content );
			$page    = min( count( $pages ), max( 1, (int) get_query_var( 'page' ) ) );
			$content = $pages[ $page - 1 ];
		}

		$key = $post->ID . '-' . $page;

		if ( ! isset( $cache[ $key ] ) ) {
			// Not headings inside HTML comments (in a Custom HTML block, say).
			$cache[ $key ] = self::scan( (string) preg_replace( '/<!--.*?-->/s', '', self::saved_html( parse_blocks( $content ) ) ) );
		}

		return $cache[ $key ];
	}

	/**
	 * The saved HTML of some blocks, in order, with synced patterns filled in
	 * and tables of contents left out (their own title isn't a section).
	 *
	 * @param array $blocks   Parsed blocks.
	 * @param array $patterns Synced patterns already filled in (as keys).
	 * @return string HTML.
	 */
	private static function saved_html( $blocks, &$patterns = array() ) {
		$html = '';

		foreach ( $blocks as $block ) {
			// A table of contents' own title isn't a section, and a block
			// hidden with WordPress's "Hide" setting isn't on the page.
			if ( 'thingamablocks/toc' === $block['blockName'] || false === ( $block['attrs']['metadata']['blockVisibility'] ?? null ) ) {
				continue;
			}

			if ( 'core/block' === $block['blockName'] ) {
				$ref = (int) ( $block['attrs']['ref'] ?? 0 );

				// Each pattern once (a pattern can't include itself, over and
				// over), and only so many.
				if ( ! $ref || isset( $patterns[ $ref ] ) || count( $patterns ) >= 50 ) {
					continue;
				}

				$patterns[ $ref ] = true;
				$pattern          = get_post( $ref );

				if ( $pattern && 'wp_block' === $pattern->post_type && 'publish' === $pattern->post_status ) {
					$html .= self::saved_html( parse_blocks( $pattern->post_content ), $patterns );
				}

				continue;
			}

			$index = 0;

			foreach ( $block['innerContent'] as $chunk ) {
				if ( is_string( $chunk ) ) {
					$html .= $chunk;
				} elseif ( isset( $block['innerBlocks'][ $index ] ) ) {
					$html .= self::saved_html( array( $block['innerBlocks'][ $index ] ), $patterns );
					++$index;
				}
			}
		}

		return $html;
	}

	/**
	 * Every heading in some HTML, with the ID it has or will get.
	 *
	 * @param string $html HTML.
	 * @return array[] { level, id, text, key (for matching), own (has an ID already), skip }
	 */
	public static function scan( $html ) {
		if ( false === stripos( $html, '<h' ) || ! preg_match_all( self::HEADING, $html, $matches, PREG_SET_ORDER ) ) {
			return array();
		}

		$found = array();
		$used  = array_fill_keys( self::RESERVED, true );

		foreach ( $matches as $match ) {
			$tags = new WP_HTML_Tag_Processor( $match[0] );
			$tags->next_tag();

			$id    = $tags->get_attribute( 'id' );
			$id    = is_string( $id ) ? trim( $id ) : '';
			$class = $tags->get_attribute( 'class' );

			// IDs set by hand are taken first, so a made-up one never clashes.
			if ( '' !== $id ) {
				$used[ $id ] = true;
			}

			$text = self::text( $match[3] );

			$found[] = array(
				'level' => (int) $match[1],
				'id'    => $id,
				'text'  => $text,
				'key'   => self::key( $text ),
				'own'   => '' !== $id,
				// Left out too: text only known once rendered (GenerateBlocks
				// dynamic tags, shortcodes).
				'skip'  => ( is_string( $class ) && in_array( self::SKIP_CLASS, preg_split( '/\s+/', $class ), true ) )
					|| false !== strpos( $text, '{{' )
					|| ( false !== strpos( $text, '[' ) && preg_match( '/' . get_shortcode_regex() . '/', $text ) ),
			);
		}

		foreach ( $found as $index => $heading ) {
			if ( ! $heading['own'] ) {
				$found[ $index ]['id'] = self::unique( self::slug( $heading['text'] ), $used );

				$used[ $found[ $index ]['id'] ] = true;
			}
		}

		return $found;
	}

	/**
	 * A heading's plain text.
	 *
	 * @param string $html Heading's inner HTML.
	 * @return string
	 */
	private static function text( $html ) {
		$text = html_entity_decode( wp_strip_all_tags( $html ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );

		return trim( (string) preg_replace( '/\s+/u', ' ', $text ) );
	}

	/**
	 * A heading's text for matching the saved heading to the rendered one,
	 * which WordPress has given curly quotes and primes (wptexturize).
	 *
	 * @param string $text Heading text.
	 * @return string
	 */
	private static function key( $text ) {
		return mb_strtolower( self::text( wptexturize( $text ) ) );
	}

	/**
	 * An ID from a heading's text: "Getting started" → "getting-started".
	 * Letters outside English are kept as they are (not %-encoded), so the
	 * ID matches the link the browser follows.
	 *
	 * @param string $text Heading text.
	 * @return string
	 */
	private static function slug( $text ) {
		$slug = rawurldecode( sanitize_title( $text ) );

		if ( mb_strlen( $slug ) > 60 ) {
			$slug = rtrim( mb_substr( $slug, 0, 60 ), '-' );
		}

		return '' !== $slug ? $slug : 'section';
	}

	/**
	 * $slug, or $slug-2, $slug-3… if it's taken.
	 *
	 * @param string $slug Slug.
	 * @param array  $used IDs in use (as keys).
	 * @return string
	 */
	private static function unique( $slug, $used ) {
		$id     = $slug;
		$number = 2;

		while ( isset( $used[ $id ] ) ) {
			$id = $slug . '-' . $number;
			++$number;
		}

		return $id;
	}

	/**
	 * Give the headings of the post being viewed an ID where they have none.
	 * Runs while the Table of Contents block is switched on (or one has been
	 * shown on the page already), only for the main post's content.
	 *
	 * @param string $content Post content HTML.
	 * @return string
	 */
	public static function add_heading_ids( $content ) {
		// Nothing to do without a heading that has no ID.
		if ( ! is_string( $content ) || ! preg_match( '/<h[1-6](?![^>]*\sid\s*=)[\s>]/i', $content ) || ( ! self::$rendered && ! thingamablocks_is_enabled( 'toc' ) ) ) {
			return $content;
		}

		/**
		 * Whether to give the headings of the post being viewed IDs (on by
		 * default while the Table of Contents block is switched on). A table
		 * of contents needs them to link to its headings.
		 *
		 * @param bool $add Add IDs.
		 */
		if ( ! apply_filters( 'thingamablocks_toc_heading_ids', true ) ) {
			return $content;
		}

		$post = self::post();

		if ( ! $post || get_the_ID() !== $post->ID ) {
			return $content;
		}

		// Each heading gets the ID the table of contents links to: the saved
		// heading with the same text, in order. Headings only there once
		// rendered (from a shortcode, a query loop) get a new one.
		$queue = array();
		$used  = array_fill_keys( self::RESERVED, true );

		foreach ( self::headings( $post ) as $saved ) {
			$used[ $saved['id'] ] = true;

			if ( ! $saved['own'] ) {
				$queue[ $saved['key'] ][] = $saved['id'];
			}
		}

		$headings = self::scan( $content );

		foreach ( $headings as $heading ) {
			if ( $heading['own'] ) {
				$used[ $heading['id'] ] = true;
			}
		}

		$index = 0;

		$updated = preg_replace_callback(
			self::HEADING,
			function ( $found ) use ( $headings, &$index, &$queue, &$used ) {
				$heading = $headings[ $index ] ?? null;
				++$index;

				if ( ! $heading || $heading['own'] ) {
					return $found[0];
				}

				$id = empty( $queue[ $heading['key'] ] )
					? self::unique( self::slug( $heading['text'] ), $used )
					: array_shift( $queue[ $heading['key'] ] );

				$used[ $id ] = true;

				$tags = new WP_HTML_Tag_Processor( $found[0] );
				$tags->next_tag();
				$tags->set_attribute( 'id', $id );

				return $tags->get_updated_html();
			},
			$content
		);

		// A failed search leaves the content as it was.
		return null === $updated ? $content : $updated;
	}

	/**
	 * The headings as a tree: each one holds the smaller headings after it.
	 * A skipped level (H2 then H4) just nests one deeper.
	 *
	 * @param array $headings     Headings, in order.
	 * @param int   $index        Where to start (moved past the headings used).
	 * @param int   $parent_level The parent heading's level (0 for the top).
	 * @return array[] { heading, children }
	 */
	private static function tree( $headings, &$index, $parent_level = 0 ) {
		$nodes = array();

		while ( isset( $headings[ $index ] ) && $headings[ $index ]['level'] > $parent_level ) {
			$heading = $headings[ $index ];
			++$index;

			$nodes[] = array(
				'heading'  => $heading,
				'children' => self::tree( $headings, $index, $heading['level'] ),
			);
		}

		return $nodes;
	}

	/**
	 * The parts' markup, cut from the rendered inner blocks. Missing parts
	 * fall back to a plain list.
	 *
	 * @param string     $content Rendered inner blocks.
	 * @param array|null $part    The list part's position (Thingamablocks_Html::find()).
	 * @return array Markup pieces.
	 */
	private static function templates( $content, $part ) {
		$templates = array(
			'top_open'   => '<ul class="tmb-toc__fallback-list">',
			'list_open'  => '<ul class="tmb-toc__fallback-list">',
			'list_close' => '</ul>',
			'item_open'  => '<li>',
			'item_close' => '</li>',
			'before'     => '',
			'link'       => '<a href="#"></a>',
			'after'      => '',
		);

		if ( ! $part ) {
			return $templates;
		}

		$open = substr( $content, $part['start'], $part['inner_start'] - $part['start'] );

		$templates['top_open']   = $open;
		$templates['list_open']  = self::set_attributes( $open, array( 'id' => null ) );
		$templates['list_close'] = substr( $content, $part['inner_end'], $part['end'] - $part['inner_end'] );

		$inner = substr( $content, $part['inner_start'], $part['inner_end'] - $part['inner_start'] );
		$item  = Thingamablocks_Html::element( $inner, 'data-toc-part', 'item' );

		if ( $item ) {
			$templates['item_open']  = self::set_attributes( substr( $inner, $item['start'], $item['inner_start'] - $item['start'] ), array( 'id' => null ) );
			$templates['item_close'] = substr( $inner, $item['inner_end'], $item['end'] - $item['inner_end'] );
			$inner                   = substr( $inner, $item['inner_start'], $item['inner_end'] - $item['inner_start'] );
		}

		$link = Thingamablocks_Html::element( $inner, 'data-toc-part', 'link' );

		if ( $link ) {
			$templates['before'] = substr( $inner, 0, $link['start'] );
			$templates['link']   = substr( $inner, $link['start'], $link['end'] - $link['start'] );
			$templates['after']  = substr( $inner, $link['end'] );
		}

		return $templates;
	}

	/**
	 * A list of headings (and their sub-headings, nested).
	 *
	 * @param array $nodes     Tree nodes.
	 * @param array $templates Part markup.
	 * @param bool  $top       Whether it's the outermost list.
	 * @return string HTML.
	 */
	private static function list_html( $nodes, $templates, $top ) {
		$html = $top ? $templates['top_open'] : $templates['list_open'];

		foreach ( $nodes as $node ) {
			$heading = $node['heading'];
			$level   = (string) $heading['level'];
			$link    = self::set_attributes(
				$templates['link'],
				array(
					'href'       => '#' . $heading['id'],
					'data-level' => $level,
					'id'         => null,
				)
			);

			$html .= self::set_attributes( $templates['item_open'], array( 'data-level' => $level ) )
				. $templates['before']
				. Thingamablocks_Html::replace_text( $link, esc_html( wptexturize( $heading['text'] ) ) )
				. $templates['after']
				. ( $node['children'] ? self::list_html( $node['children'], $templates, false ) : '' )
				. $templates['item_close'];
		}

		return $html . $templates['list_close'];
	}

	/**
	 * Set (or with null, remove) attributes on the first tag of some markup.
	 *
	 * @param string $html       Markup.
	 * @param array  $attributes Name => value or null.
	 * @return string
	 */
	private static function set_attributes( $html, $attributes ) {
		$tags = new WP_HTML_Tag_Processor( $html );

		if ( $tags->next_tag() ) {
			foreach ( $attributes as $name => $value ) {
				if ( null === $value ) {
					$tags->remove_attribute( $name );
				} else {
					// The tag processor escapes the value itself.
					$tags->set_attribute( $name, $value );
				}
			}
		}

		return $tags->get_updated_html();
	}

	/**
	 * Cut a part out of the markup.
	 *
	 * @param string $content Markup (changed).
	 * @param string $part    Part name.
	 * @return string The part's markup, or ''.
	 */
	private static function cut( &$content, $part ) {
		$found = Thingamablocks_Html::element( $content, 'data-toc-part', $part );

		if ( ! $found ) {
			return '';
		}

		$html    = substr( $content, $found['start'], $found['end'] - $found['start'] );
		$content = substr_replace( $content, '', $found['start'], $found['end'] - $found['start'] );

		return $html;
	}

	/**
	 * The button that opens and closes the list on small screens. It goes
	 * inside the title (as an accordion's button goes inside its heading),
	 * next to the title's text: CSS shows the button below the breakpoint
	 * and the plain text above it, so only one is ever there.
	 *
	 * @param string $content Markup.
	 * @param string $panel   The list's ID.
	 * @param string $chevron Chevron markup, or ''.
	 * @param string $label   Fallback text when there's no title.
	 * @return string Markup.
	 */
	private static function add_toggle( $content, $panel, $chevron, $label ) {
		$title = Thingamablocks_Html::element( $content, 'data-toc-part', 'title' );
		$text  = $title
			? substr( $content, $title['inner_start'], $title['inner_end'] - $title['inner_start'] )
			: esc_html( $label );

		$button = sprintf(
			'<button type="button" class="tmb-toc__toggle" aria-expanded="false" aria-controls="%1$s"><span class="tmb-toc__toggle-text"><span class="tmb-toc__toggle-label">%2$s</span><span class="tmb-toc__toggle-current" aria-hidden="true"></span></span>%3$s</button>',
			esc_attr( $panel ),
			$text,
			$chevron
		);

		if ( ! $title ) {
			return '<div class="tmb-toc__toggle-wrap">' . $button . '</div>' . $content;
		}

		return substr_replace( $content, '<span class="tmb-toc__title-text">' . $text . '</span>' . $button, $title['inner_start'], $title['inner_end'] - $title['inner_start'] );
	}

	/**
	 * The CSS that collapses tables of contents below a width, once per
	 * width. It's printed right before the block, so the list is closed on a
	 * phone from the first paint (a stylesheet added now could land in the
	 * footer). Whole pixels only, so nothing else can get in.
	 *
	 * @param int $width Breakpoint in pixels.
	 * @return string <style> element, or '' if already printed.
	 */
	private static function style_for( $width ) {
		static $printed = array();

		if ( isset( $printed[ $width ] ) ) {
			return '';
		}

		$first             = ! $printed;
		$printed[ $width ] = true;
		$toc               = '.tmb-toc[data-tmb-collapse="' . $width . '"]';

		// The button's basic look comes with it, so it never shows as a
		// theme button while the block's stylesheet loads.
		$css = sprintf(
			'<style id="tmb-toc-collapse-%1$d">@media (max-width:%2$.2Fpx){%3$s .tmb-toc__title-text{display:none}%3$s:not([data-open]) .tmb-toc__panel{display:none}%3$s .tmb-toc__toggle{display:flex;align-items:center;justify-content:space-between;gap:.5em;width:100%%;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;letter-spacing:inherit;text-align:inherit;text-transform:inherit}}@media (min-width:%1$dpx){%3$s .tmb-toc__toggle,%3$s .tmb-toc__toggle-wrap{display:none}}</style>',
			$width,
			$width - 0.02,
			$toc
		);

		// Without JavaScript the button can't open the list: show the list.
		if ( $first ) {
			$css .= '<noscript><style>.tmb-toc .tmb-toc__panel{display:block!important}.tmb-toc .tmb-toc__toggle,.tmb-toc .tmb-toc__toggle-wrap{display:none!important}.tmb-toc .tmb-toc__title-text{display:inline!important}</style></noscript>';
		}

		return $css;
	}

	/**
	 * Room above headings when a link jumps to one, so a sticky header
	 * doesn't cover it (CSS scroll-margin, so links from elsewhere get it
	 * too). Printed once, by the first table of contents with an offset.
	 *
	 * @param int $offset Pixels.
	 */
	private static function add_offset( $offset ) {
		if ( ! $offset || self::$offset_added ) {
			return;
		}

		self::$offset_added = true;

		wp_register_style( 'thingamablocks-toc-offset', false, array(), THINGAMABLOCKS_VERSION );
		wp_enqueue_style( 'thingamablocks-toc-offset' );
		wp_add_inline_style( 'thingamablocks-toc-offset', sprintf( ':where(h1,h2,h3,h4,h5,h6)[id]{scroll-margin-top:%dpx}', $offset ) );
	}
}

Thingamablocks_Toc_Render::init();
