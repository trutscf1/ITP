/**
 * The HTTP paths of `identity` (concept §8). The reverse proxy serves them below
 * `identityApiPrefix` and strips it (scaffolding.md §8), so the server registers the short paths,
 * while the API description and the links in e-mails use the full ones.
 */
export const identityApiPrefix = "/api/identity";

export const identityPaths = {
  health: "/health",
  register: "/register",
  confirm: "/confirm",
  login: "/login",
  logout: "/logout",
  session: "/session",
} as const;

export type IdentityPathName = keyof typeof identityPaths;

/** The path as the browser sees it, below the prefix of the reverse proxy. */
export function identityApiPath(name: IdentityPathName): string {
  return `${identityApiPrefix}${identityPaths[name]}`;
}
