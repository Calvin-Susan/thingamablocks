# Thingamablocks — notes for Claude

"A completely unnecessary ultimate add-ons power-pack for GenerateBlocks." A
WordPress plugin by OGAL Web Design (Kyle). Read README.md for the full guide;
the essentials:

- **What's in it**: three blocks — Toggle (`thingamablocks/toggle`), Countdown
  (`thingamablocks/countdown`), Marquee (`thingamablocks/marquee`) — plus
  entrance animations added to every GenerateBlocks 2 / GB Pro block.
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
- No PHP locally: read PHP carefully; Playground surfaces fatal errors.
- If the in-app browser pane is hidden, rendering-dependent checks
  (IntersectionObserver, animations) don't run there; use headless Chrome
  (`playwright-core` with `/Applications/Google Chrome.app`).

## Working style

- Kyle is a WordPress agency owner who knows GeneratePress/GenerateBlocks well
  and is new to building block plugins: explain WordPress/JS choices plainly.
- After each new feature: a read-only review agent and a docs agent
  (README.md, readme.txt, CHANGELOG.md "Unreleased"), then fix and re-test.
- Commit as you go; there's no remote yet.
