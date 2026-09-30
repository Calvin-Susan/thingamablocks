# Toggle for GenerateBlocks

A Toggle block for [GenerateBlocks](https://wordpress.org/plugins/generateblocks/) 2.x, by [OGAL Web Design](https://ogalweb.com) (Kyle Van Deusen).

The block (`ogal/toggle`) sits in the GenerateBlocks category of the inserter. Like the Accordion and Tabs blocks in GenerateBlocks Pro, the Toggle itself is a settings-only wrapper: everything you see is a real GenerateBlocks Element, Text or Shape block. You style it in the GB Styles panel, with global styles, the same way as the rest of the page.

A toggle can:

- **Show / hide elements** – e.g. monthly vs. annual pricing.
- **Switch light / dark mode** – with a dark version of each theme colour picked in the sidebar, remembered per visitor, no flash on load.
- **Add / remove classes** on any elements.
- **Do nothing** – just hold an on/off state for your own code.

**Requirements:** WordPress 6.5+, PHP 7.4+, GenerateBlocks 2.0+. Tested with GenerateBlocks 2.4.1 (free). Not yet tested with GenerateBlocks Pro.

---

## Contents

- [Install](#install)
- [Quick start](#quick-start)
  - [Fastest: the pricing pattern](#fastest-the-pricing-pattern)
  - [Monthly / annual pricing](#recipe-monthly--annual-pricing)
  - [Dark mode](#recipe-dark-mode)
  - [Toggle a class (show a banner)](#recipe-toggle-a-class-show-a-banner)
- [How parts and styling work](#how-parts-and-styling-work)
- [Settings reference](#settings-reference)
- [Developer API](#developer-api)
- [How it's built](#how-its-built)
- [Development](#development)
- [File map](#file-map)

---

## Install

1. Install and activate GenerateBlocks 2.0 or newer. (The plugin header declares `Requires Plugins: generateblocks`, so WordPress won't activate the Toggle without it. If GB is later deactivated or is a 1.x version, an admin notice says so.)
2. Upload `toggle-for-generateblocks.zip` under **Plugins → Add New → Upload Plugin** and activate it.
   To build the zip yourself, see [Development](#development).
3. In the block editor, open the inserter. **Toggle** is in the GenerateBlocks category.

---

## Quick start

When you insert a Toggle you're asked to pick a starting layout:

| Layout | What you get | Default action |
| --- | --- | --- |
| **Switch with labels** | "Monthly" text · switch · "Annual" text | Show / hide |
| **Segmented buttons** | Two `<button>`s side by side, active one highlighted | Show / hide |
| **Switch** | Just the switch (give it a label under Accessibility) | Show / hide |
| **Dark mode switch** | Switch with a sun/moon icon in the knob, label "Dark mode" | Light / dark mode |

The layouts use the GeneratePress global colour variables (`--accent`, `--base`, `--base-2`, `--base-3`, `--contrast`, `--contrast-2`, `--contrast-3`) with fallback colours for other themes, so they pick up your GP colours straight away.

> **In the editor, clicking the switch doesn't flip it.** Clicking selects blocks so you can edit them. To see the other state, use the **On/Off** button in the Toggle's block toolbar. The actual toggling happens on the front end.

### Fastest: the pricing pattern

The plugin registers a block pattern, **Pricing table with monthly/annual toggle**, in a **Toggles** pattern category (only while GenerateBlocks is active).

1. Open the inserter → **Patterns** tab → **Toggles**.
2. Insert **Pricing table with monthly/annual toggle**: a heading, a segmented Monthly / Annual toggle, and three plans (Starter, Pro, Business) in two versions.
3. It's already wired up: the monthly plans are in an Element with ID `pricing-monthly`, the annual plans in one with ID `pricing-annual`, and the toggle shows one or the other. Its sync group is `billing`, so a second toggle with the same group (say, at the bottom of the page) stays in step.
4. Edit the text and prices, restyle with the GB Styles panel, and publish.

Like all patterns, once inserted it's ordinary blocks – nothing links back to the pattern. The recipe below builds the same thing from scratch.

### Recipe: monthly / annual pricing

1. **Build both price sets.** Make two GenerateBlocks Element blocks, one holding the monthly prices and one holding the annual prices. They can sit anywhere on the page.
2. **Give each an ID.** Select the monthly Element → Settings → **HTML Attributes** → add attribute `id` with value `monthly-prices`. Do the same for the annual one with `annual-prices`.
3. **Insert a Toggle** above the pricing and choose **Switch with labels** (or **Segmented buttons**). Edit the label text if you like.
4. **Select the Toggle block itself** (use the breadcrumb or List View if a child block is selected) and open **Toggle behaviour**:
   - When toggled: **Show / hide elements**
   - Show when off: `monthly-prices`
   - Show when on: `annual-prices`
   - Reveal animation: Fade (or None / Fade and slide up)

   The target fields suggest every ID on the page as you type. If an ID can't be found on the page you'll see a warning (that's fine if the element lives in a header, footer or other template part).
5. **State** panel: leave **Starts as** on *Off* so visitors see monthly first, or set *On* to lead with annual. Tick **Remember the visitor's choice** if you want it to stick between visits.
6. Save and view the page. Monthly shows; flip the switch and annual fades in.

In the editor both sets stay visible so you can edit them. While the Toggle (or anything inside it) is selected, the set that's hidden in the current preview state is dimmed with a dashed outline. Flip the toolbar **On/Off** button to see the other set dimmed instead.

On the front end the hidden set is hidden by a small inline `<style>` from the server, so visitors never see both sets flash on load.

**Two toggles for one table** (e.g. one above and one below): give both the same **Sync group** name, like `billing`. They stay in step. Each toggle in a group still runs its own action, so two grouped toggles can also each control a different section.

### Recipe: dark mode

1. Insert a Toggle and choose **Dark mode switch**. Put it wherever you want – most sites put it in the header, via a GeneratePress Element (Block – Site Header, Hook, etc.) or a template part.
2. Check the settings (already set by the layout):
   - When toggled: **Light / dark mode**
   - **Match the visitor's system setting**: on by default. Until the visitor uses the switch, they get dark mode if their device is set to dark.
   - **Also add a class to `<html>`**: optional, e.g. `is-dark`, if other CSS needs a class.
   - **Accessibility → Switch label**: "Dark mode" (already filled in).
3. **Pick the dark colours.** Open the **Dark mode colours** panel. It lists your theme's colours (the GeneratePress global colours, or a block theme's palette), each with a "… in dark mode" colour picker.
   - Click **Suggest dark colours** to fill them all in: light backgrounds become dark, dark text becomes light (keeping the order of Base / Base 2 / Base 3 and so on), and brand colours keep their hue but get lighter so they stay readable.
   - Adjust any colour by hand. Leave one empty to keep it the same in dark mode. **Clear** empties them all.
   - To preview, set **State → Starts as** to *On* (or use the toolbar **On/Off** button): the editor then shows the page in its dark colours. Set it back to *Off* before publishing unless you want dark to be the default.
4. **Publish** the post, page or Element that contains the switch. From then on every page on the site gets the dark colours and the no-flash `<head>` script (see [How it's built](#the-dark-mode-head-output)).

Anything styled with your theme's colours (including GenerateBlocks blocks that use them) switches automatically. The toggle also sets the CSS `color-scheme` property on `<html>`, so browser-drawn things (form controls, scrollbars) follow along. All dark mode toggles on a site share one state, and the choice is always remembered.

**Other elements (advanced).** Images, logos, or anything with a hard-coded colour won't change on their own. Style them with the `data-color-scheme` attribute the toggle sets on `<html>`, e.g. in **Appearance → Customize → Additional CSS**:

```css
[data-color-scheme="dark"] .site-logo img {
	filter: invert(1);
}
```

You can also skip the panel entirely and override the variables yourself:

```css
[data-color-scheme="dark"] {
	--base: #2a2a30;       /* borders, subtle backgrounds */
	--base-2: #1f1f24;     /* alternate section backgrounds */
	--base-3: #16161a;     /* main background */
	--contrast: #f2f2f5;   /* main text */
	--contrast-2: #c4c4cc; /* secondary text */
	--contrast-3: #6e6e78; /* muted text, switch track */
	--accent: #6ab0f3;     /* links, buttons, the "on" switch */
}
```

### Recipe: toggle a class (show a banner)

Example: a "Show promo" switch that reveals a banner.

1. Make the banner: a GenerateBlocks Element with ID `promo-banner` (Settings → HTML Attributes → `id`).
2. In the banner's **Styles**, set **Display: none**. Then add a nested selector `&.is-visible` and set **Display: block** (or flex) inside it.
3. Insert a Toggle (**Switch with labels** or **Switch**), select it, and set:
   - When toggled: **Add / remove a class**
   - Elements: `promo-banner`
   - Class names: `is-visible`
   - The class is: **Added when on**
4. Change the labels to something sensible, or set **Accessibility → Switch label**.

"Elements" takes IDs, tag names or any CSS selector (`body`, `.card`, `#site-header`), and you can list several classes separated by spaces. **Removed when on** does the opposite: the class is present while the toggle is off.

---

## How parts and styling work

### Parts

A Toggle only reacts to clicks on blocks marked as **parts**. Select any GenerateBlocks block inside a Toggle (Element, Text, Shape or Media) and you'll get a **Toggle part** panel with one setting, *Clicking this block*:

| Option | `data-toggle-part` value | What it does |
| --- | --- | --- |
| Does nothing (decoration) | *(none)* | Nothing |
| Flips the toggle (switch) | `switch` | Flips on ↔ off |
| Turns it off | `off` | Sets the state to off |
| Turns it on | `on` | Sets the state to on |

The value is stored as a `data-toggle-part` HTML attribute on the block, in the same place GenerateBlocks keeps its own HTML attributes – so you can also see and edit it in GB's HTML Attributes panel.

When the page renders, the server adds these attributes to the parts:

| Part | Attributes |
| --- | --- |
| Switch | `role="switch"`, `aria-checked`, `aria-controls`, `aria-label` (from the Switch label setting); `type="button"` on a `<button>`, otherwise `tabindex="0"` |
| On/off part that's a `<button>` | `data-active`, `aria-pressed`, `type="button"`, `aria-controls` |
| On/off part, not a button, in a toggle **without** a switch | `data-active`, `role="button"`, `tabindex="0"`, `aria-pressed`, `aria-controls` – the parts are the controls, so they work from the keyboard |
| On/off part, not a button, **next to** a switch | `data-active` only – plain-text labels like "Monthly" / "Annual" are a mouse convenience; the switch is the control |

Every processed part also gets `data-toggle-owned`, so an outer toggle leaves the parts of a toggle nested inside it alone. A part built as a link (`<a>`) won't navigate when clicked.

The Toggle's sidebar has a **Toggle parts** summary counting each kind. If nothing inside is clickable yet, a warning appears at the top of the sidebar instead.

### Styling each state

Style parts with GenerateBlocks **nested selectors** on the part itself (in the Styles panel, the "&" selector options):

| What | Nested selector | Set it on |
| --- | --- | --- |
| Switch in the on state | `&[aria-checked="true"]` | the switch |
| Knob inside the switch | `&[aria-checked="true"] > *` | the switch – the layouts set `margin-inline-start: 1.5rem`, which slides the right way on RTL sites too |
| Active on/off label or button | `&[data-active="true"]` | the label or button |
| Anything, based on the whole toggle | `.ogal-toggle.is-on …` | global CSS (the wrapper has `is-on` or `is-off`) |

The starting layouts already use these – open the switch block's Styles to see a working example. The dark mode switch also swaps its sun/moon icons with `&[aria-checked="true"] .gb-shape:first-child` / `:last-child` on the switch.

**The editor previews the starting state.** Use the **On/Off** toolbar button (or **State → Starts as**) to preview the other state while you style it. That button also changes which state visitors start in, so set it back when you're done.

The plugin's own CSS is deliberately tiny: a pointer cursor on parts (front end only, so parts stay editable in the editor), the hidden class, and a reduced-motion rule that switches off transitions and animations inside a toggle.

---

## Settings reference

Select the Toggle block (the wrapper) to see these in the sidebar.

### Toggle behaviour

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| When toggled | `action` | `showHide` | `showHide`, `colorScheme`, `toggleClass`, `none` |

**Targets** (Show when off / on, Elements): a bare word is an element ID if the page has one with that name, otherwise it's used as a tag name – so `body` and `html` work. Anything else (`.card`, `#site-header`, `[data-plan="annual"]`) is a CSS selector. A leading `#` on a plain ID is dropped when saved.

**Show / hide elements**

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Show when off | `showWhenOff` | `[]` | Hidden while the toggle is on. |
| Show when on | `showWhenOn` | `[]` | Hidden while the toggle is off. An element listed on both sides stays visible. |
| Reveal animation | `animation` | `fade` | `none`, `fade`, `slide` (fade and slide up). Not played on page load or for reduced-motion visitors. |

**Light / dark mode**

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Match the visitor's system setting | `followSystem` | `true` | Uses `prefers-color-scheme` until the visitor chooses. Also follows live OS changes while they haven't chosen. |
| Also add a class to `<html>` | `htmlClass` | `""` | Optional, space-separated. |
| Dark mode colours | `darkPalette` | `{}` | Map of CSS variable → dark colour, e.g. `{ "--base-3": "#16161a" }`. Saved as hex. Only shown when the theme provides a colour palette. |

A colour-scheme toggle always remembers the choice and always shares one state with every other colour-scheme toggle (its group is `color-scheme`), so the Remember / Sync group settings are hidden for it.

**Add / remove a class**

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Elements | `classTargets` | `[]` | See Targets above |
| Class names | `classNames` | `""` | Space-separated |
| The class is | `classMode` | `addWhenOn` | `addWhenOn` or `removeWhenOn` |

**Nothing (custom code)** – no extra settings. The toggle changes its own state, classes and ARIA attributes and fires its event.

### State

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Starts as | `defaultState` | `off` | The editor previews this state. The toolbar On/Off button flips it. |
| Remember the visitor's choice | `persist` | `false` | Saved in `localStorage` (see [Storage keys](#storage-keys)). |
| Sync group | `group` | `""` | Toggles with the same name stay in step; each still runs its own action. Normalised to lowercase `a-z`, `0-9`, `-`, `_`. `color-scheme` is reserved for dark mode. |

How the starting state is picked on the front end, first match wins:

1. A saved choice from any toggle in the same group that has "Remember" on.
2. For dark mode: the scheme the `<head>` script already applied, or the system setting.
3. **Starts as**.

A toggle added to the page later (see `window.ogalToggle.init`) follows its group if the group is already running.

### Accessibility

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Switch label | `ariaLabel` | `""` | Added as `aria-label` on each switch part, and on a segmented control's `role="group"` wrapper (unless they already have one). If empty and the switch has no text, the "on" label is used via `aria-labelledby`. The panel opens with a warning when a switch has neither. |

### Also supported

- **Advanced → HTML anchor** – printed as the wrapper's `id`. Useful for `window.ogalToggle`, and it gives "Remember" a stable key.
- **Advanced → Additional CSS class(es)**.
- **Margin** (block spacing support).

### Accessibility behaviour

- Roles and state attributes are added on the server when the page renders, so they're correct before any JavaScript runs and can't be removed by accident in the editor.
- `aria-controls` lists the targets given as plain IDs (tag names and other selectors can't be referenced that way).
- Parts with `tabindex="0"` respond to Space and Enter; native buttons handle keys themselves.
- Transitions and animations are switched off for visitors with `prefers-reduced-motion: reduce`.

---

## Developer API

### The `ogal-toggle:change` event

Fired on the toggle's wrapper (`.ogal-toggle`) whenever its state is set, including once on page load. It bubbles, so you can listen on `document`:

```js
document.addEventListener( 'ogal-toggle:change', ( event ) => {
	const { state, isOn, group, action, initial, toggle } = event.detail;

	if ( 'billing' === group && ! initial ) {
		console.log( 'Billing switched to', isOn ? 'annual' : 'monthly' );
	}
} );
```

| `event.detail` field | Type | Meaning |
| --- | --- | --- |
| `state` | `'on'` \| `'off'` | New state |
| `isOn` | boolean | Same, as a boolean |
| `group` | string | Sync group (`'color-scheme'` for dark mode toggles; `''` if none) |
| `action` | string | `showHide`, `colorScheme`, `toggleClass` or `none` |
| `initial` | boolean | `true` for the first run on page load |
| `toggle` | Element | The `.ogal-toggle` wrapper that changed |

For a sync group the event fires once, on the toggle that was used; the other toggles in the group are updated (and run their actions) but don't fire their own event.

### `window.ogalToggle`

```js
window.ogalToggle.get( 'billing' );             // true, false, or undefined if not found
window.ogalToggle.set( 'billing', true );       // turn on
window.ogalToggle.set( 'color-scheme', false ); // light mode
window.ogalToggle.init( container );            // set up toggles added later, e.g. by AJAX
```

- `get` / `set` take a toggle's **Sync group** name or its wrapper `id`. The `id` is the HTML anchor if you set one; otherwise it's `ogal-toggle-1`, `ogal-toggle-2`… in page order, which changes if you add toggles, so use a group or an anchor for anything you rely on. `set()` counts as a visitor's choice: it's remembered if "Remember" is on.
- `init( root )` sets up every toggle inside `root` (default `document`) that isn't set up yet. Toggles already set up are skipped, so calling it more than once is safe.

### CSS hooks

- `.ogal-toggle` – the wrapper, with `.is-on` or `.is-off`.
- `[data-toggle-part="switch|on|off"]` – the parts, with `aria-checked` / `data-active` / `aria-pressed` as described above; `[data-toggle-owned]` once a toggle has claimed them.
- `html[data-color-scheme="dark|light"]` – set by dark mode toggles.
- `.ogal-toggle-hidden` – on elements hidden by a show/hide toggle (together with an inline `display: none !important`).
- `.ogal-toggle-enter-fade`, `.ogal-toggle-enter-slide` – on an element while its reveal animation runs.

### PHP

- Filter `ogal_toggle_print_color_scheme_script` – return `false` to stop printing the dark mode `<head>` output (both the script and the dark colours).
- Option `ogal_toggle_color_scheme` – the dark mode settings per post ID (`followSystem`, `htmlClass`, `palette`, `modified`).

### Storage keys

`localStorage` keys start with `ogal-toggle:`, followed by the toggle's sync group, else its HTML anchor, else the page path and the toggle's position on the page (e.g. `ogal-toggle:/pricing/#0`). Dark mode uses `ogal-toggle:color-scheme`.

---

## How it's built

For Kyle, and anyone new to block plugins.

### Why a wrapper around GenerateBlocks blocks

A block plugin could draw its own switch and give you a set of colour and size controls. That would mean a second styling system next to GenerateBlocks, and it would never quite match. Instead the Toggle follows the pattern GB Pro uses for Accordion and Tabs:

- The **Toggle block** (`ogal/toggle`) has no visual settings. It holds behaviour: what happens when toggled, the starting state, the sync group, the accessibility label, the dark mode colours.
- Its **inner blocks** are normal GenerateBlocks blocks. The starting layouts (`src/toggle/templates.js`) are just block templates with GB styles pre-filled. Once inserted, they're yours to edit like any other GB block.
- A block becomes clickable by being marked as a **part** (`data-toggle-part="switch|on|off"`), stored in GB's own `htmlAttributes`. The plugin adds the "Toggle part" panel to GB blocks with a standard WordPress editor filter (`editor.BlockEdit`), so nothing about GB itself is modified.

GenerateBlocks exposes some editor globals (`window.gb.*`). This plugin doesn't use them; everything goes through standard WordPress block APIs and GB's saved block attributes, so it doesn't depend on GB internals that could change.

### What's saved vs. what's rendered

- In the post content, the Toggle saves only its inner blocks (`save` returns `<InnerBlocks.Content />`) plus its settings as block attributes.
- On the front end, PHP (`includes/class-render.php`) renders the wrapper `<div class="ogal-toggle is-off" data-ogal-toggle="{…config…}">` (plus the anchor as `id`), and walks the inner HTML with WordPress's `WP_HTML_Tag_Processor` to add the roles and state attributes to the parts. Settings are sanitised there: selectors lose characters like `<{};\` and CSS comments, class names go through `sanitize_html_class`, group names are normalised.
- For show/hide, PHP also prints a tiny `<style class="ogal-toggle-initial">` that hides whichever targets start hidden, so there's no flash of both. The front-end script removes it once it's taken over.
- The front-end script (`src/toggle/view.js`, loaded only on pages with a Toggle) reads the config, restores any saved choice, and handles clicks, keys, sync groups, the event and `window.ogalToggle`. Hiding sets an inline `display: none !important` as well as the class, and reveal animations use the Web Animations API rather than CSS keyframes, so "remove unused CSS" optimisations can't break them.
- In the editor (`src/toggle/edit.js`), the Toggle keeps its parts' `aria-checked` / `data-active` in step with **Starts as**, so the canvas shows the state you're styling; previews the dark colours when a dark mode toggle is set to *On*; and dims show/hide targets that are hidden in the current state.

### The dark mode head output

Dark mode needs to be applied before the page paints, or visitors who chose dark see a white flash on every page load. `includes/color-scheme.php` handles this:

- When a post (including GeneratePress Elements and template parts) is saved, the plugin records whether it's **published** and contains a dark mode toggle, and if so that toggle's settings and dark colours. Each post is tracked separately.
- While at least one such post exists, every front-end page gets, at the top of `<head>`:
  - `<style id="ogal-toggle-dark-palette">:root[data-color-scheme="dark"]{--base-3:…}</style>` with the dark colours, and
  - a small inline script that reads the saved choice (or the system setting) and sets `data-color-scheme` on `<html>` straight away.
- If several posts have a dark mode toggle, the most recently saved one's settings are used.
- Removing the toggle from the post, unpublishing it, trashing or deleting it switches the head output off again (once no other post has one).

---

## Development

```bash
npm install          # once
npm start            # watch src/ and rebuild into build/ while you work
npm run build        # production build into build/
npm run zip          # build, then create dist/toggle-for-generateblocks.zip
npm run playground   # local WordPress at http://127.0.0.1:9400
npm run playground:reset  # same, starting from a fresh site
```

- Built with `@wordpress/scripts` (`wp-scripts`), the standard WordPress build tool. It compiles `src/toggle/` into `build/toggle/`. WordPress loads the block from `build/toggle/block.json`, so **the plugin does nothing until you've built it** – `build/` is git-ignored.
- `npm run playground` starts [WordPress Playground](https://wordpress.github.io/wordpress-playground/) locally with this folder mounted as the plugin. The blueprint (`playground/blueprint.json`) installs and activates GenerateBlocks (latest from wordpress.org) and GeneratePress, activates this plugin, turns on pretty permalinks, and creates a **Toggle Test** page. You're logged in as admin. Run `npm start` in another terminal so edits rebuild; refresh the editor to pick them up.
- `npm run zip` produces `dist/toggle-for-generateblocks.zip` with a single `toggle-for-generateblocks/` folder containing only the runtime files: `toggle-for-generateblocks.php`, `readme.txt`, `includes/`, `patterns/`, `build/` (and `LICENSE` if present). It uses the system `zip` command and fails with a clear message if `build/` is missing.

---

## File map

```
toggle-for-generateblocks.php   Plugin header, block registration, GB category fallback, "needs GB 2.0" notice
includes/
  class-render.php              Front-end render: wrapper, config sanitising, ARIA on parts, no-flash show/hide CSS
  color-scheme.php              Dark mode: tracks settings per post, prints the dark colours and no-flash <head> script
  patterns.php                  Registers the "Toggles" pattern category and the patterns in patterns/
patterns/
  pricing-toggle.html           "Pricing table with monthly/annual toggle" pattern (plain block markup)
src/toggle/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations and inserter example
  edit.js                       Editor UI: layout picker, sidebar settings, toolbar On/Off, part state sync, previews
  dark-palette.js               "Dark mode colours" panel and the colour suggestions
  parts.js                      "Toggle part" panel added to GB Element/Text/Shape/Media blocks
  targets-control.js            ID/selector picker with page-ID suggestions and "not found" warnings
  templates.js                  The four starting layouts (block variations) built from GB blocks
  view.js                       Front-end behaviour, ogal-toggle:change event, window.ogalToggle
  icon.js                       Block icon
  style.scss                    Minimal front-end + editor CSS (cursor, hidden class, reduced motion)
  editor.scss                   Sidebar helper styles
build/                          Compiled output (git-ignored; created by npm run build)
playground/blueprint.json       WordPress Playground setup for npm run playground
scripts/zip.mjs                 Packages dist/toggle-for-generateblocks.zip
readme.txt                      wordpress.org plugin readme
CHANGELOG.md                    Release notes
```
