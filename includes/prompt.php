<?php
/**
 * Prompt builder functions for the AI Client ImageGen plugin.
 *
 * @package Felix_Arntz\AI_Client_ImageGen
 */

use WordPress\AiClient\Files\DTO\File;
use WordPress\AiClient\Files\Enums\FileTypeEnum;
use WordPress\AiClient\Files\Enums\MediaOrientationEnum;

/**
 * Returns a prompt builder configured for generating a new image from a text prompt.
 *
 * @since n.e.x.t
 *
 * @param string $prompt      The text prompt describing the image to generate.
 * @param string $orientation Optional. The output orientation: 'square', 'landscape', or 'portrait'. Default empty string.
 * @return WP_AI_Client_Prompt_Builder The configured prompt builder instance.
 */
function aicig_get_image_generation_prompt( string $prompt, string $orientation = '' ): WP_AI_Client_Prompt_Builder {
	$builder = wp_ai_client_prompt()
		->with_text( $prompt )
		->as_output_file_type( FileTypeEnum::inline() );

	if ( $orientation ) {
		$builder->as_output_media_orientation( MediaOrientationEnum::from( $orientation ) );
	}

	return $builder;
}

/**
 * Returns a prompt builder configured for editing an existing image based on a text prompt.
 *
 * @since n.e.x.t
 *
 * @param string $prompt      The text prompt describing the desired edit.
 * @param File   $image_file  The image file to edit.
 * @param string $orientation Optional. The output orientation: 'square', 'landscape', or 'portrait'. Default empty string.
 * @return WP_AI_Client_Prompt_Builder The configured prompt builder instance.
 */
function aicig_get_image_editing_prompt( string $prompt, File $image_file, string $orientation = '' ): WP_AI_Client_Prompt_Builder {
	$builder = wp_ai_client_prompt()
		->with_text( $prompt )
		->with_file( $image_file )
		->as_output_file_type( FileTypeEnum::inline() );

	if ( $orientation ) {
		$builder->as_output_media_orientation( MediaOrientationEnum::from( $orientation ) );
	}

	return $builder;
}
