// Database client of the relational schema, typed by the emitted contract (SCF-F-23). Units
// that use the relational database import it as `@stash/db`.
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

export function createDb(url: string) {
  return postgres<Contract>({ contractJson, url });
}
