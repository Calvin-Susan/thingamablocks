<?php
/**
 * Settings → Thingamablocks: switch blocks and features on and off.
 *
 * "Off" keeps the workspace tidy without breaking anything: a switched-off
 * block stays registered (so content already using it still works and can
 * still be edited) but leaves the block inserter. A switched-off feature's
 * panel (Entrance animation, Mask) no longer loads in the editor; content
 * already using it is untouched.
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
		'search'      => array(
			'label'       => __( 'Search', 'thingamablocks' ),
			'description' => __( 'A search form styled with GenerateBlocks that can search only the content types you choose.', 'thingamablocks' ),
			'type'        => 'block',
			'needle'      => '<!-- wp:thingamablocks/search ',
		),
		'toc'         => array(
			'label'       => __( 'Table of Contents', 'thingamablocks' ),
			'description' => __( 'A list of the post’s headings that marks the section being read, with optional copy-link buttons on headings. While on, headings in single posts and pages get an ID if they have none.', 'thingamablocks' ),
			'type'        => 'block',
			'needle'      => '<!-- wp:thingamablocks/toc ',
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
		'video'       => array(
			'label'       => __( 'Video backgrounds', 'thingamablocks' ),
			'description' => __( 'The “Video background” panel on the GenerateBlocks Element block: a Bunny or Vimeo video behind a section.', 'thingamablocks' ),
			'type'        => 'feature',
			'needle'      => '"data-tmb-video":',
		),
		'faq'         => array(
			'label'       => __( 'FAQ schema', 'thingamablocks' ),
			'description' => __( 'The “FAQ schema” panel on the GenerateBlocks Pro Accordion block.', 'thingamablocks' ),
			'type'        => 'feature',
			'needle'      => '"data-tmb-faq":"true"',
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

add_action( 'admin_enqueue_scripts', 'thingamablocks_settings_style' );
/**
 * Switches and cards for the settings page, only on that page.
 *
 * @param string $hook_suffix Admin page.
 */
function thingamablocks_settings_style( $hook_suffix ) {
	if ( 'settings_page_thingamablocks' !== $hook_suffix ) {
		return;
	}

	// A checkbox styled as a switch (role="switch": announced as on/off).
	// The "off" track is dark enough to see against white (3:1).
	$css = '.tmb-settings__intro{max-width:760px}'
		. '.tmb-settings__card{box-sizing:border-box;max-width:760px;margin:20px 0;padding:8px 24px;border:1px solid #dcdcde;border-radius:8px;background:#fff}'
		. '.tmb-settings__card h2{margin:16px 0 4px;font-size:1.3em}'
		. '.tmb-settings__row{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px 0;border-top:1px solid #f0f0f1}'
		. '.tmb-settings__card h2+.tmb-settings__row{border-top:0}'
		. '.tmb-settings__label{font-size:14px;font-weight:600;color:#1d2327}'
		. '.tmb-settings .tmb-settings__text .description{margin:4px 0 0}'
		. '.tmb-settings__usage{display:block;margin-top:2px;color:#50575e}'
		. '.tmb-settings__row--field{flex-wrap:wrap;align-items:flex-start}'
		. '.tmb-settings__row--field textarea{width:100%;max-width:none}'
		. '.tmb-settings .tmb-settings__card-intro{margin:0 0 4px}'
		. '.tmb-settings__row--speeds{flex-wrap:wrap;align-items:flex-start}'
		. '.tmb-settings__row--speeds .tmb-settings__text{flex:1 1 280px}'
		. '.tmb-settings__row--speeds .tmb-settings__label{margin:0}'
		. '.tmb-speeds{display:flex;flex-wrap:wrap;gap:12px}'
		. '.tmb-speeds__field{display:flex;flex-direction:column;gap:4px;font-weight:600}'
		. '.tmb-speeds__input{display:flex;align-items:center;gap:6px;font-weight:400;color:#50575e}'
		. '.tmb-speeds__input input{width:6em}'
		. '.tmb-settings input.tmb-switch{appearance:none;-webkit-appearance:none;position:relative;flex:none;box-sizing:border-box;width:48px;height:28px;margin:0;padding:0;border:0;border-radius:999px;background:#8c8f94;cursor:pointer;transition:background-color .15s ease;box-shadow:none}'
		. '.tmb-settings input.tmb-switch::before,.tmb-settings input.tmb-switch:checked::before{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;margin:0;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3);transition:transform .15s ease}'
		. '.tmb-settings input.tmb-switch:checked{background:var(--wp-admin-theme-color,#2271b1)}'
		. '.tmb-settings input.tmb-switch:checked::before{transform:translateX(20px)}'
		. '.tmb-settings input.tmb-switch:focus{outline:2px solid transparent;box-shadow:none}'
		. '.tmb-settings input.tmb-switch:focus-visible{box-shadow:0 0 0 2px #fff,0 0 0 4px var(--wp-admin-theme-color,#2271b1)}'
		. '.rtl .tmb-settings input.tmb-switch::before{left:auto;right:3px}'
		. '.rtl .tmb-settings input.tmb-switch:checked::before{transform:translateX(-20px)}'
		. '@media (prefers-reduced-motion:reduce){.tmb-settings input.tmb-switch,.tmb-settings input.tmb-switch::before{transition:none}}'
		// Windows High Contrast replaces background colours: draw it with system colours.
		. '@media (forced-colors:active){'
		. '.tmb-settings input.tmb-switch{forced-color-adjust:none;background:Canvas;border:2px solid ButtonText}'
		. '.tmb-settings input.tmb-switch::before,.tmb-settings input.tmb-switch:checked::before{top:1px;left:1px;background:ButtonText;box-shadow:none}'
		. '.rtl .tmb-settings input.tmb-switch::before,.rtl .tmb-settings input.tmb-switch:checked::before{left:auto;right:1px}'
		. '.tmb-settings input.tmb-switch:checked{background:Highlight;border-color:Highlight}'
		. '.tmb-settings input.tmb-switch:checked::before{background:HighlightText}'
		. '.tmb-settings input.tmb-switch:focus-visible{outline:2px solid Highlight;outline-offset:2px}'
		. '}';

	wp_register_style( 'thingamablocks-settings', false, array(), THINGAMABLOCKS_VERSION );
	wp_enqueue_style( 'thingamablocks-settings' );
	wp_add_inline_style( 'thingamablocks-settings', $css );
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
	$likes    = array();

	foreach ( $switches as $switch ) {
		$likes[] = '%' . $wpdb->esc_like( $switch['needle'] ) . '%';
	}

	// One SUM( … LIKE %s ) per switch: a fixed string, every value a placeholder.
	$row = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- cached in a transient.
		$wpdb->prepare(
			'SELECT ' . implode( ', ', array_fill( 0, count( $likes ), 'SUM( post_content LIKE %s )' ) ) . " FROM {$wpdb->posts} WHERE post_status NOT IN ( 'trash', 'auto-draft', 'inherit' )", // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, PluginCheck.Security.DirectDB.UnescapedDBParameter -- fixed placeholders only.
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
	<div class="wrap tmb-settings">
		<h1><?php esc_html_e( 'Thingamablocks', 'thingamablocks' ); ?></h1>
		<p class="tmb-settings__intro"><?php esc_html_e( 'Switch off anything you don’t use to keep the editor tidy. Switching something off only hides it: content already using it keeps working on your site and can still be edited. (WordPress may not let you duplicate or paste a switched-off block, though: switch it back on for that.)', 'thingamablocks' ); ?></p>

		<form method="post" action="options.php">
			<?php settings_fields( 'thingamablocks' ); ?>

			<?php foreach ( $groups as $type => $heading ) : ?>
				<div class="tmb-settings__card">
					<h2><?php echo esc_html( $heading ); ?></h2>
					<?php foreach ( thingamablocks_switches() as $key => $switch ) : ?>
						<?php
						if ( $switch['type'] !== $type ) {
							continue;
						}

						$id = 'thingamablocks-' . $key;
						?>
						<div class="tmb-settings__row">
							<div class="tmb-settings__text">
								<label class="tmb-settings__label" for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $switch['label'] ); ?></label>
								<p class="description" id="<?php echo esc_attr( $id . '-description' ); ?>">
									<?php echo esc_html( $switch['description'] ); ?>
									<span class="tmb-settings__usage">
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
									</span>
								</p>
							</div>
							<input type="hidden" name="thingamablocks_settings[<?php echo esc_attr( $key ); ?>]" value="0" />
							<input type="checkbox" role="switch" class="tmb-switch" id="<?php echo esc_attr( $id ); ?>" name="thingamablocks_settings[<?php echo esc_attr( $key ); ?>]" value="1" aria-describedby="<?php echo esc_attr( $id . '-description' ); ?>" <?php checked( thingamablocks_is_enabled( $key ) ); ?> />
						</div>
					<?php endforeach; ?>
				</div>
			<?php endforeach; ?>

			<?php thingamablocks_render_speeds_card(); ?>

			<div class="tmb-settings__card">
				<h2><?php esc_html_e( 'Video backgrounds', 'thingamablocks' ); ?></h2>
				<div class="tmb-settings__row tmb-settings__row--field">
					<div class="tmb-settings__text">
						<label class="tmb-settings__label" for="thingamablocks-video-hosts"><?php esc_html_e( 'Your own Bunny hostnames', 'thingamablocks' ); ?></label>
						<p class="description" id="thingamablocks-video-hosts-description"><?php esc_html_e( 'Bunny’s own addresses (*.b-cdn.net) and Vimeo always work. If a Bunny pull zone uses your own hostname (like video.example.com), add it here, one per line. Only videos from these places can be used, so nobody editing a page can point a background at anything else.', 'thingamablocks' ); ?></p>
					</div>
					<textarea id="thingamablocks-video-hosts" name="<?php echo esc_attr( Thingamablocks_Video_Background::OPTION ); ?>" rows="3" class="regular-text code" aria-describedby="thingamablocks-video-hosts-description"><?php echo esc_textarea( implode( "\n", Thingamablocks_Video_Background::hosts() ) ); ?></textarea>
				</div>
			</div>

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
