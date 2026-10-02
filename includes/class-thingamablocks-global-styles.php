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
	}

	/**
	 * Default classes, per feature switch, base classes before their modifiers.
	 * Values are GenerateBlocks styles (camelCase properties, longhands).
	 *
	 * @return array Feature key => array( class name => styles ).
	 */
	public static function defaults() {
		$text   = '#222222';
		$muted  = '#575760';
		$subtle = '#b2b2be';

		return array(
			'countdown' => array(
				'tmb-countdown__timer'          => array(
					'display'   => 'flex',
					'flexWrap'  => 'wrap',
					'columnGap' => '0.75rem',
					'rowGap'    => '0.75rem',
				),
				'tmb-countdown__timer--inline'  => array(
					'display'    => 'inline-flex',
					'alignItems' => 'baseline',
					'columnGap'  => '0.5rem',
					'color'      => $text,
				),
				'tmb-countdown__timer--large'   => array(
					'alignItems' => 'flex-start',
					'columnGap'  => '0.5rem',
					'rowGap'     => '1rem',
				),
				'tmb-countdown__unit'           => array(
					'display'       => 'flex',
					'flexDirection' => 'column',
					'alignItems'    => 'center',
				),
				'tmb-countdown__unit--boxes'    => array(
					'minWidth'                => '4.75rem',
					'paddingTop'              => '1rem',
					'paddingRight'            => '0.75rem',
					'paddingBottom'           => '1rem',
					'paddingLeft'             => '0.75rem',
					'borderTopLeftRadius'     => '0.5rem',
					'borderTopRightRadius'    => '0.5rem',
					'borderBottomRightRadius' => '0.5rem',
					'borderBottomLeftRadius'  => '0.5rem',
					'borderTopWidth'          => '1px',
					'borderRightWidth'        => '1px',
					'borderBottomWidth'       => '1px',
					'borderLeftWidth'         => '1px',
					'borderTopStyle'          => 'solid',
					'borderRightStyle'        => 'solid',
					'borderBottomStyle'       => 'solid',
					'borderLeftStyle'         => 'solid',
					'borderTopColor'          => '#f0f0f0',
					'borderRightColor'        => '#f0f0f0',
					'borderBottomColor'       => '#f0f0f0',
					'borderLeftColor'         => '#f0f0f0',
					'backgroundColor'         => '#f7f8f9',
				),
				'tmb-countdown__unit--inline'   => array(
					'display'       => 'inline-flex',
					'flexDirection' => 'row',
					'alignItems'    => 'baseline',
					'columnGap'     => '0.125rem',
				),
				'tmb-countdown__unit--large'    => array(
					'minWidth' => '4.5rem',
				),
				'tmb-countdown__number'         => array(
					'display'            => 'block',
					'fontVariantNumeric' => 'tabular-nums',
					'fontWeight'         => '700',
					'lineHeight'         => '1',
					'color'              => $text,
				),
				'tmb-countdown__number--boxes'  => array(
					'fontSize' => '2.25rem',
				),
				'tmb-countdown__number--inline' => array(
					'display'    => 'inline',
					'lineHeight' => 'inherit',
				),
				'tmb-countdown__number--large'  => array(
					'fontSize'      => '3rem',
					'letterSpacing' => '-0.02em',
				),
				'tmb-countdown__label'          => array(
					'marginTop'     => '0.375rem',
					'fontSize'      => '0.75rem',
					'fontWeight'    => '600',
					'letterSpacing' => '0.08em',
					'textTransform' => 'uppercase',
					'color'         => $muted,
				),
				'tmb-countdown__label--large'   => array(
					'marginTop'  => '0.5rem',
					'fontWeight' => '400',
				),
				'tmb-countdown__intro'          => array(
					'color' => $muted,
				),
				'tmb-countdown__suffix'         => array(
					'color' => $muted,
				),
				'tmb-countdown__separator'      => array(
					'fontSize'   => '3rem',
					'fontWeight' => '300',
					'lineHeight' => '1',
					'color'      => $subtle,
				),
				'tmb-countdown__ended'          => array(
					'marginBottom' => '0',
					'fontWeight'   => '600',
					'color'        => $text,
				),
			),
		);
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
		if ( ! self::available() || ! self::can_manage() ) {
			return;
		}

		$handled = get_option( self::OPTION, array() );
		$handled = is_array( $handled ) ? $handled : array();
		$new     = array_diff_key( self::enabled_defaults(), array_flip( $handled ) );

		if ( ! $new || ! self::lock() ) {
			return;
		}

		$handled = array_merge( $handled, self::create_missing( $new ) );
		update_option( self::OPTION, array_values( array_unique( $handled ) ), true );
		delete_option( self::OPTION . '_lock' );
	}

	/**
	 * Claim the job, so two admin requests at once can't both create classes.
	 * A lock left by a request that died is ignored after a minute.
	 *
	 * @return bool Whether this request may create the classes.
	 */
	private static function lock() {
		$key = self::OPTION . '_lock';

		if ( add_option( $key, time(), '', false ) ) {
			return true;
		}

		if ( (int) get_option( $key ) < time() - MINUTE_IN_SECONDS ) {
			update_option( $key, time(), false );
			return true;
		}

		return false;
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
	 * @param array $classes Class name => styles.
	 * @return string[] Classes handled: created, or already there.
	 */
	public static function create_missing( $classes ) {
		global $wpdb;

		$handled = array();
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one read, only when there are new classes.
		$order = (int) $wpdb->get_var( $wpdb->prepare( "SELECT MAX(menu_order) FROM {$wpdb->posts} WHERE post_type = %s", 'gblocks_styles' ) );

		foreach ( $classes as $class_name => $styles ) {
			$selector = '.' . $class_name;

			if ( GenerateBlocks_Pro_Styles::get_class_by_name( $selector ) ) {
				$handled[] = $class_name;
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
			}
		}

		return $handled;
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
					$nested .= self::compile( str_replace( '&', $selector, $property ), $value );
				}

				continue;
			}

			$declarations .= strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $property ) ) . ':' . $value . ';';
		}

		return ( $declarations ? $selector . '{' . $declarations . '}' : '' ) . $nested;
	}
}

Thingamablocks_Global_Styles::init();
