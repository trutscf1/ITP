// Strapi settings of the unit cms. Every value comes from the environment (SCF-AC-2.2).
export default ({ env }: { env: StrapiEnv }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  app: { keys: env.array("APP_KEYS") },
});

export interface StrapiEnv {
  (key: string, fallback?: string): string;
  int(key: string, fallback?: number): number;
  array(key: string): string[];
}
