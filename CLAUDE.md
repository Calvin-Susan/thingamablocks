# Thingamablocks — notes for Claude

"A completely unnecessary ultimate add-ons power-pack for GenerateBlocks." A
WordPress plugin by OGAL Web Design (Kyle). Read README.md for the full guide;
the essentials:

- **What's in it**: six blocks — Toggle (`thingamablocks/toggle`), Countdown
  (`thingamablocks/countdown`), Marquee (`thingamablocks/marquee`), Dropdown
  (`thingamablocks/dropdown`), Breadcrumbs (`thingamablocks/breadcrumbs`),
  Search (`thingamablocks/search`) — plus entrance animations added to every
  GenerateBlocks 2 / GB Pro block, image masks (a "Mask" panel on the GB Image
  block, saved as `mask-*` in its GB styles), video backgrounds (Bunny/Vimeo, a
  "Video background" panel on the GB Element block, `data-tmb-video`), FAQ
  schema (GB Pro Accordion, `data-tmb-faq`), and Settings → Thingamablocks
  (on/off switches per block/feature, Speeds, your own Bunny hostnames).
- **The core idea**: each block is a *settings-only wrapper* (like GB Pro's
  Accordion/Tabs). Everything visible inside is a real GenerateBlocks block
  (Element, Text, Shape, Media), styled with GB's own Styles panel. Parts are
  marked in the GB block's `htmlAttributes` (`data-toggle-part`,
  `data-countdown-part` / `data-countdown-unit`, `data-marquee-part`), via a
  "… part" panel the plugin adds with an `editor.BlockEdit` filter. Animations
  are stored the same way (`data-tmb-animate` etc.). Don't rebuild GB's Styles
  Builder: `window.gb.*` exists but is undocumented.
- **Rendering**: blocks are dynamic. `save()` returns `InnerBlocks.Content`; PHP
  (`includes/class-thingamablocks-*-render.php`) renders the wrapper and adds roles/state to
  parts with `WP_HTML_Tag_Processor`, so markup is right before JS runs. Front
  ends are small vanilla scripts (`src/*/view.js`) using Web Animations, not CSS
  keyframes (survives "remove unused CSS" optimisers).
- **Naming**: blocks `thingamablocks/*`; PHP `thingamablocks_` / `Thingamablocks_`;
  front end `tmb-` (classes, events, storage keys, data attributes) and
  `window.tmbToggle` / `tmbCountdown` / `tmbMarquee` / `tmbDropdown` /
  `tmbBreadcrumbs` / `tmbAnimate` / `tmbVideo`, plus data globals PHP prints
  as inline script: `window.tmbSpeeds` (only when changed) and
  `window.tmbVideoHosts`. Text domain `thingamablocks`.
- **Security**: contributors can save block attributes. Anything reaching a
  `<style>` goes through `Thingamablocks_Sanitize` (`includes/class-thingamablocks-sanitize.php`):
  selectors must be balanced, no `<`, `\`, `@`, `{};` outside quotes. The
  site-wide colour-scheme (no-flash dark mode `<head>` script) settings only
  change when an `edit_theme_options` user saves.
  `get_block_wrapper_attributes()` strips CSS like `mask-image`; add such styles
  afterwards with the tag processor. Block styles end with `;` (WP < 7.0 joins
  them with a space).
- **Shared code**: `src/shared/` (ID picker, canvas styles portalled into the
  editor iframe head, layout picker, GB style helpers, `speeds.js` for front
  end and editor, editor-only `speeds-help.js` so front ends don't load
  wp-i18n, `color-palette.js`).
- **Templates/variations** (`src/*/templates.js`) give parts GB Pro Global
  Style classes via `globalClasses`, not per-block `styles` (GB assigns
  unique IDs itself). Only styles that must survive a restyled/removed class
  stay local `styles`: screen-reader-only text (Countdown), the Marquee row's
  `display:flex`/`flex-direction`, the Search input's `flex-grow`. GB nested
  selectors must start with `&` or be a descendant (no ancestor selectors), so
  state styling is on the part: `&[aria-checked="true"]`,
  `&[data-active="true"]`, `&[aria-pressed="true"]`; a look that needs two
  parts spans two classes (e.g. `tmb-toggle__switch--dark-mode` +
  `tmb-toggle__icon--on`).
- **Global Styles for layouts** (all six blocks): classes are named
  `tmb-<block>__<part>--<modifier>` (base per part, modifier per layout).
  Don't reuse class names the PHP renderers add themselves
  (`tmb-breadcrumbs__separator` → the template uses `__divider`;
  `tmb-search__input`, `tmb-search__label--block`). Defaults live in
  `includes/global-styles/{feature}.php` (returns a static function returning
  `array( class => GB styles )`), loaded by
  `Thingamablocks_Global_Styles::defaults()`
  (`includes/class-thingamablocks-global-styles.php`). They're created as
  `gblocks_styles` posts in a "Thingamablocks" category on an ordinary
  wp-admin load (not AJAX/REST/cron) for users who can manage GB styles, under
  an atomic lock (`INSERT IGNORE` of `thingamablocks_global_styles_lock`), with
  GB Pro's per-save stylesheet rebuild paused and run once at the end; the
  `thingamablocks_global_styles` option (saved after each class) lists names
  already handled, so runs resume and deleted classes stay deleted. ~75
  classes, ~18 KB raw in GB Pro's site-wide stylesheet; keep additions lean.
  **To add a class** (new block or layout): add it to that block's defaults
  file, base before modifiers, and use it in the template; it's created on
  the next admin load. **Never rely on editing an existing default**: the
  plugin never overwrites a class (it's the site's), so edits only reach new
  sites; add a new class instead. Needs GB Pro (free GB: blocks work, layouts
  unstyled). The Playground blueprint's mu-plugin defines
  `THINGAMABLOCKS_PRINT_DEFAULT_STYLES`, so the test site prints the compiled
  defaults itself (`thingamablocks-default-styles`); tests that build layouts
  wait for each part's `uniqueId`, not its CSS.
- **No block patterns**: Kyle doesn't want them; the starting layouts are the
  way to start. `playground/demo/*.php` holds demo sections (markup exported
  from the editor) rendered into the test site's demo page by the blueprint;
  they're not part of the plugin or its zip.

## Commands

- `npm run build` / `npm start` — build to `build/` (custom `webpack.config.js`
  adds entries for animations, mask, faq, video and search/expand, which have
  no block.json).
- `npm run playground` — local WordPress (Playground) on http://127.0.0.1:9400
  with free GenerateBlocks + GeneratePress, auto-login, and a
  "Thingamablocks demo" page built from demo sections in `playground/demo/`.
  `npm run playground:reset` starts fresh. GB Pro can't be tested locally.
- `npm run zip` — `dist/thingamablocks.zip` for uploading to a real site.
- `npm run lint` — ESLint + Stylelint (WordPress rules). `npm run format` fixes
  formatting.
- `npm run test:e2e` — Playwright browser tests in `tests/e2e/` against the
  Playground site (starts it if it isn't running; uses the installed Google
  Chrome locally). Covers asset loading, front-end behaviour, keyboard/screen
  reader markup, forged-settings security, editor block validity, and an axe
  WCAG scan. Test pages are created/updated via REST (`testPage()` in
  `tests/e2e/utils.js`).
- No PHP locally: PHPCS (WordPress-Extra/Docs + PHPCompatibilityWP 7.4+,
  `phpcs.xml.dist`) and WordPress Plugin Check run in GitHub Actions on every
  push (`.github/workflows/ci.yml`), along with lint, build and the browser
  tests. Check the run after pushing (`gh run watch`). For a quick local PHP
  syntax check, `@php-wasm/node` works (see memory notes).
- If the in-app browser pane is hidden, rendering-dependent checks
  (IntersectionObserver, animations) don't run there; use the Playwright tests
  or headless Chrome.

## Building a new block (or feature)

One block at a time, taken to done (built, tested, reviewed, documented,
committed) before the next. Before writing code, answer these and agree them
with Kyle:

1. **Security**: what can a contributor type that ends up in the page (HTML
   attributes, `<style>`, URLs, selectors, JSON for scripts)? How is each
   sanitised in PHP (`Thingamablocks_Sanitize`) and re-validated in the view
   script (data attributes can be forged)? Do the saved attributes survive
   kses for Authors/Contributors (aria-* beyond WP's short list don't, unless
   allowed in `includes/kses.php`)?
2. **Accessibility**: role/name/state for each interactive part, keyboard
   behaviour (WAI-ARIA APG pattern), focus never on hidden or off-screen
   content, contrast of template colours in light and dark mode (≥4.5:1 text,
   ≥3:1 controls), anything moving >5s can be paused (WCAG 2.2.2),
   prefers-reduced-motion, screen reader announcements (no chatty live regions).
3. **Performance**: nothing loads on pages without the block (`viewScript` /
   `viewStyle` in block.json, enqueue on render, no site-wide options or
   `wp_head` output); markup correct from PHP before JS runs (no flash or
   layout shift); no work for off-screen or hidden content.

Then while building: add browser tests for the new block in `tests/e2e/` (its
asset loading, behaviour, keyboard, forged settings, editor validity, and add
it to the demo page in `playground/demo/` so the axe scan covers it). `npm run lint` and
`npm run test:e2e` must pass before committing; CI must be green after
pushing.

Before a release: a full four-part audit (security, performance,
accessibility, WordPress best practices) with parallel read-only agents.

## Working style

- Kyle is a WordPress agency owner who knows GeneratePress/GenerateBlocks well
  and is new to building block plugins: explain WordPress/JS choices plainly.
- After each new feature: a read-only review agent and a docs agent
  (README.md, readme.txt, CHANGELOG.md; add an "Unreleased" section after 1.0.0), then fix and re-test.
- Commit as you go and push to `main` on GitHub
  (github.com/Calvin-Susan/thingamablocks, private).
