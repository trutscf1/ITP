import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { root } from "./tokens-css.ts";

const ui: string = join(root, "packages/ui");
const requireFromUi: NodeJS.Require = createRequire(join(ui, "package.json"));

interface React {
  createElement(
    type: unknown,
    props?: unknown,
    ...children: unknown[]
  ): unknown;
}

interface ReactServer {
  renderToStaticMarkup(element: unknown): string;
}

/** The part of the built `@stash/ui` that the component tests use. */
export interface BuiltUi {
  [name: string]: unknown;
  /** Renders a component of the build to HTML with `react-dom/server`. */
  render(name: string, props: Record<string, unknown>): string;
  /** Deletes the build. */
  remove(): void;
}

/**
 * Compiles `packages/ui` with the TypeScript compiler into a temporary folder inside it
 * (so that `react` and `radix-ui` resolve) and loads its index, because Node.js does not run
 * `.tsx` files. Type errors do not stop the emit; `pnpm typecheck` owns them.
 */
export async function buildUi(): Promise<BuiltUi> {
  const cache = join(ui, "node_modules/.cache");
  mkdirSync(cache, { recursive: true });
  const out = mkdtempSync(join(cache, "test-build-"));
  const tsc = createRequire(join(root, "package.json")).resolve(
    "typescript/bin/tsc",
  );
  spawnSync(
    process.execPath,
    [
      tsc,
      "-p",
      join(ui, "tsconfig.json"),
      "--outDir",
      out,
      "--declaration",
      "false",
    ],
    { cwd: ui, encoding: "utf8" },
  );
  const index = (await import(
    pathToFileURL(join(out, "index.js")).href
  )) as Record<string, unknown>;
  const { createElement } = requireFromUi("react") as React;
  const { renderToStaticMarkup } = requireFromUi(
    "react-dom/server",
  ) as ReactServer;
  return {
    ...index,
    render(name, props) {
      return renderToStaticMarkup(createElement(index[name], props));
    },
    remove() {
      rmSync(out, { recursive: true, force: true });
    },
  };
}
