# 🗂️ Issue Board Setup

Dieses Board bildet unseren GitLab Flow visuell ab.

---

## 📋 Board-Spalten

| Spalte          | Label-Filter          | Beschreibung                  |
| --------------- | --------------------- | ----------------------------- |
| **Backlog**     | `status::backlog`     | Noch nicht priorisierte Ideen |
| **Ready**       | `status::ready`       | Bereit zur Umsetzung          |
| **In Progress** | `status::in-progress` | Aktuell in Bearbeitung        |
| **In Review**   | `status::in-review`   | Code Review / QA              |
| **Done**        | `status::done`        | Abgeschlossen                 |

---

## 🧩 Filter-Beispiele

- Alle aktiven User Stories: `type::user-story` + `status::in-progress`
- Alle Defects im Review: `type::defect` + `status::in-review`
- Alle Aufgaben von Team Backend: `team::backend`

---

## ⚙️ Automatisierungen (optional)

- Bei Merge automatisch `status::done` setzen  
- Blockierte Issues mit `status::blocked` kennzeichnen  
- Deployments durch `env::` Labels steuern
