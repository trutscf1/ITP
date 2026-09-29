## 🎯 next 16 security

-   **Vor jedem Commit**:
    -   🔑 **Gitleaks** scannt nach Secrets (Staging‑Bereich)
    -   🧑‍⚖️ **Semgrep** prüft Code (JS/TS/React/Next.js‑Patterns)
    -   📦 **npm audit** prüft Dependencies (Produktion, hoch/kritisch)
-   **Optional CI**: gleicher Stack im PR/Push

### npm audit

-   **Prod only**: `--omit=dev` (für Next.js Server/Edge‑Runtime relevant)
-   **Schwellwert**: `--audit-level=high` (blockiert bei high/critical)
-   CI‑freundlich: `--json` (für Auswertung), lokal eher ohne.

Beispiele:

``` bash
npm audit --audit-level=high
# Für Full Scan (langsamer, lauter):
# npm audit --audit-level=moderate
```

## 

### Python mit Chocolatey installieren

Öffne eine **PowerShell mit Administratorrechten** und führe aus:

``` powershell
choco install python -y
```

Chocolatey sorgt dafür:

-   ✔ Python landet automatisch im `PATH`
-   ✔ `pip` ist direkt verfügbar
-   ✔ Updates sind einfach (`choco upgrade python`)
-   ✔ funktioniert stabil mit Git, pre-commit und Semgrep

👉 **Nach der Installation**: vscode und terminal und cmd neu öffnen, damit PATH neu geladen wird und python im pfad ist.

* * *

#### 🧪 Testen, ob Python korrekt installiert ist

``` powershell
python --version
pip --version
```

Beides sollte funktionieren.

### Installation von pre‑commit

powershell version anzeigen (in vscode terminal ausführen):

```powershell
$PSVersionTable
```

powershell neu version installieren

```bash
winget install -e --id Microsoft.PowerShell
```

Im Repo:

``` bash
pip install pre-commit
```

wenn die Warnung kommt:

```
WARNING: The script nodeenv.exe is installed in 'C:\Users\<username>\AppData\Roaming\Python\Python314\Scripts' which is not on PATH.
```

müsst ihr dieses Verzeichnis in den Benutzerpfad geben.

dann

vscode oder terminal schliessen

Testen ob pre-commit funktioniert mit

```
pre-commit --version
```

dann

```
pre-commit install
```

Dadurch aktiviert Git den Hook:

```
.git/hooks/pre-commit
```

* * *

### pre-commit Setup für pnpm + Next.js + Prisma

Erstelle `.pre-commit-config.yaml` im Repo‑Root:

``` yaml

repos:
  # 1) Gitleaks – Secret-Scanning im staged Code
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.30.0
    hooks:
      - id: gitleaks
        name: gitleaks (staged)
        args: ["protect", "--staged"]
        pass_filenames: false
        # Wenn du eine Config hast:
        # args: ["protect", "--staged", "--config=.gitleaks.toml"]

  # 2) Semgrep – JS/TS + React + Next + Prisma
  - repo: https://github.com/semgrep/semgrep
    rev: v1.148.0
    hooks:
      - id: semgrep
        name: semgrep (Next.js 16 rules)
        args:
          - '--config=.semgrep.yml'
          - '--error'
          - '--timeout=120'

  # 3) pnpm audit – Prod Dependencies (high/critical)
  - repo: local
    hooks:
      - id: pnpm-audit
        name: pnpm audit (prod, high+critical)
        entry: bash
        language: system
        pass_filenames: false
        args:
          - -c
          - |
            if command -v pnpm >/dev/null 2>&1; then
              pnpm audit --prod --audit-level=high
            else
              echo "pnpm not found" && exit 1
            fi

```

### Gitleaks-Konfiguration

Erstelle `.gitleaks.toml`:

```toml
title = "gitleaks config"
[allowlist]
description = "Allowed example & generated files"
paths = [
'''\.env\.local\.example$''',
'''src/generated/.*''',
]
```

###  2) **Semgrep‑Regeln optimiert für Next.js 16 + Prisma**

Erstelle `.semgrep.yml`:

``` yaml
configs:
  - p/javascript
  - p/typescript
  - p/react
  - p/nodejs
  - p/owasp-top-ten

rules:
  # ========== NEXT.JS ==========

  - id: react-dangerouslysetinnerhtml
    message: 'Vermeide dangerouslySetInnerHTML oder sanitisiere den Input.'
    severity: ERROR
    languages: [javascript, typescript]
    patterns:
      - pattern: $X.dangerouslySetInnerHTML

  - id: nextjs-ssrf-fetch
    message: 'Unvalidierte URL in fetch/axios kann SSRF verursachen.'
    severity: WARNING
    languages: [javascript, typescript]
    patterns:
      - pattern-either:
          - pattern: fetch($URL, ...)
          - pattern: axios.get($URL, ...)
          - pattern: axios.post($URL, ...)
      - pattern-not: |
          fetch("...", ...)
      - pattern-not: |
          axios.get("...", ...)

  - id: nextjs-use-next-image
    message: "Nutze <Image> aus 'next/image' statt <img>."
    severity: INFO
    languages: [javascript, typescript]
    patterns:
      - pattern: '<img src={...} ... />'

  # ========== PRISMA ==========

  - id: prisma-raw-sql-concat
    message: 'Prisma.$queryRaw mit Template-String kann SQLi riskieren.'
    severity: ERROR
    languages: [javascript, typescript]
    pattern: prisma.$queryRaw(`... ${...} ...`)

  - id: prisma-raw-unsafe
    message: 'queryRawUnsafe ist äußerst riskant.'
    severity: ERROR
    languages: [javascript, typescript]
    pattern: prisma.$queryRawUnsafe(...)

  # ========== NODE COMMAND EXECUTION ==========

  - id: node-child-process-exec
    message: 'exec()/spawn() können Command Injection ermöglichen.'
    severity: ERROR
    languages: [javascript, typescript]
    pattern-either:
      - pattern: require('child_process').exec(...)
      - pattern: require('child_process').execSync(...)
      - pattern: require('child_process').spawn(...)
      - pattern: require('child_process').spawnSync(...)

  # ========== UNSICHERE CRYPTO ==========

  - id: insecure-hash-md5-sha1
    message: 'MD5/SHA1 sind unsicher. Nutze SHA-256 oder besser.'
    severity: ERROR
    languages: [javascript, typescript]
    pattern-either:
      - pattern: crypto.createHash('md5')
      - pattern: crypto.createHash('sha1')

```

Ausführen mit

``` bash
pre-commit run --all-files
```

Funktioniert dann auch bei jedem Commit

Bei Änderungen an den Files:

```
pre-commit clean
pre-commit install
pre-commit run --all-files
```

### package.json in Ordnung bringen

```
pnpm outdated
```

Händisch vorsichtig (vorher sicherheitskopie erstellen) package.json auf den neuesten Stand bringen (Achtung bei version changes !!!).



```
pre-commit clean
pre-commit install
pre-commit run --all-files
```

## ToDo (for GAM

Husky

Lint Staged

# 🎯 Ergebnis: Du hast nun…

### 🔐 Vor jedem Commit (lokal)

-   **Gitleaks** → Secrets
-   **Semgrep** → Injection, SSRF, Prisma‑SQLi, React‑XSS
-   **pnpm audit** → Dependency Vulnerabilities

## python fehlerbehebung

```
$env:PATH -split ';' | Where-Object { $_ -match 'python' }
```

--

## author(s)

GAM

### Lizenz

CC-BY-SA

--
