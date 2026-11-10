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

/**
 * The cookie string that remembers `settings` for a year on the whole site. The value
 * `contrast:high.vision:none.motion:system` has only characters RFC 6265 allows in a cookie.
 */
export function accessibilityCookie(settings: AccessibilityModes): string {
  const value = `contrast:${settings.contrast}.vision:${settings.colourVision}.motion:${settings.motion}`;
  return `${accessibilityCookieName}=${value}; Path=/; Max-Age=${oneYearInSeconds}; SameSite=Lax`;
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
    for (const part of pair
      .slice(separator + 1)
      .trim()
      .split(".")) {
      const [key, value] = part.split(":");
      if (key === "contrast" && isContrast(value)) settings.contrast = value;
      if (key === "vision" && isColourVision(value)) {
        settings.colourVision = value;
      }
      if (key === "motion" && isMotion(value)) settings.motion = value;
    }
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
  if (settings.contrast !== defaultAccessibility.contrast) {
    attributes["data-contrast"] = settings.contrast;
  }
  if (settings.colourVision !== defaultAccessibility.colourVision) {
    attributes["data-colour-vision"] = settings.colourVision;
  }
  if (settings.motion !== defaultAccessibility.motion) {
    attributes["data-motion"] = settings.motion;
  }
  return attributes;
}

/** Applies the settings in place on the root element; a setting at its default removes its attribute. */
export function applyAccessibility(
  root: { dataset: Record<string, string | undefined> },
  settings: AccessibilityModes,
): void {
  const attributes = accessibilityAttributes(settings);
  const set = (key: string, attribute: string): void => {
    const value = attributes[attribute];
    if (value === undefined) delete root.dataset[key];
    else root.dataset[key] = value;
  };
  set("contrast", "data-contrast");
  set("colourVision", "data-colour-vision");
  set("motion", "data-motion");
}
