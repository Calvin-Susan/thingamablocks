# Thingamablocks

Add-on blocks for [GenerateBlocks](https://wordpress.org/plugins/generateblocks/) 2.x, by [OGAL Web Design](https://ogalweb.com) (Kyle Van Deusen).

| Block | Name | What it does |
| --- | --- | --- |
| [**Toggle**](#toggle-block) | `thingamablocks/toggle` | A switch or pair of buttons that shows/hides elements, switches light/dark mode, or toggles classes. |
| [**Countdown**](#countdown-block) | `thingamablocks/countdown` | A countdown timer to a date, a per-visitor (evergreen) deadline, or a time that repeats. |

Both blocks sit in the GenerateBlocks category of the inserter, and both work the same way as the Accordion and Tabs blocks in GenerateBlocks Pro: the block itself is a **settings-only wrapper**. Everything you see is a real GenerateBlocks Element, Text or Shape block, styled in the GB Styles panel, with global styles, the same way as the rest of the page. The wrapper only holds behaviour.

**Requirements:** WordPress 6.5+, PHP 7.4+, GenerateBlocks 2.0+. Tested with GenerateBlocks 2.4.1 (free). Not yet tested with GenerateBlocks Pro.

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
- [Developer API](#developer-api)
- [How it's built](#how-its-built)
- [Development](#development)
- [File map](#file-map)

---

## Install

1. Install and activate GenerateBlocks 2.0 or newer. (The plugin header declares `Requires Plugins: generateblocks`, so WordPress won't activate this plugin without it. If GB is later deactivated or is a 1.x version, an admin notice says so.)
2. Upload `thingamablocks.zip` under **Plugins → Add New → Upload Plugin** and activate it.
   To build the zip yourself, see [Development](#development).
3. In the block editor, open the inserter. **Toggle** and **Countdown** are in the GenerateBlocks category; ready-made sections are under **Patterns → Toggles** and **Patterns → Countdowns**.

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
| **Segmented buttons** | Two `<button>`s side by side, active one highlighted | Show / hide |
| **Switch** | Just the switch (give it a label under Accessibility) | Show / hide |
| **Dark mode switch** | Switch with a sun/moon icon in the knob, label "Dark mode" | Light / dark mode |

The layouts use the GeneratePress global colour variables (`--accent`, `--base`, `--base-2`, `--base-3`, `--contrast`, `--contrast-2`, `--contrast-3`) with fallback colours for other themes, so they pick up your GP colours straight away.

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

The Toggle's own CSS is deliberately tiny: a pointer cursor on parts (front end only, so parts stay editable in the editor), the hidden class, and a reduced-motion rule that switches off transitions and animations inside a toggle.

### Toggle settings

Select the Toggle block (the wrapper) to see these in the sidebar.

#### Toggle behaviour

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| When toggled | `action` | `showHide` | `showHide`, `colorScheme`, `toggleClass`, `none` |

**Targets** (Show when off / on, Elements – and the Countdown's Also hide / Also show): a bare word is an element ID (`monthly-prices`). The exceptions are `html`, `body`, `main`, `header`, `footer`, `nav`, `aside`, `article` and `section`: those mean the tag, unless the page has an element with that ID. Anything else (`.card`, `#site-header`, `[data-plan="annual"]`) is a CSS selector. If several elements share an ID (e.g. a pattern inserted twice), all of them are switched. A leading `#` on a plain ID is dropped when saved.

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

#### Accessibility

| Setting | Attribute | Default | Notes |
| --- | --- | --- | --- |
| Switch label | `ariaLabel` | `""` | Added as `aria-label` on each switch part, and on a segmented control's `role="group"` wrapper (unless they already have one). If empty and the switch has no text, the "on" label is used via `aria-labelledby`. The panel opens with a warning when a switch has neither. |

#### Also supported

- **Advanced → HTML anchor** – printed as the wrapper's `id`. Useful for `window.tmbToggle`, and it gives "Remember" a stable key.
- **Advanced → Additional CSS class(es)**.
- **Margin** (block spacing support).

#### Accessibility behaviour

- Roles and state attributes are added on the server when the page renders, so they're correct before any JavaScript runs and can't be removed by accident in the editor.
- `aria-controls` lists the targets given as plain IDs (tag names and other selectors can't be referenced that way).
- Parts with `tabindex="0"` respond to Space and Enter; native buttons handle keys themselves.
- Transitions and animations are switched off for visitors with `prefers-reduced-motion: reduce`.

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
| **Inline text** | "Ends in 2d 5h 12m 9s", for banners and buttons. Starts with two-digit numbers off and "Hide units that reach zero" on, so it reads like a sentence. | "This offer has ended." |
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
| Then go to (optional) | `redirectUrl` | `""` | Sends visitors to this URL when it ends – including visitors who arrive after it has ended. Never redirects to the page it's on. |

#### Also supported

- **Advanced → HTML anchor** – printed as the wrapper's `id`. Gives an evergreen countdown a stable storage key, and is what `window.tmbCountdown.reset()` takes.
- **Advanced → Additional CSS class(es)**.
- **Margin** (block spacing support).

#### Accessibility behaviour

- The wrapper has `role="timer"`, which screen readers don't announce every second.
- Separators get `aria-hidden="true"`.
- The numbers and the timer/ended state are rendered on the server, so the page makes sense before (and without) JavaScript.

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

### CSS hooks

- `.tmb-toggle` – the Toggle wrapper, with `.is-on` or `.is-off`.
- `[data-toggle-part="switch|on|off"]` – the parts, with `aria-checked` / `data-active` / `aria-pressed` as described above; `[data-toggle-owned]` once a toggle has claimed them.
- `html[data-color-scheme="dark|light"]` – set by dark mode toggles.
- `.tmb-toggle-hidden` – on elements hidden by a show/hide toggle (together with an inline `display: none !important`).
- `.tmb-toggle-enter-fade`, `.tmb-toggle-enter-slide` – on an element while its reveal animation runs.
- `.tmb-countdown` – the Countdown wrapper, with `.is-running` or `.is-ended`.
- `[data-countdown-part="days|hours|minutes|seconds|timer|ended|separator"]`, `[data-countdown-unit="days|hours|minutes|seconds"]` – the countdown parts. Hidden parts and elements get an inline `display: none !important`.

### PHP

- Filter `thingamablocks_print_color_scheme_script` – return `false` to stop printing the dark mode `<head>` output (both the script and the dark colours).
- Option `thingamablocks_color_scheme` – the dark mode settings per post ID (`followSystem`, `htmlClass`, `palette`, `modified`).

### Storage keys

All in `localStorage`:

- **Toggle:** `tmb-toggle:` then `group:<sync group>`, else `id:<HTML anchor>`, else `path:<page path>#<position>` (e.g. `tmb-toggle:path:/pricing/#0`). Dark mode always uses `tmb-toggle:color-scheme`, which the `<head>` script reads.
- **Countdown** (evergreen only): `tmb-countdown:id:<HTML anchor>`, else `tmb-countdown:path:<page path>#<position>`, where position counts the countdowns on the page from 0. The value is the visitor's end time in ms since the epoch.

---

## How it's built

For Kyle, and anyone new to block plugins.

### Why a wrapper around GenerateBlocks blocks

A block plugin could draw its own switch or timer and give you a set of colour and size controls. That would mean a second styling system next to GenerateBlocks, and it would never quite match. Instead both blocks follow the pattern GB Pro uses for Accordion and Tabs:

- The **block** (`thingamablocks/toggle`, `thingamablocks/countdown`) has no visual settings. It holds behaviour: what happens when toggled or when time runs out, the starting state, the end date, and so on.
- Its **inner blocks** are normal GenerateBlocks blocks. The starting layouts (`src/*/templates.js`) are just block templates with GB styles pre-filled. Once inserted, they're yours to edit like any other GB block.
- A block plays a role by being marked as a **part** (`data-toggle-part`, `data-countdown-part`, `data-countdown-unit`), stored in GB's own `htmlAttributes`. The plugin adds the "Toggle part" / "Countdown part" panels to GB blocks with a standard WordPress editor filter (`editor.BlockEdit`), so nothing about GB itself is modified.

GenerateBlocks exposes some editor globals (`window.gb.*`). This plugin doesn't use them; everything goes through standard WordPress block APIs and GB's saved block attributes, so it doesn't depend on GB internals that could change.

### What's saved vs. what's rendered

Both blocks save only their inner blocks (`save` returns `<InnerBlocks.Content />`) plus their settings as block attributes. The wrapper `<div>` is rendered in PHP, which means a settings change never causes a "This block contains unexpected content" error.

**Toggle**

- On the front end, PHP (`includes/class-toggle-render.php`) renders the wrapper `<div class="tmb-toggle is-off" data-tmb-toggle="{…config…}">` (plus the anchor as `id`), and walks the inner HTML with WordPress's `WP_HTML_Tag_Processor` to add the roles and state attributes to the parts.
- For show/hide, PHP also prints a tiny `<style class="tmb-toggle-initial">` that hides whichever targets start hidden, so there's no flash of both. The front-end script removes it once it's taken over.
- The front-end script (`src/toggle/view.js`, loaded only on pages with a Toggle) reads the config, restores any saved choice, and handles clicks, keys, sync groups, the event and `window.tmbToggle`. Hiding sets an inline `display: none !important` as well as the class, and reveal animations use the Web Animations API rather than CSS keyframes, so "remove unused CSS" optimisations can't break them.
- In the editor (`src/toggle/edit.js`), the Toggle keeps its parts' `aria-checked` / `data-active` in step with **Starts as**, so the canvas shows the state you're styling; previews the dark colours when a dark mode toggle is set to *On*; and dims show/hide targets that are hidden in the current state.

**Countdown**

- PHP (`includes/class-countdown-render.php`) works out the time left when the page is rendered, writes the real numbers into the number parts, and hides the timer or the ended message as appropriate (inline `display:none!important`). So a visitor sees correct numbers – or the ended state – before any JavaScript runs. An evergreen countdown is rendered at its full duration, since the server can't know each visitor's deadline.
- The end date is stored as site-local time and converted with `wp_timezone()`. Recurring countdowns get the site's time zone (`wp_timezone_string()`) in their config, and `src/countdown/time.js` does the maths in the browser, including daylight-saving changes and fixed offsets like `UTC+2`. The editor uses the same file, so the sidebar's "Ends in …" and "Next: …" match the front end.
- **Also hide / Also show** targets that should start hidden get a `<style class="tmb-countdown-initial">`, as with the Toggle.
- The front-end script (`src/countdown/view.js`, loaded only on pages with a Countdown) ticks once a second for all countdowns together, catches up straight away when a background tab becomes visible, stores evergreen deadlines, rolls recurring and restarting runs over, and runs the end actions. Because it recalculates from the clock on load, a cached page with stale numbers corrects itself immediately.

### The dark mode head output

Dark mode needs to be applied before the page paints, or visitors who chose dark see a white flash on every page load. `includes/color-scheme.php` handles this:

- When a post (including GeneratePress Elements and template parts) is saved, the plugin records whether it's **published** and contains a dark mode toggle, and if so that toggle's settings and dark colours. Each post is tracked separately.
- While at least one such post exists, every front-end page gets, at the top of `<head>`:
  - `<style id="tmb-toggle-dark-palette">:root[data-color-scheme="dark"]{--base-3:…}</style>` with the dark colours, and
  - a small inline script that reads the saved choice (or the system setting) and sets `data-color-scheme` on `<html>` straight away.
- If several posts have a dark mode toggle, the most recently saved one's settings are used.
- Only users who can change the site's appearance (`edit_theme_options`, i.e. administrators) update these site-wide settings when they save. A dark mode toggle saved by an Editor or Author still works on its page, but doesn't change the site's dark colours.
- Only posts are scanned. A dark mode toggle placed in a **block widget**, or in a theme template part that has never been edited in the Site Editor, still switches `data-color-scheme`, but gets no dark colours or no-flash script until a post containing a dark mode toggle is saved. The simplest setup: put the switch in a GeneratePress Element (a post type, so it's tracked).
- Removing the toggle from the post, unpublishing it, trashing or deleting it switches the head output off again (once no other post has one).

### Shared code

Things both blocks use live in one place, so a new block can reuse them:

- `includes/class-sanitize.php` – `Thingamablocks_Sanitize`: cleans targets, class names and the no-flash `<style>`. A target selector is only kept if it uses plain selector characters (no `<`, `{`, `}`, `;`, `\` or `@`) with balanced brackets and quotes, so nothing typed into a target field can break out of the `<style>` or turn into an `@import`; the editor warns about targets that will be ignored. Class names go through `sanitize_html_class`. (The Toggle's older `Thingamablocks_Toggle_Render::clean_selectors()` etc. still work and call through to it.)
- `src/shared/targets-control.js` – the ID/selector field with page-ID suggestions and "not found" warnings.
- `src/shared/variation-placeholder.js` – the "Choose a starting layout" picker.
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
```

- Built with `@wordpress/scripts` (`wp-scripts`), the standard WordPress build tool. It finds each `block.json` under `src/` and compiles `src/toggle/` and `src/countdown/` into `build/toggle/` and `build/countdown/` (code in `src/shared/` is bundled into each). WordPress loads each block from its `build/<block>/block.json`, so **the plugin does nothing until you've built it** – `build/` is git-ignored. A block whose build folder is missing is simply skipped.
- `npm run playground` starts [WordPress Playground](https://wordpress.github.io/wordpress-playground/) locally with this folder mounted as the plugin. The blueprint (`playground/blueprint.json`) installs and activates GenerateBlocks (latest from wordpress.org) and GeneratePress, activates this plugin, turns on pretty permalinks, and creates a **Toggle Test** page. You're logged in as admin. Run `npm start` in another terminal so edits rebuild; refresh the editor to pick them up.
- `npm run zip` produces `dist/thingamablocks.zip` with a single `thingamablocks/` folder containing only the runtime files: `thingamablocks.php`, `readme.txt`, `includes/`, `patterns/`, `build/` (and `LICENSE` if present). It uses the system `zip` command and fails with a clear message if `build/` is missing.

---

## File map

```
thingamablocks.php   Plugin header, block registration, GB category fallback, "needs GB 2.0" notice
includes/
  class-sanitize.php            Thingamablocks_Sanitize: shared target/selector, class name and no-flash <style> cleaning
  class-toggle-render.php       Toggle render: wrapper, config, ARIA on parts, no-flash show/hide CSS
  class-countdown-render.php    Countdown render: config, server-side numbers and ended state, no-flash CSS
  color-scheme.php              Dark mode: tracks settings per post, prints the dark colours and no-flash <head> script
  patterns.php                  Registers the "Toggles" and "Countdowns" pattern categories and the patterns in patterns/
patterns/
  pricing-toggle.html           "Pricing table with monthly/annual toggle" pattern (plain block markup)
  sale-banner.html              "Sale banner with countdown" pattern
  launch-countdown.html         "Launch countdown" pattern
src/toggle/
  block.json                    Block name, attributes, supports, asset files
  index.js                      Registers the block, variations and inserter example
  edit.js                       Editor UI: layout picker, sidebar settings, toolbar On/Off, part state sync, previews
  dark-palette.js               "Dark mode colours" panel and the colour suggestions
  parts.js                      "Toggle part" panel added to GB Element/Text/Shape/Media blocks
  templates.js                  The four starting layouts (block variations) built from GB blocks
  view.js                       Front-end behaviour, tmb-toggle:change event, window.tmbToggle
  icon.js                       Block icon
  style.scss                    Minimal front-end + editor CSS (cursor, hidden class, reduced motion)
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
src/shared/
  targets-control.js            ID/selector picker with page-ID suggestions and "not found" warnings
  variation-placeholder.js      "Choose a starting layout" placeholder
  canvas-style.js               Editor-only CSS portalled into the canvas iframe
  gb.js                         GenerateBlocks helpers (icon class, style shorthands, inserter previews)
build/                          Compiled output (git-ignored; created by npm run build)
playground/blueprint.json       WordPress Playground setup for npm run playground
scripts/zip.mjs                 Packages dist/thingamablocks.zip
readme.txt                      wordpress.org plugin readme
CHANGELOG.md                    Release notes
```
