# Changelog

All notable changes to Toggle for GenerateBlocks are listed here.

## 0.1.0 – Initial release

### Added

- **Toggle block** (`ogal/toggle`) in the GenerateBlocks inserter category. A settings-only wrapper whose visible parts are GenerateBlocks Element, Text and Shape blocks, styled in the GB Styles panel.
- **Starting layouts** (block variations): Switch with labels, Segmented buttons, Switch, Dark mode switch. Colours use the GeneratePress global colour variables with fallbacks.
- **Toggle part** panel on GenerateBlocks Element, Text, Shape and Media blocks inside a toggle: flips the toggle (switch), turns it off, turns it on, or decoration. Stored as `data-toggle` in the block's HTML attributes.
- **Actions**:
  - Show / hide elements by ID or CSS selector, with fade or fade-and-slide reveal, and no flash of hidden elements on load.
  - Light / dark mode: sets `data-color-scheme` and `color-scheme` on `<html>`, optional `<html>` class, follows the system setting, remembers the choice, and a no-flash `<head>` script.
  - Add / remove classes on target elements.
  - Nothing (custom code).
- **State options**: starts off/on (previewed in the editor, with an On/Off toolbar button), remember the visitor's choice (`localStorage`), sync group.
- **Accessibility**: server-rendered `role="switch"` / `aria-checked`, `aria-pressed` on segmented buttons, `data-active` on on/off parts, `aria-controls`, switch label setting with fallback to the "on" label, keyboard support, reduced-motion support.
- **Developer API**: `ogal-toggle:change` event, `window.ogalToggle.get()` / `.set()`, `ogal_toggle_print_color_scheme_script` filter.
- **Pattern**: "Pricing table with monthly/annual toggle" in a new "Toggles" pattern category.
- Target picker that suggests the page's element IDs and flags IDs it can't find.
- Admin notice when GenerateBlocks 2.0+ isn't active.
