=== Toggle for GenerateBlocks ===
Contributors: ogalweb
Tags: generateblocks, toggle, dark mode, pricing, switch
Requires at least: 6.5
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A Toggle block for GenerateBlocks 2.x, built from native GB blocks. Show/hide elements, switch light/dark mode, or toggle classes.

== Description ==

Toggle for GenerateBlocks adds a **Toggle** block to the GenerateBlocks category in the block inserter.

Like the Accordion and Tabs blocks in GenerateBlocks Pro, the Toggle itself is a settings-only wrapper. Everything you see (the switch, the knob, the labels, the buttons) is an ordinary GenerateBlocks Element, Text or Shape block. You style it with the GenerateBlocks Styles panel you already know, and global styles work as usual.

= Starting layouts =

When you insert a Toggle you pick one of four layouts. Each is fully editable afterwards.

* **Switch with labels** – "Monthly" / switch / "Annual".
* **Segmented buttons** – two buttons side by side; the active one is highlighted.
* **Switch** – just the switch.
* **Dark mode switch** – a switch with a sun/moon icon in the knob.

The layouts use the GeneratePress global colour variables (`--accent`, `--base-3`, `--contrast` and so on), with fallbacks for other themes.

= Ready-made pricing pattern =

In the inserter's Patterns tab, the **Toggles** category has a **Pricing table with monthly/annual toggle** pattern: a segmented Monthly / Annual toggle and three plans, already wired up (the plan sets have the IDs `pricing-monthly` and `pricing-annual`, and the toggle uses the sync group `billing`). Insert it, change the text and prices, and publish.

= What a toggle can do =

* **Show / hide elements** – list element IDs or CSS selectors to show when the toggle is off and when it's on. The classic example is monthly and annual pricing. Optional fade or fade-and-slide reveal.
* **Light / dark mode** – sets `data-color-scheme="dark"` or `"light"` (and the CSS `color-scheme` property) on `<html>`, optionally adds a class too. It can follow the visitor's system setting, remembers their choice, and a small script in `<head>` applies the saved choice before the page paints, so there's no flash of the wrong colours.
* **Add / remove a class** – add (or remove) one or more classes on any elements when the toggle is on.
* **Nothing (custom code)** – the toggle only changes its own state. Your code listens for the `ogal-toggle:change` event or uses `window.ogalToggle`.

= Toggle parts =

Select any GenerateBlocks block inside a Toggle and you'll see a **Toggle part** panel. Choose what clicking it does:

* Flips the toggle (a switch)
* Turns it off
* Turns it on
* Does nothing (decoration)

The choice is saved as a `data-toggle` HTML attribute on the block, so you can also see it in GenerateBlocks' HTML Attributes panel.

= Styling the "on" state =

Use GenerateBlocks nested selectors on the part itself:

* A switch: `&[aria-checked="true"]`
* The knob inside a switch (set on the switch): `&[aria-checked="true"] > *`
* An on/off label or button: `&[data-active="true"]`
* The whole toggle: `.ogal-toggle.is-on`

The editor shows the toggle in its starting state. Use the On/Off button in the block toolbar to switch the preview and style the other state.

= Accessibility =

* The switch gets `role="switch"` and `aria-checked` on the server, so the markup is right before any JavaScript runs.
* Segmented buttons get `aria-pressed`.
* `aria-controls` points at the elements the toggle controls (when they're referenced by ID).
* A "Switch label" setting for screen readers; if you leave it empty, the "on" label's text is used.
* Keyboard support: Space and Enter flip a switch that isn't a native button.
* Reveal animations and transitions are switched off for visitors who prefer reduced motion.

= Requirements =

* WordPress 6.5 or newer
* PHP 7.4 or newer
* GenerateBlocks 2.0 or newer (the free plugin is enough)

Tested with GenerateBlocks 2.4.1. Not yet tested with GenerateBlocks Pro.

== Installation ==

1. Install and activate GenerateBlocks 2.0 or newer.
2. Upload the `toggle-for-generateblocks` folder to `/wp-content/plugins/`, or upload the zip under Plugins → Add New → Upload Plugin.
3. Activate **Toggle for GenerateBlocks**.
4. In the block editor, open the inserter and find **Toggle** in the GenerateBlocks category, or the ready-made pricing table under Patterns → Toggles.

== Frequently Asked Questions ==

= Does it need GenerateBlocks Pro? =

No. It only needs the free GenerateBlocks plugin, version 2.0 or newer. It hasn't been tested with GenerateBlocks Pro yet.

= Why does nothing happen when I click the toggle in the editor? =

That's on purpose: in the editor, clicking selects blocks so you can edit them. To preview the other state, use the **On/Off** button in the Toggle's block toolbar (or the "Starts as" setting). The editor then shows that state so you can style it. The toggle works on the front end.

= How do I give an element an ID so the toggle can find it? =

Select the element (for example the Element block wrapping your monthly prices), open its Settings, and in **HTML Attributes** add an attribute named `id` with a value such as `monthly-prices`. Core blocks use **Advanced → HTML anchor** instead. The toggle's target fields suggest every ID on the page and warn you if one can't be found.

= Where do the dark mode colours come from? =

From your CSS. The toggle only sets `data-color-scheme="dark"` on `<html>`. With GeneratePress, override the global colour variables for dark mode, for example in Customizer → Additional CSS:

`[data-color-scheme="dark"] { --base: #2a2a30; --base-2: #1f1f24; --base-3: #16161a; --contrast: #f2f2f5; --contrast-2: #c4c4cc; --contrast-3: #6e6e78; --accent: #6ab0f3; }`

Anything styled with those variables switches automatically.

= Can I use two toggles for the same pricing table? =

Yes. Give both the same **Sync group** name (under State), for example `billing`. Flipping one flips the other.

= Does it work with page caching? =

Yes. The page HTML is the same for every visitor; each visitor's choice is stored in their own browser (localStorage) and applied by JavaScript. For dark mode, the inline `<head>` script reads that choice before the page paints, so cached pages don't flash light before switching to dark. If you use a plugin that delays or combines JavaScript, exclude the `ogal-toggle-color-scheme` inline script from delaying.

= Can I control a toggle from my own code? =

Yes. Listen for the `ogal-toggle:change` event on `document`, or call `window.ogalToggle.get( 'billing' )` and `window.ogalToggle.set( 'billing', true )` with a toggle's sync group name or HTML anchor.

== Changelog ==

= 0.1.0 =
* Initial release.
