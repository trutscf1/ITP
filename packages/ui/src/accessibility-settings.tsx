"use client";

import { Popover, RadioGroup, Switch } from "radix-ui";
import { type ReactElement, useId, useState } from "react";
import {
  accessibilityCookie,
  applyAccessibility,
  type ColourVision,
  colourVisions,
  isColourVision,
  type AccessibilityModes as Settings,
} from "./accessibility.js";

const colourVisionLabels: Record<ColourVision, string> = {
  none: "None",
  protanopia: "Protanopia",
  deuteranopia: "Deuteranopia",
  tritanopia: "Tritanopia",
};

const switchClasses =
  "inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-muted bg-surface p-tight data-[state=checked]:border-accent data-[state=checked]:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const thumbClasses =
  "block size-4 rounded-full bg-foreground data-[state=checked]:translate-x-4 data-[state=checked]:bg-accent-foreground";

export interface AccessibilityControlsProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

/**
 * The controls for the three accessibility settings: a switch for high contrast, a
 * radio group for the colour vision, and a switch for reduced motion (DSA-F-6, DSA-F-7,
 * DSA-F-8). Each control has a visible label, so keyboard and screen reader users
 * operate them like everyone else.
 */
export function AccessibilityControls({
  settings,
  onChange,
}: AccessibilityControlsProps): ReactElement {
  const id = useId();
  return (
    <div className="flex flex-col gap-roomy text-base text-foreground">
      <div className="flex items-center justify-between gap-base">
        <label htmlFor={`${id}-contrast`}>High contrast</label>
        <Switch.Root
          id={`${id}-contrast`}
          checked={settings.contrast === "high"}
          onCheckedChange={(on) =>
            onChange({ ...settings, contrast: on ? "high" : "system" })
          }
          className={switchClasses}
        >
          <Switch.Thumb className={thumbClasses} />
        </Switch.Root>
      </div>

      <div className="flex flex-col gap-snug">
        <span id={`${id}-vision`}>Colour vision</span>
        <RadioGroup.Root
          aria-labelledby={`${id}-vision`}
          value={settings.colourVision}
          onValueChange={(value) => {
            if (isColourVision(value)) {
              onChange({ ...settings, colourVision: value });
            }
          }}
          className="flex flex-col gap-snug"
        >
          {colourVisions.map((name) => (
            <div key={name} className="flex items-center gap-snug">
              <RadioGroup.Item
                id={`${id}-vision-${name}`}
                value={name}
                className="flex size-5 shrink-0 items-center justify-center rounded-full border border-muted bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <RadioGroup.Indicator className="block size-3 rounded-full bg-accent" />
              </RadioGroup.Item>
              <label htmlFor={`${id}-vision-${name}`}>
                {colourVisionLabels[name]}
              </label>
            </div>
          ))}
        </RadioGroup.Root>
      </div>

      <div className="flex items-center justify-between gap-base">
        <label htmlFor={`${id}-motion`}>Reduce motion</label>
        <Switch.Root
          id={`${id}-motion`}
          checked={settings.motion === "reduced"}
          onCheckedChange={(on) =>
            onChange({ ...settings, motion: on ? "reduced" : "system" })
          }
          className={switchClasses}
        >
          <Switch.Thumb className={thumbClasses} />
        </Switch.Root>
      </div>

      <p className="text-sm text-muted">
        Switched off, a setting follows your system. The high-contrast and
        reduced-motion preferences of your system apply without turning anything
        on.
      </p>
    </div>
  );
}

export interface AccessibilitySettingsProps {
  /** The settings the page was rendered with, read from the cookie on the server. */
  initialSettings: Settings;
}

/**
 * A button that opens the accessibility settings of the member. A change applies at once
 * on the root element and is remembered in the browser (DSA-F-17), built on a Radix
 * popover so it works by keyboard and screen reader (DSA-F-3).
 */
export function AccessibilitySettings({
  initialSettings,
}: AccessibilitySettingsProps): ReactElement {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  function change(next: Settings): void {
    applyAccessibility(document.documentElement, next);
    // biome-ignore lint/suspicious/noDocumentCookie: one plain cookie, read on the server
    document.cookie = accessibilityCookie(next);
    setSettings(next);
  }

  return (
    <Popover.Root>
      <Popover.Trigger className="rounded-md border border-muted bg-surface px-snug py-tight text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        Accessibility
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          aria-label="Accessibility settings"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-10 w-80 max-w-[calc(100vw-2rem)] rounded-md border border-muted bg-surface p-base"
        >
          <AccessibilityControls settings={settings} onChange={change} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
