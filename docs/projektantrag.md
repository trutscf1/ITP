# Projektantrag – Projektumsetzungsplan

Vereinbarte Projektziele. Bei der Abschlusspräsentation werden Abweichungen davon dargestellt (siehe `anforderungen_software_projekte.md`, "Präsentation").

**Titel:** Selbstgehostete Cloud-Storage-Plattform mit Dateiverarbeitung und barrierefreiem Multi-Theme-Interface

## IST-Zustand

Cloud-Speicher wird heute überwiegend über große US-Anbieter wie Google Drive, OneDrive oder Dropbox genutzt. Für Schulen, Vereine und kleine Unternehmen bedeutet das: Daten liegen außerhalb der eigenen Kontrolle, die DSGVO-Konformität ist schwer nachzuweisen und ein Anbieterwechsel ist aufwendig (Vendor Lock-in).

Bestehende selbstgehostete Lösungen wie Nextcloud sind funktional umfangreich, aber komplex im Betrieb, bieten kaum Einblick in ihr Laufzeitverhalten und sind bei Barrierefreiheit und optischer Anpassbarkeit nur eingeschränkt flexibel.

## Projektziele und Nutzen

Ziel ist die Entwicklung einer selbstgehosteten Cloud-Storage-Plattform, auf der Nutzer Dateien hochladen, organisieren, durchsuchen, teilen und offline verfügbar machen können.

### Funktionale Ziele

- Registrierung und Login per E-Mail sowie OAuth2 (GitHub, Google, Microsoft), abgesichert durch MFA (TOTP, Passkeys/WebAuthn)
- Teams mit Rollen, Ordnerstruktur mit vererbten Berechtigungen, Share-Links mit Passwort und Ablaufdatum, Speicherquoten
- Große Dateien per Chunked Upload mit Wiederaufnahme nach Verbindungsabbruch, Deduplizierung über Datei-Hashes
- Automatische Verarbeitung im Hintergrund: Vorschaubilder, Virenscan, Texterkennung (OCR), Volltextsuche
- Offline-Modus als installierbare Web-App (PWA) mit Synchronisation und Konfliktbehandlung
- Öffentliche Landingpage, Hilfe-Center und Changelog, gepflegt über ein Headless-CMS

### Technische Ziele

- Verteilte Architektur mit vier getrennten Bereichen im Monorepo (pnpm, Turborepo) und gemeinsamen Schnittstellen-Verträgen (Zod, OpenAPI)
- Einsatz passender Datenbanken: PostgreSQL mit Prisma (Nutzer, Rechte, Ordner), Redis (Sessions, Cache), BullMQ (Job-Queues, Cronjobs), MongoDB (Metadaten), CouchDB (Offline-Sync), Object Storage
- Authentifizierung mit Better Auth, Headless-CMS mit Strapi, Frontend mit NEXT.js, Radix UI
- Barrierefreiheit nach WCAG mit ARIA: Screenreader-Unterstützung, Tastaturbedienung, Hochkontrast, Farbenblind-Modi, reduzierte Animationen
- Observability über OpenTelemetry mit Prometheus (Metriken), Loki (Logs), Tempo (Traces) und Grafana
- CI/CD-Pipeline mit GitHub Actions (Lint, Tests, Accessibility-Checks, Security-Scans, Deployment), Conventional Commits und automatisch generiertem Changelog

### Nutzen

- Datensouveränität: Dateien bleiben vollständig auf eigener Infrastruktur, DSGVO-konform betreibbar
- Inklusive Nutzung durch Menschen mit unterschiedlichen Beeinträchtigungen
- Transparenz im Betrieb: Fehler und Engpässe sind über Dashboards und Traces sofort nachvollziehbar
- Hoher Lerneffekt: Das Team wendet nahezu alle Inhalte des Jahrgangs in einem realistischen, praxisnahen System an und lernt professionelle Teamarbeit mit Git, Code-Reviews und Pipelines

## Nicht-Ziele

- Keine nativen Desktop- oder Mobile-Sync-Clients (Offline-Nutzung ausschließlich über die PWA)
- Keine gemeinsame Echtzeit-Bearbeitung von Office-Dokumenten (kein Online-Office)
- Keine Bezahlfunktionen, Abrechnung oder Tarifmodelle
- Kein produktiver Betrieb für externe Nutzer mit Verfügbarkeitsgarantie
- Keine eigene Implementierung kryptografischer Verfahren (Einsatz etablierter Bibliotheken)
- Ende-zu-Ende-Verschlüsselung und Kubernetes-Betrieb (k3s) sind optionale Erweiterungen, nicht Teil des Pflichtumfangs

## Projektgruppe

Personen inkl. vorgeschlagener Aufgabenverteilung:

| Person                | Bereich                          | Aufgaben                                                                                                                                                                     |
| --------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Andreas Tschuden      | Identity & Sharing               | Authentifizierung mit Better Auth (OAuth2, MFA, Passkeys), Teams und Rollen, Berechtigungssystem, Share-Links, Audit-Log, Quoten, Prisma-Schema-Koordination, CI/CD-Pipeline |
| Yannick Schaub        | Storage Engine & Processing      | Storage-API, Chunked Uploads (tus), SeaweedFS, Redis, BullMQ-Worker (Thumbnails, Virenscan, OCR, Cronjobs), MongoDB und Suche                                                |
| Christopher Schwaiger | Web-Client & Design-System       | React-Dashboard, Dateibrowser und Vorschau, Design-Tokens mit vier UI-Systemen, ARIA- und Barrierefreiheits-Modi, Storybook, End-to-End-Tests                                |
| Fabian Trutschnig     | Offline, Content & Observability | Strapi-CMS (Landingpage, Hilfe-Center, Changelog), OpenTelemetry, Prometheus, Loki, Tempo, Grafana, Lasttests, Projekt-Controlling                                           |

Gemeinsam: Projekt-Scaffolding, Schnittstellen-Verträge, Integrationstermine, Dokumentation und Präsentation.
