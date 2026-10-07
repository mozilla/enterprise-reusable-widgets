/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { html, nothing } from "lit";
import { MozLitElement } from "lit-utils";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";
import mozSegmentedControlCss from "./moz-segmented-control.css";
import mozSegmentedItemCss from "./moz-segmented-item.css";

/**
 * A horizontal set of mutually exclusive options rendered as one control.
 *
 * @tagname moz-segmented-control
 * @property {string} value - Value of the selected segment. Two-way synced with the children.
 * @property {boolean} disabled - Whether the whole control is disabled.
 * @property {string} label - Visible label shown above the control.
 * @property {string} description - Description shown below the control.
 * @property {string} ariaLabel - Accessible name when no visible label is provided.
 * @slot default - The control's segments, intended for moz-segmented-item elements.
 * @fires beforechange - Cancelable, fired before a user-initiated switch with
 *   the requested value in `detail.value`. Preventing it keeps the current value.
 * @fires change - Fired on the control when the selected value changes.
 */
export class MozSegmentedControl extends MozLitElement {
  static properties = {
    value: { type: String },
    disabled: { type: Boolean, reflect: true },
    label: { type: String, fluent: true },
    description: { type: String, fluent: true },
    ariaLabel: { type: String, fluent: true, mapped: true },
  };

  value?: string;
  disabled = false;
  label = "";
  description = "";

  get #items(): MozSegmentedItem[] {
    return [...this.querySelectorAll("moz-segmented-item")];
  }

  get #selectedIndex() {
    return this.#items.findIndex((item) => item.value === this.value);
  }

  /** Light-DOM children are not reactive: re-render when segments change. */
  #handleSlotChange() {
    this.requestUpdate();
  }

  updated() {
    this.#syncItems();
  }

  #syncItems() {
    const enabled = this.#items.filter((item) => !item.disabled);
    const tabStop =
      enabled.find((item) => item.value === this.value) ?? enabled[0];

    for (const item of this.#items) {
      item.checked = item.value === this.value;
      item.tabbable = item === tabStop;
      item.groupDisabled = this.disabled;
    }

    // Focus follows the selection when it was already inside the control, e.g.
    // after a dialog gave focus back to a segment that is no longer selected.
    const focused = this.#items.find((item) => item.matches(":focus-within"));
    if (focused && tabStop && focused !== tabStop) {
      tabStop.focus();
    }
  }

  /** Selects `value` unless a `beforechange` listener cancels it. */
  activate(value: string): boolean {
    if (value === this.value) {
      return false;
    }
    const allowed = this.dispatchEvent(
      new CustomEvent("beforechange", {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { value },
      }),
    );
    if (!allowed) {
      return false;
    }
    this.value = value;
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    return true;
  }

  #handleItemSelect(event: Event) {
    const item = event.target as MozSegmentedItem;
    this.activate(item.value);
  }

  #handleKeydown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    const rtl = this.matches(":dir(rtl)");
    const deltas: Record<string, number> = {
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
      ArrowDown: 1,
      ArrowUp: -1,
    };
    const delta = deltas[event.key];
    if (!delta) {
      return;
    }
    event.preventDefault();

    const enabled = this.#items.filter((item) => !item.disabled);
    if (enabled.length === 0) {
      return;
    }

    const current = enabled.findIndex((item) => item.value === this.value);
    const next =
      enabled[(current + delta + enabled.length) % enabled.length] ??
      enabled[0];
    if (this.activate(next.value)) {
      next.focus();
    }
  }

  render() {
    const labelId = this.label ? "label" : undefined;
    const describedBy = this.description ? "description" : undefined;
    const selectedIndex = this.#selectedIndex;

    return html`
      ${
        this.label
          ? html`<span id="label" class="label" part="label"
              >${this.label}</span
            >`
          : nothing
      }
      <div
        class="track"
        part="track"
        style=${styleMap({
          "--segment-count": String(this.#items.length || 1),
          "--selected-index": String(Math.max(selectedIndex, 0)),
        })}
      >
        <span
          class="thumb"
          part="thumb"
          ?hidden=${selectedIndex < 0}
          aria-hidden="true"
        ></span>
        <div
          class="segments"
          role="radiogroup"
          aria-labelledby=${ifDefined(labelId)}
          aria-label=${ifDefined(
            labelId ? undefined : (this.ariaLabel ?? undefined),
          )}
          aria-describedby=${ifDefined(describedBy)}
          @keydown=${this.#handleKeydown}
          @segmented-item-select=${this.#handleItemSelect}
        >
          <slot @slotchange=${this.#handleSlotChange}></slot>
        </div>
      </div>
      ${
        this.description
          ? html`<span id="description" class="description" part="description"
              >${this.description}</span
            >`
          : nothing
      }
    `;
  }

  static styles = [MozLitElement.styles, mozSegmentedControlCss];
}
customElements.define("moz-segmented-control", MozSegmentedControl);

/**
 * One option within a moz-segmented-control.
 *
 * @tagname moz-segmented-item
 * @property {string} value - Value this segment selects.
 * @property {string} label - Label text for the segment.
 * @property {string} iconSrc - Path to an icon displayed before the label.
 * @property {boolean} disabled - Whether this segment is disabled.
 * @property {boolean} checked - Whether this segment is selected.
 */
export class MozSegmentedItem extends MozLitElement {
  static properties = {
    value: { type: String },
    label: { type: String, fluent: true },
    iconSrc: { type: String },
    disabled: { type: Boolean, reflect: true },
    checked: { type: Boolean, reflect: true },
    tabbable: { state: true },
    groupDisabled: { state: true },
  };

  static queries = {
    buttonEl: "button",
  };

  declare buttonEl: HTMLButtonElement;
  value = "";
  label = "";
  iconSrc?: string;
  disabled = false;
  checked = false;
  /** Whether this segment is the group's single tab stop; set by the control. */
  tabbable = false;
  /** Whether the whole control is disabled; set by the control. */
  groupDisabled = false;

  get #isDisabled() {
    return this.disabled || this.groupDisabled;
  }

  focus() {
    this.buttonEl?.focus();
  }

  click() {
    this.buttonEl?.click();
  }

  #handleClick() {
    if (!this.#isDisabled) {
      this.dispatchEvent(
        new CustomEvent("segmented-item-select", { bubbles: true }),
      );
    }
  }

  render() {
    return html`
      <button
        type="button"
        class="segment"
        part="segment"
        role="radio"
        aria-checked=${this.checked}
        tabindex=${this.tabbable ? "0" : "-1"}
        ?disabled=${this.#isDisabled}
        @click=${this.#handleClick}
      >
        ${
          this.iconSrc
            ? html`<span
                class="icon contextual-icon"
                style=${styleMap({ "--icon-url": `url("${this.iconSrc}")` })}
                role="presentation"
              ></span>`
            : nothing
        }
        ${this.label}
      </button>
    `;
  }

  static styles = [MozLitElement.styles, mozSegmentedItemCss];
}
customElements.define("moz-segmented-item", MozSegmentedItem);

declare global {
  interface HTMLElementTagNameMap {
    "moz-segmented-control": MozSegmentedControl;
    "moz-segmented-item": MozSegmentedItem;
  }
}
