/** The four themes of the design system, light first (DSA-F-2). */
export const themes = ["light", "dark", "sepia", "night"] as const;

export type Theme = (typeof themes)[number];

export const defaultTheme: Theme = "light";

/** Name of the cookie in which the browser remembers the chosen theme. */
export const themeCookieName = "stash-theme";

const oneYearInSeconds = 60 * 60 * 24 * 365;

export function isTheme(value: unknown): value is Theme {
  return themes.includes(value as Theme);
}

/** The remembered theme from a `Cookie` header, or the default theme. */
export function readThemeCookie(cookieHeader: string | undefined): Theme {
  for (const pair of (cookieHeader ?? "").split(";")) {
    const [name, value] = pair.trim().split("=");
    if (name === themeCookieName && isTheme(value)) return value;
  }
  return defaultTheme;
}

/** The cookie string that remembers `theme` for a year on the whole site. */
export function themeCookie(theme: Theme): string {
  return `${themeCookieName}=${theme}; Path=/; Max-Age=${oneYearInSeconds}; SameSite=Lax`;
}

/** Switches the theme in place by setting `data-theme` on the root element. */
export function applyTheme(
  root: { dataset: Record<string, string | undefined> },
  theme: Theme,
): void {
  root.dataset.theme = theme;
}
