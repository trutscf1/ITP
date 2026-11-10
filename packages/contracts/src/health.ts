import { z } from "./zod.ts";

/** The units of the system (`gam-ai-knowledge/concepts/scaffolding.md` §7). */
export const unitNames = [
  "web",
  "identity",
  "storage",
  "worker",
  "cms",
] as const;

/** The state of one dependency of a unit. */
export const dependencyCheckSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "relational-database" }),
    essential: z.boolean(),
    status: z.enum(["ok", "down"]),
  })
  .openapi("DependencyCheck");

/** The answer of the health endpoint of every unit (SCF-F-5). */
export const healthReportSchema = z
  .object({
    unit: z.enum(unitNames),
    version: z.string().min(1).openapi({ example: "0.0.0-dev" }),
    status: z.enum(["ok", "degraded", "down"]),
    checks: z.array(dependencyCheckSchema),
  })
  .openapi("HealthReport");

export type DependencyCheck = z.infer<typeof dependencyCheckSchema>;
export type HealthReport = z.infer<typeof healthReportSchema>;
