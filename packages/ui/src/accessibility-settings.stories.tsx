import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccessibilitySettings } from "./accessibility-settings.js";

const meta = {
  title: "AccessibilitySettings",
  component: AccessibilitySettings,
  parameters: { layout: "centered" },
} satisfies Meta<typeof AccessibilitySettings>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The button as the web layout renders it for a first visit: everything follows the system. */
export const Default: Story = {
  args: {
    initialSettings: {
      contrast: "system",
      colourVision: "none",
      motion: "system",
    },
  },
};

/** The modes a member has switched on are the checked controls once the popover is open. */
export const AllModesOn: Story = {
  args: {
    initialSettings: {
      contrast: "high",
      colourVision: "deuteranopia",
      motion: "reduced",
    },
  },
};
