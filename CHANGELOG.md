# Changelog

All notable changes to Toggle for GenerateBlocks are listed here.

## Unreleased

### Added

- **Countdown block** (`ogal/countdown`) in the GenerateBlocks inserter category. A settings-only wrapper like the Toggle: the numbers, labels, boxes and ended message are GenerateBlocks Element, Text and Shape blocks.
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
- **Developer API**: `ogal-countdown:end` and `ogal-countdown:restart` events, `window.ogalCountdown.init()` and `.reset()`.
- **Patterns**: "Sale banner with countdown" (the banner, ID `sale-banner`, hides itself when the sale ends) and "Launch countdown", in a new "Countdowns" pattern category.
- **Shared code** for both blocks: `Ogal_Blocks_Sanitize` (`includes/class-sanitize.php`) and `src/shared/` (target picker, layout picker, editor canvas styles, GenerateBlocks helpers).

### Changed

- Countdown hardening: a malformed redirect URL no longer stops other countdowns; redirects compare paths ignoring trailing slashes; evergreen countdowns work when the browser blocks storage; countdowns with no date stop ticking; nested countdowns keep their own parts; the server hides empty units too; the ended message is announced to screen readers; "Disappears" works with block margins on WordPress before 7.0; numbers keep a Text block's icon; times skipped by a daylight-saving change resolve like PHP (moved forward).
- Target selectors: anything inside quotes is allowed except `<`, `\` and line breaks (e.g. `a[href="/pricing"]`), and IDs may use non-ASCII letters.
- Toggle targets: a bare word is always an element ID, except `html`, `body`, `main`, `header`, `footer`, `nav`, `aside`, `article`, `section`, which mean the tag unless an element has that ID. Every element with a duplicated ID is switched.
- Target selectors are only kept if they use plain, balanced selector characters; the editor flags ones that will be ignored.
- Remembered toggle choices use namespaced keys (`ogal-toggle:group:…`, `ogal-toggle:id:…`, `ogal-toggle:path:…`).
- Only users with `edit_theme_options` update the site-wide dark mode colours and `<html>` class when they save.

## 0.1.0 – Initial release

### Added

- **Toggle block** (`ogal/toggle`) in the GenerateBlocks inserter category. A settings-only wrapper whose visible parts are GenerateBlocks Element, Text and Shape blocks, styled in the GB Styles panel.
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
- **Developer API**: `ogal-toggle:change` event, `window.ogalToggle.get()` / `.set()` / `.init()`, `ogal_toggle_print_color_scheme_script` filter.
- **Pattern**: "Pricing table with monthly/annual toggle" in a new "Toggles" pattern category.
- Target picker that suggests the page's element IDs and flags IDs it can't find.
- Admin notice when GenerateBlocks 2.0+ isn't active.
