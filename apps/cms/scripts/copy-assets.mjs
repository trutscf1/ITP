// Completes dist/ to the layout Strapi reads (distDir): the code is in dist/src (tsc, outDir),
// the configuration in dist/config, the schemas of the content types and components in
// dist/src/api and dist/src/components (the TypeScript compiler leaves the JSON files out), and
// package.json next to them (boot.ts reads the version of the unit from ../package.json).
import { cpSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const path = (relative) => fileURLToPath(new URL(relative, root));

for (const folder of ["api", "components"]) {
  cpSync(path(`src/${folder}`), path(`dist/src/${folder}`), {
    recursive: true,
    filter: (source) => !source.endsWith(".ts") || source.endsWith(".d.ts"),
  });
}
cpSync(path("dist/src/config"), path("dist/config"), { recursive: true });
cpSync(path("package.json"), path("dist/package.json"));
