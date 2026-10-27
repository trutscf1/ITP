import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { generateOpenApiDocument } from "./openapi.ts";

// `pnpm --filter @stash/contracts openapi:generate [target]` writes the description to a file
// that is not committed (SCF-F-10). The default target is `packages/contracts/dist/openapi.json`,
// whatever the working directory; `build` writes it as well, so every build of the package
// carries the description that `web` serves at `/api/docs`.
const target = resolve(
  process.argv[2] ?? resolve(import.meta.dirname, "../dist/openapi.json"),
);
mkdirSync(dirname(target), { recursive: true });
writeFileSync(
  target,
  `${JSON.stringify(generateOpenApiDocument(), null, 2)}\n`,
);
console.log(`OpenAPI description written to ${target}`);
