---
doc: qa-log
format: gam-ai-knowledge/1
title: "Question log — Scaffolding & shared contracts"
audience: [developer, reviewer, agent]
concept: "scaffolding.md"
---
# R1 Scaffolding & Shared Contracts – Q&A Log

Verbatim transcript of the grilling for `scaffolding.md` (P-GRILL-2). Question numbers match the concept document's "Resolved Questions" table.

Applied standing decisions (not asked): P-GIT-1…6 as bound in `WORKFLOW.md`, P-VER-1…3, P-ROAD-1…3, P-DOC-1…4, P-DES-1…6, P-QB-1…2, P-WS-1…5.

Assumptions stated instead of asked (P-GRILL-4):

- A1: Concept document `documentation/concepts/scaffolding.md`, requirement-ID prefix `SCF`.
- A2: Every unit validates its configuration at startup and refuses to start with a named error; every external dependency (external login, bot protection, …) can be switched off by configuration, so the stack starts without internet access (school rule).
- A3: R1 contains no observability (R2) and no feature logic; data services join the local stack with the feature that first needs them.

## Round 1 – 2026-09-29

**Q1 – Die vier Bereiche als lauffähige Einheiten**
Frage: Welche lauffähigen Einheiten (eigener Prozess/Container) hat das System?
Empfehlung: `web` (UI + eigene APIs/Proxy), `identity` (Konten, Rechte, Sharing), `storage` (Storage-API) + `worker` (Hintergrundjobs), `cms`; Observability ist Infrastruktur, keine Einheit.
Antwort (für Q1–Q6 gemeinsam): „Alles außer Q5 passt, die Domain und der Server sind noch nicht vorhanden. commits mit <https://www.conventionalcommits.org/en/v1.0.0/> und nutze <https://keepachangelog.com/en/1.1.0/“>

**Q2 – Umfang der gemeinsamen Verträge**
Frage: Was muss als gemeinsamer Vertrag definiert werden?
Empfehlung: HTTP-APIs zwischen Einheiten, Job-Payloads der Queue, Konfigurationsschema je Einheit; OpenAPI nur für HTTP; Vertragsänderung braucht Review des Owners der konsumierenden Einheit.
Antwort (für Q1–Q6 gemeinsam): „Alles außer Q5 passt, die Domain und der Server sind noch nicht vorhanden. commits mit <https://www.conventionalcommits.org/en/v1.0.0/> und nutze <https://keepachangelog.com/en/1.1.0/“>

**Q3 – Wann ist R1 fertig?**
Frage: Ordnerstruktur + Tooling oder ein durchgehendes Walking Skeleton?
Empfehlung: Walking Skeleton – ein Befehl startet alle Einheiten + Reverse Proxy + PostgreSQL; jede Einheit hat einen Health-Endpunkt nach Vertrag; `web` zeigt eine Statusseite, die jede Einheit über den Proxy abfragt; CI prüft Lint, Typecheck, Tests, Build; Pre-Commit-Hooks aktiv.
Antwort (für Q1–Q6 gemeinsam): „Alles außer Q5 passt, die Domain und der Server sind noch nicht vorhanden. commits mit <https://www.conventionalcommits.org/en/v1.0.0/> und nutze <https://keepachangelog.com/en/1.1.0/“>

**Q4 – Wo läuft die CI/CD?**
Frage: GitHub Actions (laut Antrag) oder GitLab CI?
Empfehlung: GitLab CI, weil MRs, Merge-Checks und Reviews auf GitLab laufen; Abweichung vom Antrag wird dokumentiert und präsentiert.
Antwort (für Q1–Q6 gemeinsam): „Alles außer Q5 passt, die Domain und der Server sind noch nicht vorhanden. commits mit <https://www.conventionalcommits.org/en/v1.0.0/> und nutze <https://keepachangelog.com/en/1.1.0/“>

**Q5 – Deployment schon in R1?**
Frage: Wird das Walking Skeleton in R1 bereits automatisch auf einen Server deployt, und gibt es Server und Domain?
Empfehlung: Ja, falls Server + Domain verfügbar: Deployment bei Push auf `main` mit TLS über den Reverse Proxy; sonst Deployment als eigenes Roadmap-Item vor dem ersten Release.
Antwort (für Q1–Q6 gemeinsam): „Alles außer Q5 passt, die Domain und der Server sind noch nicht vorhanden. commits mit <https://www.conventionalcommits.org/en/v1.0.0/> und nutze <https://keepachangelog.com/en/1.1.0/“>

**Q6 – Sprache von Code und Dokumentation**
Frage: In welcher Sprache werden Code, Commits und `documentation/` geschrieben?
Empfehlung: Englisch für Code, Commits und `documentation/`; Deutsch für Präsentation und schulische Unterlagen in `docs/`.
Antwort (für Q1–Q6 gemeinsam): „Alles außer Q5 passt, die Domain und der Server sind noch nicht vorhanden. commits mit <https://www.conventionalcommits.org/en/v1.0.0/> und nutze <https://keepachangelog.com/en/1.1.0/“>

Ergebnis Runde 1: Q1–Q4, Q6 wie empfohlen. Q5: kein Deployment in R1 (Server und Domain fehlen) – Deployment wird ein eigenes Roadmap-Item vor dem ersten Release. Neu: Commits nach Conventional Commits 1.0.0, Changelog nach Keep a Changelog 1.1.0.

Assumptions added after round 1 (P-GRILL-4):

- A4: Commit messages are checked against Conventional Commits 1.0.0 in a commit-msg hook and in CI.
- A5: Commit format: `<type>(<unit>): <description> [<requirement-id>]`, issue reference as footer `Refs: #<issue>`; scope = unit name (`web`, `identity`, `storage`, `worker`, `cms`, `contracts`); breaking changes with `!` and a `BREAKING CHANGE:` footer.
- A6: New roadmap item R14 "Deployment" (automatic deploy on push to `main`, TLS), owner Andreas (CI/CD), blocked until server and domain exist.
- A7: R1 creates only two shared packages: `contracts` and a shared tooling config (TypeScript, Biome); further shared packages come with the feature that needs them.
- A8: All units are released together from the monorepo, so internal APIs are not versioned; a contract change and all its consumers change in one MR.

## Round 2 – 2026-09-29

**Q7 – Wie entsteht der Changelog?**
Frage: Der Antrag verlangt einen automatisch generierten Changelog, Keep a Changelog verlangt kuratierte Einträge statt Commit-Dumps. Wie wird `CHANGELOG.md` erzeugt?
Empfehlung: Im Release-MR erzeugt ein Tool aus den Commits seit dem letzten Tag einen Entwurf (`feat` → Added, `fix` → Fixed, Breaking Changes → Changed/Removed); der Autor des Release-MR überarbeitet ihn in die Keep-a-Changelog-Abschnitte. Kein Pflegen von `[Unreleased]` pro Feature-MR.
Antwort (für Q7–Q11 gemeinsam): „Q8 nur fürs projekt, rest ist ok“

**Q8 – Projekt- oder Profilentscheidung?**
Frage: Gelten Conventional Commits 1.0.0 und Keep a Changelog 1.1.0 für alle künftigen Projekte (Eintrag in `PROFILE.md`) oder nur für dieses?
Empfehlung: Profil, falls du beides überall so willst.
Antwort (für Q7–Q11 gemeinsam): „Q8 nur fürs projekt, rest ist ok“

**Q9 – Routing im Browser**
Frage: Spricht der Browser nur mit `web` (Backend-for-Frontend) oder über den Reverse Proxy direkt mit den Einheiten?
Empfehlung: Direkt über den Proxy unter einer Domain, per Pfad: `/` → `web`, `/api/identity` → `identity`, `/api/storage` → `storage` (große Uploads laufen so nicht durch `web`), CMS-Admin unter eigenem Pfad; `worker` ist nicht erreichbar.
Antwort (für Q7–Q11 gemeinsam): „Q8 nur fürs projekt, rest ist ok“

**Q10 – Lokale Entwicklung**
Frage: Laufen die Einheiten beim Entwickeln in Docker oder nativ?
Empfehlung: Beides: `docker compose up` startet den kompletten Stack produktionsnah (Schulvorgabe); `pnpm dev` startet die Einheiten nativ mit Hot Reload, die Infrastruktur (Proxy, Datenbanken) kommt aus Compose.
Antwort (für Q7–Q11 gemeinsam): „Q8 nur fürs projekt, rest ist ok“

**Q11 – Umfang der CI in R1**
Frage: Welche Prüfungen enthält die Pipeline ab R1?
Empfehlung: Lint, Typecheck, Tests, Build, Commit-Message-Check, Security-Scans (Secrets, Code, Dependencies) und Scan der Container-Images auf Vulnerabilities (Schulvorgabe). Accessibility-Checks kommen mit R4.
Antwort (für Q7–Q11 gemeinsam): „Q8 nur fürs projekt, rest ist ok“

Ergebnis Runde 2: Q7, Q9, Q10, Q11 wie empfohlen. Q8: Conventional Commits 1.0.0 und Keep a Changelog 1.1.0 gelten nur für dieses Projekt (kein Eintrag in `PROFILE.md`); sie werden in `WORKFLOW.md` gebunden.

Assumptions added after round 2 (P-GRILL-4):

- A9: Every unit's health response names the unit, its version, an overall status `ok | degraded | down`, and one status per dependency it uses; no internal details (hosts, stack traces, versions of dependencies).
- A10: The R1 status page shows only the status per unit; who may see it is decided in R3.

Frontier empty after round 2.

Bestätigung (implizit durch die nächste Anweisung): „teile nun die gesamte aufgabe auf die 4 personen auf, damit parallel gearbeitet werden kann und am ende wird alles zusammengemerged“

## Round 3 – 2026-09-29

**Q12 – Health von `worker` auf der Statusseite**
Frage: `worker` ist nicht über den Proxy erreichbar (Q9), die Statusseite sollte aber jede Einheit über den Proxy abfragen (Q3). Wie kommt die Statusseite an den Status von `worker`?
Empfehlung: Die Serverseite der Statusseite fragt den internen `/health` jeder Einheit ab; die Proxy-Pfade prüft zusätzlich der End-to-End-Test in S6.
Antwort: keine ausdrückliche Antwort. Anweisung: „führe freigabe und issues durch“ – mit der Freigabe als Empfehlung übernommen.

Phase 4 – Freigabe: 2026-09-29 durch Fabian Trutschnig (Projekt-Controlling), Anweisung „führe freigabe und issues durch“.

## Round 4 – 2026-09-29

**Q13 – Aufteilung der Arbeit**
Anweisung: „Es soll eine klare abgrenzung geben, jeder macht einen eigenen abschnitt parallel, damit jeder einen plan machen kann um dann seperat implement machen kann, dann wird alles einzeln wieder von feature -> dev -> main alles gemerged, also grenze die personen komplett ab“
Entscheidung: vier Tracks mit exklusiven Pfaden, eigener Plan-Datei und eigenen Issues; gemeinsame Slices (Foundation, Integration) aufgelöst; Tracks treffen sich nur an den im Konzept festgelegten Schnittstellen (§15).

## Round 5 — 2026-10-13 — migration to the current format (trutscf1)

Notes: the concept is migrated with `/engineering-human migrate scaffolding` on `concept/migrate-scaffolding`, because `SCF-F-2` and the old §11 contradicted `SCF-AC-2.1` (one start command) and stopped the work on #39 (`qa-log.md`, round 13, Q35–Q37). From this round on the log is written in English and in the current question format.

Shown with the round: the three gaps between the concept of 2026-09-29 and the stories of the team — status page, health reports, and proxy routing (`SCF-F-4` to `SCF-F-8`, `SCF-U-1` to `SCF-U-3`) without a story; configuration validation (`SCF-F-11`) and native start (`SCF-F-3`) without a criterion; fourteen criteria without a requirement, among them all of `SCF-US-4` (data model) and `SCF-US-7` (project documentation).

Assumptions stated with the round, none rejected. Where a story and the earlier concept disagree, the story decides (P-GOAL-3):

- **A11**: `SCF-F-2` names all data services of `SCF-AC-2.1`; the old §11 no longer excludes them. A unit joins the stack when it becomes runnable (`qa-log.md`, Q35). `SCF-AC-2.1` moves into a new slice 3 "all units in the stack"; #39 delivers `SCF-AC-2.2` and `SCF-AC-2.4`. This withdraws A3.
- **A12**: The relational database no longer starts empty (old §14): schema, migrations, own `users` table, and seed become requirements from `SCF-AC-4.1` to `SCF-AC-4.5`.
- **A13**: The accessibility check is a job of the pipeline (`SCF-AC-5.2`), against the earlier decision Q11.
- **A14**: `SCF-F-15` also covers pushes to feature branches (`SCF-AC-5.1`).
- **A15**: The uniform error format (`SCF-AC-3.4`) enters the data model as `ErrorResponse { code, message }`; the owner of the contracts core refines it.
- **A16**: The table "Issues per track" with the deleted issues #4–#22 is removed; slices and issue numbers stand in the work items.
- **A17**: The section references in the four track files, `ROADMAP.md`, `STACK.md`, and `WORKFLOW.md` are updated (§15 → §16, §9 → §10, §7 → §8). In the track files of other owners only these references change.
- **A18**: The branch is `concept/migrate-scaffolding`, created from `dev`.

❓ **Q14** - **Neue Story und Kriterien**: Soll ich SCF-US-8 (Units erreichbar und sichtbar, fünf Kriterien) und die zwei neuen Kriterien SCF-AC-2.6 und SCF-AC-2.7 so anlegen? Options: Ja, so anlegen / Ohne neue Story / Als obsolet streichen

➡️ Ja, so anlegen

> **Answer:** Ja, so anlegen (Recommended)

❓ **Q15** - **Testkonzept**: Die Migration verlangt für jedes Kriterium einen Abnahmetest in §17. Der Check kennt nur alles oder nichts. Wie weit soll ich gehen? Options: Abnahmetests jetzt / §17 bleibt offen

➡️ Abnahmetests jetzt

> **Answer:** Abnahmetests jetzt (Recommended)

❓ **Q16** - **Tracking-Issue**: WORKFLOW.md verlangt für jeden concept-Branch ein Issue mit `type::concept`. Soll ich „Concept: migrate Scaffolding & shared contracts“ auf GitLab anlegen (dir zugewiesen, Sprint 1)? Options: Issue anlegen / Kein Issue

➡️ Issue anlegen

> **Answer:** Issue anlegen (Recommended)

Result: tracking issue #111 created. Two further assumptions were made while writing and are shown with the merge request:

- **A19**: `web` serves the generated API description, because `/api/docs` falls under the prefix `/` of the routing table (`SCF-F-10`).
- **A20**: `STACK.md` gets one capability index instead of an ID column in every track table, so the open merge requests that edit those tables do not conflict.

Shown with the next round: the list of what lies on the branch, the three commits, the title of the merge request, and the change to the description of #39.

❓ **Q17** - **Veröffentlichen**: Soll ich die drei Commits pushen, den Merge Request nach dev öffnen und die Beschreibung von #39 an die Story-Datei angleichen? Options: Alles veröffentlichen / Nur Commit und Push / Erst ändern / Nur lokal committen

➡️ Alles veröffentlichen

> **Answer:** Alles veröffentlichen (Recommended)

❓ **Q18** - **Reviewer**: Wer soll den Merge Request der Migration prüfen? Options: tschudea07 / schwaigc / schauby1 / Kein Reviewer

➡️ tschudea07

> **Answer:** tschudea07 (Recommended)

Result: the three commits were pushed, merge request !13 was opened with `tschudea07` as reviewer, and the description of #39 was aligned with its story file. `dev` had moved meanwhile (!8, #104, #44); it was merged into the branch and five conflicts were resolved. The pipeline of !13 then failed in the job `commit-messages` only: the body of each of the three commits has a line longer than 100 characters, a rule that came to `dev` with #44.

❓ **Q19** - **Commit-Nachrichten**: Darf ich die Nachrichten der drei Commits auf concept/migrate-scaffolding neu umbrechen und den Branch per Force-Push ersetzen? Options: Ja, umbrechen und pushen / Nein, so lassen

➡️ Ja, umbrechen und pushen

> **Answer:** Nein, so lassen

Result: the history of the branch is not rewritten. The job `commit-messages` stays red on !13, so the merge request cannot be merged until the owner decides how to handle the three commit messages.

Later in the same session the owner asked to make the pipeline green again. Shown with the question: two commits fail (one line of more than 100 characters in each message body), the check reads every commit of the merge request, and the rule comes from the preset of the commit linter, not from `WORKFLOW.md`.

❓ **Q20** - **Weg zur grünen Pipeline**: Wie soll ich den Commit-Check auf !13 grün bekommen? Options: Nachrichten umbrechen / Regel abschalten / Neuer Branch, neuer MR

➡️ Nachrichten umbrechen

> **Answer:** Nachrichten umbrechen (Recommended)

Result: the message bodies of the commits on the branch were rewrapped at 100 characters, with unchanged content and unchanged files, and the branch was replaced with a forced push. This revises the answer to Q19.

## Round 6 — 2026-10-27 — data model of SCF-US-4 (trutscf1, agent)

Notes: `/engineering-human implement 41` on `feature/41-data-model-and-prisma-schema`. Issue #41 was taken over by `trutscf1` from `tschudea07` on 2026-10-27; nothing had been started. The concept named the requirements `SCF-F-22` to `SCF-F-26` but left open where the schema lives, how the 1:1 relation is kept, which tables the model holds, how migrations run at start, and what the seed contains. Every question of this round was **decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)**, each with its recommended option; no pop-up was shown.

Shown with the round: Prisma 8 (`8.0.0-rc.19`, pinned by the first scaffold in `apps/web`) is a new architecture — a contract in Prisma Schema Language, `prisma migration plan` to create and `prisma db migrate` to apply migrations; `prisma migrate dev` and `prisma migrate deploy` no longer exist. The authentication library writes its own four core tables (user, session, account, verification) and lets their names be configured.

Assumptions stated with the round:

- **A21**: `trutscf1` implements `SCF-US-4`; `tschudea07` reviews it as owner of the Identity & CI track. The module specification of the package stands in §16 of the concept, because the track plan is edited only by its owner.
- **A22**: The new package gets the commit scope `db` (`WORKFLOW.md`, `commitlint.config.ts`).
- **A23**: The columns of the four auth tables are those of the library's core schema, in snake_case; the identity concept may add columns with a migration.

❓ **Q21** - **Ort des Schemas**: Wo sollen Schema, Migrationen und Seed liegen? Options: Neues Paket packages/db (Recommended) / In apps/identity / In apps/web lassen

➡️ Neues Paket packages/db — the empty scaffold in `apps/web` moves there and is removed from `web`.

> **Answer:** Neues Paket packages/db (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q22** - **Tabellen der Auth-Bibliothek**: Wie kommen die Tabellen der Authentifizierungsbibliothek ins Schema? Options: Im selben Schema mit Pluralnamen auth_users, auth_sessions, auth_accounts, auth_verifications (Recommended) / Eigene Migrationen der Bibliothek mit Singularnamen / Nur auth_users jetzt

➡️ Im selben Schema mit Pluralnamen

> **Answer:** Im selben Schema mit Pluralnamen (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q23** - **1:1-Beziehung**: Wie wird garantiert, dass jeder Auth-User genau eine Zeile in users hat? Options: Datenbank-Trigger beim Insert, Cascade beim Löschen, eindeutiger Fremdschlüssel (Recommended) / Hook der Bibliothek im identity-Unit / Nur eindeutiger Fremdschlüssel, Zeile legt die Anwendung an

➡️ Datenbank-Trigger beim Insert

> **Answer:** Datenbank-Trigger beim Insert, Cascade beim Löschen, eindeutiger Fremdschlüssel (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q24** - **Umfang des Datenmodells**: Welche Tabellen gehören jetzt ins Modell? Options: users, teams, team_members, folders, folder_permissions plus die Auth-Tabellen (Recommended) / Nur users, teams, folders / Zusätzlich Dateien, Quotas, Audit-Log

➡️ users, teams, team_members, folders, folder_permissions plus die Auth-Tabellen

> **Answer:** users, teams, team_members, folders, folder_permissions plus die Auth-Tabellen (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q25** - **Migrationen beim Start**: Wer wendet die Migrationen beim Start des Stacks an? Options: Eigener Einmal-Container db-migrate, Units warten auf seinen Erfolg (Recommended) / Jede Unit beim eigenen Start / Manuell per Befehl

➡️ Eigener Einmal-Container db-migrate

> **Answer:** Eigener Einmal-Container db-migrate, Units warten auf seinen Erfolg (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q26** - **Prisma-8-Befehle**: SCF-AC-4.5 nennt `prisma migrate deploy`, das es in Prisma 8 nicht mehr gibt. Wie damit umgehen? Options: Kriterium auf `prisma db migrate` ändern, CLAUDE.md anpassen (Recommended) / Auf Prisma 7 zurückgehen / Kriterium so lassen

➡️ Kriterium auf `prisma db migrate` ändern

> **Answer:** Kriterium auf `prisma db migrate` ändern, CLAUDE.md anpassen (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions). Prisma 7 would break the school minimum of Prisma 8.

❓ **Q27** - **ER-Diagramm**: Wie entsteht das Diagramm, solange niemand Vertabelo bedient hat? Options: Textform (Mermaid) in §8 als verbindlicher Entwurf, Vertabelo-Export als menschlicher Schritt (Recommended) / Warten, bis der Export da ist / Nur Mermaid, ohne Vertabelo

➡️ Textform (Mermaid) in §8 als verbindlicher Entwurf

> **Answer:** Textform (Mermaid) in §8 als verbindlicher Entwurf, Vertabelo-Export als menschlicher Schritt (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q28** - **Tests gegen die Datenbank**: Wie werden Trigger, Migrationen und Seed getestet? Options: Echte PostgreSQL über TEST_DATABASE_URL, eigene Datenbank pro Test, PostgreSQL-Service im CI-Job test (Recommended) / Nur statische Tests / Eingebettete Datenbank im Test

➡️ Echte PostgreSQL über TEST_DATABASE_URL

> **Answer:** Echte PostgreSQL über TEST_DATABASE_URL, eigene Datenbank pro Test, PostgreSQL-Service im CI-Job test (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q29** - **Seed-Daten**: Welche Testdaten legt der Seed an? Options: Feste, erfundene Zeilen, mehrfach ausführbar (Recommended) / Zufällige Daten pro Lauf / Daten aus einer Datei, die jeder anpasst

➡️ Feste, erfundene Zeilen, mehrfach ausführbar

> **Answer:** Feste, erfundene Zeilen, mehrfach ausführbar (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

Result: written into `scaffolding.md` (§4 `SCF-F-22` to `SCF-F-26`, §8 "Relational data model", §9 `SCF-E-7`, §10 examples 8 and 9, §11, §12, §13, §16, §17), into the story file (`SCF-AC-4.5`), `STACK.md` §3, `WORKFLOW.md` (scope `db`), and `CLAUDE.md` (Prisma 8 commands). Open human step: the Vertabelo drawing and its export (§8).
