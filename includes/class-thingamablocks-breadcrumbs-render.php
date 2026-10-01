<?php
/**
 * Front-end rendering for the Breadcrumbs block.
 *
 * The block holds GenerateBlocks blocks that act as templates, styled in the
 * GB Styles panel: a link marked data-breadcrumb-part="item", a separator
 * marked "separator" and the current page marked "current". Each is rendered
 * once by GenerateBlocks (so its CSS is printed) and then repeated for every
 * step of the trail with its own text and link, inside
 * <nav aria-label="Breadcrumb"><ol>…</ol></nav>.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Breadcrumbs block.
 */
class Thingamablocks_Breadcrumbs_Render {
	/**
	 * Render callback.
	 *
	 * @param array    $attributes Block attributes.
	 * @param string   $content    Saved inner-block HTML (unused: parts are rendered one by one).
	 * @param WP_Block $block      Block instance.
	 * @return string
	 */
	public static function render( $attributes, $content, $block = null ) {
		$options = self::options( $attributes );

		if ( is_front_page() && ! $options['show_on_home'] ) {
			return '';
		}

		$trail = Thingamablocks_Breadcrumbs_Trail::get( $options );

		if ( empty( $trail ) ) {
			return '';
		}

		$parts = self::parts( $block );
		$steps = $trail;

		if ( ! $options['show_current'] && count( $steps ) > 1 ) {
			array_pop( $steps );
		}

		$items = '';
		$last  = count( $steps ) - 1;

		// The home icon is for this block's own trail, not an SEO plugin's.
		$own_trail = 'own' === Thingamablocks_Breadcrumbs_Trail::source();

		foreach ( $steps as $index => $step ) {
			$is_current = $index === $last && $options['show_current'];
			$is_home    = 0 === $index && $own_trail;

			$items .= '<li class="tmb-breadcrumbs__step">'
				. self::crumb( $parts, $step, $is_current, $is_home ? $options['home'] : 'text' )
				. ( $index < $last ? self::separator( $parts ) : '' )
				. '</li>';
		}

		$wrapper = array(
			'class'      => 'tmb-breadcrumbs',
			'aria-label' => $options['label'],
		);

		if ( $options['collapse'] ) {
			$wrapper['data-tmb-breadcrumbs'] = wp_json_encode(
				array( 'more' => __( 'Show the full path', 'thingamablocks' ) )
			);
		}

		if ( ! empty( $attributes['anchor'] ) ) {
			$wrapper['id'] = $attributes['anchor'];
		}

		self::queue_schema( $trail, $options );

		return sprintf(
			'<nav %1$s><ol class="tmb-breadcrumbs__list">%2$s</ol></nav>',
			get_block_wrapper_attributes( $wrapper ),
			$items
		);
	}

	/**
	 * Clean block attributes into options.
	 *
	 * @param array $attributes Block attributes.
	 * @return array
	 */
	public static function options( $attributes ) {
		$flag = function ( $name, $fallback ) use ( $attributes ) {
			return isset( $attributes[ $name ] ) ? ! empty( $attributes[ $name ] ) : $fallback;
		};

		$home   = $attributes['home'] ?? 'text';
		$schema = $attributes['schema'] ?? 'auto';
		$label  = sanitize_text_field( $attributes['homeLabel'] ?? '' );
		$aria   = sanitize_text_field( $attributes['ariaLabel'] ?? '' );

		return array(
			'home'           => in_array( $home, array( 'text', 'icon', 'both' ), true ) ? $home : 'text',
			'home_label'     => '' !== $label ? $label : __( 'Home', 'thingamablocks' ),
			'label'          => '' !== $aria ? $aria : __( 'Breadcrumb', 'thingamablocks' ),
			'show_current'   => $flag( 'showCurrent', true ),
			'show_on_home'   => $flag( 'showOnHome', false ),
			'blog_page'      => $flag( 'showBlogPage', true ),
			'category'       => $flag( 'showCategory', true ),
			'collapse'       => $flag( 'collapse', true ),
			'use_seo_plugin' => $flag( 'useSeoPlugin', true ),
			'schema'         => in_array( $schema, array( 'auto', 'always', 'never' ), true ) ? $schema : 'auto',
		);
	}

	/**
	 * The template markup of each part, rendered by GenerateBlocks.
	 *
	 * @param WP_Block|null $block Block instance.
	 * @return array Part name => HTML.
	 */
	private static function parts( $block ) {
		$parts = array();
		$walk  = function ( $inner_blocks ) use ( &$walk, &$parts ) {
			foreach ( $inner_blocks as $inner ) {
				// A breadcrumbs block nested inside keeps its own parts.
				if ( 'thingamablocks/breadcrumbs' === $inner->name ) {
					continue;
				}

				$html_attributes = (array) ( $inner->attributes['htmlAttributes'] ?? array() );
				$part            = $html_attributes['data-breadcrumb-part'] ?? '';
				// Links and the current page take text, so they must be Text
				// blocks; a separator can also be a Shape (an icon).
				$allowed = array(
					'item'      => array( 'generateblocks/text' ),
					'current'   => array( 'generateblocks/text' ),
					'separator' => array( 'generateblocks/text', 'generateblocks/shape' ),
				);

				if ( isset( $allowed[ $part ] ) && in_array( $inner->name, $allowed[ $part ], true ) && ! isset( $parts[ $part ] ) ) {
					$parts[ $part ] = trim( $inner->render() );
				} elseif ( count( $inner->inner_blocks ) ) {
					$walk( $inner->inner_blocks );
				}
			}
		};

		if ( $block instanceof WP_Block ) {
			$walk( $block->inner_blocks );
		}

		return $parts;
	}

	/**
	 * One step: a link, or for the current page plain text.
	 *
	 * @param array  $parts      Part templates.
	 * @param array  $step       Step: label and URL.
	 * @param bool   $is_current Whether it's the current page.
	 * @param string $home       How to show the home step: text, icon or both ("text" for other steps).
	 * @return string HTML.
	 */
	private static function crumb( $parts, $step, $is_current, $home ) {
		$label = self::label_html( $step['label'], $home );

		if ( $is_current ) {
			$template = $parts['current'] ?? '';

			if ( '' === $template ) {
				$template = '<span>' . esc_html( $step['label'] ) . '</span>';
			}

			return self::fill( $template, $label, null, array( 'aria-current' => 'page' ) );
		}

		$template = $parts['item'] ?? '';

		if ( '' === $template ) {
			$template = '<a href="#">' . esc_html( $step['label'] ) . '</a>';
		}

		// A step without a page of its own (e.g. "Page not found") isn't a link.
		return self::fill( $template, $label, '' !== $step['url'] ? $step['url'] : null, array() );
	}

	/**
	 * The separator after a step, hidden from screen readers (the list
	 * already says how the steps relate).
	 *
	 * @param array $parts Part templates.
	 * @return string HTML.
	 */
	private static function separator( $parts ) {
		if ( empty( $parts['separator'] ) ) {
			return '';
		}

		$processor = new WP_HTML_Tag_Processor( $parts['separator'] );

		if ( $processor->next_tag() ) {
			$processor->set_attribute( 'aria-hidden', 'true' );
			$processor->add_class( 'tmb-breadcrumbs__separator' );
		}

		return $processor->get_updated_html();
	}

	/**
	 * Escaped label HTML; for the home step optionally a house icon, with the
	 * text kept for screen readers.
	 *
	 * @param string $label Label.
	 * @param string $home  text, icon or both.
	 * @return string HTML.
	 */
	private static function label_html( $label, $home ) {
		$text = esc_html( $label );

		if ( 'text' === $home ) {
			return $text;
		}

		$icon = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align:-0.125em' . ( 'both' === $home ? ';margin-inline-end:0.375em' : '' ) . '"><path d="M12 3.2 2.5 11.6l1.2 1.3L5 11.8V20a1 1 0 0 0 1 1h4.5v-6h3v6H18a1 1 0 0 0 1-1v-8.2l1.3 1.1 1.2-1.3z"/></svg>';

		if ( 'both' === $home ) {
			return $icon . $text;
		}

		return $icon . '<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap">' . $text . '</span>';
	}

	/**
	 * Put a step's text (and link) into a part's markup.
	 *
	 * @param string      $template   Part HTML.
	 * @param string      $label_html Escaped label HTML.
	 * @param string|null $url        Link, or null for no link.
	 * @param array       $attributes Extra attributes for the part's tag.
	 * @return string HTML.
	 */
	private static function fill( $template, $label_html, $url, $attributes ) {
		$processor = new WP_HTML_Tag_Processor( $template );

		if ( $processor->next_tag() ) {
			if ( 'A' === $processor->get_tag() ) {
				if ( null === $url ) {
					$processor->remove_attribute( 'href' );
				} else {
					// The tag processor escapes the value itself.
					$processor->set_attribute( 'href', esc_url_raw( $url ) );
				}
			}

			foreach ( $attributes as $name => $value ) {
				$processor->set_attribute( $name, $value );
			}
		}

		$html = $processor->get_updated_html();

		// A GB Text block with an icon keeps its text in an inner span.
		$replaced = preg_replace( '#(<span class="gb-text">).*?(</span>)#s', '${1}' . self::literal( $label_html ) . '${2}', $html, 1, $count );

		if ( $count ) {
			return $replaced;
		}

		return (string) preg_replace( '#^(\s*<[^>]+>).*(</[a-zA-Z0-9]+>\s*)$#s', '${1}' . self::literal( $label_html ) . '${2}', $html );
	}

	/**
	 * Escape a string for use as a preg_replace() replacement.
	 *
	 * @param string $text Text.
	 * @return string
	 */
	private static function literal( $text ) {
		return str_replace( array( '\\', '$' ), array( '\\\\', '\\$' ), $text );
	}

	/**
	 * Breadcrumb structured data (schema.org BreadcrumbList) for search
	 * engines: when asked, or automatically when no SEO plugin already adds
	 * it. Printed once, in the footer, for the first breadcrumbs on the page
	 * (so a render nobody sees, like an excerpt, can't use it up).
	 *
	 * @param array $trail   Trail (including the current page).
	 * @param array $options Options.
	 */
	private static function queue_schema( $trail, $options ) {
		$wanted = 'always' === $options['schema']
			|| ( 'auto' === $options['schema'] && ! Thingamablocks_Breadcrumbs_Trail::seo_plugin_adds_schema() );

		if ( ! $wanted || count( $trail ) < 2 || null !== self::$schema_trail ) {
			return;
		}

		self::$schema_trail = $trail;
		add_action( 'wp_footer', array( __CLASS__, 'print_schema' ) );
	}

	/**
	 * The trail queued for structured data.
	 *
	 * @var array|null
	 */
	private static $schema_trail = null;

	/**
	 * Print the queued structured data.
	 */
	public static function print_schema() {
		if ( empty( self::$schema_trail ) ) {
			return;
		}

		$items = array();

		foreach ( array_values( self::$schema_trail ) as $index => $step ) {
			$item = array(
				'@type'    => 'ListItem',
				'position' => $index + 1,
				'name'     => $step['label'],
			);

			if ( '' !== $step['url'] ) {
				$item['item'] = esc_url_raw( $step['url'] );
			}

			$items[] = $item;
		}

		$data = array(
			'@context'        => 'https://schema.org',
			'@type'           => 'BreadcrumbList',
			'itemListElement' => $items,
		);

		self::$schema_trail = array();

		// JSON with "<", ">" and "&" escaped can't end the script element.
		echo '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
}
