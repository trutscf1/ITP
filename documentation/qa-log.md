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

## Round 11 — 2026-10-20 — delivery (`schwaigc`, plan of the R1 track Web)

The MRs of round 10 wait for reviews; the next task of `schwaigc` is chosen. Q42 and Q43 of round 10 are on `feature/106-contrast-and-storybook` (!9).

❓ **Q44** - **Nächster Task**: Die MRs sind merge-fertig und warten auf Reviews. Womit soll ich bei deinen Tasks anfangen? Options: R1 Track-Web-Plan / R6 Web-Client grillen / R4 Rest grillen / Shared #39/#40/#103

➡️ R1 Track-Web-Plan

> **Answer:** R1 Track-Web-Plan (Recommended)

❓ **Q45** - **Issue und Branch**: Issue „R1 track Web: plan of the web unit“ (type::concept, schwaigc, Sprint 1, Gewicht 1) und Branch `concept/scaffolding-track-web`, gestapelt auf !13 (Merge-Reihenfolge !13 → dieser MR)? Options: Ja, so anlegen / Ohne neues Issue / Auf dev statt auf !13

➡️ Ja, so anlegen — issue #113

> **Answer:** Ja, so anlegen (Recommended)

❓ **Q46** - **Annahmen für den Plan**: A1 Statusseite unter `/status` (Server-Seite, ohne Cache, U-3). A2 Abfrage pro Unit mit Timeout `HEALTH_TIMEOUT_MS` (2000); ein Body, der kein HealthReport der richtigen Unit ist, gilt als down (E-3), egal welcher HTTP-Status. A3 Health-URLs der Units als Konfiguration im Web-Config-Contract (contracts/web), Defaults aus der Routing-Tabelle §8. A4 STACK.md §4: SCF-C-3 = Next.js 16.3 (App Router), SCF-C-13 = Playwright 1.63. A5 `apps/web/src/prisma` bleibt unberührt, offener Punkt für SCF-US-4. Options: Alle ok / Einzelne ändern

➡️ Alle ok

> **Answer:** Alle ok (Recommended)
