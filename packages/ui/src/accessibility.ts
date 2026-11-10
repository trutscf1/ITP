/** Contrast mode: follow `prefers-contrast` of the system, or the member's high-contrast mode (DSA-F-6). */
export const contrasts = ["system", "high"] as const;

/** Colour vision: no adaptation, or the status colours of one colour-blind mode (DSA-F-7). */
export const colourVisions = [
  "none",
  "protanopia",
  "deuteranopia",
  "tritanopia",
] as const;

/** Motion: follow `prefers-reduced-motion` of the system, or the member's reduced-motion mode (DSA-F-8). */
export const motions = ["system", "reduced"] as const;

export type Contrast = (typeof contrasts)[number];
export type ColourVision = (typeof colourVisions)[number];
export type Motion = (typeof motions)[number];

/** The three accessibility settings, independent of each other and of the theme (DSA-F-17). */
export interface AccessibilityModes {
  contrast: Contrast;
  colourVision: ColourVision;
  motion: Motion;
}

export const defaultAccessibility: AccessibilityModes = {
  contrast: "system",
  colourVision: "none",
  motion: "system",
};

/** Name of the cookie in which the browser remembers the accessibility settings. */
export const accessibilityCookieName = "stash-a11y";

const oneYearInSeconds = 60 * 60 * 24 * 365;

export function isContrast(value: unknown): value is Contrast {
  return contrasts.includes(value as Contrast);
}

export function isColourVision(value: unknown): value is ColourVision {
  return colourVisions.includes(value as ColourVision);
}

export function isMotion(value: unknown): value is Motion {
  return motions.includes(value as Motion);
}

/** One setting: its key, its part in the cookie, its data attribute, and the values it allows. */
interface Mode<K extends keyof AccessibilityModes> {
  key: K;
  part: string;
  attribute: string;
  values: readonly AccessibilityModes[K][];
}

const modes: { [K in keyof AccessibilityModes]: Mode<K> } = {
  contrast: {
    key: "contrast",
    part: "contrast",
    attribute: "data-contrast",
    values: contrasts,
  },
  colourVision: {
    key: "colourVision",
    part: "vision",
    attribute: "data-colour-vision",
    values: colourVisions,
  },
  motion: {
    key: "motion",
    part: "motion",
    attribute: "data-motion",
    values: motions,
  },
};

/** Calls `visit` once per setting, in the order of the cookie. The key of a setting is also its dataset key. */
function eachMode(
  visit: <K extends keyof AccessibilityModes>(mode: Mode<K>) => void,
): void {
  visit(modes.contrast);
  visit(modes.colourVision);
  visit(modes.motion);
}

/**
 * The cookie string that remembers `settings` for a year on the whole site. The value
 * `contrast:high.vision:none.motion:system` has only characters RFC 6265 allows in a cookie.
 */
export function accessibilityCookie(settings: AccessibilityModes): string {
  const parts: string[] = [];
  eachMode((mode) => parts.push(`${mode.part}:${settings[mode.key]}`));
  return `${accessibilityCookieName}=${parts.join(".")}; Path=/; Max-Age=${oneYearInSeconds}; SameSite=Lax`;
}

/**
 * The remembered settings from a `Cookie` header. Every part that is missing or unknown falls
 * back to its default, so an old or damaged cookie never breaks a page.
 */
export function readAccessibilityCookie(
  cookieHeader: string | undefined,
): AccessibilityModes {
  const settings: AccessibilityModes = { ...defaultAccessibility };
  for (const pair of (cookieHeader ?? "").split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 0) continue;
    if (pair.slice(0, separator).trim() !== accessibilityCookieName) continue;
    const parts = new Map<string, string>();
    for (const part of pair
      .slice(separator + 1)
      .trim()
      .split(".")) {
      const [key, value] = part.split(":");
      if (key !== undefined && value !== undefined) parts.set(key, value);
    }
    eachMode((mode) => {
      const known = mode.values.find((value) => value === parts.get(mode.part));
      if (known !== undefined) settings[mode.key] = known;
    });
  }
  return settings;
}

/**
 * The data attributes of the root element for `settings`: one per setting that is not at its
 * default, so the stylesheet can switch on them (the layout renders them on the server).
 */
export function accessibilityAttributes(
  settings: AccessibilityModes,
): Record<string, string> {
  const attributes: Record<string, string> = {};
  eachMode((mode) => {
    if (settings[mode.key] !== defaultAccessibility[mode.key]) {
      attributes[mode.attribute] = settings[mode.key];
    }
  });
  return attributes;
}

/** Applies the settings in place on the root element; a setting at its default removes its attribute. */
export function applyAccessibility(
  root: { dataset: Record<string, string | undefined> },
  settings: AccessibilityModes,
): void {
  eachMode((mode) => {
    if (settings[mode.key] === defaultAccessibility[mode.key]) {
      delete root.dataset[mode.key];
    } else {
      root.dataset[mode.key] = settings[mode.key];
    }
  });
}
