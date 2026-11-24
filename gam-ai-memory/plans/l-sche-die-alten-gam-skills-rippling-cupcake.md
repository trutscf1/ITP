# Plan: Globale gam-Skills ersetzen + `/gam-engineering migrate tools`

## Context
Die globalen gam-Skills in `C:\Users\fabit\.claude\skills` sind vom 10.11.2026. Eine neue Version liegt unter `C:\Users\fabit\Downloads\gam-skills (1)\gam-skills` (24.11.2026, neu u. a. `gam-frontend` und mehrere `gam-v-*`-Design/Animation-Skills). Danach soll das Projekt mit `migrate tools` auf den neuen Tooling-Stand gebracht werden (Layout, Tooling, Kurzzeitgedächtnis – Zeilen 2, 5, 7 aus `gam-setup/references/migrate.md`).

## Schritte

0. **Session-Pflicht:** `node gam-engineering/tools/prompt-export.mjs install-hook` (AGENTS.md, Regel 1).
1. **Alte globale Skills löschen** (in `C:\Users\fabit\.claude\skills`):
   - alle Ordner `gam-*` (gam-ai-knowledge … gam-v-writing-for-agents, inkl. gam-sonar)
   - den alten Sammelordner `gam-skills\`
   - Nicht-gam-Skills (apple-design, tdd, grilling, …), `.trash`, `synced` bleiben unberührt.
2. **Neue Skills kopieren:** jeden Ordner aus `Downloads\gam-skills (1)\gam-skills\` direkt nach `C:\Users\fabit\.claude\skills\` (`Copy-Item -Recurse`), inkl. der Weiterleitungs-Stubs `engineering-human` und `humanengineering`.
   - Prüfen: Ordneranzahl = 47, jeder hat `SKILL.md`.
3. **Working Tree sichern:** die 70 gestagten Änderungen auf `fix/157-clean-web-image` mit `git stash push -m "pre-migrate-tools fix/157"` sichern (laut Antwort des Users).
4. **`/gam-engineering migrate tools` ausführen** (Skill-Tool, `gam-engineering` mit `migrate tools`) – Ablauf vollständig nach dem Skill: Inventar, eine Bestätigung per AskUserQuestion, Branch `chore/migrate-gam-engineering` von `dev`, Änderungen, Checks, MR. Hinweis: Die Projektkopie in `.claude/skills/gam-*` wird dabei vom Skill selbst aktualisiert, falls vorgesehen.
5. **Zurück:** nach Abschluss `git switch fix/157-clean-web-image` und `git stash pop`; Konflikte melden, nicht automatisch auflösen.

## Verification
- `Get-ChildItem ~/.claude/skills -Directory -Filter gam-*` zeigt nur neue Ordner (Datum 24.11.2026), `gam-frontend` vorhanden, kein `gam-skills\`.
- Nach migrate: `node gam-ai-knowledge/tools/doc-check.mjs` und `npx markdownlint-cli2 "gam-ai-knowledge/**/*.md"` grün; MR-Link der Migration.
- `git stash list` leer, `git status` auf fix/157 zeigt wieder die 70 gestagten Änderungen.

## Hinweis
Unter den gestagten Änderungen sind Löschungen von Prompt-Exporten in `docs/prompts/` – diese fasse ich nicht an (Regel 5), weise aber am Ende darauf hin.
