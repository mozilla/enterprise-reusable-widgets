/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { html, ifDefined } from "lit";
import "./moz-segmented-control.ts";

export default {
  title: "UI Widgets/Segmented Control",
  component: "moz-segmented-control",
  parameters: {
    status: "in-development",
    actions: {
      handles: ["beforechange", "change"],
    },
    fluent: `
moz-segmented-control-label =
  .label = Editing mode
moz-segmented-control-aria-label =
  .aria-label = Editing mode
moz-segmented-control-description =
  .label = Editing mode
  .description = Switching modes keeps your unsaved changes.
moz-segmented-item-visual =
  .label = Visual
moz-segmented-item-json =
  .label = JSON
moz-segmented-item-diff =
  .label = Diff
    `,
  },
  argTypes: {
    l10nId: {
      options: [
        "moz-segmented-control-label",
        "moz-segmented-control-aria-label",
        "moz-segmented-control-description",
      ],
      control: { type: "select" },
    },
  },
};

const Template = ({ l10nId, value, disabled, disabledItem }) => html`
  <moz-segmented-control
    data-l10n-id=${ifDefined(l10nId)}
    value=${ifDefined(value)}
    ?disabled=${disabled}
  >
    <moz-segmented-item
      value="visual"
      data-l10n-id="moz-segmented-item-visual"
    ></moz-segmented-item>
    <moz-segmented-item
      value="json"
      data-l10n-id="moz-segmented-item-json"
    ></moz-segmented-item>
    <moz-segmented-item
      value="diff"
      data-l10n-id="moz-segmented-item-diff"
      ?disabled=${disabledItem}
    ></moz-segmented-item>
  </moz-segmented-control>
`;

export const Default = Template.bind({});
Default.args = {
  l10nId: "moz-segmented-control-label",
  value: "visual",
  disabled: false,
  disabledItem: false,
};

export const WithAriaLabelOnly = Template.bind({});
WithAriaLabelOnly.args = {
  ...Default.args,
  l10nId: "moz-segmented-control-aria-label",
};

export const WithDescription = Template.bind({});
WithDescription.args = {
  ...Default.args,
  l10nId: "moz-segmented-control-description",
};

export const DisabledSegment = Template.bind({});
DisabledSegment.args = { ...Default.args, disabledItem: true };

export const Disabled = Template.bind({});
Disabled.args = { ...Default.args, disabled: true };
