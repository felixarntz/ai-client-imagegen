# AI Client ImageGen WordPress Plugin

This WordPress plugin is a demo plugin for using the WordPress built-in AI Client launching in WordPress 7.0.

It allows generating and editing images in the WordPress media library.

## Getting Started

```bash
composer install
npm install
npm run build
```

### For Better Coding Agent Support

```bash
npm install -g agent-browser
agent-browser install
npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser -g
```

## Installation

Make sure you're using WordPress 7.0 or higher.

1. Download the plugin files in an `ai-client-imagegen` folder.
2. Inside the folder, run the commands from the "Getting Started" section, to build the JS code.
3. Upload the `ai-client-imagegen` folder to the `/wp-content/plugins/` directory.
	- Ideally, you only need to include `plugin.php`, plus the `build` and `includes` directories.
4. Visit **Plugins**, and activate the AI Client ImageGen plugin.
5. Make sure you have configured at least one AI connector under **Settings > Connectors**.
6. Go to **Media** and start generating or editing images.

## License

GPL v2 or later
