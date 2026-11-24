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
