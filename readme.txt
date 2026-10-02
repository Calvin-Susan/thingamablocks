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

Thingamablocks adds six blocks to the GenerateBlocks category in the block inserter:

* **Toggle** – a switch or pair of buttons that shows/hides elements, switches light/dark mode, or toggles classes.
* **Countdown** – a countdown timer to a date, a per-visitor (evergreen) deadline, or a time that repeats.
* **Marquee** – a smooth, endless scrolling strip of logos, messages, headlines or cards.
* **Dropdown** – a button that opens a drawer of links, downloads or any other blocks.
* **Breadcrumbs** – the path to the current page (Home › Blog › Category › Post), worked out automatically wherever you place it, with breadcrumb structured data for search engines. Works with Yoast SEO and Rank Math.
* **Search** – a search form you style with GenerateBlocks, that can search only the content types you choose (just products, just pages…). Four starting styles, including a search icon that opens a field.

It also adds **entrance animations** to every GenerateBlocks block: fade, slide or zoom a block in as it scrolls into view, or animate the cards in a grid one by one.

And it adds **image masks** to the GenerateBlocks Image block: cut an image to a wave, a curve or your own SVG shape.

And it adds **video backgrounds** to the GenerateBlocks Element block (containers): a muted Bunny or Vimeo video behind a section, like a background image, with a poster, an overlay and a pause button. The video loads only after the page has, and only when the section is on screen.

With GenerateBlocks Pro, it adds **FAQ schema** to the Accordion block: one switch tells search engines the accordion is a list of questions and answers (schema.org FAQPage structured data), built from the accordion's own text.

Like the Accordion and Tabs blocks in GenerateBlocks Pro, each block is a settings-only wrapper. Everything you see (the switch, the numbers, the logos, the button and drawer, the breadcrumb links, the search field) is an ordinary GenerateBlocks Element, Text, Shape or Media block. You style it with the GenerateBlocks Styles panel you already know, and global styles work as usual. The starting layouts are styled with shared GenerateBlocks Pro Global Styles (see below).

Nothing from the plugin loads on pages that don't use it: each block's script (and the Toggle's, Dropdown's, Breadcrumbs' and Search's few lines of CSS) loads only on pages with that block (the Search block has no script at all unless it uses the expanding style), image masks load nothing at all (the mask is part of the image's GenerateBlocks CSS), FAQ schema adds only the structured data itself, on pages with an FAQ accordion, and video backgrounds load their small script and CSS only on pages with one. The one exception is dark mode, whose tiny head script runs on every page once a dark mode toggle is published, so the visitor's choice applies everywhere.

Don't need them all? Under **Settings → Thingamablocks** you can switch off any block or feature to keep the editor tidy: each has an on/off switch, with a short description and how many posts, pages, templates and Elements use it. Switching off only hides: the block leaves the inserter (and its patterns leave the Patterns tab), or the feature's panel leaves the sidebar, while anything already built with it keeps working on your site and can still be edited (though WordPress may not let you duplicate or paste a switched-off block).

= Starting layouts and Global Styles =

Each block's starting layouts are styled with shared GenerateBlocks Pro Global Styles: a base class per part plus a modifier where a layout differs, e.g. `tmb-search__field` and `tmb-search__field--pill`. Edit a class to restyle every block on the site that uses it; remove or swap a class on one block (or add local styles) for a one-off look. The default colours are plain hex values for now, so they don't follow your theme colours or dark mode until you change them.

The plugin creates the classes (about 75), in a "Thingamablocks" Global Styles category, the first time someone who can manage GenerateBlocks styles opens wp-admin after installing or updating. After that they're yours: the plugin never overwrites them, so your edits are safe (but improved defaults in later versions won't change existing classes), and a class you delete stays deleted. GenerateBlocks Pro loads Global Styles as one stylesheet on every page; these add around 18 KB (under 3 KB gzipped).

Without GenerateBlocks Pro every block still works, but the layouts are unstyled. Blocks inserted with an older version, and the patterns, keep their own per-block styles.

= Toggle: starting layouts =

When you insert a Toggle you pick one of four layouts. Each is fully editable afterwards.

* **Switch with labels** – "Monthly" / switch / "Annual".
* **Segmented buttons** – two buttons side by side; the active one is highlighted. The group is labelled "Billing period" for screen readers (change it under Accessibility).
* **Switch** – just the switch.
* **Dark mode switch** – a switch with a sun/moon icon in the knob.

Classes: `tmb-toggle__row`, `__label`, `__switch` (`--dark-mode`), `__knob`, `__icon` (`--on`), `__segments` and `__segment`. The dark mode switch's sun/moon swap spans two: `tmb-toggle__icon--on` hides the moon, and `tmb-toggle__switch--dark-mode` swaps them while on. The switch's "off" track is a fixed grey with enough contrast in both light and dark mode.

= Toggle: ready-made pricing pattern =

In the inserter's Patterns tab, the **Toggles** category has a **Pricing table with monthly/annual toggle** pattern: a segmented Monthly / Annual toggle and three plans, already wired up (the plan sets have the IDs `pricing-monthly` and `pricing-annual`, and the toggle uses the sync group `billing`). Insert it, change the text and prices, and publish.

= Toggle: what it can do =

* **Show / hide elements** – list element IDs, tag names (like `body`) or CSS selectors to show when the toggle is off and when it's on. The classic example is monthly and annual pricing. Optional fade or fade-and-slide reveal. In the editor, the elements hidden in the current preview state are dimmed with a dashed outline while the toggle is selected.
* **Light / dark mode** – the toggle sets the CSS `color-scheme` property (and `data-color-scheme="dark"` or `"light"`) on `<html>`, so colours written with `light-dark()` switch on their own. It optionally adds a class too, can follow the visitor's system setting, and remembers their choice. A small script in `<head>` applies the choice before the page paints, so there's no flash of the wrong colours. Set the toggle to start "On" to preview dark mode in the editor.
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

Classes: `tmb-countdown__timer`, `__unit`, `__number`, `__label`, `__intro`, `__suffix`, `__separator` and `__ended`, plus a modifier per layout such as `tmb-countdown__number--boxes`. The Inline text layout's screen-reader-only unit names keep local styles, so restyling a class can't reveal them.

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

Classes: `tmb-marquee__pause` (`--middle`; it also holds the pause/play icon swap), `__items` (`--logos`, `--messages`, `--headline`, `--quotes`), `__logo`, `__band`, `__message`, `__headline` (`--muted`), `__star` (`--messages`, `--headline`), `__card`, `__quote` and `__author`. The row's `display: flex` (and `flex-direction: column` for vertical quotes) stays a local style, since the loop needs it.

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

Classes: `tmb-dropdown__button`, `__drawer` (`--panel`, which sets the panel's 18rem width), `__item`, `__link` (`--downloads`, `--simple`), `__file-name`, `__file-meta`, `__title`, `__text` and `__cta`.

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

Classes: `tmb-breadcrumbs__item` (`--pill`), `__divider` (the separator; the plugin already adds `tmb-breadcrumbs__separator` itself) and `__current` (`--pill`).

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

= Search: what it's for =

A search form for your header, sidebar or 404 page that looks like the rest of your site, because it's built from GenerateBlocks blocks. Tick **Products** and it's a WooCommerce product search; tick **Pages** and it only searches pages. Results show on your theme's normal search results page.

= Search: starting styles =

* **Bar with button** – a bordered field with a "Search" button beside it.
* **Pill, button inside** – a rounded field with a round search-icon button inside it.
* **Underline** – just a line and a search icon, for headers and sidebars.
* **Icon that opens a search** – a search icon; clicking it opens a field below it, floating over the page.

Classes: `tmb-search__wrapper` (`--bar`, `--expand`), `__field` (`--bar`, `--pill`, `--underline`, `--expand`) and `__button` (`--bar`, `--pill`, `--underline`, `--toggle`, `--expand`). The pop-up field's position needs two: `tmb-search__wrapper--expand` (`position: relative`) and `tmb-search__field--expand` (`position: absolute`). The input has no class; on the site it gets the plugin's own `tmb-search__input`.

= Search: parts =

Marked in the **Search part** panel on GenerateBlocks blocks inside the Search:

* **The field** – the box around the input. Style its border, background, padding, font and colour here; the input takes on its font and colour, and the field gets a focus outline while the visitor types (change it with `&:focus-within`).
* **The input** – a Text block that becomes a real search input on the site. Its text is the placeholder; on a search results page it shows what was searched for.
* **The search button** – a Text block set to `<button>`. It can be just an icon.
* **A visible label** (optional) – becomes a real `<label>` for the input.
* **A button that opens the field** – the expanding style's icon. Put the field next to it.

Why style the field rather than the input? Themes (GeneratePress included) style every search input with selectors stronger than GenerateBlocks', so the plugin resets the input and lets the field carry the look.

= Search: settings =

* **Search only** – tick the content types to search. Nothing ticked searches everything, like WordPress's own search.
* **Label** – what screen readers hear for the input and icon-only buttons ("Search" by default). Say what's searched, e.g. "Search products".

One type WordPress can search by itself (Posts, Products) is sent as WordPress's own `post_type`, so WooCommerce shows its product results. Pages (which WordPress can't search on their own) or several types are sent as `tmb_types` and applied to the main search query. Only content types visitors can already view are accepted, so editing the URL can't reach private content.

= Search: accessibility =

* A search landmark (`<form role="search">`), and the input always has a name: the visible label, or the Label setting.
* Icon-only buttons are named after the Label setting.
* The expanding style's icon is a real button with `aria-expanded` and `aria-controls`. Opening it moves focus to the input; Escape closes it and returns focus to the icon; clicking or tabbing away closes it. The field is moved sideways if it would stick out of the screen. No fade for visitors who prefer reduced motion.
* Without JavaScript the expanding style's field is simply shown.

No script loads except for the expanding style (about 1 KB, only on pages using it); a few lines of CSS load on pages with a Search block.

= Entrance animations =

Select any GenerateBlocks 2 block (or GenerateBlocks Pro block) and open the **Entrance animation** panel. The legacy GenerateBlocks 1.x blocks aren't supported.

* **Animation** – None, Fade in, Fade up, Fade down, Slide in from the left, Slide in from the right, Zoom in.
* **Speed** – Fast (400 ms), Normal (700 ms) or Slow (1100 ms).
* **Delay** – 0 to 2000 ms.
* **Animate the blocks inside one by one** – on blocks that hold other blocks. The block stays put and each block inside it animates in turn, with a **Time between each** you choose. Great for grids, cards and query loops: for a query loop, set it on the **Looper** block.
* **Preview** button to play it in the editor.
* **Replay button** – turn this on for a block (best a Text block set to Button) and clicking it plays the entrance animations again. List the HTML IDs of the sections to replay, or leave it empty for the whole page. Only what's on screen replays straight away (blocks below it play when scrolled to), and the button never hides itself. Offered on blocks with nothing inside them.

Tip: don't animate the first thing visitors see (a hero heading or image). It stays hidden until the script runs, which can slow the page's Largest Contentful Paint (LCP) score.

Each animation plays once, when the block scrolls into view (or again from a replay button). The settings are stored as HTML attributes on the block (`data-tmb-animate`, `data-tmb-speed`, `data-tmb-delay`, `data-tmb-animate-children`, `data-tmb-replay`), which you can see in GenerateBlocks' HTML Attributes panel.

Built to be light and safe:

* Nothing loads on pages without an animation or a replay button. Pages with one get a ~3.7 KB script (1.6 KB gzipped) and ~750 bytes of CSS.
* Uses the Web Animations API with opacity, translate and scale, animating to the block's own styles, so GenerateBlocks transforms and hover transitions keep working.
* No flash: blocks are only hidden while waiting to animate when JavaScript is running and the visitor hasn't asked for reduced motion. If the script is blocked or delayed, everything is shown after 4 seconds anyway.
* Visitors who prefer reduced motion see no animation.
* Keyboard users who tab into a block that hasn't animated in yet see it straight away.
* Replay buttons work like real buttons before JavaScript runs (`type="button"`, or `role="button"` and keyboard focus, plus `aria-controls`), respond to Enter and Space, and are hidden for visitors who prefer reduced motion or have JavaScript off.
* For developers: `window.tmbAnimate.init( container )` for content added with AJAX, `window.tmbAnimate.replay( element )` to replay animations (no argument: whole page), the `thingamablocks_animation_head_markup` filter, and the `.tmb-in` class (added when a block animates) and `html.tmb-animate-js` for CSS.

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

= Video backgrounds =

Select a GenerateBlocks Element block (a container) and open the **Video background** panel. Paste a **Video address**:

* **Bunny** – an .mp4 or .webm address on *.b-cdn.net. With Bunny Stream, turn on "MP4 Fallback" in the library's Encoding settings, then use https://(the library's CDN hostname, from its API tab)/(the video ID)/play_720p.mp4. Paste the video's Direct Play URL into the panel and it shows that address with the ID filled in. HLS streams (.m3u8) and Bunny's player page aren't accepted; the panel explains why. A Bunny pull zone on your own hostname works once an administrator adds the hostname under Settings → Thingamablocks → **Your own Bunny hostnames**.
* **Vimeo** – a video file link (on paid Vimeo plans; plays straight in the page, the lightest option), or the video's normal address (vimeo.com/123456789, or vimeo.com/123456789/abcdef for an unlisted video), which plays with Vimeo's background player (needs a paid Vimeo plan for background embeds). Vimeo's player loads only when it's time to play, with `dnt=1`, so Vimeo sets no tracking cookies.

YouTube and Media Library uploads aren't supported (see the FAQ). Then:

* **Poster image** – from the Media Library, with a focal point. Shows straight away, while the video loads, and is all that visitors who prefer less motion or are saving data see. The panel warns you until there is one.
* **First thing on the page** – for a hero: the poster loads straight away and first (`fetchpriority="high"`). Otherwise it's lazy-loaded.
* **Playback** – Loop, or Play once (then **When it ends**: stay on the last frame, or back to the poster).
* **Speed** – half, 0.75×, normal or 1.25×.
* **On phones** – Video (with an optional **Smaller video for phones**, e.g. play_480p.mp4, for screens under 768px) or Poster only.
* **Vimeo video shape** – 16:9, 21:9, 4:3, 1:1 or 9:16, so Vimeo's player can be scaled to fill the section.
* **Overlay** – a colour from your palette (or GB Pro design tokens) and its opacity (0–90%), so text on the video stays readable.
* **Pause button position** – any corner. Or use your own: add a GenerateBlocks Text block set to Button inside the container, and turn on **Video pause/play button** in its Video background panel. Style it with `&[data-state="playing"]` and `&[data-state="paused"]`.
* **Remove video background**.

How it behaves:

* The page's HTML holds only the poster (a responsive image with srcset), the overlay and the button. A small deferred script adds the video once the page has finished loading, and only when the section is on screen or nearly. It pauses when the section scrolls away or the tab is hidden, and fades in over the poster when it starts.
* Always muted and inline, with no controls, picture-in-picture or casting. Hidden from screen readers and never focusable.
* Visitors who prefer reduced motion, have Data Saver on or are on 2G, or paused a background video before (remembered across the site) get the poster, with a Play button. Pausing one background video pauses all of them on the page.
* If the browser blocks autoplay (iOS Low Power Mode, say), the button offers Play. If the video can't load, the poster stays and the button goes.
* The pause/play button is always there when a video can play (WCAG 2.2.2): a real button, labelled "Pause background video" / "Play background video", with a focus ring that shows on any video and a border in high-contrast mode. Without JavaScript nothing moves, so the button stays hidden.
* Nothing loads on pages without a video background. Pages with one get a ~6.3 KB script (2.7 KB gzipped) and ~2.3 KB of CSS.
* Safe with Authors and Contributors: the address is checked on the server every time the page is built (only Bunny and Vimeo, over https), the script's settings are rebuilt from the checked values, and the overlay colour, focal point, speed, positions and the rest are limited to allowed values.
* Stored as JSON in the container's `data-tmb-video` HTML attribute (only the settings you change).
* For developers: `window.tmbVideo.init( container )` for content added with AJAX, `element.tmbVideo.play()` / `.pause()`, and custom properties for the default button (`--tmb-video-button-size`, `--tmb-video-button-background`, `--tmb-video-button-background-hover`, `--tmb-video-button-color`, `--tmb-video-button-inset`).

= FAQ schema =

Needs GenerateBlocks Pro 2.x (the Accordion is a Pro block). Select the **Accordion** (the outer block, not an item), open the **FAQ schema** panel and turn on **Add FAQ structured data**. The panel lists the questions that will be included and warns about any items left out because their title or content is empty.

* Each item's title (without its icon) is the question, and its content the answer.
* Read from the accordion every time the page loads, so the structured data always matches what visitors see. Edit the accordion and the schema follows; there's nothing to keep in sync.
* Answers keep only the HTML Google reads in FAQ answers: paragraphs, headings, lists, links, line breaks, bold and italic. Images, icons and CSS are removed.
* Items hidden by block conditions are left out. An accordion inside an answer keeps its own items; it's only included if it has FAQ schema switched on too.
* Several FAQ accordions on one page are combined into one FAQPage, printed once in the footer. A question that appears twice is listed once.
* Nothing else loads: no script or CSS, just the structured data.
* Stored as `data-tmb-faq="true"` in the accordion's HTML attributes.
* For developers: the `thingamablocks_faq_schema` filter changes the data; return `null` to print nothing (for instance if your SEO plugin already adds an FAQPage to that page).

An honest note: since August 2023 Google only shows FAQ rich results for well-known government and health websites. The structured data is still valid, and search engines and AI tools still read it to understand the page, but it won't make your Google listing bigger.

= Requirements =

* WordPress 6.6 or newer (tested up to 7.1)
* PHP 7.4 or newer
* GenerateBlocks 2.0 or newer (the free plugin is enough; FAQ schema needs GenerateBlocks Pro 2.x for its Accordion block, and the blocks' starting layouts get their look from GenerateBlocks Pro Global Styles)

Tested with GenerateBlocks 2.4.1. Not yet tested with GenerateBlocks Pro.

= Source code =

The plugin zip contains the compiled JavaScript and CSS in `build/`. The human-readable source (`src/`), build configuration and developer tools are in the GitHub repository: https://github.com/Calvin-Susan/thingamablocks. It builds with `npm install` and `npm run build` (`@wordpress/scripts`).

== Installation ==

1. Install and activate GenerateBlocks 2.0 or newer.
2. Upload the `thingamablocks` folder to `/wp-content/plugins/`, or upload the zip under Plugins → Add New → Upload Plugin.
3. Activate **Thingamablocks**.
4. In the block editor, open the inserter and find **Toggle**, **Countdown**, **Marquee**, **Dropdown**, **Breadcrumbs** and **Search** in the GenerateBlocks category, or the ready-made sections under Patterns → Toggles, Patterns → Countdowns, Patterns → Marquees and Patterns → Dropdowns. Select any GenerateBlocks block to find the **Entrance animation** panel in its sidebar, a GenerateBlocks Image block to find the **Mask** panel, a GenerateBlocks Element block to find the **Video background** panel, and (with GenerateBlocks Pro) an Accordion block to find the **FAQ schema** panel.
5. Optional: under **Settings → Thingamablocks** (also linked from the Plugins screen), switch off any blocks or features you don't need, and add your own Bunny hostnames for video backgrounds.

== Frequently Asked Questions ==

= Does it need GenerateBlocks Pro? =

No. It only needs the free GenerateBlocks plugin, version 2.0 or newer. The exceptions: FAQ schema adds to GenerateBlocks Pro's Accordion block, so it needs GenerateBlocks Pro 2.x; and the blocks' starting layouts are styled with GenerateBlocks Pro Global Styles, so with free GenerateBlocks every block works but the layouts are unstyled (style the parts yourself). The rest of the plugin hasn't been tested with GenerateBlocks Pro yet.

= Why does nothing happen when I click the toggle in the editor? =

That's on purpose: in the editor, clicking selects blocks so you can edit them. To preview the other state, use the **On/Off** button in the Toggle's block toolbar (or the "Starts as" setting). The editor then shows that state so you can style it. The toggle works on the front end.

= How do I give an element an ID so the toggle can find it? =

Select the element (for example the Element block wrapping your monthly prices), open its Settings, and in **HTML Attributes** add an attribute named `id` with a value such as `monthly-prices`. Core blocks use **Advanced → HTML anchor** instead. The toggle's target fields suggest every ID on the page and warn you if one can't be found.

= Where do the dark mode colours come from? =

From your own CSS. Write your colours (GeneratePress global colours, GB Pro design tokens) with `light-dark()`, e.g. `--base-3: light-dark(#ffffff, #16161a)`, and they follow the `color-scheme` the toggle sets. Add `:root { color-scheme: light dark; }` so the site matches the visitor's device until they choose. Once the post, page or GeneratePress Element containing the toggle is published, the no-flash script is printed site-wide; removing the toggle or trashing the post switches it off again.

For anything else (images, hard-coded colours), use CSS, for example `[data-color-scheme="dark"] .site-logo img { filter: invert(1); }`, or override plain variables: `[data-color-scheme="dark"] { --base-3: #16161a; }`.

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

Yes. Go to **Settings → Thingamablocks** (administrators only), turn off the switch for any block or feature, and save. A switched-off block leaves the inserter and its patterns leave the Patterns tab; a switched-off feature's panel no longer appears in the sidebar. It only hides them: pages already using a block keep working and can still be edited (WordPress may not let you duplicate or paste it until it's switched back on), and existing animations, masks, video backgrounds and FAQ schema stay. The page shows how many items use each one, so you can see what's safe to hide. Everything is on by default.

= Will animations slow my site down? =

No. Pages without an animation load nothing extra. Pages with one load a ~3.7 KB script (1.6 KB gzipped; deferred, in the footer) and ~750 bytes of CSS. Keep animations off the hero at the top of the page, though: an animated block stays hidden until the script runs, which can slow your LCP score. The animations use the browser's Web Animations API on opacity, translate and scale, which the browser can run smoothly without re-laying out the page, and each one plays only once.

= Do animations work with caching/optimisation plugins? =

Yes. Page caching makes no difference: the settings are attributes in the HTML. "Remove unused CSS" can't break the animations, because they're run by the script rather than CSS keyframes. If a plugin delays or blocks JavaScript, nothing stays hidden: a fail-safe shows every animated block after 4 seconds. For the animations themselves to play on load, exclude `build/animations/view.js` from JavaScript delaying.

= Why doesn't my animation play in the editor? =

On purpose: animations don't play on their own in the editor, so blocks never disappear while you're working on them. Choosing an animation plays it once, and the **Preview** button in the Entrance animation panel plays it again. It plays as the block scrolls into view on the front end.

= Will FAQ schema get my FAQs shown in Google? =

Probably not as a rich result. Since August 2023 Google only shows FAQ rich results for well-known government and health websites. The FAQPage structured data is still valid and still read by search engines (to understand the page) and by AI search tools, so it's worth having on a real FAQ, but it won't make your search listing bigger.

= Will FAQ schema clash with my SEO plugin? =

No: on a page with a Yoast SEO or Rank Math FAQ block (which add their own FAQPage), Thingamablocks prints nothing. If you add FAQ schema some other way (Rank Math's Schema Generator, say), switch FAQ schema off on that accordion, or use the `thingamablocks_faq_schema` filter and return `null`.

= Can the Search block search only WooCommerce products? =

Yes. Tick **Products** under **Search only** in the block's sidebar. The search then goes to WooCommerce's own product results page. You can tick several types too (Pages and Posts, say), and the results page shows only those.

= Why only Bunny and Vimeo for video backgrounds? =

Speed, privacy and safety. Video files are big, and most WordPress hosts serve them slowly, so Media Library uploads aren't offered: a video CDN does the job far better. Bunny serves plain MP4 files cheaply and fast, and they play in an ordinary `<video>` with no player script. Vimeo is what many sites already use, and its background player is made for this. YouTube isn't supported: its player is heavy, sets cookies, and shows its own title, logo and suggested videos, which don't belong behind a section. HLS streams (.m3u8) and Bunny's own player page would need a player script too, so use Bunny's MP4 fallback instead. A short list also means the server can check every address, so nobody editing a page can point a background somewhere else. If your Bunny pull zone uses your own hostname, add it under Settings → Thingamablocks.

= Will a video background slow my page down? =

Very little. The video isn't in the page's HTML: visitors first get the poster image (which, with **First thing on the page** on, loads first and fast, for a good LCP score), and the video is only added once the page has finished loading and the section is on screen. Phones can get a smaller video or just the poster, and visitors saving data or preferring reduced motion get the poster only. Pages without a video background load nothing extra.

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
* Entrance animations for every GenerateBlocks 2 / GB Pro block: fade, slide or zoom in on scroll, or animate the blocks inside one by one. ~1.6 KB gzipped, reduced-motion support and a no-JavaScript fail-safe.
* Patterns: pricing table with monthly/annual toggle, sale banner with countdown, launch countdown, and logo strip, all translatable.
* Nothing loads on pages that don't use the plugin (except the small dark mode head script, once a dark mode toggle is published).
* Safe for Authors and Contributors: target selectors are strictly sanitised, and toggles don't show as invalid blocks.
* Removes its options when deleted.
