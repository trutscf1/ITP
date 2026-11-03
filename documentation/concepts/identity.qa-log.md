---
doc: qa-log
format: engineering-human/2
title: "Question log — Identity: accounts, external login, MFA"
audience: [developer, reviewer, agent]
concept: "identity.md"
---
# Question log — Identity: accounts, external login, MFA

The verbatim record of every question round of the concept [identity.md](identity.md), for anyone who wants to know why a decision was made and who answered what (P-GRILL-2). Answers are quoted exactly and never rewritten; the distilled decisions live in the concept's §13.

Question numbers continue from the highest `Q<n>` already in this file. Assumptions are numbered `A<n>` and become a question of the next round if rejected.

## Round 1 — 2026-11-03 — grill, goal and scope (`tschudea07`)

Instruction of `tschudea07`, verbatim: "Dann starten wir mit sprint 2 nutze /grill-me und /engineering-human". Concept branch `concept/identity` from `origin/dev`, tracking issue #115.

Applied standing decisions (not asked): P-GOAL-1…3, P-DOC-6, P-DES-4, P-GRILL-2, P-GRILL-4, P-MR-4. Goal check: the feature serves `G-1` ("data stays under their control": only the organisation's own members reach their files) and touches no non-goal; G-1.N5 holds because only established libraries do the cryptography.

Assumptions stated with the round, none rejected:

- **A1**: Technology names leave the acceptance criteria and go to `STACK.md` section 3 (form library, schema library, password hash, auth library ≥ 1.76, session store, route guard, bot protection, secret encryption); the criteria become stack-neutral (P-DES-4). The values the school prescribes stay there as constraints.
- **A2**: Bot protection and external login can be switched off by configuration, so the system starts without internet (SCF-AC-2.3); e-mail goes to the local mail catcher.
- **A3**: Question numbers of this log start at Q1.

**Q1 - Feature-Ziel:** Bleibt das Ziel so? „Members register and log in with password, external account, second factor, or passkey, so that only they reach their files.“ (≤ 200 Zeichen, dient G-1)

Answer: "So lassen (Recommended)".

**Q2 - Produktname:** IDN-US-1 sagt „so that I can store my files in Nimbus“ – „Nimbus“ steht sonst nirgends (Workspace heißt `stash`, README „Self-hosted cloud storage platform“). Welcher Name gilt?

Answer: "stash".

**Q3 - Umfang dieser Session:** Sprint 2 braucht nur IDN-US-1, -2, -6 (#45, #46, #50); US-3 bis -5 sind Sprint 3. Was grillen wir jetzt bis „ready“?

Answer: "Nur US-1, -2, -6 (Recommended)".

**Q4 - Operator-Rolle:** trutscf1 bittet (Inbox, OBS-F-27/Q37), dass R3 eine Operator-Rolle und eine Adresse liefert, über die der Reverse Proxy prüft, ob eine Anfrage eine Sitzung eines Operators trägt (für das Grafana-Dashboard). Wo kommt das hin?

Answer: "Neue Story IDN-US-7 (Recommended)".

## Round 2 — 2026-11-03 — user stories and data (`tschudea07`)

Assumptions stated with the round, none rejected:

- **A4**: Registration asks for a display name of 1 to 100 characters besides e-mail address and password, because the account table of the auth library holds a required name (`packages/db`, `auth_users.name`).
- **A5**: The confirmation link is valid for 24 hours; an account that is not confirmed is deleted after 7 days. Both values are configuration (P-DES-6).
- **A6**: Registering with an address that already has an account gives the same answer as a new registration ("check your mailbox"); the owner of the address gets a notice e-mail instead of a confirmation link (IDN-AC-1.6).
- **A7**: A password has 12 to 128 characters and is checked offline against a bundled list of the 10,000 most common passwords; the strength indicator has four levels and only advises beyond these rules.
- **A8**: A session is valid for 7 days and is extended on use; logging out ends only the current session. Both values are configuration.
- **A9**: A password reset ends every session and leads to the login page; it also confirms the e-mail address, since the person proved access to the mailbox.
- **A10**: Failed attempts are kept only for the lock period; a session record with IP address and browser string is deleted when it expires or on logout.

**Q5 - Wer darf sich registrieren?** Der Server gehört einer Schule, einem Verein oder einer Firma; bei offener Registrierung kann sich jeder aus dem Internet ein Konto anlegen.

Answer: "Offen, abschaltbar (Recommended)".

**Q6 - Konto löschen:** Keine Story erlaubt bisher, das eigene Konto zu löschen (Recht auf Löschung). Wohin damit?

Answer: "Neue Story IDN-US-8 (Recommended)".

**Q7 - Wie wird jemand Operator (IDN-US-7)?**

Answer: "Konfigurierte E-Mail-Liste (Recommended)".

**Q8 - Sperre bei Fehlversuchen (IDN-AC-2.3):** 5 Fehlversuche pro Minute – was wird wie lange gesperrt? Eine Kontosperre erlaubt es Fremden, ein Konto absichtlich zu sperren.

Answer: "IP und Konto, 15 min (Recommended)".

## Round 3 — 2026-11-03 — architecture and technology (`tschudea07`)

Assumptions stated with the round, none rejected:

- **A11**: The unit `identity` serves the authentication endpoints under `/api/auth/` behind the reverse proxy; `web` renders the forms and sends them to `identity`.
- **A12**: A registration creates the own `users` row in the same transaction, 1:1 with the account of the auth library (school requirement).
- **A13**: E-mails and error messages exist in German and English, chosen by the language of the request; German is the default.
- **A14**: Registration is throttled like login (5 requests per minute per IP address) and protected by the bot check.

**Q9 - Sitzungsprüfung (ADR-0001 lässt das R3 offen):** Wie prüfen `web`, `storage` und `cms`, ob eine Anfrage eine gültige Sitzung trägt?

Answer: "Frage an identity (Recommended)".

**Q10 - Bot-Schutz:** Welcher Anbieter (Schulvorgabe: reCAPTCHA v3, Cloudflare Turnstile o. ä.; im Offline-Betrieb abgeschaltet)?

Answer: "Cloudflare Turnstile (Recommended)".

**Q11 - HTTP-Framework der Unit `identity`** (SCF-C-4, in STACK.md §3 noch offen):

Answer: "Hono (Recommended)".

## Round 4 — 2026-11-03 — shared understanding and slices (`tschudea07`)

**Q12 - Gemeinsames Verständnis:** Stimmt die Zusammenfassung (US-1, -2, -6 ready; US-7, -8 neu als Entwurf; ADR-0007 Sitzungsprüfung über identity; Technik in STACK.md), sodass Konzept, Work Items, Glossar, ADR und Status jetzt geschrieben werden?

Answer: "Ja, schreiben (Recommended)".

Found while writing, stated with the next question, none rejected:

- **A11 corrected**: the routing table of `scaffolding.md` §8 gives `identity` the prefix `/api/identity`, so the endpoints of this concept lie below `/api/identity/`, not `/api/auth/`.
- **A15**: Registering again with an address whose account is not confirmed sends a new confirmation link instead of the notice e-mail of A6; only a confirmed account gets the notice. Otherwise a person who missed the 24-hour link could never finish the registration.
- **A16**: The bot check runs as a visible widget, without a hidden badge, so no notice text is needed and [PUB-F-23] shows none.

**Q13 - Wer baut die Seiten (Registrieren, Login, Passwort zurücksetzen) in `apps/web`?** Das ist der Track von schwaigc; nach WORKFLOW wird eine Änderung im fremden Track als Issue an den Owner gestellt.

Answer: "Slice für schwaigc (Recommended)".
