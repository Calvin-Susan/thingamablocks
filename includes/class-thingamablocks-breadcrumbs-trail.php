<?php
/**
 * The breadcrumb trail for the current page.
 *
 * Built from WordPress's own data. Each step is a label and a URL; the last step is the
 * current page. Only pages visitors can see are included.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Works out the breadcrumb trail.
 */
class Thingamablocks_Breadcrumbs_Trail {
	/**
	 * The trail.
	 *
	 * @param array $options {
	 *     Options.
	 *
	 *     @type string $home_label Label for the home step.
	 *     @type bool   $blog_page  Include the blog page on posts.
	 *     @type bool   $category   Include the category on posts.
	 * }
	 * @return array List of [ 'label' => string, 'url' => string ]. The last is the current page.
	 */
	public static function get( $options ) {
		$trail = self::build( $options );

		/**
		 * Filter the breadcrumb trail.
		 *
		 * @param array $trail   List of [ 'label' => string, 'url' => string ].
		 * @param array $options Block options.
		 */
		$trail   = apply_filters( 'thingamablocks_breadcrumbs_trail', $trail, $options );
		$charset = get_bloginfo( 'charset' );
		$clean   = array();

		foreach ( (array) $trail as $step ) {
			if ( ! is_array( $step ) ) {
				continue;
			}

			// Real tags out first, then entities decoded: "I <3 cats" survives,
			// "&amp;" becomes "&". Output escapes it again.
			$label = preg_replace( '#</?[a-zA-Z][^>]*>#', '', (string) ( $step['label'] ?? '' ) );
			$label = trim( html_entity_decode( $label, ENT_QUOTES, $charset ) );

			if ( '' !== $label ) {
				$clean[] = array(
					'label' => $label,
					'url'   => (string) ( $step['url'] ?? '' ),
				);
			}
		}

		return $clean;
	}

	/**
	 * The trail built from WordPress's own data.
	 *
	 * @param array $options Options.
	 * @return array Trail.
	 */
	private static function build( $options ) {
		$trail = array( self::step( $options['home_label'], home_url( '/' ) ) );

		if ( is_front_page() ) {
			return $trail;
		}

		$shop = self::shop_page();

		if ( is_home() ) {
			$blog    = (int) get_option( 'page_for_posts' );
			$trail[] = $blog && is_post_publicly_viewable( $blog ) ? self::post_step( $blog ) : self::step( __( 'Blog', 'thingamablocks' ), '' );
		} elseif ( is_singular() ) {
			$post  = get_queried_object();
			$trail = array_merge( $trail, self::before_post( $post, $options, $shop ) );

			$trail[] = self::post_step( $post );
		} elseif ( is_category() || is_tag() || is_tax() ) {
			$trail = array_merge( $trail, self::before_term( get_queried_object(), $options, $shop ) );
		} elseif ( is_post_type_archive() ) {
			$type = get_queried_object();

			if ( $shop && 'product' === ( $type->name ?? '' ) ) {
				$trail[] = self::post_step( $shop );
			} else {
				$trail[] = self::step( post_type_archive_title( '', false ), get_post_type_archive_link( $type->name ?? '' ) );
			}
		} elseif ( is_author() ) {
			$author  = get_queried_object();
			$trail[] = self::step( $author->display_name ?? '', get_author_posts_url( $author->ID ?? 0 ) );
		} elseif ( is_date() ) {
			$trail = array_merge( $trail, self::date_steps() );
		} elseif ( is_search() ) {
			/* translators: %s: search terms. */
			$trail[] = self::step( sprintf( __( 'Search results for “%s”', 'thingamablocks' ), get_search_query( false ) ), get_search_link() );
		} elseif ( is_404() ) {
			$trail[] = self::step( __( 'Page not found', 'thingamablocks' ), '' );
		}

		return $trail;
	}

	/**
	 * The steps for a term archive: the shop, blog page or post type archive
	 * it belongs to, its parents, then the term.
	 *
	 * @param WP_Term $term    Term.
	 * @param array   $options Options.
	 * @param int     $shop    WooCommerce shop page ID, or 0.
	 * @return array Steps.
	 */
	private static function before_term( $term, $options, $shop ) {
		$steps    = array();
		$taxonomy = get_taxonomy( $term->taxonomy );
		$types    = $taxonomy ? (array) $taxonomy->object_type : array();

		if ( $shop && in_array( $term->taxonomy, array( 'product_cat', 'product_tag' ), true ) ) {
			$steps[] = self::post_step( $shop );
		} elseif ( in_array( 'post', $types, true ) ) {
			if ( ! empty( $options['blog_page'] ) ) {
				$steps = self::blog_page();
			}
		} elseif ( 1 === count( $types ) ) {
			// A custom post type's taxonomy: its archive first, as on its posts.
			$steps = self::post_type_archive( $types[0] );
		}

		$steps   = array_merge( $steps, self::term_ancestors( $term ) );
		$steps[] = self::step( $term->name, get_term_link( $term ) );

		return $steps;
	}

	/**
	 * Year, month and day steps for a date archive (pretty or plain permalinks).
	 *
	 * @return array Steps.
	 */
	private static function date_steps() {
		global $wp_locale;

		$year  = (int) get_query_var( 'year' );
		$month = (int) get_query_var( 'monthnum' );
		$day   = (int) get_query_var( 'day' );
		$m     = (string) get_query_var( 'm' );

		// Plain permalinks: ?m=20260315.
		if ( ! $year && preg_match( '/^(\d{4})(\d{2})?(\d{2})?/', $m, $parts ) ) {
			$year  = (int) $parts[1];
			$month = (int) ( $parts[2] ?? 0 );
			$day   = (int) ( $parts[3] ?? 0 );
		}

		if ( ! $year ) {
			return array();
		}

		$steps = array( self::step( (string) $year, get_year_link( $year ) ) );

		if ( $month ) {
			// The month's name straight from the locale: no date maths, so no
			// timezone can turn the 1st into the last day of the month before.
			$steps[] = self::step( $wp_locale->get_month( $month ), get_month_link( $year, $month ) );
		}

		if ( $month && $day ) {
			$steps[] = self::step( (string) $day, get_day_link( $year, $month, $day ) );
		}

		return $steps;
	}

	/**
	 * The steps between home and a post: its archive, blog page or shop,
	 * category and parent pages.
	 *
	 * @param WP_Post $post    Post.
	 * @param array   $options Options.
	 * @param int     $shop    WooCommerce shop page ID, or 0.
	 * @return array Steps.
	 */
	private static function before_post( $post, $options, $shop ) {
		$steps = array();

		if ( 'post' === $post->post_type ) {
			if ( ! empty( $options['blog_page'] ) ) {
				$steps = self::blog_page();
			}

			if ( ! empty( $options['category'] ) ) {
				$steps = array_merge( $steps, self::term_steps( self::primary_term( $post, 'category' ) ) );
			}

			return $steps;
		}

		if ( 'product' === $post->post_type && $shop ) {
			$steps[] = self::post_step( $shop );

			return array_merge( $steps, self::term_steps( self::primary_term( $post, 'product_cat' ) ) );
		}

		if ( 'attachment' === $post->post_type ) {
			$parent = $post->post_parent ? get_post( $post->post_parent ) : null;

			if ( $parent && is_post_publicly_viewable( $parent ) ) {
				$steps   = self::before_post( $parent, $options, $shop );
				$steps[] = self::post_step( $parent );
			}

			return $steps;
		}

		// A custom post type with an archive page.
		if ( 'page' !== $post->post_type ) {
			$steps = self::post_type_archive( $post->post_type );
		}

		// Parent pages (or parents in any hierarchical post type). Private and
		// draft parents are left out: visitors can't see them.
		foreach ( array_reverse( get_post_ancestors( $post ) ) as $ancestor ) {
			if ( is_post_publicly_viewable( $ancestor ) ) {
				$steps[] = self::post_step( $ancestor );
			}
		}

		return $steps;
	}

	/**
	 * A post type's archive page, if it has one.
	 *
	 * @param string $post_type Post type.
	 * @return array Zero or one step.
	 */
	private static function post_type_archive( $post_type ) {
		$archive = get_post_type_archive_link( $post_type );
		$type    = get_post_type_object( $post_type );

		return $archive && $type ? array( self::step( $type->labels->name, $archive ) ) : array();
	}

	/**
	 * The blog page, if the site has one (Settings → Reading → Posts page).
	 *
	 * @return array Zero or one step.
	 */
	private static function blog_page() {
		$blog = (int) get_option( 'page_for_posts' );

		return $blog && 'page' === get_option( 'show_on_front' ) && is_post_publicly_viewable( $blog ) ? array( self::post_step( $blog ) ) : array();
	}

	/**
	 * A post's main term in a taxonomy: the SEO plugin's "primary" one if
	 * set, otherwise the first.
	 *
	 * @param WP_Post $post     Post.
	 * @param string  $taxonomy Taxonomy.
	 * @return WP_Term|null Term.
	 */
	private static function primary_term( $post, $taxonomy ) {
		$terms = get_the_terms( $post, $taxonomy );

		if ( ! is_array( $terms ) || empty( $terms ) ) {
			return null;
		}

		$primary = (int) get_post_meta( $post->ID, '_yoast_wpseo_primary_' . $taxonomy, true );

		if ( ! $primary ) {
			$primary = (int) get_post_meta( $post->ID, 'rank_math_primary_' . $taxonomy, true );
		}

		// SEOPress sets a primary category (categories only).
		if ( ! $primary && 'category' === $taxonomy ) {
			$primary = (int) get_post_meta( $post->ID, '_seopress_robots_primary_cat', true );
		}

		foreach ( $terms as $term ) {
			if ( $term->term_id === $primary ) {
				return $term;
			}
		}

		return $terms[0];
	}

	/**
	 * A term with its parents, outermost first.
	 *
	 * @param WP_Term|null $term Term.
	 * @return array Steps.
	 */
	private static function term_steps( $term ) {
		if ( ! $term ) {
			return array();
		}

		$steps   = self::term_ancestors( $term );
		$steps[] = self::step( $term->name, get_term_link( $term ) );

		return $steps;
	}

	/**
	 * A term's parents, outermost first.
	 *
	 * @param WP_Term $term Term.
	 * @return array Steps.
	 */
	private static function term_ancestors( $term ) {
		$steps = array();

		foreach ( array_reverse( get_ancestors( $term->term_id, $term->taxonomy, 'taxonomy' ) ) as $ancestor_id ) {
			$ancestor = get_term( $ancestor_id, $term->taxonomy );

			if ( $ancestor && ! is_wp_error( $ancestor ) ) {
				$steps[] = self::step( $ancestor->name, get_term_link( $ancestor ) );
			}
		}

		return $steps;
	}

	/**
	 * The WooCommerce shop page, if WooCommerce is active and it isn't also
	 * the front page (where "Home" already covers it).
	 *
	 * @return int Page ID, or 0.
	 */
	private static function shop_page() {
		if ( ! function_exists( 'wc_get_page_id' ) ) {
			return 0;
		}

		$shop  = max( 0, (int) wc_get_page_id( 'shop' ) );
		$front = 'page' === get_option( 'show_on_front' ) ? (int) get_option( 'page_on_front' ) : 0;

		// Not the front page (home already covers it), and only if visitors can see it.
		return $shop === $front || ! $shop || ! is_post_publicly_viewable( $shop ) ? 0 : $shop;
	}

	/**
	 * A step for a post or page: its title as written (without the
	 * "Private:" or "Protected:" prefixes WordPress adds) and its link.
	 *
	 * @param WP_Post|int $post Post.
	 * @return array Step.
	 */
	private static function post_step( $post ) {
		$post = get_post( $post );

		if ( ! $post ) {
			return self::step( '', '' );
		}

		// WordPress's own title filter, without the prefixes get_the_title() adds.
		return self::step( apply_filters( 'the_title', $post->post_title, $post->ID ), get_permalink( $post ) ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- core hook.
	}

	/**
	 * One step.
	 *
	 * @param string          $label Label.
	 * @param string|WP_Error $url   URL.
	 * @return array Step.
	 */
	private static function step( $label, $url ) {
		return array(
			'label' => (string) $label,
			'url'   => is_string( $url ) ? $url : '',
		);
	}
}
