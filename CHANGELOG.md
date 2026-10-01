# Changelog

All notable changes to Thingamablocks are listed here.

## Unreleased

### Added

#### Settings

- **Settings → Thingamablocks** (`manage_options`; also a **Settings** link on the Plugins screen): a switch for each block (Toggle, Countdown, Marquee, Dropdown, Breadcrumbs – **Show in the block inserter**) and feature (Entrance animations, Image masks – **Show the panel in the editor**), all on by default, each with a one-line description and where it's used ("In use on N items": posts, pages, templates, synced patterns and GeneratePress Elements in any status except the trash; masks are counted by an image mask in a block's GB styles).
- **Switching off only hides.** A block stays registered, so existing content still renders and stays editable, but gets `supports.inserter = false` in the editor (an inline `blocks.registerBlockType` filter) and its patterns aren't registered. A feature's editor script (Entrance animation or Mask panel) isn't enqueued; existing animations and masks keep working.
- Developer API: `thingamablocks_is_enabled( $key )` and the `thingamablocks_settings` option (key => true/false; a missing key counts as on). Deleting the plugin removes the option.
- Browser tests (`tests/e2e/settings.spec.js`): the page and its counts, blocks/patterns/panels hidden when switched off, and an existing dropdown still working on the site and in the editor.

#### Breadcrumbs

- A fifth block, **Breadcrumbs** (`thingamablocks/breadcrumbs`): the path to the current page, worked out on the server for whatever page is being viewed, so it can go in a page, a template, a GeneratePress Element on a hook, or a widget. A settings-only wrapper like the others: a GenerateBlocks Text link marked **Link to each page**, a **Separator** and **The current page** in the new **Breadcrumb part** panel (`data-breadcrumb-part="item|separator|current"`) are templates, rendered once by GenerateBlocks (so their CSS prints) and repeated for every step with the `WP_HTML_Tag_Processor`. Only blocks set as a part are shown; the sidebar warns if there's no link part.
- Starting styles: **Chevrons** (default), **Slashes** and **Pills**. Separators are characters, not SVGs, so nothing is stripped when Authors or Contributors save.
- **The trail**: parent pages (private and draft parents are left out, and titles never get WordPress's "Private:" or "Protected:" prefix); on posts the blog page (Settings → Reading) and the category with its parents (the primary category from Yoast SEO or Rank Math if set); custom post type archives; attachments under their parent; term archives with parent terms; author, date, search and 404 pages; WooCommerce shop, product categories and products.
- **Trail** settings: **Use Yoast SEO's / Rank Math's breadcrumbs** (on by default, shown when one is active); **Home** as Text, Icon or Both, with a **Home label**; **Show the blog page on posts**; **Show the category on posts**; **Show the current page** (`aria-current="page"`, not a link); **Show on the home page** (off by default); **Collapse when it doesn't fit**.
- **SEO plugins**: with Yoast SEO or Rank Math active, the block shows their trail, so visitors see what search engines are told. Their APIs are guarded, so any failure falls back to the block's own trail.
- **Search engines** panel: **Breadcrumb structured data** (schema.org `BreadcrumbList`, once per page) – **Automatic** (only when no SEO plugin adds it: Yoast always does, Rank Math when its breadcrumbs are on, All in One SEO, The SEO Framework and Slim SEO by default), **Always** or **Never**. Printed in the footer. The `thingamablocks_breadcrumbs_seo_schema` filter can override the detection either way.
- **Collapse**: a trail that doesn't fit on one line becomes Home › … › Parent › Page; the **…** button shows the rest and moves focus to the first revealed step. Without JavaScript the trail wraps.
- **Accessibility**: `<nav>` with a label (**Accessibility** panel, "Breadcrumb" by default) around an `<ol>`; separators `aria-hidden`; a home icon keeps "Home" as hidden text; links and the … button at least 24 px tall.
- Styling hooks: `.tmb-breadcrumbs`, `.tmb-breadcrumbs__list`, `.tmb-breadcrumbs__step`, `.tmb-breadcrumbs__more`, plus the parts' GB styles and `[aria-current="page"]`.
- Developer API: the `thingamablocks_breadcrumbs_trail` filter (`$trail` – a list of `label` / `url`, the last being the current page – and `$options`) and `window.tmbBreadcrumbs.init( root )` for trails added with AJAX.
- Loads only on pages with Breadcrumbs (`viewStyle` and a small `viewScript`); no JavaScript is needed to show the trail.
- Browser tests: `tests/e2e/breadcrumbs.spec.js` (page, post, archive, search and 404 trails, markup, home icon, one `BreadcrumbList`, collapse on a phone, axe, editor validity) and `tests/e2e/seo-plugins.spec.js` (installs Yoast SEO and Rank Math from WordPress.org).

#### Dropdown

- A fourth block, **Dropdown** (`thingamablocks/dropdown`): a button that opens a drawer of links, downloads or any other blocks. A settings-only wrapper like the others. Mark a GenerateBlocks Button (`<button>` tag) as **The button that opens it** and a GenerateBlocks Element as **The drawer** in the new **Dropdown part** panel (`data-dropdown-part="button|drawer"`); the sidebar warns if either is missing. A button that isn't a `<button>` gets `role="button"`, `tabindex="0"` and Space/Enter support.
- Starting layouts: **Downloads** (default; a list of files with their type and size), **Simple links** and **Panel** (`18rem` wide, for any content). The button and drawer share corner radius and colours, and the chevron (GB's button icon) turns over via `&[aria-expanded="true"]`.
- **Drawer** settings: **Reveal animation** (None, Fade, Slide down – default, Grow, Unfold; played in reverse on close), **Speed** (Fast / Normal / Slow), **Line up with the button's** Start / Centre / End, **Space between button and drawer** (0–48 px, default 8), **Close when an item is clicked** (on by default; returns focus to the button). A toolbar **Preview** button plays the reveal in the editor, where the drawer shows in the page flow while the dropdown or anything inside it is selected.
- **Placement**: opens below the button, as wide as it unless the drawer has its own width in the GB Styles panel; flips above when there isn't room below; lines up and stays on screen (allowing for theme list margins); repositions on scroll and resize. The positioning CSS is a `viewStyle` of zero-specificity `:where()` rules, so GB styles always win. Like any popover, it's clipped by an ancestor with `overflow: hidden`.
- **Accessibility**: the WAI-ARIA disclosure pattern (`aria-expanded`, `aria-controls`), deliberately not an ARIA menu. Escape closes and returns focus to the button; a click outside, focus leaving, or using an item closes it; the Down arrow opens it and focuses the first item; one open at a time; no animation for reduced motion. The server renders it closed with ARIA state and a drawer ID before JavaScript runs, and a `<noscript>` rule shows every drawer without JavaScript. The Downloads and Simple links layouts are real `<ul>` lists.
- Styling hooks: `&[aria-expanded="true"]` on the button, `.tmb-dropdown.is-open` and `data-placement="top|bottom"` on the wrapper while open.
- Developer API: `tmb-dropdown:open` and `tmb-dropdown:close` events (bubbling, `detail.dropdown` is the wrapper) and `window.tmbDropdown.init()` / `.open()` / `.close()` / `.toggle()`, taking the wrapper element or its HTML anchor.
- Loads only on pages with a Dropdown (`viewScript` and `viewStyle`).
- Pattern **Product resources with a Downloads dropdown** in a new **Dropdowns** pattern category (`patterns/downloads-dropdown.php`), also on the Playground demo page.
- Known limitation: GenerateBlocks button icons are inline SVGs, which WordPress's content filter strips for users without `unfiltered_html` (Authors, Contributors, and administrators on multisite), so a dropdown they save shows its button as invalid in the editor. This affects any GB button with an icon. Have an Editor or Administrator save it, or remove the icon. The Playground blueprint adds the dropdown pattern to the demo page unfiltered for this reason.
- Browser tests (`tests/e2e/dropdown.spec.js`): markup before JavaScript, no-JavaScript fallback, opening and every way of closing, keyboard, one at a time, flipping, staying on screen at 360 px, reduced motion, forged settings, axe checks open and closed, and editor validity and drawer visibility.

#### Entrance animations: replay button

- **Replay button** in the Entrance animation panel (GenerateBlocks 2 blocks with nothing inside them, so a whole section can't become a button; best a Text block set to Button). **Replay the blocks with these IDs** (suggestions from IDs on the page; a note for IDs not found) chooses what it replays; empty means every animation on the page. Stored as `data-tmb-replay="id other-id"` or `data-tmb-replay="*"`, separate from the animation settings (setting Animation to None keeps it).
- Clicking it plays the entrance animations inside (and on) those blocks again, restarting any still playing. Only blocks on screen play straight away: blocks below it are hidden again and play when scrolled to, blocks above it are left alone, and blocks not yet seen animate when they arrive. Replay still works when the first play was skipped because the script arrived late. The button never hides itself: a block containing it isn't replayed, and a "one by one" group skips the item holding it.
- **Accessibility**: PHP adds `type="button"` to a `<button>`, and `role="button"` (with `tabindex="0"` unless it's a link with an `href`) to anything else, plus `aria-controls` with the valid IDs; an author's own `role` is kept. Enter and Space press `role="button"` elements (once, however long the key is held); a link used as a replay button doesn't navigate, but links and fields inside one work normally. Replay buttons are hidden for visitors who prefer reduced motion and when JavaScript is off, since nothing would replay, and are invisible (keeping their space) until the script says replaying works (`html.tmb-replay-on`).
- The view script re-validates the IDs (forged values are ignored). The animation script and its CSS also load on pages with a replay button.
- Developer API: `window.tmbAnimate.replay( element )` (no argument: the whole page).
- Browser tests (`tests/e2e/behaviour.spec.js`): button markup before JavaScript, replaying without hiding the button, keyboard on a `role="button"` replay button (and a held key), links inside a replay button, off-screen blocks replaying when scrolled to, hidden without JavaScript and for reduced motion.

#### Image masks

- A **Mask** panel on the GenerateBlocks Image block (GB 2's `generateblocks/media` only). **Choose a shape** opens a picker with two tabs: **Shape library** (the GenerateBlocks shape library – GB's built-in waves, angles, curves and triangles plus any shapes added to it, including GenerateBlocks Pro's Asset Library shapes) and **Upload or paste** (an .svg file or SVG code). The solid parts of the shape show the image; empty parts are see-through.
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
- **Light**: a ~3.7 KB script (1.6 KB gzipped) and ~750 bytes of CSS, only on pages with an animated block. The CSS goes in `<head>` when the viewed post uses an animation or a block theme rendered one first; otherwise just before the first animated block.
- **Robust**: reveals as soon as any part of a block is in view; content added later is picked up automatically; after the script loads only watched blocks are hidden; long "one by one" groups are capped at 1.2 s; hidden children don't take a turn. Animated blocks inside Marquee copies show as already animated.
- **No flash, no lost content**: blocks are only hidden with JavaScript running, on screen (never in print), and without reduced motion; a fail-safe shows everything after 4 s if the script is blocked or delayed.
- **Developer API**: `window.tmbAnimate.init( root )`, filters `thingamablocks_animation_head_markup` and `thingamablocks_animations_print_css`, CSS hooks `.tmb-in`, `html.tmb-animate-js` and `html.tmb-animate-ready`.

#### Development

- Built with `@wordpress/scripts`; `webpack.config.js` adds the `src/animations/` entries.
- `npm run playground` (local WordPress Playground with GenerateBlocks, GeneratePress and a demo page) and `npm run zip`.
- Linting and formatting: `npm run lint` (`lint:js`, `lint:css`), `npm run format`, and `composer run lint:php` (PHPCS with WordPress-Extra, WordPress-Docs and PHPCompatibilityWP for PHP 7.4+, in `phpcs.xml.dist`). `.editorconfig`, `.nvmrc`.
- GitHub Actions CI: JS/CSS lint, build and zip, PHP 7.4 and 8.4 syntax check, PHPCS, and WordPress Plugin Check.
