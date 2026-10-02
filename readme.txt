=== Thingamablocks ===
Contributors: ogalweb
Tags: generateblocks, marquee, countdown timer, dark mode, toggle
Requires at least: 6.6
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A completely unnecessary ultimate add-ons power-pack for GenerateBlocks.

== Description ==

Thingamablocks adds six blocks to the GenerateBlocks category in the block inserter, plus entrance animations, image masks, video backgrounds and FAQ schema for the GenerateBlocks blocks you already use.

Like the Accordion and Tabs blocks in GenerateBlocks Pro, each block is a settings-only wrapper. Everything you see (the switch, the numbers, the logos, the button and drawer, the breadcrumb links, the search field) is an ordinary GenerateBlocks Element, Text, Shape or Media block, styled with the GenerateBlocks Styles panel you already know. The wrapper only holds the behaviour, and the server renders the right roles and state before any JavaScript runs.

Nothing from the plugin loads on pages that don't use it. Each block's small script and CSS load only on pages with that block; image masks and FAQ schema load no script or CSS at all. The one exception is dark mode: once a dark mode toggle is published, a tiny script in `<head>` applies the visitor's choice on every page, so there's no flash of the wrong colours.

The full guide, with every part, layout, setting, accessibility detail and developer hook, is in the README on GitHub: https://github.com/Calvin-Susan/thingamablocks#readme

= Toggle =

A switch or a pair of buttons that shows and hides elements (monthly / annual pricing is the classic), switches light and dark mode, or adds and removes classes. Four starting layouts, sync groups, a remembered choice applied before the page paints, a real `role="switch"` with keyboard support, and a `tmb-toggle:change` event for your own code.

= Countdown =

Counts down to a date and time (in the site's time zone), a per-visitor evergreen deadline, or a time that repeats on chosen weekdays. When it ends it can show a message, stay at zero, disappear, hide or show other elements, or send visitors to another page. The numbers are written by the server, so cached pages correct themselves on load.

= Marquee =

A smooth, endless scrolling strip of logos, messages, headlines or testimonial cards, left, right, up or down, with faded edges. It always has a pause button (WCAG 2.2.2), pauses on keyboard focus and off screen, hides its copies from screen readers, and gives visitors who prefer reduced motion a still row they can scroll.

= Dropdown =

A button that opens a drawer of links, downloads or any other blocks. The drawer lines up with the button, flips above it when there isn't room, and stays on screen. It follows the WAI-ARIA disclosure pattern: Escape closes it, the Down arrow opens it, and only one is open at a time. Four reveal animations (or none).

= Breadcrumbs =

The path to the current page (Home › Blog › Category › Post), worked out on the server for whatever page is being viewed, so you can place it once in a GeneratePress Element, a template or a widget. Handles pages, posts (with the primary category from Yoast SEO, Rank Math or SEOPress), custom post types, archives, search, 404 and WooCommerce. Adds breadcrumb structured data, on by default: switch it off in the block if your SEO plugin adds its own (Yoast SEO does by default, Rank Math does when its breadcrumbs are on, Slim SEO does). Long trails can collapse to Home › … › Page.

= Search =

A search form built from GenerateBlocks blocks, so it looks like the rest of your site. Tick the content types to search (just products, just pages…), and results show on your theme's normal search results page. Four starting styles, including a search icon that opens a field. No script unless you use that expanding style.

= Entrance animations =

An Entrance animation panel on every GenerateBlocks 2 and GenerateBlocks Pro block: fade, slide or zoom a block in as it scrolls into view, or animate the cards in a grid or query loop one by one. A ~1.6 KB (gzipped) script using the Web Animations API, only on pages with an animation, with reduced-motion support and a fail-safe that shows everything if the script is blocked.

= Image masks =

A Mask panel on the GenerateBlocks Image block: cut an image to a wave, a curve, any shape in the GenerateBlocks shape library, or your own SVG (cleaned in the browser, never uploaded to the Media Library). Different settings for tablet and mobile. The mask is saved in the image's GenerateBlocks CSS, so nothing extra loads.

= Video backgrounds =

A Video background panel on the GenerateBlocks Element block: a muted Bunny or Vimeo video behind a section, with a poster image, an overlay colour and a pause button. The video is added only after the page has loaded and only when the section is on screen; visitors who prefer reduced motion or are saving data get the poster. Addresses are checked on the server, so only Bunny and Vimeo over https are ever played.

= FAQ schema =

With GenerateBlocks Pro, one switch on the Accordion block adds schema.org FAQPage structured data, built from the accordion's own questions and answers every time the page loads, so it always matches what visitors see. Several FAQ accordions on a page are combined into one FAQPage.

= Settings =

Under Settings → Thingamablocks you can switch off any block or feature you don't use: it leaves the inserter or sidebar, while anything already built with it keeps working. Each switch shows how many posts, pages, templates and Elements use it. **Speeds** sets what Fast, Normal and Slow mean, in milliseconds, for dropdowns and entrance animations across the site. Administrators can also add their own Bunny hostnames for video backgrounds.

= Starting layouts and Global Styles =

Each block's starting layouts are styled with shared GenerateBlocks Pro Global Styles (about 75 classes, such as `tmb-search__field` and `tmb-search__field--pill`), created once in a "Thingamablocks" category and never overwritten, so your edits are safe. Edit a class to restyle every block that uses it. Without GenerateBlocks Pro every block still works, but the layouts are unstyled.

= Requirements =

* WordPress 6.6 or newer (tested up to 7.1)
* PHP 7.4 or newer
* GenerateBlocks 2.0 or newer (the free plugin is enough; FAQ schema needs GenerateBlocks Pro 2.x for its Accordion block, and the blocks' starting layouts get their look from GenerateBlocks Pro Global Styles)

Tested with GenerateBlocks 2.4.1 (free) and GenerateBlocks Pro 2.x on a live site (and Pro 2.8 locally).

= Source code =

The plugin zip contains the compiled JavaScript and CSS in `build/`. The human-readable source (`src/`), build configuration and developer tools are in the GitHub repository: https://github.com/Calvin-Susan/thingamablocks. It builds with `npm install` and `npm run build` (`@wordpress/scripts`).

== Installation ==

1. Install and activate GenerateBlocks 2.0 or newer.
2. Upload the `thingamablocks` folder to `/wp-content/plugins/`, or upload the zip under Plugins → Add New → Upload Plugin.
3. Activate **Thingamablocks**.
4. In the block editor, open the inserter and find **Toggle**, **Countdown**, **Marquee**, **Dropdown**, **Breadcrumbs** and **Search** in the GenerateBlocks category; each offers a choice of starting layouts. Select any GenerateBlocks block to find the **Entrance animation** panel in its sidebar, a GenerateBlocks Image block to find the **Mask** panel, a GenerateBlocks Element block to find the **Video background** panel, and (with GenerateBlocks Pro) an Accordion block to find the **FAQ schema** panel.
5. Optional: under **Settings → Thingamablocks** (also linked from the Plugins screen), switch off any blocks or features you don't need, set what Fast / Normal / Slow mean for dropdowns and entrance animations (Speeds), and add your own Bunny hostnames for video backgrounds.

== Frequently Asked Questions ==

= Does it need GenerateBlocks Pro? =

No. It only needs the free GenerateBlocks plugin, version 2.0 or newer. The exceptions: FAQ schema adds to GenerateBlocks Pro's Accordion block, so it needs GenerateBlocks Pro 2.x; and the blocks' starting layouts are styled with GenerateBlocks Pro Global Styles, so with free GenerateBlocks every block works but the layouts are unstyled (style the parts yourself).

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

Only if your SEO plugin adds breadcrumb structured data too. Yoast SEO does by default (even with its breadcrumbs off), Rank Math does when its breadcrumbs are switched on, and Slim SEO does, so switch **Breadcrumb structured data** off in the block's Search engines panel there. SEOPress only does with its own (Pro) breadcrumbs switched on. Either way, the block never prints it more than once per page.

= Can I hide blocks I don't use? =

Yes. Go to **Settings → Thingamablocks** (administrators only), turn off the switch for any block or feature, and save. A switched-off block leaves the inserter; a switched-off feature's panel no longer appears in the sidebar. It only hides them: pages already using a block keep working and can still be edited (WordPress may not let you duplicate or paste it until it's switched back on), and existing animations, masks, video backgrounds and FAQ schema stay. The page shows how many items use each one, so you can see what's safe to hide. Everything is on by default.

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

= 1.0.0 =
First public release.

* Toggle block: show/hide elements, light/dark mode (switches `color-scheme` on `<html>`, with a no-flash head script), add/remove classes, or custom code. Four starting layouts, sync groups, remembered choices and server-rendered accessibility.
* Countdown block: count to a date, a per-visitor (evergreen) deadline, or a repeating time. End actions: message, stay at zero, disappear, hide/show elements, redirect. Numbers are rendered on the server.
* Marquee block: a smooth, endless scrolling strip (left, right, up or down) with a pause button, faded edges, keyboard and reduced-motion support.
* Dropdown block: a button that opens a drawer of links, downloads or any blocks, following the WAI-ARIA disclosure pattern.
* Breadcrumbs block: the trail for any page, worked out on the server, with BreadcrumbList structured data and collapsing long trails.
* Search block: a GenerateBlocks-styled search form that can search only chosen content types, including WooCommerce products.
* Entrance animations for every GenerateBlocks 2 / GB Pro block: fade, slide or zoom in on scroll, or one by one.
* Image masks for the GenerateBlocks Image block, from the shape library or your own SVG.
* Video backgrounds (Bunny and Vimeo) for the GenerateBlocks Element block, with a poster, overlay and pause button.
* FAQ schema for the GenerateBlocks Pro Accordion block.
* Settings → Thingamablocks: switch blocks and features off, set site-wide Speeds, and add your own Bunny hostnames.
* Starting layouts styled with shared GenerateBlocks Pro Global Styles.
* Nothing loads on pages that don't use the plugin (except the small dark mode head script, once a dark mode toggle is published).
* Safe for Authors and Contributors: settings are sanitised on the server and re-checked in the browser.
* Removes its options when deleted.

== Upgrade Notice ==

= 1.0.0 =
First public release.
