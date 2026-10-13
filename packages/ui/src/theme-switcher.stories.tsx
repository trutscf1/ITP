import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeSwitcher } from "./theme-switcher.js";

const meta = {
  title: "ThemeSwitcher",
  component: ThemeSwitcher,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The switcher as the web layout renders it for a first visit. */
export const Light: Story = { args: { initialTheme: "light" } };

/** The chosen theme is the pressed item; here the page was rendered in sepia. */
export const Sepia: Story = { args: { initialTheme: "sepia" } };
