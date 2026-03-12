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

require_once __DIR__ . '/functions.php';

if ( aicig_has_ai_client() ) {
	// TODO: Add hooks here.
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
