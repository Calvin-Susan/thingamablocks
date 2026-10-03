<?php
/**
 * Default GenerateBlocks Pro Global Styles for the blocks' starting layouts.
 *
 * The layouts give their blocks shared classes (tmb-countdown__number…) instead
 * of per-block styles, so every countdown on a site looks the same and changes
 * together: edit the class in GenerateBlocks' Styles panel. Remove or swap the
 * class on one block to give it its own look.
 *
 * The classes are created once, as ordinary Global Styles in the "Thingamablocks"
 * category (GB Pro 2.8+ shows categories), the first time an administrator
 * loads wp-admin after the plugin adds a new one. After that they belong to the
 * site: the plugin remembers each class it has handled and never touches it
 * again, so edits are kept and a deleted class stays deleted.
 *
 * GenerateBlocks Pro keeps Global Styles as `gblocks_styles` posts: the class
 * in `gb_style_selector`, the Styles panel data in `gb_style_data` and the
 * compiled CSS in `gb_style_css`. `menu_order` is their order in the global
 * stylesheet, so base classes are created before their modifiers. GB Pro
 * recompiles the CSS whenever a class is edited.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Creates the default Global Styles.
 */
class Thingamablocks_Global_Styles {

	/**
	 * Option listing the classes already handled (created, or found existing).
	 */
	const OPTION = 'thingamablocks_global_styles';

	/**
	 * Category shown in GenerateBlocks' Global Styles list.
	 */
	const CATEGORY = 'Thingamablocks';

	/**
	 * Hook up.
	 */
	public static function init() {
		add_action( 'admin_init', array( __CLASS__, 'maybe_create' ) );

		// Without GB Pro there are no Global Styles. The local test site
		// (Playground: free GenerateBlocks) sets this constant to print the
		// default classes itself, so the layouts look and test as they would
		// with GB Pro. Never on a real site.
		if ( defined( 'THINGAMABLOCKS_PRINT_DEFAULT_STYLES' ) && THINGAMABLOCKS_PRINT_DEFAULT_STYLES ) {
			// Front end and the editor canvas.
			add_action( 'enqueue_block_assets', array( __CLASS__, 'print_defaults' ), 20 );
		}
	}

	/**
	 * Print the default classes as a stylesheet, when GB Pro isn't there to.
	 */
	public static function print_defaults() {
		if ( self::available() ) {
			return;
		}

		$css = '';

		foreach ( self::enabled_defaults() as $class_name => $styles ) {
			$css .= self::compile( '.' . $class_name, $styles );
		}

		wp_register_style( 'thingamablocks-default-styles', false, array(), THINGAMABLOCKS_VERSION );
		wp_enqueue_style( 'thingamablocks-default-styles' );
		wp_add_inline_style( 'thingamablocks-default-styles', $css );
	}

	/**
	 * Default classes, per feature switch, base classes before their modifiers.
	 * Each block's are in includes/global-styles/{feature}.php. Values are
	 * GenerateBlocks styles (camelCase properties, longhands).
	 *
	 * @return array Feature key => array( class name => styles ).
	 */
	public static function defaults() {
		static $defaults = null;

		if ( null === $defaults ) {
			$defaults = array();

			foreach ( array( 'toggle', 'countdown', 'marquee', 'dropdown', 'breadcrumbs', 'search', 'toc', 'share' ) as $feature ) {
				$file = THINGAMABLOCKS_DIR . 'includes/global-styles/' . $feature . '.php';

				if ( file_exists( $file ) ) {
					$build                = require $file;
					$defaults[ $feature ] = $build();
				}
			}
		}

		return $defaults;
	}

	/**
	 * Whether GenerateBlocks Pro's Global Styles are available.
	 *
	 * @return bool
	 */
	public static function available() {
		return class_exists( 'GenerateBlocks_Pro_Styles' )
			&& method_exists( 'GenerateBlocks_Pro_Styles', 'get_class_by_name' )
			&& post_type_exists( 'gblocks_styles' );
	}

	/**
	 * Whether the current user may create Global Styles.
	 *
	 * @return bool
	 */
	public static function can_manage() {
		return method_exists( 'GenerateBlocks_Pro_Styles', 'can_manage_styles' )
			? GenerateBlocks_Pro_Styles::can_manage_styles()
			: current_user_can( 'manage_options' );
	}

	/**
	 * Create the default classes this site hasn't had yet (a new install, a
	 * feature switched on, or an update that adds classes).
	 */
	public static function maybe_create() {
		// Only on an ordinary admin page load: not the background requests an
		// admin page fires at the same time (AJAX, REST, cron).
		if ( wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}

		if ( ! self::available() || ! self::can_manage() ) {
			return;
		}

		$handled = get_option( self::OPTION, array() );
		$handled = is_array( $handled ) ? $handled : array();
		$new     = array_diff_key( self::enabled_defaults(), array_flip( $handled ) );

		if ( ! $new || ! self::lock() ) {
			return;
		}

		// Re-read the list now that this request holds the lock: another may
		// have just finished.
		wp_cache_delete( 'alloptions', 'options' );
		wp_cache_delete( 'notoptions', 'options' );
		wp_cache_delete( self::OPTION, 'options' );
		$handled = get_option( self::OPTION, array() );
		$handled = is_array( $handled ) ? $handled : array();
		$new     = array_diff_key( $new, array_flip( $handled ) );

		if ( $new ) {
			self::create_missing( $new, $handled );
		}

		delete_option( self::OPTION . '_lock' );
	}

	/**
	 * Claim the job, so two admin requests at once can't both create classes.
	 * A lock left by a request that died is ignored after a minute.
	 *
	 * @return bool Whether this request may create the classes.
	 */
	private static function lock() {
		global $wpdb;

		$key = self::OPTION . '_lock';

		// A lock left by a request that died a while ago.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- must read the database, not the options cache.
		$since = $wpdb->get_var( $wpdb->prepare( "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", $key ) );

		// Only delete the lock we read, so two requests can't both clear it.
		if ( null !== $since && (int) $since < time() - MINUTE_IN_SECONDS ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- compare-and-delete.
			$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name = %s AND option_value = %s", $key, $since ) );
		}

		// INSERT IGNORE adds the row for exactly one request; add_option()
		// can't be used, as it quietly succeeds when the row already exists.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- an atomic lock.
		return 1 === (int) $wpdb->query( $wpdb->prepare( "INSERT IGNORE INTO {$wpdb->options} (option_name, option_value, autoload) VALUES (%s, %s, 'no')", $key, (string) time() ) );
	}

	/**
	 * Defaults for the features that are switched on.
	 *
	 * @return array Class name => styles.
	 */
	public static function enabled_defaults() {
		$classes = array();

		foreach ( self::defaults() as $feature => $feature_classes ) {
			if ( thingamablocks_is_enabled( $feature ) ) {
				$classes = array_merge( $classes, $feature_classes );
			}
		}

		return $classes;
	}

	/**
	 * Create the classes that don't exist yet. Existing ones (including any
	 * the site has edited) are left alone. Base classes come before their
	 * modifiers in $classes, so they get a lower menu_order (earlier in the
	 * stylesheet) and the modifiers override them.
	 *
	 * GB Pro rebuilds its whole stylesheet after every Global Style is saved;
	 * that's paused here and done once at the end. Progress is saved after
	 * each class, so a request that runs out of time carries on next time.
	 *
	 * @param array    $classes Class name => styles.
	 * @param string[] $handled Classes already handled.
	 * @return string[] Classes handled: created, or already there.
	 */
	public static function create_missing( $classes, $handled = array() ) {
		global $wpdb;

		$styles_css = null;

		if ( class_exists( 'GenerateBlocks_Pro_Enqueue_Styles' ) && method_exists( 'GenerateBlocks_Pro_Enqueue_Styles', 'build_css' ) ) {
			$styles_css = GenerateBlocks_Pro_Enqueue_Styles::get_instance();
		}

		$paused  = $styles_css && remove_action( 'wp_after_insert_post', array( $styles_css, 'build_css_file_on_save' ), 100 );
		$created = false;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one read, only when there are new classes.
		$order = (int) $wpdb->get_var( $wpdb->prepare( "SELECT MAX(menu_order) FROM {$wpdb->posts} WHERE post_type = %s", 'gblocks_styles' ) );

		foreach ( $classes as $class_name => $styles ) {
			$selector = '.' . $class_name;

			if ( GenerateBlocks_Pro_Styles::get_class_by_name( $selector ) ) {
				$handled[] = $class_name;
				update_option( self::OPTION, $handled, false );
				continue;
			}

			$post_id = wp_insert_post(
				array(
					'post_type'   => 'gblocks_styles',
					'post_status' => 'publish',
					'post_title'  => $selector,
					'menu_order'  => ++$order,
					'meta_input'  => array(
						'gb_style_selector' => $selector,
						'gb_style_data'     => $styles,
						'gb_style_css'      => self::compile( $selector, $styles ),
						'gb_style_category' => self::CATEGORY,
					),
				),
				true
			);

			// A failed insert isn't marked handled, so it's tried again next time.
			if ( ! is_wp_error( $post_id ) ) {
				$handled[] = $class_name;
				$created   = true;
				update_option( self::OPTION, $handled, false );
			}
		}

		if ( $paused ) {
			add_action( 'wp_after_insert_post', array( $styles_css, 'build_css_file_on_save' ), 100, 2 );
		}

		// One rebuild of GB Pro's stylesheet (cached CSS and file) for them all.
		if ( $created && $styles_css ) {
			$styles_css->build_css();
		}

		return $handled;
	}

	/**
	 * A nested selector, as GenerateBlocks builds it: "&" is the parent, and a
	 * key without one ("svg", ".gb-shape svg") means a descendant.
	 *
	 * @param string $parent_selector Parent selector.
	 * @param string $key             Nested key, e.g. "&:hover" or ".gb-shape svg".
	 * @return string Selector.
	 */
	private static function nest( $parent_selector, $key ) {
		// Split on top-level commas only, not those inside :is( … ).
		$parts = array();
		$depth = 0;
		$part  = '';

		foreach ( str_split( $key ) as $char ) {
			if ( ',' === $char && 0 === $depth ) {
				$parts[] = $part;
				$part    = '';
				continue;
			}

			$depth += ( '(' === $char ) - ( ')' === $char );
			$part  .= $char;
		}

		$parts[] = $part;

		foreach ( $parts as $index => $selector ) {
			$selector        = trim( $selector );
			$parts[ $index ] = false !== strpos( $selector, '&' ) ? str_replace( '&', $parent_selector, $selector ) : $parent_selector . ' ' . $selector;
		}

		return implode( ',', $parts );
	}

	/**
	 * Compile GenerateBlocks styles to CSS. Covers what the defaults use:
	 * properties, nested "&…" selectors and @media rules.
	 *
	 * @param string $selector Selector, e.g. ".tmb-countdown__number".
	 * @param array  $styles   GenerateBlocks styles.
	 * @return string CSS.
	 */
	public static function compile( $selector, $styles ) {
		$declarations = '';
		$nested       = '';

		foreach ( $styles as $property => $value ) {
			if ( is_array( $value ) ) {
				if ( 0 === strpos( $property, '@' ) ) {
					$nested .= $property . '{' . self::compile( $selector, $value ) . '}';
				} else {
					$nested .= self::compile( self::nest( $selector, $property ), $value );
				}

				continue;
			}

			$declarations .= strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $property ) ) . ':' . $value . ';';
		}

		return ( $declarations ? $selector . '{' . $declarations . '}' : '' ) . $nested;
	}
}

Thingamablocks_Global_Styles::init();
