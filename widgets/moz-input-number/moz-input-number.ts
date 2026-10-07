/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { html } from "lit";
import { type classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { styleMap } from "lit/directives/style-map.js";
import MozInputText from "../moz-input-text/moz-input-text";

/**
 * A number input custom element.
 *
 * @tagname moz-input-number
 * @property {string} label - The text of the label element
 * @property {string} name - The name of the input control
 * @property {string} value - The value of the input control
 * @property {string} type - The type of the input control
 * @property {boolean} disabled - The disabled state of the input control
 * @property {boolean} readonly - The readonly state of the input control
 * @property {string} iconSrc - The src for an optional icon
 * @property {string} description - The text for the description element that helps describe the input control
 * @property {string} supportPage - Name of the SUMO support page to link to.
 * @property {string} placeholder - Text to display when the input has no value.
 * @property {boolean} required - Is this input required
 * @property {string} pattern - Pattern for field validation
 * @property {string} ariaLabel - The aria-label text when there is no visible label.
 * @property {string} ariaDescription - The aria-description text when there is no visible description.
 * @property {number} min - The min attribute for the input control
 * @property {number} max - The max attribute for the input control
 * @property {number} step - The step attribute for the input control
 * @property {string} appearance - The CSS appearance of the inner input (e.g. "textfield" to hide spinners)
 */
export default class MozInputNumber extends MozInputText {
  static properties = {
    appearance: { type: String },
    min: { type: String },
    max: { type: String },
    step: { type: String },
  };

  appearance?: string;
  min?: string;
  max?: string;
  step?: string;

  inputTemplate(
    options: Partial<{
      readonly type: string;
      readonly classes: ReturnType<typeof classMap>;
      readonly inputValue: string;
    }> = {},
  ) {
    const { type = this.type ?? "number", classes, inputValue } = options;

    return html`
      <input
        id="input"
        type=${type}
        class=${ifDefined(classes)}
        style=${styleMap({ appearance: this.appearance })}
        name=${this.name}
        ?disabled=${this.disabled || this.parentDisabled}
        ?readonly=${this.readonly}
        ?required=${this.required}
        min=${ifDefined(this.min)}
        max=${ifDefined(this.max)}
        step=${ifDefined(this.step)}
        .value=${inputValue || this.value}
        accesskey=${ifDefined(this.accessKey)}
        placeholder=${ifDefined(this.placeholder)}
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
}
customElements.define("moz-input-number", MozInputNumber);

declare global {
  interface HTMLElementTagNameMap {
    "moz-input-number": MozInputNumber;
  }
}
