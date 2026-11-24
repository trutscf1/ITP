// The health route answers before any other middleware (SCF-F-5); the rest is the Strapi default.
export default [
  "global::health",
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
