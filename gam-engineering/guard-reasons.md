# Guard reasons

Each line gives the reason for one loosening the floor guard reports (`gam-engineering/tools/floor-guard.mjs`): `- <path>: <move> - <reason>`.

- apps/identity/src/bot-check.test.ts: suppression - `nosemgrep: nextjs-ssrf-fetch` on the fetch to the local bot-check stub at 127.0.0.1; the URL is built by the test, not by user input (IDN-T-5)
