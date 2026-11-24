# Plan: Issue-Agenten + eigener Merge-Agent bis 16:50 (2026-11-24)

## Context

`trutscf1` will bis 16:50 (Start ca. 13:35, ~3 h 15 min) zwei getrennte Rollen laufen lassen:

1. **Issue-Agenten** arbeiten die eigenen Issues ab (je Issue ein Agent, Worktree, Branch, MR).
2. **Ein Merge-Agent** macht nur zwei Dinge: Change Requests in offenen MRs ausbessern und – sobald ein Teammitglied approved – mergen.

Entscheidungen (Pop-ups Q341–Q344):
- Q341: „wenn meine Mitglieder es approven, dann mergen, die Issues arbeiten andere Agenten ab" → keine Einzelauswahl; Annahme **A1**: alle agententauglichen eigenen Issues mit Status ready/in-progress/backlog-klein (siehe unten).
- Q342: **Auto-merge bei Approve** für diesen Lauf (Abweichung von `GAM_ENGINEERING_MERGE=ask`, P-MR-4) – befristet bis 16:50 heute.
- Q343: Gestagte Änderungen im Hauptcheckout (`fix/157-clean-web-image`, 68 Dateien) **nicht anfassen**; alle Agenten arbeiten nur in Worktrees.
- Q344: **!69 behalten, !67 schließen** (Duplikat für #164).

Reviewer nur `tschudea07` oder `schwaigc`, nie `schauby1` (Memory).

## Struktur

```
Session (Opus, Orchestrator; hält Pop-ups, Status-Dateien, Zeitlimit)
├── Issue-Agent #78   (sonnet, background, isolation: worktree)
├── Issue-Agent #81   (sonnet, background, isolation: worktree)
├── Issue-Agent #165  (sonnet, background, isolation: worktree)
│     └── #107 startet erst, wenn #78 gemergt ist (blockiert)
└── Merge-Agent       (sonnet, background, eigener Worktree, Polling-Schleife bis 16:50)
```

## Schritt 0 – Sessionstart (Session selbst)

1. `node gam-engineering/tools/prompt-export.mjs install-hook` (AGENTS.md-Regel).
2. Q341–Q344 + Antworten wörtlich in `docs/prompts/trutscf1/manual/2026-11-24.md` (Mode `local`).
3. Baseline-Suite auf `origin/dev` von einem Haiku-Subagent in einem Wegwerf-Worktree (implement-all Gate 4). Rot → stoppen und melden.
4. `GITLAB_TOKEN` gesetzt (bereits geprüft: ja).

## Schritt 1 – Issue-Agenten (gam-delivery `implement-all`, angepasst)

Frontier (A1):
| Issue | Titel | Hinweis |
| --- | --- | --- |
| #78 | PUB-US-1 Headless CMS | in-progress; Branch `feature/78-headless-cms` existiert – Agent setzt dort fort, merged `dev` zuerst ein |
| #81 | PUB-US-4 Legal pages | ready |
| #165 | OBS-AC-1.1 cms Startnachweis | backlog, w1 – vorher auf `status::ready` |
| #107 | PUB-US-1 slice 2 | **zweite Welle**, blockiert durch #78 |

Nicht dabei: #151 (Vertabelo, nur von Hand), #152/#164 (schon MRs → Merge-Agent), Konzept-/Release-Issues.

Pro Issue: Label `status::in-progress`, dann Agent-Tool `model: sonnet`, `run_in_background: true`, `isolation: "worktree"`. Brief nur mit Kontext-Zeigern (Issue-Nr., Story-Datei unter `gam-ai-knowledge/work-items/`, Konzept `concepts/public-content.md` bzw. `concepts/observability.md`, `~/.claude/skills/gam-delivery/references/implement-all.md` + `implement.md`, Notizordner im Scratchpad) und dem Satz zu P-WS-10. Regeln aus implement-all Schritt 2: kein Push, kein MR, keine Status-Dateien, `dev` vor „DONE" einmergen, Bericht nach `<scratchpad>/notes/reports/<issue>.md`.

Wenn ein Agent DONE meldet, macht die **Session**: Status-Commit, Push, MR via `gam-v-pr` (Reviewer `schwaigc` oder `tschudea07`), `status::review`, eine `review` in der Session. Ab dann gehört der MR dem Merge-Agent.

Fragen der Agenten (NEEDS_CONTEXT/BLOCKED) → Session stellt sie als `Q<n>`-Pop-up; max. 2 Versuche pro Issue.

Hartes Zeitlimit: **ab 16:15 keine neuen Issue-Agenten**; um 16:35 bekommt jeder laufende Agent per SendMessage „sauber committen, WIP melden"; unfertige Arbeit → `wip/<issue>-<slug>`-Branch (gam-delivery `stopp`).

## Schritt 2 – Merge-Agent

Ein einziger Hintergrund-Agent (`model: sonnet`, `isolation: "worktree"`), Brief zeigt auf `gam-delivery/references/revise.md` und `merge.md` und `gam-engineering/agents/issue-tracker.md`. Scope: offene MRs von `trutscf1` mit Ziel `dev` – heute !63 (#152), !69 (#164) und jeder MR, den die Session in Schritt 1 neu öffnet (Session schickt neue MR-Nummern per SendMessage). Ein MR für #157 wird **nicht** aus dem Hauptcheckout erzeugt (Q343).

Einmalig zu Beginn: !67 mit Kommentar „Ersetzt durch !69" schließen (Q344).

Schleife alle ~5 min bis 16:45:
1. `GET merge_requests?state=opened&author_username=trutscf1` → pro MR:
2. **Konflikt** (`detailed_merge_status=conflict`): MR-Branch auschecken, `origin/dev` einmergen, Konflikte lösen (`pnpm-lock.yaml` nur per `pnpm install`), Suite + `doc-check` laufen lassen, pushen.
3. **Offene Review-Threads / Change Requests**: `revise.md` befolgen – jeden Punkt prüfen (gam-v-receiving-code-review), fixen mit Test, im Thread antworten, pushen. Unklare/abgelehnte Punkte nicht raten → als Frage an die Session melden.
4. **Approve-Check** (`/approvals`): ≥1 Approve von jemand anderem als `trutscf1`, Pipeline grün, keine ungelösten Threads, kein Konflikt → **merge** per `PUT …/merge {squash:false, should_remove_source_branch:false}` (Q342-Auto-Merge), danach sofort Status-Nachzug nach `merge.md` Schritt 4 (Issue `status::done`/schließen, `STATUS.md`-Zeile, ROADMAP-DETAILS-Log) als eigener Doc-Commit über einen MR? → **Nein:** der Agent meldet die Merge-Nummer an die Session; die Session sammelt den Status-Nachzug und liefert ihn am Ende in **einem** Status-MR (P-ROAD-4), damit der Merge-Agent keine Status-Dateien parallel zu Issue-Agenten schreibt.
5. Nie force-push, nie mergen ohne Approve, nie `dev`/`main` direkt.

Nach jedem Durchlauf liefert der Agent eine Zeile pro MR (Zustand + Aktion) an die Session (SendMessage-Antwort / Ergebnis-Datei `<scratchpad>/notes/merge-log.md`).

Hinweis zu Rechten: Merges laufen per REST (`curl`), nicht `git merge`/`glab mr merge`, daher greift die `ask`-Permission in `.claude/settings.json` nicht; Pushes aus dem Hintergrund-Agent können einen Permission-Prompt auslösen – falls ja, vor dem Start einmal erlauben.

## Schritt 3 – Abschluss 16:45–16:50

1. Session sammelt: gemergte MRs, offene MRs, WIP-Branches, Fragen.
2. Ein Status-MR `docs(repo): status after the run of 2026-11-24 [no-req]`: `STATUS.md`-Zeilen, ROADMAP-DETAILS-Log, Abweichung Q342 (Auto-Merge bis 16:50) in `gam-ai-knowledge/WORKFLOW.md` mit Verweis auf P-MR-4; Inbox-Einträge aus „Noticed, not touched".
3. Nur eigene Worktrees dieses Laufs entfernen (ohne `--force`).
4. `/gam-ai-memory handover`; `prompt-export.mjs export --stage` und Commit von `docs/prompts/trutscf1` vorschlagen.

## Verifikation

- Je Issue-MR: Suite grün im Worktree (Bericht mit frischem Output), `node gam-ai-knowledge/tools/doc-check.mjs` grün, GitLab-Pipeline grün.
- Merge-Agent: `merge-log.md` zeigt für jeden Merge Approver-Name + Pipeline-Status vor dem Merge; `GET …/merge_requests/<iid>` → `state=merged`.
- Am Ende: `git fetch && git log origin/dev --oneline -10` zeigt die Merges; kein Force-Push im Reflog der Remote-Branches; Hauptcheckout-Staging unverändert (`git diff --cached --stat` = 68 Dateien).
