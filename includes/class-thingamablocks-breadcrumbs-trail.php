<?php
/**
 * The breadcrumb trail for the current page.
 *
 * Built from WordPress's own data (or, when asked, taken from Yoast SEO or
 * Rank Math, so what visitors see matches the structured data those plugins
 * give search engines). Each step is a label and a URL; the last step is the
 * current page.
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
	 * The SEO plugin whose breadcrumbs can be used, if one is active.
	 *
	 * @return string 'yoast', 'rank-math' or ''.
	 */
	public static function seo_plugin() {
		if ( function_exists( 'YoastSEO' ) && defined( 'WPSEO_VERSION' ) ) {
			return 'yoast';
		}

		if ( class_exists( '\RankMath\Frontend\Breadcrumbs' ) ) {
			return 'rank-math';
		}

		return '';
	}

	/**
	 * Whether the active SEO plugin already gives search engines breadcrumb
	 * structured data (so adding ours would duplicate it).
	 *
	 * @return bool
	 */
	public static function seo_plugin_adds_schema() {
		$plugin = self::seo_plugin();

		// Yoast includes a BreadcrumbList in its schema on every page.
		if ( 'yoast' === $plugin ) {
			return true;
		}

		// Rank Math adds it when its breadcrumbs are switched on.
		if ( 'rank-math' === $plugin && class_exists( '\RankMath\Helper' ) ) {
			return (bool) \RankMath\Helper::get_settings( 'general.breadcrumbs' );
		}

		return (bool) apply_filters( 'thingamablocks_breadcrumbs_seo_schema', false );
	}

	/**
	 * The trail.
	 *
	 * @param array $options {
	 *     Options.
	 *
	 *     @type bool   $use_seo_plugin Use the SEO plugin's trail when one is active.
	 *     @type string $home_label     Label for the home step.
	 *     @type bool   $blog_page      Include the blog page on posts.
	 *     @type bool   $category       Include the category on posts.
	 * }
	 * @return array List of [ 'label' => string, 'url' => string ]. The last is the current page.
	 */
	public static function get( $options ) {
		$trail = array();

		if ( ! empty( $options['use_seo_plugin'] ) ) {
			$trail = self::from_seo_plugin();
		}

		if ( empty( $trail ) ) {
			$trail = self::build( $options );
		}

		/**
		 * Filter the breadcrumb trail.
		 *
		 * @param array $trail   List of [ 'label' => string, 'url' => string ].
		 * @param array $options Block options.
		 */
		$trail = apply_filters( 'thingamablocks_breadcrumbs_trail', $trail, $options );

		// Only well-formed steps with a label.
		return array_values(
			array_filter(
				array_map(
					function ( $step ) {
						return is_array( $step ) ? array(
							'label' => trim( wp_strip_all_tags( (string) ( $step['label'] ?? '' ) ) ),
							'url'   => (string) ( $step['url'] ?? '' ),
						) : null;
					},
					(array) $trail
				),
				function ( $step ) {
					return $step && '' !== $step['label'];
				}
			)
		);
	}

	/**
	 * The trail from Yoast SEO or Rank Math.
	 *
	 * @return array Trail, or an empty array.
	 */
	private static function from_seo_plugin() {
		$plugin = self::seo_plugin();
		$trail  = array();

		// Another plugin's API must never take the page down: anything
		// unexpected just means the block's own trail is used.
		try {
			if ( 'yoast' === $plugin ) {
				$crumbs = YoastSEO()->meta->for_current_page()->breadcrumbs;

				foreach ( is_array( $crumbs ) ? $crumbs : array() as $crumb ) {
					$trail[] = array(
						'label' => $crumb['text'] ?? '',
						'url'   => $crumb['url'] ?? '',
					);
				}
			}

			if ( 'rank-math' === $plugin ) {
				// False while Rank Math's breadcrumbs are switched off.
				$breadcrumbs = \RankMath\Frontend\Breadcrumbs::get();
				$crumbs      = is_object( $breadcrumbs ) && method_exists( $breadcrumbs, 'get_crumbs' ) ? $breadcrumbs->get_crumbs() : array();

				foreach ( is_array( $crumbs ) ? $crumbs : array() as $crumb ) {
					$trail[] = array(
						'label' => $crumb[0] ?? '',
						'url'   => $crumb[1] ?? '',
					);
				}
			}
		} catch ( Throwable $error ) {
			return array();
		}

		return $trail;
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
			$blog = (int) get_option( 'page_for_posts' );
			$trail[] = self::step( $blog ? get_the_title( $blog ) : __( 'Blog', 'thingamablocks' ), $blog ? get_permalink( $blog ) : '' );
		} elseif ( is_singular() ) {
			$post = get_queried_object();
			$trail = array_merge( $trail, self::before_post( $post, $options, $shop ) );
			$trail[] = self::step( get_the_title( $post ), get_permalink( $post ) );
		} elseif ( is_category() || is_tag() || is_tax() ) {
			$term = get_queried_object();

			if ( $shop && in_array( $term->taxonomy, array( 'product_cat', 'product_tag' ), true ) ) {
				$trail[] = self::step( get_the_title( $shop ), get_permalink( $shop ) );
			} elseif ( in_array( $term->taxonomy, array( 'category', 'post_tag' ), true ) && ! empty( $options['blog_page'] ) ) {
				$trail = array_merge( $trail, self::blog_page() );
			}

			$trail = array_merge( $trail, self::term_ancestors( $term ) );
			$trail[] = self::step( $term->name, get_term_link( $term ) );
		} elseif ( is_post_type_archive() ) {
			$type = get_queried_object();

			if ( $shop && 'product' === ( $type->name ?? '' ) ) {
				$trail[] = self::step( get_the_title( $shop ), get_permalink( $shop ) );
			} else {
				$trail[] = self::step( post_type_archive_title( '', false ), get_post_type_archive_link( $type->name ?? '' ) );
			}
		} elseif ( is_author() ) {
			$author = get_queried_object();
			$trail[] = self::step( $author->display_name ?? '', get_author_posts_url( $author->ID ?? 0 ) );
		} elseif ( is_date() ) {
			$year = (int) get_query_var( 'year' );
			$month = (int) get_query_var( 'monthnum' );
			$day = (int) get_query_var( 'day' );

			$trail[] = self::step( (string) $year, get_year_link( $year ) );

			if ( $month ) {
				$trail[] = self::step( wp_date( 'F', mktime( 0, 0, 0, $month, 1, $year ) ), get_month_link( $year, $month ) );
			}

			if ( $day ) {
				$trail[] = self::step( (string) $day, get_day_link( $year, $month, $day ) );
			}
		} elseif ( is_search() ) {
			/* translators: %s: search terms. */
			$trail[] = self::step( sprintf( __( 'Search results for “%s”', 'thingamablocks' ), get_search_query( false ) ), get_search_link() );
		} elseif ( is_404() ) {
			$trail[] = self::step( __( 'Page not found', 'thingamablocks' ), '' );
		}

		return $trail;
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
				$category = self::primary_term( $post, 'category' );

				if ( $category ) {
					$steps = array_merge( $steps, self::term_ancestors( $category ) );
					$steps[] = self::step( $category->name, get_term_link( $category ) );
				}
			}

			return $steps;
		}

		if ( 'product' === $post->post_type && $shop ) {
			$steps[] = self::step( get_the_title( $shop ), get_permalink( $shop ) );
			$category = self::primary_term( $post, 'product_cat' );

			if ( $category ) {
				$steps = array_merge( $steps, self::term_ancestors( $category ) );
				$steps[] = self::step( $category->name, get_term_link( $category ) );
			}

			return $steps;
		}

		if ( 'attachment' === $post->post_type && $post->post_parent ) {
			$parent = get_post( $post->post_parent );

			if ( $parent ) {
				$steps = array_merge( $steps, self::before_post( $parent, $options, $shop ) );
				$steps[] = self::step( get_the_title( $parent ), get_permalink( $parent ) );
			}

			return $steps;
		}

		// A custom post type with an archive page.
		if ( 'page' !== $post->post_type ) {
			$archive = get_post_type_archive_link( $post->post_type );
			$type = get_post_type_object( $post->post_type );

			if ( $archive && $type ) {
				$steps[] = self::step( $type->labels->name, $archive );
			}
		}

		// Parent pages (or parents in any hierarchical post type).
		foreach ( array_reverse( get_post_ancestors( $post ) ) as $ancestor ) {
			$steps[] = self::step( get_the_title( $ancestor ), get_permalink( $ancestor ) );
		}

		return $steps;
	}

	/**
	 * The blog page, if the site has one (Settings → Reading → Posts page).
	 *
	 * @return array Zero or one step.
	 */
	private static function blog_page() {
		$blog = (int) get_option( 'page_for_posts' );

		return $blog && 'page' === get_option( 'show_on_front' ) ? array( self::step( get_the_title( $blog ), get_permalink( $blog ) ) ) : array();
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

		foreach ( $terms as $term ) {
			if ( $term->term_id === $primary ) {
				return $term;
			}
		}

		return $terms[0];
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
	 * The WooCommerce shop page, if WooCommerce is active.
	 *
	 * @return int Page ID, or 0.
	 */
	private static function shop_page() {
		return function_exists( 'wc_get_page_id' ) ? max( 0, (int) wc_get_page_id( 'shop' ) ) : 0;
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
			'label' => html_entity_decode( (string) $label, ENT_QUOTES, get_bloginfo( 'charset' ) ),
			'url'   => is_string( $url ) ? $url : '',
		);
	}
}
