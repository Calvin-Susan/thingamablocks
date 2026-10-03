<?php
/**
 * What "Fast", "Normal" and "Slow" mean, site-wide.
 *
 * Blocks keep a simple speed choice; Settings → Thingamablocks can change the
 * milliseconds behind each one, for dropdowns opening and for entrance
 * animations. Only changed values are stored, and they're only printed (a
 * line of inline script) on pages that load the dropdown, animation or table
 * of contents script (its collapsing list opens at the dropdown speed),
 * and in the editor for its previews.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const THINGAMABLOCKS_SPEEDS_OPTION = 'thingamablocks_speeds';

/**
 * The scales and their defaults, matching src/dropdown/reveal.js and
 * src/animations/presets.js.
 *
 * @return array Scale => [ label, description, speeds => ms ].
 */
function thingamablocks_speed_scales() {
	return array(
		'dropdown'   => array(
			'label'       => __( 'Dropdown speed', 'thingamablocks' ),
			'description' => __( 'How long a dropdown’s drawer takes to open and close. Keep it quick: it’s something people wait for.', 'thingamablocks' ),
			'defaults'    => array(
				'fast'   => 150,
				'normal' => 250,
				'slow'   => 400,
			),
		),
		'animations' => array(
			'label'       => __( 'Entrance animation speed', 'thingamablocks' ),
			'description' => __( 'How long a block takes to animate in as it scrolls into view.', 'thingamablocks' ),
			'defaults'    => array(
				'fast'   => 400,
				'normal' => 700,
				'slow'   => 1100,
			),
		),
	);
}

/**
 * Speed names, for labels.
 *
 * @return array
 */
function thingamablocks_speed_names() {
	return array(
		'fast'   => __( 'Fast', 'thingamablocks' ),
		'normal' => __( 'Normal', 'thingamablocks' ),
		'slow'   => __( 'Slow', 'thingamablocks' ),
	);
}

/**
 * The site's changed values only (empty when everything is the default).
 *
 * @return array Scale => speed => ms.
 */
function thingamablocks_custom_speeds() {
	return thingamablocks_sanitize_speeds( get_option( THINGAMABLOCKS_SPEEDS_OPTION, array() ) );
}

add_action( 'admin_init', 'thingamablocks_register_speeds_setting' );
/**
 * Register the setting, cleaned on save.
 */
function thingamablocks_register_speeds_setting() {
	register_setting(
		'thingamablocks',
		THINGAMABLOCKS_SPEEDS_OPTION,
		array(
			'type'              => 'array',
			'sanitize_callback' => 'thingamablocks_sanitize_speeds',
			'default'           => array(),
		)
	);
}

/**
 * Keep whole milliseconds from 0 to 3000 that differ from the default. An
 * empty field means the default.
 *
 * @param mixed $input Submitted or stored value.
 * @return array Scale => speed => ms.
 */
function thingamablocks_sanitize_speeds( $input ) {
	$input = is_array( $input ) ? $input : array();
	$clean = array();

	foreach ( thingamablocks_speed_scales() as $scale => $settings ) {
		foreach ( $settings['defaults'] as $speed => $default ) {
			$value = $input[ $scale ][ $speed ] ?? '';

			if ( ! is_numeric( $value ) ) {
				continue;
			}

			$value = (int) round( min( 3000, max( 0, (float) $value ) ) );

			if ( $value !== $default ) {
				$clean[ $scale ][ $speed ] = $value;
			}
		}
	}

	return $clean;
}

/**
 * The inline script that hands changed speeds to the front end and editor.
 *
 * @return string Script, or '' when nothing is changed.
 */
function thingamablocks_speeds_script() {
	$speeds = thingamablocks_custom_speeds();

	return $speeds ? 'window.tmbSpeeds=' . wp_json_encode( $speeds ) . ';' : '';
}

add_action( 'wp_enqueue_scripts', 'thingamablocks_add_speeds_script' );
add_action( 'enqueue_block_editor_assets', 'thingamablocks_add_speeds_script', 20 );
/**
 * Attach the speeds to the scripts that use them. The scripts are registered
 * by now and only print on pages that enqueue them, so pages without a
 * dropdown, animation or table of contents get nothing.
 */
function thingamablocks_add_speeds_script() {
	$script = thingamablocks_speeds_script();

	if ( ! $script ) {
		return;
	}

	$handles = is_admin()
		? array( 'thingamablocks-dropdown-editor-script', 'thingamablocks-animations-editor' )
		: array( 'thingamablocks-dropdown-view-script', 'thingamablocks-animations', 'thingamablocks-toc-view-script' );

	foreach ( $handles as $handle ) {
		if ( wp_script_is( $handle, 'registered' ) ) {
			wp_add_inline_script( $handle, $script, 'before' );
		}
	}
}

/**
 * The settings page card.
 */
function thingamablocks_render_speeds_card() {
	$custom = thingamablocks_custom_speeds();
	$names  = thingamablocks_speed_names();
	?>
	<div class="tmb-settings__card">
		<h2><?php esc_html_e( 'Speeds', 'thingamablocks' ); ?></h2>
		<p class="description tmb-settings__card-intro"><?php esc_html_e( 'Blocks offer Fast, Normal and Slow. Set what each means, in milliseconds, for the whole site. Leave a field empty for the default shown. Visitors who prefer reduced motion get no movement either way.', 'thingamablocks' ); ?></p>
		<?php foreach ( thingamablocks_speed_scales() as $scale => $settings ) : ?>
			<?php $group = 'thingamablocks-speeds-' . $scale; ?>
			<div class="tmb-settings__row tmb-settings__row--speeds" role="group" aria-labelledby="<?php echo esc_attr( $group . '-label' ); ?>">
				<div class="tmb-settings__text">
					<p class="tmb-settings__label" id="<?php echo esc_attr( $group . '-label' ); ?>"><?php echo esc_html( $settings['label'] ); ?></p>
					<p class="description" id="<?php echo esc_attr( $group . '-description' ); ?>"><?php echo esc_html( $settings['description'] ); ?></p>
				</div>
				<div class="tmb-speeds">
					<?php foreach ( $settings['defaults'] as $speed => $default ) : ?>
						<?php $id = 'thingamablocks-speeds-' . $scale . '-' . $speed; ?>
						<label class="tmb-speeds__field" for="<?php echo esc_attr( $id ); ?>">
							<span>
								<?php echo esc_html( $names[ $speed ] ); ?>
								<span class="screen-reader-text"><?php esc_html_e( '(milliseconds)', 'thingamablocks' ); ?></span>
							</span>
							<span class="tmb-speeds__input">
								<input type="number" id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( THINGAMABLOCKS_SPEEDS_OPTION . '[' . $scale . '][' . $speed . ']' ); ?>" min="0" max="3000" step="10" inputmode="numeric" placeholder="<?php echo esc_attr( (string) $default ); ?>" value="<?php echo esc_attr( isset( $custom[ $scale ][ $speed ] ) ? (string) $custom[ $scale ][ $speed ] : '' ); ?>" aria-describedby="<?php echo esc_attr( $group . '-description' ); ?>" />
								<span aria-hidden="true"><?php esc_html_e( 'ms', 'thingamablocks' ); ?></span>
							</span>
						</label>
					<?php endforeach; ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
	<?php
}
