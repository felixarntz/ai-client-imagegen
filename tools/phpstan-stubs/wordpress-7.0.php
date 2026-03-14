<?php
/**
 * PHPStan stubs for WordPress 7.0 AI Client classes and functions.
 *
 * @package Felix_Arntz\AI_Client_ImageGen
 */

namespace WordPress\AiClient\Common\Contracts {

	interface AiClientExceptionInterface extends \Throwable {
	}
}

namespace WordPress\AiClient\Common {

	abstract class AbstractEnum implements \JsonSerializable {

		/** @var string */
		public $value;

		/** @var string */
		public $name;

		/**
		 * @return static
		 * @throws \WordPress\AiClient\Common\Exception\InvalidArgumentException
		 */
		final public static function from( string $value ): self {
		}

		/**
		 * @return static|null
		 */
		final public static function tryFrom( string $value ): ?self {
		}

		/**
		 * @return static[]
		 */
		final public static function cases(): array {
		}

		/**
		 * @return bool
		 */
		final public function equals( string $value ): bool {
		}

		/**
		 * @return bool
		 */
		final public function is( self $other ): bool {
		}

		/**
		 * @return string
		 */
		public function jsonSerialize(): string {
		}
	}

	/**
	 * @template TArrayShape of array<string, mixed>
	 */
	abstract class AbstractDataTransferObject implements \JsonSerializable {
	}
}

namespace WordPress\AiClient\Common\Exception {

	class RuntimeException extends \RuntimeException implements \WordPress\AiClient\Common\Contracts\AiClientExceptionInterface {
	}

	class InvalidArgumentException extends \InvalidArgumentException implements \WordPress\AiClient\Common\Contracts\AiClientExceptionInterface {
	}

	class TokenLimitReachedException extends RuntimeException {

		/**
		 * @param string          $message   The exception message.
		 * @param int|null        $maxTokens The token limit that was reached.
		 * @param \Throwable|null $previous  The previous throwable.
		 */
		public function __construct( string $message = '', ?int $maxTokens = null, ?\Throwable $previous = null ) {
		}

		/**
		 * @return int|null
		 */
		public function getMaxTokens(): ?int {
		}
	}
}

namespace WordPress\AiClient\Files\Enums {

	/**
	 * @method static self inline()
	 * @method static self remote()
	 * @method bool isInline()
	 * @method bool isRemote()
	 */
	class FileTypeEnum extends \WordPress\AiClient\Common\AbstractEnum {

		/** @var string */
		public const INLINE = 'inline';

		/** @var string */
		public const REMOTE = 'remote';
	}

	/**
	 * @method static self square()
	 * @method static self landscape()
	 * @method static self portrait()
	 * @method bool isSquare()
	 * @method bool isLandscape()
	 * @method bool isPortrait()
	 */
	class MediaOrientationEnum extends \WordPress\AiClient\Common\AbstractEnum {

		/** @var string */
		public const SQUARE = 'square';

		/** @var string */
		public const LANDSCAPE = 'landscape';

		/** @var string */
		public const PORTRAIT = 'portrait';
	}
}

namespace WordPress\AiClient\Files\DTO {

	/**
	 * @extends \WordPress\AiClient\Common\AbstractDataTransferObject<array<string, mixed>>
	 */
	class File extends \WordPress\AiClient\Common\AbstractDataTransferObject {

		/**
		 * @param string      $file     The file string (URL, base64 data, or local path).
		 * @param string|null $mimeType The MIME type of the file.
		 * @throws \WordPress\AiClient\Common\Exception\InvalidArgumentException
		 */
		public function __construct( string $file, ?string $mimeType = null ) {
		}

		/**
		 * @return string|null
		 */
		public function getBase64Data(): ?string {
		}

		/**
		 * @return string
		 */
		public function getMimeType(): string {
		}
	}
}

namespace WordPress\AiClient\Providers\Http\Exception {

	class NetworkException extends \WordPress\AiClient\Common\Exception\RuntimeException {
	}

	class ServerException extends \WordPress\AiClient\Common\Exception\RuntimeException {
	}

	class ClientException extends \WordPress\AiClient\Common\Exception\InvalidArgumentException {
	}
}

namespace {
	/**
	 * WordPress 7.0 AI Client prompt builder wrapper class.
	 *
	 * Provides a WordPress-style (snake_case) fluent API around the
	 * underlying PromptBuilder from the php-ai-client package.
	 */
	class WP_AI_Client_Prompt_Builder {

		/**
		 * @param string $text The text to add.
		 * @return $this
		 */
		public function with_text( string $text ): self {
		}

		/**
		 * @param string|\WordPress\AiClient\Files\DTO\File $file     The file.
		 * @param string|null                                $mimeType The MIME type.
		 * @return $this
		 */
		public function with_file( $file, ?string $mimeType = null ): self {
		}

		/**
		 * @param \WordPress\AiClient\Files\Enums\FileTypeEnum $fileType The file type.
		 * @return $this
		 */
		public function as_output_file_type( \WordPress\AiClient\Files\Enums\FileTypeEnum $fileType ): self {
		}

		/**
		 * @param \WordPress\AiClient\Files\Enums\MediaOrientationEnum $orientation The orientation.
		 * @return $this
		 */
		public function as_output_media_orientation( \WordPress\AiClient\Files\Enums\MediaOrientationEnum $orientation ): self {
		}

		/**
		 * @return bool
		 */
		public function is_supported_for_image_generation(): bool {
		}

		/**
		 * @return \WordPress\AiClient\Files\DTO\File
		 * @throws \WordPress\AiClient\Common\Exception\TokenLimitReachedException
		 * @throws \WordPress\AiClient\Providers\Http\Exception\NetworkException
		 * @throws \WordPress\AiClient\Providers\Http\Exception\ServerException
		 * @throws \WordPress\AiClient\Providers\Http\Exception\ClientException
		 * @throws \WordPress\AiClient\Common\Exception\InvalidArgumentException
		 * @throws \Exception
		 */
		public function generate_image(): \WordPress\AiClient\Files\DTO\File {
		}
	}

	/**
	 * Returns a new WP_AI_Client_Prompt_Builder instance.
	 *
	 * @return WP_AI_Client_Prompt_Builder
	 */
	function wp_ai_client_prompt(): WP_AI_Client_Prompt_Builder {
	}
}
