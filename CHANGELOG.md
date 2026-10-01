# Changelog

All notable changes to Thingamablocks are listed here.

## Unreleased

### Added

- **Countdown block** (`thingamablocks/countdown`) in the GenerateBlocks inserter category. A settings-only wrapper like the Toggle: the numbers, labels, boxes and ended message are GenerateBlocks Element, Text and Shape blocks.
- **Starting layouts**: Boxes, Inline text ("Ends in 2d 5h 12m 9s"; two-digit numbers off and hide-zero units on by default), Large numbers (with colons).
- **Countdown part** panel on GenerateBlocks Element, Text and Shape blocks inside a countdown: Days/Hours/Minutes/Seconds number, unit box, Timer (hidden when it ends), Ended message, Separator (`aria-hidden`). Stored as `data-countdown-part` / `data-countdown-unit` in the block's HTML attributes.
- **Modes**:
  - A date and time, in the site's time zone (Settings → General). New countdowns default to a week out at 23:59.
  - A deadline per visitor (evergreen): days/hours/minutes from the first view, remembered in `localStorage` (keyed by HTML anchor, else page path and position), optionally starting again when it ends.
  - A time that repeats: a time of day on chosen weekdays, rolling over to the next one. Handles daylight saving and fixed UTC offsets.
- **Display**: two-digit numbers; hide leading units that reach zero (keeps the last two, and hides the separator after a hidden unit). Deleting a unit's box makes the next unit absorb its time (48 hours instead of 2 days).
- **When it ends**: show the ended message, stay at zero, or disappear; also hide / also show elements by ID or selector (no flash on load); optional redirect, never to the same page.
- **Server rendering**: the real numbers and the ended state are written into the page in PHP, so it's correct before JavaScript runs and cached pages correct themselves on load.
- **Editor**: Running/Ended preview toolbar button, warnings for no number parts or no ended message, "Ends in …" / "Next: …" hints, List View label ("Countdown · Date / Evergreen / Recurring").
- **Developer API**: `tmb-countdown:end` and `tmb-countdown:restart` events, `window.tmbCountdown.init()` and `.reset()`.
- **Patterns**: "Sale banner with countdown" (the banner, ID `sale-banner`, hides itself when the sale ends) and "Launch countdown", in a new "Countdowns" pattern category.
- **Marquee block** (`thingamablocks/marquee`) in the GenerateBlocks inserter category. A settings-only wrapper like the others: the scrolling row, its contents and the pause button are GenerateBlocks Element, Text, Shape and Media blocks.
  - **Starting layouts**: Logo strip, Message ticker, Big scrolling headline, Vertical quotes, each with a pause button.
  - **Marquee part** panel: "The row that scrolls" (`data-marquee-part="items"`) and "Pause button" (`data-marquee-part="pause"`), stored in the block's HTML attributes.
  - **Settings**: speed in px/s, direction (left/right/up/down), height for up/down, pause on hover (and on keyboard focus), faded edges with a fade width, an accessible label (`role="region"`). Editor **Preview** toolbar button; List View label "Marquee · Left/Right/Up/Down".
  - **Front end**: copies the row just enough to fill the space and loops it with the Web Animations API, gap matched at the seam, re-measured on resize without jumping, paused off screen, RTL aware. Clipping, fade and height are server-rendered inline styles.
  - **Accessibility**: copies are `aria-hidden`, `inert` and taken out of the tab order; the pause button gets its role, `aria-pressed` and a default label on the server, with a sidebar warning if it's missing (WCAG 2.2.2); reduced motion gives a still, scrollable row.
  - **Developer API**: `window.tmbMarquee.init()` and `.pause( elementOrAnchor, pause? )`; `.tmb-marquee.is-paused` for styling.
  - **Pattern**: "Logo strip: Trusted by…" (a small heading above a logo marquee), in a new "Marquees" pattern category. Also on the Playground demo page.
- **Shared code** for all blocks: `Thingamablocks_Sanitize` (`includes/class-sanitize.php`) and `src/shared/` (target picker, layout picker, editor canvas styles, GenerateBlocks helpers).

### Changed

- Countdown hardening: a malformed redirect URL no longer stops other countdowns; redirects compare paths ignoring trailing slashes; evergreen countdowns work when the browser blocks storage; countdowns with no date stop ticking; nested countdowns keep their own parts; the server hides empty units too; the ended message is announced to screen readers; "Disappears" works with block margins on WordPress before 7.0; numbers keep a Text block's icon; times skipped by a daylight-saving change resolve like PHP (moved forward).
- Target selectors: anything inside quotes is allowed except `<`, `\` and line breaks (e.g. `a[href="/pricing"]`), and IDs may use non-ASCII letters.
- Toggle targets: a bare word is always an element ID, except `html`, `body`, `main`, `header`, `footer`, `nav`, `aside`, `article`, `section`, which mean the tag unless an element has that ID. Every element with a duplicated ID is switched.
- Target selectors are only kept if they use plain, balanced selector characters; the editor flags ones that will be ignored.
- Remembered toggle choices use namespaced keys (`tmb-toggle:group:…`, `tmb-toggle:id:…`, `tmb-toggle:path:…`).
- Only users with `edit_theme_options` update the site-wide dark mode colours and `<html>` class when they save.

## 0.1.0 – Initial release

### Added

- **Toggle block** (`thingamablocks/toggle`) in the GenerateBlocks inserter category. A settings-only wrapper whose visible parts are GenerateBlocks Element, Text and Shape blocks, styled in the GB Styles panel.
- **Starting layouts** (block variations): Switch with labels, Segmented buttons, Switch, Dark mode switch. Colours use the GeneratePress global colour variables with fallbacks; the knob moves with `margin-inline-start`, so it works on RTL sites.
- **Toggle part** panel on GenerateBlocks Element, Text, Shape and Media blocks inside a toggle: flips the toggle (switch), turns it off, turns it on, or decoration. Stored as `data-toggle-part` in the block's HTML attributes; processed parts get `data-toggle-owned` so nested toggles stay separate.
- **Actions**:
  - Show / hide elements by ID, tag name or CSS selector, with fade or fade-and-slide reveal (Web Animations API), no flash of hidden elements on load, and an inline `display: none !important` that survives "remove unused CSS" optimisers. The editor dims targets hidden in the current preview state.
  - Light / dark mode: sets `data-color-scheme` and `color-scheme` on `<html>`, optional `<html>` class, follows the system setting, remembers the choice, and a no-flash `<head>` script.
  - Dark mode colours panel: a dark version of each theme colour (GeneratePress global colours or block theme presets), with "Suggest dark colours" and "Clear". Printed site-wide under `:root[data-color-scheme="dark"]`, previewed in the editor when the toggle starts "On". Tracked per published post, so removing the toggle or trashing the post switches it off.
  - Add / remove classes on target elements.
  - Nothing (custom code).
- **State options**: starts off/on (previewed in the editor, with an On/Off toolbar button), remember the visitor's choice (`localStorage`, keyed by group, anchor, or page path and position), sync group (every member runs its own action; `color-scheme` is reserved).
- **HTML anchor** support on the Toggle wrapper.
- **Accessibility**: server-rendered `role="switch"` / `aria-checked`, `aria-pressed` on segmented buttons, `role="button"` and keyboard focus for on/off parts in toggles without a switch, `data-active` on on/off parts, `aria-controls`, switch label setting (also names a segmented group) with fallback to the "on" label, keyboard support, reduced-motion support.
- **Developer API**: `tmb-toggle:change` event, `window.tmbToggle.get()` / `.set()` / `.init()`, `thingamablocks_print_color_scheme_script` filter.
- **Pattern**: "Pricing table with monthly/annual toggle" in a new "Toggles" pattern category.
- Target picker that suggests the page's element IDs and flags IDs it can't find.
- Admin notice when GenerateBlocks 2.0+ isn't active.
