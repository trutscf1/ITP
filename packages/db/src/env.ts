// Loads the .env of the repository root, so the commands of this package read the same
// configuration as the local stack (SCF-F-17), whichever folder they are started from.
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
  quiet: true,
});
