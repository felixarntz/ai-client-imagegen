import { __ } from '@wordpress/i18n';

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
}
