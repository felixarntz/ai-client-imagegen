<?php
/**
 * Admin-facing functionality for the AI Client ImageGen plugin.
 *
 * Handles script registration, enqueuing on the Media Library screen,
 * and displaying an admin notice when image generation is not supported.
 *
 * @package Felix_Arntz\AI_Client_ImageGen
 */

/**
 * Registers the plugin's JavaScript assets.
 *
 * @since n.e.x.t
 *
 * @return void
 */
function aicig_register_assets(): void {
	$asset_file = plugin_dir_path( __DIR__ ) . 'build/index.asset.php';

	$asset = file_exists( $asset_file ) ? require $asset_file : array();
	if ( file_exists( $asset_file ) ) {
		// phpcs:ignore Generic.Commenting.DocComment.MissingShort
		/** @var array{dependencies: list<string>, version: string} $asset */
		$asset = require $asset_file;
	} else {
		$asset = array(
			'dependencies' => array(),
			'version'      => '1.0.0-alpha',
		);
	}

	wp_register_script(
		'aicig-imagegen',
		plugins_url( 'build/index.js', __DIR__ ),
		$asset['dependencies'],
		$asset['version'],
		array( 'strategy' => 'defer' )
	);
}

/**
 * Enqueues the plugin's script on the Media Library screen if image generation is supported.
 *
 * @since n.e.x.t
 *
 * @param string $hook_suffix The current admin page hook suffix.
 * @return void
 */
function aicig_enqueue_media_assets( string $hook_suffix ): void {
	if ( 'upload.php' !== $hook_suffix ) {
		return;
	}

	if ( ! current_user_can( 'upload_files' ) ) {
		return;
	}

	if ( ! aicig_get_image_generation_prompt( 'test' )->is_supported_for_image_generation() ) {
		add_action( 'admin_notices', 'aicig_show_unsupported_notice' );
		return;
	}

	wp_enqueue_script( 'aicig-imagegen' );
}

/**
 * Displays an admin notice when image generation is not supported.
 *
 * @since n.e.x.t
 *
 * @return void
 */
function aicig_show_unsupported_notice(): void {
	echo '<div class="notice notice-info"><p>';
	printf(
		/* translators: %s: URL to the Settings > Connectors admin page */
		esc_html__( 'To use AI image generation, configure an AI provider with image generation support under %s.', 'ai-client-imagegen' ),
		'<a href="' . esc_url( admin_url( 'options-general.php?page=connectors' ) ) . '">' . esc_html__( 'Settings > Connectors', 'ai-client-imagegen' ) . '</a>'
	);
	echo '</p></div>';
}
