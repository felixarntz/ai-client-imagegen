<?php
/**
 * Global functions for the AI Client ImageGen WordPress plugin.
 *
 * @package Felix_Arntz\AI_Client_ImageGen
 */

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
