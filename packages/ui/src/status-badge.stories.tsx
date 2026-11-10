import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge } from "./status-badge.js";

const meta = {
  title: "StatusBadge",
  component: StatusBadge,
  parameters: { layout: "centered" },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every status has its own icon and its text; the colour only marks it. */
export const Success: Story = {
  args: { status: "success", label: "Uploaded" },
};

export const Warning: Story = {
  args: { status: "warning", label: "Scan pending" },
};

export const Danger: Story = {
  args: { status: "danger", label: "Upload failed" },
};

export const Info: Story = { args: { status: "info", label: "Queued" } };
