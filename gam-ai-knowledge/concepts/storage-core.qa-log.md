---
doc: qa-log
format: gam-ai-knowledge/1
title: "Question log — Storage core: folders, resumable upload, deduplication"
audience: [developer, reviewer, agent]
concept: "storage-core.md"
---
# Question log — Storage core: folders, resumable upload, deduplication

The verbatim record of every question round of the concept [storage-core.md](storage-core.md), for anyone who wants to know why a decision was made and who answered what (P-GRILL-2). Answers are quoted exactly and never rewritten; the distilled decisions live in the concept's §13.

Question numbers follow the project-wide counter of `prompt-export.mjs next-q`. Assumptions are numbered `A<n>` and become a question of the next round if rejected.

## Round 1 — 2026-11-24 — grill, deviations, owner, scope, goal (`schwaigc`)

Instruction of `schwaigc`, verbatim: "/gam-engineering #56 vermerke auch das es ursprünglich schauby1 gehörte und ich es mir dann genommen habe". The implement command stopped before the first change because this concept was a first draft and `STACK.md` §2 left SCF-C-4, SCF-C-15, and SCF-C-17 open; Q413 ("Konzept grillen (Recommended)") started this grill. #56 and #117 were assigned from `schauby1` to `schwaigc` with a note on each issue. Concept branch `concept/storage-core` from `origin/dev`.

Applied standing decisions (not asked): P-GIT-6, P-GOAL-3, P-DOC-6, P-DES-4, P-HUM-1/2/3, P-GRILL-4. Goal check: R5 serves `G-1` ("store, organize … on their own server") and touches no non-goal.

- **A1**: The empty local branch of the worktree was renamed to `concept/storage-core`; #56 gets its `feature/` branch after this concept is merged.

**Q414 - Abweichungen:** Für das Konzept storage-core gelten P-GIT-6, P-GOAL-3, P-DOC-6, P-DES-4, P-HUM-1/2/3 und P-GRILL-4 unverändert. Willst du für dieses Konzept davon abweichen?

Answer: "Keine (Recommended)".

**Q415 - Zuständigkeit R5:** Laut ROADMAP und STACK.md §2 gehört R5 (Storage core) schauby1. Du hast #56 und #117 übernommen. Wie weit reicht die Übernahme?

Answer: "Nur #56 und #117 (Recommended)".

**Q416 - Umfang des Grillens:** Das Konzept deckt 7 Stories ab (STO-US-1–7, 33 Entwurfs-Requirements). Was grillen wir jetzt?

Answer: "Ganzes R5, Fundament zuerst (Recommended)".

**Q417 - Feature-Ziel:** §1 sagt „Members upload, organize, restore, and download files of any size“, STO-AC-2.3 begrenzt die Größe aber über .env und STO-AC-3.4 testet 5 GB. Soll das Feature-Ziel „of any size“ durch „up to the size the operator allows“ ersetzen?

Answer: "Ja, operator-begrenzt (Recommended)".

## Round 2 — 2026-11-24 — STO-US-1 terms, permissions, test user (`schwaigc`)

- **A2**: `storage` checks every session by asking `identity` (`GET /api/identity/session`, ADR-0007).
- **A3**: `storage` is reached under `/api/storage` behind the one origin (ADR-0001).
- **A4**: The role of STO-US-1 stays *Operator*.

**Q418 - Begriffe für die Datentrennung (STO-AC-1.2):** Ins Glossar kommen drei Begriffe. File = was ein Member sieht (Name, Ordner, Besitzer, Größe, Hash; PostgreSQL). Content object = die gespeicherten Bytes im Object Storage, die sich mehrere Files teilen können (Deduplizierung). File metadata = aus dem Inhalt abgeleitete Fakten wie erkannter Typ, EXIF, OCR-Text, Thumbnail-Verweise oder Scan-Ergebnis (MongoDB). Passt diese Aufteilung?

Answer: "Ja, so (Recommended)".

**Q419 - STO-AC-1.5:** „Integration test“ beschreibt kein beobachtbares Verhalten. Soll es umformuliert werden zu „Given a stored file, when an operator deletes it through the storage API, then its content object, metadata and record are gone“ (Speichern/Lesen/Löschen als Verhalten), und der Integrationstest kommt in §17?

Answer: "Umformulieren (Recommended)".

**Q420 - Rechte bis R7:** Teams, Rollen und geerbte Rechte kommen erst mit R7 (tschudea07, 0.6.0). Wer darf in R5 auf ein File oder einen Ordner zugreifen?

Answer: "Nur der Besitzer (Recommended)".

**Q421 - Testnutzer (offen laut ROADMAP Sprint 2):** Wie kommen die Storage-Tests an einen eingeloggten Member?

Answer: "Stub + 1 E2E (Recommended)".

## Round 3 — 2026-11-24 — technology of STO-US-1 (`schwaigc`)

- **A5**: PostgreSQL is reached through Prisma 8 in `packages/db` (school requirement, ADR-0006).

**Q422 - HTTP-Framework storage (SCF-C-4, offen in STACK §2):** Soll storage wie identity Hono 4 auf Node.js verwenden?

Answer: "Hono wie identity (Recommended)".

**Q423 - Object-Storage-Client (SCF-C-17):** Mit welcher Bibliothek spricht storage die S3-Schnittstelle von SeaweedFS an?

Answer: "@aws-sdk/client-s3 (Recommended)".

**Q424 - MongoDB-Zugriff (SCF-C-15):** Wie greift storage auf die File metadata in MongoDB zu?

Answer: "Offizieller Treiber (Recommended)".

**Q425 - Schlüssel der Content objects:** Unter welchem Schlüssel liegt ein Content object im Object Storage?

Answer: "Zufällige ID, Hash in PG (Recommended)".

## Round 4 — 2026-11-24 — failure, read, and delete of STO-US-1 (`schwaigc`)

- **A6**: Owner-only access (Q420) means STO-AC-1.5 reads "when its owner deletes it" instead of "an operator"; the story role *Operator* stays.
- **A7**: Deleting in STO-US-1 is final; the trash (STO-US-6) later comes in front of it.

**Q426 - Speichern über drei Speicher:** Ein File geht in drei Speicher (Object Storage, PostgreSQL, MongoDB). Was passiert, wenn einer davon beim Speichern ausfällt?

Answer: "Alles oder nichts (Recommended)".

**Q427 - Lesen/Download:** Der Object Storage ist nur auf 127.0.0.1 veröffentlicht, und STO-AC-7.4 verlangt eine Rechteprüfung pro Download. Sollen die Bytes durch storage gestreamt werden?

Answer: "Durch storage streamen (Recommended)".

**Q428 - Content object entfernen:** Wenn beim Löschen kein anderes File mehr auf das Content object verweist, wann wird es aus dem Object Storage entfernt?

Answer: "Sofort + Cleanup-Netz (Recommended)".

## Round 5 — 2026-11-24 — STO-US-2 upload (`schwaigc`)

- **A8**: Every member has a root folder, created on first use, so STO-US-2 uploads into the current folder before STO-US-5 adds nested folders.
- **A9**: "Keep both" names the new file `Name (2).ext`, then `(3)`, and so on.

**Q429 - Upload-Weg:** STO-US-3 verlangt tus mit Chunks und Resume. Soll schon STO-US-2 jeden Upload über tus schicken, damit es nur einen Upload-Weg gibt?

Answer: "tus von Anfang an (Recommended)".

**Q430 - Typprüfung (STO-AC-2.3):** Woran erkennt der Server den erlaubten Dateityp?

Answer: "Inhalt + Endung (Recommended)".

**Q431 - Live-Liste (STO-AC-2.5):** Wie erfährt eine offene Ordneransicht, dass ein Upload fertig ist (z. B. ein zweiter Tab oder ein zweites Gerät desselben Members)?

Answer: "Server-Sent Events (Recommended)".

**Q432 - Oberfläche der Upload-Stories:** STO-AC-2.1, 2.2, 2.4 und 2.5 sind Oberfläche im web-Client (R6, dein Bereich). Wo werden sie gebaut?

Answer: "In R5, als web-Slice (Recommended)".

## Round 6 — 2026-11-24 — STO-US-3 resumable upload, STO-US-4 deduplication (`schwaigc`)

- **A10**: Deduplication happens only after the full upload, so no upload tells anyone whether another member holds the same file.
- **A11**: Defaults in `.env`: at most 5 GiB per file, 8 MiB per chunk; both configurable.
- **A12**: An unfinished upload counts as orphaned after 24 hours (STO-AC-3.5); configurable.

**Q433 - tus-Server (STO-US-3):** Mit welcher Bibliothek nimmt storage tus-Uploads an?

Answer: "@tus/server + S3-Store (Recommended)".

**Q434 - Hash berechnen (STO-AC-4.1):** Ein tus-Upload kann über mehrere Verbindungen fortgesetzt werden, deshalb lässt sich der SHA-256 nicht einfach während des Empfangs mitrechnen. Wann wird er berechnet?

Answer: "Nach Abschluss lesen (Recommended)".

**Q435 - Cleanup-Jobs (STO-AC-3.5, 6.4 und das Netz aus Q426/Q428):** Wer führt die periodischen Aufräumjobs aus, solange R9 (Hintergrundverarbeitung, 0.6.0) noch nicht gebaut ist?

Answer: "worker mit BullMQ jetzt (Recommended)".

**Q436 - Dedup-Treffer (STO-AC-4.2):** Ein fertiger Upload hat denselben Hash wie ein vorhandenes Content object. Was passiert mit dem gerade hochgeladenen Objekt?

Answer: "Neues löschen, verweisen (Recommended)".

## Round 7 — 2026-11-24 — STO-US-5 folders, STO-US-6 trash, STO-US-7 download (`schwaigc`)

- **A13**: A copied file is a new file that refers to the same content object; copying never duplicates content.
- **A14**: Moving a folder into itself or one of its subfolders is rejected.
- **A15**: The breadcrumb (STO-AC-5.5) and the confirmation dialog (STO-AC-6.3) belong to the web slice of their story, as in Q432.
- **A16**: A download sends the stored detected type and the file name encoded for UTF-8.
- **A17**: A deleted folder goes to the trash as one entry with its whole content.

**Q437 - Namensregeln (STO-AC-5.3):** Welche Regeln gelten für Datei- und Ordnernamen?

Answer: "Portable Regeln (Recommended)".

**Q438 - Wiederherstellen bei Namenskonflikt (STO-AC-6.2):** Am ursprünglichen Ort liegt inzwischen ein Item mit gleichem Namen. Was passiert?

Answer: "Wie Upload fragen (Recommended)".

**Q439 - Papierkorb-Eintrag eines Ordners:** Kann ein Member aus einem gelöschten Ordner einzelne Dateien wiederherstellen?

Answer: "Nur ganzer Eintrag (Recommended)".

**Q440 - ZIP-Streaming (STO-AC-7.2):** Mit welcher Bibliothek baut storage das ZIP-Archiv als Stream (auch über 4 GB, also ZIP64)?

Answer: "archiver (Recommended)".

## Round 8 — 2026-11-24 — personal data (`schwaigc`)

- **A18**: R5 builds the storage metrics the observability concept requires: OBS-F-23 (capacity) with STO-US-1, OBS-F-21 (upload throughput) with the tus upload.
- **A19**: File names and content never reach logs, traces, or metrics; these carry only IDs, sizes, and route patterns.
- **A20**: The ZIP download of the root folder (STO-US-7) serves the right to data portability.
- **A21**: When two members share a content object and one deletes their file, the object stays for the other, whose file it is as well; nothing that points to the deleting member remains.
- **A22**: Legal questions are not decided here: the controller role and the lawful basis for processing members' files go as open question L1 in §13 to the school management (data-protection contact).

**Q441 - Account löschen (IDN-US-8, Entwurf in identity):** Was passiert mit den Files, Ordnern und dem Papierkorb eines Members, dessen Account gelöscht wird?

Answer: "Sofort alles löschen (Recommended)".

**Q442 - Verschlüsselung im Ruhezustand:** Content objects, Datenbanken und Metadata liegen unverschlüsselt auf dem Server; Ende-zu-Ende-Verschlüsselung ist die optionale Erweiterung O1. Was verlangt R5?

Answer: "Betreiber-Sache, dokumentiert (Recommended)".

## Round 9 — 2026-11-24 — performance and adversarial check (`schwaigc`)

- **A23**: Every story with an interface is cut into an API slice (`storage`) and a web slice (Q432); STO-US-1 keeps its two slices (#56, #105); the cleanup jobs are a worker slice of STO-US-3 (Q435). The INVEST check runs while writing; its findings are asked one by one.

**Q443 - Leistungsziele (NF):** Welche messbaren Ziele soll R5 haben (gemessen im lokalen Stack, später unter Last in R13)?

Answer: "Drei Ziele (Recommended)" — list a folder of 1 000 items in ≤ 300 ms (p95); first byte of a download in ≤ 500 ms (p95); a 5 GiB upload or download without `storage` using more than 256 MB of memory.

**Q444 - Gegenprüfung vor dem Phase-4-Gate:** R5 verarbeitet personenbezogene Daten und löscht endgültig (irreversible Wirkung). Soll vor dem Review ein unabhängiger Prüfer (gam-v-doubt-driven-development) die Ziel-Kette (§1) und Part H angreifen?

Answer: "Ja, Gegenprüfung (Recommended)".

## Round 10 — 2026-11-24 — shared understanding (`schwaigc`)

**Q445 - Gemeinsames Verständnis:** Stimmt die Zusammenfassung (Fundament, Upload/Resume/Dedup, Ordner/Papierkorb/Download, Datenschutz, Leistung), sodass ich jetzt Konzept §1–§17 + Part H, Story-Dateien, Glossar und STACK.md §2 auf concept/storage-core schreibe?

Answer: "Ja, schreiben (Recommended)".

## Round 11 — 2026-11-24 — findings of the draft (`schwaigc`)

The draft of the concept (written by a subagent) reported writing decisions W1–W12 and INVEST findings; this round settles them. Q446 and Q447 are not in this log because the project-wide counter had already been used by another session.

- **A24**: STO-US-1 also depends on IDN-US-2 (session check); added to its "Depends on" line.
- **A25**: After STO-US-6, only delete-for-good satisfies STO-AC-1.5; STO-T-5 already says so and stays.
- **A26**: The weights of the stories are re-estimated at `tickets`, where the new slices become issues.
- **A27**: STO-AC-4.5 stays a test criterion; its cases are named concretely.

**Q448 - Tabelle folders:** Die vorhandene Tabelle folders (Scaffolding, Bereich trutscf1) verlangt eine team_id und hat einen Root pro Team, R5 ist aber nur für den Owner (Q420). Wie passt das zusammen?

Answer: "owner_id ergänzen (Recommended)".

**Q449 - Account löschen über identity:** Für Q441 ruft identity storage intern auf (gemeinsames Geheimnis), erst löscht storage alles, dann identity den Account. Soll das so ins Konzept, mit einem Inbox-Eintrag an tschudea07 für IDN-US-8?

Answer: "So, + Inbox an tschudea07 (Recommended)".

**Q450 - Gemeinsames Paket:** Die Aufräumlogik läuft in storage und worker. Der Entwurf legt dafür ein neues Paket packages/storage-core an (W7), das beide Units verwenden. Einverstanden?

Answer: "Ja, ohne ADR (Recommended)".

**Q451 - Schreibentscheidungen W1–W5, W8, W9, W12:** Der Entwurf hat Lücken selbst gefüllt, z. B. konkrete Namensregeln (255 Zeichen, NFC, reservierte Gerätenamen), eine Typ-Liste mit Default „alles erlaubt“, „Ersetzen“ = altes File normal löschen, Ersetzen nicht für Ordner, und Konflikt-Entscheidung beim Anlegen des Uploads. Sollen diese Werte so bleiben (in §13 aufgelistet, im Review änderbar)?

Answer: "So lassen (Recommended)".

**Q452 - Hash ab dem ersten Upload:** Ab dem ersten gespeicherten File braucht jedes Content object seinen SHA-256 (STO-AC-4.1), das AC steht aber in STO-US-4, das erst nach STO-US-3 kommt. Soll STO-AC-4.1 nach STO-US-2 wandern?

Answer: "AC-4.1 nach US-2 (Recommended)".

**Q453 - Überschneidung US-2/US-3:** Wegen Q429 (tus von Anfang an) baut STO-US-2 den Chunk-Upload schon, STO-AC-3.1 beschreibt ihn aber in US-3. Soll STO-AC-3.1 nach STO-US-2 wandern, sodass US-3 nur Resume, Pause, große Dateien und Cleanup enthält?

Answer: "AC-3.1 nach US-2 (Recommended)".

**Q454 - Speicherbelegung (OBS-F-23):** Die S3-Schnittstelle liefert keine belegte und keine Gesamtgröße. Woher nimmt storage die beiden Werte?

Answer: "SeaweedFS-Master-API (Recommended)".

## Round 12 — 2026-11-24 — adversarial check (`schwaigc`)

The independent check of §1 and Part H that Q444 asked for ran on 2026-11-24 (cycle 1) with 22 findings, all fixed in the concept.

**Q455 - Zweitmeinung anderes Modell:** Die Gegenprüfung von §1 und Part H (storage-core) durch einen unabhängigen opus-Reviewer ist fertig (22 Befunde, u. a. überzogene Lösch- und Vertraulichkeitsversprechen). Soll zusätzlich ein anderes Modell prüfen?

Answer: "Überspringen (Recommended)".

## Round 13 — 2026-11-24 — adversarial check, cycle 2 (`schwaigc`)

The second cycle of the independent check found 18 more issues, several of them in the specification; all were fixed in the concept.

- **A28**: The internal deletion call `DELETE /internal/members/{userId}` is not routed by the proxy; it is reachable only on the internal Docker network. STO-F-4 exempts it, with the health endpoint, from the session check, and it is protected by the shared secret.
- **A29**: "Replace" replaces only the file that held the name when the upload was created (its ID is recorded at creation); if at completion a different item, file or folder, holds the name, keep-both applies; before STO-US-6 the conflict dialog says that replacing deletes the old file for good.
- **A30**: Account deletion first blocks new writes of the member (uploads, creates, moves), then deletes; the call is idempotent and safe to repeat, `identity` repeats it until 204, and a partial failure leaves a state the next call finishes.
- **A31**: Telemetry carries no member IDs (glossary *Telemetry*, OBS-NF-2).
- **A32**: The glossary entry *File* drops "the fingerprint of its content"; the state machine of the item gets trashed → gone on account deletion; the state machine of the upload gets receiving → failed on a refusal (type or size) and a transition for the member's cancel.

**Q456 - „reliably“ im Feature-Ziel:** Das Ziel aus Q417 lautet „… so that their data lives reliably on their own server.“ Der Reviewer zeigt, dass „reliably“ als Haltbarkeits- bzw. Verfügbarkeitsversprechen gelesen wird, das R5 nicht gibt (keine Backups, G-1.N4). Soll das Ziel geändert werden?

Answer: "„stays under their control“ (Recommended)" — new feature goal: "Members upload, organize, restore, and download files up to the size the operator allows, so that their data stays on their own server under their control."
