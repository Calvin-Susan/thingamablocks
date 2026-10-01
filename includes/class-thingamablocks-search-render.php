<?php
/**
 * Front-end rendering for the Search block.
 *
 * The block renders the <form role="search"> itself; everything visible
 * inside is GenerateBlocks blocks, marked with data-search-part:
 *
 *   field   the box around the input (border, background, font). Gets the
 *           focus ring while the input has focus.
 *   input   a Text block standing in for the text input: it's replaced with
 *           a real <input type="search" name="s"> (keeping its class and
 *           ID), and its text becomes the placeholder.
 *   submit  the search button (a Text block set to <button>).
 *   label   optional visible label (any Text block), made a real <label>.
 *   toggle  optional: a button that opens and closes the field (the
 *           "expanding" style). Only then does a small script load.
 *
 * The content types to search are sent in the form as post_type (one
 * publicly queryable type, the way WooCommerce's product search works) or
 * tmb_types (anything else, applied in pre_get_posts); both are checked
 * against the site's viewable types on the way in.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Search block and applies its content types to the search.
 */
class Thingamablocks_Search_Render {

	/**
	 * Hook in.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_script' ) );
		add_action( 'pre_get_posts', array( __CLASS__, 'limit_types' ) );
	}

	/**
	 * The expanding style's script, enqueued only by a search that uses it.
	 */
	public static function register_script() {
		$asset_file = THINGAMABLOCKS_DIR . 'build/search/expand.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_register_script(
			'thingamablocks-search-expand',
			plugins_url( 'build/search/expand.js', THINGAMABLOCKS_DIR . 'thingamablocks.php' ),
			$asset['dependencies'],
			$asset['version'],
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
		);
	}

	/**
	 * Content types a search may be limited to: ones visitors can already
	 * view (private types never get through), except attachments.
	 *
	 * @param mixed $types Requested types (array, or comma-separated string).
	 * @return string[]
	 */
	public static function allowed_types( $types ) {
		if ( is_string( $types ) ) {
			$types = explode( ',', $types );
		}

		if ( ! is_array( $types ) ) {
			return array();
		}

		$clean = array();

		foreach ( $types as $type ) {
			$type = is_string( $type ) ? sanitize_key( $type ) : '';

			if ( '' !== $type && 'attachment' !== $type && post_type_exists( $type ) && is_post_type_viewable( $type ) ) {
				$clean[] = $type;
			}
		}

		return array_values( array_unique( $clean ) );
	}

	/**
	 * Search only the types a Search block asked for (tmb_types).
	 *
	 * Read from the URL rather than registered as a query variable, so an
	 * unrelated ?tmb_types= can't change which page WordPress shows.
	 *
	 * @param WP_Query $query Query.
	 */
	public static function limit_types( $query ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a public search form (GET); the value is only checked against viewable types.
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() || ! isset( $_GET['tmb_types'] ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- as above.
		$types = self::allowed_types( sanitize_text_field( wp_unslash( (string) ( is_string( $_GET['tmb_types'] ) ? $_GET['tmb_types'] : '' ) ) ) );

		if ( $types ) {
			$query->set( 'post_type', $types );
		}
	}

	/**
	 * Render callback.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Saved inner-block HTML.
	 * @return string
	 */
	public static function render( $attributes, $content ) {
		$label = trim( (string) ( $attributes['label'] ?? '' ) );
		$label = '' !== $label ? $label : __( 'Search', 'thingamablocks' );

		// The input's own ID (from GenerateBlocks) if it has one.
		$input    = Thingamablocks_Html::element( $content, 'data-search-part', 'input' );
		$input_id = is_string( $input['attributes']['id'] ?? null ) && '' !== $input['attributes']['id'] && ! preg_match( '/\s/', $input['attributes']['id'] )
			? $input['attributes']['id']
			: wp_unique_id( 'tmb-search-' );

		list( $content, $labelled ) = self::label( $content, $input_id );

		$content                      = self::input( $content, $input_id, $labelled ? '' : $label );
		$content                      = self::name_icon_only( $content, 'submit', $label, 'submit' );
		list( $content, $expandable ) = self::toggle( $content );

		if ( $expandable ) {
			$content = self::name_icon_only( $content, 'toggle', $label, 'button' );
			wp_enqueue_script( 'thingamablocks-search-expand' );
		}

		$wrapper = array(
			'class'  => 'tmb-search' . ( $expandable ? ' tmb-search--expand' : '' ),
			'role'   => 'search',
			'method' => 'get',
			'action' => esc_url( home_url( '/' ) ),
		);

		if ( ! empty( $attributes['anchor'] ) ) {
			$wrapper['id'] = $attributes['anchor'];
		}

		return sprintf(
			'%1$s<form %2$s>%3$s%4$s</form>',
			$expandable ? self::no_script_style() : '',
			get_block_wrapper_attributes( $wrapper ),
			$content,
			self::type_fields( $attributes['postTypes'] ?? array() )
		);
	}

	/**
	 * Hidden fields that limit the search to the chosen content types.
	 *
	 * @param mixed $types Chosen types.
	 * @return string
	 */
	private static function type_fields( $types ) {
		$types = self::allowed_types( $types );

		if ( ! $types ) {
			return '';
		}

		// One type WordPress can search by itself (posts, products...): the
		// usual post_type, so plugins like WooCommerce show their own results.
		$object = get_post_type_object( $types[0] );

		if ( 1 === count( $types ) && $object && $object->publicly_queryable ) {
			return '<input type="hidden" name="post_type" value="' . esc_attr( $types[0] ) . '" />';
		}

		return '<input type="hidden" name="tmb_types" value="' . esc_attr( implode( ',', $types ) ) . '" />';
	}

	/**
	 * Attributes as HTML.
	 *
	 * @param array $attributes Name => value (true: no value).
	 * @return string
	 */
	private static function attributes( $attributes ) {
		$html = '';

		foreach ( $attributes as $name => $value ) {
			if ( ! preg_match( '/^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/', (string) $name ) ) {
				continue;
			}

			$html .= true === $value ? ' ' . $name : ' ' . $name . '="' . esc_attr( (string) $value ) . '"';
		}

		return $html;
	}

	/**
	 * Replace the "input" part with a real search input, keeping its class
	 * and ID. Its text is the placeholder; on a search results page the
	 * input shows the search.
	 *
	 * @param string $content Inner HTML.
	 * @param string $id      ID for the input.
	 * @param string $label   Accessible name ('' when a <label> names it).
	 * @return string
	 */
	private static function input( $content, $id, $label ) {
		$part = Thingamablocks_Html::element( $content, 'data-search-part', 'input' );

		if ( ! $part ) {
			return $content;
		}

		$inner       = substr( $content, $part['inner_start'], $part['inner_end'] - $part['inner_start'] );
		$placeholder = trim( html_entity_decode( wp_strip_all_tags( $inner ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
		$class       = is_string( $part['attributes']['class'] ?? null ) ? $part['attributes']['class'] : '';

		$attributes = array(
			'type'             => 'search',
			'name'             => 's',
			'id'               => $id,
			'class'            => trim( 'tmb-search__input ' . $class ),
			'value'            => get_search_query( false ),
			'placeholder'      => $placeholder,
			'data-search-part' => 'input',
			'enterkeyhint'     => 'search',
			'aria-label'       => $label,
		);

		$attributes = array_filter(
			$attributes,
			function ( $value, $name ) {
				return '' !== $value || 'value' === $name;
			},
			ARRAY_FILTER_USE_BOTH
		);

		return substr_replace( $content, '<input' . self::attributes( $attributes ) . ' />', $part['start'], $part['end'] - $part['start'] );
	}

	/**
	 * Make the "label" part a real <label> for the input, whatever tag it
	 * was saved with.
	 *
	 * @param string $content Inner HTML.
	 * @param string $id      The input's ID.
	 * @return array { 0: string content, 1: bool whether a label was made }
	 */
	private static function label( $content, $id ) {
		$part = Thingamablocks_Html::element( $content, 'data-search-part', 'label' );

		if ( ! $part ) {
			return array( $content, false );
		}

		$attributes        = $part['attributes'];
		$attributes['for'] = $id;

		// A label that was a block (a paragraph, a heading) stays a block.
		if ( ! in_array( $part['tag'], array( 'SPAN', 'A', 'STRONG', 'EM', 'B', 'I' ), true ) ) {
			$attributes['class'] = trim( ( is_string( $attributes['class'] ?? null ) ? $attributes['class'] : '' ) . ' tmb-search__label--block' );
		}

		$inner = substr( $content, $part['inner_start'], $part['inner_end'] - $part['inner_start'] );
		$label = '<label' . self::attributes( $attributes ) . '>' . $inner . '</label>';

		return array( substr_replace( $content, $label, $part['start'], $part['end'] - $part['start'] ), true );
	}

	/**
	 * Give a button part its type, and a name if it's only an icon (no text).
	 *
	 * @param string $content Inner HTML.
	 * @param string $part    Part name.
	 * @param string $label   Name for an icon-only part.
	 * @param string $type    Button type for a <button>.
	 * @return string
	 */
	private static function name_icon_only( $content, $part, $label, $type ) {
		$found = Thingamablocks_Html::element( $content, 'data-search-part', $part );

		if ( ! $found ) {
			return $content;
		}

		$inner = substr( $content, $found['inner_start'], $found['inner_end'] - $found['inner_start'] );
		$text  = trim( wp_strip_all_tags( (string) preg_replace( '#<svg\b.*?</svg>#is', '', $inner ) ) );
		$tags  = new WP_HTML_Tag_Processor( $content );

		while ( $tags->next_tag() ) {
			if ( $part !== $tags->get_attribute( 'data-search-part' ) ) {
				continue;
			}

			if ( 'BUTTON' === $tags->get_tag() ) {
				// Only a real <button> submits a form without a script.
				$tags->set_attribute( 'type', $type );
			} elseif ( 'button' === $type ) {
				$tags->set_attribute( 'role', 'button' );
				$tags->set_attribute( 'tabindex', '0' );
			}

			if ( '' === $text && null === $tags->get_attribute( 'aria-label' ) && null === $tags->get_attribute( 'aria-labelledby' ) ) {
				$tags->set_attribute( 'aria-label', $label );
			}

			break;
		}

		return $tags->get_updated_html();
	}

	/**
	 * The toggle (expanding style) opens and closes the field: the field
	 * starts closed, and the button says so. Only when the toggle sits
	 * outside the field (inside, it would be hidden with it).
	 *
	 * @param string $content Inner HTML.
	 * @return array { 0: string content, 1: bool whether it's expandable }
	 */
	private static function toggle( $content ) {
		$field  = Thingamablocks_Html::element( $content, 'data-search-part', 'field' );
		$toggle = Thingamablocks_Html::element( $content, 'data-search-part', 'toggle' );

		if ( ! $field || ! $toggle || ( $toggle['start'] > $field['start'] && $toggle['start'] < $field['end'] ) ) {
			return array( $content, false );
		}

		$tags     = new WP_HTML_Tag_Processor( $content );
		$field_id = '';

		while ( $tags->next_tag() ) {
			if ( 'field' !== $tags->get_attribute( 'data-search-part' ) ) {
				continue;
			}

			$field_id = (string) $tags->get_attribute( 'id' );

			if ( '' === $field_id || preg_match( '/\s/', $field_id ) ) {
				$field_id = wp_unique_id( 'tmb-search-field-' );
				$tags->set_attribute( 'id', $field_id );
			}

			$style = rtrim( (string) $tags->get_attribute( 'style' ), '; ' );
			$tags->set_attribute( 'style', ( '' !== $style ? $style . ';' : '' ) . 'display:none' );
			break;
		}

		$tags = new WP_HTML_Tag_Processor( $tags->get_updated_html() );

		while ( $tags->next_tag() ) {
			if ( 'toggle' === $tags->get_attribute( 'data-search-part' ) ) {
				$tags->set_attribute( 'aria-expanded', 'false' );
				$tags->set_attribute( 'aria-controls', $field_id );
				break;
			}
		}

		return array( $tags->get_updated_html(), true );
	}

	/**
	 * Without JavaScript, an expanding search's field is shown in the page
	 * flow and the toggle (which couldn't do anything) is hidden.
	 *
	 * @return string
	 */
	private static function no_script_style() {
		return '<noscript><style>.tmb-search--expand [data-search-part="field"]{display:flex!important;position:static!important}.tmb-search--expand [data-search-part="toggle"]{display:none!important}</style></noscript>';
	}
}

Thingamablocks_Search_Render::init();
