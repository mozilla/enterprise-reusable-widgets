/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { html } from "lit";
import { MozBaseInputElement } from "lit-utils";
import { ifDefined } from "lit/directives/if-defined.js";
import mozInputDateCss from "./moz-input-date.css";

/**
 * A date input custom element.
 *
 * @tagname moz-input-date
 * @property {string} label - The text of the label element
 * @property {string} name - The name of the input control
 * @property {string} value - The value of the input control (YYYY-MM-DD)
 * @property {boolean} disabled - The disabled state of the input control
 * @property {boolean} required - Is this input required
 * @property {string} min - Minimum selectable date (YYYY-MM-DD)
 * @property {string} max - Maximum selectable date (YYYY-MM-DD)
 * @property {string} description - The text for the description element
 */
export default class MozInputDate extends MozBaseInputElement {
  static inputLayout = "block";
  static properties = {
    min: { type: String },
    max: { type: String },
  };

  min?: string;
  max?: string;

  constructor() {
    super();
    this.value = "";
  }

  handleInput(e: Event & { target: HTMLInputElement }) {
    this.value = e.target.value;
  }

  inputTemplate() {
    return html`
      <input
        id="input"
        type="date"
        name=${this.name}
        ?disabled=${this.disabled || this.parentDisabled}
        ?required=${this.required}
        min=${ifDefined(this.min)}
        max=${ifDefined(this.max)}
        .value=${this.value}
        aria-label=${ifDefined(this.ariaLabel ?? undefined)}
        aria-describedby="description"
        aria-description=${ifDefined(
          this.hasDescription ? undefined : this.ariaDescription,
        )}
        @input=${this.handleInput}
        @change=${this.redispatchEvent}
      />
    `;
  }

  static styles = [MozBaseInputElement.styles, mozInputDateCss];
}
customElements.define("moz-input-date", MozInputDate);

declare global {
  interface HTMLElementTagNameMap {
    "moz-input-date": MozInputDate;
  }
}
