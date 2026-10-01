<?php
/**
 * Settings → Thingamablocks: switch blocks and features on and off.
 *
 * "Off" keeps the workspace tidy without breaking anything: a switched-off
 * block stays registered (so content already using it still works and can
 * still be edited) but leaves the block inserter, and its patterns leave the
 * Patterns tab. A switched-off feature's panel (Entrance animation, Mask) no
 * longer loads in the editor; content already using it is untouched.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The switchable blocks and features, with labels, descriptions, and what to
 * search post content for to count where each is used.
 *
 * @return array Key => [ label, description, type, needle ].
 */
function thingamablocks_switches() {
	return array(
		'toggle'      => array(
			'label'       => __( 'Toggle', 'thingamablocks' ),
			'description' => __( 'A switch or pair of buttons that shows/hides content, switches dark mode, or toggles classes.', 'thingamablocks' ),
			'type'        => 'block',
			'needle'      => '<!-- wp:thingamablocks/toggle ',
		),
		'countdown'   => array(
			'label'       => __( 'Countdown', 'thingamablocks' ),
			'description' => __( 'A countdown to a date, a per-visitor deadline or a repeating time.', 'thingamablocks' ),
			'type'        => 'block',
			'needle'      => '<!-- wp:thingamablocks/countdown ',
		),
		'marquee'     => array(
			'label'       => __( 'Marquee', 'thingamablocks' ),
			'description' => __( 'An endless scrolling strip of logos, messages or cards.', 'thingamablocks' ),
			'type'        => 'block',
			'needle'      => '<!-- wp:thingamablocks/marquee ',
		),
		'dropdown'    => array(
			'label'       => __( 'Dropdown', 'thingamablocks' ),
			'description' => __( 'A button that opens a drawer of links or anything else.', 'thingamablocks' ),
			'type'        => 'block',
			'needle'      => '<!-- wp:thingamablocks/dropdown ',
		),
		'breadcrumbs' => array(
			'label'       => __( 'Breadcrumbs', 'thingamablocks' ),
			'description' => __( 'The path to the current page, built automatically.', 'thingamablocks' ),
			'type'        => 'block',
			'needle'      => '<!-- wp:thingamablocks/breadcrumbs ',
		),
		'animations'  => array(
			'label'       => __( 'Entrance animations', 'thingamablocks' ),
			'description' => __( 'The “Entrance animation” panel on GenerateBlocks blocks.', 'thingamablocks' ),
			'type'        => 'feature',
			'needle'      => 'data-tmb-animate',
		),
		'masks'       => array(
			'label'       => __( 'Image masks', 'thingamablocks' ),
			'description' => __( 'The “Mask” panel on the GenerateBlocks Image block.', 'thingamablocks' ),
			'type'        => 'feature',
			// No backslashes: they mean different things to LIKE in MySQL and SQLite.
			'needle'      => '"maskImage":"url(',
		),
	);
}

/**
 * Whether a block or feature is switched on (everything is, by default).
 *
 * @param string $key Switch key.
 * @return bool
 */
function thingamablocks_is_enabled( $key ) {
	$settings = get_option( 'thingamablocks_settings', array() );

	return ! is_array( $settings ) || ! isset( $settings[ $key ] ) || ! empty( $settings[ $key ] );
}

add_action( 'admin_init', 'thingamablocks_register_settings' );
/**
 * Register the setting, cleaned on save.
 */
function thingamablocks_register_settings() {
	register_setting(
		'thingamablocks',
		'thingamablocks_settings',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'thingamablocks_sanitize_settings',
			'default'           => array(),
		)
	);
}

/**
 * Keep only known switches, as true/false. An unticked checkbox isn't sent,
 * so every known switch is recorded either way.
 *
 * @param mixed $input Submitted value.
 * @return array
 */
function thingamablocks_sanitize_settings( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();

	foreach ( array_keys( thingamablocks_switches() ) as $key ) {
		$clean[ $key ] = ! empty( $input[ $key ] );
	}

	return $clean;
}

add_action( 'admin_menu', 'thingamablocks_add_settings_page' );
/**
 * Settings → Thingamablocks.
 */
function thingamablocks_add_settings_page() {
	add_options_page(
		__( 'Thingamablocks', 'thingamablocks' ),
		__( 'Thingamablocks', 'thingamablocks' ),
		'manage_options',
		'thingamablocks',
		'thingamablocks_render_settings_page'
	);
}

add_filter( 'plugin_action_links_' . plugin_basename( THINGAMABLOCKS_DIR . 'thingamablocks.php' ), 'thingamablocks_settings_link' );
/**
 * A "Settings" link on the Plugins screen.
 *
 * @param array $links Action links.
 * @return array
 */
function thingamablocks_settings_link( $links ) {
	array_unshift(
		$links,
		sprintf( '<a href="%s">%s</a>', esc_url( admin_url( 'options-general.php?page=thingamablocks' ) ), esc_html__( 'Settings', 'thingamablocks' ) )
	);

	return $links;
}

/**
 * How many posts, pages, templates, synced patterns, GeneratePress Elements
 * and block widgets use each block or feature. One pass over the posts
 * table, cached for a few minutes (and cleared when anything is saved).
 *
 * @return array Key => count.
 */
function thingamablocks_usage_counts() {
	global $wpdb;

	$cached = get_transient( 'thingamablocks_usage_counts' );

	if ( is_array( $cached ) ) {
		return $cached;
	}

	$switches = thingamablocks_switches();
	$sums     = array();
	$likes    = array();

	foreach ( $switches as $switch ) {
		$sums[]  = 'SUM( post_content LIKE %s )';
		$likes[] = '%' . $wpdb->esc_like( $switch['needle'] ) . '%';
	}

	// The SUM( … LIKE %s ) list is built from a fixed string above; every value is a placeholder.
	$row = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- cached in a transient.
		$wpdb->prepare(
			'SELECT ' . implode( ', ', $sums ) . " FROM {$wpdb->posts} WHERE post_status NOT IN ( 'trash', 'auto-draft', 'inherit' )", // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
			$likes
		),
		ARRAY_N
	);

	// Block widgets live in an option, not the posts table.
	$widgets = get_option( 'widget_block', array() );
	$counts  = array();
	$index   = 0;

	foreach ( $switches as $key => $switch ) {
		$counts[ $key ] = (int) ( $row[ $index ] ?? 0 );
		++$index;

		foreach ( is_array( $widgets ) ? $widgets : array() as $widget ) {
			if ( is_array( $widget ) && false !== strpos( (string) ( $widget['content'] ?? '' ), $switch['needle'] ) ) {
				++$counts[ $key ];
			}
		}
	}

	set_transient( 'thingamablocks_usage_counts', $counts, 10 * MINUTE_IN_SECONDS );

	return $counts;
}

add_action( 'save_post', 'thingamablocks_clear_usage_counts' );
add_action( 'update_option_widget_block', 'thingamablocks_clear_usage_counts' );
/**
 * Saving anything may change the counts.
 */
function thingamablocks_clear_usage_counts() {
	delete_transient( 'thingamablocks_usage_counts' );
}

/**
 * The settings page.
 */
function thingamablocks_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$counts = thingamablocks_usage_counts();
	$groups = array(
		'block'   => __( 'Blocks', 'thingamablocks' ),
		'feature' => __( 'Features', 'thingamablocks' ),
	);
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Thingamablocks', 'thingamablocks' ); ?></h1>
		<p><?php esc_html_e( 'Switch off anything you don’t use to keep the editor tidy. Switching something off only hides it: content already using it keeps working on your site and can still be edited.', 'thingamablocks' ); ?></p>

		<form method="post" action="options.php">
			<?php settings_fields( 'thingamablocks' ); ?>

			<?php foreach ( $groups as $type => $heading ) : ?>
				<h2><?php echo esc_html( $heading ); ?></h2>
				<table class="form-table" role="presentation">
					<tbody>
						<?php foreach ( thingamablocks_switches() as $key => $switch ) : ?>
							<?php
							if ( $switch['type'] !== $type ) {
								continue;
							}

							$id = 'thingamablocks-' . $key;
							?>
							<tr>
								<th scope="row"><label for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $switch['label'] ); ?></label></th>
								<td>
									<input type="hidden" name="thingamablocks_settings[<?php echo esc_attr( $key ); ?>]" value="0" />
									<label>
										<input type="checkbox" id="<?php echo esc_attr( $id ); ?>" name="thingamablocks_settings[<?php echo esc_attr( $key ); ?>]" value="1" aria-describedby="<?php echo esc_attr( $id . '-description' ); ?>" <?php checked( thingamablocks_is_enabled( $key ) ); ?> />
										<?php echo 'block' === $type ? esc_html__( 'Show in the block inserter', 'thingamablocks' ) : esc_html__( 'Show the panel in the editor', 'thingamablocks' ); ?>
									</label>
									<p class="description" id="<?php echo esc_attr( $id . '-description' ); ?>">
										<?php echo esc_html( $switch['description'] ); ?>
										<?php
										echo esc_html(
											$counts[ $key ]
												? sprintf(
													/* translators: %s: number of posts, pages, templates etc. */
													_n( 'In use on %s item.', 'In use on %s items.', $counts[ $key ], 'thingamablocks' ),
													number_format_i18n( $counts[ $key ] )
												)
												: __( 'Not used anywhere yet.', 'thingamablocks' )
										);
										?>
									</p>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php endforeach; ?>

			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

add_action( 'enqueue_block_editor_assets', 'thingamablocks_hide_disabled_blocks', 5 );
/**
 * Tell the editor which blocks are switched off, so they leave the inserter
 * (see the blocks.registerBlockType filter this adds).
 */
function thingamablocks_hide_disabled_blocks() {
	$hidden = array();

	foreach ( thingamablocks_switches() as $key => $switch ) {
		if ( 'block' === $switch['type'] && ! thingamablocks_is_enabled( $key ) ) {
			$hidden[] = 'thingamablocks/' . $key;
		}
	}

	if ( empty( $hidden ) ) {
		return;
	}

	// Registered before any of the blocks, so the filter sees every one of them.
	wp_register_script( 'thingamablocks-hidden-blocks', false, array( 'wp-hooks' ), THINGAMABLOCKS_VERSION, false );
	wp_enqueue_script( 'thingamablocks-hidden-blocks' );
	wp_add_inline_script(
		'thingamablocks-hidden-blocks',
		sprintf(
			'(function(hidden){wp.hooks.addFilter("blocks.registerBlockType","thingamablocks/hidden-blocks",function(settings,name){return hidden.indexOf(name)<0?settings:Object.assign({},settings,{supports:Object.assign({},settings.supports,{inserter:false})});});})(%s);',
			wp_json_encode( $hidden )
		)
	);
}
