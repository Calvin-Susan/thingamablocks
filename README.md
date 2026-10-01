# Thingamablocks

A completely unnecessary ultimate add-ons power-pack for GenerateBlocks.

Blocks for [GenerateBlocks](https://wordpress.org/plugins/generateblocks/) 2.x, by [OGAL Web Design](https://ogalweb.com) (Kyle Van Deusen).

| Block | Name | What it does |
| --- | --- | --- |
| [**Toggle**](#toggle-block) | `thingamablocks/toggle` | A switch or pair of buttons that shows/hides elements, switches light/dark mode, or toggles classes. |
| [**Countdown**](#countdown-block) | `thingamablocks/countdown` | A countdown timer to a date, a per-visitor (evergreen) deadline, or a time that repeats. |
| [**Marquee**](#marquee-block) | `thingamablocks/marquee` | A smooth, endless scrolling strip of logos, messages, headlines or cards, left/right or up/down. |

Plus [**Entrance animations**](#entrance-animations) for every GenerateBlocks block: an "Entrance animation" panel that fades, slides or zooms a block in when it scrolls into view, or animates the blocks inside it one by one.

And [**Image masks**](#image-masks) for the GenerateBlocks Image block: a "Mask" panel that crops an image to a shape from the GenerateBlocks shape library, or to an SVG of your own.

All three blocks sit in the GenerateBlocks category of the inserter, and all work the same way as the Accordion and Tabs blocks in GenerateBlocks Pro: the block itself is a **settings-only wrapper**. Everything you see is a real GenerateBlocks Element, Text, Shape or Media block, styled in the GB Styles panel, with global styles, the same way as the rest of the page. The wrapper only holds behaviour.

**Requirements:** WordPress 6.6+ (tested up to 7.1), PHP 7.4+, GenerateBlocks 2.0+. Tested with GenerateBlocks 2.4.1 (free). Not yet tested with GenerateBlocks Pro.

**Light on pages that don't use it:** nothing from the plugin loads on a page without one of its blocks or an entrance animation. Image masks load nothing at all on the front end: the mask is part of the image's GenerateBlocks CSS. Each block's script (and the Toggle's few lines of CSS) loads only on pages with that block. The one exception is dark mode: once a site has a published dark mode toggle, every page gets a tiny `<head>` script so the visitor's choice applies everywhere (see [The dark mode head output](#the-dark-mode-head-output)).

---

## Contents

- [Install](#install)
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
- [Entrance animations](#entrance-animations)
  - [Entrance animation recipes](#entrance-animation-recipes)
  - [Entrance animation settings](#entrance-animation-settings)
- [Image masks](#image-masks)
  - [Image mask recipes](#image-mask-recipes)
  - [Image mask settings](#image-mask-settings)
- [Developer API](#developer-api)
- [How it's built](#how-its-built)
- [Development](#development)
- [File map](#file-map)

---

## Install

1. Install and activate GenerateBlocks 2.0 or newer. (The plugin header declares `Requires Plugins: generateblocks`, so WordPress won't activate this plugin without it. If GB is later deactivated or is a 1.x version, an admin notice says so.)
2. Upload `thingamablocks.zip` under **Plugins → Add New → Upload Plugin** and activate it.
   To build the zip yourself, see [Development](#development).
3. In the block editor, open the inserter. **Toggle**, **Countdown** and **Marquee** are in the GenerateBlocks category; ready-made sections are under **Patterns → Toggles**, **Patterns → Countdowns** and **Patterns → Marquees**. Select any GenerateBlocks block to find the **Entrance animation** panel in its sidebar, and a GenerateBlocks Image block to find the **Mask** panel.

---

## Toggle block

A toggle can:

- **Show / hide elements** – e.g. monthly vs. annual pricing.
- **Switch light / dark mode** – with a dark version of each theme colour picked in the sidebar, remembered per visitor, no flash on load.
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

The layouts use the GeneratePress global colour variables (`--accent`, `--base`, `--base-2`, `--base-3`, `--contrast`, `--contrast-2`, `--contrast-3`) with fallback colours for other themes, so they pick up your GP colours straight away. The one fixed colour is the switch's "off" track, a mid grey (`#767680`) that has enough contrast against both light and dark backgrounds.

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
3. **Pick the dark colours.** Open the **Dark mode colours** panel. It lists your theme's colours (the GeneratePress global colours, or a block theme's palette), each with a "… in dark mode" colour picker.
   - Click **Suggest dark colours** to fill them all in: light backgrounds become dark, dark text becomes light (keeping the order of Base / Base 2 / Base 3 and so on), and brand colours keep their hue but get lighter so they stay readable.
   - Adjust any colour by hand. Leave one empty to keep it the same in dark mode. **Clear** empties them all.
   - To preview, set **State → Starts as** to *On* (or use the toolbar **On/Off** button): the editor then shows the page in its dark colours. Set it back to *Off* before publishing unless you want dark to be the default.
4. **Publish** the post, page or Element that contains the switch. From then on every page on the site gets the dark colours and the no-flash `<head>` script (see [The dark mode head output](#the-dark-mode-head-output)).

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

The starting layouts already use these – open the switch block's Styles to see a working example. The dark mode switch also swaps its sun/moon icons with `&[aria-checked="true"] .gb-shape:first-child` / `:last-child` on the switch.

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
| Dark mode colours | `darkPalette` | `{}` | Map of CSS variable → dark colour, e.g. `{ "--base-3": "#16161a" }`. Saved as hex. Only shown when the theme provides a colour palette. |

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

Like the Toggle layouts, they use the GeneratePress global colour variables with fallbacks.

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

Style the parts in the GB Styles panel like any other block. The layouts give numbers `font-variant-numeric: tabular-nums`, so they don't jiggle as digits change. For state-based styles use global CSS: the wrapper is `.tmb-countdown` with `.is-running` or `.is-ended`.

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

Every layout has a small round **pause button** in the corner. It shows a pause icon while moving and a play icon once paused. It comes first inside the Marquee (it's positioned in the corner, so this doesn't change the look), so keyboard users reach it before any links in the row; keep it first if you build your own. Like the other blocks' layouts, colours use the GeneratePress global colour variables with fallbacks.

#### Fastest: the logo strip pattern

The plugin registers **Logo strip: "Trusted by…"** in a **Marquees** pattern category (only while GenerateBlocks is active): a small centred "Trusted by teams at" heading above a Logo strip marquee with placeholder logos and a pause button. Insert it from **Patterns → Marquees**, then swap the placeholders for your logos as in the recipe below.

> **The marquee stands still in the editor.** That's on purpose, so you can click into it and edit the content. Use the **Preview** button in the block toolbar to see the speed and direction (press **Stop** to edit again). The preview just slides the row by its own length; the seamless copies are only added on the front end.

#### Recipe: Client logo strip with your own logos

1. **Insert a Marquee** and choose **Logo strip** (or insert the pattern above).
2. **Open List View** and expand the Marquee. Inside it there's an Element marked as the row that scrolls (its sidebar shows **Marquee part: The row that scrolls**) holding six Shape blocks – the placeholder logos.
3. **Replace the placeholders.** Delete the Shape blocks and add a GenerateBlocks **Media** (image) block inside the row for each logo. Give each one alt text with the company name.
4. **Keep logos the same height.** In each image's Styles set a height (e.g. `2rem` or `2.5rem`) and width `auto`, so wide and tall logos sit evenly. Using a global style for this saves repeating it.
5. **Set the spacing on the row**, not on the logos: select the row and change its **gap** (the layout uses `4rem`). The marquee uses the same gap where the row repeats, so the spacing stays even all the way round.
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

## Entrance animations

Not a block: an **Entrance animation** panel added to the sidebar of every GenerateBlocks block. Pick an animation and the block fades, slides or zooms in the first time it scrolls into view. On a block that holds other blocks, you can instead have the blocks inside it animate in one after another.

- Works on GenerateBlocks 2 blocks (Element, Text, Media, Shape, Query, Looper, Loop Item…) and, by the same rule, GenerateBlocks Pro's. **Not** on the legacy GB 1.x blocks (Container, Grid, Headline, Button), which have no HTML attributes to store it in.
- Plays **once** per page view. It doesn't replay when you scroll back up.
- **Nothing loads** on pages that don't use an animation. Pages that do get a ~1.8 KB script and ~600 bytes of CSS.
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

The settings are saved in the block's own GenerateBlocks **HTML Attributes** (you'll see them in that panel), so GenerateBlocks saves and renders them like any other attribute. Only values that differ from the defaults are stored: a block set to Fade up at Normal speed with no delay just gets `data-tmb-animate="fade-up"`. Setting Animation back to None removes them all.

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

### Entrance animations: `window.tmbAnimate`

```js
window.tmbAnimate.init( container ); // set up animated blocks added later, e.g. by AJAX
```

- `init( root )` sets up every `[data-tmb-animate]` block inside `root` (default `document`) that isn't set up yet; calling it more than once is safe. Content added after the page has loaded (filters, infinite scroll, modals) is picked up automatically by a MutationObserver, so you rarely need this. Before the script arrives every animated block is hidden (with a 4-second fail-safe); after it arrives only blocks it is watching (`.tmb-wait`) are hidden, so nothing can get stuck invisible.
- To animate your own markup, add the attributes yourself: `<div data-tmb-animate="fade-up" data-tmb-delay="200">`. The script and CSS load only when a block rendered through WordPress contains `data-tmb-animate`, so on a page without one, enqueue `thingamablocks-animations` and print the CSS (see the filter below).

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
- `[data-tmb-animate]` (with `data-tmb-speed`, `data-tmb-delay`, `data-tmb-animate-children`) – a block with an entrance animation. It gets `.tmb-in` when it starts animating (straight away for reduced motion), and keeps it.
- `html.tmb-animate-js` – JavaScript is running; only then are animated blocks hidden. `html.tmb-animate-ready` – the animation script has loaded (switches off the fail-safe).

### PHP

- Filter `thingamablocks_print_color_scheme_script` – return `false` to stop printing the dark mode `<head>` output (both the script and the dark colours).
- Option `thingamablocks_color_scheme` – the dark mode settings per post ID (`followSystem`, `htmlClass`, `palette`, `modified`).
- Filter `thingamablocks_animation_head_markup` – the `<style id="tmb-animate-css">` and inline `<script id="tmb-animate-js">` that hide animated blocks until they animate in. Printed only on pages with an animated block: in `<head>` when the post being viewed uses an animation or a block theme has already rendered one, otherwise just before the first animated block. Return a changed string, or `''` to print your own CSS instead (without it nothing is hidden, so blocks show and then animate from their start state). Filter `thingamablocks_animations_print_css` – return `false` to skip printing it in `<head>` (it's then printed before the first animated block).
- Script handle `thingamablocks-animations` – the entrance animation script (`build/animations/view.js`), registered on every page, enqueued only where needed.

### Storage keys

All in `localStorage`:

- **Toggle:** `tmb-toggle:` then `group:<sync group>`, else `id:<HTML anchor>`, else `path:<page path>#<position>` (e.g. `tmb-toggle:path:/pricing/#0`). Dark mode always uses `tmb-toggle:color-scheme`, which the `<head>` script reads.
- **Countdown** (evergreen only): `tmb-countdown:id:<HTML anchor>`, else `tmb-countdown:path:<page path>#<position>`, where position counts the countdowns on the page from 0. The value is the visitor's end time in ms since the epoch.

---

## How it's built

For Kyle, and anyone new to block plugins.

### Why a wrapper around GenerateBlocks blocks

A block plugin could draw its own switch or timer and give you a set of colour and size controls. That would mean a second styling system next to GenerateBlocks, and it would never quite match. Instead every block follows the pattern GB Pro uses for Accordion and Tabs:

- The **block** (`thingamablocks/toggle`, `thingamablocks/countdown`, `thingamablocks/marquee`) has no visual settings. It holds behaviour: what happens when toggled or when time runs out, the starting state, the end date, the speed and direction, and so on.
- Its **inner blocks** are normal GenerateBlocks blocks. The starting layouts (`src/*/templates.js`) are just block templates with GB styles pre-filled. Once inserted, they're yours to edit like any other GB block.
- A block plays a role by being marked as a **part** (`data-toggle-part`, `data-countdown-part`, `data-countdown-unit`, `data-marquee-part`), stored in GB's own `htmlAttributes`. The plugin adds the "Toggle part" / "Countdown part" / "Marquee part" panels to GB blocks with a standard WordPress editor filter (`editor.BlockEdit`), so nothing about GB itself is modified.

GenerateBlocks exposes some editor globals (`window.gb.*`). This plugin doesn't use them; everything goes through standard WordPress block APIs and GB's saved block attributes, so it doesn't depend on GB internals that could change.

### What's saved vs. what's rendered

All three blocks save only their inner blocks (`save` returns `<InnerBlocks.Content />`) plus their settings as block attributes. The wrapper `<div>` is rendered in PHP, which means a settings change never causes a "This block contains unexpected content" error.

**Toggle**

- On the front end, PHP (`includes/class-thingamablocks-toggle-render.php`) renders the wrapper `<div class="tmb-toggle is-off" data-tmb-toggle="{…config…}">` (plus the anchor as `id`), and walks the inner HTML with WordPress's `WP_HTML_Tag_Processor` to add the roles and state attributes to the parts.
- For show/hide, PHP also prints a tiny `<style class="tmb-toggle-initial">` that hides whichever targets start hidden, so there's no flash of both. The front-end script removes it once it's taken over.
- For a toggle that remembers the visitor's choice and has a storage key the server can work out (a sync group or HTML anchor, or any dark mode toggle), PHP prints a tiny inline script right after the wrapper. It runs as the page is parsed, reads the saved choice, and flips the wrapper's classes, the parts' ARIA state and the no-flash `<style>` before the first paint. The main script then takes over as usual.
- The front-end script (`src/toggle/view.js`, loaded only on pages with a Toggle) reads the config, restores any saved choice, and handles clicks, keys, sync groups, the event and `window.tmbToggle`. Hiding sets an inline `display: none !important` as well as the class, and reveal animations use the Web Animations API rather than CSS keyframes, so "remove unused CSS" optimisations can't break them.
- In the editor (`src/toggle/edit.js`), the Toggle keeps its parts' `aria-checked` / `data-active` in step with **Starts as**, so the canvas shows the state you're styling; previews the dark colours when a dark mode toggle is set to *On*; and dims show/hide targets that are hidden in the current state.

**Countdown**

- PHP (`includes/class-thingamablocks-countdown-render.php`) works out the time left when the page is rendered, writes the real numbers into the number parts, and hides the timer or the ended message as appropriate (inline `display:none!important`). So a visitor sees correct numbers – or the ended state – before any JavaScript runs. An evergreen countdown is rendered at its full duration, since the server can't know each visitor's deadline.
- The end date is stored as site-local time and converted with `wp_timezone()`. Recurring countdowns get the site's time zone (`wp_timezone_string()`) in their config, and `src/countdown/time.js` does the maths in the browser, including daylight-saving changes and fixed offsets like `UTC+2`. The editor uses the same file, so the sidebar's "Ends in …" and "Next: …" match the front end.
- **Also hide / Also show** targets that should start hidden get a `<style class="tmb-countdown-initial">`, as with the Toggle.
- The front-end script (`src/countdown/view.js`, loaded only on pages with a Countdown) ticks once a second for all countdowns together, catches up straight away when a background tab becomes visible, stores evergreen deadlines, rolls recurring and restarting runs over, and runs the end actions. Because it recalculates from the clock on load, a cached page with stale numbers corrects itself immediately.

**Marquee**

- PHP (`includes/class-thingamablocks-marquee-render.php`) renders the wrapper `<div class="tmb-marquee" data-tmb-marquee="{…config…}">` with its clipping, edge fade (a CSS mask) and, for up/down, height as inline styles. WordPress's style filter in `get_block_wrapper_attributes()` drops `mask-image`, so the fade is added to the rendered tag afterwards (built only from a validated length). It keeps the row on one line at its natural length (`width: max-content`, no wrapping), and gives the pause button its role, `aria-pressed` and label. So the strip looks right before the script runs, and stays a plain row without JavaScript.
- The front-end script (`src/marquee/view.js`, loaded only on pages with a Marquee) moves the row into a track (`.tmb-marquee__track`) inside a clipping viewport (`.tmb-marquee__viewport`), and moves the edge fade from the wrapper onto the viewport so the pause button isn't faded. It clones the row enough times to fill the space, and animates the track with the Web Animations API by one row's length plus the gap. Duration is distance ÷ speed, so speed is in px/s. A `ResizeObserver` re-measures (adding or removing copies) and keeps the current position; an `IntersectionObserver` pauses it off screen.
- In the editor (`src/marquee/edit.js`) the wrapper gets the same clipping and fade so you see the real edges, but nothing moves unless you press **Preview**.

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

### The dark mode head output

Dark mode needs to be applied before the page paints, or visitors who chose dark see a white flash on every page load. `includes/color-scheme.php` handles this:

- When a post (including GeneratePress Elements and template parts) is saved, the plugin records whether it's **published** and contains a dark mode toggle, and if so that toggle's settings and dark colours. Each post is tracked separately.
- While at least one such post exists, every front-end page gets, at the top of `<head>` (this is the one thing the plugin prints on pages without its blocks, because the visitor's choice has to apply on every page, not just the one with the switch):
  - `<style id="tmb-toggle-dark-palette">:root[data-color-scheme="dark"]{--base-3:…}</style>` with the dark colours, and
  - a small inline script that reads the saved choice (or the system setting) and sets `data-color-scheme` on `<html>` straight away.
- If several posts have a dark mode toggle, the most recently saved one's settings are used.
- Only users who can change the site's appearance (`edit_theme_options`, i.e. administrators) update these site-wide settings when they save. A dark mode toggle saved by an Editor or Author still works on its page, but doesn't change the site's dark colours.
- Only posts are scanned. A dark mode toggle placed in a **block widget**, or in a theme template part that has never been edited in the Site Editor, still switches `data-color-scheme`, but gets no dark colours or no-flash script until a post containing a dark mode toggle is saved. The simplest setup: put the switch in a GeneratePress Element (a post type, so it's tracked).
- Removing the toggle from the post, unpublishing it, trashing or deleting it switches the head output off again (once no other post has one).

### Shared code

Things the blocks share live in one place, so a new block can reuse them:

- `includes/class-thingamablocks-sanitize.php` – `Thingamablocks_Sanitize`: cleans targets, class names and the no-flash `<style>`. A target selector is only kept if it uses plain selector characters with balanced brackets and quotes, and has no `<`, `\`, `{`, `}`, `;`, `@`, `/*` comment or `url(` anywhere – not even inside quotes, since a browser and the check could disagree about where a quoted string ends. So nothing typed into a target field can break out of the `<style>` or turn into an `@import`; the editor (`src/shared/targets-control.js`, which mirrors the check) warns about targets that will be ignored. Class names go through `sanitize_html_class`. (The Toggle's older `Thingamablocks_Toggle_Render::clean_selectors()` etc. still work and call through to it.)
- `src/shared/targets-control.js` – the ID/selector field with page-ID suggestions and "not found" warnings.
- `src/shared/variation-placeholder.js` – the "Choose a starting layout" picker (all three blocks).
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

- Built with `@wordpress/scripts` (`wp-scripts`), the standard WordPress build tool. It finds each `block.json` under `src/` and compiles `src/toggle/`, `src/countdown/` and `src/marquee/` into `build/toggle/`, `build/countdown/` and `build/marquee/` (code in `src/shared/` is bundled into each). WordPress loads each block from its `build/<block>/block.json`, so **the plugin does nothing until you've built it** – `build/` is git-ignored. A block whose build folder is missing is simply skipped. `webpack.config.js` adds the entrance animation scripts (`src/animations/` → `build/animations/`) and the image mask panel (`src/mask/editor.js` → `build/mask/`), which have no `block.json`.
- `npm run playground` starts [WordPress Playground](https://wordpress.github.io/wordpress-playground/) locally with this folder mounted as the plugin. The blueprint (`playground/blueprint.json`) installs and activates GenerateBlocks (latest from wordpress.org) and GeneratePress, activates this plugin, turns on pretty permalinks, and creates a **Thingamablocks demo** page built from the patterns. You're logged in as admin. Run `npm start` in another terminal so edits rebuild; refresh the editor to pick them up.
- `npm run zip` produces `dist/thingamablocks.zip` with a single `thingamablocks/` folder containing only the runtime files: `thingamablocks.php`, `readme.txt`, `uninstall.php`, `includes/`, `patterns/`, `build/` and `LICENSE`. The human-readable source (`src/`, build config) lives in the GitHub repository ([Calvin-Susan/thingamablocks](https://github.com/Calvin-Susan/thingamablocks), private for now) rather than the zip.
- **Uninstall:** deleting the plugin (not just deactivating it) runs `uninstall.php`, which removes the plugin's options. Content made with the blocks stays in your posts as saved. It uses the system `zip` command and fails with a clear message if `build/` is missing.

---

## File map

```
thingamablocks.php   Plugin header, block registration, GB category fallback, "needs GB 2.0" notice
uninstall.php        Removes the plugin's options when it's deleted
LICENSE              GPL v2
includes/
  class-thingamablocks-sanitize.php            Thingamablocks_Sanitize: shared target/selector, class name and no-flash <style> cleaning
  kses.php                      Lets aria-checked / aria-pressed through WordPress's content filter for Authors and Contributors
  class-thingamablocks-toggle-render.php       Toggle render: wrapper, config, ARIA on parts, no-flash show/hide CSS, remembered-choice script
  class-thingamablocks-countdown-render.php    Countdown render: config, server-side numbers and ended state, no-flash CSS
  class-thingamablocks-marquee-render.php      Marquee render: config, inline clipping/fade/height, row sizing, pause button ARIA
  color-scheme.php              Dark mode: tracks settings per post, prints the dark colours and no-flash <head> script
  patterns.php                  Registers the "Toggles", "Countdowns" and "Marquees" pattern categories and the patterns in patterns/
  animations.php                Entrance animations: registers the scripts, loads them and the hide/fail-safe CSS on pages that use one
  mask.php                      Image masks: loads the Mask panel in the block editor (nothing on the front end)
patterns/
  pricing-toggle.php            "Pricing table with monthly/annual toggle" pattern (block markup exported from the editor, text translatable)
  sale-banner.php               "Sale banner with countdown" pattern
  launch-countdown.php          "Launch countdown" pattern
  logo-marquee.php              "Logo strip: Trusted by…" pattern
src/toggle/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations and inserter example
  edit.js                       Editor UI: layout picker, sidebar settings, toolbar On/Off, part state sync, previews
  dark-palette.js               "Dark mode colours" panel and the colour suggestions
  parts.js                      "Toggle part" panel added to GB Element/Text/Shape/Media blocks
  templates.js                  The four starting layouts (block variations) built from GB blocks
  view.js                       Front-end behaviour, tmb-toggle:change event, window.tmbToggle
  icon.js                       Block icon
  style.scss                    Minimal front-end CSS (cursor, hidden class, reduced motion); a viewStyle, so only on pages with a Toggle
  editor.scss                   Sidebar helper styles
src/countdown/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations, List View label and inserter example
  edit.js                       Editor UI: layout picker, sidebar settings, Running/Ended preview, warnings
  parts.js                      "Countdown part" panel added to GB Element/Text/Shape blocks
  templates.js                  The three starting layouts (Boxes, Inline text, Large numbers)
  time.js                       Time maths shared by editor and front end: time zones, recurring, splitting units
  view.js                       Front-end ticking, end actions, events, window.tmbCountdown
  icon.js                       Block and layout icons
  editor.scss                   Sidebar helper styles
src/marquee/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations, List View label and inserter example
  edit.js                       Editor UI: layout picker, sidebar settings, Preview button, warnings
  parts.js                      "Marquee part" panel added to GB Element/Text/Shape/Media blocks
  templates.js                  The four starting layouts (Logo strip, Message ticker, Big headline, Vertical quotes)
  view.js                       Front-end copies, Web Animations loop, pausing, window.tmbMarquee
  icon.js                       Block and layout icons
  editor.scss                   Sidebar helper styles
src/animations/
  editor.js                     "Entrance animation" panel on GB 2 / GB Pro blocks, Preview button
  presets.js                    The animations (start states), speeds and easing, shared by editor and front end
  view.js                       Front-end reveal on scroll, one-by-one children, window.tmbAnimate
src/mask/
  editor.js                     "Mask" panel on the GB Image block, shape picker (library / upload or paste), error messages
  styles.js                     Reads and writes mask-* in the block's GB styles, per breakpoint (desktop / tablet / mobile)
  svg.js                        SVG cleaning, 100 KB limit, flipping, encoding as a data: URL
  editor.scss                   Panel and shape picker styles
src/shared/
  targets-control.js            ID/selector picker with page-ID suggestions and "not found" warnings
  variation-placeholder.js      "Choose a starting layout" placeholder
  canvas-style.js               Editor-only CSS portalled into the canvas iframe
  gb.js                         GenerateBlocks helpers (icon class, style shorthands, inserter previews)
build/                          Compiled output (git-ignored; created by npm run build)
playground/blueprint.json       WordPress Playground setup for npm run playground
scripts/zip.mjs                 Packages dist/thingamablocks.zip
webpack.config.js               Default wp-scripts build plus the src/animations/ and src/mask/ entries
.eslintrc.js, .editorconfig, .nvmrc   JS lint rules, editor settings, Node version
phpcs.xml.dist, composer.json   PHP coding standards (PHPCS) and its Composer dev tools
.github/workflows/ci.yml        GitHub Actions: lint, build, zip, PHP checks, Plugin Check, browser tests
playwright.config.js            Browser test setup (starts Playground if needed)
tests/e2e/                      Browser tests: assets, front end, security, editor, accessibility, image masks (mask.spec.js)
tests/e2e/fixtures/             Test files for the mask tests: a sample SVG, a malicious SVG, a photo
readme.txt                      wordpress.org plugin readme
CHANGELOG.md                    Release notes
```
