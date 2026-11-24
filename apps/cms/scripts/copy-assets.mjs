// Copies the JSON files that Strapi reads at run time (the schemas of the content types and the
// components) from src/ to dist/; the TypeScript compiler leaves them out.
import { cpSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
for (const folder of ["api", "components"]) {
  cpSync(
    fileURLToPath(new URL(`src/${folder}`, root)),
    fileURLToPath(new URL(`dist/${folder}`, root)),
    {
      recursive: true,
      filter: (source) => !source.endsWith(".ts") || source.endsWith(".d.ts"),
    },
  );
}
