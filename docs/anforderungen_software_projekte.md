# Anforderungen Software Projekte git workflow light

## Ziel

Diese Guideline definiert verbindliche Regeln für die Projektarbeit.  
Sie stellt Nachvollziehbarkeit, Qualität und faire Bewertung sicher.

## Projektantrag

Projektantrag vom ITP Theorie Lehrer (SMART Ziele)

* * *

## 1\. Projekt‑Grundlagen

- Projekt‑Labels verwenden
- Issue Templates verwenden
- Milestones für Sprints anlegen
- Issue Board (= Work Item Board) aktiv nutzen
- **Definition of Done (DoD)** ist in der Projektdokumentation festgelegt und verbindlich

* * *

## 2\. Branching‑Modell

- **Feature Branches**
  - werden aus einem Issue erstellt
  - Namenskonvention empfohlen: `feature/<issue-id>-beschreibung`
- **Merge‑Ziel**
  - Feature Branch → **`dev`**
- **`dev`**
  - Integrationsbranch
  - kein Squash‑Merge
  - darf nicht gelöscht werden
- **`main`**
  - enthält **nur funktionsfähige, getestete Releases**
  - Merge ausschließlich von `dev` im Rahmen eines Releases
- ❌ Direkte Commits auf `dev` oder `main` sind verboten

* * *

## 3\. Issues / Work Items

- Jede User Story wird als Issue erfasst
- Jedes Issue enthält:
  - Beschreibung
  - Acceptance Criteria
  - Weight
  - Verantwortliche Person (Assignee)

* * *

## 4\. Merge Requests

- Merge Requests sind verpflichtend (Feature → `dev`)
- Merge Request enthält:
  - Referenz auf das Issue (z. B. `Closes #12`)
  - kurze Beschreibung der Umsetzung
  - Hinweis auf getestete Funktion(en)

### Review

- Review durch **eine andere Person verpflichtend**
- Reviewer:
  - prüft explizit die DoD
  - hinterlässt einen kurzen, inhaltlichen Kommentar
- ❌ Merge darf **nicht** durch dieselbe Person erfolgen, die den MR erstellt hat

* * *

## 5\. Acceptance Criteria & DoD

- Acceptance Criteria sind Teil des Issues
- Sie werden beim Merge Request überprüft
- Merge nur erlaubt, wenn:
  - alle Acceptance Criteria erfüllt sind
  - DoD vollständig erfüllt ist

* * *

## 6\. Zeiterfassung (Time Tracking)

- Time Spent **regelmäßig erfassen**
- Jeder Eintrag:
  - max. **50 Minuten**
  - Tätigkeit + Bezug zum Issue oder MR
- Beispiel:
  - `45m – Implementierung Validierung (#23)`
- Zeiterfassung auch für Reviews und Merge Requests verpflichtend

* * *

## 7\. Releases

- Releases erfolgen über:
  - Release Tags
  - GitLab Releases
- Merge von `dev` → `main` **nur für Releases**

* * *

## 8\. Verbindlichkeit

- Arbeiten, die diese Regeln nicht einhalten,  
    können **abgelehnt oder nicht bewertet** werden.

## mirror erstellen

siehe <https://gitlab.com/htl-villach/personal/gam/selected/gam_internal/-/blob/main/git/gitlab_nach_github_mirror.md?ref_type=heads>

mir (github username: gamgamstyle) reporter rechte geben !

ALL Branches !!

* * *

✅ **Kurzfassung:**

> Issue → Feature Branch → Merge Request → Review → `dev` → Release → `main`

# Technische Anforderungen für ein allgemeines Softwareprojekt

## 1\. Architektur & Datenmodell

- Datenbankmodellierung mittels **ER‑Diagramm**
  - konsistente Namenskonventionen (z. B. Tabellen im Plural)
  - Orientierung an SQL‑Styleguides / Best Practices
- Klare Trennung von:
  - Präsentationsschicht
  - Geschäftslogik
  - Persistenzschicht

* * *

## 2\. Programmiersprache & Laufzeitumgebung

- Verwendung einer **stabilen LTS‑Version** der jeweiligen Laufzeitumgebung  
    (z. B. Node.js, JVM, .NET, …)
- Versionsmanagement über definierte Umgebungen (z. B. `.tool-versions`, Docker)
- Einheitliche Paketverwaltung (z. B. pnpm, npm, yarn, pip, Maven, …)

* * *

## 3\. Frameworks & Libraries

- Einsatz eines **modernen, weit verbreiteten Anwendungsframeworks**
- Modularer Aufbau (keine Monolith‑Anti‑Pattern)
- Keine experimentellen oder nicht gepflegten Abhängigkeiten
- **Keine SaaS‑Abhängigkeiten**, die proprietäre Kernfunktionen ersetzen  
    (z. B. Auth, Datenbanklogik, Geschäftslogik)

* * *

## 4\. Typsicherheit & Codequalität

- Statische Typisierung **verpflichtend**
  - keine unspezifizierten Typen (`any`, `object`, etc.)
- Einheitlicher Code‑Style
- Automatische Code‑Analyse:
  - Linter (z. B. Biome, Checkstyle, …)
  - Formatierung über Tooling
- Lint‑Checks sind Voraussetzung für Merge/Release

* * *

## 5\. Versionskontrolle & Workflow

- Git‑basierter Workflow
- Arbeiten ausschließlich über:
  - Issues / Tickets
  - Feature Branches
- Feature Branches:
  - **nicht squashen**
  - **nicht löschen**
- Keine direkten Commits auf Integrations‑ oder Main‑Branch
- Code‑Reviews verpflichtend
- Bugs / Defects müssen als eigene Issues erfasst werden

* * *

## 6\. Authentifizierung & Autorisierung

- Sichere Authentifizierungslösung
- Passworthashes mit **aktuellen, sicheren Algorithmen**  
    (z. B. Argon2id, bcrypt mit ausreichenden Kostenfaktoren)
- Sichere Passwortregeln und ‑überprüfung
- Optional / empfohlen:
  - Benutzerrollen (z. B. User, Admin)
  - MFA (Authenticator, Passkey, …)
  - E‑Mail‑Verifikation

* * *

## 7\. Sicherheit

- Schutz vor automatisierten Angriffen:
  - Rate Limiting
  - CAPTCHA / Turnstile / vergleichbare Mechanismen
- Serverseitige **Inputvalidierung**
  - gleiche Validierungsregeln client‑ und serverseitig
  - gemeinsame Definition der Validierungsregeln
- Aussagekräftige, sichere Fehlermeldungen
  - keine internen Details nach außen
- Regelmäßige Sicherheitschecks
- **Alle eingesetzten Container und Abhängigkeiten müssen ohne bekannte Vulnerabilities sein**

* * *

## 8\. Datenbank

- Verwendung eines **relationalen Datenbanksystems**
- Klare Migrationsstrategie
- Lokale Entwicklungsumgebung vollständig lauffähig
- Nutzung eines ORM / Datenzugriffslayers mit:
  - expliziten Modellen
  - Versionskontrolle der Schemaänderungen

* * *

## 9\. Containerisierung & Deployment

- Anwendung ist vollständig **containerisiert**
- Start über ein zentrales Setup (z. B. `docker compose up`)
- Reverse Proxy / Gateway für:
  - Routing
  - TLS / HTTPS
- Deployment möglich auf:
  - eigenen Servern (z. B. Hetzner oder vergleichbar)
  - optional zusätzlichem Hosting (z. B. Plattform‑Deployment pro Projekt)

* * *

## 10\. Benutzeroberfläche

- Responsive Design
- Mobile‑First‑Ansatz (empfohlen)
- Barrierefreiheit berücksichtigen
- Keine lizenzpflichtigen Inhalte (öffentliches Projekt)

* * *

## 11\. Formulare & Eingaben

- Einheitliche Formularverarbeitung
- Zentrale Validierungslogik
- Klare Fehlermeldungen für Benutzer
- Schutz vor ungültigen und manipulierten Eingaben

* * *

## 12\. Releases & Betrieb

- Versionierung über Tags
- Dokumentierte Releases
- Anwendung muss lokal **ohne Internetzugang** startbar sein
  - Konfigurierbar über Umgebungsvariablen
- Konfigurationsdaten **nicht im Code**

* * *

## 13\. Dokumentation

- Projektdokumentation enthält:
  - Architekturübersicht
  - Setup‑Anleitung
  - Betriebs‑ und Deploymenthinweise
  - Definition of Done (DoD)
- Rechtliche Seiten:
  - Impressum / AGB / Datenschutz
  - ohne Authentifizierung erreichbar

* * *

## Optionale Zusatzanforderungen

- Accessibility‑Tests
- Automatisierte Tests (Unit / Integration)
- Sinnvoller Einsatz von AI‑Funktionen
- E‑Mail‑Benachrichtigungen
- Erweiterte Sicherheitsmechanismen
- Offline‑First‑Fähigkeit

## Projektanforderungen für projekte

- ER Diagramm mit vertabello (redgate) - Tabellennamen mehrzahl siehe auch <https://gitlab.com/htl-villach/personal/gam/selected/gam_internal/-/blob/main/insy/sql/sql_styleguide.md?ref_type=heads#general-1>
- ****Node.js v24**** (`node:24-alpine`) `≥ **24.14.0**` bzw. letzte LTS Version
- Next.js 16 app router (`≥ 16.3)
- ****React mindestens 19.2**** (`≥ 19.2`)
- node 24 bzw. letzte node LTS version
- TypeScript (alles !!!) -> ohne any !!
- better-auth `≥1.76 (rate limiting + captcha optional mit better-auth)
- eigene user tabelle mit 1:1 beziehung zur better auth user table !!
- feature branches nicht squash / nicht delete
- form-hook oder tanstack forms
- sichere passwörter checken (mindestens Argon2ID bei hashes) (synchron: mindestens AES-256-GCM)
  - Schlüssel in:
    - Azure Key Vault
    - AWS KMS
    - Hashicorp Vault
    - oder zumindest `.env` auf dem Server
- Falls im Projekt: Für echte Ende-zu-Ende-Verschlüsselung: libsodium
- prisma ORM (JavaScript Client) (`≥ 8`)
- recaptcha verwenden und überprüfen (v3 bei google oder cloudflare turnstile oder ....)
- postgres datenbank **18** (`postgres:18-alpine`), lokales supabase, surreal community editon
- Keine SaaS Funktionen nutzen (z.b. von Supabase, ..) oder ähnliches
- pipeline erstellen (gitlab oder github -> server) mit automatischen deployment, wenn auf main gepusht wird (Möglichkeiten: hetzner, vercel, ...)
- middleware und eigene APIs (proxy.ts)
- Lizenzfreie Inhalte, da öffentlich !!!!
- Fehlermeldungen
- Inputvalidierung mit zod (**zod version >= 4** )(Client und Serverseitig mit **gleichen Regeln** ab 14.4. 2026 in einer eigenen Datei(en))
- Responsive
- Tailwind  ^4
- OpenAPI: <https://github.com/asteasolutions/zod-to-openapi>
- Mobile first
- Barrierefreiheit
- biome check
- pnpm run lint nicht vergessen
- Bugs/Defects erfassen
- **Alle docker container und pakete ohne Vulnerabilities**
- Testcases (Umfang sinnvoll) !

### Eventuelle Zusatzanforderungen

- ****Traefik **** (Let's Encrypt, HTTP-01) `> **3.6.10**`
- AI sinnvoll einbauen
- E-Mail verification
- Benutzerrollen (z.B. Admin, ...)
- MFA (Passkey, Authenticator, ...)
- E-Mail Bestätigung
- hosting auf hetzner oder ähnliches (über docker)
- Sicherheitschecks
- AGBs (ohne Authentifizierung)
- Anwendung muss komplett ohne Internet auch funktionieren. (über die .env regeln) wenn man sie lokal startet

### Notengebung

- Schwierigkeitsgrad inklusive Berücksichtigung des Zeitaufwandes (auch Bugs)
- Projektmanagement
- Usability (Responsive, ....)
- Projekterfolg
- Milestones / Sprints ergeben Mitarbeitsnoten

### Präsentation

Vereinbarte Projektziele (siehe oben) - Abweichungen davon darstellen (als Powerpoint oder Word)

Zeitaufwand in h pro Person in Bezug auf das Erreichte

Wieviel % hat jeder zum erreichten Ziel beigetragen

Resümee

Datenbankmodell (falls eines notwendig ist)

Zeit pro Person / 10min max.

Livepräsentation des Produktes

## Infos

### Recaptcha v3 google

Visibility Requirements: You are allowed to hide the badge as long as you include the reCAPTCHA branding visibly in the user flow. This is usually done by adding text that says: *"This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply."*Implementation: If you choose to hide the badge, you can use CSS (such as .grecaptcha-badge { visibility: hidden; }) to do so, provided the legal text mentioned above is clearly visible to your users.

# ✅ Checkliste – Allgemeines Softwareprojekt

## 📐 Architektur & Modellierung

- ☐ ER‑Diagramm vorhanden
- ☐ Klare Namenskonventionen eingehalten
- ☐ Trennung von UI, Logik und Persistenz

* * *

## 🧑‍💻 Technologie & Laufzeit

- ☐ Aktuelle **LTS‑Version** der Laufzeitumgebung verwendet
- ☐ Einheitliche Paketverwaltung
- ☐ Versionsdefinition reproduzierbar (z. B. Docker, Tool‑Config)

* * *

## 🧩 Frameworks & Abhängigkeiten

- ☐ Modernes, etabliertes Framework verwendet
- ☐ Modularer Projektaufbau
- ☐ Keine proprietären SaaS‑Kernfunktionen genutzt
- ☐ Nur gepflegte Libraries im Einsatz

* * *

## 🧾 Codequalität & Typisierung

- ☐ Statische Typisierung konsequent verwendet
- ☐ Keine unspezifizierten Typen (`any`, Wildcards, …)
- ☐ Linter eingerichtet und fehlerfrei
- ☐ Code konsistent formatiert

* * *

## 🌿 Git & Workflow

- ☐ Git‑Repository eingerichtet
- ☐ Issues für Features, Bugs, Tasks vorhanden
- ☐ Feature Branches verwendet
- ☐ Keine direkten Commits auf `main` / Integrations‑Branch
- ☐ Feature Branches nicht gesquasht oder gelöscht
- ☐ Merge Requests verpflichtend
- ☐ Code Review durch andere Person erfolgt

* * *

## 🔐 Authentifizierung & Benutzer

- ☐ Sichere Authentifizierung umgesetzt
- ☐ Sichere Passwortregeln implementiert
- ☐ Moderne Passwort‑Hashing‑Verfahren verwendet
- ☐ Benutzerrollen definiert _(optional)_
- ☐ MFA / E‑Mail‑Verifikation _(optional)_

* * *

## 🛡️ Sicherheit

- ☐ Rate Limiting vorhanden
- ☐ CAPTCHA / Bot‑Schutz implementiert
- ☐ Serverseitige Inputvalidierung aktiv
- ☐ Client‑ und Servervalidierung nach gleichen Regeln
- ☐ Keine sensiblen Informationen in Fehlermeldungen
- ☐ Abhängigkeiten ohne bekannte Vulnerabilities

* * *

## 🗄️ Datenbank

- ☐ Relationale Datenbank verwendet
- ☐ ORM / Datenzugriffslayer eingesetzt
- ☐ Migrationen versioniert
- ☐ Lokale Entwicklungsumgebung vollständig lauffähig

* * *

## 🐳 Container & Deployment

- ☐ Anwendung containerisiert
- ☐ Start über zentrales Setup (`docker compose up`)
- ☐ Reverse Proxy / Gateway konfiguriert
- ☐ HTTPS / TLS vorhanden
- ☐ Deployment auf eigenem Server möglich
- ☐ Optional: zusätzliches Plattform‑Deployment

* * *

## 🖥️ Benutzeroberfläche

- ☐ Responsive Design
- ☐ Mobile‑First berücksichtigt
- ☐ Barrierefreiheit bedacht
- ☐ Keine lizenzpflichtigen Inhalte

* * *

## 📝 Formulare & Eingaben

- ☐ Zentrale Validierungslogik
- ☐ Aussagekräftige Nutzer‑Fehlermeldungen
- ☐ Schutz vor ungültigen Eingaben

* * *

## 🚀 Releases & Betrieb

- ☐ Versionierung über Tags
- ☐ Releases dokumentiert
- ☐ Anwendung lokal ohne Internet lauffähig
- ☐ Konfiguration über Umgebungsvariablen

* * *

## 📚 Dokumentation & Rechtliches

- ☐ Setup‑Anleitung vorhanden
- ☐ Architektur dokumentiert
- ☐ Deployment beschrieben
- ☐ Definition of Done dokumentiert
- ☐ Impressum / AGB / Datenschutz öffentlich erreichbar

* * *

### ✅ Minimal‑Abschlussbedingung

> Alle **Pflichtpunkte** der Checkliste müssen erfüllt sein.

## alt - nicht verwenden

## Formalen Anforderungen

- Projekt-Labels einrichten

- Issue Templates erstellen

- Milestones  für Sprint einrichten

- Issue / Work Item: Userstories erfassen

  - Feature Branch(es) über den Issue erstellen

  - Acceptance Criteria (beim Merge Request kontrollieren mit kurzem Kommentar)
- Issue Board (= Work Item Board) verwenden

DoD in die Projektdoku

Mit dev branch! (keine squash commits - nicht löschen)

Fertige Issues

- Merge     Request erstellen
  - Zugehörige      Issues schließen über quick actions (<https://docs.gitlab.com/user/project/quick_actions/>)
  - Review      durch andere Person verpflichtend (**DoD kontrollieren**) mit kurzen Kommentar (man soll wirklich sehen, dass der Review erfolgt ist - nur nur wie toll der Code ist)
  - Merge nicht durch gleiche Person wie Autor !!

- Time Spend regelmäßig erfassen und wann sie verwendet wurde erfassen (maximum 50minuten !!) (auch beim Merge Request)

- Release Tags erstellen <https://docs.gitlab.com/user/project/repository/tags/>

- Releases erstellen

- Weight verwenden
