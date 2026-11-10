# Prompt: KI-Chats beim Commit ins Projekt exportieren

So verwendest du diese Datei: Kopiere alles unter der Linie in den Chat deines KI-Werkzeugs (Claude Code, Codex, Gemini CLI, GitHub Copilot im Agent-Modus, Cursor …). Starte den Chat im Hauptordner eures Git-Repos. Der Prompt braucht keine weiteren Skills oder Vorlagen.

Bevor ihr ihn einsetzt:

- **Öffentliches Repo?** Klärt mit eurer Lehrkraft, ob eure Chats öffentlich sichtbar sein dürfen. Sonst nehmt ein privates Repo oder den Modus `local`.
- **Der Hook wird auf jedem Rechner einzeln aktiviert.** Das erledigt die KI selbst: beim Einbau und danach zu Beginn jeder Sitzung, also auch bei allen anderen im Team, sobald sie im Repo mit einer KI arbeiten. Nur wenn die KI den Befehl nicht ausführen kann, nennt sie ihn euch. Dann führt ihr einmal `node scripts/prompt-export.mjs install-hook` aus (oder `npm install`, falls ihr ein `package.json` habt). Sonst werden eure Chats nicht exportiert.
- **Vor der Abgabe** braucht es einen letzten Export, denn alles, was ihr nach dem letzten Commit mit der KI besprecht, fehlt sonst im Repo. Die KI bietet das von selbst an, sobald ihr sagt, dass ihr abgebt.
- **Chats im Browser** (claude.ai, ChatGPT, Gemini …) findet das Skript nicht. Die legt ihr selbst als Link oder Kopie in `docs/prompts/<name>/manual/` ab. Die KI hilft dabei.
- **Kein Beweis:** Die exportierten Dateien sind normale Textdateien. Sie zeigen, wie ihr gearbeitet habt, aber man kann sie ändern. Ändert sie nicht von Hand.

---

Baue in dieses Git-Repository einen Export meiner KI-Chats ein. Halte dich genau an diese Vorgaben und frag nach, bevor du davon abweichst.

## Ziel

Bei jedem `git commit` werden die Chat-Sessions aller KI-Werkzeuge, die ich in diesem Repo verwendet habe, mit **allen meinen Interaktionen** (Prompts, Pop-up-Antworten, Freigaben, Ablehnungen) als lesbare Markdown-Dateien ins Repo geschrieben und mit demselben Commit eingecheckt. Daraus muss man später nachvollziehen können, was ich der KI gesagt und wie ich entschieden habe. Jedes Teammitglied exportiert nur die eigenen Chats von seinem eigenen Rechner.

## Dateien

1. `scripts/prompt-export.mjs`: Node.js, **keine npm-Abhängigkeiten**, nur Node-Bordmittel. Für SQLite verwendest du das eingebaute `node:sqlite` (ab Node 22.13), lädst es per dynamischem `import()` und überspringst SQLite-Quellen mit einer Warnung, wenn es fehlt.
2. `.githooks/pre-commit`: ruft `node --no-warnings scripts/prompt-export.mjs export --stage || true` auf. Der Hook darf einen Commit **nie** verhindern.
3. `scripts/prompt-export.json`: `{ "mode": "commit" }`. Erlaubte Werte:
   - `commit` (Standard): Export ins Repo und `git add` nur auf den eigenen Ordner.
   - `local`: Export nur lokal, `/docs/prompts/` kommt in `.gitignore`, kein `git add`.
   - `off`: Es wird nichts exportiert.
4. Falls es ein `package.json` gibt: `"prepare": "node scripts/prompt-export.mjs install-hook"` bei den Scripts eintragen. Ein vorhandenes `prepare` wird ergänzt, nicht ersetzt.
5. Ein kurzer Abschnitt *KI-Chat-Export* in der `README.md`: was exportiert wird, wie der Hook aktiviert wird, wie man den Modus ändert, was vor der Abgabe zu tun ist, wohin Web-Chats kommen und wo die Grenzen liegen (`git commit --no-verify` und Commits über die Web-Oberfläche exportieren nichts; die Dateien sind änderbar und daher kein Beweis).
6. Frag mich, ob du zusätzlich einen CI-Job anlegen sollst (`.github/workflows/prompt-export-check.yml` oder ein Job in `.gitlab-ci.yml`, je nach `origin`), der `node scripts/prompt-export.mjs check` ausführt. Der Job ist nur ein Hinweis und darf die Pipeline nie rot machen.

## Befehle des Skripts

- `export [--stage]`: Liest alle Quellen, schreibt eine Datei pro Session nach `docs/prompts/<name>/<werkzeug>/<JJJJ-MM-TT>-<session-id>.md`. `<name>` ist `git config user.name` in Kleinbuchstaben, Umlaute vereinfacht, alles andere als `-`. Ist `user.name` leer, nimmst du den Benutzernamen des Betriebssystems. Gibt es `docs/prompts/<name>/owner.json` schon mit einem anderen Benutzernamen als meinem, heißt mein Ordner `<name>-<benutzername>`. In meinem Ordner steht `owner.json` mit `{ "name", "platform", "username" }`. Jede Datei wird bei jedem Lauf komplett neu gebaut, aber nur geschrieben, wenn sich ihr Inhalt geändert hat. **Exporte schrumpfen und verschwinden nie:** Das Skript löscht keine Exportdatei, auch wenn die Quelle weg ist. Hat die neu gebaute Fassung weniger Runden als die vorhandene Datei (Vergleich über die Zeile `Runden` im Dateikopf), weil das Werkzeug die Session gekürzt, komprimiert oder gelöscht hat, bleibt die vorhandene Datei unverändert. Mit `--stage` und Modus `commit` folgt `git add -- docs/prompts/<name>`.
- `install-hook`: Ist `core.hooksPath` leer, wird es auf `.githooks` gesetzt. Gibt es schon einen Hook-Ordner (z. B. `.husky`) oder ein `.git/hooks/pre-commit`, wird nur die Aufrufzeile angehängt. Ist die Zeile schon vorhanden (Markierungskommentar `# prompt-export`), ändert der Befehl nichts. Liegt der Hook-Ordner im Repo (nicht unter `.git/`), ergänzt der Befehl in `.gitattributes` die Zeile `<ordner>/* text eol=lf` (z. B. `.githooks/* text eol=lf`), damit Klone mit `core.autocrlf=true` den Hook nicht mit Windows-Zeilenenden auschecken. Die Hook-Datei bekommt das Ausführungsrecht (`chmod +x`, im Git-Index Modus `100755`), damit sie auch unter macOS und Linux läuft. Am Ende gibt der Befehl eine Zeile aus: `prompt-export: hook installed (<pfad>)` oder `prompt-export: hook already active (<pfad>)`.
- `install-hook` ermittelt außerdem meinen Benutzernamen auf GitHub oder GitLab und speichert ihn nur lokal: `git config prompt-export.username <name>` und `git config prompt-export.platform <github|gitlab>`. Ist beides schon gesetzt, passiert nichts. Sonst in dieser Reihenfolge: Plattform aus der `origin`-URL lesen; `gh api user --jq .login` bzw. `glab api user` aufrufen (höchstens 5 Sekunden, Fehler still übergehen); das Muster der Noreply-Adresse in `user.email` auswerten (`<id>+<name>@users.noreply.github.com`, `<id>-<name>@users.noreply.<gitlab-host>`). Findet er nichts, gibt er `prompt-export: username unknown` aus. Mit `install-hook --username <name> [--platform <github|gitlab>]` setzt man den Wert von Hand. Der Commit-Hook selbst macht nie Netzwerkzugriffe.
- `check [--strict]`: Listet alle Commit-Autoren des Repos auf und zeigt, für wen es einen Ordner unter `docs/prompts/` gibt und von wann die jüngste Exportdatei ist. Autoren ohne Ordner werden als Hinweis ausgegeben (wer keine KI verwendet, hat zu Recht keinen). Exit-Code 0, nur mit `--strict` 1 bei fehlenden Ordnern.

## Hook aktivieren: Das machst du selbst

Der Hook wirkt nur auf dem Rechner, auf dem `install-hook` gelaufen ist. Deshalb gilt:

1. **Du führst `node scripts/prompt-export.mjs install-hook` selbst aus**, sobald das Skript fertig ist. Bitte mich nicht, das zu tun, und frag dafür nicht extra nach.
2. **Du prüfst das Ergebnis:** `git config core.hooksPath` zeigt auf den Hook-Ordner, und im aktiven `pre-commit` steht die Zeile mit `# prompt-export`.
   Meldet der Befehl `username unknown`, fragst du mich einmal nach meinem Benutzernamen auf GitHub oder GitLab und setzt ihn mit `install-hook --username <name>`.
3. **Nur wenn das nicht geht**, weil du keine Befehle ausführen kannst, ich die Ausführung ablehne oder der Befehl fehlschlägt (z. B. Node fehlt oder ist älter als 22.13), sagst du mir den Grund und bietest mir den Befehl zum Kopieren an: `node scripts/prompt-export.mjs install-hook` (oder `npm install`, falls es ein `package.json` gibt). Sag dazu, dass meine Chats sonst nicht exportiert werden. Frag danach, ob ich ihn ausgeführt habe, und prüfe es wie in Punkt 2, falls du lesen kannst.
4. **Damit das auch bei allen anderen im Team passiert**, steht diese Regel in den Agent-Anweisungen des Repos (Abschnitt *Regeln für die Agent-Anweisungen* weiter unten).

## Quellen (ein Adapter pro Werkzeug)

Jeder Adapter liefert dasselbe Format: `{ tool, sessionId, startedAt, title, model, messages: [{ role: "user" | "assistant", text, ts }] }`. Eine Session gehört nur dann zu diesem Repo, wenn ihr Arbeitsordner (`cwd`) das Repo oder ein Unterordner davon ist. Vergleiche Pfade normalisiert: absolut, `/` statt `\`, ohne Schrägstrich am Ende, unter Windows in Kleinbuchstaben. Git-Worktrees (`git worktree list --porcelain`) zählen mit.

| Werkzeug | Ablage | Format und Zuordnung |
| --- | --- | --- |
| Claude Code | `~/.claude/projects/<Repo-Pfad, jedes Nicht-Alphanumerische als ->/*.jsonl` | Eine Zeile pro Ereignis. `type` ist `user` oder `assistant`, Text in `message.content` (String oder Liste von `{type:"text"}`). Zeilen mit `isSidechain` oder `isMeta` überspringen. `cwd` steht in jeder Zeile. Interaktionen: **Pop-ups** stehen in der `user`-Zeile mit `toolUseResult.questions` (Frage, `options[].label`) und `toolUseResult.answers` (`{ Fragetext: Antwort }`, Notizen in `annotations`). **Plan-Freigabe**: `toolUseResult.plan` zum Tool `ExitPlanMode`. **Abgelehnter Tool-Aufruf**: `tool_result` mit `is_error` und Text ab `The user doesn't want to proceed`, die Begründung folgt nach `the user said:`. **Erlaubnis durch mich**: `permissionDecision` mit `decision: "accept"` und `source` `user_temporary` oder `user_permanent` (nicht `config`). **Nachrichten während der Arbeit**: Zeilen `type: "attachment"` mit `attachment.type: "queued_command"`, Text in `attachment.prompt`. Tool-Name und Befehl holst du aus dem `tool_use` mit derselben ID. |
| Codex CLI | `~/.codex/sessions/JJJJ/MM/TT/rollout-*.jsonl` | Erste Zeile `session_meta` mit `payload.cwd`. Nachrichten sind `payload.type === "message"` mit `role` und `content[].text`. |
| Gemini CLI | `~/.gemini/tmp/<sha256 des Repo-Pfads>/chats/*.json` | `messages[]` mit `type` `user` oder `gemini`. Ältere Versionen haben nur `logs.json` mit den Prompts. Berechne den Hash für mehrere Schreibweisen des Pfads (`/` und `\`, Laufwerksbuchstabe groß und klein). |
| GitHub Copilot (VS Code) | `<VS-Code-User>/workspaceStorage/<hash>/chatSessions/*.jsonl` (ältere Versionen: `*.json`) | Die JSONL-Datei ist ein Änderungsprotokoll: `kind 0` setzt das ganze Objekt, `kind 1` setzt den Wert am Pfad `k`, `kind 2` hängt `v` an die Liste am Pfad `k` an (mit `i`: vorher auf Länge `i` kürzen), `kind 3` löscht. Nachspielen, dann `requests[]` lesen: `message.text` ist der Prompt, die Antwort sind die Teile von `response` ohne `kind` oder mit `kind: "markdownContent"`. `inlineReference` wird zum Dateinamen in Backticks. Interaktionen: **Rückfragen** (`ask_questions`) stehen in `result.metadata.toolCallRounds[].toolCalls` (Argumente als JSON), die Antworten in `result.metadata.toolCallResults[<id>].content[].value` (`{ answers: { <header>: { selected, freeText, skipped } } }`). **Bestätigungen**: Antwortteile `toolInvocationSerialized` mit `isConfirmed.type` 0 (abgelehnt), 3 (für die Sitzung erlaubt), 4 (erlaubt), 5 (übersprungen); 1 und 2 brauchten keine Bestätigung von mir. **Terminal-Rückfragen**: `elicitationSerialized` mit `state`. Zuordnung über `workspace.json` (`folder` als `file://`-URI) im selben Ordner. |
| GitHub Copilot CLI | `~/.copilot/session-state/**` | JSONL-Ereignisse `user.message` und `assistant.message` mit `data.content`. Das `cwd` steht irgendwo in den Ereignissen, rekursiv suchen. |
| Cursor | `<Cursor-User>/workspaceStorage/<hash>/state.vscdb` und `globalStorage/state.vscdb` (SQLite) | `ItemTable`-Schlüssel `workbench.panel.aichat.view.aichat.chatdata` (Tabs mit `bubbles`) und `composer.composerData` (`allComposers`). Details in der globalen DB unter `cursorDiskKV` mit `composerData:<id>` bzw. `bubbleId:<id>:<bubble>`. Die DB immer erst in einen Temp-Ordner kopieren (inkl. `-wal`) und `readOnly` öffnen, weil der Editor sie sperrt. |
| Gemini Code Assist / Antigravity | VS-Code-`state.vscdb`, Schlüssel mit `gemini` oder `cloudcode` | Nur best effort. Antigravity speichert seine Gespräche verschlüsselt (`~/.gemini/antigravity/conversations/*.pb`). Dafür nur eine Warnung ausgeben, nicht exportieren. |
| Aider | `.aider.chat.history.md` im Hauptordner des Repos | Markdown. Eine Zeile `# aider chat started at <Zeit>` beginnt eine Session. Zeilen, die mit `####` und einem Leerzeichen beginnen, sind meine Prompts, der Text dazwischen ist die Antwort. Zeilen, die mit `>` beginnen, sind Tool-Meldungen und bleiben draußen. |
| OpenCode | `~/.local/share/opencode/` (JSON-Dateien unter `storage/` oder eine SQLite-DB, je nach Version) | Nur best effort. Sessions, deren `directory` zum Repo gehört; Nachrichten mit `role`, Text in den Teilen mit `type: "text"`. |
| Windsurf | `~/.codeium/windsurf/cascade/*.pb` | Nicht lesbar gespeichert. Nur eine Warnung ausgeben, nicht exportieren. |
| GitHub Copilot (JetBrains) | `~/.config/github-copilot/` bzw. `%LOCALAPPDATA%/github-copilot/` (Binär-Datenbank pro IDE) | Nur eine Warnung ausgeben, nicht exportieren. |

`<VS-Code-User>` ist unter Windows `%APPDATA%/Code/User`, unter macOS `~/Library/Application Support/Code/User` und unter Linux `~/.config/Code/User`. Für Cursor gilt dasselbe mit `Cursor` statt `Code`.

**Varianten von VS Code:** Durchsuche dieselben Pfade auch mit `Code - Insiders` und `VSCodium` statt `Code`.

**WSL, Dev-Container und Remote-SSH:** Dort steht in `workspace.json` eine URI wie `vscode-remote://wsl+Ubuntu/home/…`, `vscode-remote://ssh-remote+<host>/…` oder `vscode-remote://dev-container+<hex>/workspaces/…`. Vergleiche dann den Pfadteil nach dem Host (URL-dekodiert) mit dem Repo-Pfad. Behandle `C:\x` und `/mnt/c/x` als denselben Pfad. Läuft das Skript in WSL (`WSL_DISTRO_NAME` gesetzt), durchsuche zusätzlich den VS-Code- und Cursor-Speicher von Windows unter `/mnt/c/Users/*/AppData/Roaming/`. Läuft es in einem Dev-Container oder über SSH, ist der Editor-Speicher des eigenen Rechners nicht erreichbar: Gib dann einmal `prompt-export: editor storage not reachable (remote session)` aus. Für diese Chats gilt die Regel zum Selbst-Protokollieren weiter unten.

**Modell:** `model` ist der Modellname, wenn die Quelle ihn enthält (z. B. Claude Code `message.model`, Copilot `requests[].modelId`, Codex im Ereignis `turn_context`). Wechselt das Modell in einer Session, nennst du alle.

**Formate ändern sich.** Die Tabelle beschreibt den Stand, den ich kenne. Liegt auf diesem Rechner eine echte Datei eines Werkzeugs, sieh dir vor dem Schreiben des Adapters ihren Aufbau an (nur Schlüssel und Struktur, keine Inhalte ausgeben) und richte dich danach. Weicht sie von der Tabelle ab, sag es mir.

## Was in die Dateien kommt

- **Jede Interaktion mit mir, lückenlos:** meine Prompts, Nachrichten, die ich schreibe, während du arbeitest, jede Pop-up-Frage mit Optionen und meiner wörtlichen Antwort, Plan-Freigaben, erlaubte und abgelehnte Tool-Aufrufe (mit Begründung) und die Text-Antworten. Schreib sie in der Reihenfolge, in der sie passiert sind, als eigene Blöcke `### <n>. Questions` und `### <n>. Interaction`, z. B. `❓ Frage` / `(Optionen: …)` / `✅ "Antwort"`, `⛔ Abgelehnt: Bash: git push` / `Begründung: …`, `🔐 Erlaubt (einmal): Bash: npm test`, `📋 Plan freigegeben: …`.
- **Was der Speicher eines Werkzeugs nicht enthält, protokollierst du selbst.** Das gilt für Codex, Gemini CLI, Gemini Code Assist, die Copilot CLI, Cursor, Aider und OpenCode bei allem außer Prompts und Antworten, und für Antigravity, Windsurf, Copilot in JetBrains und Editor-Chats in Dev-Containern oder über SSH ganz: Du hängst jede Frage an mich, jede Antwort und jede Freigabe sofort wörtlich an `docs/prompts/<name>/manual/<JJJJ-MM-TT>.md` an. Das Skript überschreibt diesen Ordner nie. Schreib diese Regel auch in die Agent-Anweisungen des Repos (Abschnitt *Regeln für die Agent-Anweisungen*), damit jede künftige Sitzung sie kennt.
- **Web-Chats:** Was ich im Browser mit einer KI bespreche (claude.ai, ChatGPT, Gemini, Copilot im Web), findet das Skript nicht. Dafür gibt es `docs/prompts/<name>/manual/web-<JJJJ-MM-TT>-<thema>.md` mit Werkzeug, Datum, Freigabe-Link (falls vorhanden) und meinen Prompts im Wortlaut. Erwähne ich einen solchen Chat oder füge ich etwas daraus ein, erinnerst du mich daran und bietest an, die Datei anzulegen.
- **Bilder und Anhänge** in meinen Prompts werden zu Platzhaltern: `[Bild]`, `[Datei: <name>]`. Ihr Inhalt kommt nie hinein.
- **Nie hinein:** Tool-Ausgaben, Dateiinhalte, „thinking“.
- Eingeschleuste Blöcke aus Prompts entfernen: `<system-reminder>`, `<ide_…>`, `<environment_context>`, `<user_instructions>`, `<local-command-stdout>`.
- **Geheimnisse maskieren** mit `[redacted]`: private Schlüssel, `sk-…`, `ghp_…`, `github_pat_…`, `glpat-…`, `xox…-`, `AKIA…`, `AIza…`, JWTs und Werte nach `password=`, `token:`, `api_key=` usw. E-Mail-Adressen werden zu `[email]`, der eigene Home-Pfad wird zu `~`.
- Aufbau einer Datei: `# <Titel oder erster Prompt, max. 80 Zeichen>`, darunter eine Liste mit Werkzeug, Modell (falls bekannt), Session-ID, Startzeit, Autor (`user.name`), Benutzername (`github: <name>` bzw. `gitlab: <name>`, falls bekannt) und `Runden: <Anzahl>`. Dann pro Runde `## <n>. Prompt (<Zeit>)` und `### <n>. Answer`. Jeder Text steht in einem `text`-Codeblock, dessen Zaun länger ist als die längste Backtick-Folge im Text. So zerbricht Chat-Inhalt nie das Markdown, und markdownlint bleibt ruhig.

## Regeln für die Agent-Anweisungen

Schreib den folgenden Block unter der Überschrift *KI-Chat-Export* in die Agent-Anweisungen des Repos: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/`, was es gibt. Gibt es keine, legst du `AGENTS.md` an und zusätzlich die Datei, die dein eigenes Werkzeug liest, falls das eine andere ist. Steht der Block schon drin, aktualisierst du ihn, statt ihn doppelt einzutragen.

> 1. **Hook:** Zu Beginn jeder Sitzung in diesem Repo führst du `node scripts/prompt-export.mjs install-hook` aus, ohne nachzufragen. Der Befehl ändert nichts, wenn der Hook schon aktiv ist. Nur wenn du ihn nicht ausführen kannst oder er fehlschlägt, nennst du der Person den Grund und den Befehl (`node scripts/prompt-export.mjs install-hook` oder `npm install`) und sagst dazu, dass ihre Chats sonst nicht exportiert werden. Meldet der Befehl `username unknown`, fragst du einmal nach dem Benutzernamen auf GitHub oder GitLab und setzt ihn mit `install-hook --username <name>`.
> 2. **Selbst protokollieren:** Was der Speicher deines Werkzeugs nicht enthält (Rückfragen, Antworten darauf, Freigaben, Ablehnungen), hängst du sofort wörtlich an `docs/prompts/<name>/manual/<JJJJ-MM-TT>.md` an.
> 3. **Vor der Abgabe:** Sagt die Person, dass sie fertig ist oder abgibt, führst du `node scripts/prompt-export.mjs export --stage` aus und schlägst einen Commit von `docs/prompts/<name>` vor. Sag dazu, dass alles, was danach noch besprochen wird, erst mit dem nächsten Commit im Repo landet.
> 4. **Web-Chats:** Erwähnt die Person einen KI-Chat im Browser, erinnerst du sie an `docs/prompts/<name>/manual/web-<JJJJ-MM-TT>-<thema>.md` und bietest an, die Datei anzulegen.
> 5. **Exporte nicht anfassen:** Dateien unter `docs/prompts/` außerhalb von `manual/` schreibt nur das Skript. Du änderst, kürzt oder löschst sie nie, auch nicht auf Wunsch. Soll etwas nicht im Repo stehen, verweist du auf den Modus `local` oder `off`.

## Robustheit

- Fehlt ein Werkzeug, wird es still übersprungen. Wirft ein Adapter einen Fehler, gibt es eine Zeile `prompt-export: <werkzeug> skipped: <grund>` auf stderr, und der Rest läuft weiter.
- Der Befehl endet bei `export` immer mit Exit-Code 0.
- `install-hook` scheitert nie daran, dass `gh` oder `glab` fehlen, nicht angemeldet sind oder kein Netz da ist.
- Am Ende eine Zeile, z. B. `prompt-export (commit): 12 session(s), 3 file(s) updated`.

## Tests und Abschluss

1. Schreibe Tests mit `node --test` (`scripts/prompt-export.test.mjs`). Lege pro Adapter eine kleine, **erfundene** Beispiel-Session in einem Temp-Ordner an und übergib dem Skript diesen Ordner mit `--home <ordner>` (und `--appdata <ordner>` für die VS-Code-Pfade). Prüfe:
   - Prompt und Antwort stehen in der Datei.
   - Pop-up-Antworten, Plan-Freigabe, ein abgelehnter und ein von mir erlaubter Tool-Aufruf und eine Nachricht während der Arbeit stehen in der Datei; eine Erlaubnis aus der Konfiguration (`source: "config"`) nicht.
   - Bei Copilot stehen `ask_questions`-Antworten und Bestätigungen mit `isConfirmed.type` 0, 3, 4 oder 5 drin, solche mit 1 nicht.
   - Tool-Ausgaben fehlen.
   - Eine Session aus einem anderen Ordner mit ähnlichem Namen wird nicht exportiert.
   - Geheimnisse sind maskiert.
   - Modell, Autor, Benutzername und `Runden` stehen im Dateikopf; ein Bild im Prompt wird zu `[Bild]`.
   - Wird die Quelle nach einem Export gekürzt oder gelöscht, bleibt die Exportdatei unverändert erhalten.
   - Zwei Personen mit gleichem `user.name`, aber verschiedenem Benutzernamen bekommen getrennte Ordner.
   - Eine Copilot-Session, deren `workspace.json` eine `vscode-remote://wsl+…`-URI auf das Repo enthält, wird exportiert.
   - Eine `.aider.chat.history.md` im Repo wird exportiert, Zeilen, die mit `>` beginnen, fehlen.
   - `install-hook --username <name>` schreibt `prompt-export.username`; ohne `gh`/`glab` im `PATH` endet `install-hook` trotzdem mit 0.
   - `check` nennt einen Commit-Autor ohne Ordner und endet mit 0, mit `--strict` mit 1.
   - `local` schreibt `.gitignore` und staged nichts.
   - Eine kaputte Quelldatei lässt den Export trotzdem mit 0 enden.
   - `install-hook` setzt in einem frischen Temp-Repo `core.hooksPath` auf `.githooks` und ist idempotent: Ein zweiter Lauf ändert keine Datei und meldet `hook already active`.
   - In einem Repo mit vorhandenem `.husky/pre-commit` wird nur die Aufrufzeile angehängt, der bisherige Inhalt bleibt.
2. Aktiviere den Hook selbst, wie im Abschnitt *Hook aktivieren* beschrieben. Führe danach einmal `node scripts/prompt-export.mjs export` aus und zeig mir, welche Dateien entstanden sind. Öffne eine davon und prüfe, dass keine Tool-Ausgaben oder Geheimnisse drinstehen.
3. Committe erst, wenn ich die Beispieldatei gesehen und bestätigt habe.
4. Dein Abschlussbericht beginnt mit dem Stand des Hooks: `Hook aktiv: ja (<pfad>)` oder `Hook aktiv: nein`, im zweiten Fall mit Grund und dem Befehl, den ich selbst ausführen muss. Darunter stehen der erkannte Benutzername, die Werkzeuge, die gefunden wurden, und die, für die es nur eine Warnung gab.
