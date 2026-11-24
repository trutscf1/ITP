---
doc: qa-log
format: gam-ai-knowledge/1
title: "Question log — Offline mode: installable web app with sync and conflict handling"
audience: [developer, reviewer, agent]
concept: "offline-mode.md"
---
# Question log — Offline mode: installable web app with sync and conflict handling

The verbatim record of every question round of the concept [offline-mode.md](offline-mode.md), for anyone who wants to know why a decision was made and who answered what (P-GRILL-2). Questions and answers are quoted from the AI chat exports of `trutscf1` in `docs/prompts/trutscf1/` and never rewritten; the distilled decisions live in the concept's §13. The questions were asked in German.

Question numbers are the numbers of the sessions as asked and stay unchanged. They are provisional until merged into `dev` (P-TEAM-5). Q372 was asked on 2026-11-24 but lies below Q377 to Q401, which another concept used on 2026-11-17, so the numbers are not in date order.

## Round 1 — 2026-11-17 — grill, Phases 1 to 6 (`trutscf1`)

Source: `docs/prompts/trutscf1/claude/2026-11-17-d8773bd7-e1a0-4afe-8a3a-2bb8e4a0df02.md`. Assumptions A1 to A7 were stated with the round; their confirmation is the answer to Q339.

**Q335 - Konflikt-Regel:** Wann gilt eine Offline-Änderung als Konflikt (OFF-AC-3.3), und was ist die Vorauswahl im Dialog?
(Optionen: Nur Inhalt + Löschen/Umbenennen (Recommended), Nur Inhaltsänderungen, Jede Änderung am Server)

Answer: the export of the first ask holds a pasted plan text that does not answer the question (a note on the login task list of the web app), not one of the options. The question was asked again, see below.

**Q336 - Gemeinsame Geräte:** Was passiert mit den offline gespeicherten Dateien, wenn sich ein Mitglied abmeldet (Schule: Geräte werden oft geteilt)?
(Optionen: Beim Abmelden löschen (Recommended), Behalten, pro Konto getrennt, Mitglied entscheidet beim Abmelden)

Answer: "Beim Abmelden löschen (Recommended)"

**Q337 - Speichergrenze:** Gibt es pro Gerät eine Obergrenze für Offline-Dateien (OFF-AC-2.4 zeigt nur die Nutzung)?
(Optionen: Feste Grenze, einstellbar (Recommended), Keine eigene Grenze, Grenze nur als Warnung)

Answer: "Feste Grenze, einstellbar (Recommended)"

**Q338 - iOS:** OFF-AC-1.3 verlangt Installation auch über 'Zum Home-Bildschirm' auf iOS. Das Team hat evtl. kein iOS-Gerät für Tests. Wie gehen wir damit um?
(Optionen: iOS als bestmöglich, manuell geprüft (Recommended), iOS streichen, iOS voll verbindlich)

Answer: "iOS als bestmöglich, manuell geprüft (Recommended)"

**Q335 (wiederholt) - Konflikt-Regel:** Wann gilt eine Offline-Änderung als Konflikt (OFF-AC-3.3), und was ist die Vorauswahl im Dialog?
(Optionen: Inhalt + Löschen/Umbenennen (Recommended), Nur Inhaltsänderungen, Jede Änderung am Server)

Answer: "Inhalt + Löschen/Umbenennen (Recommended)"

**Q339 - Gemeinsames Verständnis:** Sind die Antworten Q335 bis Q338 und die Annahmen A1 bis A7 so richtig, und soll ich jetzt das Konzept R12 schreiben (Ziel, Stories in 3 Epics mit Slices, Anforderungen, Datenmodell, Fehlerfälle, Beispiele, Architektur, Tests; Technologie nach STACK.md)?
(Optionen: Ja, Konzept schreiben (Recommended), Annahmen erst korrigieren, Nur die Stories jetzt schneiden)

Answer: "Ja, Konzept schreiben (Recommended)"

## Round 2 — 2026-11-24 — branch and merge request (`trutscf1`)

Source: `docs/prompts/trutscf1/claude/2026-11-24-606af888-3df3-4b99-83cf-b5193e0a6ae2.md`. The assumptions A8 to A12 were added while writing the concept and stated with Q372.

**Q372 - Annahmen:** A1-A7 hast du am 17.11. bestätigt (Q339). A8-A12 kamen beim Schreiben dazu: A8 abgelaufene Session ist kein Sign-out (nichts wird gelöscht) | A9 kein Sync bei geschlossener App | A10 Kopiename '<name> (offline copy <date>)' mit Zähler, ohne Personennamen | A11 Standardlimit 500 MB, längste Retry-Pause 300 s | A12 Sign-out-Warnung bietet: erst synchronisieren, abbrechen, verwerfen. Bestätigst du sie?
(Optionen: Alle bestätigt (Recommended), Reviewer entscheiden, Keine davon)

Answer: "Alle bestätigt (Recommended)"
