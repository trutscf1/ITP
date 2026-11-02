// Database client of the relational schema, typed by the emitted contract (SCF-F-23). Units
// that use the relational database import it as `@stash/db`.
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

const contract = contractFromJson<Contract>(contractJson);

export function createDb(url: string) {
  return postgres({ contract, url });
}
