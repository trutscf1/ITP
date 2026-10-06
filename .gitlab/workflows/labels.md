# 🏷️ Label-Konventionen

Dieses Dokument beschreibt das einheitliche Label-System für Issues und Merge Requests in diesem Projekt.  
Es unterstützt unseren **GitLab Flow** mit den Branches `main`, `development` und `feature/*`.

---

## 🔹 Typen (`type::`)

Beschreibt die Art der Aufgabe oder des Tickets.

- `type::user-story` – Neue Funktion oder Feature  
- `type::defect` – Fehler oder Bug  
- `type::technical-improvement` – Technische Verbesserung, Refactoring, Cleanup  
- `type::research` – Analyse, Konzept oder Spike  
- `type::documentation` – Dokumentationsarbeit

---

## 🔹 Status (`status::`)

Wird für das **Issue Board** genutzt, um den Workflow abzubilden.

- `status::backlog` – Noch nicht priorisiert  
- `status::ready` – Bereit zur Umsetzung  
- `status::in-progress` – Wird aktuell bearbeitet  
- `status::in-review` – In Code Review oder Test  
- `status::blocked` – Blockiert durch offenen Punkt  
- `status::done` – Abgeschlossen

---

## 🔹 Priorität (`priority::`)

Hilft, die Dringlichkeit zu kennzeichnen.

- `priority::high` – Muss zeitnah erledigt werden  
- `priority::medium` – Normale Wichtigkeit  
- `priority::low` – Geringe Priorität

---

## 🔹 Bereich (`area::`)

Kann optional verwendet werden, um den betroffenen Funktionsbereich zu kennzeichnen.

- `area::ui` – Benutzeroberfläche  
- `area::api` – Schnittstellen / Logik  
- `area::infrastructure` – CI/CD, Server, Pipelines

---

## 🔹 Environments (`env::`)

Falls ein Deployment-Kontext angegeben werden soll:

- `env::development` – Entwicklungsumgebung  
- `env::staging` – Testumgebung  
- `env::production` – Live-Umgebung

---

## 📋 Regeln

- Jedes Issue hat **genau ein** `type::` Label.  
- Jedes Issue hat **genau ein** `status::` Label.  
- Optional: `priority::` + `area::` / `env::`.  
- Labels werden beim Wechsel des Arbeitsstatus angepasst (z. B. `ready` → `in-progress` → `done`).  
- Merge Requests übernehmen in der Regel das `status::in-review` Label.

---

## 🔄 Beispiel

| Label                 | Bedeutung              |
| --------------------- | ---------------------- |
| `type::user-story`    | Neue Funktion          |
| `status::in-progress` | Aktuell in Arbeit      |
| `priority::medium`    | Normale Priorität      |
| `area::api`           | Betrifft Backend-Logik |

---

## 🧭 GitLab Flow Bezug

| Branch        | Zweck                      | Deployment         |
| ------------- | -------------------------- | ------------------ |
| `main`        | Stabiler Code, Produktion  | `env::production`  |
| `development` | Aktive Integration / Test  | `env::staging`     |
| `feature/*`   | Entwicklung neuer Features | `env::development` |
