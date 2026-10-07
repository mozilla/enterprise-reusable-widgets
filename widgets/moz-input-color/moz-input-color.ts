/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { html } from "lit";
import { MozBaseInputElement } from "lit-utils";
import { ifDefined } from "lit/directives/if-defined.js";
import mozInputColorCss from "./moz-input-color.css";

/**
 * A colour input custom element. The platform picker only carries an opaque
 * `#rrggbb`, so pair it with a separate opacity control where translucency
 * matters.
 *
 * @tagname moz-input-color
 * @property {string} label - The text of the label element
 * @property {string} name - The name of the input control
 * @property {string} value - The value of the input control (#rrggbb)
 * @property {boolean} disabled - The disabled state of the input control
 * @property {boolean} required - Is this input required
 * @property {string} description - The text for the description element
 */
export default class MozInputColor extends MozBaseInputElement {
  static inputLayout = "block";

  constructor() {
    super();
    this.value = "#000000";
  }

  handleInput(e: Event & { target: HTMLInputElement }) {
    this.value = e.target.value;
  }

  inputTemplate() {
    return html`
      <input
        id="input"
        type="color"
        name=${this.name}
        ?disabled=${this.disabled || this.parentDisabled}
        ?required=${this.required}
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

  static styles = [MozBaseInputElement.styles, mozInputColorCss];
}
customElements.define("moz-input-color", MozInputColor);

declare global {
  interface HTMLElementTagNameMap {
    "moz-input-color": MozInputColor;
  }
}
