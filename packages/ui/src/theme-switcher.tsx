"use client";

import { ToggleGroup } from "radix-ui";
import { type ReactElement, useState } from "react";
import {
  applyTheme,
  isTheme,
  type Theme,
  themeCookie,
  themes,
} from "./theme.js";

const labels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  sepia: "Sepia",
  night: "Night",
};

export interface ThemeSwitcherProps {
  /** The theme the page was rendered with, read from the cookie on the server. */
  initialTheme: Theme;
}

/**
 * Lets a member switch between the four themes without a reload and
 * remembers the choice in the browser (DSA-F-2), built on a Radix toggle
 * group so it works by keyboard and screen reader (DSA-F-3).
 */
export function ThemeSwitcher({
  initialTheme,
}: ThemeSwitcherProps): ReactElement {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  function choose(value: string): void {
    if (!isTheme(value)) return;
    applyTheme(document.documentElement, value);
    // biome-ignore lint/suspicious/noDocumentCookie: one plain cookie, read on the server
    document.cookie = themeCookie(value);
    setTheme(value);
  }

  return (
    <ToggleGroup.Root
      type="single"
      value={theme}
      onValueChange={choose}
      aria-label="Theme"
      className="inline-flex gap-tight rounded-md border border-border bg-surface p-tight"
    >
      {themes.map((name) => (
        <ToggleGroup.Item
          key={name}
          value={name}
          className="rounded-md px-snug py-tight text-sm text-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {labels[name]}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
