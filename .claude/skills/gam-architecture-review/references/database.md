# Database audit

Part of area 6 of [score.md](score.md); `n/a` for a project without a data store. A project that has `STACK.md` §11 is read against it.

| Item | Met when |
| --- | --- |
| Schema | Keys, constraints, and types carry the rules; surrogate IDs for references (P-DES-5) |
| Migrations | Every change is a numbered migration, applied in order, none edited after release |
| Access | Queries go through one data layer behind an interface; no query in a controller or view |
| Performance | Indexes on the lookups the code makes; no query inside a loop |
| Integrity | Transactions around multi-step writes; deletes handled by constraint or policy |
| Sensitive data | Personal data minimal, protected, and listed in the concept (`gam-v-privacy-by-design`) |
| Backup and restore | Documented in `DEPLOYMENT.md` |
