# Changelog

All notable changes to Toggle for GenerateBlocks are listed here.

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
