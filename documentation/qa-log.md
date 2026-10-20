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

The MRs !5, !7, !9 wait for reviews; the next task of `schwaigc` is chosen. The merge round before it (provisional Q42 and Q43) is on `feature/106-contrast-and-storybook` (!9) and is renumbered when !9 reaches `dev` (P-TEAM-5).

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

## Round 10 — 2026-10-20 — milestone plan (`trutscf1`)

Planning of the sprints and milestones on the dates set by the team: Sprint 1 2026-11-03, Sprint 2 2026-11-24, Sprint 3 2027-01-12, Sprint 4 2027-01-26, Sprint 5 2027-02-23, Sprint 6 2027-03-16, final presentation 2027-04-06; each milestone ends one day earlier. Assumptions: A21 the dates are the review Tuesdays and the milestone due date is the Monday before; A22 school holidays as in `WORKFLOW.md` (to be corrected at sprint planning); A23 one story point is 0.75 h of human work.

❓ **Q34** - **Konzept-Takt**: Wann entstehen die Konzepte (Phase 1–6, inkl. Test-Konzept §17) im Verhältnis zur Umsetzung? Options: Einen Sprint voraus (Recommended) / Alle Konzepte zuerst / Parallel pro Feature

➡️ Also immer konzept und dann wenn ein sprint (=milestone) abgeschlossen ist wird daraus der komplette code generiert. Bedenke dass wir schüler sind und nur jeden sienstafg 200min arbeiten können und wenn ferien sind nicht. also heute am ende soll der erste milestone zum großteil abgeschlossen sein, damit wir den code generieren können

> **Answer:** Other (free text, quoted above)

❓ **Q35** - **TDD-Durchsetzung**: Wie streng wird 'erst Tests, dann Code' im Prozess verankert? Options: DoD + MR + ID-Check (Recommended) / Nur DoD + MR-Template / Zusätzlich CI-Reihenfolgeprüfung

➡️ DoD + MR + ID-Check (Recommended)

> **Answer:** DoD + MR + ID-Check (Recommended)

❓ **Q36** - **Nachweis 'aus Markdown generierbar'**: Wie wird das Ziel am Ende belegt? Options: Regenerations-Probe (Recommended) / Nur Rückverfolgbarkeit / Probe nur im Sprint 6

➡️ Regenerations-Probe (Recommended)

> **Answer:** Regenerations-Probe (Recommended)
