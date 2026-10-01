# Changelog

All notable changes to Thingamablocks are listed here.

## Unreleased

### Added

#### Image masks

- A **Mask** panel on the GenerateBlocks Image block (GB 2's `generateblocks/media` only). **Choose a shape** opens a picker with two tabs: **Shape library** (the GenerateBlocks shape library – GB's built-in waves, angles, curves and triangles plus any shapes added to it; GenerateBlocks Pro's Asset Library shapes are expected to appear but this isn't confirmed with GB Pro yet) and **Upload or paste** (an .svg file or SVG code). The solid parts of the shape show the image; empty parts are see-through.
- Settings: **Size** (Contain, Cover, Stretch, or a Custom width in %, px or rem; only Stretch distorts the shape, even for library shapes made to stretch), **Position** (focal point picker), **Flip** (horizontally / vertically), **Repeat the shape** (off by default), **Replace shape** and **Remove mask**.
- **Breakpoints**: the panel follows the editor's preview device, like GB's Styles panel. Desktop applies everywhere; Tablet and Mobile store only what you change, under GB's `@media (max-width:1024px)` / `@media (max-width:767px)`, so they inherit desktop. **Remove at this size** turns the mask off on that size and smaller (`mask-image: none`); **Reset Tablet/Mobile to inherited settings** clears that size's own changes.
- Saved as `mask-image`, `mask-size`, `mask-position` and `mask-repeat` in the block's GenerateBlocks styles, so it's visible and editable in GB's Styles panel and GB compiles and prints it with the block's CSS. **Nothing loads on the front end**, and the image's HTML is unchanged. Linked images keep their keyboard focus outline (drawn on the link, which isn't masked).
- **SVG safety**: SVGs are never added to the Media Library. They're cleaned in the browser to an allowlist of shape elements and attributes (no scripts, event handlers, styles, embedded images or external references), capped at 100 KB, and percent-encoded (quotes and brackets too) into a `data:` URL. Library shapes are stored as a copy, so later edits to the library don't change existing images and deleting a library shape never breaks a page. Clear errors for invalid SVGs, a missing `viewBox`, no shapes, or a file that's too big.
- Browser tests (`tests/e2e/mask.spec.js`, fixtures in `tests/e2e/fixtures/`): the panel writes styles per breakpoint, a malicious SVG is cleaned, the front end shows the mask with a tablet override and loads nothing from the plugin, linked masked images keep their focus ring, and saved posts reopen as valid blocks.
- Build: `webpack.config.js` adds the `mask/editor` entry (`src/mask/` → `build/mask/`); `includes/mask.php` loads it in the block editor.

## 0.1.0 – 2026-10-01

Initial release. Requires WordPress 6.6+ (tested up to 7.1), PHP 7.4+ and GenerateBlocks 2.0+.

### Added

#### General

- Three blocks in the GenerateBlocks inserter category – **Toggle**, **Countdown** and **Marquee** – plus **entrance animations** for every GenerateBlocks 2 / GenerateBlocks Pro block.
- Each block is a **settings-only wrapper** (like GB Pro's Accordion and Tabs): everything visible is a GenerateBlocks Element, Text, Shape or Media block, styled in the GB Styles panel. Parts are marked with a "… part" panel and stored in the GB block's own HTML attributes.
- Blocks are rendered on the server, so roles, state and numbers are right before any JavaScript runs. Front-end scripts use the Web Animations API rather than CSS keyframes, so "remove unused CSS" optimisers can't break them.
- **Nothing loads on pages that don't use the plugin.** Block scripts are `viewScript`s and the Toggle's few lines of CSS are a `viewStyle`, so each loads only on pages with that block. The only site-wide output is the dark mode `<head>` script, and only while a published dark mode toggle exists.
- Starting layouts use the GeneratePress global colour variables with fallbacks for other themes. Text on accent-coloured backgrounds uses `var(--base-3)`, so it stays readable in dark mode too.
- **Patterns**, as PHP files with translatable text, registered with `filePath` (read only when needed): "Pricing table with monthly/annual toggle" (Toggles), "Sale banner with countdown" and "Launch countdown" (Countdowns), "Logo strip: Trusted by…" (Marquees). All are on the Playground demo page.
- **Target picker** shared by the Toggle and Countdown: suggests the page's element IDs and flags IDs it can't find. A bare word is an element ID, except `html`, `body`, `main`, `header`, `footer`, `nav`, `aside`, `article`, `section` (the tag, unless an element has that ID); anything else is a CSS selector. Every element with a duplicated ID is switched.
- **Selector safety**: a target selector is only kept if it uses plain, balanced selector characters and has no `<`, `\`, `{`, `}`, `;`, `@`, comments or `url(` anywhere, even inside quotes. IDs may use non-ASCII letters. The editor flags selectors that will be ignored.
- **Shared code**: `Thingamablocks_Sanitize` (`includes/class-sanitize.php`) and `src/shared/` (target picker, layout picker, editor canvas styles, GenerateBlocks helpers).
- Admin notice when GenerateBlocks 2.0+ isn't active.
- `uninstall.php` removes the plugin's options when it's deleted (content stays as saved). `LICENSE` (GPL v2).

#### Toggle

- **Toggle block** (`thingamablocks/toggle`). Starting layouts: Switch with labels, Segmented buttons (group labelled "Billing period"), Switch, Dark mode switch. The knob moves with `margin-inline-start`, so it works on RTL sites. The switch's "off" track is a fixed `#767680`, which has enough contrast in light and dark mode.
- **Toggle part** panel on GB Element, Text, Shape and Media blocks: flips the toggle (switch), turns it off, turns it on, or decoration. Stored as `data-toggle-part`; processed parts get `data-toggle-owned` so nested toggles stay separate.
- **Actions**:
  - Show / hide elements, with fade or fade-and-slide reveal, no flash of hidden elements on load, and an inline `display: none !important`. The editor dims targets hidden in the current preview state.
  - Light / dark mode: sets `data-color-scheme` and `color-scheme` on `<html>`, optional `<html>` class, follows the system setting, always remembers the choice, with a no-flash `<head>` script.
  - Dark mode colours panel: a dark version of each theme colour (GeneratePress global colours or block theme presets), with "Suggest dark colours" and "Clear". Printed site-wide under `:root[data-color-scheme="dark"]` and previewed in the editor when the toggle starts "On". Tracked per published post, so removing the toggle or trashing the post switches it off. Only users with `edit_theme_options` change the site-wide colours and `<html>` class.
  - Add / remove classes on target elements.
  - Nothing (custom code).
- **State**: starts off/on (previewed in the editor, with an On/Off toolbar button), remember the visitor's choice (`localStorage`, keys `tmb-toggle:group:…`, `tmb-toggle:id:…`, `tmb-toggle:path:…`), sync group (every member runs its own action; `color-scheme` is reserved). A remembered choice is applied before first paint by a tiny inline script when the toggle has a group or HTML anchor (and for dark mode); otherwise when the main script runs.
- **HTML anchor** support on the wrapper.
- **Accessibility**: server-rendered `role="switch"` / `aria-checked`, `aria-pressed` on segmented buttons, `role="button"` and keyboard focus for on/off parts in toggles without a switch, `data-active`, `aria-controls`, a switch label setting (also names a segmented group) with fallback to the "on" label, and an editor warning when a switch or a buttons-only toggle has no label. Keyboard support; if a toggle hides its own section, focus moves to a visible member of its group. Reduced-motion support.
- `aria-checked` and `aria-pressed` are allowed through WordPress's content filter, so Authors and Contributors saving toggles don't get "invalid block" errors.
- **Developer API**: `tmb-toggle:change` event, `window.tmbToggle.get()` / `.set()` / `.init()`, `thingamablocks_print_color_scheme_script` filter.

#### Countdown

- **Countdown block** (`thingamablocks/countdown`). Starting layouts: Boxes, Inline text ("Ends in 2d 5h 12m 9s"; two-digit numbers off and hide-zero units on by default), Large numbers (with colons).
- **Countdown part** panel on GB Element, Text and Shape blocks: Days/Hours/Minutes/Seconds number, unit box, Timer (hidden when it ends), Ended message, Separator (`aria-hidden`). Stored as `data-countdown-part` / `data-countdown-unit`.
- **Modes**:
  - A date and time, in the site's time zone (Settings → General). New countdowns default to a week out at 23:59.
  - A deadline per visitor (evergreen): days/hours/minutes from the first view, remembered in `localStorage` (keyed by HTML anchor, else page path and position), optionally starting again when it ends. Works when the browser blocks storage.
  - A time that repeats: a time of day on chosen weekdays, rolling over to the next one. Handles daylight saving (skipped times resolve like PHP) and fixed UTC offsets.
- **Display**: two-digit numbers; hide leading units that reach zero (keeps the last two, hides the separator after a hidden unit, on the server too). Deleting a unit's box makes the next unit absorb its time (48 hours instead of 2 days).
- **When it ends**: show the ended message (announced to screen readers), stay at zero, or disappear; also hide / also show elements (no flash on load); optional redirect to an `http`/`https` URL, never to the same page (trailing slashes ignored).
- **Server rendering**: real numbers and the ended state are written in PHP, so the page is correct before JavaScript runs and cached pages correct themselves on load.
- **Accessibility**: `role="timer"` with an `aria-label` ("Countdown to {date}" in date mode, otherwise "Countdown"). The Inline text layout and sale banner pattern show d/h/m/s, but screen readers hear the full word.
- **Editor**: Running/Ended preview toolbar button, warnings for no number parts or no ended message, "Ends in …" / "Next: …" hints, List View label ("Countdown · Date / Evergreen / Recurring").
- **Developer API**: `tmb-countdown:end` and `tmb-countdown:restart` events, `window.tmbCountdown.init()` and `.reset()`.

#### Marquee

- **Marquee block** (`thingamablocks/marquee`). Starting layouts: Logo strip, Message ticker, Big scrolling headline, Vertical quotes, each with a pause button that comes first, before the row.
- **Marquee part** panel: "The row that scrolls" (`data-marquee-part="items"`) and "Pause button" (`data-marquee-part="pause"`).
- **Settings**: speed in px/s, direction (left/right/up/down), height for up/down, pause on hover, faded edges with a fade width, an accessible label (`role="region"`). Editor **Preview** toolbar button; List View label "Marquee · Left/Right/Up/Down".
- **Front end**: copies the row just enough to fill the space and loops it with the Web Animations API, gap matched at the seam, re-measured on resize without jumping, paused off screen, RTL aware. Clipping, fade and height are server-rendered inline styles. Lazy images in the copies stay lazy until the strip is near the screen.
- **Accessibility**: copies are `aria-hidden`, `inert` and out of the tab order; the pause button gets its role, `aria-pressed` and a default label on the server, with a sidebar warning if it's missing (WCAG 2.2.2). Keyboard focus always pauses the marquee, a focused link is moved fully into view, and the edge fade is removed while focused. Reduced motion gives a still row that scrolls; if it overflows it's keyboard-focusable and named (the Accessibility label, or "Scrolling content").
- **Developer API**: `window.tmbMarquee.init()` and `.pause( elementOrAnchor, pause? )`; `.tmb-marquee.is-paused` for styling.

#### Entrance animations

- An **Entrance animation** panel on every GenerateBlocks 2 / GB Pro block (not the legacy GB 1.x blocks): Animation (Fade in, Fade up, Fade down, Slide in from the left/right, Zoom in), Speed (Fast 400 ms / Normal 700 ms / Slow 1100 ms), Delay (0–2000 ms), and on blocks that hold other blocks, **Animate the blocks inside one by one** with **Time between each** (50–500 ms) – for grids, cards and query loops (set it on the Looper). **Preview** button; choosing an animation previews it. The help text advises against animating the hero/LCP element.
- Stored in the block's GB HTML attributes (`data-tmb-animate`, `data-tmb-speed`, `data-tmb-delay`, `data-tmb-animate-children`), only where they differ from the defaults.
- **Front end**: plays once as the block scrolls into view; blocks already scrolled past are just shown, and a block that receives keyboard focus first is shown at once. Animates from a single start keyframe to the block's own styles using `opacity` and the individual `translate` / `scale` properties, so GB transforms and hover transitions are untouched. Layout reads are batched before writes.
- **Light**: a ~1.8 KB script and ~600 bytes of CSS, only on pages with an animated block. The CSS goes in `<head>` when the viewed post uses an animation or a block theme rendered one first; otherwise just before the first animated block.
- **Robust**: reveals as soon as any part of a block is in view; content added later is picked up automatically; after the script loads only watched blocks are hidden; long "one by one" groups are capped at 1.2 s; hidden children don't take a turn. Animated blocks inside Marquee copies show as already animated.
- **No flash, no lost content**: blocks are only hidden with JavaScript running, on screen (never in print), and without reduced motion; a fail-safe shows everything after 4 s if the script is blocked or delayed.
- **Developer API**: `window.tmbAnimate.init( root )`, filters `thingamablocks_animation_head_markup` and `thingamablocks_animations_print_css`, CSS hooks `.tmb-in`, `html.tmb-animate-js` and `html.tmb-animate-ready`.

#### Development

- Built with `@wordpress/scripts`; `webpack.config.js` adds the `src/animations/` entries.
- `npm run playground` (local WordPress Playground with GenerateBlocks, GeneratePress and a demo page) and `npm run zip`.
- Linting and formatting: `npm run lint` (`lint:js`, `lint:css`), `npm run format`, and `composer run lint:php` (PHPCS with WordPress-Extra, WordPress-Docs and PHPCompatibilityWP for PHP 7.4+, in `phpcs.xml.dist`). `.editorconfig`, `.nvmrc`.
- GitHub Actions CI: JS/CSS lint, build and zip, PHP 7.4 and 8.4 syntax check, PHPCS, and WordPress Plugin Check.
