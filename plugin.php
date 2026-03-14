<?php
/**
 * Plugin Name: AI Client ImageGen
 * Plugin URI: https://github.com/felixarntz/ai-client-imagegen
 * Description: This WordPress plugin is a demo plugin for using the WordPress built-in AI Client launching in WordPress 7.0.
 * Requires at least: 7.0
 * Requires PHP: 7.4
 * Version: 1.0.0-alpha
 * Author: Felix Arntz
 * Author URI: https://felix-arntz.me
 * License: GPL-2.0-or-later
 * License URI: https://spdx.org/licenses/GPL-2.0-or-later.html
 * Text Domain: ai-client-imagegen
 *
 * @package Felix_Arntz\AI_Client_ImageGen
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! function_exists( 'aicig_has_ai_client' ) ) {
	/**
	 * Checks whether the current WordPress version natively provides the AI client.
	 *
	 * @since n.e.x.t
	 * @access private
	 *
	 * @return bool True if WordPress 7.0+ is present with a native AI client.
	 */
	function aicig_has_ai_client() {
		return function_exists( 'wp_get_wp_version' ) && version_compare( wp_get_wp_version(), '7.0-alpha', '>=' );
	}
}

if ( aicig_has_ai_client() ) {
	require_once __DIR__ . '/includes/prompt.php';
	require_once __DIR__ . '/includes/rest-api.php';
	require_once __DIR__ . '/includes/admin.php';

	add_action( 'rest_api_init', 'aicig_register_rest_routes' );
	add_action( 'init', 'aicig_register_assets' );
	add_action( 'admin_enqueue_scripts', 'aicig_enqueue_media_assets' );
} else {
	add_action(
		'admin_notices',
		static function () {
			echo '<div class="notice notice-error"><p>';
			echo esc_html__( 'The AI Client ImageGen plugin requires WordPress 7.0 or higher to work. Please update WordPress.', 'ai-client-imagegen' );
			echo '</p></div>';
		}
	);
}
