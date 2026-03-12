# AI Client ImageGen WordPress Plugin - AGENTS.md

This WordPress plugin is a demo plugin for using the WordPress built-in AI Client launching in WordPress 7.0.

It allows generating and editing images in the WordPress media library.

## Workflow Commands

- `npm run build` — Build JS/TS packages with wp-scripts
- `npm run typecheck` — Run TypeScript type checking
- `npm run lint-js` — Lint JS/TS source files
- `npm run wp-env start` — Starts the built-in WordPress environment (requires Docker to be running)
- `npm run wp-env stop` — Stops the built-in WordPress environment (requires Docker to be running)
- `composer phpcs` — Run PHP_CodeSniffer to check code style
- `composer phpcbf` — Auto-fix code style issues
- `composer phpstan` — Run PHPStan static analysis

<!-- opensrc:start -->

## Source Code Reference

Source code for dependencies is available in `opensrc/` for deeper understanding of implementation details.

See `opensrc/sources.json` for the list of available packages and their versions.

Use this source code when you need to understand how a package works internally, not just its types/interface.

### Fetching Additional Source Code

To fetch source code for a package or repository you need to understand, run:

```bash
npx opensrc <package>           # npm package (e.g., npx opensrc zod)
npx opensrc pypi:<package>      # Python package (e.g., npx opensrc pypi:requests)
npx opensrc crates:<package>    # Rust crate (e.g., npx opensrc crates:serde)
npx opensrc <owner>/<repo>      # GitHub repo (e.g., npx opensrc vercel/ai)
```

<!-- opensrc:end -->
