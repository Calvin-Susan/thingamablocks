=== Toggle for GenerateBlocks ===
Contributors: ogalweb
Tags: generateblocks, toggle, countdown timer, dark mode, evergreen
Requires at least: 6.5
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

GenerateBlocks add-on blocks built from native GB blocks: a Toggle (show/hide, dark mode, classes) and a Countdown (date, evergreen, recurring).

== Description ==

Toggle for GenerateBlocks adds two blocks to the GenerateBlocks category in the block inserter:

* **Toggle** – a switch or pair of buttons that shows/hides elements, switches light/dark mode, or toggles classes.
* **Countdown** – a countdown timer to a date, a per-visitor (evergreen) deadline, or a time that repeats.

Like the Accordion and Tabs blocks in GenerateBlocks Pro, each block is a settings-only wrapper. Everything you see (the switch, the labels, the numbers, the boxes) is an ordinary GenerateBlocks Element, Text or Shape block. You style it with the GenerateBlocks Styles panel you already know, and global styles work as usual.

= Toggle: starting layouts =

When you insert a Toggle you pick one of four layouts. Each is fully editable afterwards.

* **Switch with labels** – "Monthly" / switch / "Annual".
* **Segmented buttons** – two buttons side by side; the active one is highlighted.
* **Switch** – just the switch.
* **Dark mode switch** – a switch with a sun/moon icon in the knob.

The layouts use the GeneratePress global colour variables (`--accent`, `--base-3`, `--contrast` and so on), with fallbacks for other themes.

= Toggle: ready-made pricing pattern =

In the inserter's Patterns tab, the **Toggles** category has a **Pricing table with monthly/annual toggle** pattern: a segmented Monthly / Annual toggle and three plans, already wired up (the plan sets have the IDs `pricing-monthly` and `pricing-annual`, and the toggle uses the sync group `billing`). Insert it, change the text and prices, and publish.

= Toggle: what it can do =

* **Show / hide elements** – list element IDs, tag names (like `body`) or CSS selectors to show when the toggle is off and when it's on. The classic example is monthly and annual pricing. Optional fade or fade-and-slide reveal. In the editor, the elements hidden in the current preview state are dimmed with a dashed outline while the toggle is selected.
* **Light / dark mode** – pick a dark version of each theme colour (GeneratePress global colours, or a block theme's palette) in the **Dark mode colours** panel, or let **Suggest dark colours** fill them in. The toggle sets `data-color-scheme="dark"` or `"light"` (and the CSS `color-scheme` property) on `<html>`, optionally adds a class too, can follow the visitor's system setting, and remembers their choice. The dark colours and a small script are printed in `<head>`, so there's no flash of the wrong colours. Set the toggle to start "On" to preview dark mode in the editor.
* **Add / remove a class** – add (or remove) one or more classes on any elements when the toggle is on.
* **Nothing (custom code)** – the toggle only changes its own state. Your code listens for the `ogal-toggle:change` event or uses `window.ogalToggle`.

= Toggle: parts =

Select any GenerateBlocks block inside a Toggle and you'll see a **Toggle part** panel. Choose what clicking it does:

* Flips the toggle (a switch)
* Turns it off
* Turns it on
* Does nothing (decoration)

The choice is saved as a `data-toggle-part` HTML attribute on the block, so you can also see it in GenerateBlocks' HTML Attributes panel.

= Toggle: styling the "on" state =

Use GenerateBlocks nested selectors on the part itself:

* A switch: `&[aria-checked="true"]`
* The knob inside a switch (set on the switch): `&[aria-checked="true"] > *` – the layouts move it with `margin-inline-start`, so it slides the right way on RTL sites
* An on/off label or button: `&[data-active="true"]`
* The whole toggle: `.ogal-toggle.is-on`

The editor shows the toggle in its starting state. Use the On/Off button in the block toolbar to switch the preview and style the other state.

= Toggle: accessibility =

* The switch gets `role="switch"` and `aria-checked` on the server, so the markup is right before any JavaScript runs.
* Segmented buttons get `aria-pressed`. In a toggle without a switch, on/off parts that aren't buttons get `role="button"`, `aria-pressed` and keyboard focus. Next to a switch, plain-text labels are a mouse convenience; the switch is the control.
* `aria-controls` points at the elements the toggle controls (when they're referenced by ID).
* A "Switch label" setting for screen readers, also used as the name of a segmented control's group. If you leave it empty, the "on" label's text is used.
* Keyboard support: Space and Enter work on every focusable part that isn't a native button.
* Reveal animations and transitions are switched off for visitors who prefer reduced motion.

= Countdown: starting layouts =

* **Boxes** – each unit (days, hours, minutes, seconds) in its own box.
* **Inline text** – "Ends in 2d 5h 12m 9s", for banners and buttons.
* **Large numbers** – big numbers with colons, for launches.

= Countdown: what it counts to =

* **A date and time** – e.g. "Sale ends Friday at 5 pm". Times are in the site's time zone (Settings → General), so it ends at the same moment for everyone. New countdowns start a week out, at 23:59.
* **A deadline per visitor (evergreen)** – days, hours and minutes from the visitor's first view, remembered in their browser. Optionally start again when it ends.
* **A time that repeats** – a time of day on chosen weekdays, e.g. "order by 2 pm for same-day dispatch". It rolls over to the next one by itself.

= Countdown: display =

* Two-digit numbers (05 rather than 5).
* Hide units that reach zero – e.g. drop Days on the last day. The last two units always show, and a separator after a hidden unit goes with it.
* Delete a unit's box to drop it altogether: the next unit absorbs the time, so 2 days show as 48 hours.

= Countdown: when it ends =

* Show an "ended" message, stay at zero, or disappear.
* Also hide or show other elements by ID or CSS selector – e.g. hide a "Buy now" button, show a "Sold out" notice.
* Optionally send visitors to another page (never the page they're on).

= Countdown: parts =

Select a GenerateBlocks block inside a Countdown and use the **Countdown part** panel to mark it as a Days / Hours / Minutes / Seconds number, a unit's box, the Timer (hidden when it ends), the Ended message (shown when it ends), or a Separator. The sidebar warns you if there are no numbers yet or no ended message.

The server writes the real numbers and the ended state into the page, so it's right before any JavaScript runs. In the editor, use the **Running / Ended** toolbar button to preview the ended message. In List View the block shows what it counts to, e.g. "Countdown · Evergreen".

= Countdown: ready-made patterns =

Under Patterns → **Countdowns**:

* **Sale banner with countdown** – a slim banner with an inline countdown. The banner (ID `sale-banner`) hides itself when the sale ends.
* **Launch countdown** – a "coming soon" section with large numbers and a "We're live!" message for when it ends.

= Countdown: for developers =

The Countdown fires `ogal-countdown:end` (and `ogal-countdown:restart` for repeating ones) on its wrapper, and has `window.ogalCountdown.init()` and `window.ogalCountdown.reset()`. See the README for details.

= Requirements =

* WordPress 6.5 or newer
* PHP 7.4 or newer
* GenerateBlocks 2.0 or newer (the free plugin is enough)

Tested with GenerateBlocks 2.4.1. Not yet tested with GenerateBlocks Pro.

== Installation ==

1. Install and activate GenerateBlocks 2.0 or newer.
2. Upload the `toggle-for-generateblocks` folder to `/wp-content/plugins/`, or upload the zip under Plugins → Add New → Upload Plugin.
3. Activate **Toggle for GenerateBlocks**.
4. In the block editor, open the inserter and find **Toggle** and **Countdown** in the GenerateBlocks category, or the ready-made sections under Patterns → Toggles and Patterns → Countdowns.

== Frequently Asked Questions ==

= Does it need GenerateBlocks Pro? =

No. It only needs the free GenerateBlocks plugin, version 2.0 or newer. It hasn't been tested with GenerateBlocks Pro yet.

= Why does nothing happen when I click the toggle in the editor? =

That's on purpose: in the editor, clicking selects blocks so you can edit them. To preview the other state, use the **On/Off** button in the Toggle's block toolbar (or the "Starts as" setting). The editor then shows that state so you can style it. The toggle works on the front end.

= How do I give an element an ID so the toggle can find it? =

Select the element (for example the Element block wrapping your monthly prices), open its Settings, and in **HTML Attributes** add an attribute named `id` with a value such as `monthly-prices`. Core blocks use **Advanced → HTML anchor** instead. The toggle's target fields suggest every ID on the page and warn you if one can't be found.

= Where do the dark mode colours come from? =

From the toggle's **Dark mode colours** panel: pick a dark version of each theme colour, or click **Suggest dark colours**. Once the post, page or GeneratePress Element containing the toggle is published, they're printed site-wide as CSS variable overrides under `:root[data-color-scheme="dark"]`, so anything using your theme colours switches automatically. If several posts have a dark mode toggle, the most recently saved one's settings are used; removing the toggle or trashing the post switches this off again.

For anything else (images, hard-coded colours), use CSS, for example `[data-color-scheme="dark"] .site-logo img { filter: invert(1); }`. You can also skip the panel and override the variables yourself, e.g. `[data-color-scheme="dark"] { --base-3: #16161a; --contrast: #f2f2f5; }`.

= Can I use two toggles for the same pricing table? =

Yes. Give both the same **Sync group** name (under State), for example `billing`. Flipping one flips the other. Each toggle in a group runs its own action, so grouped toggles can also control different sections.

= Does the toggle work with page caching? =

Yes. The page HTML is the same for every visitor; each visitor's choice is stored in their own browser (localStorage) and applied by JavaScript. For dark mode, the inline `<head>` script reads that choice before the page paints, so cached pages don't flash light before switching to dark.

It also holds up with "remove unused CSS" optimisations: hidden elements get an inline `display: none !important` and reveal animations use the Web Animations API, so neither relies on CSS rules an optimiser might strip. If you use a plugin that delays JavaScript, exclude the `ogal-toggle-color-scheme` inline script from delaying.

= Can I control a toggle from my own code? =

Yes. Listen for the `ogal-toggle:change` event on `document`, or call `window.ogalToggle.get( 'billing' )` and `window.ogalToggle.set( 'billing', true )` with a toggle's sync group name or HTML anchor. If you add toggles to the page later (e.g. with AJAX), call `window.ogalToggle.init()` to set them up.

= Does the countdown use the visitor's time zone? =

No, the site's: the one under Settings → General. "Ends Friday at 5 pm" means 5 pm where your business is, so every visitor sees it end at the same moment wherever they are (a visitor in another time zone just sees a different number of hours left). Daylight-saving changes are handled. An evergreen countdown counts from each visitor's first view, so time zones don't matter there. The ticking uses the visitor's device clock, so a device with the wrong time shows the wrong count.

= Does the countdown work with page caching? =

Yes. The server writes the numbers into the page, so a cached copy holds the numbers from when it was cached, but the countdown's script recalculates from the clock as soon as the page loads and corrects them (including switching to the ended state if the end has passed). Evergreen deadlines are kept in each visitor's browser, so caching doesn't affect them. If you use a plugin that delays JavaScript until the visitor interacts, exclude the Countdown's script (`build/countdown/view.js`) from delaying, or the cached numbers stay frozen until then.

= How do I test an evergreen countdown again? =

The visitor's deadline is saved in their browser, so reloading won't restart it. Open the page in a private window, or open the browser console and run `window.ogalCountdown.reset()` (or `window.ogalCountdown.reset( 'your-anchor' )` for one countdown with that HTML anchor). Clearing the site's data in the browser also works.

Tip: give an evergreen countdown an HTML anchor (Advanced panel). Its deadline is then saved under that name, so it doesn't change if you add or move other countdowns on the page.

= Why do the numbers show 00 in the editor? =

The `00` is placeholder text; the editor doesn't run the clock. The sidebar tells you when it ends ("Ends in 4 days, 6 hours"), and the real numbers are filled in on the front end. Use the **Running / Ended** button in the block toolbar to preview the ended message.

== Changelog ==

= Unreleased =
* New Countdown block: count to a date, a per-visitor (evergreen) deadline, or a repeating time; end actions (message, stay at zero, disappear, hide/show elements, redirect).
* New patterns: "Sale banner with countdown" and "Launch countdown", in a new Countdowns category.
* Toggle: stricter target sanitising, namespaced storage keys, duplicate IDs all switch, and only administrators change the site-wide dark colours.

= 0.1.0 =
* Initial release.
