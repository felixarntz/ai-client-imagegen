import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

interface GenerateImageResponse {
	candidates: Array< {
		message: {
			parts: Array< {
				file?: {
					base64Data: string;
					mimeType: string;
				};
			} >;
		};
	} >;
}

interface UploadImageResponse {
	id: number;
	url: string;
}

/**
 * Extracts a human-readable error message from an unknown error value.
 *
 * @since n.e.x.t
 *
 * @param error    - The caught error value.
 * @param fallback - Fallback message if none can be extracted.
 * @return The error message string.
 */
function getErrorMessage( error: unknown, fallback: string ): string {
	if (
		error instanceof Error ||
		( typeof error === 'object' &&
			error !== null &&
			'message' in error &&
			typeof error.message === 'string' )
	) {
		return ( error as { message: string } ).message;
	}
	return fallback;
}

/**
 * Shows the notice element with the given message and type.
 *
 * @since n.e.x.t
 *
 * @param params         - Display parameters.
 * @param params.notice  - The notice div element.
 * @param params.message - The message to display.
 * @param params.type    - The notice type.
 */
function showNotice( {
	notice,
	message,
	type,
}: {
	notice: HTMLDivElement;
	message: string;
	type: 'error' | 'success';
} ): void {
	notice.className = `notice inline notice-${ type }`;
	notice.textContent = message;
	notice.style.display = 'block';
	notice.style.margin = '0';
}

/**
 * Hides the notice element.
 *
 * @since n.e.x.t
 *
 * @param notice - The notice div element.
 */
function hideNotice( notice: HTMLDivElement ): void {
	notice.style.display = 'none';
	notice.textContent = '';
}

/**
 * Creates the image generation modal dialog element.
 *
 * @since n.e.x.t
 *
 * @return The dialog element and references to key child elements.
 */
function createModal(): {
	dialog: HTMLDialogElement;
	promptInput: HTMLInputElement;
	submitButton: HTMLButtonElement;
	notice: HTMLDivElement;
	preview: HTMLImageElement;
	saveButton: HTMLButtonElement;
} {
	const dialog = document.createElement( 'dialog' );
	dialog.style.maxWidth = '640px';
	dialog.style.width = '90vw';
	dialog.style.padding = '20px';
	dialog.style.borderRadius = '4px';
	dialog.style.border = '1px solid #c3c4c7';
	dialog.setAttribute( 'aria-labelledby', 'aicig-dialog-title' );

	const inner = document.createElement( 'div' );
	inner.style.display = 'flex';
	inner.style.flexDirection = 'column';
	inner.style.gap = '16px';

	const header = document.createElement( 'div' );
	header.style.display = 'flex';
	header.style.justifyContent = 'space-between';
	header.style.alignItems = 'center';

	const title = document.createElement( 'h2' );
	title.id = 'aicig-dialog-title';
	title.style.margin = '0';
	title.textContent = __( 'Generate Image', 'ai-client-imagegen' );

	const closeButton = document.createElement( 'button' );
	closeButton.type = 'button';
	closeButton.className = 'media-modal-close';
	closeButton.style.border = '0';

	const closeIcon = document.createElement( 'span' );
	closeIcon.className = 'media-modal-icon';
	closeIcon.setAttribute( 'aria-hidden', 'true' );

	const closeLabel = document.createElement( 'span' );
	closeLabel.className = 'screen-reader-text';
	closeLabel.textContent = __( 'Close dialog', 'ai-client-imagegen' );

	closeButton.appendChild( closeIcon );
	closeButton.appendChild( closeLabel );

	header.appendChild( title );
	header.appendChild( closeButton );

	const form = document.createElement( 'form' );

	const label = document.createElement( 'label' );
	label.style.display = 'block';
	label.style.marginBottom = '8px';
	label.style.fontWeight = '600';
	label.textContent = __( 'Prompt', 'ai-client-imagegen' );

	const inputRow = document.createElement( 'div' );
	inputRow.style.display = 'flex';
	inputRow.style.gap = '8px';

	const promptInput = document.createElement( 'input' );
	promptInput.type = 'text';
	promptInput.className = 'regular-text';
	promptInput.style.flex = '1';
	promptInput.setAttribute( 'autofocus', '' );
	promptInput.placeholder = __(
		'Describe the image you want to generate…',
		'ai-client-imagegen'
	);

	label.setAttribute( 'for', 'aicig-prompt-input' );
	promptInput.id = 'aicig-prompt-input';

	const submitButton = document.createElement( 'button' );
	submitButton.type = 'submit';
	submitButton.className = 'button button-primary';
	submitButton.textContent = __( 'Generate Image', 'ai-client-imagegen' );
	submitButton.disabled = true;

	promptInput.addEventListener( 'input', () => {
		submitButton.disabled = promptInput.value.trim().length === 0;
	} );

	inputRow.appendChild( promptInput );
	inputRow.appendChild( submitButton );

	form.appendChild( label );
	form.appendChild( inputRow );

	const notice = document.createElement( 'div' );
	notice.className = 'notice notice-error inline';
	notice.style.display = 'none';
	notice.style.margin = '0';

	const preview = document.createElement( 'img' );
	preview.alt = __( 'Generated image preview', 'ai-client-imagegen' );
	preview.style.width = '100%';
	preview.style.height = 'auto';
	preview.style.display = 'none';
	preview.style.borderRadius = '4px';

	const saveButton = document.createElement( 'button' );
	saveButton.type = 'button';
	saveButton.className = 'button button-primary';
	saveButton.textContent = __(
		'Save to Media Library',
		'ai-client-imagegen'
	);
	saveButton.style.display = 'none';

	inner.appendChild( header );
	inner.appendChild( form );
	inner.appendChild( notice );
	inner.appendChild( preview );
	inner.appendChild( saveButton );

	dialog.appendChild( inner );
	document.body.appendChild( dialog );

	closeButton.addEventListener( 'click', () => {
		dialog.close();
	} );

	return { dialog, promptInput, submitButton, notice, preview, saveButton };
}

/**
 * Handles form submission to generate an image via the REST API.
 *
 * @since n.e.x.t
 *
 * @param params             - Submission handler parameters.
 * @param params.prompt      - The text prompt value.
 * @param params.button      - The submit button element.
 * @param params.notice      - The notice element.
 * @param params.preview     - The preview image element.
 * @param params.saveButton  - The save button element.
 * @param params.onGenerated - Callback invoked with base64 data and mime type on success.
 */
async function handleGenerate( {
	prompt,
	button,
	notice,
	preview,
	saveButton,
	onGenerated,
}: {
	prompt: string;
	button: HTMLButtonElement;
	notice: HTMLDivElement;
	preview: HTMLImageElement;
	saveButton: HTMLButtonElement;
	onGenerated: ( base64Data: string, mimeType: string ) => void;
} ): Promise< void > {
	const originalText = button.textContent;
	button.disabled = true;
	button.textContent = __( 'Generating…', 'ai-client-imagegen' );
	hideNotice( notice );
	preview.style.display = 'none';
	preview.removeAttribute( 'src' );
	saveButton.style.display = 'none';

	try {
		const response = await apiFetch< GenerateImageResponse >( {
			path: '/ai-client-imagegen/v1/generate-image',
			method: 'POST',
			data: { prompt },
		} );

		const file = response?.candidates?.[ 0 ]?.message?.parts?.[ 0 ]?.file;
		if ( ! file?.base64Data || ! file?.mimeType ) {
			throw new Error(
				__( 'Unexpected response format.', 'ai-client-imagegen' )
			);
		}

		preview.src = `data:${ file.mimeType };base64,${ file.base64Data }`;
		preview.style.display = 'block';
		saveButton.style.display = 'block';
		onGenerated( file.base64Data, file.mimeType );
	} catch ( error: unknown ) {
		showNotice( {
			notice,
			message: getErrorMessage(
				error,
				__(
					'An error occurred while generating the image.',
					'ai-client-imagegen'
				)
			),
			type: 'error',
		} );
	} finally {
		button.textContent = originalText;
		button.disabled = false;
	}
}

/**
 * Handles saving the generated image to the media library.
 *
 * @since n.e.x.t
 *
 * @param params            - Save handler parameters.
 * @param params.base64Data - The base64-encoded image data.
 * @param params.mimeType   - The image MIME type.
 * @param params.button     - The save button element.
 * @param params.notice     - The notice element.
 * @param params.preview    - The preview image element.
 */
async function handleSave( {
	base64Data,
	mimeType,
	button,
	notice,
	preview,
}: {
	base64Data: string;
	mimeType: string;
	button: HTMLButtonElement;
	notice: HTMLDivElement;
	preview: HTMLImageElement;
} ): Promise< void > {
	const originalText = button.textContent;
	button.disabled = true;
	button.textContent = __( 'Saving…', 'ai-client-imagegen' );
	hideNotice( notice );

	const ext = mimeType.split( '/' ).pop() || 'png';
	const fileName = `ai-generated-image-${ Date.now() }.${ ext }`;

	try {
		await apiFetch< UploadImageResponse >( {
			path: '/ai-client-imagegen/v1/upload-image',
			method: 'POST',
			data: {
				image_base64: base64Data,
				file_name: fileName,
				mime_type: mimeType,
			},
		} );

		preview.style.display = 'none';
		preview.removeAttribute( 'src' );
		button.style.display = 'none';
		showNotice( {
			notice,
			message: __(
				'Image saved to the media library.',
				'ai-client-imagegen'
			),
			type: 'success',
		} );

		const mediaGrid = ( window as any ).wp?.media?.frame?.content?.get();
		if ( mediaGrid?.collection ) {
			mediaGrid.collection.props.set( { ignore: +new Date() } );
		}
	} catch ( error: unknown ) {
		showNotice( {
			notice,
			message: getErrorMessage(
				error,
				__(
					'An error occurred while saving the image.',
					'ai-client-imagegen'
				)
			),
			type: 'error',
		} );
	} finally {
		button.textContent = originalText;
		button.disabled = false;
	}
}

const anchorButton = document.querySelector( 'a.page-title-action' );
if ( ! anchorButton ) {
	// eslint-disable-next-line no-console
	console.error( 'Could not find a.page-title-action element.' );
} else {
	const generateButton = document.createElement( 'button' );
	generateButton.type = 'button';
	generateButton.className = 'page-title-action';
	generateButton.textContent = __(
		'Generate Image File',
		'ai-client-imagegen'
	);
	anchorButton.after( generateButton );

	const { dialog, promptInput, submitButton, notice, preview, saveButton } =
		createModal();

	let currentBase64 = '';
	let currentMimeType = '';

	generateButton.addEventListener( 'click', () => {
		dialog.showModal();
	} );

	dialog.addEventListener( 'close', () => {
		generateButton.focus();
	} );

	dialog.querySelector( 'form' )?.addEventListener( 'submit', ( event ) => {
		event.preventDefault();
		const value = promptInput.value.trim();
		if ( ! value ) {
			promptInput.focus();
			return;
		}
		handleGenerate( {
			prompt: value,
			button: submitButton,
			notice,
			preview,
			saveButton,
			onGenerated( base64Data, mimeType ) {
				currentBase64 = base64Data;
				currentMimeType = mimeType;
			},
		} );
	} );

	saveButton.addEventListener( 'click', () => {
		if ( ! currentBase64 ) {
			return;
		}
		handleSave( {
			base64Data: currentBase64,
			mimeType: currentMimeType,
			button: saveButton,
			notice,
			preview,
		} );
	} );
}
