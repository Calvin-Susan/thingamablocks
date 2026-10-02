# Thingamablocks — notes for Claude

"A completely unnecessary ultimate add-ons power-pack for GenerateBlocks." A
WordPress plugin by OGAL Web Design (Kyle). Read README.md for the full guide;
the essentials:

- **What's in it**: six blocks — Toggle (`thingamablocks/toggle`), Countdown
  (`thingamablocks/countdown`), Marquee (`thingamablocks/marquee`), Dropdown
  (`thingamablocks/dropdown`), Breadcrumbs (`thingamablocks/breadcrumbs`),
  Search (`thingamablocks/search`) — plus entrance animations added to every
  GenerateBlocks 2 / GB Pro block, and video backgrounds (Bunny/Vimeo, a
  "Video background" panel on the GB Element block, `data-tmb-video`).
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
  `window.tmbToggle` / `tmbCountdown` / `tmbMarquee` / `tmbAnimate`. Text domain
  `thingamablocks`.
- **Security**: contributors can save block attributes. Anything reaching a
  `<style>` goes through `Thingamablocks_Sanitize` (`includes/class-thingamablocks-sanitize.php`):
  selectors must be balanced, no `<`, `\`, `@`, `{};` outside quotes. Site-wide
  dark-mode colours only change for `edit_theme_options` users.
  `get_block_wrapper_attributes()` strips CSS like `mask-image`; add such styles
  afterwards with the tag processor. Block styles end with `;` (WP < 7.0 joins
  them with a space).
- **Shared code**: `src/shared/` (ID picker, canvas styles portalled into the
  editor iframe head, layout picker, GB style helpers).
- **Templates/variations** set GB `styles` objects; GB compiles them to CSS and
  assigns unique IDs itself. GB nested selectors must start with `&` (no
  ancestor selectors), so state styling is on the part: `&[aria-checked="true"]`,
  `&[data-active="true"]`, `&[aria-pressed="true"]`.
- **Global Styles for layouts (in progress, Countdown first)**: instead of
  per-block `styles`, a block's starting layouts give parts GB Pro Global
  Style classes via `globalClasses`: a base class per part plus a layout
  modifier, named `tmb-<block>__<part>--<modifier>` (e.g.
  `tmb-countdown__number` + `tmb-countdown__number--boxes`). The defaults live
  in `Thingamablocks_Global_Styles::defaults()`
  (`includes/class-thingamablocks-global-styles.php`), keyed by feature switch,
  base classes before modifiers; they're created as `gblocks_styles` posts in a
  "Thingamablocks" category on `admin_init` for users who can manage GB styles,
  once per class name (the `thingamablocks_global_styles` option lists the
  names already handled, so a class the site deletes stays deleted). **Never
  overwrite** an existing
  class (it's the site's now), so changing a default only reaches new sites;
  add a new class rather than relying on an edit. Needs GB Pro (free GB: the
  block works, layouts unstyled). Keep screen-reader-only styles local, not in
  a class. Converting the other blocks the same way is the plan; patterns
  still use per-block styles.
- **Patterns** live in `patterns/*.php` (markup exported from the editor, so
  it's exactly what GB saves, with visible strings wrapped for translation) and
  are registered in `includes/patterns.php` with `filePath`.

## Commands

- `npm run build` / `npm start` — build to `build/` (custom `webpack.config.js`
  adds the animation entries, which have no block.json).
- `npm run playground` — local WordPress (Playground) on http://127.0.0.1:9400
  with free GenerateBlocks + GeneratePress, auto-login, and a
  "Thingamablocks demo" page built from the patterns. `npm run playground:reset`
  starts fresh. GB Pro can't be tested locally.
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
it to the demo page/patterns so the axe scan covers it). `npm run lint` and
`npm run test:e2e` must pass before committing; CI must be green after
pushing.

Before a release: a full four-part audit (security, performance,
accessibility, WordPress best practices) with parallel read-only agents.

## Working style

- Kyle is a WordPress agency owner who knows GeneratePress/GenerateBlocks well
  and is new to building block plugins: explain WordPress/JS choices plainly.
- After each new feature: a read-only review agent and a docs agent
  (README.md, readme.txt, CHANGELOG.md "Unreleased"), then fix and re-test.
- Commit as you go and push to `main` on GitHub
  (github.com/Calvin-Susan/thingamablocks, private).
