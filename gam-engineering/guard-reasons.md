# Guard reasons

Each line gives the reason for one loosening the floor guard reports (`gam-engineering/tools/floor-guard.mjs`): `- <path>: <move> - <reason>`.

- apps/identity/src/bot-check.test.ts: suppression - `nosemgrep: nextjs-ssrf-fetch` on the fetch to the local bot-check stub at 127.0.0.1; the URL is built by the test, not by user input (IDN-T-5)
- gam-engineering/pipeline.json: loosened - the limits check excludes the identity files that exceed the size limits introduced by !73 after !62 was reviewed (`apps/identity/src/app.ts`, `auth-core.ts`, `identity.ts`, `login.ts`, `register.test.ts`, `packages/contracts/src/identity/common-passwords.ts`, `packages/contracts/src/openapi.ts`), like the existing offenders on dev (QB0001); #174 splits them and removes the exclusions
