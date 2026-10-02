# Thingamablocks

A completely unnecessary ultimate add-ons power-pack for GenerateBlocks.

Blocks for [GenerateBlocks](https://wordpress.org/plugins/generateblocks/) 2.x, by [OGAL Web Design](https://ogalweb.com) (Kyle Van Deusen).

| Block | Name | What it does |
| --- | --- | --- |
| [**Toggle**](#toggle-block) | `thingamablocks/toggle` | A switch or pair of buttons that shows/hides elements, switches light/dark mode, or toggles classes. |
| [**Countdown**](#countdown-block) | `thingamablocks/countdown` | A countdown timer to a date, a per-visitor (evergreen) deadline, or a time that repeats. |
| [**Marquee**](#marquee-block) | `thingamablocks/marquee` | A smooth, endless scrolling strip of logos, messages, headlines or cards, left/right or up/down. |
| [**Dropdown**](#dropdown-block) | `thingamablocks/dropdown` | A button that opens a drawer of links, downloads or any other blocks. |
| [**Breadcrumbs**](#breadcrumbs-block) | `thingamablocks/breadcrumbs` | The path to the current page (Home › Blog › Category › Post), worked out automatically for whatever page is being viewed, with breadcrumb structured data for search engines. |
| [**Search**](#search-block) | `thingamablocks/search` | A search form you style like any other GenerateBlocks blocks, that can search only the content types you choose (just products, just pages…), including an icon that opens a search. |

Plus [**Entrance animations**](#entrance-animations) for every GenerateBlocks block: an "Entrance animation" panel that fades, slides or zooms a block in when it scrolls into view, or animates the blocks inside it one by one.

And [**Image masks**](#image-masks) for the GenerateBlocks Image block: a "Mask" panel that crops an image to a shape from the GenerateBlocks shape library, or to an SVG of your own.

And [**Video backgrounds**](#video-backgrounds) for the GenerateBlocks Element block: a "Video background" panel that plays a muted Bunny or Vimeo video behind a container, like a background image, with a poster image, an overlay and a pause button, and the video loaded only once the page has.

And [**FAQ schema**](#faq-schema) for the GenerateBlocks Pro Accordion block: an "FAQ schema" panel that tells search engines the accordion is a list of questions and answers (schema.org `FAQPage` structured data), built from the accordion's own text.

All six blocks sit in the GenerateBlocks category of the inserter, and all work the same way as the Accordion and Tabs blocks in GenerateBlocks Pro: the block itself is a **settings-only wrapper**. Everything you see is a real GenerateBlocks Element, Text, Shape or Media block, styled in the GB Styles panel, with global styles, the same way as the rest of the page. The wrapper only holds behaviour.

**Requirements:** WordPress 6.6+ (tested up to 7.1), PHP 7.4+, GenerateBlocks 2.0+. Tested with GenerateBlocks 2.4.1 (free). Not yet tested with GenerateBlocks Pro. FAQ schema needs GenerateBlocks Pro 2.x, since the Accordion block is a Pro block (it's tested against the markup GB Pro 2.x saves, not yet on a live GB Pro site). The blocks' starting layouts get their look from GenerateBlocks Pro Global Styles (see [Starting layouts and Global Styles](#starting-layouts-and-global-styles)): with free GenerateBlocks every block works, but the layouts are unstyled. Everything else works with free GenerateBlocks.

**Light on pages that don't use it:** nothing from the plugin loads on a page without one of its blocks or an entrance animation. Image masks load nothing at all on the front end: the mask is part of the image's GenerateBlocks CSS. FAQ schema adds no script or CSS either, just the structured data itself (a `<script type="application/ld+json">` in the footer) on pages with an FAQ accordion. Video backgrounds load their small script and CSS only on pages with a video background, and the video itself only after the page has loaded. Each block's script (and the Toggle's, Dropdown's, Breadcrumbs' and Search's few lines of CSS) loads only on pages with that block. The Search block has no script at all unless it uses the expanding style. (The starting layouts' classes are GenerateBlocks Pro Global Styles, which GB Pro loads as one stylesheet on every page; they add around 18 KB to it, under 3 KB gzipped.) The one exception is dark mode: once a site has a published dark mode toggle, every page gets a tiny `<head>` script so the visitor's choice applies everywhere (see [The dark mode head output](#the-dark-mode-head-output)).

**Light on the editor, too:** don't need the Marquee, masks or video backgrounds? Switch them off under **Settings → Thingamablocks** and they leave the inserter and sidebar, without breaking anything already built with them (see [Settings](#settings)).

---

## Contents

- [Install](#install)
- [Settings](#settings)
- [Starting layouts and Global Styles](#starting-layouts-and-global-styles)
- [Toggle block](#toggle-block)
  - [Toggle quick start](#toggle-quick-start)
  - [How toggle parts and styling work](#how-toggle-parts-and-styling-work)
  - [Toggle settings](#toggle-settings)
- [Countdown block](#countdown-block)
  - [Countdown quick start](#countdown-quick-start)
  - [How countdown parts and styling work](#how-countdown-parts-and-styling-work)
  - [Countdown settings](#countdown-settings)
- [Marquee block](#marquee-block)
  - [Marquee quick start](#marquee-quick-start)
  - [How marquee parts and styling work](#how-marquee-parts-and-styling-work)
  - [Marquee settings](#marquee-settings)
- [Dropdown block](#dropdown-block)
  - [Dropdown quick start](#dropdown-quick-start)
  - [How dropdown parts and styling work](#how-dropdown-parts-and-styling-work)
  - [Dropdown settings](#dropdown-settings)
- [Breadcrumbs block](#breadcrumbs-block)
  - [Breadcrumbs quick start](#breadcrumbs-quick-start)
  - [What the trail looks like](#what-the-trail-looks-like)
  - [How breadcrumb parts and styling work](#how-breadcrumb-parts-and-styling-work)
  - [Breadcrumbs settings](#breadcrumbs-settings)
  - [Breadcrumbs and SEO plugins](#breadcrumbs-and-seo-plugins)
- [Search block](#search-block)
  - [Search quick start](#search-quick-start)
  - [How search parts and styling work](#how-search-parts-and-styling-work)
  - [Search settings](#search-settings)
  - [Searching only some content types](#searching-only-some-content-types)
- [Entrance animations](#entrance-animations)
  - [Entrance animation recipes](#entrance-animation-recipes)
  - [Entrance animation settings](#entrance-animation-settings)
- [Image masks](#image-masks)
  - [Image mask recipes](#image-mask-recipes)
  - [Image mask settings](#image-mask-settings)
- [Video backgrounds](#video-backgrounds)
  - [Video background recipe](#video-background-recipe)
  - [Video background settings](#video-background-settings)
  - [How a video background behaves](#how-a-video-background-behaves)
  - [Why only Bunny and Vimeo?](#why-only-bunny-and-vimeo)
- [FAQ schema](#faq-schema)
  - [FAQ schema recipe](#faq-schema-recipe)
  - [What goes into the schema](#what-goes-into-the-schema)
  - [FAQ schema and SEO plugins](#faq-schema-and-seo-plugins)
- [Developer API](#developer-api)
- [How it's built](#how-its-built)
- [Development](#development)
- [File map](#file-map)

---

## Install

1. Install and activate GenerateBlocks 2.0 or newer. (The plugin header declares `Requires Plugins: generateblocks`, so WordPress won't activate this plugin without it. If GB is later deactivated or is a 1.x version, an admin notice says so.)
2. Upload `thingamablocks.zip` under **Plugins → Add New → Upload Plugin** and activate it.
   To build the zip yourself, see [Development](#development).
3. In the block editor, open the inserter. **Toggle**, **Countdown**, **Marquee**, **Dropdown**, **Breadcrumbs** and **Search** are in the GenerateBlocks category; ready-made sections are under **Patterns → Toggles**, **Patterns → Countdowns**, **Patterns → Marquees** and **Patterns → Dropdowns**. Select any GenerateBlocks block to find the **Entrance animation** panel in its sidebar, a GenerateBlocks Image block to find the **Mask** panel, a GenerateBlocks Element block (a container) to find the **Video background** panel, and (with GenerateBlocks Pro) an Accordion block to find the **FAQ schema** panel.

---

## Settings

**Settings → Thingamablocks** (or the **Settings** link under the plugin on the Plugins screen; administrators only) has an on/off switch for each block and feature, in two cards. Everything is on by default.

- **Blocks** – Toggle, Countdown, Marquee, Dropdown, Breadcrumbs and Search. On means the block is in the block inserter.
- **Features** – Entrance animations, Image masks, Video backgrounds and FAQ schema. On means the panel shows in the editor.

Each item has its name, a one-line description and where it's used ("In use on 3 items" or "Not used anywhere yet"), with its switch beside it, counting posts, pages, templates, synced patterns and GeneratePress Elements in any status except the trash. Animations are counted by blocks with an entrance animation, masks by GenerateBlocks blocks with an image mask in their styles, video backgrounds by containers with a video background, and FAQ schema by accordions with **Add FAQ structured data** on.

The switches are ordinary checkboxes styled as switches (with `role="switch"`, so screen readers announce them as "on" / "off"), work from the keyboard with Tab and Space, and take their "on" colour from your admin colour scheme (Users → Profile). Their styles load only on this page. Nothing changes until you press **Save Changes**.

**Switching off only hides things.** Nothing on your site changes:

- A switched-off **block** leaves the inserter, and its patterns leave the Patterns tab. It stays registered, so pages already using it keep working on the site and can still be edited. WordPress may not let you duplicate or paste it while it's switched off (a block that's out of the inserter can't always be added again by other routes); switch it back on for that.
- A switched-off **feature**'s sidebar panel (Entrance animation, Mask, Video background, FAQ schema) no longer loads in the editor. Existing animations keep animating, existing masks stay, existing video backgrounds keep playing, and accordions that already have FAQ schema keep printing it.

Switch it back on whenever you like. Deleting the plugin removes this setting.

Below the switches, a **Video backgrounds** card has one field, **Your own Bunny hostnames**. Bunny's own addresses (`*.b-cdn.net`) and Vimeo always work. If a Bunny pull zone uses your own hostname (like `video.example.com`), add it here, one per line. Only videos from these places can be used, so nobody editing a page can point a background at anything else. (A pasted address is cut down to its hostname.)

---

## Starting layouts and Global Styles

When you insert a block you pick a starting layout. Those layouts don't put styles on each block: each part gets shared **GenerateBlocks Pro Global Styles** classes instead, a base class for the part plus a modifier where a layout differs (the BEM naming idea, `tmb-block__part--modifier`), e.g. `tmb-search__field` + `tmb-search__field--pill`. Each block's section lists its classes.

- **Restyle every one on the site** by editing a class in GB's Styles panel (or under the **Thingamablocks** category of your Global Styles).
- **One looks different?** Remove or swap a class on that block, or add local styles on top in the Styles panel as usual.
- **A few styles stay local on purpose**, so restyling a class can't break anything: the Countdown's visually hidden unit names, the Marquee row's `display: flex` (and `flex-direction: column` for vertical layouts), which the loop needs, and the Search input's `flex-grow`.
- **The colours are plain hex values for now**, not your GeneratePress global colours, so they don't follow your palette or dark mode until you change them in the classes.

**Where the classes come from.** The plugin creates them (about 75 in all) as ordinary Global Styles in a **Thingamablocks** category, the first time someone who can manage GB styles opens a wp-admin page after installing or updating to a version that adds classes. From then on they're the site's: the plugin never overwrites them, so your edits are safe, but improved defaults in a later version won't reach classes that already exist. Each class is created once, so a class you delete stays deleted. Classes for switched-off blocks are created when you switch the block on. (The category shows in GB Pro 2.8+; older versions list the classes ungrouped.)

Behind the scenes: they're only created on an ordinary admin page load, never in AJAX, REST or cron requests, and a lock stops two admin tabs loading at once from creating duplicates. GB Pro normally rebuilds its stylesheet after every Global Style is saved; that's paused while the classes are created and done once at the end. Progress is saved after each class, so a run that's cut short carries on next time.

**Needs GenerateBlocks Pro.** Global Styles are a Pro feature. With free GenerateBlocks every block works, but the layouts insert unstyled: style the parts yourself in the Styles panel. GB Pro loads all Global Styles as one stylesheet on every page; the plugin's classes add around 18 KB to it (under 3 KB gzipped).

Blocks inserted with an older version keep the styles they were inserted with, and the patterns still use per-block styles.

---

## Toggle block

A toggle can:

- **Show / hide elements** – e.g. monthly vs. annual pricing.
- **Switch light / dark mode** – your `light-dark()` colours follow it, remembered per visitor, no flash on load.
- **Add / remove classes** on any elements.
- **Do nothing** – just hold an on/off state for your own code.

### Toggle quick start

When you insert a Toggle you're asked to pick a starting layout:

| Layout | What you get | Default action |
| --- | --- | --- |
| **Switch with labels** | "Monthly" text · switch · "Annual" text | Show / hide |
| **Segmented buttons** | Two `<button>`s side by side, active one highlighted, group labelled "Billing period" for screen readers | Show / hide |
| **Switch** | Just the switch (give it a label under Accessibility) | Show / hide |
| **Dark mode switch** | Switch with a sun/moon icon in the knob, label "Dark mode" | Light / dark mode |

The layouts are styled with shared Global Styles classes (see [Toggle classes](#toggle-classes)). The switch's "off" track is a mid grey (`#767680`) with enough contrast against both light and dark backgrounds, and the knob is white with a grey icon, so the switch reads the same in light and dark mode.

> **In the editor, clicking the switch doesn't flip it.** Clicking selects blocks so you can edit them. To see the other state, use the **On/Off** button in the Toggle's block toolbar. The actual toggling happens on the front end.

#### Fastest: the pricing pattern

The plugin registers a block pattern, **Pricing table with monthly/annual toggle**, in a **Toggles** pattern category (only while GenerateBlocks is active).

1. Open the inserter → **Patterns** tab → **Toggles**.
2. Insert **Pricing table with monthly/annual toggle**: a heading, a segmented Monthly / Annual toggle, and three plans (Starter, Pro, Business) in two versions.
3. It's already wired up: the monthly plans are in an Element with ID `pricing-monthly`, the annual plans in one with ID `pricing-annual`, and the toggle shows one or the other. Its sync group is `billing`, so a second toggle with the same group (say, at the bottom of the page) stays in step.
4. Edit the text and prices, restyle with the GB Styles panel, and publish.

Like all patterns, once inserted it's ordinary blocks – nothing links back to the pattern. The recipe below builds the same thing from scratch.

#### Recipe: monthly / annual pricing

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

#### Recipe: dark mode

1. Insert a Toggle and choose **Dark mode switch**. Put it wherever you want – most sites put it in the header, via a GeneratePress Element (Block – Site Header, Hook, etc.) or a template part.
2. Check the settings (already set by the layout):
   - When toggled: **Light / dark mode**
   - **Match the visitor's system setting**: on by default. Until the visitor uses the switch, they get dark mode if their device is set to dark.
   - **Also add a class to `<html>`**: optional, e.g. `is-dark`, if other CSS needs a class.
   - **Accessibility → Switch label**: "Dark mode" (already filled in).
3. **Write your colours with `light-dark()`.** The toggle doesn't store any colours: it sets the CSS `color-scheme` property on `<html>` to `light` or `dark`, and colours written as `light-dark( light value, dark value )` follow it. Put them in your GeneratePress global colours or GB Pro design tokens, e.g. `--base-3: light-dark(#ffffff, #16161a)`. Browser-drawn things (form controls, scrollbars) follow along too.
   - So the site matches the visitor's device before they touch the switch, also add `:root { color-scheme: light dark; }` to your CSS (or keep **Match the visitor's system setting** on).
   - To preview, set **State → Starts as** to *On* (or use the toolbar **On/Off** button): the editor canvas then switches to `color-scheme: dark`. Set it back to *Off* before publishing unless you want dark to be the default.
4. **Publish** the post, page or Element that contains the switch. From then on every page on the site gets the no-flash `<head>` script (see [The dark mode head output](#the-dark-mode-head-output)).

All dark mode toggles on a site share one state, and the choice is always remembered.

**Other elements (advanced).** Images, logos, or anything with a hard-coded colour won't change on their own. Style them with the `data-color-scheme` attribute the toggle sets on `<html>`, e.g. in **Appearance → Customize → Additional CSS**:

```css
[data-color-scheme="dark"] .site-logo img {
	filter: invert(1);
}
```

If your colours are plain values rather than `light-dark()`, override the variables instead:

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

#### Recipe: toggle a class (show a banner)

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

### How toggle parts and styling work

#### Toggle parts

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

#### Styling each state

Style parts with GenerateBlocks **nested selectors** on the part itself (in the Styles panel, the "&" selector options):

| What | Nested selector | Set it on |
| --- | --- | --- |
| Switch in the on state | `&[aria-checked="true"]` | the switch |
| Knob inside the switch | `&[aria-checked="true"] > *` | the switch – the layouts set `margin-inline-start: 1.5rem`, which slides the right way on RTL sites too |
| Active on/off label or button | `&[data-active="true"]` | the label or button |
| Anything, based on the whole toggle | `.tmb-toggle.is-on …` | global CSS (the wrapper has `is-on` or `is-off`) |

The starting layouts already use these – open the `tmb-toggle__switch` class to see a working example.

#### Toggle classes

The starting layouts' [Global Styles](#starting-layouts-and-global-styles):

| Class | Styles | Layouts |
| --- | --- | --- |
| `tmb-toggle__row` | The row holding the labels and switch | Switch with labels |
| `tmb-toggle__label` | "Monthly" / "Annual", darker while active | Switch with labels |
| `tmb-toggle__switch` | The track, its "on" colour, focus ring, and the knob's slide | All but Segmented buttons |
| `tmb-toggle__switch--dark-mode` | Swaps the sun for the moon while on | Dark mode switch |
| `tmb-toggle__knob` | The white knob | All but Segmented buttons |
| `tmb-toggle__icon` | The sun and moon icons in the knob | Dark mode switch |
| `tmb-toggle__icon--on` | Hides the moon until the switch is on | Dark mode switch |
| `tmb-toggle__segments` | The box around the two buttons | Segmented buttons |
| `tmb-toggle__segment` | Each button, highlighted while active | Segmented buttons |

The sun/moon swap spans two classes: `tmb-toggle__icon--on` hides the moon, and `tmb-toggle__switch--dark-mode` (with `&[aria-checked="true"] .gb-shape:first-child` / `:last-child`) hides the sun and shows the moon while the switch is on.

**The editor previews the starting state.** Use the **On/Off** toolbar button (or **State → Starts as**) to preview the other state while you style it. That button also changes which state visitors start in, so set it back when you're done.

The Toggle's own CSS is deliberately tiny, front end only, and loaded only on pages with a Toggle: a pointer cursor on parts, the hidden class, and a reduced-motion rule that switches off transitions and animations inside a toggle.

### Toggle settings

Select the Toggle block (the wrapper) to see these in the sidebar.

#### Toggle behaviour

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| When toggled | `action` | `showHide` | `showHide`, `colorScheme`, `toggleClass`, `none` |

**Targets** (Show when off / on, Elements – and the Countdown's Also hide / Also show): a bare word is an element ID (`monthly-prices`). The exceptions are `html`, `body`, `main`, `header`, `footer`, `nav`, `aside`, `article` and `section`: those mean the tag, unless the page has an element with that ID. Anything else (`.card`, `#site-header`, `[data-plan="annual"]`) is a CSS selector. Selectors can't contain `<`, `\`, `{`, `}`, `;`, `@`, CSS comments or `url(` anywhere, even inside quotes; the field warns about any it will ignore. If several elements share an ID (e.g. a pattern inserted twice), all of them are switched. A leading `#` on a plain ID is dropped when saved.

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

A colour-scheme toggle always remembers the choice and always shares one state with every other colour-scheme toggle (its group is `color-scheme`), so the Remember / Sync group settings are hidden for it.

**Add / remove a class**

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Elements | `classTargets` | `[]` | See Targets above |
| Class names | `classNames` | `""` | Space-separated |
| The class is | `classMode` | `addWhenOn` | `addWhenOn` or `removeWhenOn` |

**Nothing (custom code)** – no extra settings. The toggle changes its own state, classes and ARIA attributes and fires its event.

#### State

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Starts as | `defaultState` | `off` | The editor previews this state. The toolbar On/Off button flips it. |
| Remember the visitor's choice | `persist` | `false` | Saved in `localStorage` (see [Storage keys](#storage-keys)). |
| Sync group | `group` | `""` | Toggles with the same name stay in step; each still runs its own action. Normalised to lowercase `a-z`, `0-9`, `-`, `_`. `color-scheme` is reserved for dark mode. |

How the starting state is picked on the front end, first match wins:

1. A saved choice from any toggle in the same group that has "Remember" on.
2. For dark mode: the scheme the `<head>` script already applied, or the system setting.
3. **Starts as**.

A toggle added to the page later (see `window.tmbToggle.init`) follows its group if the group is already running.

When **Remember** is on and the toggle has a **Sync group** or an **HTML anchor**, a tiny inline script printed right after the toggle applies the saved choice before the page is first drawn, so the other pricing set (or the switch's knob) doesn't flash and jump. Dark mode toggles do the same from the scheme the `<head>` script applied. A remembering toggle with neither a group nor an anchor is still restored, just a moment later, when the main script runs.

#### Accessibility

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Switch label | `ariaLabel` | `""` | Added as `aria-label` on each switch part, and on a segmented control's `role="group"` wrapper (unless they already have one). If empty and the switch has no text, the "on" label is used via `aria-labelledby`. The panel opens with a warning when a switch has neither, or when a buttons-only toggle (like Segmented buttons) has no label, since screen readers announce the buttons as a group. |

#### Also supported

- **Advanced → HTML anchor** – printed as the wrapper's `id`. Useful for `window.tmbToggle`, and it gives "Remember" a stable key.
- **Advanced → Additional CSS class(es)**.
- **Margin** (block spacing support).

#### Accessibility behaviour

- Roles and state attributes are added on the server when the page renders, so they're correct before any JavaScript runs and can't be removed by accident in the editor.
- `aria-controls` lists the targets given as plain IDs (tag names and other selectors can't be referenced that way).
- Parts with `tabindex="0"` respond to Space and Enter; native buttons handle keys themselves.
- If a toggle hides the section it sits in (say, a monthly/annual switch inside each pricing set, synced by group), keyboard focus moves to the same part of a visible toggle in the group rather than getting lost.
- Transitions and animations are switched off for visitors with `prefers-reduced-motion: reduce`.
- WordPress normally strips `aria-checked` and `aria-pressed` from content saved by Authors and Contributors (users without `unfiltered_html`), which would make a saved Toggle show as "invalid" in the editor. The plugin allows those two plain ARIA state attributes through WordPress's content filter, so everyone who can edit posts can use Toggles.

---

## Countdown block

A countdown can count down to:

- **A date and time** – "Sale ends Friday at 5 pm". Same moment for every visitor, in the site's time zone.
- **A deadline per visitor (evergreen)** – "48 hours from your first visit". Each visitor's deadline is remembered in their browser, and can optionally start again when it runs out.
- **A time that repeats** – "Order by 2 pm for same-day dispatch", on chosen weekdays. It rolls over to the next one by itself.

When it ends it can show an "ended" message, stay at zero, or disappear, and can also hide or show other elements on the page and send the visitor to another page.

### Countdown quick start

When you insert a Countdown you pick a starting layout:

| Layout | What you get | Ended message |
| --- | --- | --- |
| **Boxes** (default) | Each unit (Days, Hours, Minutes, Seconds) in its own box, number above label | "This offer has ended." |
| **Inline text** | "Ends in 2d 5h 12m 9s", for banners and buttons. Starts with two-digit numbers off and "Hide units that reach zero" on, so it reads like a sentence. The short letters are visual only: screen readers hear "days", "hours" and so on from a visually hidden full word. | "This offer has ended." |
| **Large numbers** | Big numbers with colons between them, for launches | "We're live!" |

The layouts are styled with shared **GenerateBlocks Pro Global Styles** (classes like `tmb-countdown__number`), so every countdown on the site looks the same and you restyle them all in one place. See [Styling](#styling) below. Without GenerateBlocks Pro the layouts insert unstyled.

**New countdowns start a week out**, at 23:59 that day (site time). Change it in the **Countdown** panel.

> **The numbers show 00 in the editor.** That's placeholder text: the editor doesn't run the clock. The sidebar tells you when it ends ("Ends in 4 days, 6 hours"), and the real numbers appear on the front end. Use the **Running / Ended** button in the block toolbar to preview the ended state while you style the message. Unlike the Toggle's On/Off button, it's only a preview – it doesn't change any setting.

#### Fastest: the countdown patterns

Two patterns are registered in a **Countdowns** pattern category (only while GenerateBlocks is active):

- **Sale banner with countdown** – a slim accent-coloured banner: "Flash sale: 20% off everything", an inline "Ends in 2d 5h 12m 9s" countdown and a "Shop the sale" button. The banner Element has the ID `sale-banner`, and the countdown is set to disappear and to **also hide** `sale-banner`, so the whole banner goes away when the sale ends.
- **Launch countdown** – a "Coming soon" section with a heading, intro text, large numbers with labels, and a "We're live!" message that replaces the numbers when it ends.

After inserting either one, select the Countdown block (via List View, where it's labelled **Countdown · Date**) and set the end date – it starts a week out.

#### Recipe: Sale ends Friday at 5 pm

1. **Check the site's time zone** under **Settings → General**. The countdown ends at 5 pm *there*, wherever the visitor is.
2. **Insert a Countdown** where you want it and choose a layout (**Boxes** for a section, **Inline text** for a banner). Or insert the **Sale banner with countdown** pattern.
3. **Select the Countdown block** (breadcrumb or List View) and open the **Countdown** panel:
   - Count down to: **A date and time**
   - Click the date button and pick Friday, 5:00 PM. Below it you'll see "Ends in …" so you can check it.
4. **When it ends** panel:
   - The countdown: **Shows its "ended" message** (edit the message text in the canvas – preview it with the toolbar **Ended** button), or **Disappears**.
   - **Also hide**: the ID of anything that should go when the sale does, e.g. `buy-button` (give the button that ID under Settings → HTML Attributes first).
   - **Also show**: e.g. `sale-over` for a "This sale has ended" notice elsewhere on the page. It stays hidden until the countdown ends.
   - **Then go to (optional)**: a URL to send visitors to when it ends.
5. **Display** panel (optional): turn on **Hide units that reach zero** to drop "0 days" on the last day.
6. Publish and view the page.

Once Friday 5 pm has passed, the page is rendered in its ended state straight from the server: no ticking zeros first.

#### Recipe: Evergreen offer, 48 hours from first visit

1. **Insert a Countdown** and choose a layout.
2. In the **Countdown** panel:
   - Count down to: **A deadline per visitor (evergreen)**
   - Days `2`, Hours `0`, Minutes `0`.
   - Leave **Start again when it ends** off, so the offer really ends for that visitor. (Turn it on for a "deal resets" style timer that never ends.)
3. **Advanced → HTML anchor**: give it a name like `offer-48h`. The visitor's deadline is stored under this name, so it stays the same if you later add or move other countdowns on the page. (Without an anchor it's keyed by the page path and the countdown's position on the page.) Use the same anchor on another page and both share one deadline.
4. Optional: to show "48 hours" rather than "2 days", delete the Days box in the canvas. The hours then count past 24 (see [Display settings](#display)).
5. **When it ends**: set the ended message and **Also hide** your order button's ID, as in the recipe above.
6. Publish. To see the countdown start over while you test, open the browser console on the page and run `window.tmbCountdown.reset( 'offer-48h' )`, or use a private window.

Keep in mind: the deadline lives in the visitor's browser (`localStorage`). A different browser or device, a private window, or clearing site data gives a fresh 48 hours. That's normal for evergreen timers; don't rely on it for anything that must be enforced.

### How countdown parts and styling work

#### Countdown parts

Select any GenerateBlocks Element, Text or Shape block inside a Countdown and you'll get a **Countdown part** panel with one setting, *This block is*:

| Option | HTML attribute | What it does |
| --- | --- | --- |
| None (decoration or label) | *(none)* | Nothing – e.g. the "Days" label |
| Days / Hours / Minutes / Seconds number | `data-countdown-part="days"` etc. | Its text is replaced with the number. Leave a placeholder like `00` in it. |
| Days / Hours / Minutes / Seconds box | `data-countdown-unit="days"` etc. | The box around a number and its label, hidden together when "Hide units that reach zero" applies |
| Timer (hidden when it ends) | `data-countdown-part="timer"` | Wraps the numbers; hidden when the ended message shows |
| Ended message (shown when it ends) | `data-countdown-part="ended"` | Hidden until it ends |
| Separator | `data-countdown-part="separator"` | E.g. a colon. Hidden from screen readers; hidden along with the unit just before it |

Like the Toggle's parts, these are stored in GB's own HTML attributes, so you can see them in the HTML Attributes panel.

The sidebar warns you if the countdown has **no number parts**, and (when it's set to show a message) if it has **no ended message**.

**Dropping a unit:** delete its box. The next unit absorbs the time: with no Days part, 2 days show as 48 hours; with no Days or Hours, 90 minutes show as 90.

#### Styling

The starting layouts are styled with shared [Global Styles](#starting-layouts-and-global-styles) classes, a base class per part plus a modifier per layout:

| Class | Modifiers | On |
| --- | --- | --- |
| `tmb-countdown__timer` | `--inline`, `--large` | The timer (the row of units) |
| `tmb-countdown__unit` | `--boxes`, `--inline`, `--large` | Each unit's box |
| `tmb-countdown__number` | `--boxes`, `--inline`, `--large` | The numbers (with `tabular-nums`, so they don't jiggle as digits change) |
| `tmb-countdown__label` | `--large` | "Days", "Hours"… |
| `tmb-countdown__intro` | | "Ends in" (Inline text) |
| `tmb-countdown__suffix` | | The short d / h / m / s (Inline text) |
| `tmb-countdown__separator` | | The colons (Large numbers) |
| `tmb-countdown__ended` | | The ended message |

The Inline text layout's visually hidden full unit name ("days") keeps its own local styles rather than a class, so restyling the classes can never make it visible.

For state-based styles use global CSS: the wrapper is `.tmb-countdown` with `.is-running` or `.is-ended`.

The Countdown has no front-end CSS of its own.

### Countdown settings

Select the Countdown block (the wrapper) to see these in the sidebar. In List View it's labelled **Countdown · Date**, **· Evergreen** or **· Recurring**.

#### Countdown

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Count down to | `mode` | `date` | `date`, `evergreen`, `recurring` |

**A date and time**

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Date picker | `endDate` | a week out, 23:59 | Saved as `Y-m-dTH:i:s` in the site's time zone (Settings → General). The sidebar shows "Ends in …" / "Ended … ago". |

**A deadline per visitor (evergreen)**

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Days / Hours / Minutes | `evergreenMinutes` | `1440` (1 day) | Stored as total minutes; at least 1, at most a year. Counted from the visitor's first view. |
| Start again when it ends | `evergreenRestart` | `false` | A new run starts as soon as one ends, so the "When it ends" settings don't apply. |

**A time that repeats**

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Ends at | `recurringTime` | `17:00` | `HH:MM`, site time zone. |
| On | `recurringDays` | `[]` (every day) | Weekday numbers, 0 = Sunday. Ticking all seven is saved as every day. The sidebar shows the next end time. |

A recurring countdown rolls straight on to the next end time, so the "When it ends" settings don't apply.

#### Display

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Two-digit numbers | `padNumbers` | `true` | `05` rather than `5`. |
| Hide units that reach zero | `hideEmptyUnits` | `false` | Hides leading units once they're zero (e.g. Days on the last day), with their box and the separator after it. The last two units always show. |

#### When it ends

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| The countdown | `endAction` | `message` | `message` (hide the timer, show the ended message), `zeros` (stay at 00), `hide` (the whole countdown disappears). |
| Also hide | `hideOnEnd` | `[]` | IDs or selectors (see [Targets](#toggle-behaviour)), e.g. a sale banner or a "Buy now" button. |
| Also show | `showOnEnd` | `[]` | Hidden until it ends, e.g. a "Sold out" notice. |
| Then go to (optional) | `redirectUrl` | `""` | Sends visitors to this URL when it ends – including visitors who arrive after it has ended. Only `http://` and `https://` addresses are followed, and never the page it's on. |

#### Also supported

- **Advanced → HTML anchor** – printed as the wrapper's `id`. Gives an evergreen countdown a stable storage key, and is what `window.tmbCountdown.reset()` takes.
- **Advanced → Additional CSS class(es)**.
- **Margin** (block spacing support).

#### Accessibility behaviour

- The wrapper has `role="timer"`, which screen readers don't announce every second, and an `aria-label`: "Countdown to {date and time}" for a date countdown (in the site's date and time formats), otherwise "Countdown".
- Separators get `aria-hidden="true"`.
- In the Inline text layout and the sale banner pattern, the short unit letters (d, h, m, s) are hidden from screen readers and a visually hidden full word is read instead.
- The numbers and the timer/ended state are rendered on the server, so the page makes sense before (and without) JavaScript.

---

## Marquee block

A marquee is a strip that scrolls on its own, smoothly and forever. Use it for:

- **Client or partner logos** – the classic "trusted by" strip.
- **Short messages** – free shipping, returns, ratings, like an announcement bar.
- **Big headlines** – large words drifting across a section.
- **Testimonials, scrolling upwards** – cards moving up a fixed-height column.

**Why not the GenerateBlocks carousel?** A carousel moves slide by slide: it stops, then jumps to the next. A marquee is a continuous loop at a constant speed with no seam – the end of the row runs straight into the start again. Different job.

### Marquee quick start

When you insert a Marquee you pick a starting layout:

| Layout | What you get | Starts with |
| --- | --- | --- |
| **Logo strip** (default) | Six placeholder logo shapes in a row | Left, 40 px/s, faded edges, label "Our clients" |
| **Message ticker** | An accent-coloured band of short messages separated by stars | Left, 60 px/s, no fade |
| **Big scrolling headline** | Two phrases in very large type, separated by stars | Left, 45 px/s, 15% fade |
| **Vertical quotes** | Four testimonial cards scrolling upwards | Up, 30 px/s, 22rem tall |

Every layout has a small round **pause button** in the corner. It shows a pause icon while moving and a play icon once paused. It comes first inside the Marquee (it's positioned in the corner, so this doesn't change the look), so keyboard users reach it before any links in the row; keep it first if you build your own. The layouts are styled with shared Global Styles classes (see [Marquee classes](#marquee-classes)).

#### Fastest: the logo strip pattern

The plugin registers **Logo strip: "Trusted by…"** in a **Marquees** pattern category (only while GenerateBlocks is active): a small centred "Trusted by teams at" heading above a Logo strip marquee with placeholder logos and a pause button. Insert it from **Patterns → Marquees**, then swap the placeholders for your logos as in the recipe below.

> **The marquee stands still in the editor.** That's on purpose, so you can click into it and edit the content. Use the **Preview** button in the block toolbar to see the speed and direction (press **Stop** to edit again). The preview just slides the row by its own length; the seamless copies are only added on the front end.

#### Recipe: Client logo strip with your own logos

1. **Insert a Marquee** and choose **Logo strip** (or insert the pattern above).
2. **Open List View** and expand the Marquee. Inside it there's an Element marked as the row that scrolls (its sidebar shows **Marquee part: The row that scrolls**) holding six Shape blocks – the placeholder logos.
3. **Replace the placeholders.** Delete the Shape blocks and add a GenerateBlocks **Media** (image) block inside the row for each logo. Give each one alt text with the company name.
4. **Keep logos the same height.** In each image's Styles set a height (e.g. `2rem` or `2.5rem`) and width `auto`, so wide and tall logos sit evenly. Using a global style for this saves repeating it.
5. **Set the spacing on the row**, not on the logos: the layout's `tmb-marquee__items--logos` class gives the row a `4rem` **gap**. Change it in the class for every logo strip, or give this row its own gap in its Styles. The marquee uses the same gap where the row repeats, so the spacing stays even all the way round.
6. Check **Accessibility → Label** (e.g. "Our clients") and publish.

Logos can link to the clients' sites; the repeated copies are skipped by screen readers and the keyboard (see [Accessibility behaviour](#accessibility-behaviour-2)).

### How marquee parts and styling work

#### Marquee parts

Select any GenerateBlocks Element, Text, Shape or Media block inside a Marquee and you'll get a **Marquee part** panel with one setting, *This block is*:

| Option | `data-marquee-part` value | What it does |
| --- | --- | --- |
| Part of the content | *(none)* | Nothing special – e.g. a logo or a card inside the row |
| The row that scrolls | `items` | The block that moves. Put everything that scrolls inside it, and set the space between items with its gap. |
| Pause button | `pause` | Pauses and restarts the scrolling |

There should be one **row that scrolls**; anything else inside the Marquee (like the pause button) stays put. As with the other blocks, the value lives in GB's own HTML attributes.

The sidebar warns you if nothing is marked as the row yet ("Nothing will scroll yet"), and the Accessibility panel warns you if there's no pause button.

#### Styling

Style everything in the GB Styles panel. For the paused state:

| What | Selector | Set it on |
| --- | --- | --- |
| Pause button while paused | `&[aria-pressed="true"]` | the pause button – the layouts use it to swap the pause icon for the play icon |
| Anything while the marquee is paused | `.tmb-marquee.is-paused …` | global CSS |

`.is-paused` is on the wrapper whenever it's not moving: paused by the button, by hover or focus, or because it's off screen.

#### Marquee classes

The starting layouts' [Global Styles](#starting-layouts-and-global-styles):

| Class | Styles | Layouts |
| --- | --- | --- |
| `tmb-marquee__pause` | The round pause button in the bottom corner, and its pause/play icon swap (`&[aria-pressed="true"] .gb-shape…`) | All |
| `tmb-marquee__pause--middle` | Moves it to the middle of the right edge | Logo strip, Message ticker |
| `tmb-marquee__items` | The row that scrolls (alignment) | All |
| `tmb-marquee__items--logos`, `--messages`, `--headline`, `--quotes` | Each layout's gap and padding | One each |
| `tmb-marquee__logo` | The placeholder logos' colour and height | Logo strip |
| `tmb-marquee__band` | The accent-coloured band | Message ticker |
| `tmb-marquee__message` | Each message (white on the band) | Message ticker |
| `tmb-marquee__headline` | The big words | Big scrolling headline |
| `tmb-marquee__headline--muted` | Every other phrase, in a muted colour | Big scrolling headline |
| `tmb-marquee__star` | The stars between items | Message ticker, Big scrolling headline |
| `tmb-marquee__star--messages`, `--headline` | Their size and colour per layout | One each |
| `tmb-marquee__card` | Each testimonial card | Vertical quotes |
| `tmb-marquee__quote`, `tmb-marquee__author` | The quote and the name under it | Vertical quotes |

The row's `display: flex` (and `flex-direction: column` in Vertical quotes) stays a local style on the row, not in a class: the loop needs it, so restyling or removing a class can't stop the marquee working.

The Marquee has no stylesheet of its own. Its clipping, edge fade and height are inline styles, so it looks right before the script starts. The fade applies to the scrolling row only, not to the pause button.

### Marquee settings

Select the Marquee block (the wrapper) to see these in the sidebar. In List View it's labelled **Marquee · Left**, **· Right**, **· Up** or **· Down**.

#### Motion

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Speed | `speed` | `50` | Pixels per second, 5–300. The same pace whatever the length of the row. |
| Direction | `direction` | `left` | `left`, `right`, `up`, `down`. |
| Height | `height` | `20rem` | Up/down only: a vertical marquee needs a fixed height to scroll within. `rem`, `px` or `vh`. |
| Pause on hover | `pauseOnHover` | `true` | Pauses while the mouse is over it. Keyboard focus on a link or button inside always pauses it, whatever this is set to. |

#### Edges

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Fade the edges | `fadeEdges` | `true` | Items fade in and out at the ends instead of being cut off (a CSS mask). |
| Fade width | `fadeWidth` | `10%` | How far the fade reaches in from each end. `%`, `rem` or `px`. |

#### Accessibility

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Label | `ariaLabel` | `""` | Optional. Names the marquee for screen readers, e.g. "Our clients" (the wrapper becomes `role="region"` with this `aria-label`). |

#### Toolbar

- **Preview / Stop** – plays the motion in the editor. Only a preview; it doesn't change any setting.

#### Also supported

- **Advanced → HTML anchor** – printed as the wrapper's `id`; what `window.tmbMarquee.pause()` takes.
- **Advanced → Additional CSS class(es)**.
- **Margin** (block spacing support).

#### How it moves

- The script repeats the row **just enough times to fill the width** (or height) plus one, and slides the whole lot by exactly one row's length, then starts again. Because the copies are identical, you never see the loop restart.
- The **gap between copies matches the row's own gap**, so the seam where the row repeats is spaced like everything else.
- It uses the **Web Animations API** rather than CSS keyframes, so "remove unused CSS" optimisers can't break it.
- It **re-measures on resize** (and when images finish loading) and keeps its place rather than jumping back to the start.
- It **pauses while off screen**, so it doesn't use CPU when nobody can see it.
- **Lazy images stay lazy.** Images in the copies keep `loading="lazy"` until the strip comes within about 300 px of the screen, then load straight away so the copies are ready as they scroll in. A logo strip far down the page doesn't download its logos during page load.
- On **RTL sites**, left and right swap, so "left" means "towards the end of the line".

#### Accessibility behaviour

- **Copies are hidden from screen readers and the keyboard** (`aria-hidden="true"` and `inert`, links and buttons in them get `tabindex="-1"`, and IDs are removed). Only the original row is read out or tabbed to, so each logo or link exists once.
- **A pause button.** WCAG 2.2.2 asks that anything moving for more than 5 seconds can be paused. Every layout has one; the sidebar warns you if it's removed. The server makes it work from the keyboard (`type="button"` on a `<button>`, otherwise `role="button"` and `tabindex="0"`), adds `aria-pressed`, and gives it `aria-label="Pause the scrolling"` unless it already has a label.
- **The pause button comes first** in every layout and pattern, so it's reached before the links in the row.
- **Keyboard focus always pauses it** (whatever **Pause on hover** is set to), so someone tabbing through links in the row isn't chasing a moving target. A focused link that's partly off the edge or under the fade is moved fully into view, and the edge fade is removed while focus is inside.
- **Reduced motion:** visitors who prefer reduced motion get a still row. The copies are removed, the pause button is hidden, and the strip becomes scrollable so they can still see everything. If it overflows, the scrollable area can be focused with Tab (so it scrolls with the arrow keys) and is named for screen readers with the **Accessibility → Label**, or "Scrolling content" if there isn't one.

---

## Dropdown block

A button that opens a drawer underneath it. Use it for:

- **A downloads menu** – brochures, price lists, logo packs, each with its file type and size.
- **A short list of links** – "Resources", "More", "Other locations".
- **A small panel** – a few lines of text and a button, like "Need help? Talk to a real person".

The drawer can hold any blocks. It floats over the page (it doesn't push content down), lines up with the button, and flips above it when there isn't room below.

**Why not a menu?** It's a *disclosure* – a button that shows and hides some content – not an app-style ARIA menu. See [Accessibility behaviour](#accessibility-behaviour-3) for why.

### Dropdown quick start

When you insert a Dropdown you pick a starting layout:

| Layout | What you get | Drawer width |
| --- | --- | --- |
| **Downloads** (default) | A "Downloads" button opening a list of three files, each a link with its name and its type and size ("PDF · 2.4 MB") | As wide as the button |
| **Simple links** | A "Resources" button opening a plain list of three links | As wide as the button |
| **Panel** | A "Need help?" button opening a panel with a heading, a line of text and a "Contact us" button | `18rem` |

Every layout's button is a GenerateBlocks Button (`<button>` tag) with a chevron icon that turns over while the drawer is open. Button and drawer share the same corner radius and colours, from shared Global Styles classes (see [Dropdown classes](#dropdown-classes)). The links start as `#`: point them at your files or pages (add a `download` attribute under **HTML Attributes** if you want files to download rather than open).

> **In the editor, the drawer shows while the dropdown or anything inside it is selected**, sitting in the page flow under the button so you can edit it. Click elsewhere and it hides again. The **Preview** button in the block toolbar plays the reveal animation.

#### Fastest: the downloads pattern

The plugin registers **Product resources with a Downloads dropdown** in a **Dropdowns** pattern category (only while GenerateBlocks is active): a light grey section with a "Product resources" heading, a line of text, and a Downloads dropdown with three files. Insert it from **Patterns → Dropdowns**, change the file names and links, and publish. It's also on the Playground demo page.

#### Recipe: a downloads menu for a product page

1. **Insert a Dropdown** and choose **Downloads** (or insert the pattern above).
2. **Rename the button.** Click its text and type, e.g. "Spec sheets".
3. **Edit the files.** Open List View and expand the drawer (its sidebar shows **Dropdown part: The drawer**). Each list item holds a link with two lines of text: the file name and its type and size. Change the text, and set each link's `href` to the file's URL in **HTML Attributes**. Duplicate a list item to add another file.
4. **Optional:** make the drawer wider than the button by giving it a **width** in its Styles (e.g. `16rem`), and choose **Line up with the button's → End** if the button sits at the right of the page.
5. Publish.

#### Recipe: a "Need help?" panel

1. Insert a Dropdown and choose **Panel**.
2. Replace the text and the **Contact us** link. Put any GenerateBlocks blocks you like in the drawer: an image, a phone number, two buttons.
3. The panel is `18rem` wide, set by the `tmb-dropdown__drawer--panel` class. Change it there for every panel, or give this drawer its own width in its Styles.
4. If the panel has a form or several things to click, turn off **Close when an item is clicked** so it stays open while the visitor uses it.

### How dropdown parts and styling work

#### Dropdown parts

Select any GenerateBlocks Element, Text, Shape or Media block inside a Dropdown and you'll get a **Dropdown part** panel with one setting, *This block is*:

| Option | `data-dropdown-part` value | What it does |
| --- | --- | --- |
| Part of the content | *(none)* | Nothing special – e.g. a link inside the drawer |
| The button that opens it | `button` | Opens and closes the drawer. Use a GenerateBlocks **Button** set to the `<button>` tag. Anything else (a `<div>`, a link) is given `role="button"`, keyboard focus, and Space/Enter support so it still works from the keyboard, but a real `<button>` is best. |
| The drawer | `drawer` | What opens. A GenerateBlocks Element holding anything. |

A dropdown needs one of each; the sidebar warns you if either is missing. Put everything that should be hidden inside the drawer. As with the other blocks, the value lives in GB's own HTML attributes.

#### Width and position

- **The drawer is as wide as the button** unless you give it a width in the GB Styles panel (the Panel layout sets `18rem`). It can also have a min- or max-width.
- **It opens below the button** and **flips above** when there isn't enough room below (and there's more room above). It moves sideways if it would go off the edge of the screen, keeping 8 px clear, and repositions as the visitor scrolls or resizes.
- The positioning rules (`position: absolute`, `top`, `width: 100%`, `z-index: 100`) are written with zero specificity (`:where()`), so anything you set in the GB Styles panel wins.
- **Overflow: hidden clips it.** Like any popover, a drawer inside a container with `overflow: hidden` (some sliders, cards with rounded corners that clip) is cut off at that container's edge. Put the dropdown outside such a container, or remove the overflow setting.

#### Styling the open state

Style everything in the GB Styles panel. For the open state:

| What | Selector | Set it on |
| --- | --- | --- |
| Button while open | `&[aria-expanded="true"]` | the button – the layouts darken it and turn the chevron with `&[aria-expanded="true"] .gb-shape svg` |
| Anything while the dropdown is open | `.tmb-dropdown.is-open …` | global CSS |
| Anything depending on which way it opened | `.tmb-dropdown[data-placement="top"] …` (or `"bottom"`) | global CSS – only set while open |

The drawer itself needs no "open" styling: it's hidden while closed and shown while open.

#### Dropdown classes

The starting layouts' [Global Styles](#starting-layouts-and-global-styles). Positioning and the closed state aren't in them: those come from the block itself.

| Class | Styles | Layouts |
| --- | --- | --- |
| `tmb-dropdown__button` | The button: colours, hover/focus and open state, chevron size and turn | All |
| `tmb-dropdown__drawer` | The drawer: background, border, shadow, list margins reset | All |
| `tmb-dropdown__drawer--panel` | The panel's `18rem` width and padding | Panel |
| `tmb-dropdown__item` | Each list row (`<li>`), margins reset | Downloads, Simple links |
| `tmb-dropdown__link` | A link filling the row, with a hover tint and focus ring | Downloads, Simple links |
| `tmb-dropdown__link--downloads` | Stacks the file name above its type and size | Downloads |
| `tmb-dropdown__link--simple` | The plain links' text size | Simple links |
| `tmb-dropdown__file-name`, `tmb-dropdown__file-meta` | A file's name, and its type and size | Downloads |
| `tmb-dropdown__title`, `tmb-dropdown__text` | The panel's heading and line of text | Panel |
| `tmb-dropdown__cta` | The panel's "Contact us" button | Panel |

### Dropdown settings

Select the Dropdown block (the wrapper) to see these in the sidebar, in a **Drawer** panel.

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Reveal animation | `animation` | `slide` | `none`, `fade`, `slide` (shown as "Slide down"), `grow`, `unfold`. Plays in reverse when it closes. When the drawer flips above the button, it slides and unfolds upwards instead. |
| Speed | `speed` | `normal` | `fast` (150 ms), `normal` (250 ms), `slow` (400 ms). Hidden when the animation is None. |
| Line up with the button's | `align` | `start` | `start`, `center` (shown as "Centre"), `end`. Matters when the drawer is wider than the button. |
| Space between button and drawer (px) | `gap` | `8` | 0–48. |
| Close when an item is clicked | `closeOnClick` | `true` | Closes after a link or button inside the drawer is used, and puts keyboard focus back on the dropdown's button. Turn it off for drawers with forms or several controls. |

#### Toolbar

- **Preview** – plays the reveal animation in the editor (while the drawer is showing).

#### Also supported

- **Advanced → HTML anchor** – printed as the wrapper's `id`; what `window.tmbDropdown.open()` and friends take.
- **Advanced → Additional CSS class(es)**.
- **Margin** (block spacing support).

#### Accessibility behaviour

- **A disclosure, not a menu.** The button gets `aria-expanded` and `aria-controls` (pointing at the drawer, which is given an ID if it doesn't have one), as in the WAI-ARIA disclosure pattern. It deliberately isn't an ARIA `menu`: that role tells screen readers to expect app-style arrow-key navigation, which suits app toolbars, not a list of website links. Visitors Tab through the items like any other links.
- **Server-rendered.** The drawer starts hidden and the button has its ARIA state before any JavaScript runs. A `<button>` is given `type="button"` so it never submits a form it sits in.
- **Closing:** **Escape** closes it and returns focus to the button; so does using an item when **Close when an item is clicked** is on. A click outside, or tabbing out of it, closes it too.
- **Down arrow** on the button opens it and moves focus to the first link or button in the drawer.
- **One open at a time:** opening a dropdown closes any other. (A dropdown inside another's drawer leaves its parent open.)
- **Reduced motion:** visitors who prefer reduced motion see it open and close without animation.
- **Without JavaScript** every drawer is simply shown in the page flow under its button, so nothing is out of reach.
- **Real lists:** the Downloads and Simple links layouts use a `<ul>` drawer with `<li>` items, so screen readers announce how many items there are.

#### Authors and Contributors: button icons

GenerateBlocks button icons are inline SVGs. WordPress's content filter removes SVGs when they're saved by users without the "unfiltered HTML" capability – Authors, Contributors, and on multisite, everyone but Super Admins. So if one of them saves a dropdown, the editor reports its button as invalid. This is a GenerateBlocks limitation that affects any GB button with an icon, not just this block. Workarounds: have an Editor or Administrator save the page, or remove the icon from the button.

---

## Breadcrumbs block

The path to the page a visitor is on: **Home › Blog › Recipes › Lemon cake**. Each step links back up the site, and the last one is the current page.

You place it once and it works out the trail for **whatever page is being viewed**, so it belongs anywhere that's shared by many pages:

- **A GeneratePress Element** (a Block Element on a hook such as `generate_before_main_content`, or a Content Template) – the usual choice: breadcrumbs above every page, post or archive, set up once.
- **A block theme template** or template part.
- **A widget** area.
- **A single page or post**, if you only want it there.

It also gives search engines the same path as breadcrumb structured data (unless your SEO plugin already does), and if you use **Yoast SEO** or **Rank Math** it shows their trail, so what visitors see matches what search engines are told.

### Breadcrumbs quick start

When you insert Breadcrumbs you pick a starting style:

| Style | Looks like |
| --- | --- |
| **Chevrons** (default) | Home › Blog › Post – muted links that turn your accent colour and underline on hover, the current page in your text colour |
| **Slashes** | Home / Blog / Post |
| **Pills** | Each step in a soft rounded box, the current page in an accent-coloured pill |

Each style is three GenerateBlocks Text blocks: a link (reading "Parent page"), a separator and the current page (reading "Current page"). **The editor shows these templates, not the real trail** – the trail depends on the page being viewed, so it's built on the front end. Style the three blocks the way you want every step to look, then view any page on the site.

The styles are shared Global Styles classes (see [Breadcrumbs classes](#breadcrumbs-classes)). Separators are plain characters (`›`, `/`), not icons, so Authors and Contributors can save the block without anything being stripped.

**Recipe: breadcrumbs above every post and page with GeneratePress**

1. **Appearance → Elements → Add New → Block**.
2. Insert **Breadcrumbs** and choose a style.
3. Under **Element Settings**, set the **Hook** to `generate_before_main_content` (or wherever you want it), and **Display Rules** to *Entire Site*, excluding the front page if you like (it's hidden there by default anyway).
4. Publish, and view a post: Home › Blog › Category › Post.

### What the trail looks like

The block builds the trail from WordPress's own data. On each kind of page:

| Page | Trail |
| --- | --- |
| A page | Home › Parent page › … › Page |
| A post | Home › Blog page › Category › Post. The category is the **primary category** set in Yoast SEO or Rank Math if there is one, otherwise the post's first category, with its parent categories before it. The blog page is the **Posts page** from Settings → Reading (only when the site has a static front page). Either can be switched off. |
| The blog page | Home › Blog page |
| A custom post type item | Home › Post type archive (e.g. "Projects", if the post type has an archive) › parent items › Item |
| A media attachment | The trail of the post it's attached to, then the attachment |
| A category, tag or custom taxonomy archive | Home › parent terms › Term. Categories and tags also get the blog page in front. |
| A post type archive | Home › Archive name |
| An author archive | Home › Author's name |
| A date archive | Home › 2026 › October › 1 |
| Search results | Home › Search results for "…" |
| 404 | Home › Page not found (not a link) |
| **WooCommerce** shop | Home › Shop |
| **WooCommerce** product category or tag | Home › Shop › parent categories › Category |
| **WooCommerce** product | Home › Shop › Product category (the primary one, if Yoast or Rank Math sets it) › Product |

The front page has no trail by default (it would just be "Home"). With **Use Yoast SEO's / Rank Math's breadcrumbs** on, the SEO plugin's trail is used instead of this one – see [Breadcrumbs and SEO plugins](#breadcrumbs-and-seo-plugins).

### How breadcrumb parts and styling work

#### Breadcrumb parts

Select a GenerateBlocks Element, Text, Shape or Media block inside Breadcrumbs and you'll get a **Breadcrumb part** panel with one setting, *This block is*:

| Option | `data-breadcrumb-part` value | What it does |
| --- | --- | --- |
| Not a part (not shown) | *(none)* | Not shown on the site |
| Link to each page | `item` | The link for every step before the current page. Use a GenerateBlocks **Text** block set to the `<a>` tag. |
| Separator | `separator` | Shown between steps; hidden from screen readers |
| The current page | `current` | The last step. Not a link; gets `aria-current="page"`. |

**They're templates.** You style each one once, and on the site it's repeated for every step with that page's title and link. The text you type in them in the editor is only a placeholder. Only blocks set as a part are shown – anything else you put inside Breadcrumbs is left out.

The sidebar warns you if there's no **Link to each page** part. If there's no current page part, the current page is plain text; without a separator, the steps sit side by side with no separator. A Text block with a GenerateBlocks icon keeps its icon on every step.

#### Styling

- **Everything visible** – link, separator, current page – is styled in the GB Styles panel, hover and focus included (the styles set `&:is(:hover, :focus-visible)` and `&:focus-visible` on the link).
- **The current page** has its own part, so it needs no special selector. If you'd rather style it from global CSS, use `[aria-current="page"]`.
- **The row**: the plugin lays the steps out in a wrapping row with a `0.5em` gap. To change the gap or alignment, target `.tmb-breadcrumbs__list` / `.tmb-breadcrumbs__step` in global CSS.
- **The "…" button** (when a long trail collapses) isn't a GB block. It inherits the text colour and font; style it with `.tmb-breadcrumbs__more`.

#### Breadcrumbs classes

The starting styles' [Global Styles](#starting-layouts-and-global-styles):

| Class | Styles | Styles used in |
| --- | --- | --- |
| `tmb-breadcrumbs__item` | Each link: muted, accent colour and underline on hover/focus, focus ring, at least 24 px tall | All |
| `tmb-breadcrumbs__item--pill` | Turns the link into a soft rounded pill | Pills |
| `tmb-breadcrumbs__divider` | The separator | All |
| `tmb-breadcrumbs__current` | The current page, in the text colour | All |
| `tmb-breadcrumbs__current--pill` | The current page as an accent-coloured pill | Pills |

The separator's class is `__divider`, not `__separator`: the plugin already adds `tmb-breadcrumbs__separator` to every separator on the site, as a hook for its script.

### Breadcrumbs settings

Select the Breadcrumbs block (the wrapper) to see these in the sidebar.

#### Trail

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Use Yoast SEO's / Rank Math's breadcrumbs | `useSeoPlugin` | `true` | Only shown when one of them is active. Shows the plugin's trail; turn off to use this block's own trail and the settings below. |
| Home | `home` | `text` | `text`, `icon` (a house) or `both`. Applies to this block's own trail only. |
| Home label | `homeLabel` | "Home" | With **Icon**, it's kept as hidden text so screen readers still hear "Home". |
| Show the blog page on posts | `showBlogPage` | `true` | Home › Blog › Category › Post. Also puts the blog page before category and tag archives. |
| Show the category on posts | `showCategory` | `true` | The primary category if your SEO plugin sets one, otherwise the first, with its parents. |
| Show the current page | `showCurrent` | `true` | As the last step, not a link. Off: the trail ends at the parent, as a link. |
| Show on the home page | `showOnHome` | `false` | Off: nothing is printed on the front page. |
| Collapse when it doesn't fit | `collapse` | `true` | See [Collapsing long trails](#collapsing-long-trails). |

#### Search engines

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Breadcrumb structured data | `schema` | `auto` | **Automatic (only if no SEO plugin adds it)**, **Always add it** or **Never add it**. A schema.org `BreadcrumbList` with the full trail, printed once per page (in the footer) however many Breadcrumbs blocks it has. |

#### Accessibility

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Label | `ariaLabel` | "Breadcrumb" | Names the breadcrumb navigation for screen readers. Change it if a page has two breadcrumb blocks, or for a translation. |

#### Also supported

- **Advanced → HTML anchor** – printed as the `<nav>`'s `id`.
- **Advanced → Additional CSS class(es)**.
- **Margin** (block spacing support).

### Breadcrumbs and SEO plugins

**Why it matters:** SEO plugins tell search engines the path to each page with breadcrumb structured data, and Google can show it in search results. If the breadcrumbs visitors see say something different, that's confusing. So when **Yoast SEO** or **Rank Math** is active, the block shows *their* trail by default (**Use Yoast SEO's / Rank Math's breadcrumbs**), and leaves the structured data to them.

- **Yoast SEO**: its trail is used, and on **Automatic** the block adds no structured data (Yoast always includes a `BreadcrumbList`).
- **Rank Math**: its trail is used when its breadcrumbs are switched on (Rank Math → General Settings → Breadcrumbs); on **Automatic** the block then adds no structured data. With Rank Math's breadcrumbs off, the block uses its own trail and adds the structured data itself.
- With the SEO plugin's trail, change *what's in it* in the SEO plugin's breadcrumb settings. The block's **Home**, **blog page** and **category** settings apply only to its own trail; **Show the current page**, **Show on the home page** and **Collapse** always apply.
- **If the SEO plugin's breadcrumbs fail for any reason** (an update changes them, an error), the block quietly uses its own trail. It never takes the page down.
- **Other SEO plugins.** All in One SEO, The SEO Framework and Slim SEO are detected too (they add breadcrumb structured data by default), so **Automatic** leaves it to them; their trails aren't used. For anything else that adds it (SEOPress with its breadcrumbs on, say), set **Breadcrumb structured data** to **Never add it**, or tell the block site-wide with the [`thingamablocks_breadcrumbs_seo_schema`](#php) filter.

### Collapsing long trails

With **Collapse when it doesn't fit** on, a trail that would wrap onto a second line (usually on a phone) hides steps from the middle – oldest first, only as many as needed – behind a **…** button: **Home › … › Parent › Page**. The first step and the last two always stay. Pressing **…** shows the full trail and moves keyboard focus to the first step it revealed. It re-checks when the screen is rotated or resized, and after web fonts load.

Without JavaScript, or with collapsing off, a long trail simply wraps.

#### Accessibility behaviour

- **A labelled navigation landmark**: a `<nav aria-label="Breadcrumb">` holding an ordered list (`<ol>`), one `<li>` per step, so screen readers announce it as breadcrumb navigation and say how many steps there are.
- **The current page** has `aria-current="page"` and isn't a link.
- **Separators are hidden from screen readers** (`aria-hidden="true"`); the list already says how the steps relate.
- **Home as an icon** keeps "Home" (or your Home label) as hidden text, so it's never an unnamed link.
- **Easy to hit:** the styles' links, and the … button, are at least 24 px tall (WCAG 2.5.8).
- **The … button** is a real `<button>` named "Show the full path", with a visible focus outline.
- **Server-rendered:** the whole trail is in the HTML before any JavaScript runs; JavaScript only collapses it.

#### Loading

A few lines of CSS (`viewStyle`) and a small script (`viewScript`) load only on pages with a Breadcrumbs block. No JavaScript is needed to show the trail – only to collapse long ones.

---

## Search block

A search form, built from GenerateBlocks blocks so it looks like the rest of your site. Use it for:

- **A site search** in the header, sidebar or a 404 page.
- **A product search** – tick **Products** and it only searches WooCommerce products, with WooCommerce's own results page.
- **A "search the docs" box** – just pages, or just one custom post type.
- **A search icon in the header** that opens a search field when clicked.

The results show on your theme's normal search results page, so there's nothing extra to set up or style there.

### Search quick start

When you insert a Search you pick a starting style:

| Style | Looks like |
| --- | --- |
| **Bar with button** (default) | A bordered field with a "Search" button beside it |
| **Pill, button inside** | A rounded field with a round search-icon button inside it, at the right |
| **Underline** | Just a line under the text and a search icon, for headers and sidebars |
| **Icon that opens a search** | A round search icon. Clicking it opens a field with a "Search" button underneath, floating over the page and lined up with the icon's right edge |

The styles are shared Global Styles classes (see [Search classes](#search-classes)), and every field and button has a visible focus outline in the accent colour. The input's text in the editor ("Search…") is the **placeholder** on the site: click it and type your own, e.g. "Search products…".

> **In the editor, the expanding style's field sits in the page flow under the icon**, so you can see and edit it. On the site it's hidden until the icon is clicked.

**Recipe: a product search for a WooCommerce shop**

1. Insert **Search** and choose **Pill, button inside**.
2. In the block's sidebar, under **Search only**, tick **Products**.
3. Set **Label** to "Search products", and change the placeholder text to "Search products…".
4. Publish. Searching shows WooCommerce's product results (its own grid, with prices and sorting).

**Recipe: a search icon in the GeneratePress header**

1. **Appearance → Elements → Add New → Block**, a header hook such as `generate_menu_bar_items` (beside the menu), Display Rules *Entire Site*.
2. Insert **Search** and choose **Icon that opens a search**.
3. Publish. The field opens below the icon, and moves sideways if it would stick out of the screen on a phone.

### How search parts and styling work

#### Search parts

Select any GenerateBlocks Element, Text, Shape or Media block inside a Search and you'll get a **Search part** panel with one setting, *This block is*:

| Option | `data-search-part` value | What it does |
| --- | --- | --- |
| Just part of the layout | *(none)* | Nothing special – e.g. a row holding the field and button |
| The field (box around the input) | `field` | The box the visitor types in. Style its border, background, padding, font and colour here: the input takes on its font and colour. It gets a focus outline while the visitor is typing. |
| The input (its text is the placeholder) | `input` | A GenerateBlocks **Text** block that becomes a real `<input type="search" name="s">` on the site. Its text is the placeholder. On a search results page it shows what was searched for. Put it inside the field. |
| The search button | `submit` | Runs the search. Use a **Text** block set to the `<button>` tag. It can be just an icon: it's then named after the block's **Label** for screen readers. |
| A visible label | `label` | Optional. A Text block shown as a label ("Search the docs"), made into a real `<label>` for the input. |
| A button that opens the field | `toggle` | The expanding style's icon: opens and closes the field. Put the field **next to** it, not inside it. |

A search needs an input; the sidebar warns you if there isn't one. As with the other blocks, the value lives in GB's own HTML attributes.

#### Styling

- **Style the field, not the input.** Themes style every search input on the site (GeneratePress styles `input[type="search"]`) with selectors stronger than GenerateBlocks' own, so styles set on the input itself would lose. So the plugin resets the input to a plain, see-through text area that inherits its font and colour, and the field carries the look. The input is at least 2.75rem tall, a comfortable target, unless you give it a height.
- **Focus:** the field shows the focus outline while the visitor types (the input's own outline is switched off inside a field). The styles set it with `&:focus-within` on the field – change or replace it there. Without one, a plain `2px` outline in the text colour is used.
- **Buttons:** hover and focus are set with `&:is(:hover, :focus-visible)`, including a background, since themes give every `<button>` a hover background. The expanding style's icon also uses `&[aria-expanded="true"]` for while it's open.
- **The expanding style's field** is positioned by its `tmb-search__field--expand` class (`position: absolute`, `top`, `right`, `width: 20rem`, `max-width: calc(100vw - 2rem)`), against the wrapper, which `tmb-search__wrapper--expand` makes `position: relative`. The position needs both classes. Change where it opens and how wide it is in the field's class (or its own Styles). Like any popover, it's clipped by an ancestor with `overflow: hidden`.

#### Search classes

The starting styles' [Global Styles](#starting-layouts-and-global-styles):

| Class | Styles | Styles used in |
| --- | --- | --- |
| `tmb-search__wrapper` | The Element around the field and button, or around the icon and its pop-up field | Bar with button, Icon that opens a search |
| `tmb-search__wrapper--bar` | Field and button side by side | Bar with button |
| `tmb-search__wrapper--expand` | `position: relative`, so the pop-up field lines up with the icon | Icon that opens a search |
| `tmb-search__field` | The box around the input, with its `&:focus-within` outline | All |
| `tmb-search__field--bar`, `--pill`, `--underline` | That style's border and corners | One each |
| `tmb-search__field--expand` | The pop-up field: position, width, border, shadow | Icon that opens a search |
| `tmb-search__button` | The search button, and the icon that opens the field | All |
| `tmb-search__button--bar`, `--pill`, `--underline`, `--expand` | The search button in that style | One each |
| `tmb-search__button--toggle` | The round icon that opens the field (and its open state) | Icon that opens a search |

The input part has no class: it keeps one local style (`flex-grow`, so it fills the field in the editor), and on the site the real `<input>` gets the plugin's own `tmb-search__input` class. (The plugin also adds `tmb-search__label--block` to a visible label, so the layouts avoid `tmb-search__label…` names.)

### Search settings

Select the Search block (the wrapper) to see these in the sidebar, in a **Search** panel.

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Search only | `postTypes` | *(none)* | A tick box for each public content type on the site (Posts, Pages, Products, your custom post types). **Nothing ticked searches everything**, like WordPress's own search. See [Searching only some content types](#searching-only-some-content-types). A ticked type that no longer exists is listed as "(not found on this site)" so you can untick it. |
| Label | `label` | "Search" | The name screen readers hear for the input (unless there's a visible label part) and for icon-only buttons. Say what's searched, e.g. "Search products". |

#### Also supported

- **Advanced → HTML anchor** – printed as the `<form>`'s `id`.
- **Advanced → Additional CSS class(es)**.
- **Margin** (block spacing support).

### Searching only some content types

The form sends the visitor to your site's normal search results page (`/?s=…`), with the chosen types added:

- **One type WordPress can search by itself** (Posts, Products, most custom post types) is sent as WordPress's own `post_type=…`. That's how WooCommerce's product search works, so WooCommerce shows its product results page.
- **Anything else** – Pages (which WordPress can't search on their own), or several types together – is sent as `tmb_types=page,post`, and the plugin limits the main search query to those types.
- **Only viewable types are accepted**, whichever way they arrive. The list is checked against the content types visitors can already view (not attachments) when the page is built and again when the search runs, so editing the URL can't reach private content types.

### Accessibility behaviour

- **A search landmark:** the block is a `<form role="search">`, so screen reader users can jump straight to it.
- **The input always has a name:** the visible label part if there is one (a real `<label for>`), otherwise the **Label** setting as `aria-label`. On phones the keyboard's Enter key reads "Search".
- **Icon-only buttons are named** after the **Label** setting. The search button is a real `<button type="submit">`, so it works without JavaScript.
- **The expanding style** follows the WAI-ARIA disclosure pattern: the icon is a real button with `aria-expanded` and `aria-controls` (set on the server, so it's right before any JavaScript runs). Opening it moves focus to the input; **Escape** closes it and returns focus to the icon; clicking or tabbing away closes it. A field that would stick out of the screen is moved sideways to fit. Visitors who prefer reduced motion see it open without the fade.
- **Without JavaScript** the expanding style's field is simply shown and the icon (which couldn't do anything) hidden, so the search still works.

#### Loading

A few lines of CSS (`viewStyle`) load only on pages with a Search block. There's no script at all, except for the expanding style: a small script (about 1 KB) loads only on pages with a search that uses it.

---

## Entrance animations

Not a block: an **Entrance animation** panel added to the sidebar of every GenerateBlocks block. Pick an animation and the block fades, slides or zooms in the first time it scrolls into view. On a block that holds other blocks, you can instead have the blocks inside it animate in one after another.

- Works on GenerateBlocks 2 blocks (Element, Text, Media, Shape, Query, Looper, Loop Item…) and, by the same rule, GenerateBlocks Pro's. **Not** on the legacy GB 1.x blocks (Container, Grid, Headline, Button), which have no HTML attributes to store it in.
- Plays **once** per page view. It doesn't replay when you scroll back up, but you can add a [**Replay button**](#add-a-replay-button) that plays the animations again on click.
- **Nothing loads** on pages that don't use an animation. Pages that do get a ~3.7 KB script (1.6 KB gzipped) and ~750 bytes of CSS.
- Visitors who prefer **reduced motion** see everything straight away, with no animation.
- Keyboard users who tab into a block that hasn't animated in yet see it straight away, so focus is never on something invisible.

> **In the editor, animations don't play on their own,** so blocks never vanish while you're editing. Choosing an animation plays it once; after that, press **Preview** in the panel.

> **Leave the first thing visitors see alone.** Don't animate the hero heading or image at the top of the page: an animated block stays hidden until the script runs, which can hurt the page's Largest Contentful Paint (LCP) score. The panel's help text says the same.

### Entrance animation recipes

#### Fade a section up as it scrolls into view

1. Select the section's Element block.
2. Open **Entrance animation** in the sidebar and choose **Fade up**.
3. Publish and scroll down to it on the front end.

#### Make a grid of cards animate in one by one

1. Select the Element that holds the cards (the one with the grid layout), not the cards themselves.
2. In **Entrance animation**, choose **Fade up** (or any animation).
3. Turn on **Animate the blocks inside one by one**. The grid itself stays put; each card animates in turn, 100 ms after the one before. Change the gap with **Time between each**.
4. Press **Preview** to see it.

#### Animate a query loop's posts

Same idea, set on the **Looper** block (inside the Query block): choose an animation and turn on **Animate the blocks inside one by one**. Each Loop Item (each post) animates in turn. Set it on the Looper rather than the Loop Item, or every post animates at once.

If posts are added later by JavaScript (say, an infinite-scroll or load-more script), call [`window.tmbAnimate.init()`](#entrance-animations-windowtmbanimate) on the new content.

#### Add a replay button

Handy for a demo, a portfolio piece or a "see it again" moment.

1. Add a GenerateBlocks **Text** block and set its tag to **Button** (any GB 2 block works, but a real `<button>` is best).
2. In its **Entrance animation** panel, turn on **Replay button**.
3. Leave **Replay the blocks with these IDs** empty to replay every animation on the page, or add the HTML ID of a section (say `pricing`) to replay just the animations inside it. The field suggests IDs used on the page; an ID it can't find is fine if it lives in a header, footer or other template part.
4. Publish, scroll through the page, then click the button.

Clicking it plays the entrance animations inside (and on) those blocks again, restarting any still playing. Only what's on screen plays straight away: blocks below the screen are hidden again and play when they're scrolled to, blocks above it are left as they are, and blocks that haven't been seen yet animate when they arrive. The button never hides itself: if it sits inside a replayed block, that block doesn't replay, and in a "one by one" group the item holding the button is skipped.

### Entrance animation settings

Select a GenerateBlocks block. The panel opens by itself on blocks that already have an animation.

| Setting | Stored as | Default | Notes |
| --- | --- | --- | --- |
| Animation | `data-tmb-animate` | None | `fade` (Fade in), `fade-up`, `fade-down`, `fade-left` (Slide in from the left), `fade-right` (Slide in from the right), `zoom` (Zoom in). Choosing one previews it. |
| Speed | `data-tmb-speed` | Normal | `fast` (400 ms), `normal` (700 ms), `slow` (1100 ms). |
| Delay (ms) | `data-tmb-delay` | `0` | 0–2000, in steps of 100. Waits this long after the block comes into view. |
| Animate the blocks inside one by one | `data-tmb-animate-children` | Off | Only on blocks that hold other blocks (not Text, Media, Shape or Query page numbers). The block stays put and its direct children animate in turn. The delay applies before the first one. |
| Time between each (ms) | `data-tmb-animate-children` | `100` | 50–500, in steps of 25. The value of the attribute above. |
| **Preview** button | – | – | Plays the animation in the editor. Changes nothing. |
| Replay button | `data-tmb-replay` | Off | Makes this block a button that plays entrance animations again when clicked. Offered on blocks with nothing inside them (a Text, Media or Shape block), so a whole section can't become a button. On its own, stored as `data-tmb-replay="*"` (the whole page). Independent of the Animation setting: the button itself doesn't need an animation. |
| Replay the blocks with these IDs | `data-tmb-replay` | Empty | Shown when Replay button is on. HTML IDs of the blocks to replay, stored space-separated (`data-tmb-replay="pricing features"`); `#` is dropped and anything that isn't a plain ID is ignored. Empty means every animation on the page. |

The settings are saved in the block's own GenerateBlocks **HTML Attributes** (you'll see them in that panel), so GenerateBlocks saves and renders them like any other attribute. Only values that differ from the defaults are stored: a block set to Fade up at Normal speed with no delay just gets `data-tmb-animate="fade-up"`. Setting Animation back to None removes them all (except a replay button setting, which is separate).

**Replay buttons and accessibility.** Before any JavaScript runs, PHP makes the block behave like a button: a `<button>` gets `type="button"` (so it never submits a form); anything else gets `role="button"`, plus `tabindex="0"` so it can be reached with Tab (unless it's a link with an `href`, which already can). Enter and Space press a `role="button"` element, and a link used as a replay button replays rather than navigates. `aria-controls` lists the IDs it replays. A link or field *inside* a replay button still works normally, and holding a key down replays only once. An author's own `role` is kept. Replay buttons are **hidden** for visitors who prefer reduced motion and when JavaScript is off, since nothing would replay; until the script has loaded they're invisible but keep their space, so nothing shifts when they appear. A page with a replay button loads the animation script and CSS even if nothing else on it is animated.

The animations move a block by at most 2rem (1.5rem for up/down) and zoom from 92%, so they stay subtle.

**Inside a Marquee**, only the original row animates; the copies the Marquee makes for its loop show as already animated, so the strip has no gaps.

---

## Image masks

Not a block: a **Mask** panel added to the sidebar of the GenerateBlocks **Image** block (GB 2's `generateblocks/media`). Pick a shape and the image is cut to it: the solid parts of the shape show the image, the empty parts are see-through. Think wavy edges, a blob, a circle, an arch.

- Shapes come from the **GenerateBlocks shape library** (the waves, angles, curves and triangles GB uses for its Shape block, plus any shapes added to that library), or from an **SVG you upload or paste** in the panel.
- **Nothing loads on the front end.** The mask is written into the image's GenerateBlocks styles as `mask-image`, `mask-size`, `mask-position` and `mask-repeat`, and GenerateBlocks compiles and prints it with the rest of the block's CSS. The image's HTML doesn't change.
- **Responsive like GB's Styles panel.** The panel follows the editor's preview device (Desktop / Tablet / Mobile), so you can change or remove the mask on smaller screens.
- Only the Image block (GB 2). Not the legacy GB 1.x Image block, and not other blocks.

> **Your SVGs don't go into the Media Library.** WordPress blocks SVG uploads, for good reason: an SVG can carry scripts. Instead the panel reads the file in your browser, cleans it down to plain shapes and stores it with the image (see [Uploaded and pasted SVGs](#uploaded-and-pasted-svgs)).

### Image mask recipes

#### Give a photo a wavy edge

1. Select the Image block and open **Mask** in the sidebar.
2. Click **Choose a shape**. On the **Shape library** tab, pick one of the waves.
3. Set **Size** to **Stretch** so the shape spans the whole image, and use **Flip** (Horizontally / Vertically) if the wave faces the wrong way.

#### Use your own shape (a blob, a logo outline)

1. Export the shape from your design tool as an SVG, filled in solid black (any colour works; only the solid areas matter).
2. In **Mask**, click **Choose a shape** → **Upload or paste**, then **Choose an .svg file**, or paste the SVG code and click **Use this SVG**.
3. Leave **Size** on **Contain** to keep the shape's proportions, and use **Position** to place it.

#### A different mask on phones

1. Set up the mask as usual with the editor previewing **Desktop**.
2. Switch the editor's preview device (the device menu in the top toolbar) to **Mobile**. The panel now says "Editing: Mobile".
3. Change what you need, say **Size** to **Cover**, or click **Remove at this size** to show the plain image on phones. Everything you don't change is inherited from desktop.

### Image mask settings

Select a GenerateBlocks Image block. The panel opens by itself on images that already have a mask.

| Setting | Stored as | Default | Notes |
| --- | --- | --- | --- |
| **Choose a shape** / **Replace shape** | `mask-image` | – | Opens the shape picker: **Shape library** or **Upload or paste**. |
| Size | `mask-size` | Contain | **Contain** (whole shape fits, proportions kept), **Cover** (fills the image, proportions kept, may crop the shape), **Stretch** (fills the image exactly, `100% 100%`; the only option that distorts the shape), **Custom** (a shape width in `%`, `px` or `rem`, height in proportion; starts at 80%). |
| Position | `mask-position` | Centre | A focal point picker over the image, stored as percentages. Moves the shape within the image (or, with Cover, chooses which part of the shape is kept). A position typed in GB's Styles panel (like `right 10px bottom`) is kept and shown under the picker until you move the point. |

**Why shapes don't distort (unless you choose Stretch).** Shapes made as section dividers, including GenerateBlocks' own waves, angles and curves, are marked to always stretch to fill whatever they're in (`preserveAspectRatio="none"`). As a mask that would make every size look the same, squashed. The panel removes that marker, so Contain, Cover and Custom keep the shape's true proportions, and adds it back only for Stretch.
| Flip | inside `mask-image` | Off | **Horizontally** and/or **Vertically**. The flip is built into the stored SVG. |
| Repeat the shape | `mask-repeat` | Off | Tiles the shape (`repeat`) instead of showing it once (`no-repeat`). |
| **Remove mask** | – | – | On Desktop: removes the mask at every screen size. |
| **Remove at this size** | `mask-image: none` | – | On Tablet or Mobile: turns the mask off on that screen size and smaller. |
| **Reset Tablet / Mobile to inherited settings** | – | – | Shown when that size has changes of its own; clears them so it follows the larger size again. |

**Screen sizes.** The panel edits whichever device the editor is previewing, just like GB's Styles panel. Desktop settings apply everywhere. On Tablet and Mobile only what you change is stored, under GenerateBlocks' default breakpoints (`@media (max-width:1024px)` and `@media (max-width:767px)`), so everything else keeps following desktop, including later desktop changes.

**You'll see it in GB's Styles panel too.** The `mask-*` properties sit in the block's GenerateBlocks styles like any other CSS, so you can see or fine-tune them there. (A `mask-image` you type by hand in the Styles panel shows in the Mask panel as "no shape"; the panel only reads shapes it wrote.)

#### Uploaded and pasted SVGs

- **Cleaned in the browser** to plain shapes: paths, rectangles, circles, ellipses, lines, polygons, groups, gradients and the like. Scripts, event handlers (`onclick`…), styles, text, embedded images and links to other files are removed.
- **Up to 100 KB** after cleaning. Masks are simple shapes; a bigger file is usually an illustration with images inside.
- **It needs a size**: a `viewBox` (or a width and height) so it can be scaled to the image.
- If a file can't be used, the picker says why: not a valid SVG, no `viewBox` (or width and height), no shapes found, or too detailed (over 100 KB).
- **Stored with the image**, encoded inside its CSS. That's also true of library shapes: picking one stores a copy. So editing a shape in the library later doesn't change images that already use it (pick it again to update one), and deleting a library shape never breaks a page.

**The shape library and GenerateBlocks Pro.** The Shape library tab lists every shape in GenerateBlocks' library, including any added to it, so your shapes from GenerateBlocks Pro's Asset Library show up there too (confirmed on a GB Pro site). Manage your mask shapes there; there's no separate library to maintain.

**Accessibility.** A mask is purely visual: the image keeps its alt text and is read as normal. A linked image keeps its keyboard focus outline, because the outline is drawn on the link, which isn't masked. Tip: don't mask away parts of an image that carry information (text in the image, a face in a team photo, part of a chart).

**Browser support.** CSS masks are supported in all current browsers (Chrome and Edge 120+, Safari 15.4+, Firefox 53+). Older browsers simply show the image without the mask.

---

## Video backgrounds

Not a block: a **Video background** panel added to the sidebar of the GenerateBlocks **Element** block (GB 2's `generateblocks/element`, the container). Paste a video address, pick a poster image, and the video plays silently behind whatever is in the container, the way a background image would sit there. Think a hero with slow drone footage, or a section with a looping kitchen shot behind the text.

- **Only Bunny and Vimeo.** A video file on [Bunny](https://bunny.net) (an `.mp4` or `.webm` address), or a Vimeo video. Never YouTube, and never a video uploaded to the Media Library (see [Why only Bunny and Vimeo?](#why-only-bunny-and-vimeo)).
- **The page doesn't wait for the video.** The HTML only has the poster image (with `srcset`, so phones get a small one), the overlay and the pause button. A small deferred script adds the video once the page has finished loading, and only when the section is on screen (or nearly).
- **A pause button is always there** while a video can play, as WCAG 2.2.2 requires for anything that moves for more than five seconds. Use the round one the plugin adds (in the corner you choose) or your own GenerateBlocks button.
- **Poster only** for visitors who prefer reduced motion, who have Data Saver on or are on a 2G connection, or who paused a background video before. They get a Play button to start it anyway.
- **Nothing loads** on pages without a video background. Pages with one get a ~6.3 KB script (2.7 KB gzipped) and ~2.3 KB of CSS (0.7 KB gzipped).

> **In the editor the video doesn't play.** The poster (with the overlay) is shown as the container's background, so editing stays quick. The video plays on the site.

### Video background recipe

#### A hero with a Bunny video behind it

1. **Get an MP4 address from Bunny.** Bunny Stream doesn't show this address anywhere, so you put it together:
   - In the video library's **Encoding** settings, turn on **MP4 Fallback**, so its videos also get MP4 files (it applies to videos encoded afterwards: re-encode or re-upload existing ones).
   - On the library's **API** tab, copy the **CDN Hostname** (like `vz-a1b2c3d4-e5f.b-cdn.net`).
   - Copy the video's ID (in its **Direct Play URL**, the long ID after the library number: `…/play/123456/8f7e6d5c-…`).
   - The address is `https://` + hostname + `/` + video ID + `/play_720p.mp4` (or `play_480p.mp4` for the phone video), like `https://vz-a1b2c3d4-e5f.b-cdn.net/8f7e6d5c-…/play_720p.mp4`. Paste the Direct Play URL into the panel and it shows this address with the ID filled in.
   - If it won't play, check the library's **Security** settings: **Block direct URL file access** must be off, and if you've set allowed referrers, your site's domain must be on the list.

   (A video in a plain Bunny Storage zone with a pull zone works too: its `.b-cdn.net` address ending in `.mp4`.)
2. **Grab a still for the poster.** A frame from the start of the video, exported as a JPG or WebP about 1920 px wide, uploaded to the Media Library.
3. Select the hero's **Element** block and open **Video background** in the sidebar.
4. Paste the address into **Video address**. The help text under it says what kind of video it found (or why it can't be used).
5. Under **Poster image**, click **Choose an image** and pick the still. Drag the **focal point** onto the part of the picture that must stay in frame on narrow screens.
6. Turn on **First thing on the page**, since this is the hero.
7. Pick an **Overlay** colour (say your theme's Contrast colour) and set the **Overlay opacity** until the heading reads well over the poster. Check the contrast against the poster, as it's what many visitors see.
8. Optional: under **Smaller video for phones**, paste the same address ending `play_480p.mp4`, to save visitors' data.
9. Publish and view the page.

Give the Element its height, padding and layout in GB's Styles panel as usual (a `min-height` for a hero). The video covers the whole container, like `background-size: cover`.

**With Vimeo** instead: paste the video's normal address (`https://vimeo.com/123456789`; for an unlisted video, the address with its privacy code, `https://vimeo.com/123456789/abcdef1234`) and set **Vimeo video shape** to the video's proportions (16:9 for most). It plays with Vimeo's background player, which needs a paid Vimeo plan; Vimeo's player loads only when it's time to play, with `dnt=1` so Vimeo sets no tracking cookies. Or, on a paid Vimeo plan, paste a **video file link** from the video's Vimeo settings: it plays in the page like a Bunny video, without Vimeo's player, which is lighter.

#### Use your own pause button

1. Inside the container with the video background, add a GenerateBlocks **Text** block and set its tag to **Button**. Give it some text ("Pause video") or an icon, and style it in the Styles panel.
2. With it selected, open its **Video background** panel and turn on **Video pause/play button**.
3. Style the two states with nested selectors on the button: `&[data-state="playing"]` and `&[data-state="paused"]`.

The plugin's round button is then left out. Your button is hidden until the video can play (and stays hidden if it never can), and it keeps its own text as its name (what voice-control users say), with `aria-pressed="true"` while the video is paused. An icon-only button is named "Pause background video" / "Play background video" as it changes instead.

### Video background settings

Select a GenerateBlocks Element block. The panel opens by itself on containers that already have a video background. The settings below **Video address** appear once there's an address.

| Setting | Stored as | Default | Notes |
| --- | --- | --- | --- |
| Video address | `src` | – | A Bunny video (an `.mp4` or `.webm` address on `*.b-cdn.net`, or on a hostname added in [Settings](#settings)) or a Vimeo video (`vimeo.com/123`, `vimeo.com/123/hash`, `player.vimeo.com/video/123`, or a Vimeo video file link). `https://` only. Always muted. The help text says which kind it is, or why it won't be used (below). |
| Poster image | `poster` | – | A Media Library image (its ID). Shows straight away while the video loads, and is all that visitors who prefer less motion or are saving data see. Use a frame from the video. A warning shows until one is chosen: without it the section is blank until the video loads. |
| Focal point | `focus` | `50% 50%` | Shown over the poster once one is chosen. Keeps that point in frame on narrow screens, for both the poster and the video (`object-position`). |
| First thing on the page | `hero` | Off | For a hero: the poster loads straight away and first (`fetchpriority="high"`, not lazy-loaded), since it's what the page's loading score (LCP) measures. Leave off for anything further down, so the poster lazy-loads. |
| Playback | `loop` | Loop | **Loop** or **Play once**. |
| When it ends | `end` | Stay on last frame | Shown for Play once. **Stay on last frame** (`last`) or **Back to poster** (`poster`). Either way the button then offers Play, which starts it again. |
| Speed | `speed` | Normal | Half speed (`0.5`), Slow motion (`0.75`), Normal (`1`), A little faster (`1.25`). |
| On phones | `phones` | Video | **Video** or **Poster only** (`poster`): screens under 768 px wide get just the poster, with no video loaded and no button. |
| Smaller video for phones (optional) | `mobile` | – | Shown when On phones is Video. Screens under 768 px wide play this instead, e.g. Bunny's `play_480p.mp4`. Checked like the Video address. |
| Vimeo video shape | `ratio` | `16:9` | Shown for a Vimeo address (not a Vimeo file link). `16:9`, `21:9`, `4:3`, `1:1` or `9:16`. Vimeo's player can't crop itself, so the script scales it to cover the section using this shape. |
| Overlay | `overlay` | None | A colour from your GB Pro design tokens, or the theme palette (GeneratePress global colours included) without them, over the video, so text on it stays readable. |
| Overlay opacity (%) | `opacity` | `40` | Shown once there's an overlay colour. 0–90. |
| Pause button position | `button` | Bottom right | `bottom-right`, `bottom-left`, `top-right` or `top-left`. Ignored when the container has its own [pause/play button](#use-your-own-pause-button). |
| **Remove video background** | – | – | Removes the setting from the container. |
| Video pause/play button | `data-video-part="button"` | Off | Not in this panel: on a GB Text block **inside** a container with a video background, in its own **Video background** panel. |

The settings are saved as one JSON attribute, `data-tmb-video`, in the Element's own GenerateBlocks **HTML Attributes** (you'll see it in that panel), so GenerateBlocks saves it like any other attribute. Only values that differ from the defaults are stored: `{"src":"https://vz-abc.b-cdn.net/…/play_720p.mp4","poster":123,"hero":true}`.

**Addresses that won't work**, and what the panel says about them (with "This video won't be used on the site"):

- **YouTube**: not supported; use a Bunny or Vimeo video.
- **Bunny's player page** (`iframe.mediadelivery.net`, `player.mediadelivery.net`, `video.bunnycdn.com`): use the video's MP4 address instead. The panel picks the video ID out of a Direct Play URL and shows the address to use, `https://YOUR-CDN-HOSTNAME.b-cdn.net/VIDEO-ID/play_720p.mp4` (see step 1 above).
- **HLS streams** (`.m3u8`): they need a heavy player script; use the MP4 version instead.
- **Not a video file** (a Bunny address that doesn't end in `.mp4` or `.webm`), **not a Vimeo video address** (a Vimeo showcase or channel page, say), **another site**, or **not `https://`**.

### How a video background behaves

- **Fades in over the poster** once it's actually playing (0.6 s; no fade for reduced motion), so there's no black flash while it loads.
- **Plays only while it can be seen.** It pauses when the section scrolls off screen and when the browser tab is hidden, and carries on when it's back.
- **Always muted, plays inline** (no full-screen takeover on iPhones), with no controls, picture-in-picture or casting. The video is hidden from screen readers and can't be reached with Tab: it's decoration, like a background image.
- **Pausing is remembered** across the site (in the visitor's browser), and pausing one background video pauses every background video on the page. Pressing Play starts them again and forgets the pause.
- **If the browser won't autoplay** (iOS Low Power Mode, for example), the button offers Play instead of Pause.
- **If a video file can't load** (a typo, a deleted file), the poster stays and the button goes away.
- **Without JavaScript** the poster and overlay show, and the button stays hidden, since nothing moves.
- **Entrance animations**: animating a container's blocks "one by one" skips the video layer and pause button, so they never animate in as if they were content.

### Video background performance

- **Nothing on pages without one.** The script and CSS are enqueued by a container with a video background as it renders, so other pages load nothing, and the editor panel only loads in the editor.
- **The video never competes with the page.** It isn't in the HTML. The script (deferred, in the footer) adds it only after the page's `load` event, and only for sections on screen or within 200 px of it. A video further down the page isn't downloaded until the visitor scrolls near it.
- **The poster is a normal responsive image** (`wp_get_attachment_image()` with `srcset` and `sizes="100vw"`): lazy-loaded, or for **First thing on the page** loaded eagerly with `fetchpriority="high"`, which is what makes a hero's LCP fast.
- **Smaller on phones**: a phone video, or the poster only.
- **No player for file links.** A Bunny or Vimeo file plays in a plain `<video>`. Only a Vimeo address loads Vimeo's background player, in an iframe, when it's time to play.
- **Saves data**: Data Saver and 2G connections get the poster only.

### Video background accessibility

- **Pause/play button (WCAG 2.2.2)**: always present when a video can play, a real `<button>` whose name switches between "Pause background video" and "Play background video". A focus ring that shows on any video (a white ring with a dark edge), and a border in Windows high-contrast mode. 44 px (2.75rem) by default. Your own GB button keeps its text as its name and says it's pressed (`aria-pressed`) while paused; an icon-only one gets the same names. It gets `role="button"`, `tabindex="0"` and Enter/Space if it isn't a `<button>`.
- **Reduced motion and saving data**: the poster only, unless the visitor presses Play.
- **The video is decoration**: hidden from screen readers (`aria-hidden` on the background layer), not focusable, no sound.
- **Text over video**: use the overlay, and check your text's contrast against the poster (4.5:1 for normal text). A busy, bright video under white text is the usual problem; a darker overlay at 40–60% fixes most.

### Video background security

Anyone who can edit a post (Authors, Contributors) can set a video background, and an HTML attribute can be typed by hand. So:

- **The source is checked on the server every time the page is built**, not just in the editor: `https` only, no user names or ports; Bunny only on `*.b-cdn.net` or a hostname an administrator listed in Settings; Vimeo only as a video ID (plus privacy code) or a Vimeo file address. Anything else and the container renders with no video, no script and the attribute removed. So nobody editing a page can point a background at another site.
- **The script's settings are rebuilt from the checked values** (the `data-tmb-video` the visitor's browser sees isn't the saved one), and the script checks them again before using them, since data attributes can be forged.
- **Everything else is whitelisted**: the overlay colour must be a hex, `rgb()`/`hsl()`, named colour or `var(--…)`; the focal point two percentages; the speed, button position, Vimeo shape and phone setting one of the listed values; opacity 0–90; the poster a Media Library image ID.
- **Vimeo**: messages are only accepted from Vimeo's player (`https://player.vimeo.com`, from that iframe), and commands are only sent there. The player is loaded with `dnt=1`, so Vimeo sets no tracking cookies.
- **Your own Bunny hostnames** can only be changed by administrators (Settings → Thingamablocks), and are cleaned to plain hostnames (20 at most).

### Why only Bunny and Vimeo?

- **Not the Media Library**, because video files are big and most WordPress hosts serve them slowly, without the streaming-friendly delivery a CDN gives, and they'd count against the site's storage and bandwidth. Bunny is cheap, fast and serves plain MP4s; Vimeo is what many clients already use.
- **Not YouTube**, because its player is heavy (several hundred KB of script), sets cookies, and can't be stopped from showing its own title, logo and "more videos" screens, which don't belong on a background.
- **Not HLS (`.m3u8`) or Bunny's own player**, because both need a player script on the page. An MP4 (Bunny's MP4 fallback) plays in a plain `<video>`, which every browser handles natively.

Keeping the list short is also what makes the [security](#video-background-security) check simple: the server only has to recognise two kinds of address.

---

## FAQ schema

Not a block: an **FAQ schema** panel added to the sidebar of the **GenerateBlocks Pro Accordion** block. Switch it on and the page gets schema.org `FAQPage` structured data: each accordion item's title is a question, and its content the answer.

- **Needs GenerateBlocks Pro 2.x.** The Accordion is a Pro block, so on a site with only free GenerateBlocks the panel never shows up (and nothing else changes).
- **Always matches the page.** The questions and answers aren't typed in twice or saved separately: they're read from the rendered accordion every time the page loads. Edit an item and the schema follows.
- **Nothing loads on the front end** apart from the structured data itself: one `<script type="application/ld+json">` in the footer, only on pages with an FAQ accordion. No JavaScript or CSS.
- **Several FAQ accordions on one page** are combined into one `FAQPage`, printed once.

> **An honest note on Google.** Since August 2023 Google only shows FAQ rich results (the expandable questions under a search result) for well-known government and health websites. For everyone else the structured data is still valid and still read: search engines use it to understand the page, and AI search tools and assistants read it too. It just won't make your listing bigger in Google.

### FAQ schema recipe

#### Turn an accordion into an FAQ

1. Build the accordion as usual with GenerateBlocks Pro: each item's title is the question, its content the answer.
2. Select the **Accordion** itself (the outer block, not an item; the List View or the breadcrumb bar at the bottom of the editor helps).
3. Open **FAQ schema** in the sidebar and turn on **Add FAQ structured data**.
4. Check the list under the switch: it shows the questions that will be included, and warns about any items left out because their title or content is empty.
5. Publish, then paste the page's address into the [Schema Markup Validator](https://validator.schema.org/) to see the `FAQPage` it finds.

| Setting | Stored as | Default | Notes |
| --- | --- | --- | --- |
| Add FAQ structured data | `data-tmb-faq="true"` | Off | Saved in the accordion's own GenerateBlocks **HTML Attributes**, like the entrance animation settings. Turning it off removes the attribute. The panel opens by itself on accordions that already have it. |

### What goes into the schema

- **The question** is the item's toggle text, without its open/close icon.
- **The answer** is the item's content, cut down to the HTML Google reads in FAQ answers: paragraphs, `div`s, headings, lists, links (with just their `href`), line breaks, and bold/italic (`b`, `strong`, `i`, `em`). Everything else goes: images, icons, embedded CSS and scripts, classes, styles and other attributes. Text inside removed tags is kept, so a GenerateBlocks Text block's words still come through.
- **Items left out:** an item with an empty title or no content (the panel warns you about these), and items hidden by block conditions (for example GenerateBlocks Pro's conditions), so visitors and search engines see the same questions. An accordion hidden as a whole adds nothing.
- **Nested accordions** keep their own items: an accordion inside an answer doesn't add its questions to the outer one. It's only included if it has FAQ schema switched on itself.
- **The same question twice** (say, the same FAQ accordion in the page and in a GeneratePress Element) is listed once, with the first answer.

### FAQ schema and SEO plugins

Yoast SEO and Rank Math add an `FAQPage` for their own FAQ blocks, so **on a page with a Yoast SEO or Rank Math FAQ block, Thingamablocks prints nothing** and leaves the page's FAQ to that block (one `FAQPage` per page). Otherwise there's no overlap, except schema you add yourself (in Rank Math's Schema Generator, say): then switch FAQ schema off on that accordion, or stop Thingamablocks printing it with the `thingamablocks_faq_schema` filter (see [PHP](#php)): return `null` and nothing is printed.

**Only on single posts and pages.** An archive or blog page showing several posts' full content isn't one FAQ, so no `FAQPage` is printed there. FAQ accordions in GeneratePress Elements, overlays and other footer output on a single page are included.

---

## Developer API

### Toggle: the `tmb-toggle:change` event

Fired on the toggle's wrapper (`.tmb-toggle`) whenever its state is set, including once on page load. It bubbles, so you can listen on `document`:

```js
document.addEventListener( 'tmb-toggle:change', ( event ) => {
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
| `toggle` | Element | The `.tmb-toggle` wrapper that changed |

For a sync group the event fires once, on the toggle that was used; the other toggles in the group are updated (and run their actions) but don't fire their own event.

### Toggle: `window.tmbToggle`

```js
window.tmbToggle.get( 'billing' );             // true, false, or undefined if not found
window.tmbToggle.set( 'billing', true );       // turn on
window.tmbToggle.set( 'color-scheme', false ); // light mode
window.tmbToggle.init( container );            // set up toggles added later, e.g. by AJAX
```

- `get` / `set` take a toggle's **Sync group** name or its wrapper `id`. The `id` is the HTML anchor if you set one; otherwise it's `tmb-toggle-1`, `tmb-toggle-2`… in page order, which changes if you add toggles, so use a group or an anchor for anything you rely on. `set()` counts as a visitor's choice: it's remembered if "Remember" is on.
- `init( root )` sets up every toggle inside `root` (default `document`) that isn't set up yet. Toggles already set up are skipped, so calling it more than once is safe.

### Countdown: events

Both bubble from the countdown's wrapper (`.tmb-countdown`), so you can listen on `document`.

```js
document.addEventListener( 'tmb-countdown:end', ( event ) => {
	const { countdown, mode, initial } = event.detail;

	if ( 'offer-48h' === countdown.id && ! initial ) {
		console.log( 'The offer just ran out' );
	}
} );
```

| Event | `event.detail` | When |
| --- | --- | --- |
| `tmb-countdown:end` | `countdown` (the wrapper element), `mode` (`date` or `evergreen`), `initial` (`true` if it had already ended when the page loaded) | A date countdown, or an evergreen one without "Start again", reaches zero. Fired before any redirect. |
| `tmb-countdown:restart` | `countdown` (the wrapper element), `end` (the new end time, ms since the epoch) | A recurring countdown, or an evergreen one with "Start again", rolls over to its next run. Not fired on page load. |

Recurring and restarting evergreen countdowns never fire `tmb-countdown:end`.

### Countdown: `window.tmbCountdown`

```js
window.tmbCountdown.init( container );  // set up countdowns added later, e.g. by AJAX
window.tmbCountdown.reset( 'offer-48h' ); // restart an evergreen countdown for this visitor
window.tmbCountdown.reset();            // restart every evergreen countdown on the page
```

- `init( root )` sets up every countdown inside `root` (default `document`) that isn't set up yet; calling it more than once is safe.
- `reset( id )` clears the visitor's saved deadline for the evergreen countdown with that HTML anchor and starts a fresh run. Handy when testing. Other modes are ignored.

### Marquee: `window.tmbMarquee`

```js
window.tmbMarquee.init( container );          // set up marquees added later, e.g. by AJAX
window.tmbMarquee.pause( 'client-logos' );        // toggle pause on the marquee with this HTML anchor
window.tmbMarquee.pause( 'client-logos', true );  // pause
window.tmbMarquee.pause( element, false );        // play (pass the .tmb-marquee element itself)
```

- `init( root )` sets up every marquee inside `root` (default `document`) that isn't set up yet; calling it more than once is safe.
- `pause( elementOrAnchor, pause? )` takes the wrapper element or its HTML anchor. `true` pauses, `false` plays, leaving it out toggles. It works like pressing the pause button (and updates its `aria-pressed`). Hover, focus and off-screen pausing still apply on top.

The Marquee fires no events.

### Dropdown: events

Both bubble from the dropdown's wrapper (`.tmb-dropdown`), so you can listen on `document`.

```js
document.addEventListener( 'tmb-dropdown:open', ( event ) => {
	if ( 'product-downloads' === event.detail.dropdown.id ) {
		console.log( 'Someone opened the downloads' );
	}
} );
```

| Event | `event.detail` | When |
| --- | --- | --- |
| `tmb-dropdown:open` | `dropdown` (the wrapper element) | The drawer opens, by the button, the keyboard or `window.tmbDropdown`. |
| `tmb-dropdown:close` | `dropdown` (the wrapper element) | The drawer closes, for any reason. Fired as it starts closing, before the closing animation ends. |

### Dropdown: `window.tmbDropdown`

```js
window.tmbDropdown.init( container );            // set up dropdowns added later, e.g. by AJAX
window.tmbDropdown.open( 'product-downloads' );  // open the dropdown with this HTML anchor
window.tmbDropdown.close( 'product-downloads' ); // close it
window.tmbDropdown.toggle( element );            // open or close (pass the .tmb-dropdown element itself)
```

- `init( root )` sets up every dropdown inside `root` (default `document`) that isn't set up yet; calling it more than once is safe.
- `open`, `close` and `toggle` take the wrapper element or its HTML anchor. Opening one closes any other that's open, as a click would. They don't move keyboard focus.

### Breadcrumbs: `window.tmbBreadcrumbs`

```js
window.tmbBreadcrumbs.init( container ); // set up breadcrumbs added later, e.g. by AJAX
```

- `init( root )` sets up collapsing for every Breadcrumbs block inside `root` (default `document`) that isn't set up yet; calling it more than once is safe. Only trails with **Collapse when it doesn't fit** on need it – the trail itself is plain HTML from the server.

The Breadcrumbs block fires no events. Its PHP filters are under [PHP](#php).

### Entrance animations: `window.tmbAnimate`

```js
window.tmbAnimate.init( container ); // set up animated blocks added later, e.g. by AJAX
window.tmbAnimate.replay( element ); // play the animations inside element again (no argument: whole page)
```

- `init( root )` sets up every `[data-tmb-animate]` block inside `root` (default `document`) that isn't set up yet; calling it more than once is safe. Content added after the page has loaded (filters, infinite scroll, modals) is picked up automatically by a MutationObserver, so you rarely need this. Before the script arrives every animated block is hidden (with a 4-second fail-safe); after it arrives only blocks it is watching (`.tmb-wait`) are hidden, so nothing can get stuck invisible.
- `replay( element )` plays the animations inside (and on) `element` again, restarting any still playing; with no argument, the whole page. Only blocks that have already animated in are replayed. Does nothing for visitors who prefer reduced motion.
- To animate your own markup, add the attributes yourself: `<div data-tmb-animate="fade-up" data-tmb-delay="200">`. The script and CSS load only when a block rendered through WordPress contains `data-tmb-animate`, so on a page without one, enqueue `thingamablocks-animations` and print the CSS (see the filter below).

### Video backgrounds: `window.tmbVideo`

```js
window.tmbVideo.init( container );                       // set up video backgrounds added later, e.g. by AJAX
document.querySelector( '#hero' ).tmbVideo.pause();       // pause one (and .play() to play it)
```

- `init( root )` sets up every `.tmb-has-video[data-tmb-video]` container inside `root` (default `document`) that isn't set up yet; calling it more than once is safe. The container must have come from the server (it needs the layer and button PHP adds).
- Each set-up container gets `element.tmbVideo.play()` and `.pause()`. These don't touch the remembered pause; the visitor's button does.
- The pause/play button is a normal button: style the default one with the custom properties below, or use your own (see [Use your own pause button](#use-your-own-pause-button)). The `tmb-video:paused` event on `document` is internal (it keeps the videos on a page in step), not an API.

### CSS hooks

- `.tmb-toggle` – the Toggle wrapper, with `.is-on` or `.is-off`.
- `[data-toggle-part="switch|on|off"]` – the parts, with `aria-checked` / `data-active` / `aria-pressed` as described above; `[data-toggle-owned]` once a toggle has claimed them.
- `html[data-color-scheme="dark|light"]` – set by dark mode toggles.
- `.tmb-toggle-hidden` – on elements hidden by a show/hide toggle (together with an inline `display: none !important`).
- `.tmb-toggle-enter-fade`, `.tmb-toggle-enter-slide` – on an element while its reveal animation runs.
- `.tmb-countdown` – the Countdown wrapper, with `.is-running` or `.is-ended`.
- `[data-countdown-part="days|hours|minutes|seconds|timer|ended|separator"]`, `[data-countdown-unit="days|hours|minutes|seconds"]` – the countdown parts. Hidden parts and elements get an inline `display: none !important`.
- `.tmb-marquee` – the Marquee wrapper, with `.is-paused` while it isn't moving.
- `[data-marquee-part="items|pause"]` – the scrolling row and the pause button (with `aria-pressed`); `[data-marquee-owned]` once a marquee has claimed them.
- `.tmb-marquee__viewport` > `.tmb-marquee__track` – added by the script: the viewport clips and carries the edge fade; the track holds the row and its copies, and is what moves.
- `.tmb-dropdown` – the Dropdown wrapper, with `.is-open` while open, `data-placement="bottom|top"` while open, and the `--tmb-dropdown-gap` custom property (the **Space between button and drawer**).
- `[data-dropdown-part="button|drawer"]` – the button (with `aria-expanded` and `aria-controls`) and the drawer (an inline `display: none` while closed); `[data-dropdown-owned]` once a dropdown has claimed them.
- `.tmb-breadcrumbs` – the Breadcrumbs wrapper (a `<nav>`), with `data-tmb-breadcrumbs` when collapsing is on. `.tmb-breadcrumbs__list` – the `<ol>`; `.tmb-breadcrumbs__step` – each `<li>` (`hidden` while collapsed away); `.tmb-breadcrumbs__more` – the "…" button (in an `li.tmb-breadcrumbs__more-step`).
- `[data-breadcrumb-part="item|separator|current"]` – the parts, repeated for each step; the current page has `aria-current="page"`, separators `aria-hidden="true"`.
- `.tmb-search` – the Search wrapper (a `<form role="search">`). `input.tmb-search__input` – the real input that replaces the input part (it keeps `data-search-part="input"`).
- `[data-search-part="field|input|submit|label|toggle"]` – the parts; the expanding style's toggle has `aria-expanded` and `aria-controls`, and its field an inline `display: none` while closed.
- `[data-tmb-animate]` (with `data-tmb-speed`, `data-tmb-delay`, `data-tmb-animate-children`) – a block with an entrance animation. It gets `.tmb-in` when it starts animating (straight away for reduced motion), and keeps it.
- `html.tmb-animate-js` – JavaScript is running; only then are animated blocks hidden. `html.tmb-animate-ready` – the animation script has loaded (switches off the fail-safe).
- `.tmb-has-video` – a container with a video background (with `data-tmb-video`, the cleaned settings for the script). It gets `position: relative` and `isolation: isolate` at zero specificity, so a position set in GB wins.
- `.tmb-video-bg` – the background layer (`aria-hidden`, `data-tmb-video-layer`), with `.is-playing` once the video is playing. Inside it: `.tmb-video-bg__poster` (the `<img>`), `.tmb-video-bg__video` (the `<video>`) or `.tmb-video-bg__iframe` (Vimeo's player), and `.tmb-video-bg__overlay`.
- `.tmb-video-bg__button` – the default pause/play button, with `data-position="bottom-right|bottom-left|top-right|top-left"` and `data-state="playing|paused"`. Your own button (`[data-video-part="button"]`) gets the same `data-state`.
- Custom properties for the default button (set them on the container or any ancestor): `--tmb-video-button-size` (2.75rem), `--tmb-video-button-background` (`rgba(0,0,0,.6)`), `--tmb-video-button-background-hover` (`rgba(0,0,0,.8)`), `--tmb-video-button-color` (`#fff`), `--tmb-video-button-inset` (1rem, the distance from the corner). `--tmb-video-focus` is the focal point, set inline on the layer.

### PHP

- Function `thingamablocks_is_enabled( $key )` – whether a block or feature is switched on in **Settings → Thingamablocks** (`true` unless it's been switched off). Keys: `toggle`, `countdown`, `marquee`, `dropdown`, `breadcrumbs`, `search`, `animations`, `masks`, `video`, `faq`.
- Option `thingamablocks_settings` – the switches, as an array of key => `true`/`false`. A missing key counts as on. Removed when the plugin is deleted.
- Filter `thingamablocks_print_color_scheme_script` – return `false` to stop printing the dark mode `<head>` output (the no-flash script).
- Option `thingamablocks_color_scheme` – the dark mode settings per post ID (`followSystem`, `htmlClass`, `modified`).
- Option `thingamablocks_video_hosts` – the extra Bunny hostnames allowed for video backgrounds (**Your own Bunny hostnames**), as a list of lower-case hostnames. `Thingamablocks_Video_Background::hosts()` returns them cleaned.
- Filter `thingamablocks_animation_head_markup` – the `<style id="tmb-animate-css">` and inline `<script id="tmb-animate-js">` that hide animated blocks until they animate in. Printed only on pages with an animated block: in `<head>` when the post being viewed uses an animation or a block theme has already rendered one, otherwise just before the first animated block. Return a changed string, or `''` to print your own CSS instead (without it nothing is hidden, so blocks show and then animate from their start state). Filter `thingamablocks_animations_print_css` – return `false` to skip printing it in `<head>` (it's then printed before the first animated block).
- Filter `thingamablocks_breadcrumbs_trail` – change the breadcrumb trail. Receives `$trail`, a list of steps (`array( 'label' => 'Recipes', 'url' => 'https://…' )`, the last being the current page; a step with an empty `url` isn't a link), and `$options`, the block's cleaned settings. It runs after the trail is built (or taken from the SEO plugin). Labels are stripped of HTML and escaped afterwards, and steps without a label are dropped.

  ```php
  // Projects have no archive, so link them to the "Our work" page.
  add_filter( 'thingamablocks_breadcrumbs_trail', function ( $trail ) {
  	if ( is_singular( 'project' ) ) {
  		array_splice( $trail, 1, 0, array( array( 'label' => 'Our work', 'url' => home_url( '/our-work/' ) ) ) );
  	}
  	return $trail;
  } );
  ```

- Filter `thingamablocks_breadcrumbs_seo_schema` ( `$adds`, `$plugin` ) – whether an SEO plugin already adds breadcrumb structured data, so blocks on **Automatic** don't add it again. `$adds` is what the block detected (Yoast, Rank Math with its breadcrumbs on, All in One SEO, The SEO Framework, Slim SEO); return `true` for an SEO plugin it doesn't know, or `false` if you've switched your plugin's breadcrumb schema off.

  ```php
  add_filter( 'thingamablocks_breadcrumbs_seo_schema', '__return_true' );
  ```

- Filter `thingamablocks_faq_schema` – the `FAQPage` structured data built from the page's FAQ accordions, as an array (`@context`, `@type`, `mainEntity`: a list of `Question`s, each with a `name` and an `acceptedAnswer` whose `text` is the cleaned answer HTML), just before it's printed in the footer. Change it, or return `null` to print nothing (for instance when your SEO plugin already adds an `FAQPage` to the page).

  ```php
  // The SEO plugin handles FAQ schema on the support pages.
  add_filter( 'thingamablocks_faq_schema', function ( $data ) {
  	return is_page( 'support' ) ? null : $data;
  } );
  ```

- URL parameter `tmb_types` – a comma-separated list of content types to limit the main search query to (`/?s=lemon&tmb_types=page,post`), sent by Search blocks that search Pages or several types. Only viewable types are used; anything else is ignored. It's read in `pre_get_posts` rather than registered as a query variable, so it never changes which page WordPress shows.
- Script handle `thingamablocks-search-expand` – the Search block's expanding-style script (`build/search/expand.js`), registered on every page, enqueued only by a search that uses it.
- Script handle `thingamablocks-animations` – the entrance animation script (`build/animations/view.js`), registered on every page, enqueued only where needed.
- Script and style handles `thingamablocks-video` – the video background script and CSS (`build/video/view.js`, `view.css`), registered on every page, enqueued only by a container with a usable video background.

### Storage keys

All in `localStorage`:

- **Toggle:** `tmb-toggle:` then `group:<sync group>`, else `id:<HTML anchor>`, else `path:<page path>#<position>` (e.g. `tmb-toggle:path:/pricing/#0`). Dark mode always uses `tmb-toggle:color-scheme`, which the `<head>` script reads.
- **Countdown** (evergreen only): `tmb-countdown:id:<HTML anchor>`, else `tmb-countdown:path:<page path>#<position>`, where position counts the countdowns on the page from 0. The value is the visitor's end time in ms since the epoch.
- **Video backgrounds:** `tmb-video-paused` – `1` once the visitor has paused a background video; removed when they press Play. Applies site-wide.

---

## How it's built

For Kyle, and anyone new to block plugins.

### Why a wrapper around GenerateBlocks blocks

A block plugin could draw its own switch or timer and give you a set of colour and size controls. That would mean a second styling system next to GenerateBlocks, and it would never quite match. Instead every block follows the pattern GB Pro uses for Accordion and Tabs:

- The **block** (`thingamablocks/toggle`, `thingamablocks/countdown`, `thingamablocks/marquee`, `thingamablocks/dropdown`, `thingamablocks/breadcrumbs`, `thingamablocks/search`) has no visual settings. It holds behaviour: what happens when toggled or when time runs out, the starting state, the end date, the speed and direction, how the drawer opens, what goes in the trail, what to search, and so on.
- Its **inner blocks** are normal GenerateBlocks blocks. The starting layouts (`src/*/templates.js`) are just block templates whose parts carry shared GB Pro Global Styles classes (`globalClasses`), created by `includes/class-thingamablocks-global-styles.php` from the defaults in `includes/global-styles/{block}.php`; see [Starting layouts and Global Styles](#starting-layouts-and-global-styles). Once inserted, they're yours to edit like any other GB block.
- A block plays a role by being marked as a **part** (`data-toggle-part`, `data-countdown-part`, `data-countdown-unit`, `data-marquee-part`, `data-dropdown-part`, `data-breadcrumb-part`, `data-search-part`), stored in GB's own `htmlAttributes`. The plugin adds the "Toggle part" / "Countdown part" / "Marquee part" / "Dropdown part" / "Breadcrumb part" / "Search part" panels to GB blocks with a standard WordPress editor filter (`editor.BlockEdit`), so nothing about GB itself is modified.

GenerateBlocks exposes some editor globals (`window.gb.*`). This plugin doesn't use them; everything goes through standard WordPress block APIs and GB's saved block attributes, so it doesn't depend on GB internals that could change.

### What's saved vs. what's rendered

All six blocks save only their inner blocks (`save` returns `<InnerBlocks.Content />`) plus their settings as block attributes. The wrapper (a `<div>`, the Breadcrumbs' `<nav>`, or the Search's `<form>`) is rendered in PHP, which means a settings change never causes a "This block contains unexpected content" error.

**Toggle**

- On the front end, PHP (`includes/class-thingamablocks-toggle-render.php`) renders the wrapper `<div class="tmb-toggle is-off" data-tmb-toggle="{…config…}">` (plus the anchor as `id`), and walks the inner HTML with WordPress's `WP_HTML_Tag_Processor` to add the roles and state attributes to the parts.
- For show/hide, PHP also prints a tiny `<style class="tmb-toggle-initial">` that hides whichever targets start hidden, so there's no flash of both. The front-end script removes it once it's taken over.
- For a toggle that remembers the visitor's choice and has a storage key the server can work out (a sync group or HTML anchor, or any dark mode toggle), PHP prints a tiny inline script right after the wrapper. It runs as the page is parsed, reads the saved choice, and flips the wrapper's classes, the parts' ARIA state and the no-flash `<style>` before the first paint. The main script then takes over as usual.
- The front-end script (`src/toggle/view.js`, loaded only on pages with a Toggle) reads the config, restores any saved choice, and handles clicks, keys, sync groups, the event and `window.tmbToggle`. Hiding sets an inline `display: none !important` as well as the class, and reveal animations use the Web Animations API rather than CSS keyframes, so "remove unused CSS" optimisations can't break them.
- In the editor (`src/toggle/edit.js`), the Toggle keeps its parts' `aria-checked` / `data-active` in step with **Starts as**, so the canvas shows the state you're styling; switches the canvas to `color-scheme: dark` when a dark mode toggle is set to *On*; and dims show/hide targets that are hidden in the current state.

**Countdown**

- PHP (`includes/class-thingamablocks-countdown-render.php`) works out the time left when the page is rendered, writes the real numbers into the number parts, and hides the timer or the ended message as appropriate (inline `display:none!important`). So a visitor sees correct numbers – or the ended state – before any JavaScript runs. An evergreen countdown is rendered at its full duration, since the server can't know each visitor's deadline.
- The end date is stored as site-local time and converted with `wp_timezone()`. Recurring countdowns get the site's time zone (`wp_timezone_string()`) in their config, and `src/countdown/time.js` does the maths in the browser, including daylight-saving changes and fixed offsets like `UTC+2`. The editor uses the same file, so the sidebar's "Ends in …" and "Next: …" match the front end.
- **Also hide / Also show** targets that should start hidden get a `<style class="tmb-countdown-initial">`, as with the Toggle.
- The front-end script (`src/countdown/view.js`, loaded only on pages with a Countdown) ticks once a second for all countdowns together, catches up straight away when a background tab becomes visible, stores evergreen deadlines, rolls recurring and restarting runs over, and runs the end actions. Because it recalculates from the clock on load, a cached page with stale numbers corrects itself immediately.

**Marquee**

- PHP (`includes/class-thingamablocks-marquee-render.php`) renders the wrapper `<div class="tmb-marquee" data-tmb-marquee="{…config…}">` with its clipping, edge fade (a CSS mask) and, for up/down, height as inline styles. WordPress's style filter in `get_block_wrapper_attributes()` drops `mask-image`, so the fade is added to the rendered tag afterwards (built only from a validated length). It keeps the row on one line at its natural length (`width: max-content`, no wrapping), and gives the pause button its role, `aria-pressed` and label. So the strip looks right before the script runs, and stays a plain row without JavaScript.
- The front-end script (`src/marquee/view.js`, loaded only on pages with a Marquee) moves the row into a track (`.tmb-marquee__track`) inside a clipping viewport (`.tmb-marquee__viewport`), and moves the edge fade from the wrapper onto the viewport so the pause button isn't faded. It clones the row enough times to fill the space, and animates the track with the Web Animations API by one row's length plus the gap. Duration is distance ÷ speed, so speed is in px/s. A `ResizeObserver` re-measures (adding or removing copies) and keeps the current position; an `IntersectionObserver` pauses it off screen.
- In the editor (`src/marquee/edit.js`) the wrapper gets the same clipping and fade so you see the real edges, but nothing moves unless you press **Preview**.

**Dropdown**

- PHP (`includes/class-thingamablocks-dropdown-render.php`) renders the wrapper `<div class="tmb-dropdown" data-tmb-dropdown="{…config…}">` with the gap as `--tmb-dropdown-gap`. It gives the drawer an ID (keeping yours if it has one) and an inline `display:none`, and the button `aria-expanded="false"`, `aria-controls` and `type="button"` (or `role="button"` and `tabindex="0"` if it isn't a `<button>`). So it's closed and correctly labelled before the script runs. Settings are checked against their allowed values, so a forged attribute can't inject anything. Before the first dropdown on a page it prints a `<noscript><style>` that shows every drawer in the page flow when JavaScript is off.
- The positioning lives in a small stylesheet (`src/dropdown/style.scss`), loaded as a `viewStyle` only on pages with a Dropdown. Every rule is wrapped in `:where()`, so it has no specificity and any GB style wins. The wrapper is `position: relative; display: inline-block`, so it's as wide as the button, and the drawer is `position: absolute; width: 100%` below it.
- The front-end script (`src/dropdown/view.js`, loaded only on pages with a Dropdown) opens and closes it, measures the room above and below to choose the side (`data-placement`), sets the drawer's `left` to line it up and keep it on screen (allowing for a theme's list margins), and handles Escape, outside clicks, focus leaving, the Down arrow, one-at-a-time, the events and `window.tmbDropdown`. The reveal animations (`src/dropdown/reveal.js`) use the Web Animations API and are shared with the editor's **Preview** button.
- In the editor (`src/dropdown/edit.js`, `editor.scss`) the drawer sits in the page flow under the button rather than floating, and is shown only while the dropdown or something inside it is selected.

**Breadcrumbs**

- The trail is worked out in PHP when the page is rendered (`includes/class-thingamablocks-breadcrumbs-trail.php`, `Thingamablocks_Breadcrumbs_Trail`): from Yoast SEO's or Rank Math's breadcrumbs when that's switched on (their APIs are wrapped in a `try`/`catch`, so any failure falls back to the block's own trail), otherwise from WordPress's conditional tags (`is_singular()`, `is_category()`…), page and term ancestors, the Posts page setting, the primary category post meta Yoast and Rank Math save, and WooCommerce's shop page. Then the `thingamablocks_breadcrumbs_trail` filter, then every label is stripped of HTML.
- PHP (`includes/class-thingamablocks-breadcrumbs-render.php`) renders each **part template once through GenerateBlocks** (`WP_Block::render()`), so GB prints its CSS as usual. It then **repeats** that HTML for every step with the `WP_HTML_Tag_Processor`: sets the link's `href` (or removes it for a step without a page), adds `aria-current="page"` to the current page and `aria-hidden="true"` to separators, and swaps in the step's escaped title (inside GB's `.gb-text` span when the Text block has an icon). Each step is an `<li>` in `<nav class="tmb-breadcrumbs" aria-label="…"><ol class="tmb-breadcrumbs__list">`. Settings are checked against their allowed values.
- The structured data is a `<script type="application/ld+json">` `BreadcrumbList` built from the same trail, printed in the footer (`wp_footer`) for the first Breadcrumbs block on the page that wants it, so a render nobody sees (an excerpt, say) can't use it up. On **Automatic** it's skipped when an SEO plugin already adds one (see the `thingamablocks_breadcrumbs_seo_schema` filter). Only GenerateBlocks Text blocks can be the link and current-page parts (they hold text); a separator can also be a Shape.
- The block's sidebar learns which SEO plugin is active from a small inline script before the editor script (`window.tmbBreadcrumbs = { plugin: 'yoast' | 'rank-math' | '' }`, added in `thingamablocks.php`).
- A small stylesheet (`src/breadcrumbs/style.scss`, a `viewStyle`) lays the steps out in a wrapping flex row and styles the "…" button; everything else comes from the GB parts.
- The front-end script (`src/breadcrumbs/view.js`, a `viewScript`) only collapses long trails: it compares the first and last steps' positions to tell whether the list fits on one line, hides middle steps one at a time until it does, and re-checks with a `ResizeObserver` and when fonts load. The trail shows without it.
- In the editor (`src/breadcrumbs/edit.js`) the canvas shows the three part templates, not a trail.
- **Tests:** `tests/e2e/breadcrumbs.spec.js` covers page, post, archive, search and 404 trails, the markup, the home icon, leaving out the blog page and category, hiding on the home page, one `BreadcrumbList` per page, collapsing on a phone, axe checks and editor validity of every style. `tests/e2e/seo-plugins.spec.js` installs Yoast SEO and Rank Math (free) from WordPress.org, checks that the block shows Yoast's trail and leaves the structured data to Yoast, and that it uses its own trail and structured data while Rank Math's breadcrumbs are off, then deactivates them.

**Search**

- PHP (`includes/class-thingamablocks-search-render.php`, `Thingamablocks_Search_Render`) renders the wrapper as `<form role="search" method="get" action="{home URL}">`. A text input can't be a GenerateBlocks block, so the **input** part (a Text block) is swapped for a real `<input type="search" name="s">` with its text as the `placeholder`, the current search (`get_search_query()`) as its value, `enterkeyhint="search"`, and `aria-label` from the **Label** setting unless there's a label part. A **label** part becomes a `<label for>` pointing at the input. The **submit** button gets `type="submit"`; the expanding style's **toggle** gets `type="button"` (or `role="button"` and `tabindex="0"` if it isn't a `<button>`), `aria-expanded="false"` and `aria-controls`, and its field an ID and an inline `display:none`. Icon-only buttons (no text once the SVG is ignored) get `aria-label` from the **Label** setting. Attributes are added with `WP_HTML_Tag_Processor`, and every value is escaped.
- **Content types** become one hidden field: `post_type` for a single publicly queryable type (WordPress and WooCommerce handle it as usual), otherwise `tmb_types`. A `pre_get_posts` hook applies `tmb_types` to the main search query only (never in the admin). Both the saved list and the incoming `tmb_types` go through `allowed_types()`, which keeps only viewable post types (`is_post_type_viewable()`, not attachments), so a forged attribute or URL can't search private types. Parts are found with `Thingamablocks_Html` (`includes/class-thingamablocks-html.php`), a `WP_HTML_Tag_Processor` subclass whose bookmarks give each part's exact start and end, matching nested tags of the same name, so the input can be swapped in (keeping its class and ID) and a label part of any tag made a `<label>`.
- **The input's look** comes from a few lines of CSS (`src/search/style.scss`, a `viewStyle`): a reset strong enough to beat a theme's `input[type="search"]` styles (no border, background or padding; font and colour inherited), a minimum height, and a focus outline on the field (`:focus-within`, zero specificity, so the GB styles' own `&:focus-within` wins).
- **The expanding style's script** (`src/search/expand.js`, built by a `webpack.config.js` entry since it has no `block.json`) is registered on `init` and enqueued only by a search with both a toggle and a field. It opens and closes the field (an opacity fade with the Web Animations API, none for reduced motion), focuses the input, handles Escape, outside clicks and focus leaving, and nudges a positioned field sideways with `translate` to keep it 8 px inside the screen. Before such a search PHP prints a `<noscript><style>` that shows the field and hides the toggle when JavaScript is off.
- In the editor (`src/search/edit.js`, `editor.scss`) the input part is shown dimmed like a placeholder, the expanding style's field sits in the page flow under the icon, and the sidebar lists the site's viewable post types (from the REST API) as tick boxes.
- **Tests:** `tests/e2e/search.spec.js` builds each style in the editor (waiting for GenerateBlocks to set up each part) and checks the landmark, the named input and buttons, the theme's input styles being reset, searching everything / only pages (`tmb_types`) / only posts (`post_type`), a forged list only letting public types through, the expanding style's opening, focus, Escape and staying on screen, the no-JavaScript fallback, clicking outside, two expanding searches sharing a field ID, every starting style being valid in the editor, parts keeping their GB class and ID with a heading as the label, that only the expanding style loads a script, and axe. `editor.spec.js` checks the block saves valid.

### How entrance animations work

`includes/animations.php`, `src/animations/`. Built to cost nothing on pages that don't use it and very little on pages that do.

- **Saved in GB's own attributes.** The editor panel (`src/animations/editor.js`) is another `editor.BlockEdit` filter. It only appears on blocks named `generateblocks/…` or `generateblocks-pro/…` that have GB 2's `htmlAttributes` attribute, which is what rules out the legacy v1 blocks. Nothing is added to the block's markup except the `data-tmb-*` attributes.
- **Loaded only when used.** A `render_block` filter looks for `data-tmb-animate` in each rendered block and, when it finds one, enqueues the script (deferred, in the footer). The few lines of CSS and the one-line inline script that hide animated blocks go in `<head>` when the plugin already knows the page has an animated block there: the post being viewed contains one, or a block theme rendered one (block themes render the whole template before `<head>`). Anywhere else – an animated block in a GeneratePress Element, a widget, an archive – they're printed just before the first animated block. No animated block, nothing printed. It skips the admin, REST requests, feeds, and content rendered while `<head>` is being printed (an SEO plugin building a description, say).
- **No flash, and nothing lost.** The CSS hides animated blocks (or, for "one by one", their children) with `opacity: 0` until they get `.tmb-in`. That rule only applies when the inline script has added `tmb-animate-js` to `<html>` (so visitors without JavaScript see everything) and inside `@media screen and (prefers-reduced-motion: no-preference)` (so reduced-motion visitors are never hidden, and printing shows everything). If the main script never arrives – blocked, broken, or held back by a "delay JavaScript" optimisation – a CSS fail-safe fades everything in after 4 seconds. When the script loads it adds `tmb-animate-ready` to `<html>`, which switches the fail-safe off.
- **The animation.** The front-end script (`src/animations/view.js`) watches the blocks with an `IntersectionObserver` and reveals each once, as it comes into view (a little above the bottom of the screen). Blocks already scrolled past – say the visitor arrived via an `#anchor` lower down – are shown without animating. It uses the **Web Animations API** with a single keyframe at offset 0 – the start state – so the browser animates from there to the block's **own** styles. The presets (`src/animations/presets.js`, shared with the editor's Preview) use only `opacity` and the individual `translate` and `scale` properties, not `transform`, so a GB transform or hover transition on the same block is left alone. `fill: backwards` keeps a block hidden during its delay. Without `IntersectionObserver`, or with reduced motion, blocks are simply shown. Each batch of blocks is measured first and changed afterwards, so revealing several at once doesn't force repeated layouts. If a block receives keyboard focus before it has animated in (or during its delay), it's shown at once.
- **The Marquee** (`src/marquee/view.js`, `makeInert`) adds `.tmb-in` to animated blocks inside its copies, so they never sit hidden waiting for an animation.
- **Build.** These scripts aren't blocks, so there's no `block.json` for `wp-scripts` to find. `webpack.config.js` extends the default config with two extra entries, `animations/editor` and `animations/view`.

### How image masks work

`includes/mask.php`, `src/mask/`. Editor-only: there's no front-end script or CSS at all.

- **The panel** (`src/mask/editor.js`) is another `editor.BlockEdit` filter, shown only on `generateblocks/media`. `includes/mask.php` just enqueues it and its CSS in the block editor.
- **Saved as GB styles** (`src/mask/styles.js`). GenerateBlocks keeps a block's styles as an object of CSS properties, with nested objects for its breakpoints, and compiles them to CSS itself whenever they change. The panel writes `maskImage`, `maskSize`, `maskPosition` and `maskRepeat` into that object at the level the editor is previewing (`@media (max-width:1024px)` for Tablet, `@media (max-width:767px)` for Mobile), leaving every other style alone. Desktop always writes every value, so browser defaults (like repeating) never leak in; Once a larger size has a mask, Tablet and Mobile write only what differs from what they inherit, so the CSS cascade does the inheriting, exactly as with the rest of GB.
- **The shape** (`src/mask/svg.js`) is parsed with `DOMParser` and rebuilt from an allowlist of SVG shape elements and attributes; references may only point inside the same SVG (`#id`), and anything mentioning `javascript:`, `data:`, `http(s):` or an external `url()` is dropped. The `width`/`height` are removed (the mask's size comes from the CSS) and a `viewBox` is required. It's then percent-encoded – quotes and brackets too, so it can't end the `url()` or the CSS rule early – into a `data:image/svg+xml` URL. A browser never runs scripts in an SVG used as a CSS image anyway; the cleaning is belt and braces, and keeps the CSS small.
- **Flipping** wraps the shape in a group with a known ID (`tmb-flip-x`, `-y` or `-xy`) and a mirror transform, so the panel can read the flip back from the stored CSS.
- **Library shapes** come from the shape list GenerateBlocks gives the editor (`window.generateBlocksInfo.svgShapes`, which GB builds with its `generateblocks_svg_shapes` filter), and go through the same cleaning.
- **Why not the Media Library?** WordPress refuses SVG uploads by default, because an SVG opened directly can run scripts. Storing the cleaned shape in the block's CSS avoids needing an SVG-upload plugin, and means a mask never depends on a file that could be deleted.

### How video backgrounds work

`includes/class-thingamablocks-video-background.php` (`Thingamablocks_Video_Background`), `src/video/`. The server builds everything you see first; the script only adds the video.

- **The panel** (`src/video/editor.js`) is another `editor.BlockEdit` filter, shown on `generateblocks/element`. It stores the settings as JSON in one HTML attribute, `data-tmb-video`, keeping only values that differ from the defaults. The same filter adds a small **Video background** panel with the **Video pause/play button** switch to a GB Text block inside such a container, which stores `data-video-part="button"`. An `editor.BlockListBlock` filter shows the poster and overlay as the container's background in the canvas; the video never plays in the editor.
- **Recognising an address** (`classify()`, in PHP and in `src/video/source.js`, which mirror each other): `https` only, no user name or port; `vimeo.com/<id>[/<hash>]` and `player.vimeo.com/video/<id>` are Vimeo videos; `player.vimeo.com/progressive_redirect/…`, `player.vimeo.com/external/…` and `*.vimeocdn.com` are Vimeo files; Bunny is `*.b-cdn.net` or a listed hostname, with a path ending in `.mp4`, `.webm`, `.m4v` or `.mov`. Bunny's player hosts, `.m3u8`, YouTube and anything else get a named error, which the editor turns into the help messages. The JavaScript copy only explains; the PHP one decides.
- **Rendering.** A `render_block_generateblocks/element` filter (priority 20) runs on containers with `data-tmb-video`. `settings()` decodes the JSON and checks every value (`classify()` for the sources, `color()` for the overlay, a pattern for the focal point, lists for speed, position and shape, a clamp for opacity, `absint()` for the poster). With no usable source, the attribute is removed and nothing else is added. Otherwise the tag processor replaces `data-tmb-video` with JSON rebuilt from the clean values (`script_config()`: sources, loop, end, speed, phones) and adds `.tmb-has-video`, and the background is added at the end of the container, just before its closing tag, so its first child is still its first content and `:first-child` and spacing rules are unchanged: the layer (`aria-hidden` and `inert`, with the poster from `wp_get_attachment_image()` and the overlay `<div>`), then the `hidden` pause/play `<button>` with both labels in `data-label-pause` / `data-label-play`. The layer and poster carry their few essential styles inline, and the first layer on a page holds a one-line `<style>` (`:where(.tmb-has-video){position:relative;isolation:isolate}`), so nothing shifts before the stylesheet loads; on a single post or page whose content has a video background the stylesheet is also enqueued for `<head>`. Settings are stored with `&`, `<` and `>` escaped as `\u0026` etc., so WordPress's content filter (for Authors and Contributors) can't turn `&` in a URL into `&amp;`; content saved before that is repaired on render. If the container holds its own `[data-video-part="button"]` (found with `Thingamablocks_Html::next_own_tag()`, which skips nested containers with their own video), that gets `type="button"` (or `role="button"` and `tabindex="0"`), the labels and an inline `display:none` instead, and no default button is added. The script and CSS are enqueued there.
- **The front-end script** (`src/video/view.js`) reads the config, cleans the source again, and decides per container: phone (`max-width: 767px`) and Poster only → nothing; reduced motion, Data Saver / 2G, or `tmb-video-paused` → paused, button showing Play. It waits for `window` `load`, then an `IntersectionObserver` (200 px margin) and `visibilitychange` decide when to play or pause. The first time it should play it creates the player: for a file, a muted, `playsinline`, `disablePictureInPicture`, `disableRemotePlayback`, `tabindex="-1"` `<video>` placed after the poster; for Vimeo, an iframe of `player.vimeo.com/video/<id>?background=1&autoplay=1&muted=1&dnt=1…` sized by a `ResizeObserver` to cover the layer at the chosen shape, controlled with Vimeo's `postMessage` API (no Vimeo script on the page), only trusting messages from that iframe at `https://player.vimeo.com`. `.is-playing` on the layer fades the video in. A rejected `play()` (autoplay blocked) switches the button to Play; a `<video>` error removes it and the button.
- **The button** toggles the container's video, writes or clears `tmb-video-paused`, and fires an internal `tmb-video:paused` event so every other video background on the page follows. After Play once has ended, it restarts the video.
- **The CSS** (`src/video/view.scss`): the layer is `position: absolute; inset: 0; z-index: -1` inside the container (which gets `position: relative; isolation: isolate` through `:where()`, so GB's own position wins), poster and video `object-fit: cover` at `--tmb-video-focus`, the button's corners, colours, focus ring and `forced-colors` border.
- **Entrance animations** (`src/animations/view.js`) skip `[data-tmb-video-layer]` and `.tmb-video-bg__button` when animating a container's children one by one.
- **Build.** `webpack.config.js` adds the `video/editor` and `video/view` entries (`src/video/` → `build/video/`). The editor script is enqueued in the block editor (with the allowed hostnames as `window.tmbVideoHosts`) unless Video backgrounds is switched off; the front end doesn't depend on the switch.
- **Tests:** `tests/e2e/video.spec.js` (16 tests). Bunny and Vimeo are faked in the browser: requests to a test Bunny host get a tiny recorded video (`tests/e2e/fixtures/background.webm`), and Vimeo's player address gets a stand-in page that answers Vimeo's `postMessage` API. They check the server markup (poster, overlay, hidden button, no `<video>` yet), playing muted, inline and at speed after load with a pause button, pausing remembered across pages, your own GB button replacing the default one, loading only on screen and pausing off screen, Play once ending on the poster and restarting, the phone video and Poster only on phones, reduced motion and Data Saver getting the poster and a Play button, Vimeo's background player with `dnt=1` controlled by the button, only Bunny and Vimeo allowed with forged settings cleaned, a Bunny hostname added in Settings, assets loading only on pages with a video background, axe, and the editor panel writing the settings and previewing the poster.

### How FAQ schema works

`includes/class-thingamablocks-faq-schema.php` (`Thingamablocks_Faq_Schema`), `src/faq/editor.js`. Nothing on the front end but the JSON-LD.

- **The panel** (`src/faq/editor.js`) is another `editor.BlockEdit` filter, shown only on `generateblocks-pro/accordion`. It stores `data-tmb-faq="true"` in the accordion's `htmlAttributes` and previews the questions by walking the accordion's inner blocks (item → toggle text, minus the `accordion-toggle-icon`; item → content). The preview is only a guide: the schema itself is built on the server.
- **Read while the page renders.** WordPress renders blocks inside out: an item's toggle and content before the item, the items before the accordion. A `pre_render_block` filter starts a frame on a stack when an accordion begins; `render_block_{block name}` filters for the four Accordion blocks record each toggle's text and content's HTML into the current frame, adds the pair when its item finishes, and hands the items over when the accordion finishes, if it has `data-tmb-faq="true"`. The stack keeps nested accordions apart. They run last (priority `PHP_INT_MAX`; the block-specific filters also run after the general `render_block` one), after block conditions have emptied any hidden block, so an item that renders as nothing is skipped.
- **Cleaning.** The question is plain text (tags stripped, entities decoded, spaces collapsed; `<svg>`, `<script>`, `<style>`, `<template>` and `<noscript>` removed with their contents first). The answer goes through `wp_kses` with an allowlist of the tags Google reads in FAQ answers, links keep only `href`, and empty wrappers left behind are dropped.
- **Printed once.** Questions are collected per page, keyed by question (so a repeat is listed once), and printed in `wp_footer` (priority 100, after footer Elements and overlays have rendered) as one `FAQPage`, through the `thingamablocks_faq_schema` filter. It's only collected on single posts and pages (`is_singular()`), and the data is `null` when the page has a Yoast SEO or Rank Math FAQ block. The JSON is encoded with `JSON_HEX_TAG` and `JSON_HEX_AMP`, so a question containing `</script>` can't break out of the script element. Nothing is collected in the editor, REST responses or feeds.
- **Build.** `webpack.config.js` adds the `faq/editor` entry (`src/faq/` → `build/faq/`); the class enqueues it in the block editor unless FAQ schema is switched off.
- **Tests:** `tests/e2e/faq.spec.js`. GenerateBlocks Pro can't be installed on the local test site, but WordPress runs render filters on blocks it doesn't know, so the front-end test saves the markup GB Pro 2.x saves and checks the result: one `FAQPage` from two FAQ accordions, empty items, a nested accordion and a non-FAQ accordion left out, a repeated question listed once, the answer cleaned to allowed tags, and a question containing `</script>` printed safely, a picture-only answer left out, and nothing printed alongside a Yoast SEO FAQ block. The editor test registers stand-ins for the Accordion blocks and checks the panel's switch, question preview and "left out" warning.

### How switching things off works

`includes/settings.php`. The page uses the WordPress Settings API (`register_setting`, `options.php`), under **Settings** with `manage_options`. The rule is "hide, never break": nothing is unregistered.

- **Blocks.** Every block stays registered in PHP, so its render callback still runs and existing content renders exactly as before. In the editor, a tiny inline script (registered before the blocks, in `enqueue_block_editor_assets`) adds a `blocks.registerBlockType` filter that sets `supports.inserter` to `false` for the switched-off blocks. That's WordPress's own way to hide a block from the inserter while existing copies still load and edit normally.
- **Patterns.** `includes/patterns.php` tags each pattern with its block and skips registering the ones whose block is switched off.
- **Features.** The editor scripts for the Entrance animation, Mask, Video background and FAQ schema panels simply aren't enqueued. The front end doesn't depend on them: animations run from the `data-tmb-*` attributes already saved in the content, masks are plain GenerateBlocks CSS, video backgrounds are rendered from `data-tmb-video`, and FAQ schema is built on the server from `data-tmb-faq`.
- **Usage counts** are one `LIKE` query per switch on `wp_posts` (any post type, skipping trash, auto-drafts and revisions), run only when the settings page is opened. Blocks are found by their block comment (`<!-- wp:thingamablocks/marquee`), animations by `data-tmb-animate`, masks by `"maskImage":"url(` in a block's saved GB styles, video backgrounds by `"data-tmb-video":` in a container's saved attributes, FAQ schema by `"data-tmb-faq":"true"` in an accordion's saved attributes.
- **The page.** Each group (Blocks, Features) is a card, and each item a row with its name (a `<label>`), description and usage count (linked to the switch with `aria-describedby`) and the switch. A switch is a real checkbox with `role="switch"` and a `tmb-switch` class, styled as a sliding switch by a small inline stylesheet that's enqueued only on this page (`admin_enqueue_scripts`, checking the page's hook). The "on" colour and focus ring use `--wp-admin-theme-color`, so they follow the user's admin colour scheme; the "off" track is dark enough to see against white (3:1), and the slide is switched off for reduced motion.
- **Saving.** Each switch has a hidden `0` field before its checkbox, so unticked boxes are saved as `false`; the sanitize callback keeps only known keys, as true/false.
- **Your own Bunny hostnames** (the Video backgrounds card) is a textarea saved to its own option, `thingamablocks_video_hosts`, registered in the same settings group. Its sanitize callback splits on new lines, spaces or commas, keeps the hostname of a pasted URL, lower-cases, drops anything that isn't a valid hostname and keeps at most 20.

### The dark mode head output

Dark mode needs to be applied before the page paints, or visitors who chose dark see a white flash on every page load. `includes/color-scheme.php` handles this:

- When a post (including GeneratePress Elements and template parts) is saved, the plugin records whether it's **published** and contains a dark mode toggle, and if so that toggle's settings. Each post is tracked separately.
- While at least one such post exists, every front-end page gets, at the top of `<head>` (this is the one thing the plugin prints on pages without its blocks, because the visitor's choice has to apply on every page, not just the one with the switch):
  a small inline script that reads the saved choice (or the system setting) and sets `data-color-scheme` and `color-scheme` on `<html>` straight away.
- If several posts have a dark mode toggle, the most recently saved one's settings are used.
- Only users who can change the site's appearance (`edit_theme_options`, i.e. administrators) update these site-wide settings when they save. A dark mode toggle saved by an Editor or Author still works on its page, but doesn't change the site-wide head script.
- Only posts are scanned. A dark mode toggle placed in a **block widget**, or in a theme template part that has never been edited in the Site Editor, still switches `data-color-scheme`, but gets no no-flash script until a post containing a dark mode toggle is saved. The simplest setup: put the switch in a GeneratePress Element (a post type, so it's tracked).
- Removing the toggle from the post, unpublishing it, trashing or deleting it switches the head output off again (once no other post has one).

### Shared code

Things the blocks share live in one place, so a new block can reuse them:

- `includes/class-thingamablocks-sanitize.php` – `Thingamablocks_Sanitize`: cleans targets, class names and the no-flash `<style>`. A target selector is only kept if it uses plain selector characters with balanced brackets and quotes, and has no `<`, `\`, `{`, `}`, `;`, `@`, `/*` comment or `url(` anywhere – not even inside quotes, since a browser and the check could disagree about where a quoted string ends. So nothing typed into a target field can break out of the `<style>` or turn into an `@import`; the editor (`src/shared/targets-control.js`, which mirrors the check) warns about targets that will be ignored. Class names go through `sanitize_html_class`. (The Toggle's older `Thingamablocks_Toggle_Render::clean_selectors()` etc. still work and call through to it.)
- `includes/class-thingamablocks-html.php` – `Thingamablocks_Html`: a `WP_HTML_Tag_Processor` subclass that finds a whole element (nested tags of the same name included) by an attribute, or the end of an opening tag, using bookmarks. Used by the Search block (to swap in the input and turn a part into a `<label>`) and video backgrounds (to insert the background inside the container and find your own pause button).
- `src/shared/targets-control.js` – the ID/selector field with page-ID suggestions and "not found" warnings.
- `src/shared/variation-placeholder.js` – the "Choose a starting layout" picker (all six blocks).
- `src/shared/canvas-style.js` – puts editor-only preview CSS into the editor canvas iframe's `<head>`.
- `src/shared/gb.js` – helpers for fitting in with GenerateBlocks (its icon colour class, style shorthands for the layouts, inserter previews).

---

## Development

```bash
npm install          # once
npm start            # watch src/ and rebuild into build/ while you work
npm run build        # production build into build/
npm run zip          # build, then create dist/thingamablocks.zip
npm run playground   # local WordPress at http://127.0.0.1:9400
npm run playground:reset  # same, starting from a fresh site

npm run lint         # lint:js and lint:css together
npm run lint:js      # ESLint (WordPress rules) on src/, scripts/ and the config files
npm run lint:css     # Stylelint on src/**/*.scss
npm run format       # reformat the JavaScript with Prettier (WordPress style)
npm run test:e2e     # browser tests (Playwright) against the local Playground site

composer install         # once; needs PHP and Composer
composer run lint:php    # PHP_CodeSniffer (also: npm run lint:php)
```

- Node 20+ (the version in `.nvmrc` is what CI uses). `.editorconfig` sets tabs and line endings for editors that support it.
- PHP is checked against `phpcs.xml.dist`: the WordPress-Extra and WordPress-Docs coding standards, plus PHPCompatibilityWP for PHP 7.4 and up. `composer run fix:php` fixes what it can automatically.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs on every push to `main` and every pull request: JS/CSS lint, build and zip; a PHP syntax check on PHP 7.4 and 8.4; PHPCS; the official WordPress **Plugin Check** against the built zip; and the browser tests (`tests/e2e/`) against a fresh Playground site.

- Built with `@wordpress/scripts` (`wp-scripts`), the standard WordPress build tool. It finds each `block.json` under `src/` and compiles `src/toggle/`, `src/countdown/`, `src/marquee/`, `src/dropdown/`, `src/breadcrumbs/` and `src/search/` into `build/toggle/`, `build/countdown/`, `build/marquee/`, `build/dropdown/`, `build/breadcrumbs/` and `build/search/` (code in `src/shared/` is bundled into each). WordPress loads each block from its `build/<block>/block.json`, so **the plugin does nothing until you've built it** – `build/` is git-ignored. A block whose build folder is missing is simply skipped. `webpack.config.js` adds the entrance animation scripts (`src/animations/` → `build/animations/`), the image mask panel (`src/mask/editor.js` → `build/mask/`), the FAQ schema panel (`src/faq/editor.js` → `build/faq/`), the video background panel and front-end script (`src/video/` → `build/video/`) and the Search block's expanding-style script (`src/search/expand.js` → `build/search/expand.js`), which have no `block.json` of their own.
- `npm run playground` starts [WordPress Playground](https://wordpress.github.io/wordpress-playground/) locally with this folder mounted as the plugin. The blueprint (`playground/blueprint.json`) installs and activates GenerateBlocks (latest from wordpress.org) and GeneratePress, activates this plugin, turns on pretty permalinks, and creates a **Thingamablocks demo** page built from the patterns. Free GenerateBlocks has no Global Styles, so the blueprint also adds a must-use plugin defining `THINGAMABLOCKS_PRINT_DEFAULT_STYLES`: the plugin then prints the default layout classes itself (an inline style, handle `thingamablocks-default-styles`, on the front end and in the editor), so the layouts look and test as they would with GB Pro. Never used on a real site; the asset-loading tests ignore that style. You're logged in as admin. Run `npm start` in another terminal so edits rebuild; refresh the editor to pick them up.
- `npm run zip` produces `dist/thingamablocks.zip` with a single `thingamablocks/` folder containing only the runtime files: `thingamablocks.php`, `readme.txt`, `uninstall.php`, `includes/`, `patterns/`, `build/` and `LICENSE`. The human-readable source (`src/`, build config) lives in the GitHub repository ([Calvin-Susan/thingamablocks](https://github.com/Calvin-Susan/thingamablocks), private for now) rather than the zip.
- **Uninstall:** deleting the plugin (not just deactivating it) runs `uninstall.php`, which removes the plugin's options. Content made with the blocks stays in your posts as saved. It uses the system `zip` command and fails with a clear message if `build/` is missing.

---

## File map

```
thingamablocks.php   Plugin header, block registration, Breadcrumbs editor data (active SEO plugin), GB category fallback, "needs GB 2.0" notice
uninstall.php        Removes the plugin's options when it's deleted
LICENSE              GPL v2
includes/
  class-thingamablocks-sanitize.php            Thingamablocks_Sanitize: shared target/selector, class name and no-flash <style> cleaning
  kses.php                      Lets aria-checked / aria-pressed through WordPress's content filter for Authors and Contributors
  class-thingamablocks-toggle-render.php       Toggle render: wrapper, config, ARIA on parts, no-flash show/hide CSS, remembered-choice script
  class-thingamablocks-countdown-render.php    Countdown render: config, server-side numbers and ended state, no-flash CSS
  class-thingamablocks-marquee-render.php      Marquee render: config, inline clipping/fade/height, row sizing, pause button ARIA
  class-thingamablocks-dropdown-render.php     Dropdown render: config, closed drawer with an ID, button ARIA, no-JavaScript <noscript> style
  class-thingamablocks-breadcrumbs-trail.php   Breadcrumbs trail: SEO plugin detection, Yoast/Rank Math trails, the block's own trail for every kind of page
  class-thingamablocks-breadcrumbs-render.php  Breadcrumbs render: options, parts rendered once and repeated per step, <nav>/<ol>, BreadcrumbList structured data
  class-thingamablocks-search-render.php       Search render: <form role="search">, the real input, label/button names, content-type fields, tmb_types search limit, expanding-style ARIA and script
  class-thingamablocks-html.php                Finds a whole element (nested tags included) or an opening tag's end, with WP_HTML_Tag_Processor bookmarks (Search, video backgrounds)
  color-scheme.php              Dark mode: tracks settings per post, prints the no-flash <head> script
  patterns.php                  Registers the "Toggles", "Countdowns", "Marquees" and "Dropdowns" pattern categories and the patterns in patterns/ (skipping those of switched-off blocks)
  animations.php                Entrance animations: registers the scripts, loads them and the hide/fail-safe CSS on pages that use one
  mask.php                      Image masks: loads the Mask panel in the block editor (nothing on the front end)
  class-thingamablocks-faq-schema.php  FAQ schema: collects questions/answers from FAQ accordions as they render, prints one FAQPage in the footer, loads the panel
  class-thingamablocks-video-background.php  Video backgrounds: checks sources (Bunny/Vimeo) and settings, renders the poster, overlay and pause button, the Bunny hostnames option, loads the panel and front-end assets
  class-thingamablocks-global-styles.php  Creates the starting layouts' GB Pro Global Styles (tmb-*__*) once for admins, never overwritten; prints them itself on the test site
  global-styles/{block}.php     Each block's default classes (base before modifiers), loaded by Thingamablocks_Global_Styles::defaults()
  settings.php                  Settings → Thingamablocks: the switches (styled only on that page), usage counts, the Bunny hostnames field, thingamablocks_is_enabled(), hiding switched-off blocks from the inserter
patterns/
  pricing-toggle.php            "Pricing table with monthly/annual toggle" pattern (block markup exported from the editor, text translatable)
  sale-banner.php               "Sale banner with countdown" pattern
  launch-countdown.php          "Launch countdown" pattern
  logo-marquee.php              "Logo strip: Trusted by…" pattern
  downloads-dropdown.php        "Product resources with a Downloads dropdown" pattern
src/toggle/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations and inserter example
  edit.js                       Editor UI: layout picker, sidebar settings, toolbar On/Off, part state sync, previews
  parts.js                      "Toggle part" panel added to GB Element/Text/Shape/Media blocks
  templates.js                  The four starting layouts (block variations) built from GB blocks, using tmb-toggle__* Global Styles
  view.js                       Front-end behaviour, tmb-toggle:change event, window.tmbToggle
  icon.js                       Block icon
  style.scss                    Minimal front-end CSS (cursor, hidden class, reduced motion); a viewStyle, so only on pages with a Toggle
  editor.scss                   Sidebar helper styles
src/countdown/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations, List View label and inserter example
  edit.js                       Editor UI: layout picker, sidebar settings, Running/Ended preview, warnings
  parts.js                      "Countdown part" panel added to GB Element/Text/Shape blocks
  templates.js                  The three starting layouts (Boxes, Inline text, Large numbers), using tmb-countdown__* Global Styles
  time.js                       Time maths shared by editor and front end: time zones, recurring, splitting units
  view.js                       Front-end ticking, end actions, events, window.tmbCountdown
  icon.js                       Block and layout icons
  editor.scss                   Sidebar helper styles
src/marquee/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations, List View label and inserter example
  edit.js                       Editor UI: layout picker, sidebar settings, Preview button, warnings
  parts.js                      "Marquee part" panel added to GB Element/Text/Shape/Media blocks
  templates.js                  The four starting layouts (Logo strip, Message ticker, Big headline, Vertical quotes), using tmb-marquee__* Global Styles
  view.js                       Front-end copies, Web Animations loop, pausing, window.tmbMarquee
  icon.js                       Block and layout icons
  editor.scss                   Sidebar helper styles
src/dropdown/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations and inserter example
  edit.js                       Editor UI: layout picker, Drawer settings, Preview button, missing-part warning, drawer shown while selected
  parts.js                      "Dropdown part" panel added to GB Element/Text/Shape/Media blocks
  templates.js                  The three starting layouts (Downloads, Simple links, Panel), using tmb-dropdown__* Global Styles
  reveal.js                     Reveal animations and speeds, shared by editor and front end
  view.js                       Front-end open/close, placement, keyboard, events, window.tmbDropdown
  icon.js                       Block and layout icons
  style.scss                    Positioning (zero-specificity :where() rules); a viewStyle, so only on pages with a Dropdown
  editor.scss                   Drawer in the page flow while selected, sidebar helper styles
src/breadcrumbs/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations and inserter example
  edit.js                       Editor UI: style picker, Trail / Search engines / Accessibility settings, missing-link warning
  parts.js                      "Breadcrumb part" panel added to GB Element/Text/Shape/Media blocks
  templates.js                  The three starting styles (Chevrons, Slashes, Pills), using tmb-breadcrumbs__* Global Styles
  view.js                       Front-end collapsing of long trails, window.tmbBreadcrumbs
  icon.js                       Block and style icons
  style.scss                    The row of steps and the "…" button; a viewStyle, so only on pages with Breadcrumbs
  editor.scss                   Part templates side by side in the canvas, sidebar helper styles
src/search/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations and inserter example
  edit.js                       Editor UI: style picker, Search only / Label settings, missing-input warning
  parts.js                      "Search part" panel added to GB Element/Text/Shape/Media blocks
  templates.js                  The four starting styles (Bar with button, Pill, Underline, Icon that opens a search), using tmb-search__* Global Styles
  expand.js                     Front-end open/close for the expanding style (loaded only where it's used)
  icon.js                       Block and style icons
  style.scss                    Input reset and field focus outline; a viewStyle, so only on pages with a Search
  editor.scss                   Input shown as a placeholder, expanding field in the page flow, sidebar helper styles
src/animations/
  editor.js                     "Entrance animation" panel on GB 2 / GB Pro blocks, Preview button
  presets.js                    The animations (start states), speeds and easing, shared by editor and front end
  view.js                       Front-end reveal on scroll, one-by-one children, window.tmbAnimate
src/mask/
  editor.js                     "Mask" panel on the GB Image block, shape picker (library / upload or paste), error messages
  styles.js                     Reads and writes mask-* in the block's GB styles, per breakpoint (desktop / tablet / mobile)
  svg.js                        SVG cleaning, 100 KB limit, flipping, encoding as a data: URL
  editor.scss                   Panel and shape picker styles
src/faq/
  editor.js                     "FAQ schema" panel on the GB Pro Accordion block, question preview and "left out" warning
src/video/
  editor.js                     "Video background" panel on the GB Element block, address messages, poster preview in the canvas, "Video pause/play button" switch on GB Text blocks
  source.js                     Recognises Bunny/Vimeo addresses (mirrors the PHP check), shared by editor and front end
  view.js                       Front end: adds the video after load and on screen, pause/play, remembered pause, Vimeo postMessage, window.tmbVideo
  view.scss                     Background layer, cover/focal point, fade-in, pause button (custom properties, focus ring, high contrast)
  editor.scss                   Panel styles
src/shared/
  targets-control.js            ID/selector picker with page-ID suggestions and "not found" warnings
  variation-placeholder.js      "Choose a starting layout" placeholder
  canvas-style.js               Editor-only CSS portalled into the canvas iframe
  gb.js                         GenerateBlocks helpers (icon class, style shorthands, inserter previews)
build/                          Compiled output (git-ignored; created by npm run build)
playground/blueprint.json       WordPress Playground setup for npm run playground
scripts/zip.mjs                 Packages dist/thingamablocks.zip
webpack.config.js               Default wp-scripts build plus the src/animations/, src/mask/, src/faq/, src/video/ and src/search/expand.js entries
.eslintrc.js, .editorconfig, .nvmrc   JS lint rules, editor settings, Node version
phpcs.xml.dist, composer.json   PHP coding standards (PHPCS) and its Composer dev tools
.github/workflows/ci.yml        GitHub Actions: lint, build, zip, PHP checks, Plugin Check, browser tests
playwright.config.js            Browser test setup (starts Playground if needed)
tests/e2e/                      Browser tests: assets, front end, security, editor, accessibility, image masks (mask.spec.js), FAQ schema (faq.spec.js), dropdown (dropdown.spec.js), breadcrumbs (breadcrumbs.spec.js; seo-plugins.spec.js installs Yoast SEO and Rank Math from WordPress.org), search (search.spec.js), video backgrounds (video.spec.js), settings page (settings.spec.js)
tests/e2e/fixtures/             Test files: a sample SVG, a malicious SVG and a photo (mask tests), a tiny recorded video (background.webm, video background tests)
readme.txt                      wordpress.org plugin readme
CHANGELOG.md                    Release notes
```
