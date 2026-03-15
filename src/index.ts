/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';

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
	providerMetadata?: {
		id: string;
		name: string;
	};
	modelMetadata?: {
		id: string;
		name: string;
	};
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
 * Returns a timestamp string in the format YYYYMMDDHHmmss.
 *
 * @since n.e.x.t
 *
 * @return The formatted timestamp.
 */
function formatTimestamp(): string {
	const d = new Date();
	return (
		String( d.getFullYear() ) +
		String( d.getMonth() + 1 ).padStart( 2, '0' ) +
		String( d.getDate() ).padStart( 2, '0' ) +
		String( d.getHours() ).padStart( 2, '0' ) +
		String( d.getMinutes() ).padStart( 2, '0' ) +
		String( d.getSeconds() ).padStart( 2, '0' )
	);
}

/**
 * Checks whether a file name contains only allowed characters.
 *
 * @since n.e.x.t
 *
 * @param name - The file name to validate (without extension).
 * @return True if the name is valid, false otherwise.
 */
function isValidFileName( name: string ): boolean {
	return /^[a-z0-9_-]+$/.test( name );
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
	attribution: HTMLParagraphElement;
	saveSection: HTMLDivElement;
	fileNameInput: HTMLInputElement;
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

	const attribution = document.createElement( 'p' );
	attribution.style.display = 'none';
	attribution.style.margin = '0';
	attribution.style.fontStyle = 'italic';
	attribution.style.color = '#757575';

	const saveSection = document.createElement( 'div' );
	saveSection.style.display = 'none';
	saveSection.style.flexDirection = 'column';
	saveSection.style.gap = '4px';

	const fileNameLabel = document.createElement( 'label' );
	fileNameLabel.style.fontWeight = '600';
	fileNameLabel.textContent = __( 'File name', 'ai-client-imagegen' );
	fileNameLabel.setAttribute( 'for', 'aicig-filename-input' );

	const fileNameDescription = document.createElement( 'p' );
	fileNameDescription.style.margin = '0';
	fileNameDescription.style.fontSize = '12px';
	fileNameDescription.style.color = '#757575';
	fileNameDescription.textContent = __(
		'Only lowercase letters, numbers, hyphens, and underscores are allowed. The file extension will be added automatically.',
		'ai-client-imagegen'
	);

	const saveRow = document.createElement( 'div' );
	saveRow.style.display = 'flex';
	saveRow.style.gap = '8px';

	const fileNameInput = document.createElement( 'input' );
	fileNameInput.type = 'text';
	fileNameInput.id = 'aicig-filename-input';
	fileNameInput.className = 'regular-text';
	fileNameInput.style.flex = '1';

	const saveButton = document.createElement( 'button' );
	saveButton.type = 'button';
	saveButton.className = 'button button-primary';
	saveButton.textContent = __(
		'Save to Media Library',
		'ai-client-imagegen'
	);

	fileNameInput.addEventListener( 'input', () => {
		const val = fileNameInput.value.trim();
		saveButton.disabled = val.length === 0 || ! isValidFileName( val );
	} );

	saveRow.appendChild( fileNameInput );
	saveRow.appendChild( saveButton );

	saveSection.appendChild( fileNameLabel );
	saveSection.appendChild( fileNameDescription );
	saveSection.appendChild( saveRow );

	inner.appendChild( header );
	inner.appendChild( form );
	inner.appendChild( notice );
	inner.appendChild( preview );
	inner.appendChild( attribution );
	inner.appendChild( saveSection );

	dialog.appendChild( inner );
	document.body.appendChild( dialog );

	closeButton.addEventListener( 'click', () => {
		dialog.close();
	} );

	return {
		dialog,
		promptInput,
		submitButton,
		notice,
		preview,
		attribution,
		saveSection,
		fileNameInput,
		saveButton,
	};
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
 * @param params.attribution - The attribution paragraph element.
 * @param params.saveSection - The save section wrapper element.
 * @param params.onGenerated - Callback invoked with base64 data, mime type, and model ID on success.
 */
async function handleGenerate( {
	prompt,
	button,
	notice,
	preview,
	attribution,
	saveSection,
	onGenerated,
}: {
	prompt: string;
	button: HTMLButtonElement;
	notice: HTMLDivElement;
	preview: HTMLImageElement;
	attribution: HTMLParagraphElement;
	saveSection: HTMLDivElement;
	onGenerated: (
		base64Data: string,
		mimeType: string,
		modelId: string
	) => void;
} ): Promise< void > {
	const originalText = button.textContent;
	button.disabled = true;
	button.textContent = __( 'Generating…', 'ai-client-imagegen' );
	hideNotice( notice );
	preview.style.display = 'none';
	preview.removeAttribute( 'src' );
	saveSection.style.display = 'none';
	attribution.style.display = 'none';
	attribution.textContent = '';

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
		saveSection.style.display = 'flex';

		const modelName = response?.modelMetadata?.name;
		const providerName = response?.providerMetadata?.name;
		if ( modelName && providerName ) {
			attribution.textContent = sprintf(
				/* translators: 1: model name, 2: provider name */
				__( 'Generated by %1$s (%2$s)', 'ai-client-imagegen' ),
				modelName,
				providerName
			);
			attribution.style.display = 'block';
		}

		const modelId = response?.modelMetadata?.id || '';
		onGenerated( file.base64Data, file.mimeType, modelId );
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
 * @param params               - Save handler parameters.
 * @param params.base64Data    - The base64-encoded image data.
 * @param params.mimeType      - The image MIME type.
 * @param params.fileName      - The full file name including extension.
 * @param params.button        - The save button element.
 * @param params.notice        - The notice element.
 * @param params.preview       - The preview image element.
 * @param params.attribution   - The attribution paragraph element.
 * @param params.saveSection   - The save section wrapper element.
 * @param params.fileNameInput - The file name input element.
 */
async function handleSave( {
	base64Data,
	mimeType,
	fileName,
	button,
	notice,
	preview,
	attribution,
	saveSection,
	fileNameInput,
}: {
	base64Data: string;
	mimeType: string;
	fileName: string;
	button: HTMLButtonElement;
	notice: HTMLDivElement;
	preview: HTMLImageElement;
	attribution: HTMLParagraphElement;
	saveSection: HTMLDivElement;
	fileNameInput: HTMLInputElement;
} ): Promise< void > {
	const originalText = button.textContent;
	button.disabled = true;
	button.textContent = __( 'Saving…', 'ai-client-imagegen' );
	hideNotice( notice );

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
		saveSection.style.display = 'none';
		fileNameInput.value = '';
		attribution.style.display = 'none';
		attribution.textContent = '';
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

	const {
		dialog,
		promptInput,
		submitButton,
		notice,
		preview,
		attribution,
		saveSection,
		fileNameInput,
		saveButton,
	} = createModal();

	let currentBase64 = '';
	let currentMimeType = '';

	/*
	 * WordPress Core's media-grid.js binds a click handler to all
	 * `.page-title-action` elements to toggle the upload drop zone.
	 * Stopping immediate propagation prevents that handler from firing
	 * on this custom button while keeping the class for its styling.
	 */
	generateButton.addEventListener( 'click', ( event: MouseEvent ) => {
		event.stopImmediatePropagation();
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
			attribution,
			saveSection,
			onGenerated( base64Data, mimeType, modelId ) {
				currentBase64 = base64Data;
				currentMimeType = mimeType;
				const slug = modelId
					? modelId.replace( /\./g, '-' )
					: 'unknown';
				fileNameInput.value = `ai-generated-by-${ slug }-${ formatTimestamp() }`;
				saveButton.disabled = false;
			},
		} );
	} );

	saveButton.addEventListener( 'click', () => {
		const name = fileNameInput.value.trim();
		if ( ! currentBase64 || ! name || ! isValidFileName( name ) ) {
			return;
		}
		const ext = currentMimeType.split( '/' ).pop() || 'png';
		handleSave( {
			base64Data: currentBase64,
			mimeType: currentMimeType,
			fileName: `${ name }.${ ext }`,
			button: saveButton,
			notice,
			preview,
			attribution,
			saveSection,
			fileNameInput,
		} );
	} );
}
