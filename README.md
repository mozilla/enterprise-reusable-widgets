# Enterprise reusable widgets

This repository is a **fork of Firefox's reusable widgets** — the `moz-*` Lit
components from [`toolkit/content/widgets`][upstream-widgets] — and of the
Firefox **design system** tokens from
[`toolkit/themes/shared/design-system`][upstream-design-system].

It contains the versions of these widgets used by the **Firefox Enterprise admin
console**, adapted to run on the regular web (outside of Firefox's privileged
`chrome://` context), converted to TypeScript, and extended with features the
console needed.

The code was extracted from the console's frontend, where its history lives.
It is not (yet) a standalone package: see [Using these widgets](#using-these-widgets).

All files are licensed under the [Mozilla Public License 2.0][mpl], like the
upstream code.

[upstream-widgets]: https://searchfox.org/mozilla-central/source/toolkit/content/widgets
[upstream-design-system]: https://searchfox.org/mozilla-central/source/toolkit/themes/shared/design-system
[mpl]: https://mozilla.org/MPL/2.0/

## Upstream baseline

There is no single upstream revision this fork corresponds to. Widgets were
imported one by one over time and some were later refreshed with upstream
changes:

- The design system matches **Firefox 143** (resynced in August 2025), with
  the local changes listed [below](#design-system).
- Widgets were imported between roughly Firefox 140 and early 2026. Some were
  refreshed later, and some Firefox patches were backported before they landed
  upstream (they are listed per widget below).

Upstream has kept evolving since then, so when porting a change from
mozilla-central, expect to adapt it rather than apply it directly.

## Repository layout

| This repository                              | Upstream (mozilla-central)                                          |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `widgets/<name>/<name>.ts`                   | `toolkit/content/widgets/<name>/<name>.mjs`                         |
| `widgets/lit-utils.ts`                       | `toolkit/content/widgets/lit-utils.mjs`                             |
| `widgets/lit-select-control.ts`              | `toolkit/content/widgets/lit-select-control.mjs`                    |
| `widgets/named-deck/named-deck.ts`           | `toolkit/content/widgets/named-deck.js`                             |
| `widgets/panel-list/panel-list.js`           | `toolkit/content/widgets/panel-list/panel-list.mjs`                 |
| `widgets/moz-box-common/moz-box-common.css`  | `toolkit/content/widgets/moz-box-common.css`                        |
| `widgets/moz-input-common/moz-input-common.css` | `toolkit/content/widgets/moz-input-common.css`                   |
| `style/design-system/*`                      | `toolkit/themes/shared/design-system/*` (flat layout of Firefox 143–146, see below) |

Since Firefox 147, upstream split the design system into `config/`, `src/`,
`dist/` and `storybook/` subdirectories, and later split `design-tokens.json`
into per-component `*.tokens.json` files. This fork still uses the older flat
layout.

The `*.stories.mjs` and `README.stories.md` files were kept from upstream, but
see [Stories and documentation](#stories-and-documentation).

## Differences in shape

These are the mechanical changes applied to (almost) every widget when porting
them:

- **TypeScript**: `.mjs` files became `.ts`, with typed fields and
  `HTMLElementTagNameMap` declarations. `MozBaseInputElement` is generic over
  its inner control type. Properties are still mostly declared with
  `static properties`. A few widgets (`moz-badge`, `moz-button-group`,
  `moz-message-bar`, `moz-toggle`) use the `@customElement` decorator.
- **Imports**: `lit` and `@lit/context` come from npm instead of
  `vendor/lit.all.mjs`, and modules are imported through path aliases (see
  below) instead of `chrome://global/content/elements/...` URLs.
- **CSS** is imported as a Lit `CSSResult` (via `vite-plugin-lit-css`) and put
  in `static styles`, instead of being loaded with
  `<link rel="stylesheet" href="chrome://...">`. Upstream's per-widget
  `*.tokens.css` files are inlined as `:host` custom properties. Exceptions:
  - `moz-button`, `moz-card` and `moz-fieldset` have their CSS inlined in the
    `.ts` file; their sibling `.css` files are kept for reference but aren't
    imported anywhere, and some are out of date.
  - `moz-checkbox.css` and `moz-box-item.css` aren't imported either: these
    widgets only use the styles of their base classes.
  - `panel-list` is still plain JavaScript, and loads its CSS through `?url`
    imports in `<link>` elements.
- **Icons** are rendered as CSS masks (`<div class="contextual-icon"
  style="--icon-url: ...">`) instead of `<img>` with
  `-moz-context-properties`, so that they follow the text color in light and
  dark modes. Icons are bundled SVG assets instead of `chrome://global/skin/icons/...`.
- **Localization**: widgets still rely on `document.l10n` with a Fluent-like
  API (`connectRoot`, `translateFragment`, `data-l10n-id`…), but it is provided
  by the application instead of Firefox. Because the application's
  localization has no `MutationObserver`, `MozLitElement.update()` calls
  `translateFragment()` after every render. The mock-l10n test hooks were
  removed.
- **Firefox-specific code was removed**: `Services`, `AppConstants`,
  `Cu.isInAutomation`, XUL, `originalTarget`, `-moz-*` properties, privileged
  drag-and-drop APIs, SUMO support links (`moz-support-link` and `moz-label`
  are not part of this fork). RTL detection uses `document.dir`.
- **Application-wide styles** (tables, links, `.visually-hidden`, pointer
  cursor, dialog backdrop…) live in `MozLitElement.styles`, so that every
  widget's shadow root gets them. `text-and-typography.css` is also adopted in
  every shadow root.

## Using these widgets

This code currently expects to be built as part of the console frontend. A
consumer needs:

- **Vite** with [`vite-plugin-lit-css`][vite-plugin-lit-css] so that
  `import styles from "./x.css"` returns a Lit `CSSResult` (global stylesheets
  must be excluded from the plugin). SVG files are imported as URLs.
- **Dependencies**: `lit` (^3.3), `@lit/context` (^1.1), and a Fluent-based
  localization (the console uses `@fluent/dom`).
- **Path aliases** (in both the bundler and `tsconfig.json`):
  - `lit-utils` → `widgets/lit-utils`
  - `design-system` → `style/design-system`
  - `~` → the directory containing `widgets/`, which must also provide
    `l10n/common` (exporting a `LocaleKey` type) and `l10n/l10n-context`
    (exporting `primaryLocaleContext`, a `@lit/context` context used by
    `PageLitElement` to set the document title)
  - `assets` → a directory providing the icons (`icons/*.svg`) and fonts used
    by the widgets. **These assets are not part of this repository.**
- **TypeScript settings**: `experimentalDecorators: true`,
  `useDefineForClassFields: false`, and type declarations for CSS and SVG
  imports, `process.env` and `Document.l10n`.
- **`document.l10n`** implementing `connectRoot`, `disconnectRoot`,
  `translateElements`, `translateFragment` and `formatValue`, and Fluent
  strings for the IDs used by the widgets (e.g. `moz-message-bar-*`,
  `moz-button-more-options`, `moz-breadcrumb-group-nav`, `summary-table-*`,
  `moz-box-link-anchor`).
- **Global CSS**: load `design-system/tokens-brand.css` (which imports
  `tokens-shared.css`) and `design-system/text-and-typography.css`, and set
  `color-scheme: light dark` (tokens use `light-dark()`) and
  `font-size: var(--font-size-root)` on the root element.
  `tokens-platform.css` still imports a `chrome://` URL and can't be used
  as-is.

[vite-plugin-lit-css]: https://github.com/bennypowers/lit-css

## Functional differences

### Base classes (`lit-utils.ts`)

- `MozBaseInputElement` is **form-associated**, with value submission and the
  `formDisabledCallback`, `formResetCallback` and `formStateRestoreCallback`
  callbacks. This was implemented before upstream's own version.
- **Form validation**: `required` and `pattern` properties, and
  `checkValidity()`, `reportValidity()`, `setCustomValidity()`, `validity`,
  `validationMessage` and `willValidate`, all mirroring the inner input.
  Validity is re-checked whenever constraints change, and custom validity
  messages persist across these re-checks. Invalid inputs are styled with
  `:user-invalid`.
- `required="no-whitespace"` also rejects whitespace-only values.
- Shadow roots use `delegatesFocus`, so `form.reportValidity()` can focus the
  widget. `focus(options)` forwards `FocusOptions` such as `preventScroll`.
- Pressing **Enter** in an input submits its form (`form.requestSubmit()`).
- `inputLayout="inline-end"` support, backported from
  [bug 2012686](https://bugzilla.mozilla.org/show_bug.cgi?id=2012686).
- `MozLitElement` keeps its lists of `fluent` and `mapped` properties per
  class. This fix was upstreamed as
  [bug 2054114](https://bugzilla.mozilla.org/show_bug.cgi?id=2054114).
- `redispatchEvent()` moved up to `MozLitElement`.
- New `PageLitElement` base class, which sets the document title from the
  application's locale context.

### Per widget

- **moz-button**
  - Split button ([bug 1858811](https://bugzilla.mozilla.org/show_bug.cgi?id=1858811))
    and `menuId` integration with `panel-list`
    ([bug 1875374](https://bugzilla.mozilla.org/show_bug.cgi?id=1875374)),
    backported. Opening the menu doesn't depend on the input source.
  - Pressed state for `aria-pressed`/`aria-expanded`
    ([bug 1912985](https://bugzilla.mozilla.org/show_bug.cgi?id=1912985))
    and an `ariaPressed` property, for toggle buttons.
  - With `href` (and optionally `target`), renders a link instead of a button.
  - Disabled buttons use `aria-disabled="true"` instead of `disabled`: they
    stay focusable but swallow clicks.
  - `type="icon"` renders the icon even without `iconSrc`, so CSS can provide
    `--icon-url`.
- **moz-button-group**: doesn't reorder its light DOM children (which broke
  Lit's tracking of conditionally rendered buttons), and uses `gap` for
  spacing. Platform detection doesn't use `AppConstants`.
- **moz-badge**: additional customization properties (`--badge-border-color`,
  `--badge-text-color`, `--badge-padding-*`).
- **moz-card**: `heading-extra` slot, `headingLevel` (upstream added it too
  since), `iconPosition` (start/end), a heading structure that keeps the end
  icon from wrapping, and the card stretches vertically to fill its container.
- **moz-message-bar**: the ARIA role is `status` for `success` and `info`
  messages and `alert` otherwise (upstream always uses `alert`), unless set
  explicitly. `messageL10nArgs` is passed through as a JSON string.
- **moz-fieldset**: exposes the heading as `part="heading"`, and forwards
  `ariaLabelledByElements` to the inner `<fieldset>`.
- **moz-breadcrumb-group**: breadcrumbs without `href` render as plain text.
- **panel-list / panel-item**
  - Focus always goes back to the trigger when the panel hides, and to the
    first item when it shows, regardless of keyboard or mouse use.
  - Positioning works when the panel's `offsetParent` isn't `<body>`, and a
    new `align` attribute (`start`, `end`, `left`, `right`) forces alignment.
  - `panel-item` with `href` (and optionally `target`) renders a link.
  - Autohide can't be disabled (no `ui.popup.disable_autohide` preference).
- **moz-input-text**: `type` property (e.g. `type="password"`),
  `autocomplete`, mapped `role`, `aria-autocomplete` and `aria-expanded` for
  combobox use.
- **moz-input-search**: no debounce in tests (`NODE_ENV=test`).
- **moz-input-number**: written independently from upstream, with `min`,
  `max`, `step` and an `appearance` property (e.g. to hide the spinners).
- **moz-input-password**: written independently; like upstream minus `title`.
- **moz-input-color**: completely different from upstream. It is a
  `MozBaseInputElement` wrapping `<input type="color">` (with label,
  description and validation) rather than upstream's swatch button.
- **moz-select**: separators, disabled options
  ([bug 1997185](https://bugzilla.mozilla.org/show_bug.cgi?id=1997185)) and
  hidden options ([bug 1997393](https://bugzilla.mozilla.org/show_bug.cgi?id=1997393)),
  implemented in parallel with upstream.
- **moz-checkbox**: supports `required`. Unlike upstream, its form value is
  always `value`, whether it's checked or not, and there's no `"on"` default.
- **moz-toggle**: contrast fix for the inactive state in light mode,
  backported from [bug 2031429](https://bugzilla.mozilla.org/show_bug.cgi?id=2031429).
- **moz-radio-group** (`lit-select-control`): doesn't set `role="radio"`
  explicitly (it's implicit), accepts `aria-label` for its accessible name,
  and is not form-associated (upstream is).
- **moz-segmented-control**: same tag name as upstream, but **a completely
  different implementation**, written from scratch. It's a radio group with a
  sliding thumb, `<moz-segmented-item>` children (`value`, `label`,
  `iconSrc`, `disabled`), RTL-aware arrow keys, and a cancelable
  `beforechange` event before `change`. It has no `named-deck` integration and
  no form `name`.
- **named-deck**: converted to Lit. `named-deck-button` is an autonomous
  custom element (with `role="tab"` and an inner `<button part="button">`)
  rather than a customized built-in `<button is="named-deck-button">`, and
  requires `deck` and `name`. Focusing a tab selects it, and the selected tab
  is visible in forced-colors mode.
- **moz-page-nav**: reworked for the console's main navigation:
  - wrapped in `<nav>`, with a heading linking home (`headingUrl`) that shows
    the console's name and logo (the `heading` property was removed),
  - a `secondary-nav` slot at the bottom, whose buttons and links are not tabs,
  - internal links (`href`) act as tabs, with `target` support,
  - arrow keys only move the focus; they don't switch views,
  - collapses with a media query (`max-width: 60rem`); the `mobile` type was
    removed.

These widgets are present but not used, so probably broken:
- **moz-box-item / moz-box-group**: keyboard reordering with the handle is
  disabled, because it relied on the non-standard `originalTarget`. Reordering
  with the mouse still works.
- **moz-box-link / moz-box-button**: the whole box is a single link or button.
- **moz-reorderable-list**: privileged drag-and-drop code removed.

### Widgets that don't exist upstream

- **moz-input-date**: a `MozBaseInputElement` wrapping `<input type="date">`,
  with `min` and `max` (`YYYY-MM-DD`).
- **summary-box**: a card showing a single large number with a heading, an
  optional link (`href`), a description and a loading state (`indeterminate`).
- **summary-table**: a card showing a key/value table with proportional bars
  (`columnsData`, `maxValue`, `totalValue`), showing 5 rows with a
  "show all/less" button, and empty and loading states.

### Upstream features not in this fork

Non-exhaustive list of what upstream has gained, or what was left out when
porting:

- Widgets: `moz-input-email`, `moz-input-tel`, `moz-input-url`,
  `moz-input-folder`, `moz-textarea`, `moz-visual-picker`, `moz-promo`,
  `moz-support-link`, `moz-label`, among others.
- Base classes: `title` mapped to inner controls, the required indicator,
  `defaultValue` reset logic, form-associated select controls.
- `moz-button`: `size="large"`, `ariaChecked`/`ariaSelected`/`buttonRole`,
  `parentDisabled`, popover target support.
- `moz-select`: panel-list mode for options with icons, `size="small"`,
  `selectedIndex`/`selectedOption`.
- `moz-card`: `spacing="compact"`, `cover-image` slot.
- `moz-message-bar`: `supportPage`, `message` slot, `user-dismissed` event.
- `moz-fieldset`: `disabled` propagation, `iconSrc`, `badge`, `supportPage`.
- `moz-badge`: `type` property (`beta`, `new`) with default labels.
- `moz-box-*`: listbox semantics and better keyboard handling for reorderable
  groups, `support-link` and `description` slots.
- `panel-list`: popover (top layer) support, keyboard shortcuts, submenus
  keyboard model.
- `moz-page-nav`: `allowNoSelection`, `alwaysexpanded`, mobile type.

## Design system

`style/design-system/` matches Firefox 143's `toolkit/themes/shared/design-system`,
with these changes:

- `tokens-brand.css` imports `./tokens-shared.css` instead of a `chrome://`
  URL.
- `text-and-typography.css`:
  - uses `font-family: system-ui, sans-serif` instead of `font: message-box`,
  - defines `--font-family-body` and `--font-family-headline` and a
    "Mozilla Headline" `@font-face`, used for `h1`,
  - adds a `.text-small` helper.
- `--button-border-radius` uses the medium radius
  (like upstream's [bug 1965867](https://bugzilla.mozilla.org/show_bug.cgi?id=1965867)).
- Tokens for the selected/pressed button state
  ([bug 1912985](https://bugzilla.mozilla.org/show_bug.cgi?id=1912985)) and
  for menu buttons (like upstream's
  [bug 1998564](https://bugzilla.mozilla.org/show_bug.cgi?id=1998564)).

The token build scripts (`package.json`, `tokens-config.js`,
`figma-tokens-config.js`, `tests/try-runner.js`) were copied over from
upstream; nothing in this repository runs them.

## Stories and documentation

They're not all uptodate regarding the modifications as outlined above.

The `README.stories.md` files are still useful as API documentation, but some
mention `chrome://` paths, `.mjs` and `.ftl` files from Firefox.

The Storybook stories don't work as-is: there is no Storybook configuration,
and most `*.stories.mjs` files still import `../vendor/lit.all.mjs`,
`.mjs` widget files, `chrome://` icons, or Firefox-only modules. Only a few
(`moz-toggle`, `moz-badge`, `moz-segmented-control`, `moz-reorderable-list`,
`moz-button-group`, `panel-list`) were partially adapted.

## Known issues

- Templates still use `is="moz-label"` and `is="moz-support-link"`, which this
  fork doesn't define, so `supportPage` renders an empty link.
- `moz-select` doesn't notice a `hidden` attribute added to or removed from a
  `moz-option` after the first render.
- `moz-badge` documents a `badge` CSS part that its template doesn't set.
