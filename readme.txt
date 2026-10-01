=== Thingamablocks ===
Contributors: ogalweb
Tags: generateblocks, marquee, countdown timer, dark mode, toggle
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A completely unnecessary ultimate add-ons power-pack for GenerateBlocks.

== Description ==

Thingamablocks adds five blocks to the GenerateBlocks category in the block inserter:

* **Toggle** – a switch or pair of buttons that shows/hides elements, switches light/dark mode, or toggles classes.
* **Countdown** – a countdown timer to a date, a per-visitor (evergreen) deadline, or a time that repeats.
* **Marquee** – a smooth, endless scrolling strip of logos, messages, headlines or cards.
* **Dropdown** – a button that opens a drawer of links, downloads or any other blocks.
* **Breadcrumbs** – the path to the current page (Home › Blog › Category › Post), worked out automatically wherever you place it, with breadcrumb structured data for search engines. Works with Yoast SEO and Rank Math.

It also adds **entrance animations** to every GenerateBlocks block: fade, slide or zoom a block in as it scrolls into view, or animate the cards in a grid one by one.

And it adds **image masks** to the GenerateBlocks Image block: cut an image to a wave, a curve or your own SVG shape.

Like the Accordion and Tabs blocks in GenerateBlocks Pro, each block is a settings-only wrapper. Everything you see (the switch, the numbers, the logos, the button and drawer, the breadcrumb links) is an ordinary GenerateBlocks Element, Text, Shape or Media block. You style it with the GenerateBlocks Styles panel you already know, and global styles work as usual.

Nothing from the plugin loads on pages that don't use it: each block's script (and the Toggle's, Dropdown's and Breadcrumbs' few lines of CSS) loads only on pages with that block, and image masks load nothing at all (the mask is part of the image's GenerateBlocks CSS). The one exception is dark mode, whose tiny head script runs on every page once a dark mode toggle is published, so the visitor's choice applies everywhere.

Don't need them all? Under **Settings → Thingamablocks** you can switch off any block or feature to keep the editor tidy. Each switch shows how many posts, pages, templates and Elements use it. Switching off only hides: the block leaves the inserter (and its patterns leave the Patterns tab), or the feature's panel leaves the sidebar, while anything already built with it keeps working on your site and can still be edited (though WordPress may not let you duplicate or paste a switched-off block).

= Toggle: starting layouts =

When you insert a Toggle you pick one of four layouts. Each is fully editable afterwards.

* **Switch with labels** – "Monthly" / switch / "Annual".
* **Segmented buttons** – two buttons side by side; the active one is highlighted. The group is labelled "Billing period" for screen readers (change it under Accessibility).
* **Switch** – just the switch.
* **Dark mode switch** – a switch with a sun/moon icon in the knob.

The layouts use the GeneratePress global colour variables (`--accent`, `--base-3`, `--contrast` and so on), with fallbacks for other themes. The switch's "off" track is a fixed grey with enough contrast in both light and dark mode.

= Toggle: ready-made pricing pattern =

In the inserter's Patterns tab, the **Toggles** category has a **Pricing table with monthly/annual toggle** pattern: a segmented Monthly / Annual toggle and three plans, already wired up (the plan sets have the IDs `pricing-monthly` and `pricing-annual`, and the toggle uses the sync group `billing`). Insert it, change the text and prices, and publish.

= Toggle: what it can do =

* **Show / hide elements** – list element IDs, tag names (like `body`) or CSS selectors to show when the toggle is off and when it's on. The classic example is monthly and annual pricing. Optional fade or fade-and-slide reveal. In the editor, the elements hidden in the current preview state are dimmed with a dashed outline while the toggle is selected.
* **Light / dark mode** – pick a dark version of each theme colour (GeneratePress global colours, or a block theme's palette) in the **Dark mode colours** panel, or let **Suggest dark colours** fill them in. The toggle sets `data-color-scheme="dark"` or `"light"` (and the CSS `color-scheme` property) on `<html>`, optionally adds a class too, can follow the visitor's system setting, and remembers their choice. The dark colours and a small script are printed in `<head>`, so there's no flash of the wrong colours. Set the toggle to start "On" to preview dark mode in the editor.
* **Add / remove a class** – add (or remove) one or more classes on any elements when the toggle is on.
* **Nothing (custom code)** – the toggle only changes its own state. Your code listens for the `tmb-toggle:change` event or uses `window.tmbToggle`.

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
* The whole toggle: `.tmb-toggle.is-on`

The editor shows the toggle in its starting state. Use the On/Off button in the block toolbar to switch the preview and style the other state.

= Toggle: accessibility =

* The switch gets `role="switch"` and `aria-checked` on the server, so the markup is right before any JavaScript runs.
* Segmented buttons get `aria-pressed`. In a toggle without a switch, on/off parts that aren't buttons get `role="button"`, `aria-pressed` and keyboard focus. Next to a switch, plain-text labels are a mouse convenience; the switch is the control.
* `aria-controls` points at the elements the toggle controls (when they're referenced by ID).
* A "Switch label" setting for screen readers, also used as the name of a segmented control's group. If you leave it empty, the "on" label's text is used. The editor warns you when a switch or a buttons-only toggle has no label.
* Keyboard support: Space and Enter work on every focusable part that isn't a native button. If a toggle hides the section it's in, focus moves to a visible toggle in the same group.
* Authors and Contributors can save toggles too: the plugin lets the `aria-checked` and `aria-pressed` attributes through WordPress's content filter, so the blocks don't show as invalid.
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
* Optionally send visitors to another web page (an http or https address, never the page they're on).

= Countdown: accessibility =

* The countdown is a timer region named for screen readers: "Countdown to" the end date and time for a date countdown, otherwise "Countdown". It isn't announced every second.
* In the Inline text layout and the sale banner, screen readers hear "days", "hours" and so on rather than the short letters.
* The ended message is announced when the countdown ends.

= Countdown: parts =

Select a GenerateBlocks block inside a Countdown and use the **Countdown part** panel to mark it as a Days / Hours / Minutes / Seconds number, a unit's box, the Timer (hidden when it ends), the Ended message (shown when it ends), or a Separator. The sidebar warns you if there are no numbers yet or no ended message.

The server writes the real numbers and the ended state into the page, so it's right before any JavaScript runs. In the editor, use the **Running / Ended** toolbar button to preview the ended message. In List View the block shows what it counts to, e.g. "Countdown · Evergreen".

= Countdown: ready-made patterns =

Under Patterns → **Countdowns**:

* **Sale banner with countdown** – a slim banner with an inline countdown. The banner (ID `sale-banner`) hides itself when the sale ends.
* **Launch countdown** – a "coming soon" section with large numbers and a "We're live!" message for when it ends.

= Countdown: for developers =

The Countdown fires `tmb-countdown:end` (and `tmb-countdown:restart` for repeating ones) on its wrapper, and has `window.tmbCountdown.init()` and `window.tmbCountdown.reset()`. See the README for details.

= Marquee: what it's for =

Client logos, short messages, big headlines, or testimonials scrolling upwards. Unlike a carousel, which moves slide by slide, a marquee is a continuous loop at a constant speed with no visible seam.

= Marquee: starting layouts =

* **Logo strip** – placeholder logo shapes to swap for your own images.
* **Message ticker** – a coloured band of short messages, like an announcement bar.
* **Big scrolling headline** – large words drifting across the page.
* **Vertical quotes** – testimonial cards scrolling upwards.

Each has a small pause button in the corner. It comes first in the block, so keyboard users reach it before any links in the row.

= Marquee: ready-made pattern =

Under Patterns → **Marquees**, **Logo strip: "Trusted by…"** is a small "Trusted by teams at" heading above a scrolling row of placeholder logos. Swap in your clients' logos (GenerateBlocks Media blocks inside the scrolling row, all the same height) and publish.

= Marquee: parts and settings =

Select a GenerateBlocks block inside a Marquee and use the **Marquee part** panel to mark it as **The row that scrolls** (put everything that moves inside it, and set the spacing with its gap) or the **Pause button**. Style the paused button with `&[aria-pressed="true"]`, or anything else with `.tmb-marquee.is-paused`.

* **Motion** – speed in pixels per second, direction (left, right, up, down), a height for up/down, and pause on hover. Keyboard focus inside always pauses it.
* **Edges** – fade the ends instead of cutting items off, with a fade width.
* **Accessibility** – a label for screen readers, e.g. "Our clients".

It repeats the row just enough to fill the space, matches the gap where it repeats, re-measures when the page is resized, pauses when off screen and runs the right way on RTL sites. Lazy-loaded images in the copies stay lazy until the strip is near the screen.

= Marquee: accessibility =

* The repeated copies are hidden from screen readers and keyboard users, so each logo or link is only read once.
* A pause button, as WCAG 2.2.2 asks for moving content. The sidebar warns you if you remove it.
* Keyboard focus always pauses it, a focused link is moved fully into view, and the faded edges are removed while it has focus.
* Visitors who prefer reduced motion get a still row they can scroll, also with the keyboard (it's focusable and named with the marquee's label, or "Scrolling content").

= Dropdown: what it's for =

A button that opens a drawer underneath it: a downloads menu, a short list of links, or a small panel with any blocks in it. The drawer floats over the page, lines up with the button, flips above it when there isn't room below, and stays on screen.

= Dropdown: starting layouts =

* **Downloads** – a "Downloads" button opening a list of files, each with its type and size ("PDF · 2.4 MB").
* **Simple links** – a "Resources" button opening a plain list of links.
* **Panel** – a "Need help?" button opening a panel with text and a "Contact us" button.

The button is a GenerateBlocks Button with a chevron that turns over while it's open. The links start as `#`: point them at your files or pages.

= Dropdown: ready-made pattern =

Under Patterns → **Dropdowns**, **Product resources with a Downloads dropdown** is a short section with a heading, a line of text and a Downloads dropdown with three files. Change the file names and links, and publish.

= Dropdown: parts and settings =

Select a GenerateBlocks block inside a Dropdown and use the **Dropdown part** panel to mark it as **The button that opens it** (a GenerateBlocks Button using the `<button>` tag; anything else gets `role="button"` and keyboard support) or **The drawer** (a GenerateBlocks Element holding anything).

The drawer is as wide as the button unless you give it a width in the Styles panel (the Panel layout uses 18rem). The plugin's positioning rules have zero specificity, so your GenerateBlocks styles always win.

In the **Drawer** panel:

* **Reveal animation** – None, Fade, Slide down (default), Grow or Unfold. Plays in reverse when it closes.
* **Speed** – Fast, Normal or Slow.
* **Line up with the button's** – Start, Centre or End, for drawers wider than the button.
* **Space between button and drawer** – in px, 8 by default.
* **Close when an item is clicked** – on by default.

The **Preview** button in the block toolbar plays the reveal in the editor. In the editor the drawer shows, in the page flow, while the dropdown or anything inside it is selected.

= Dropdown: styling the open state =

* The button while open: `&[aria-expanded="true"]` (the layouts turn the chevron with it).
* Anything while open: `.tmb-dropdown.is-open` in global CSS.
* Which way it opened: `data-placement="top"` or `"bottom"` on the wrapper while open.

Like any popover, a drawer inside a container with `overflow: hidden` is cut off at that container's edge.

= Dropdown: accessibility =

* A disclosure button (`aria-expanded`, `aria-controls`), not an ARIA menu, which would make screen readers expect app-style arrow keys. Visitors Tab through the items like any links.
* Escape closes it and returns focus to the button. A click outside, tabbing away, or using an item also closes it.
* The Down arrow opens it and moves to the first item. Only one dropdown is open at a time.
* No animation for visitors who prefer reduced motion. Without JavaScript the drawers are simply shown.
* The Downloads and Simple links layouts are real lists.

= Dropdown: for developers =

The Dropdown fires `tmb-dropdown:open` and `tmb-dropdown:close` on its wrapper, and has `window.tmbDropdown.init()`, `.open()`, `.close()` and `.toggle()`, which take the wrapper element or its HTML anchor. See the README for details.

= Breadcrumbs: what it's for =

The path to the page a visitor is on, each step a link back up the site. Place it once – in a GeneratePress Element on a hook, a block theme template, a widget, or a single page – and it works out the trail for whatever page is being viewed.

= Breadcrumbs: starting styles =

* **Chevrons** – Home › Blog › Post.
* **Slashes** – Home / Blog / Post.
* **Pills** – each step in a soft rounded box, the current page in your accent colour.

= Breadcrumbs: parts =

Each style is three GenerateBlocks Text blocks, marked in the **Breadcrumb part** panel: **Link to each page** (a Text block using the `<a>` tag), **Separator** and **The current page**. They're templates: style them once in the Styles panel and they're repeated for every step, with each page's title and link. The editor shows the templates, not the real trail. Only blocks set as a part are shown.

= Breadcrumbs: the trail =

* Pages: Home › parent pages › Page (private and draft parents are left out).
* Posts: Home › Blog page › Category (with its parents) › Post. The category is the primary one set in Yoast SEO or Rank Math, otherwise the first.
* Custom post types: Home › the post type's archive (if it has one) › Item.
* Category, tag and other term archives with their parent terms; author, date and search pages; and the 404 page.
* WooCommerce: Home › Shop › Product category › Product, and the shop and product category pages.

= Breadcrumbs: settings =

* **Trail** – Use Yoast SEO's / Rank Math's breadcrumbs (on by default, shown when one is active); Home as Text, Icon or Both, and its label; show the blog page on posts; show the category on posts; show the current page; show on the home page (off by default); collapse when it doesn't fit.
* **Search engines** – Breadcrumb structured data: Automatic (only if no SEO plugin adds it), Always or Never.
* **Accessibility** – the label for screen readers ("Breadcrumb" by default).

= Breadcrumbs: SEO plugins =

With Yoast SEO or Rank Math active, the block shows their trail by default, so visitors see the same path search engines are told, and on Automatic it leaves the structured data to them (Yoast always adds it; Rank Math when its breadcrumbs are on). If the SEO plugin's breadcrumbs fail for any reason, the block quietly uses its own trail. All in One SEO, The SEO Framework and Slim SEO are detected too, so Automatic leaves the structured data to them. For any other SEO plugin that adds it, choose **Never**, or return `true` from the `thingamablocks_breadcrumbs_seo_schema` filter.

= Breadcrumbs: accessibility =

* A `<nav>` landmark with a label, holding an ordered list.
* The current page has `aria-current="page"` and isn't a link. Separators are hidden from screen readers.
* A home icon keeps "Home" as hidden text for screen readers.
* Links and the "…" button are at least 24 px tall.
* Long trails collapse to Home › … › Parent › Page when they don't fit on one line; the … button shows the rest and moves focus there. Without JavaScript they simply wrap.

= Breadcrumbs: for developers =

Change the trail with the `thingamablocks_breadcrumbs_trail` filter (a list of label and URL pairs; the last is the current page). Call `window.tmbBreadcrumbs.init()` after adding breadcrumbs with AJAX. Style the row with `.tmb-breadcrumbs__list` and the "…" button with `.tmb-breadcrumbs__more`. See the README for details.

= Entrance animations =

Select any GenerateBlocks 2 block (or GenerateBlocks Pro block) and open the **Entrance animation** panel. The legacy GenerateBlocks 1.x blocks aren't supported.

* **Animation** – None, Fade in, Fade up, Fade down, Slide in from the left, Slide in from the right, Zoom in.
* **Speed** – Fast (400 ms), Normal (700 ms) or Slow (1100 ms).
* **Delay** – 0 to 2000 ms.
* **Animate the blocks inside one by one** – on blocks that hold other blocks. The block stays put and each block inside it animates in turn, with a **Time between each** you choose. Great for grids, cards and query loops: for a query loop, set it on the **Looper** block.
* **Preview** button to play it in the editor.

Tip: don't animate the first thing visitors see (a hero heading or image). It stays hidden until the script runs, which can slow the page's Largest Contentful Paint (LCP) score.

Each animation plays once, when the block scrolls into view. The settings are stored as HTML attributes on the block (`data-tmb-animate`, `data-tmb-speed`, `data-tmb-delay`, `data-tmb-animate-children`), which you can see in GenerateBlocks' HTML Attributes panel.

Built to be light and safe:

* Nothing loads on pages without an animation. Pages with one get a ~1.8 KB script and ~600 bytes of CSS.
* Uses the Web Animations API with opacity, translate and scale, animating to the block's own styles, so GenerateBlocks transforms and hover transitions keep working.
* No flash: blocks are only hidden while waiting to animate when JavaScript is running and the visitor hasn't asked for reduced motion. If the script is blocked or delayed, everything is shown after 4 seconds anyway.
* Visitors who prefer reduced motion see no animation.
* Keyboard users who tab into a block that hasn't animated in yet see it straight away.
* For developers: `window.tmbAnimate.init( container )` for content added with AJAX, the `thingamablocks_animation_head_markup` filter, and the `.tmb-in` class (added when a block animates) and `html.tmb-animate-js` for CSS.

= Image masks =

Select a GenerateBlocks Image block and open the **Mask** panel. Click **Choose a shape**:

* **Shape library** – the GenerateBlocks shape library: GB's built-in waves, angles, curves and triangles, plus any shapes added to the library, including your shapes from GenerateBlocks Pro's Asset Library.
* **Upload or paste** – choose an .svg file or paste SVG code.

The solid parts of the shape show the image; the empty parts are see-through. Then:

* **Size** – Contain (whole shape fits), Cover (fills the image, may crop the shape), Stretch (fills exactly; the only option that distorts the shape), or a Custom width in %, px or rem. Shapes keep their proportions unless you choose Stretch, even library shapes made to stretch.
* **Position** – a focal point picker.
* **Flip** – horizontally and/or vertically.
* **Repeat the shape** – off by default.
* **Replace shape** and **Remove mask**.

The panel follows the editor's preview device (Desktop / Tablet / Mobile), like the GenerateBlocks Styles panel. Desktop settings apply everywhere; on Tablet or Mobile only what you change is stored, so the rest is inherited. **Remove at this size** turns the mask off on that screen size and smaller, and **Reset to inherited settings** clears that size's own changes.

How it works:

* The mask is saved as `mask-image`, `mask-size`, `mask-position` and `mask-repeat` in the image's GenerateBlocks styles, so you can see and edit it in the Styles panel too. GenerateBlocks prints it with the block's CSS. Nothing extra loads on the front end, and the image's HTML doesn't change.
* SVGs aren't added to the Media Library. They're cleaned in your browser down to plain shapes (scripts, event handlers, styles, embedded images and external links are removed), limited to 100 KB, and stored with the image as part of its CSS. Picking a library shape stores a copy too, so later changes to that library shape don't affect images already using it, and deleting it never breaks a page.
* Purely visual: the image's alt text works as normal, and a linked image keeps its keyboard focus outline. Don't mask away parts of an image that carry information.
* CSS masks work in all current browsers (Chrome and Edge 120+, Safari 15.4+, Firefox 53+). Older browsers show the image without the mask.

= Requirements =

* WordPress 6.6 or newer (tested up to 7.1)
* PHP 7.4 or newer
* GenerateBlocks 2.0 or newer (the free plugin is enough)

Tested with GenerateBlocks 2.4.1. Not yet tested with GenerateBlocks Pro.

= Source code =

The plugin zip contains the compiled JavaScript and CSS in `build/`. The human-readable source (`src/`), build configuration and developer tools are in the GitHub repository: https://github.com/Calvin-Susan/thingamablocks. It builds with `npm install` and `npm run build` (`@wordpress/scripts`).

== Installation ==

1. Install and activate GenerateBlocks 2.0 or newer.
2. Upload the `thingamablocks` folder to `/wp-content/plugins/`, or upload the zip under Plugins → Add New → Upload Plugin.
3. Activate **Thingamablocks**.
4. In the block editor, open the inserter and find **Toggle**, **Countdown**, **Marquee**, **Dropdown** and **Breadcrumbs** in the GenerateBlocks category, or the ready-made sections under Patterns → Toggles, Patterns → Countdowns, Patterns → Marquees and Patterns → Dropdowns. Select any GenerateBlocks block to find the **Entrance animation** panel in its sidebar, and a GenerateBlocks Image block to find the **Mask** panel.
5. Optional: under **Settings → Thingamablocks** (also linked from the Plugins screen), switch off any blocks or features you don't need.

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

Yes. The page HTML is the same for every visitor; each visitor's choice is stored in their own browser (localStorage) and applied by JavaScript. For dark mode, the inline `<head>` script reads that choice before the page paints, so cached pages don't flash light before switching to dark. A remembered choice on a toggle with a sync group or HTML anchor is also applied before the page paints, by a tiny script right after the toggle.

It also holds up with "remove unused CSS" optimisations: hidden elements get an inline `display: none !important` and reveal animations use the Web Animations API, so neither relies on CSS rules an optimiser might strip. If you use a plugin that delays JavaScript, exclude the `tmb-toggle-color-scheme` inline script from delaying.

= Can I control a toggle from my own code? =

Yes. Listen for the `tmb-toggle:change` event on `document`, or call `window.tmbToggle.get( 'billing' )` and `window.tmbToggle.set( 'billing', true )` with a toggle's sync group name or HTML anchor. If you add toggles to the page later (e.g. with AJAX), call `window.tmbToggle.init()` to set them up.

= Does the countdown use the visitor's time zone? =

No, the site's: the one under Settings → General. "Ends Friday at 5 pm" means 5 pm where your business is, so every visitor sees it end at the same moment wherever they are (a visitor in another time zone just sees a different number of hours left). Daylight-saving changes are handled. An evergreen countdown counts from each visitor's first view, so time zones don't matter there. The ticking uses the visitor's device clock, so a device with the wrong time shows the wrong count.

= Does the countdown work with page caching? =

Yes. The server writes the numbers into the page, so a cached copy holds the numbers from when it was cached, but the countdown's script recalculates from the clock as soon as the page loads and corrects them (including switching to the ended state if the end has passed). Evergreen deadlines are kept in each visitor's browser, so caching doesn't affect them. If you use a plugin that delays JavaScript until the visitor interacts, exclude the Countdown's script (`build/countdown/view.js`) from delaying, or the cached numbers stay frozen until then.

= How do I test an evergreen countdown again? =

The visitor's deadline is saved in their browser, so reloading won't restart it. Open the page in a private window, or open the browser console and run `window.tmbCountdown.reset()` (or `window.tmbCountdown.reset( 'your-anchor' )` for one countdown with that HTML anchor). Clearing the site's data in the browser also works.

Tip: give an evergreen countdown an HTML anchor (Advanced panel). Its deadline is then saved under that name, so it doesn't change if you add or move other countdowns on the page.

= Why do the numbers show 00 in the editor? =

The `00` is placeholder text; the editor doesn't run the clock. The sidebar tells you when it ends ("Ends in 4 days, 6 hours"), and the real numbers are filled in on the front end. Use the **Running / Ended** button in the block toolbar to preview the ended message.

= Why does the marquee stand still in the editor? =

So you can click into it and edit the content. Use the **Preview** button in the Marquee's block toolbar to see the speed and direction, then **Stop** to carry on editing. It scrolls on the front end.

= Can I put links or buttons in a marquee? =

Yes. Only the original row can be reached with the keyboard and screen readers; the copies made for the loop are skipped. The marquee always stops while a link inside it has keyboard focus, and brings that link fully into view, so it isn't a moving target. Keep in mind that moving links are harder to click, so don't put anything essential only in a marquee.

= Why does the dropdown's drawer stay open in the editor? =

So you can edit what's in it. It shows while the Dropdown or anything inside it is selected, and hides when you click elsewhere. On the front end it opens and closes with the button. Use the **Preview** button in the block toolbar to see the reveal animation.

= Why does an Author's dropdown show as invalid in the editor? =

GenerateBlocks button icons (like the dropdown's chevron) are inline SVGs, and WordPress removes SVGs from content saved by users without the "unfiltered HTML" capability: Authors, Contributors, and on multisite, administrators. When the icon is removed the editor reports the button as invalid. This affects any GenerateBlocks button with an icon, not just this block. Have an Editor or Administrator save the page, or remove the icon from the button.

= Why is my dropdown's drawer cut off? =

It's probably inside a container with `overflow: hidden` (some sliders and cards use it). Like any popover, the drawer can't show outside that container. Move the dropdown out of it, or remove the overflow setting.

= Where should I put the Breadcrumbs block? =

Anywhere shared by many pages: the easiest is a GeneratePress Block Element on a hook such as `generate_before_main_content`, displayed on the entire site. The block works out the trail for whichever page is being viewed. It's hidden on the front page unless you turn on **Show on the home page**.

= Why does the Breadcrumbs block show "Parent page" in the editor? =

The editor shows the three part templates (a link, a separator and the current page) so you can style them. The real trail depends on the page being viewed, so it's built on the front end.

= Will it duplicate my SEO plugin's breadcrumb schema? =

Not with Yoast SEO, Rank Math, All in One SEO, The SEO Framework or Slim SEO: on **Automatic** (the default) the block adds no structured data when one of them already does (Rank Math: when its breadcrumbs are switched on). If another SEO plugin adds breadcrumb structured data, set **Breadcrumb structured data** to **Never** in the block's Search engines panel, or add `add_filter( 'thingamablocks_breadcrumbs_seo_schema', '__return_true' );` to tell every block at once. Either way, the block never prints it more than once per page.

= Can I hide blocks I don't use? =

Yes. Go to **Settings → Thingamablocks** (administrators only) and untick any block or feature. A switched-off block leaves the inserter and its patterns leave the Patterns tab; a switched-off feature's panel no longer appears in the sidebar. It only hides them: pages already using a block keep working and can still be edited (WordPress may not let you duplicate or paste it until it's switched back on), and existing animations and masks stay. The page shows how many items use each one, so you can see what's safe to hide. Everything is on by default.

= Will animations slow my site down? =

No. Pages without an animation load nothing extra. Pages with one load a ~1.8 KB script (deferred, in the footer) and ~600 bytes of CSS. Keep animations off the hero at the top of the page, though: an animated block stays hidden until the script runs, which can slow your LCP score. The animations use the browser's Web Animations API on opacity, translate and scale, which the browser can run smoothly without re-laying out the page, and each one plays only once.

= Do animations work with caching/optimisation plugins? =

Yes. Page caching makes no difference: the settings are attributes in the HTML. "Remove unused CSS" can't break the animations, because they're run by the script rather than CSS keyframes. If a plugin delays or blocks JavaScript, nothing stays hidden: a fail-safe shows every animated block after 4 seconds. For the animations themselves to play on load, exclude `build/animations/view.js` from JavaScript delaying.

= Why doesn't my animation play in the editor? =

On purpose: animations don't play on their own in the editor, so blocks never disappear while you're working on them. Choosing an animation plays it once, and the **Preview** button in the Entrance animation panel plays it again. It plays as the block scrolls into view on the front end.

= Why aren't mask SVGs uploaded to the Media Library? =

WordPress blocks SVG uploads by default, for good reason: an SVG file can contain scripts. So the Mask panel never uploads it. It reads the file (or the code you paste) in your browser, keeps only the plain shapes, and stores the result with the image, inside its CSS. You don't need an SVG-upload plugin, and a mask can't break because a file was deleted.

The flip side: a mask is a copy. If you later change a shape in the GenerateBlocks shape library, images that already use it keep the old version until you pick the shape again.

= Why won't my SVG work as a mask? =

The picker tells you why. The SVG needs a `viewBox` (or a width and height) so it can be scaled, it needs real shapes (paths, rectangles, circles, ellipses, lines or polygons; text and embedded images don't count), and it must be under 100 KB after cleaning. For text or an icon font, convert it to outlines in your design tool first.

== Changelog ==

= 0.1.0 =
Initial release.

* Toggle block: show/hide elements, light/dark mode with a dark colour for each theme colour, add/remove classes, or custom code. Four starting layouts, sync groups, remembered choices (applied before the page paints), and server-rendered accessibility.
* Countdown block: count to a date, a per-visitor (evergreen) deadline, or a repeating time. End actions: message, stay at zero, disappear, hide/show elements, redirect. Numbers are rendered on the server.
* Marquee block: a smooth, endless scrolling strip of logos, messages, headlines or cards (left, right, up or down), with a pause button, faded edges, keyboard and reduced-motion support.
* Entrance animations for every GenerateBlocks 2 / GB Pro block: fade, slide or zoom in on scroll, or animate the blocks inside one by one. ~1.8 KB, reduced-motion support and a no-JavaScript fail-safe.
* Patterns: pricing table with monthly/annual toggle, sale banner with countdown, launch countdown, and logo strip, all translatable.
* Nothing loads on pages that don't use the plugin (except the small dark mode head script, once a dark mode toggle is published).
* Safe for Authors and Contributors: target selectors are strictly sanitised, and toggles don't show as invalid blocks.
* Removes its options when deleted.
