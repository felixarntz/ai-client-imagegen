<?php
/**
 * REST API endpoint registration and callbacks for the AI Client ImageGen plugin.
 *
 * @package Felix_Arntz\AI_Client_ImageGen
 */

use WordPress\AiClient\Common\Exception\InvalidArgumentException;
use WordPress\AiClient\Common\Exception\TokenLimitReachedException;
use WordPress\AiClient\Files\DTO\File;
use WordPress\AiClient\Providers\Http\Exception\ClientException;
use WordPress\AiClient\Providers\Http\Exception\NetworkException;
use WordPress\AiClient\Providers\Http\Exception\ServerException;

/**
 * Registers REST API routes for image generation and uploading.
 *
 * @since n.e.x.t
 *
 * @return void
 */
function aicig_register_rest_routes(): void {
	register_rest_route(
		'ai-client-imagegen/v1',
		'/generate-image',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'aicig_rest_generate_image',
			'permission_callback' => static function () {
				return current_user_can( 'upload_files' );
			},
			'args'                => array(
				'prompt'        => array(
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => static function ( $value ) {
						return is_string( $value ) && '' !== trim( $value );
					},
				),
				'image_base64'  => array(
					'type'              => 'string',
					'required'          => false,
					'sanitize_callback' => 'sanitize_text_field',
				),
				'attachment_id' => array(
					'type'              => 'integer',
					'required'          => false,
					'sanitize_callback' => 'absint',
				),
				'orientation'   => array(
					'type'              => 'string',
					'required'          => false,
					'enum'              => array( 'square', 'landscape', 'portrait' ),
					'sanitize_callback' => 'sanitize_text_field',
				),
			),
		)
	);

	register_rest_route(
		'ai-client-imagegen/v1',
		'/upload-image',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'aicig_rest_upload_image',
			'permission_callback' => static function () {
				return current_user_can( 'upload_files' );
			},
			'args'                => array(
				'image_base64' => array(
					'type'     => 'string',
					'required' => true,
				),
				'file_name'    => array(
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'sanitize_file_name',
				),
				'mime_type'    => array(
					'type'              => 'string',
					'required'          => false,
					'default'           => 'image/png',
					'sanitize_callback' => 'sanitize_mime_type',
				),
			),
		)
	);
}

/**
 * Handles the generate-image REST API request.
 *
 * Routes to the appropriate prompt builder based on whether an input image is provided
 * (edit flow) or only a text prompt is provided (generation flow).
 *
 * @since n.e.x.t
 *
 * @param WP_REST_Request $request The REST request object.
 * @return WP_REST_Response|WP_Error Response with base64 image data, or error on failure.
 */
function aicig_rest_generate_image( WP_REST_Request $request ) {
	// phpcs:disable Generic.Commenting.DocComment.MissingShort
	/** @var string $prompt */
	$prompt = $request->get_param( 'prompt' );
	/** @var string|null $image_base64 */
	$image_base64 = $request->get_param( 'image_base64' );
	/** @var int|null $attachment_id */
	$attachment_id = $request->get_param( 'attachment_id' );
	/** @var string|null $orientation */
	$orientation = $request->get_param( 'orientation' );
	// phpcs:enable Generic.Commenting.DocComment.MissingShort

	$image_file = null;
	if ( $attachment_id ) {
		$file_path = get_attached_file( $attachment_id );
		if ( ! $file_path || ! file_exists( $file_path ) ) {
			return new WP_Error(
				'invalid_attachment',
				__( 'The specified attachment does not exist or its file is missing.', 'ai-client-imagegen' ),
				array( 'status' => 400 )
			);
		}
		$base64_data = base64_encode( (string) file_get_contents( $file_path ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode,WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$image_file  = new File( $base64_data, (string) get_post_mime_type( $attachment_id ) );
	} elseif ( $image_base64 ) {
		$image_file = new File( $image_base64, 'image/png' ); // Not ideal, but PNG is a fair assumption based on how most AI providers generate images.
	}

	if ( $image_file ) {
		$builder = aicig_get_image_editing_prompt( $prompt, $image_file, $orientation ?? '' );
	} else {
		$builder = aicig_get_image_generation_prompt( $prompt, $orientation ?? '' );
	}

	return rest_ensure_response(
		$builder->generate_image_result()
	);
}

/**
 * Handles the upload-image REST API request.
 *
 * Decodes a base64-encoded image and creates a WordPress media library attachment.
 *
 * @since n.e.x.t
 *
 * @param WP_REST_Request $request The REST request object.
 * @return WP_REST_Response|WP_Error Response with attachment data, or error on failure.
 */
function aicig_rest_upload_image( WP_REST_Request $request ) {
	// phpcs:disable Generic.Commenting.DocComment.MissingShort
	/** @var string $image_base64 */
	$image_base64 = $request->get_param( 'image_base64' );
	/** @var string $file_name */
	$file_name = $request->get_param( 'file_name' );
	/** @var string $mime_type */
	$mime_type = $request->get_param( 'mime_type' );
	// phpcs:enable Generic.Commenting.DocComment.MissingShort

	$decoded = base64_decode( $image_base64, true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
	if ( false === $decoded ) {
		return new WP_Error(
			'invalid_image_data',
			__( 'The provided image data is not valid base64.', 'ai-client-imagegen' ),
			array( 'status' => 400 )
		);
	}

	$upload = wp_upload_bits( $file_name, null, $decoded );
	if ( ! empty( $upload['error'] ) ) {
		return new WP_Error(
			'upload_failed',
			$upload['error'],
			array( 'status' => 500 )
		);
	}

	$attachment_data = array(
		'post_mime_type' => $mime_type,
		'post_title'     => sanitize_file_name( pathinfo( $file_name, PATHINFO_FILENAME ) ),
		'post_status'    => 'inherit',
	);

	$attachment_id = wp_insert_attachment( $attachment_data, $upload['file'] );
	if ( is_wp_error( $attachment_id ) ) {
		return $attachment_id;
	}

	require_once ABSPATH . 'wp-admin/includes/image.php';

	$metadata = wp_generate_attachment_metadata( $attachment_id, $upload['file'] );
	wp_update_attachment_metadata( $attachment_id, $metadata );

	return rest_ensure_response(
		array(
			'id'  => $attachment_id,
			'url' => wp_get_attachment_url( $attachment_id ),
		)
	);
}
