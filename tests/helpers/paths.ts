import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The root of the repository. */
export const root: string = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

/** Folders that hold builds, caches, or dependencies, never sources. */
const skipped: readonly string[] = [
  "node_modules",
  ".next",
  "dist",
  ".cache",
  "storybook-static",
];

/** Whether `path` is an existing directory. */
function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/** The files below `directory` (recursively, builds and dependencies left out) whose name matches `pattern`. */
export function sourceFiles(directory: string, pattern: RegExp): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory)) {
    if (skipped.includes(entry)) continue;
    const path: string = join(directory, entry);
    if (isDirectory(path)) found.push(...sourceFiles(path, pattern));
    else if (pattern.test(entry)) found.push(path);
  }
  return found;
}

/** The `src` folder of every unit in `apps/` and `packages/` that has one. */
export function unitSourceFolders(): string[] {
  return ["apps", "packages"].flatMap((area: string): string[] =>
    readdirSync(join(root, area))
      .map((unit: string): string => join(root, area, unit, "src"))
      .filter(isDirectory),
  );
}
