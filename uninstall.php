<?php
/**
 * Clean up when the plugin is deleted (not just deactivated).
 *
 * Content made with the blocks stays in posts as it was saved. Only the
 * plugin's own options are removed.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// The site-wide dark mode setting, and options from earlier development builds.
delete_option( 'thingamablocks_color_scheme' );
delete_option( 'thingamablocks_settings' );
delete_option( 'thingamablocks_video_hosts' );
delete_transient( 'thingamablocks_usage_counts' );
delete_option( 'thingamablocks_animations_used' );
delete_option( 'ogal_toggle_color_scheme' );
