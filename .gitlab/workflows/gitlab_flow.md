# 🧭 GitLab Flow – Workflow Guidelines

Der GitLab Flow kombiniert Feature Branching mit klaren Environments und kontinuierlicher Integration.

---

## 🔹 Branch-Konventionen

| Branch-Typ  | Zweck                                         | Beispiel               |
| ----------- | --------------------------------------------- | ---------------------- |
| `main`      | Stabiler Code, wird auf *production* deployed | –                      |
| `develop`   | Integrationszweig für Features                | –                      |
| `feature/*` | Neue Features / User Stories                  | `feature/login-page`   |
| `fix/*`     | Fehlerbehebungen                              | `fix/typo-login`       |
| `hotfix/*`  | Kritische Production-Fixes                    | `hotfix/payment-crash` |

---

## 🔄 Ablauf

1. **Erstelle Branch:** `git checkout -b feature/feature-name`
2. **Entwickle & Committe**
3. **Push + Merge Request erstellen**
4. **Code Review & Tests laufen automatisch**
5. **Merge nach `develop` → Deployment auf Staging**
6. **Merge nach `main` → Deployment auf Production**

---

## 🧱 Environments

| Umgebung     | Branch    | Deployment                 |
| ------------ | --------- | -------------------------- |
| `staging`    | `develop` | Automatisch                |
| `production` | `main`    | Manuell oder nach Freigabe |

---

## 🏷️ Labels im Flow

Verwende Labels zur Steuerung des Status:

- `status::in-progress`
- `status::in-review`
- `status::done`

Vollständige Liste siehe [`labels.md`](labels.md)
