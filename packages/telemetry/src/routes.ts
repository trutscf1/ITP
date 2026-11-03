/** Route patterns (OBS-F-13): `{name}` for every path parameter, `unmatched` for no route. */

export const unmatched = "unmatched";

/** Writes a framework's parameters (`:id`, `[id]`) as `{id}`. */
export function normalizeRoute(route: string): string {
  return route
    .replace(/\[\.{3}([^\]]+)\]/g, "{$1}")
    .replace(/\[([^\]]+)\]/g, "{$1}")
    .replace(/:([A-Za-z_][\w-]*)/g, "{$1}");
}

/** The path without query and fragment. */
export function pathOnly(raw: string): string {
  return raw.split(/[?#]/, 1)[0] ?? "";
}

function segments(path: string): string[] {
  return path.split("/").filter((segment) => segment !== "");
}

/** The pattern that matches the path with the most literal segments, or `unmatched`. */
export function matchRoute(
  rawPath: string,
  patterns: readonly string[],
): string {
  const actual = segments(pathOnly(rawPath));
  let best: { pattern: string; literals: number } | undefined;
  for (const pattern of patterns) {
    const parts = segments(pattern);
    if (parts.length !== actual.length) continue;
    let literals = 0;
    const fits = parts.every((part, index) => {
      if (/^\{[^}]+\}$/.test(part)) return true;
      literals += 1;
      return part === actual[index];
    });
    if (fits && (!best || literals > best.literals))
      best = { pattern, literals };
  }
  return best?.pattern ?? unmatched;
}
