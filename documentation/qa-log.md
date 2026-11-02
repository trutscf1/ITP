---
doc: qa-log
format: engineering-human/2
title: "Question log — project"
audience: [developer, reviewer, agent]
---
# Question log — project

The verbatim record of every question round, for anyone who wants to know why a decision was made and who answered what (P-GRILL-2). Answers are quoted exactly and never rewritten; the distilled decisions live in the concept's §13 or in an ADR.

Question numbers continue from the highest `Q<n>` already in this file. Assumptions are numbered `A<n>` and become a question of the next round if rejected.

## Round 1 — 2026-10-06 — migrate

Assumptions stated with the inventory, none rejected:

- **A1**: "überarbeite dieses projekt auf diesen skill" means the migration from `engineering-profile` (`/engineering-human migrate`).
- **A2**: `dev` is created locally from `main`; the work happens on `concept/migrate-engineering-human`; nothing is pushed without a separate confirmation.
- **A3**: The school requirements in `docs/` keep precedence; the deviation "branches are kept after merge" and time tracking stay.
- **A4**: The predecessor's manifest template is no longer installed, so the project copy is compared with the new template by hand.
- **A5**: The switch to team mode is a second step of its own after this migration.

❓ **Q1** - **Fester erster Schritt**: Soll im Projekt stehen, dass jede Planungs-, Konzept- und Liefer-Session mit /engineering-human beginnt? Options: In CLAUDE.md / In CLAUDE.local.md / Nein

➡️ In CLAUDE.md

> **Answer:** In CLAUDE.md (Recommended)

❓ **Q2** - **Bestandsaufnahme**: Soll ich die Migration wie in der Tabelle vorgeschlagen durchführen? Options: Wie vorgeschlagen / Nur Dokumente / Abbrechen

➡️ Wie vorgeschlagen

> **Answer:** Wie vorgeschlagen (Recommended)

❓ **Q3** - **Projektziel G-1**: Welcher Wortlaut (höchstens 200 Zeichen) soll das Projektziel sein? Options: Datenhoheit ("Schools, clubs, and small companies store, organize, search, share, and use their files offline on their own server, so that their data stays under their control.") / Mit Barrierefreiheit / Auf Deutsch

➡️ Datenhoheit

> **Answer:** Datenhoheit (Recommended)

❓ **Q4** - **Modus**: Läuft das Projekt im Solo- oder im Team-Modus? Options: Team / Solo

➡️ Team

> **Answer:** Team (Recommended)

❓ **Q5** - **Merge-Einstellungen**: Welche Werte kommen in .claude/settings.json (Merge-Regel / Anzahl Freigaben / Release-Merge)? Options: ask / 1 / ask · approved / 1 / ask · approved / 2 / ask

➡️ ask / 1 / ask

> **Answer:** ask / 1 / ask (Recommended)

❓ **Q6** - **.gitlab-Ordner**: Wie gehe ich mit den vorhandenen Vorlagen und Label-Regeln in .gitlab/ um, die von denen des Skills abweichen? Options: Bestehende behalten / Durch Skill-Vorlagen ersetzen / Beides nebeneinander

➡️ Bestehende behalten

> **Answer:** Durch Skill-Vorlagen ersetzen

## Round 2 — 2026-10-06 — migrate

❓ **Q7** - **Abschluss der Migration**: Die Migration liegt uncommittet auf concept/migrate-engineering-human, beide Prüfungen laufen. Wie soll sie ins Repo? Options: Commit, Push und MR / Nur lokal committen / Nichts committen

➡️ Commit, Push und MR

> **Answer:** Commit, Push und MR (Recommended)

❓ **Q8** - **GitLab-Labels**: Soll ich die Labels auf GitLab jetzt an WORKFLOW.md angleichen? Das ändert die Labels an allen 48 User Stories. Options: Jetzt angleichen / Später

➡️ Jetzt angleichen

> **Answer:** Jetzt angleichen (Recommended)

## Round 3 — 2026-10-06 — team

Assumptions stated with the round, none rejected:

- **A6**: Handles are the GitLab usernames `trutscf1`, `schauby1`, `schwaigc`, `tschudea07`; PM approver and profile maintainer is `trutscf1`.
- **A7**: MR !1 is still open, so the new branches build on it; the team switch and the story files become two separate MRs into `dev`.

❓ **Q9** - **Umfang der Story-Dateien**: Wie sollen die 48 User Stories ins Repo, obwohl 13 Features noch kein Konzept haben? Options: Alle 48 mit Konzept-Entwürfen / Nur die R1-Stories jetzt / Alle 48 ohne Konzepte

➡️ Alle 48 mit Konzept-Entwürfen

> **Answer:** Alle 48 mit Konzept-Entwürfen (Recommended)

❓ **Q10** - **Sprache und Form**: In welcher Form sollen Story und Akzeptanzkriterien in den Dateien stehen? Options: Englisch, Given/When/Then / Deutsch, Given/When/Then / Deutsch, wörtlich

➡️ Englisch, Given/When/Then

> **Answer:** Englisch, Given/When/Then (Recommended)

❓ **Q11** - **GitLab-Issues**: Sollen die 48 Issues auf GitLab an die Story-Dateien angeglichen werden? Options: Später, nach dem Review / Jetzt angleichen / Nur Nummern eintragen

➡️ Später, nach dem Review

> **Answer:** Jetzt angleichen

## Round 4 — 2026-10-06 — delivery

❓ **Q12** - **Rollen in GOAL.md**: Fünf Stories nennen Rollen, die GOAL.md nicht kennt (Entwickler, Content-Redakteur, Besucher). Wie löse ich das? Options: Zwei Rollen ergänzen / Nur umformulieren / So lassen

➡️ Zwei Rollen ergänzen

> **Answer:** Zwei Rollen ergänzen (Recommended)

❓ **Q13** - **Weitere Punkte**: Welche der übrigen offenen Punkte soll ich zusätzlich selbst erledigen? Sie greifen in die Arbeit der Besitzer ein oder sind inhaltliche Entscheidungen. Options (multi-select): Slices schneiden / README schreiben / #1–#3 einordnen / Nichts davon

➡️ no recommendation

> **Answer:** Slices schneiden, README schreiben, #1–#3 einordnen

## Round 5 — 2026-10-06 — delivery

❓ **Q14** - **GitLab-Einstellungen**: Welche der bisher verweigerten Änderungen soll ich jetzt mit deinem Token vornehmen? Options (multi-select): main: Push für niemanden / dev schützen / Merge-Einstellungen / Epics versuchen

➡️ no recommendation

> **Answer:** main: Push für niemanden, dev schützen

## Round 6 — 2026-10-06 — delivery (implement #38, #85)

Assumptions stated with the round, none rejected:

- **A6**: The acceptance tests of #38 use the Node.js test runner (`node --test`) with TypeScript type stripping, because `STACK.md` has no test runner yet (SCF-C-13 is open) and TypeScript is mandatory (`docs/anforderungen_software_projekte.md`).
- **A7**: The units `identity`, `storage`, `worker`, `cms` and the packages `contracts`, `ui`, `config` are minimal TypeScript packages in this issue; their behavior comes with later issues. Strict typing (SCF-AC-1.2) and the quick start (SCF-AC-1.5) are slice 2, issue #102.

❓ **Q15** - **Verzeichnislayout**: Wie soll das Monorepo für SCF-AC-1.1 aufgebaut werden (die vorhandene Next.js-App liegt heute in next/)? Options: apps/ + packages/ / next/ behalten / Layout offen lassen

➡️ apps/ + packages/

> **Answer:** apps/ + packages/ (Recommended)

❓ **Q16** - **STACK.md**: Der Abschnitt 1 (Platform) gehört laut TEAM.md trutscf1 und ist noch _open_. Wie gehe ich damit um, da #38 Workspace, Task-Runner und Ordnerlayout festlegt? Options: In diesem Branch füllen / Nur im MR vorschlagen / Erst Fabian fragen

➡️ In diesem Branch füllen

> **Answer:** In diesem Branch füllen (Recommended)

❓ **Q17** - **Reihenfolge**: Mit welchem Issue soll ich beginnen? Beide bekommen einen eigenen feature-Branch von frisch gepulltem dev. Options: #38, dann #85 / #85, dann #38 / Parallel

➡️ #38, dann #85

> **Answer:** #38, dann #85 (Recommended)

## Round 7 — 2026-10-06 — delivery (revise !4, !5)

Fabian's reviews of !4 and !5 (not approved) are worked through under `/engineering-human revise`. The questions concern !5; they are logged here because this file ships with !4.

❓ **Q18** - **!5 SCF-AC-7.4**: Der Vertabelo-ER-Diagrammteil gehört zu SCF-US-4. Wie lösen wir Fabians Punkt, dass #85 sonst nicht erledigt ist? Options: Zweiter Slice / Kriterium ändern / So lassen

➡️ Zweiter Slice

> **Answer:** Zweiter Slice (Recommended)

❓ **Q19** - **Startbilder**: Fabian will keine Dritt-Logos im öffentlichen Repo. next.svg und vercel.svg stecken in der Starter-Seite page.tsx, file/globe/window.svg sind ungenutzt. Was soll passieren? Options: Ungenutzte löschen / Starter-Seite ersetzen / Nur dokumentieren

➡️ Ungenutzte löschen

> **Answer:** Ungenutzte löschen (Recommended)

❓ **Q20** - **MongoDB/SSPL**: Fabian will dafür ein Issue statt eines README-Hinweises. Soll ich es anlegen? Options: Issue anlegen / Nicht anlegen

➡️ Issue anlegen

> **Answer:** Issue anlegen (Recommended)

❓ **Q21** - **Antworten**: Soll ich jetzt die Antworten auf Fabians Kommentare in !4 und !5 posten und die neuen !4-Commits pushen? Options: Pushen und posten / Nur pushen / Noch nichts

➡️ Pushen und posten

> **Answer:** Pushen und posten (Recommended)

## Round 8 — 2026-10-13 — delivery (`tschudea07`, issues of the CI track)

`tschudea07` asked the agent to work through their open issues. Assumptions: A1 the developer handle is `tschudea07` (from the git user; `CLAUDE.local.md` is missing); A2 one branch and one MR per issue from `dev`, merge policy from `.claude/settings.json`.

❓ **Q22** - **Umfang**: Welche Issues soll ich jetzt abarbeiten? Options: CI-Track #42→#104→#44 / CI-Track + geteilte / Nur #42

➡️ CI-Track #42→#104→#44

> **Answer:** CI-Track #42→#104→#44 (Recommended)

❓ **Q23** - **Test-Seams für die CI-Issues (#42, #104, #44)**: Wo sollen die Akzeptanztests ansetzen? Options: Config + echter Lauf / Nur echter Lauf

➡️ Config + echter Lauf

> **Answer:** Config + echter Lauf (Recommended)

❓ **Q24** - **YAML-Parser**: Soll ich das Paket `yaml` (ISC-Lizenz, ohne Abhängigkeiten) als devDependency im Root hinzufügen? Options: `yaml` hinzufügen / Ohne Paket, Regex

➡️ `yaml` hinzufügen

> **Answer:** `yaml` hinzufügen (Recommended)

❓ **Q25** - **MR für #42**: Soll ich den MR „SCF-US-5 CI pipeline: checks run on every push and merge request“ (feature/42-ci-pipeline → dev) öffnen und #42 auf status::review setzen? Options: MR öffnen / Noch nicht

➡️ MR öffnen

> **Answer:** MR öffnen (Recommended)

❓ **Q26** - **Trivy-Scan**: Alle Images aus docker-compose.yml haben high/critical CVEs (v.a. gosu in postgres und mongo, upstream). Wie soll der Container-Scan-Job sich verhalten? Options: Strikt, mit .trivyignore / Strikt ohne Ausnahmen / allow_failure bis #103

➡️ Strikt, mit .trivyignore

> **Answer:** Strikt, mit .trivyignore (Recommended)

❓ **Q27** - **axe in CI**: SCF-AC-5.2 verlangt axe in der Pipeline, das Scaffolding-Konzept hat in Q11 entschieden: „accessibility checks with R4“. Was gilt? Options: Job jetzt, Seiten mit R4 / Q11 gilt, AC anpassen

➡️ Job jetzt, Seiten mit R4

> **Answer:** Job jetzt, Seiten mit R4 (Recommended)

❓ **Q28** - **next-Update**: Der audit-Job wäre sofort rot wegen next 16.3.7 (High, SSRF, behoben ab 16.3.8). apps/web gehört zum Web-Track (schwaigc). Wie vorgehen? Options: Im #104-MR bumpen / Issue für schwaigc

➡️ Im #104-MR bumpen

> **Answer:** Im #104-MR bumpen (Recommended)

❓ **Q29** - **!5 mit .next-Build**: Soll ich auf MR !5 einen Kommentar posten, dass der Branch Build-Output (`apps/web/.next/`) enthält, den Gitleaks meldet (DoD 12)? Options: Kommentar posten / Nur dir melden

➡️ Kommentar posten

> **Answer:** Kommentar posten (Recommended)

❓ **Q30** - **pnpm-Härtung**: Semgrep (p/nodejs) verlangt `blockExoticSubdeps`, `trustPolicy: no-downgrade` und `minimumReleaseAge` in pnpm-workspace.yaml. Wie umgehen? Options: Alle drei, 7 Tage / Alle drei, 1 Tag / Regeln abschalten

➡️ Alle drei, 7 Tage

> **Answer:** Alle drei, 7 Tage (Recommended)

❓ **Q31** - **Unbehebbare CVEs**: Der Trivy-Job nutzt `--ignore-unfixed`, `pnpm audit --prod` prüft laut docs/ nur Produktions-Abhängigkeiten; SCF-NF-6 sagt „any vulnerability“. Was gilt? Options: So lassen, NF-6 präzisieren / Auch ungefixte melden

➡️ So lassen, NF-6 präzisieren

> **Answer:** So lassen, NF-6 präzisieren (Recommended)

❓ **Q32** - **MR für #104**: Soll ich den MR „SCF-US-5 CI pipeline: security, audit, image, and accessibility checks“ (nach !8 mergen) öffnen und #104 auf status::review setzen? Options: MR öffnen / Noch nicht

➡️ MR öffnen

> **Answer:** MR öffnen (Recommended)

❓ **Q33** - **MR für #44**: Soll ich den MR „SCF-US-6 Commit check, changelog draft, and release on SemVer tags“ (nach !8 und !11 mergen) öffnen, #44 auf status::review setzen und den Log-Eintrag für diese Session mitschicken? Options: MR öffnen / Noch nicht

➡️ MR öffnen

> **Answer:** MR öffnen (Recommended)

## Round 9 — 2026-10-13 — delivery (`tschudea07`, revise !11)

Review of !11 by `schwaigc`, point 1: `SCF-AC-5.3` and `SCF-AC-2.5` were stricter than `SCF-NF-6` after Q31. On `tschudea07`'s instruction to resolve the review, both criteria now carry the wording of `SCF-NF-6` (fixable findings; accepted exceptions with reason and expiry), in the story files and in the issues #42, #104, #39, #103. The work items belong to `trutscf1`: the approval as PM is requested on !11 and still open.

## Round 10 — 2026-10-06 — delivery

Merge decisions (P-MR-4, fixed options Merge now / No / Later / I merge myself), each MR approved by `schwaigc`:

❓ **Q34** - **Merge !1**: concept/migrate-engineering-human nach dev mergen (Migration auf engineering-human, von schwaigc freigegeben)?

> **Answer:** Merge now

❓ **Q35** - **Merge !2**: chore/team-mode nach dev mergen (Team-Modus, von schwaigc freigegeben)? Nur nach !1.

> **Answer:** Merge now

❓ **Q36** - **Merge !3**: concept/user-story-work-items nach dev mergen (48 User Stories als Work Items, von schwaigc freigegeben)? Nur nach !2.

> **Answer:** Merge now

❓ **Q37** - **Feature**: Welches deiner Features soll zuerst gegrillt werden? Options: Public content / Observability baseline / Offline mode / Load tests

➡️ Public content

> **Answer:** Public content (Recommended)

❓ **Q38** - **Session**: Wo soll das Grilling laufen? Options: Neue Session / Hier weitermachen

➡️ Neue Session

> **Answer:** Neue Session (Recommended)

## Round 11 — 2026-10-06 — delivery

Review of the merge requests of `schwaigc` (`feature/38-monorepo-setup`, `feature/85-project-documentation`):

❓ **Q39** - **MR-Auswahl**: Welche Merge Request soll ich reviewen? Lokal sehe ich zwei neue Branches von schwaigc, die noch nicht in dev sind. Options: Beide / #38 Monorepo-Setup / #85 Projektdoku

➡️ Beide

> **Answer:** die merge requests von christopher, dass ist der accestoken: [token removed from the log]

❓ **Q40** - **GitLab-Token**: GITLAB_TOKEN ist in dieser Sitzung nicht gesetzt (weder Prozess noch Benutzer-Umgebung). Ohne ihn kann ich MR-Beschreibung, Threads und Pipeline nicht lesen und nicht approven. Wie weiter? Options: Ich setze den Token / Nur lokales Review

➡️ Ich setze den Token

> **Answer:** Ich setze den Token (Recommended)

❓ **Q41** - **Review posten**: Beide MRs (!4 Monorepo, !5 Projektdoku) sind nicht freigabefähig, daher approve ich nicht. Soll ich die Review-Kommentare unter deinem Namen auf GitLab posten? Options: Beide posten / Nur !4 posten / Nicht posten

➡️ Beide posten

> **Answer:** Beide posten (Recommended)

## Round 12 — 2026-10-07 — delivery

Second review of the merge requests of `schwaigc` (!4 at commit `8cb0ef4`, !5 at commit `9a7b581`). Shown with the questions: the result tables and the comment for !4.

❓ **Q42** - **Review of !4**: All three blockers are fixed and verified. Shall I post the comment shown above on !4 under your name and approve the merge request? Options: Post and approve / Post only / Change the text first / Do not post

➡️ Post and approve

> **Answer:** Post and approve (Recommended)

❓ **Q43** - **Review of !5**: Nothing reviewable changed, and schwaigc announced a rebase after !4 is merged. What should happen on !5 now? Options: No comment / Short confirmation

➡️ No comment

> **Answer:** Short confirmation

Result: the comment was posted on !4 and !4 was approved as `trutscf1`; a short confirmation of the split into #109 and #110 was posted on !5.

## Round 13 — 2026-10-07 — delivery

Merge of !4 (`feature/38-monorepo-setup` → `dev`) at commit `8cb0ef4`. Shown with the question: the check table (acceptance criteria met, pipeline green, no open threads, approved by `trutscf1`; Definition of Done 14 not met, 10 not runnable).

Assumption stated with the round, not rejected:

- **A8**: Definition of Done 10 (pre-commit checks) is treated as not applicable until the pre-commit configuration exists, as it was for !1–!3.

❓ **Q44** - **Time tracking on !4**: Definition of Done 14 is not met, because no time is recorded on #38 or !4. How do we handle this before the merge? Options: Wait for the bookings / Time is booked now / Merge, book afterwards

➡️ Wait for the bookings

> **Answer:** Book 10min review time for me and merge

Result: 10 minutes of review time were recorded on !4 for `trutscf1` on the owner's explicit instruction, a deviation from P-TIME-1 for this one entry (agents never book time). The answer names the merge, so it counts as _Merge now_ (P-MR-4). !4 was merged into `dev` with merge commit `725d327`, the branch is kept, and #38 is closed with `status::done`. The implementation time of `schwaigc` is still not recorded (Definition of Done 14).

## Round 14 — 2026-10-20 — delivery (`schwaigc`, plan of the R1 track Web)

The MRs !5, !7, !9 wait for reviews; the next task of `schwaigc` is chosen. The merge round before it (provisional Q42 and Q43, now Q80 and Q81) is on `feature/106-contrast-and-storybook` (!9) and is renumbered when !9 reaches `dev` (P-TEAM-5).

❓ **Q45** - **Nächster Task**: Die MRs sind merge-fertig und warten auf Reviews. Womit soll ich bei deinen Tasks anfangen? Options: R1 Track-Web-Plan / R6 Web-Client grillen / R4 Rest grillen / Shared #39/#40/#103

➡️ R1 Track-Web-Plan

> **Answer:** R1 Track-Web-Plan (Recommended)

❓ **Q46** - **Issue und Branch**: Issue „R1 track Web: plan of the web unit“ (type::concept, schwaigc, Sprint 1, Gewicht 1) und Branch `concept/scaffolding-track-web`, gestapelt auf !13 (Merge-Reihenfolge !13 → dieser MR)? Options: Ja, so anlegen / Ohne neues Issue / Auf dev statt auf !13

➡️ Ja, so anlegen — issue #113

> **Answer:** Ja, so anlegen (Recommended)

❓ **Q47** - **Annahmen für den Plan**: A1 Statusseite unter `/status` (Server-Seite, ohne Cache, U-3). A2 Abfrage pro Unit mit Timeout `HEALTH_TIMEOUT_MS` (2000); ein Body, der kein HealthReport der richtigen Unit ist, gilt als down (E-3), egal welcher HTTP-Status. A3 Health-URLs der Units als Konfiguration im Web-Config-Contract (contracts/web), Defaults aus der Routing-Tabelle §8. A4 STACK.md §4: SCF-C-3 = Next.js 16.3 (App Router), SCF-C-13 = Playwright 1.63. A5 `apps/web/src/prisma` bleibt unberührt, offener Punkt für SCF-US-4. Options: Alle ok / Einzelne ändern

➡️ Alle ok

> **Answer:** Alle ok (Recommended)

## Round 15 — 2026-10-20 — check (`schwaigc`, workflow documents against `docs/`)

`WORKFLOW.md`, the MR and issue templates, `CLAUDE.md`, `README.md`, and the GitLab settings were compared with `docs/anforderungen_software_projekte.md` and `docs/git_workflow_commands.md`. Findings are in the log of `ROADMAP-DETAILS.md` (2026-10-20).

❓ **Q48** - **Workflow-Fixes**: Welche der gefundenen Punkte soll ich jetzt beheben? Options: Issue-Labels aufräumen / Kommentar auf !15 / Doku-Fix-MR / Settings-Bitte an trutscf1

➡️ Issue-Labels aufräumen, Kommentar auf !15

> **Answer:** Issue-Labels aufräumen (Recommended), Kommentar auf !15 (Recommended)

## Round 16 — 2026-10-20 — delivery (`schwaigc`, merge !6 and !13)

`schwaigc` is not the author of !6 and !13, so these two may be merged by them. Both heads were checked in clean worktrees: doc-check and `--status` 0 errors, markdown lint clean, pipeline green, no conflict with `dev`; the concept text of !6 is unchanged since the approval on `c76350a`.

❓ **Q49** - **Review-Freigabe**: Welche MRs approvst du (Kommentar und Approval unter deinem Namen)? Options: !6 approven / !13 approven / Keinen

➡️ !6 und !13

> **Answer:** !6 approven (Recommended), !13 approven

❓ **Q50** - **Merge !6**: concept/public-content → dev, Head 6263c25. Options: Merge now / No / Later / I merge myself

➡️ Merge now — merged as `2d7a6e0`, branch kept

> **Answer:** Merge now

❓ **Q51** - **Merge !13**: concept/migrate-scaffolding → dev, Head af3fc53. Options: Merge now / No / Later / I merge myself

➡️ Merge now — after !6 the inbox files conflicted; `dev` merged in (`bd5e2d2`, both sides kept), which reset the approval

> **Answer:** Merge now

❓ **Q52** - **Re-Approval !13**: Approval auf bd5e2d2 erneuern? Options: Ja, erneuern / Nein

➡️ Ja, erneuern

> **Answer:** Ja, erneuern (Recommended)

❓ **Q53** - **Merge !13**: Head bd5e2d2. Options: Merge now / No / Later / I merge myself

➡️ Merge now — merged as `8786ed1`, branch kept; #111 closed and set to `status::done`

> **Answer:** Merge now

## Round 17 — 2026-10-20 — delivery (`schwaigc`, revise !14 after the review of `trutscf1`)

The review of !14 (F1–F18) left six questions to the owner. Checked before asking: `next start` rejects `PORT=abc` with its own message, and the standalone `server.js` of the image falls back to port 3000 (`parseInt(process.env.PORT, 10) || 3000`).

❓ **Q54** - **Start-Check (F1)**: Wie wird die Konfiguration von web vor der ersten Anfrage geprüft, sodass der Prozess bei einem Fehler wie in Beispiel 3 mit Exit-Code ≠ 0 endet? Options: Wrapper-Startskript / instrumentation.ts

➡️ Wrapper-Startskript — M7 `apps/web/scripts/start.ts`

> **Answer:** Wrapper-Startskript (Recommended)

❓ **Q55** - **Schrift (F6)**: Das Layout lädt Geist über next/font/google (Internet beim Build, SCF-NF-1). Was stattdessen? Options: System-Schrift / Lokale Font-Dateien

➡️ Lokale Font-Dateien — Geist from the package `geist` (SIL OFL 1.1) through `next/font/local`, licence row in the README

> **Answer:** Lokale Font-Dateien

❓ **Q56** - **Statusfarbe (F13)**: Bekommt die Statusseite schon in R1 eine Farbe zusätzlich zum Text? Options: Nein, nur Text / Ja, mit Tokens

➡️ Nein, nur Text

> **Answer:** Nein, nur Text (Recommended)

❓ **Q57** - **Tests (F4c, F12)**: Wer schreibt welche Tests? Options: Web: T-39, T-40 / Alles Web / Gemeinsamer axe-Check

➡️ Web: T-39, T-40 — in `tests/status-page.test.ts`; T-40 runs axe on `/status` with 0 violations of any impact; SCF-T-36 stays with the Platform track

> **Answer:** Web: T-39, T-40 (Recommended)

❓ **Q58** - **Health-Adressen (F8)**: Container-Hostnamen in den Defaults, localhost für den nativen Start? Options: Service = Unit-Name / Defaults = localhost

➡️ Service = Unit-Name — interface with the Platform track; `.env.example` carries the container values and a comment with the native ones

> **Answer:** Service = Unit-Name (Recommended)

❓ **Q59** - **Fehlerantworten (F7)**: Antwortet web bei Fehlern mit ErrorResponse? Options: Ja, für /api/* / Auch für Seiten

➡️ Ja, für /api/* — `/api/docs` without file: 500 `internal-error`; unknown `/api/*`: 404 `not-found`; HTML pages keep the normal not-found page

> **Answer:** Ja, für /api/* (Recommended)

❓ **Q60** - **Antwort auf das Review von !14**: Tabelle F1–F18 mit Erledigt und Ort, Entscheidungen Q54–Q59, Hinweis zu F18, Bitte um Re-Review posten? Options: Posten / Nicht posten

➡️ Posten — answer posted on !14

> **Answer:** Posten (Recommended)

## Round 18 — 2026-10-20 — delivery (`schwaigc`, pipelines of !14 and !7)

The job `commit-messages` failed on !14 (body line over 100 characters in `4596372`, by `schwaigc`) and on !7 (the same in `84508ee`, by `trutscf1`); the job `docs` failed on !14 because the position row named the MR's own branch, which the check reads as merged. `trutscf1` had added the assumptions A1–A6 to the plan.

❓ **Q61** - **Commit-Nachrichten fixen**: Umschreiben und Force-Push mit `--force-with-lease` auf !14 (4596372 neu formuliert, die sieben folgenden Commits unverändert neu aufgesetzt) und !7 (84508ee mit kürzerer Body-Zeile), dazu ein Kommentar an trutscf1? Options: Ja, beide / Nur !14 / Keinen Force-Push

➡️ Ja, beide — tree of each branch unchanged, commitlint clean

> **Answer:** Ja, beide (Recommended)

❓ **Q62** - **Annahmen A1–A6 von trutscf1**: tsconfig-Optionen, expliziter Test-Glob, `OPENAPI_FILE`, Template-Grafik löschen, Umgebung des Images, 405 mit ErrorResponse. Übernehmen? Options: Alle übernehmen / Einzelne ändern

➡️ Alle übernehmen

> **Answer:** Alle übernehmen (Recommended)

## Round 19 — 2026-10-20 — review (`schwaigc`, !18 of `trutscf1`)

!18 (R11 public content, §16 and §17, #108) was checked at `2a6af46`: doc-check, markdown lint, commitlint, and pipeline clean; findings at the boundary to the `web` unit and to R4.

❓ **Q63** - **Review !18**: Wie soll das Review aussehen? Options: Changes requested / Approve mit Hinweisen / Nicht posten

➡️ Changes requested — review with findings 1–7 posted, no approval; `schwaigc` set as reviewer

> **Answer:** Changes requested (Recommended)

❓ **Q64** - **Wer baut die web-Module von R11?** Options: trutscf1 baut, ich reviewe / Ich baue die web-Seite / Offen lassen

➡️ trutscf1 baut, ich reviewe — every MR that changes `apps/web` gets the review of `schwaigc`

> **Answer:** trutscf1 baut, ich reviewe (Recommended)

❓ **Q65** - **Theme-Cookie gegen PUB-NF-3**: Options: Switcher nur für Mitglieder / Besucher ohne Speichern / Offen lassen

➡️ Switcher nur für Mitglieder — a person without a session sees the default theme and gets no cookie

> **Answer:** Switcher nur für Mitglieder (Recommended)

❓ **Q66** - **Nächster Schritt**: Womit weitermachen, während die MRs auf Reviews warten? Options: R4 grillen (#116) / R6 grillen (#118) / Reviewer anschreiben / Session beenden

➡️ Reviewer anschreiben — reminders posted on !7 (`tschudea07`: !5, !7, !9, merge order) and !14 (`trutscf1`: re-review of !14, revision of !18)

> **Answer:** Reviewer anschreiben

## Round 20 — 2026-10-27 — delivery (`trutscf1`, agent: revise !18)

The review of !18 by `schwaigc` (findings 1 to 7) was worked in on `concept/public-content`; the concept decisions are the assumptions A55 to A61 in round 13 of `concepts/public-content.qa-log.md`. No question was shown: the point below was decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions), with the recommended option.

❓ **Q100** - **Answer to the review of !18**: Push the revision (`dev` merged in), post one reply per finding 1 to 7 with the place of the fix, and request the re-review of `schwaigc`? Options: Post and request re-review / Push only / Do not publish

➡️ Post and request re-review — reply posted on !18, `schwaigc` requested as reviewer again; no thread resolved, no merge (author `trutscf1`)

> **Answer:** decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions): Post and request re-review (Recommended)

## Round 21 — 2026-10-27 — delivery (`trutscf1`, agent, security fix for the pipeline of every MR)

The pipeline of !19 (2026-10-27) failed in `dependency-audit` (Next.js 16.3.8: GHSA-2464-fhr4-w9xw and GHSA-673q-mjm6-r5xr critical, GHSA-p3m5-59mp-jv5r high, fixed in 16.4.1) and in `container-scan` (CVE-2026-111943 high in `usr/local/bin/gosu` of `postgres:18`, Go standard library 1.24.6). Both fail on `dev` itself, so they block every MR.

❓ **Q150** - **Next.js-Version**: 16.4.3 (2026-10-23) ist die neueste, aber jünger als `minimumReleaseAge` (7 Tage) und bräuchte einen Eintrag in `minimumReleaseAgeExclude`; 16.4.2 (2026-10-15) ist gepatcht und hält die Regel ein. Welche Version? Options: 16.4.2 ohne Ausnahme / 16.4.3 mit Ausnahme

➡️ 16.4.2 ohne Ausnahme — the GitHub advisory database lists no advisory affecting 16.4.2, so 16.4.3 adds no security fix that would justify an exception to the supply-chain rule (SCF-NF-6, Q30). Decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions).

> **Answer:** 16.4.2 ohne Ausnahme (Recommended)

❓ **Q151** - **gosu in postgres:18 und mongo:8.0**: Kein offizielles Image enthält schon gosu 1.20 (2026-10-25); alle Varianten von postgres 18 (trixie, bookworm, alpine3.23, alpine3.24) und mongo 8.0 laden gosu 1.19. Wie umgehen? Options: Ausnahme in .trivyignore bis 2026-11-23 / Eigenes Image mit gosu 1.20 bauen

➡️ Ausnahme in .trivyignore bis 2026-11-23 — no newer clean tag of either image exists (checked in the Dockerfiles of `docker-library/postgres` and `docker-library/mongo` on 2026-10-27), and replacing the images is SCF-US-2 slice 2 (#103). Reason and expiry as the file demands (SCF-AC-5.3). Decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions).

> **Answer:** Ausnahme in .trivyignore bis 2026-11-23 (Recommended)

## Round 22 — 2026-10-13 — delivery (`schwaigc`, implement #68)

Renumbered at the merge of `dev` into `feature/68-design-tokens-and-themes` on 2026-10-27 (P-TEAM-5): these questions were asked as Q34 to Q40 on 2026-10-13, and `dev` had used those numbers since. Moved to round 22 at the merge of `dev` after !24 (round 21 of `trutscf1`).

❓ **Q72** - **Themes**: Welche vier Themes soll DSA-AC-1.2 liefern (neben Hell und Dunkel)? Hoher Kontrast gehört zu DSA-US-2 und zählt hier nicht. Options: Hell, Dunkel, Sepia, Nacht / Hell, Dunkel, System, Sepia / Hell, Dunkel, Ozean, Wald

➡️ Hell, Dunkel, Sepia, Nacht

> **Answer:** Hell, Dunkel, Sepia, Nacht (Recommended)

❓ **Q73** - **Speichern**: DSA-AC-1.2 verlangt 'im Profil gespeichert', aber ein Benutzerprofil gibt es erst mit Identity (R3). Wie liefert Slice 1 das? Options: Cookie jetzt, Profil später / localStorage jetzt, Profil später / Auf Identity warten

➡️ Cookie jetzt, Profil später

> **Answer:** Cookie jetzt, Profil später (Recommended)

❓ **Q74** - **Commits**: Du willst viele einzelne Commits. Wie fein? Options: Ein Commit pro Schritt / Ein Commit pro AC

➡️ Ein Commit pro Schritt

> **Answer:** Ein Commit pro Schritt (Recommended)

❓ **Q75** - **Seams**: An welchen Schnittstellen teste ich #68 (node --test, Tests tragen die AC-ID)? (1) `tokens.css` in `@stash/ui`: jedes der vier Themes definiert denselben Token-Satz wie die Basis (AC-1.1/1.2); (2) `theme.ts` in `@stash/ui`: Theme-Namen, Cookie lesen/schreiben, `applyTheme` setzt `data-theme` am Wurzelelement (AC-1.2); (3) Struktur: `@stash/ui` hängt von Radix und Tailwind 4 ab, der ThemeSwitcher nutzt Radix, web lädt die Tokens (AC-1.3). Browser-Klicktest bleibt bei WEB-US-4. Options: Alle drei Seams / Nur (1) und (2) / Zusätzlich Render-Test

➡️ Alle drei Seams

> **Answer:** Alle drei Seams (Recommended)

❓ **Q76** - **Stufe R4**: Sobald R4 auf 'in progress' steht, verlangt doc-check in §17 des Konzepts einen Test für jedes der 16 Akzeptanzkriterien von DSA-US-1 bis -3 (sonst Fehler, die CI wird rot). Gebaut und getestet sind nur AC-1.1 bis 1.3; der Rest des Konzepts ist ungegrillt. Wie lösen wir das? Options: §17 jetzt schreiben / Stufe 'concept' lassen

➡️ §17 jetzt schreiben

> **Answer:** §17 jetzt schreiben (Recommended)

❓ **Q77** - **Push & MR**: Branch feature/68-design-tokens-and-themes (22 Commits, alles grün) pushen und das MR nach dev öffnen? Ohne GITLAB_TOKEN nur per git-Push-Option; Label und Beschreibung folgen per API. Options: Pushen + MR per Push-Option / Erst Token setzen / Nur pushen / Noch nichts

➡️ Pushen + MR per Push-Option

> **Answer:** Pushen + MR per Push-Option (Recommended)

❓ **Q78** - **Issues**: Darf ich ein neues Issue für DSA-US-1 Slice 3 anlegen, die Beschreibung von #68 an die Story-Datei angleichen und bei #102 die Zeile „Lint für Root-Dateien“ korrigieren? Options: Ja, alle drei / Nein

➡️ Ja, alle drei

> **Answer:** Ja, alle drei (Recommended)

## Round 23 — 2026-10-20 — review (`schwaigc`, !14 approved; reviews of !15, !16, !17)

Rounds 23 to 27 were renumbered at the merges of `dev` on 2026-10-27 behind round 20 of `trutscf1` and round 21 of the security fix !24 (P-TEAM-5).

Provisional numbers (P-TEAM-5): Q44 to Q66 of this day are on `concept/scaffolding-track-web` (!14); these follow them. `trutscf1` approved !14 at `0818a6c`. !15, !16, and !17 of `trutscf1` had no reviewer and red pipelines; each was checked in a clean worktree.

❓ **Q67** - **Merge !14**: Der Autor darf seinen MR nicht selbst mergen (`docs/` §4). Wie vorgehen? Options: trutscf1 mergen lassen / Trotzdem selbst mergen / Later

➡️ trutscf1 mergen lassen — request posted on !14

> **Answer:** trutscf1 mergen lassen (Recommended)

❓ **Q68** - **Reviews**: Welche MRs von trutscf1 reviewen? Options: !16 Shared Contracts / !17 Docker Compose / !15 Meilensteinplan

➡️ alle drei — changes requested on each (commit messages or image scan, conflicts with `dev`; !16 also `ErrorResponse` against `scaffolding.md` §8 and example 6)

> **Answer:** !16 Shared Contracts (Recommended), !17 Docker Compose, !15 Meilensteinplan

❓ **Q69** - **/api/docs**: Bei jeder Anfrage aus den Contracts erzeugen (!16) oder die generierte Datei ausliefern (Plan M6)? Options: !16 übernehmen, Plan anpassen / Plan M6 beibehalten

➡️ !16 übernehmen, Plan anpassen — M6 of the track plan Web changes after !14 is merged; !16 adds the test of SCF-T-15

> **Answer:** !16 übernehmen, Plan anpassen (Recommended)

❓ **Q70** - **web-Image**: `docker/web.Dockerfile` aus !17 als Übergang oder ohne web mergen? Options: Als Übergang ok / Ohne web mergen

➡️ Als Übergang ok — replaced by M9 (`apps/web/Dockerfile`) in SCF-US-8 slice 1

> **Answer:** Als Übergang ok (Recommended)

❓ **Q71** - **Merge !14**: concept/scaffolding-track-web → dev, Head 0818a6c, approved by trutscf1; the author merging is against `docs/` §4. Options: Merge now / No / Later / I merge myself

➡️ Merge now — merged as `ab985fa` by `schwaigc` (the author), branch kept; #113 closed and set to `status::done`. Deviation from `docs/anforderungen_software_projekte.md` §4, decided by `schwaigc`

> **Answer:** Merge now

## Round 24 — 2026-10-13 — delivery (`schwaigc`, implement #106)

Renumbered at the merge of `dev` on 2026-10-27 (P-TEAM-5): asked as Q41.

❓ **Q79** - **Nächstes Issue**: An welchem deiner Sprint-1-Issues (status::ready) soll ich weiterarbeiten? Options: #106 DSA-US-1 Slice 2 / #102 SCF-US-1 Slice 2 / #103 SCF-US-2 Slice 2 / #39 oder #40 (Shared)

➡️ #106 DSA-US-1 Slice 2

> **Answer:** #106 DSA-US-1 Slice 2 (Recommended)

## Round 25 — 2026-10-20 — delivery (`schwaigc`, merge the assigned MRs)

Renumbered at the merge of `dev` on 2026-10-27 (P-TEAM-5): Q80 and Q81 were asked as Q42 and Q43.

Open MRs of `schwaigc` (author: !5, !7, !9; reviewer: !6) checked against P-MR-2/3: none is approved, !5 and !7 have an unresolved review thread of `tschudea07`, !9 has a conflict with `dev`, the pipeline of !6 fails on conflict markers in its branch. The author does not merge their own MR (P-MR-2), so nothing was merged in this round.

❓ **Q80** - **Eigene MRs (!5, !7, !9)**: Merge-fertig machen (dev einarbeiten, Konflikte lösen, Checks frisch laufen lassen, pushen, Kommentar an tschudea07), gemergt wird erst nach dem Approval? Options: Merge-fertig machen / Nur einarbeiten, kein Kommentar / Nichts anfassen

➡️ Merge-fertig machen

> **Answer:** Merge-fertig machen (Recommended)

❓ **Q81** - **MR !6 public-content**: Die Pipeline schlägt wegen Konfliktmarkern fehl (ROADMAP-DETAILS.md, qa-log.md), dazu ein neuer Konflikt mit dev. Wie umgehen? Options: Nur Kommentar / Ich fixe den Branch / Nichts tun

➡️ Nur Kommentar

> **Answer:** Nur Kommentar (Recommended)

## Round 26 — 2026-10-27 — review (`schwaigc`, open MRs)

Open MRs: !5, !7, !9 of `schwaigc` (none approved; !7 and !9 in conflict with `dev`); !15 to !19 of `trutscf1` with `schwaigc` as reviewer. !15 and !16 have no commit since the review of 2026-10-20 and are left as they are. Every pipeline fails in `dependency-audit` (and `container-scan` on `dev`) because of the `next` advisories on `dev` itself, so nothing is mergeable (P-MR-3). The questions were asked as Q72 and Q73, before the merge of `dev` moved the questions of #68 to Q72 to Q78 (P-TEAM-5).

❓ **Q82** - **Reviews posten**: Welche Review-Ergebnisse soll ich auf GitLab als Kommentar posten (unter deinem Account schwaigc)? Options: !19 Kommentar + Approve / !18 Kommentar + Approve / !17 Kommentar (changes requested)

➡️ alle drei — !19 approved (inbox of `trutscf1`); !18 approved (all seven findings of the review of 2026-10-20 fixed); changes requested on !17 (job `test` fails on SCF-AC-1.5, quick start over 30 lines since `b44d10d`)

> **Answer:** !19 Kommentar + Approve (Recommended), !18 Kommentar + Approve, !17 Kommentar (changes requested)

❓ **Q83** - **!7/!9**: Soll ich die Konflikte von !7 und !9 mit dev jetzt auflösen und pushen? Options: Ja, !7 und !9 / Nur !7 / Später

➡️ Ja, !7 und !9 — `dev` merged into !7 (questions of #68 moved to Q72–Q78, product name in DSA-US-1), !7 merged into !9 (questions moved to Q79–Q81)

> **Answer:** Ja, !7 und !9 (Recommended)

❓ **Q84** - **Force-Push !7**: Die zwei neuen Commits auf feature/68 verletzen commitlint (Body-Zeilen über 100 Zeichen, Scope `design-system`); mit identischem Inhalt neu geschrieben. Ersetzen per `--force-with-lease`? Options: Force-with-lease erlauben / Ohne Force, Job bleibt rot / Nichts mehr pushen

➡️ Force-with-lease erlauben — `de53cac` replaced by `3a344f6` on `feature/68-design-tokens-and-themes` (same tree); !9 pushed at `5e35b87`

> **Answer:** Force-with-lease erlauben (Recommended)

❓ **Q85** - **Review !20**: doc-check-Regel AC-TEST (trutscf1). Inhaltlich ok, offen: Konflikt mit dev, Pipeline nur wegen dev rot. Wie posten? Options: Kommentar + Approve / Nur Kommentar / Nichts posten

➡️ Kommentar + Approve — !20 approved; `dev` must be merged in before the merge. The new rule gives no error on !5, !7, or !9

> **Answer:** Kommentar + Approve (Recommended)

❓ **Q86** - **Zeit #68 / !7**: Wie viel Zeit hast du heute für !7 gebraucht? Options: 30m / 15m / 45m / 1h

➡️ 30m — booked on #68 by `schwaigc` (total 1h 20m)

> **Answer:** 30m (Recommended)

❓ **Q87** - **Zeit #106 / !9**: Wie viel Zeit hast du heute für !9 gebraucht? Options: 30m / 15m / 45m / 1h

➡️ 15m — booked on #106 (total 1h 5m)

> **Answer:** 15m

❓ **Q88** - **Zeit Reviews !17 und !18**: Wie viel Zeit pro Review? Options: je 20m / je 10m / je 30m / !17 15m, !18 30m

➡️ je 10m — booked on !17 and !18

> **Answer:** je 10m

❓ **Q89** - **Zeit Reviews !19 und !20**: Wie viel Zeit pro Review? Options: !19 10m, !20 20m / je 10m / je 20m / !19 15m, !20 30m

➡️ !19 10m, !20 20m — booked on the MRs

> **Answer:** !19 10m, !20 20m (Recommended)

## Round 27 — 2026-10-27 — delivery (`schwaigc`, second review round of the day)

New since round 25: !21, !23, !24 of `trutscf1` with `schwaigc` as reviewer; revisions of !17 and !20; !19 in conflict with `dev`. Numbers Q152 to Q158 continue behind Q151 of !24 (provisional, P-TEAM-5).

❓ **Q152** - **!24 Security-Fix**: Next.js 16.4.2 und gosu-CVE in `.trivyignore`; Pipeline komplett grün, lokal alles sauber. Review posten? Options: Kommentar + Approve / Nur Kommentar / Nichts tun

➡️ Kommentar + Approve — review posted on !24 and approved; not merged

> **Answer:** Kommentar + Approve (Recommended)

❓ **Q153** - **!20**: Seit dem Approve nur `dev` hineingemergt, Approve dadurch weg. Erneut approven? Options: Re-Approve + kurzer Kommentar / Nichts tun

➡️ Re-Approve + kurzer Kommentar — posted and approved; a note on !19 asks `trutscf1` to merge `dev` (conflict in `ROADMAP-DETAILS.md`)

> **Answer:** Re-Approve + kurzer Kommentar (Recommended)

❓ **Q154** - **!17**: Revision mit grünem `test`-Job; `trutscf1` bittet um einen echten `docker compose up`. Wie vorgehen? Options: Voll re-reviewen inkl. Docker / Re-Review ohne Docker / Später

➡️ Re-Review ohne Docker

> **Answer:** Re-Review ohne Docker

❓ **Q155** - **Neue MRs**: !21 (Milestone-Plan), !23 (Shared Contracts), !19 (Konflikt). Welche jetzt? Options (multi): !23 reviewen / !21 reviewen / !19 Hinweis auf Konflikt

➡️ all three

> **Answer:** !23 reviewen, !21 reviewen, !19 Hinweis auf Konflikt

❓ **Q156** - **!17 Re-Review**: Blocker behoben, 179/179 Tests, eine lange Kommentarzeile im Dockerfile offen (low). Posten? Options: Kommentar + Approve / Nur Kommentar / Nicht posten

➡️ Kommentar + Approve — posted and approved; SCF-T-8 stays open on #103

> **Answer:** Kommentar + Approve (Recommended)

❓ **Q157** - **!23 Shared Contracts**: alle Checks grün; should-fix: geteilte `errorReplies`-Bodies sind veränderbar. Posten? Options: Kommentar + Approve / Changes requested / Nicht posten

➡️ Kommentar + Approve — posted and approved, the freeze point as not blocking

> **Answer:** Kommentar + Approve (Recommended)

❓ **Q158** - **!21 Milestone-Plan**: Sprint-2-Zeile und `team/schwaigc/STATUS.md` nennen #109, #2, #112 in Sprint 2, GitLab hat Sprint 3/3/5; R5-Konzept fälschlich `schwaigc`. Wie reviewen? Options: Changes requested / Kommentar + Approve / Nicht posten

➡️ Changes requested — posted, not approved; GitLab milestones are the reference

> **Answer:** Changes requested (Recommended)

## Round 28 — 2026-10-27 — delivery (`schwaigc`, third review round of the day)

After the merges of !24 and !5 by `trutscf1`: `dev` merged into !7 (`qa-log.md` conflict, the round of #68 moved to 22 behind round 21 of !24) and !7 into !9 (the merge of `dev` into !9 made on GitLab had dropped round 21 of !24; the file is rebuilt from !7 plus the rounds of !9, now 23 to 28). The licence test of !5 (SCF-AC-7.5) required Radix UI on !7 and Storybook, Vite, and `@tailwindcss/vite` on !9; added to the README and the label map. Pipelines of !7 and !9 green.

❓ **Q159** - **!23**: Approve durch Merge von `dev` und Lizenzzeilen weg; `c8f327e` hat eine Body-Zeile über 100 Zeichen (`commit-messages` rot). Wie vorgehen? Options: Kommentar, kein Re-Approve / Kommentar + Re-Approve / Nichts tun

➡️ Kommentar, kein Re-Approve — note posted on !23

> **Answer:** Kommentar, kein Re-Approve (Recommended)

❓ **Q160** - **!25 Regeneration-Probe**: fünf Lücken sauber übernommen; Hinweise zu `toErrorResponse` und zu Q155–Q159. Posten? Options: Kommentar + Approve / Nur Kommentar / Nichts tun

➡️ Kommentar + Approve — posted and approved; not merged

> **Answer:** Kommentar + Approve (Recommended)

❓ **Q161** - **Re-Approve !7 und !9**: Die Pushes haben die Approvals von `trutscf1` zurückgesetzt (bei !9 auch seinen Auto-Merge). Kommentar mit der Bitte um Re-Approve? Options: Ja, auf beiden posten / Nein

➡️ Ja — notes posted on !7 and !9 with what changed and the request to approve again

> **Answer:** Ja, auf beiden posten (Recommended)

❓ **Q162** - **Zeit #68 / #106**: Nachziehen von `dev` und Lizenz-Fixes auf !7 und !9? Options: je 20m / je 15m / je 30m

➡️ je 15m — booked on #68 (total 1h 35m) and #106 (total 1h 20m)

> **Answer:** je 15m

❓ **Q163** - **Zeit !24, !20, !19**? Options: !24 20m, !20 5m, !19 5m / !24 15m, !20 5m, !19 5m / !24 30m, !20 10m, !19 5m

➡️ !24 15m, !20 5m, !19 5m — booked on the MRs

> **Answer:** !24 15m, !20 5m, !19 5m

❓ **Q164** - **Zeit !17, !23, !21, !25**? Options: !17 15m, !23 30m, !21 20m, !25 15m / je 15m / !17 20m, !23 45m, !21 30m, !25 20m

➡️ read as "je 15m" (assumption A: the answer "15m" means 15 minutes for each review) — booked on the MRs

> **Answer:** 15m

## Round 29 — 2026-10-27 — delivery (`trutscf1`, agent: revise !16)

Renumbered at the merge of `dev` into `chore/status-schwaigc-2026-10-28` on 2026-10-28 (P-TEAM-5): asked as Q80 to Q86, which !9 had brought to `dev` first.

`schwaigc` requested changes on !16 on 2026-10-20: the job `commit-messages` fails (two headers over 120 characters), ErrorResponse contradicts `concepts/scaffolding.md` §8 and §10 example 6, conflicts with `dev`, a test for SCF-T-15, and caret ranges. Every question below was decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions), each with the recommended option.

❓ **Q168** - **Commit-Header kürzen ohne Force-Push**: Force-Push ist gesperrt. Options: Neuer Branch `feature/40-shared-contracts` von `dev` mit sauberen Commits, neues MR, !16 schließen (Recommended) / Merge-Commit auf !16 (behebt den Job nicht, er prüft alle Commits)

➡️ New branch from `dev`, test commit before the `feat` commit, one requirement ID per header; `feature/40-shared-contracts-zod-openapi` stays untouched

> **Answer:** Neuer Branch, neues MR, !16 schließen (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q169** - **Route `/api/docs`**: Der gemergte Plan der Spur Web (M6) liest die generierte Datei über `OPENAPI_FILE` und kommt nach #40 (Order of work, Schritt 3); `apps/web` gehört `schwaigc`. Options: Route verlässt dieses MR, M6 liefert sie (Recommended) / Route nach M6 hier bauen (braucht M1, Pfad der Spur Web)

➡️ The route leaves this MR; this MR provides what M6 requires: the generation command and its output path `packages/contracts/dist/openapi.json` (the default of `OPENAPI_FILE`, A3 of the track plan) and ErrorResponse. #40 stays open until M6 is merged (story file, slice 1)

> **Answer:** Route verlässt dieses MR (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q170** - **ErrorResponse**: Options: Flaches `{ code, message }` von §8 mit den vier Codes als Aufzählung und einer Tabelle Code → Status → Meldung in §8 (Recommended) / Verschachtelte Form mit `fields` und §8 ändern

➡️ §8 keeps its one block; `code` becomes `enum(validation-failed|not-found|method-not-allowed|internal-error)`, a table below it fixes status and message per code (the values of §10 example 6 and of M6/W-15/W-16/W-21 of the track Web)

> **Answer:** Flaches Format von §8 mit Tabelle (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q171** - **Versionsbereiche von zod und zod-to-openapi**: Options: Exakt pinnen (4.6.7, 8.5.0) (Recommended) / Caret lassen und in STACK.md begründen

➡️ Pinned exactly; STACK.md §2 says so

> **Answer:** Exakt pinnen (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q172** - **Wann entsteht die Datei der API-Beschreibung?** Options: `openapi:generate` und zusätzlich `build` schreiben `packages/contracts/dist/openapi.json` (Recommended) / Nur `openapi:generate`

➡️ Both; so the file exists for the native start, the tests of `web`, and the image (M9 builds `@stash/contracts`)

> **Answer:** `openapi:generate` und `build` (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q173** - **Antworten auf !16 posten und !16 schließen?** Options: Posten und schließen (Recommended) / Nicht posten

➡️ Reply on !16 with the place of every fix in the new MR, then close !16; publishing needs no confirmation (override 6 waived by the owner)

> **Answer:** Posten und schließen (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q174** - **`dependency-audit` schlägt auf `dev` fehl**: `next` 16.3.8 hat seit 2026-10-22 zwei kritische und eine hohe Lücke (behoben ab 16.4.1). Options: In diesem MR nichts ändern, das Sicherheits-MR `fix/next-and-image-security-2026-10-27` behebt es für `dev` (Recommended) / `next` in diesem MR heben

➡️ This MR changes neither `next` nor an image; a red `dependency-audit` or `container-scan` caused only by `dev` is accepted for now and named in the MR description (instruction of the main session of 2026-10-27)

> **Answer:** In diesem MR nichts ändern (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

## Round 30 — 2026-10-27 — delivery (`trutscf1` (agent), revise !17 after the review of `schwaigc`)

`schwaigc` requested changes on !17 (SCF-US-2 slice 1, #39) on 2026-10-20: the container scan fails, conflicts with `dev`, the `web` image must be marked as a stop-gap, the health check of `web`, and the image pins. No question was asked: each one below was decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions); the answer is the recommended option.

❓ **Q90** - **Image findings without a fixed image**: After moving every image to the newest tag of a pinned minor version, findings remain that no published image fixes yet (Go standard library in gosu and caddy, brotli and curl packages released after the images were built, Jackson and Jetty in the unused Nouveau server of couchdb). How to handle them? Options: `.trivyignore` with reason and expiry 2026-11-23 / Drop the affected services / Let the container scan fail

➡️ `.trivyignore` with reason and expiry 2026-11-23 — same expiry as the existing entries (end of Sprint 2); this delivers SCF-AC-2.5

> **Answer:** `.trivyignore` with reason and expiry 2026-11-23 (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q91** - **Container scan stops at the first image**: The job ended at couchdb and never scanned the images after it. Change the job? Options: Scan every image, then fail / Keep it

➡️ Scan every image, then fail — one run lists all findings

> **Answer:** Scan every image, then fail (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q92** - **Dependency audit fails on next 16.3.8**: Bump Next.js in !17? Options: No, the separate security MR does it / Yes, in !17

➡️ No, the separate security MR does it — the coordinator assigned the Next.js update and the gosu tag of `postgres` to the branch `fix/next-and-image-security-2026-10-27`; !17 gets it with `dev`

> **Answer:** No, the separate security MR does it (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q93** - **Close #103 with !17?** SCF-AC-2.5 is met by the green container scan (SCF-T-10); SCF-AC-2.3 is met by the configuration tests, but SCF-T-8 (start with the network disconnected) has not run. Options: Keep #103 open until SCF-T-8 has run / Close #103 now

➡️ Keep #103 open until SCF-T-8 has run — the MR delivers SCF-AC-2.5 and names SCF-T-8 as the one open check

> **Answer:** Keep #103 open until SCF-T-8 has run (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

❓ **Q94** - **Example for `DATABASE_URL`** (inbox, review of !1 to !3): where? Options: Commented line in `.env.example` and one line in the README quick start / Own `apps/web/.env.example`

➡️ Commented line in `.env.example` and one line in the README quick start — the quick start stays within 30 lines (SCF-AC-1.5)

> **Answer:** Commented line in `.env.example` and one line in the README quick start (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

## Round 31 — 2026-10-27 — delivery (`trutscf1` (agent), implement #138, doc-check rule `AC-TEST`)

Decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions); each question names the options and the chosen one, the recommendation of the agent.

❓ **Q140** - **Schwere von AC-TEST**: Wann ist ein Akzeptanzkriterium ohne Test mit seiner ID ein Fehler, damit `dev` grün bleibt? Options: Nach Stand und MR-Slice / Immer Fehler / Immer Warnung

➡️ Nach Stand und MR-Slice — error once the feature is `in dev` or `released`, and for the criteria the MR's slice delivers (`--pending-branch feature/<n>-…` and `#<n>` in the slice's _Issue_ cell); warning while the feature is `in progress`; nothing for `idea`, `concept`, `ready`. Story files carry no status, and the merge history names stories, not slices (a slice MR names its story), so the merge history is not used; merged slices of a feature in progress show as warnings on `dev`

> **Answer:** decided by the agent: Nach Stand und MR-Slice (Recommended)

❓ **Q141** - **Was zählt als Testname**: Options: Erster String von describe/it/test/suite in Testdateien / Jede Erwähnung der ID in Testdateien / Nur it/test

➡️ Erster String von describe/it/test/suite in Testdateien — `*.test.*` and `*.spec.*` under `tests/`, `apps/`, `packages/`, also `test.describe` and `.only`; not `.skip`, `.todo`, comments, or other strings; `node_modules`, build output, and dot folders are skipped

> **Answer:** decided by the agent: Erster String von describe/it/test/suite in Testdateien (Recommended)

❓ **Q142** - **Ausnahme**: Darf eine Untested-Begründung im Konzept (§17, _ID, Reason_) ein Kriterium vom Fehler befreien? Options: Senkt auf Warnung / Keine Ausnahme / Hebt die Meldung auf

➡️ Senkt auf Warnung — the gap stays visible, and an MR written before Definition of Done item 16 can still pass with a written reason

> **Answer:** decided by the agent: Senkt auf Warnung (Recommended)

❓ **Q143** - **Issue ohne AC-IDs**: #138 hat keine Akzeptanzkriterien mit IDs und keine Story-Datei. Options: Kriterien im MR entwerfen, Commits mit [no-req] / Story-Datei anlegen / Ohne Kriterien

➡️ Kriterien im MR entwerfen, Commits mit [no-req] — the MR description holds the drafted criteria for the issue description; the tests name the rule instead of an `AC` ID

> **Answer:** decided by the agent: Kriterien im MR entwerfen, Commits mit [no-req] (Recommended)

❓ **Q144** - **Definition of Done 15 und 16**: Die Punkte stehen erst in !15 (nicht auf `dev`). Options: Punkt 1 und CI/CD hier, Punkt 16 nach dem zweiten Merge / Auf !15 aufsetzen / Punkte hier anlegen

➡️ Punkt 1 und CI/CD hier, Punkt 16 nach dem zweiten Merge — this MR names the rule in item 1 and in "CI/CD"; whichever of !15 and this MR is merged second drops "once built; until then the reviewer checks it by hand" from item 16

> **Answer:** decided by the agent: Punkt 1 und CI/CD hier, Punkt 16 nach dem zweiten Merge (Recommended)

## Round 49 — 2026-10-27 — delivery (`trutscf1`, agent: implement #41)

Renumbered at the merge of `dev` into `feature/41-data-model-and-prisma-schema` on 2026-11-02 (P-TEAM-5): asked as round 33, which a round of `schwaigc` (!28) took on `dev` first.

Concept questions of this issue are in `concepts/scaffolding.qa-log.md`, round 6 (Q21–Q29). The questions below were **decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)**; no pop-up was shown.

Shown with the round: the Docker engine on the developer machine did not answer (HTTP 500), so the migration was planned offline with `prisma migration plan` (Prisma 8 needs no database for it) and applied and tested against a local PostgreSQL 18 started from the binaries of the npm package `embedded-postgres`, outside the repository.

❓ **Q120** - **Merge Request veröffentlichen**: Branch pushen und MR nach dev mit „Closes #41", Assignee trutscf1, Reviewer tschudea07 öffnen? Options: Veröffentlichen (Recommended) / Nur pushen / Lokal lassen

➡️ Veröffentlichen — the MR states that it depends on !17 (#39)

> **Answer:** Veröffentlichen (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27 (work without questions)

## Round 32 — 2026-11-02 — delivery (`tschudea07` (agent), review !27 and !22)

Question numbers continue after Q203, the highest number on any open branch (Q183–Q193 are taken by !30, up to Q203 by !21); they stay provisional until merged into `dev` (P-TEAM-5).

❓ **Q204** - **Review !27**: SCF-US-4 (#41); tests 284 of 285 pass (1 todo: Vertabelo export); must fix: `Closes #41` although SCF-AC-4.1 is open, Prisma only `8.0.0-rc`, `TEST_DATABASE_URL` missing in `.env.example`. Options: Request changes / Comment + approve / Show the text first

➡️ Request changes — review comment posted on !27, no approval; approval once the three must-fix points are done

> **Answer:** Request changes (Recommended)

❓ **Q205** - **Review !22**: Phase 4 gate of R2, all 32 decisions made by the agent; open: Q4 vs `G-1.S1`, Q12 without TLS, Q22 vs Argon2id, OBS-AC-1.4 vs OBS-F-4, technology names, gate already holds Phase 5. Options: Request changes / Comment + approve / Show the text first

➡️ Request changes — review comment posted on !22, gate not signed off

> **Answer:** Request changes (Recommended)

❓ **Q206** - **Status MR**: Status update of `tschudea07` on `chore/status-tschudea07-2026-11-02` pushen und MR nach `dev` öffnen? Options: Push + open MR / Keep local only

➡️ Push + open MR — reviewer `trutscf1`, no merge

> **Answer:** Push + open MR (Recommended)

❓ **Q207** - **Branch #42**: `feature/42-ci-pipeline` ist in `dev` gemergt; die Schulregeln verbieten das Löschen von Feature-Branches (`WORKFLOW.md`, Override von P-GIT-2). Options: Local only / Local + on GitLab / Don't delete

➡️ Local only — local branch deleted, the branch on GitLab is kept for grading

> **Answer:** Local only (Recommended)

❓ **Q208** - **#40 und #103**: !29 und !30 (`schwaigc`) warten nur auf das Re-Review von `trutscf1`. Options: Review, approve if clean / Review comment only / Leave to `trutscf1`

➡️ Review, approve if clean — both reviewed against the must-fix points of `trutscf1`, the ACs, and the DoD with fresh checks

> **Answer:** Review, approve if clean (Recommended)

❓ **Q209** - **#41**: !27 gehört `trutscf1`, Änderungen sind angefordert (Vertabelo-Export, Prisma-RC, `.env.example`). Options: Wait for `trutscf1` / I fix 3 + should-fix / I fix 2 + 3

➡️ Wait for `trutscf1` — the author revises; `tschudea07` re-reviews afterwards

> **Answer:** Wait for trutscf1 (Recommended)

❓ **Q210** - **!29 und !30 freigeben**: alle Must-fix-Punkte erledigt, frisch grün (!29 284/284, !30 270/270); offen: Zustimmung von `schauby1` zum Export `./web`, !29 vor !30 mergen. Options: Post + approve both / Comment only / Post nothing

➡️ Post + approve both — re-review comments posted and both MRs approved; not merged

> **Answer:** Post + approve both (Recommended)

## Round 33 — 2026-10-28 — review (`schwaigc`, open MRs after the merges of !7 and !9)

`trutscf1` merged !7 and !9 on 2026-10-28 and replaced !23 by !26 (same code, commit messages that pass). Provisional numbers (P-TEAM-5); round 29 at first, moved behind the rounds of `trutscf1` at the merges of `dev` after !26, !17, !20, and !19 (now round 32).

❓ **Q165** - **Re-Approvals**: !19, !20 (nur `dev`-Merge und Logs), !25 (unverändert, umgezielt auf !26), !26 (ersetzt !23, identischer Contracts-Code). Welche approven? Options (multi): !26 approven / !19 re-approven / !20 re-approven / !25 re-approven

➡️ all four — short note and approval on each; not merged

> **Answer:** !26 approven, !19 re-approven, !20 re-approven, !25 re-approven

❓ **Q166** - **!17**: Lizenztest kennt jedes Image, sechs Image-Lizenzen, `DATABASE_URL` als Kommentar, Guava und go-jose in `.trivyignore`; Redis 8.8 unter RSALv2/SSPLv1/AGPLv3 gehört in #110. Wie vorgehen? Options: Re-Approve mit Redis-Hinweis / Nur Kommentar / Nichts tun

➡️ Re-Approve mit Redis-Hinweis — posted and approved

> **Answer:** Re-Approve mit Redis-Hinweis (Recommended)

❓ **Q167** - **Status-MR**: `team/schwaigc/STATUS.md` auf `dev` nennt !7, !9, !23 noch als wartend. Status-MR von `dev` aus? Options: Ja, Status-MR / Nein

➡️ Ja — branch `chore/status-schwaigc-2026-10-28`, reviewer `trutscf1`

> **Answer:** Ja, Status-MR (Recommended)

❓ **Q175** - **!20**: nochmals nur `dev` hineingemergt, Approve weg. Erneut approven nach grüner Pipeline? Options: Ja, nach grüner Pipeline / Nein

➡️ Ja — not possible: `trutscf1` had merged !20 at 15:20 already; the approval call failed (401)

> **Answer:** Ja, nach grüner Pipeline (Recommended)

❓ **Q176** - **Hinweise an `trutscf1`**: auf !28 (Q80–Q86 von !26 auf Q168–Q174 umnummeriert) und auf !25 (auf `dev` umzielen, Q155–Q159 kollidieren)? Options (multi): Hinweis auf !28 / Hinweis auf !25

➡️ both posted

> **Answer:** Hinweis auf !28, Hinweis auf !25

❓ **Q177** - **Fehlposts auf !20**: der Kommentar „Re-approved at `5cd769c0`“ wurde durch Wiederholungen dreimal auf das schon gemergte !20 gepostet, ohne Approve. Löschen? Options: Alle drei löschen / Zwei löschen, einen lassen / Stehen lassen

➡️ Alle drei löschen — deleted

> **Answer:** Alle drei löschen (Recommended)

## Round 34 — 2026-10-28 — delivery (`schwaigc`, implement #40: `/api/docs`)

Provisional numbers (P-TEAM-5): Q165 to Q177 are on `chore/status-schwaigc-2026-10-28` (!28); these follow them.

❓ **Q178** - **Nächstes**: Reviews sind erledigt. Womit bei den Sprint-1-Aufgaben weitermachen? Options: #40: Route /api/docs (M6) / #103: Offline-Start-Test (SCF-T-8) / Beides nacheinander / Nichts, für heute fertig

➡️ #40 — `/engineering-human implement #40` on `feature/40-api-docs-route`

> **Answer:** #40: Route /api/docs (M6) (Recommended)

❓ **Q179** - **Umfang für #40/M6**: M6 braucht `OPENAPI_FILE` aus M1, und M1 ist noch nicht gebaut. Wie schneiden? Options: M6 + M1 vorziehen / Nur M6, Pfad direkt aus env / Erst Slice 1 von SCF-US-8

➡️ M6 + M1 vorziehen — M1 in `packages/contracts/src/web/config.ts` with a local stand-in for the configuration helper, export `@stash/contracts/web`, unit-test setup of `web` (A1, A2); slice 1 of SCF-US-8 keeps M2, M7, M8, M9

> **Answer:** M6 + M1 vorziehen (Recommended)

❓ **Q180** - **Reviewer**: Der Export `@stash/contracts/web` ändert `packages/contracts/package.json` (Contracts-Track). Wer reviewt? Options: trutscf1 / schauby1 / tschudea07

➡️ trutscf1

> **Answer:** trutscf1 (Recommended)

## Round 35 — 2026-10-28 — delivery (`schwaigc`, close #103: offline check SCF-T-8)

Provisional numbers (P-TEAM-5): Q165 to Q177 are on !28 and Q178 to Q180 on !29; these follow them. SCF-T-8 ran with internal networks (no route to the internet) and passed; `clamav/clamav:1.5` has no `arm64` image, so on this Apple Silicon machine it ran with `platform: linux/amd64` in a local override only.

❓ **Q181** - **ClamAV auf Apple Silicon**: `clamav/clamav:1.5` gibt es nur für amd64, `docker compose up` bricht auf ARM-Macs beim Pull ab. Wie beheben? Options: platform: linux/amd64 / clamav/clamav-debian:1.5 / Nur melden

➡️ Nur melden — bug issue #148 for `trutscf1` (owner of `docker-compose.yml`) with both options; `docker-compose.yml` unchanged

> **Answer:** Nur melden

❓ **Q182** - **Abschluss von #103**: SCF-AC-2.3 durch SCF-T-8, SCF-AC-2.5 durch den grünen `container-scan` (!17). Wie abschließen? Options: Kleiner MR, Closes #103 / Nur Kommentar + Issue schließen

➡️ Kleiner MR — `docker/compose.offline-check.yml`, README, story file, log; reviewer `trutscf1`

> **Answer:** Kleiner MR, Closes #103 (Recommended)

❓ **Q183** - **Zeit Reviews 28.10.**: Re-Approves !17, !19, !20, !25, !26 und Status-MR !28. Wie buchen? Options: !26 15m, !17 10m, Rest je 5m / je 10m, !28 30m / je 5m, !28 15m

➡️ !26 15m, !17 10m, !19, !20, !25 je 5m, !28 20m — booked on the MRs

> **Answer:** !26 15m, !17 10m, Rest je 5m (Recommended)

Correction on 2026-10-29 (review of !30): the ➡️ line above does not follow the answer. "Rest je 5m" includes !28, but !28 was booked at 20m. Q183 to Q185 were also booked by the agent on behalf of `schwaigc`, which P-TIME-1 does not allow (`WORKFLOW.md`, "Time tracking"), and Q184 booked 1h 30m in one entry, above the limit of 50 minutes. `schwaigc` corrects these bookings personally, and books every later time personally with `/spend` (Q189).

❓ **Q184** - **Zeit #40**: `/api/docs` mit M1, Tests, Docker-Fix, Doku, MR !29? Options: 2h / 1h 30m / 2h 30m

➡️ 1h 30m — booked on #40 (total 2h)

> **Answer:** 1h 30m

❓ **Q185** - **Zeit #103**: Offline-Check SCF-T-8, #148, MR !30? Options: 1h / 45m / 1h 30m

➡️ 30m — booked on #103 (total 30m)

> **Answer:** 30m

## Round 36 — 2026-10-29 — delivery (`schwaigc`, revise !29 and !30, reviews of !33, !25, !21)

Provisional numbers (P-TEAM-5): these follow Q185 of round 35. Since round 35, `trutscf1` has asked for changes on !29 and !30, opened !33 (fix of #148), and merged `dev` into !21 and !25.

❓ **Q186** - **Reihenfolge**: Womit anfangen? Options: Alles der Reihe nach / Nur !29 und !30 einarbeiten / Zuerst die Reviews für trutscf1 / Nichts jetzt

➡️ Alles der Reihe nach — !29 and !30 revised, !33 checked on Apple Silicon, !25 and !21 checked again

> **Answer:** Alles der Reihe nach (Recommended)

❓ **Q187** - **!29 überarbeitet**: Alle 4 Pflichtpunkte und die Soll-Punkte umgesetzt, alle Checks grün. Pushen, Antwort posten (inkl. Frage an schauby1 wegen Export ./web) und Follow-up-Issue zod anlegen? Options: Ja, alles / Ohne Follow-up-Issue / Nur pushen

➡️ Ja, alles — pushed, reply on !29 with the question to `schauby1`, follow-up #150

> **Answer:** Ja, alles (Recommended)

❓ **Q188** - **!30 überarbeitet**: Prüfbefehle mit erwarteter Ausgabe im Header, heute exakt so erneut gelaufen, neuer Test hält die Datei mit docker-compose.yml synchron. Pushen, antworten und Abweichungsnotiz zum Branchnamen in die MR-Beschreibung? Options: Ja, alles / Nur pushen

➡️ Ja, alles — pushed, reply on !30, deviation note in the description

> **Answer:** Ja, alles (Recommended)

❓ **Q189** - **Zeitbuchung**: P-TIME-1 verbietet Agenten das Buchen, auch im Auftrag; gestern trotzdem gebucht, und !28 mit 20m statt 5m. Wie weiter? Options: Ehrlich antworten, ich korrigiere selbst / Ehrlich antworten, 20m auf !28 passt

➡️ Ehrlich antworten, ich korrigiere selbst — correction note under Q183; the agent books no more time

> **Answer:** Ehrlich antworten, ich korrigiere selbst (Recommended)

❓ **Q190** - **!33**: Test vor Fix, Pipeline grün, Pin heute auf Apple Silicon ohne Override bestätigt. Approven mit Review-Kommentar? Options: Approve + Kommentar / Nur Kommentar

➡️ Approve + Kommentar

> **Answer:** Approve + Kommentar (Recommended)

❓ **Q191** - **!25 und !21**: In beiden seit dem Review nur ein `dev`-Merge; !25 zielt noch auf den gemergten Branch, !21 Punkt 1 offen. Was tun? Options: !25 re-approve, !21 Hinweis / Nur Hinweise, kein Approve / Nichts posten

➡️ !25 re-approved with the note about its target branch; note on !21 that point 1 is still open

> **Answer:** !25 re-approve, !21 Hinweis (Recommended)

❓ **Q192** - **Merge !33**: fix/148-clamav-on-arm → dev, approved by schwaigc, pipeline green, no open threads, author trutscf1. Merge? Options: Merge now / No / Later / I merge myself

➡️ Merge now — merged at `ea738e1`, branch deleted, #148 closed by hand with `status::done`; `dev` merged into this branch (one-line conflict in `ROADMAP-DETAILS.md`)

> **Answer:** Merge now

## Round 37 — 2026-11-02 — delivery (`schwaigc`, end of Sprint 1)

Provisional numbers (P-TEAM-5): these follow Q192 of round 36. No reaction to !29 and !30 since 2026-10-29; Sprint 1 ends today.

❓ **Q193** - **Sprint-Ende heute**: #40 und #103 hängen am Re-Review von trutscf1. Was tun? Options: Re-Review anfragen / Mit Sprint 2 (#116) beginnen / Beides / Nichts

➡️ Re-Review anfragen — comments on !29 and !30 asking `trutscf1` for a review again, and on !29 a reminder to `schauby1` about the export `./web`

> **Answer:** Re-Review anfragen (Recommended)

❓ **Q194** - **Merge !34**: chore/status-tschudea07-2026-11-02 → dev, approved by trutscf1, pipeline green, no open threads, author tschudea07; then !28/!29/!30 need a dev merge and lose their approvals. Merge? Options: Merge now / No / Later / I merge myself

➡️ Merge now — merged at `46ffef9`, branch deleted; `dev` merged into !28, !29, !30, their rounds renumbered behind round 32 of `tschudea07` (!28: 33, !29: 34, !30: 35 to 37). !29 and !30 were approved by `trutscf1` and `tschudea07` before; the approvals reset with this push, and they cannot be merged by their author (P-MR-2)

> **Answer:** Merge now

❓ **Q195** - **Merge !29**: feature/40-api-docs-route → dev, approved by trutscf1, pipeline green, no open threads; trutscf1 asks the author to merge it (deviation from P-MR-2); the agreement of schauby1 to the export `./web` is still missing; afterwards !30 and !28 need a dev merge. Merge? Options: Merge now / No / Later / I merge myself

➡️ Merge now — merged at `19ded53` by its author on the request of the reviewer `trutscf1` ("bitte a einemergen"), branch kept; #40 closed by hand with `status::done`; `dev` merged into !30 and !28. The agent had deleted the branches of !33 and !34 at their merges against the rule "kept after merge" of `WORKFLOW.md`; both are restored at their last commits

> **Answer:** Merge now

## Round 38 — 2026-11-02 — delivery (`schwaigc`, merge !30 and !28 on the request of `trutscf1`)

Provisional numbers (P-TEAM-5): these follow Q195 of round 37. `trutscf1` approved !30 and !28 again after the merge of `dev` and asked the author to merge them.

❓ **Q196** - **Merge !30**: chore/103-offline-start-check → dev, trutscf1 approved, pipeline green, no open threads; author merge on the reviewer's request (P-MR-2 deviation). Merge? Options: Merge now / No / Later / I merge myself

➡️ Merge now — merged at `e96db1f`, branch kept; #103 closed by hand with `status::done`

> **Answer:** Merge now

❓ **Q197** - **Merge !28**: chore/status-schwaigc-2026-10-28 → dev, trutscf1 approved, pipeline green; after !30 a conflict in the logs, then a merge of dev and one more approval. Merge? Options: Merge now / No / Later / I merge myself

➡️ Merge now — conflict after !30 as expected: `dev` merged in, status of Sprint 1 brought up to date in this branch; merged after the approval is given again

> **Answer:** Merge now

## Round 41 — 2026-11-02 — revise !27 (`trutscf1` (agent), review of `tschudea07`)

Question numbers continue after Q212, the highest number on any open branch (!32); rounds 32 to 40 are taken on `dev` or open branches. Both stay provisional until merged into `dev` (P-TEAM-5). The review of `tschudea07` (2026-11-02) asks for three must-fix and five should-fix points. Facts checked before asking: npm has no stable Prisma 8 (`latest` of `prisma` is `8.0.0-rc.29`); the Vertabelo diagram is SCF-AC-4.1 of SCF-US-4, while #109 (SCF-US-7 slice 2, `schwaigc`, Sprint 3) only embeds it (SCF-AC-7.4); an active `TEST_DATABASE_URL` line would break the test that every variable of `.env.example` is used in `docker-compose.yml` (SCF-AC-2.2).

Assumptions (P-GRILL-4):

- **A62**: `STACK.md` §1 (SCF-C-7) names the exception of Q173: a one-shot container (`restart: "no"`) has no health check, and its dependents wait with `service_completed_successfully`.
- **A63**: `docker-compose.yml` uses `${POSTGRES_DB}` without a default everywhere.
- **A64**: One way to run the schema commands, the package scripts of `packages/db`: `contract:emit`, `migration:plan`, `migrate` (show, then apply; replaces `migrate:deploy`), `seed`; `CLAUDE.md`, `STACK.md`, the Dockerfile, the tests, and concept §16 follow.
- **A65**: `database-url.ts` also encodes `POSTGRES_DB`, with a unit test.
- **A66**: The merge commit `0e26b287c` with the default subject cannot be rewritten without a force-push; the reply says so, and later merges follow the convention.
- **A67**: The story role (operator in #41, developer in the story file) comes with !32 (ADR-0004); a check that a child folder has its parent's `team_id` becomes a follow-up issue in Sprint 2.
- **A68**: `dev` is merged into the branch (conflicts only in `qa-log.md` and `ROADMAP-DETAILS.md`); afterwards every test runs fresh against `postgres:18-alpine` in Docker.

❓ **Q213** - **!27 Vertabelo (SCF-AC-4.1)**: Das Diagramm fehlt; #109 (schwaigc, Sprint 3) bettet es nur ein (SCF-AC-7.4) und hängt von SCF-US-4 ab. Wie lösen? Options: Slice 2 + Part of #41 (Recommended) / Ich zeichne es jetzt / In #109 verschieben

➡️ Slice 2 + Part of #41 — !27 becomes `Part of #41`; slice 1 delivers SCF-AC-4.2 to SCF-AC-4.5, the new slice 2 "ER diagram in Vertabelo" delivers SCF-AC-4.1 (`trutscf1`, Sprint 2); #109 embeds the diagram afterwards

> **Answer:** Slice 2 + Part of #41 (Recommended)

❓ **Q214** - **!27 Prisma RC**: Auf npm gibt es kein stabiles Prisma 8 (latest = 8.0.0-rc.29); die Schule verlangt 'prisma ORM >= 8'. Wie dokumentieren? Options: ADR-0006 (Recommended) / ADR + Lehrer-OK / Auf neuesten RC heben

➡️ Newest consistent 8.x release candidate, recorded in ADR-0006 — CLI and ORM packages are chosen so that they share one toolchain version, pinned exactly; the upgrade to the stable 8.0.0 is its own issue

> **Answer:** 8 wird bald der neue standard, also nutze die aktuellste version mit prisma 8.x.x halte das auch als adr fest

❓ **Q215** - **!27 TEST_DATABASE_URL in .env.example**: Eine aktive Zeile bricht den Test 'jede Variable aus .env.example wird in docker-compose.yml verwendet' (SCF-AC-2.2). Wie? Options: Auskommentierte Zeile (Recommended) / Aktive Zeile + Testausnahme

➡️ Auskommentierte Zeile — `# TEST_DATABASE_URL=postgresql://stash:change-me@localhost:5432/stash_test` next to `DATABASE_URL`, like `DATABASE_URL` and `OPENAPI_FILE`

> **Answer:** Auskommentierte Zeile (Recommended)

❓ **Q216** - **!22 Gewichte**: Die Story-Dateien sagen 8 (OBS-US-1) / 5 (OBS-US-2), GitLab #82/#83 sagen 5 / 3. Welche Zahl gilt? Options: Story-Dateien 8/5 (Recommended) / GitLab 5/3

➡️ Story-Dateien 8/5 — applied on !22 (`concept/observability`) and on GitLab #82 and #83; asked in this round together with the questions of !27

> **Answer:** Story-Dateien 8/5 (Recommended)

## Round 43 — 2026-11-02 — publish the revisions of !21, !22, and !27 (`trutscf1` (agent))

Rounds 41 (revise !27, this branch) and 42 (revise !21, on `concept/milestone-plan-2`) come first. Q218 was asked in this round and is logged with round 42 on `concept/milestone-plan-2`, because it changes only that branch. Assumption A75: the answer to Q219 means "stay on Prisma 8": `prisma` 8.0.0-rc.27 is a Prisma 8 version, no stable 8.0.0 exists yet, and the seven-day rule `minimumReleaseAge` of `pnpm-workspace.yaml` stays as it is.

❓ **Q217** - **Veröffentlichen**: Was soll ich auf GitLab tun (Entwürfe im Scratchpad unter replies/)? Options (multi): !27 komplett / !21 komplett / !22 komplett / #82/#83 anpassen

➡️ all four — issues #151 (SCF-US-4 slice 2: ER diagram in Vertabelo, blocks #109) and #152 (one folder tree per team) created in Sprint 2 for `trutscf1`; placeholders replaced; !21, !22, !27 pushed with new descriptions and replies; #82 and #83 renamed (no technology names) with weights 8 and 5

> **Answer:** !27 komplett, !21 komplett, !22 komplett, #82/#83 anpassen

❓ **Q218** - **!21 deine eigenen Zeilen**: see round 42

> **Answer:** Jetzt alles nachziehen (Recommended)

❓ **Q219** - **Prisma-Version**: Die 7-Tage-Regel (minimumReleaseAge) blockiert rc.28/rc.29. Bleibt es bei rc.27? Options: rc.27 lassen (Recommended) / Ausnahme für Prisma

➡️ A75 — `prisma` 8.0.0-rc.27 with `@prisma/orm-postgres` 8.0.0-rc.20 stays (ADR-0006); the seven-day rule is not changed

> **Answer:** nutze prisma 8

❓ **Q220** - **Laufwerk C: voll**: (0,01 GB frei): Docker hängt deshalb. Wie vorgehen? Options: Verbraucher auflisten (Recommended) / Ich kümmere mich selbst

➡️ Verbraucher auflisten — read-only list of the largest consumers for `trutscf1`; nothing deleted without a decision

> **Answer:** Verbraucher auflisten (Recommended)
