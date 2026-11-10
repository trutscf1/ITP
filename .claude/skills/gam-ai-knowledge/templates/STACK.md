---
doc: stack
format: gam-ai-knowledge/1
title: Stack document
audience: [developer, agent]
---
# Stack Document

The single place where technology lives, for developers and agents turning the stack-neutral concept documents into code (P-DES-4). Rebuilding the project on a different stack means rewriting this file only. It names technology freely but holds no requirement, business rule, or behavior — those belong in a concept document.

## 0. In Plain Words

[3–5 sentences for non-specialists: what the system is built with and why.]

## 1. Runtime & Language

| Part | Language and version | Runtime | Package manager |
| --- | --- | --- | --- |
| [backend / frontend / …] | [language, version] | [runtime, version] | [tool] |

## 2. Capability Mapping

Every `C-x` from the concept documents appears here exactly once; a `C-x` without a row blocks synthesis, a row without a `C-x` is dead weight. *Names* lists the technology names the row introduces — library, product, framework, or language — each in backticks and separated by commas; a language or framework of §1 goes into the first row that uses it. No concept document contains one of these names (Stack Neutrality Rules of `MANIFEST.md`).

| ID | Capability (title) | Technology | Version constraint | Notes and limits | Names |
| --- | --- | --- | --- | --- | --- |
| [DOC]-C-[n] | [title from the concept document] | [library, service, or product] | [e.g. `^4.2`] | [limits that matter] | [e.g. `pdfplumber`, `Python`] |

## 3. Type Mapping

| Neutral type | Concrete type | Notes |
| --- | --- | --- |
| [e.g. Text, Integer, Timestamp, Id] | [stack type] | [precision, encoding, time zone] |

## 4. Module Mapping Conventions

[How a concept "module" materializes: files, classes, packages, naming, directory layout. With a user interface also how the color themes and font sizes of P-DES-9 materialize: where the semantic color tokens are defined, how the active theme is switched (e.g. a class or data attribute on the root element), and where the choice is stored.]

### Path patterns

Every file the project tracks is one of four kinds. Patterns are git pathspec globs: `*` matches within one path segment, `**` across any number of segments; `<module>` stands for the name a concept document gives a module in its §16.

| Kind | Pattern | Notes |
| --- | --- | --- |
| keep | [e.g. `public/logo.png`] | [one of the *Keep paths*: a binary asset or third-party code that no document can regenerate; never a file the project wrote itself] |
| module | [e.g. `src/<module>/**`] | [the files of one module] |
| test | [e.g. `tests/**`] | [every test file] |
| stack | [e.g. `package.json`] | [a package manifest, build or tool configuration, or container file; each file it matches has a row in *Stack files*. A lock file is no stack file: the package manager of §1 writes it] |

### Layering chain

The layers of the project from the domain outward (P-DES-3, P-ARCH-1): a layer imports only from layers above its row. `gam-engineering/tools/architecture-check.mjs layers` turns this table into the rules of the architecture check; without it only the cycle rule runs. Write `none` below the heading if the project has no layers.

| Layer | Path |
| --- | --- |
| [e.g. `domain`] | [e.g. `src/domain`] |
| [e.g. `application`] | [e.g. `src/application`] |
| [e.g. `ui`] | [e.g. `src/ui`] |

### Stack files

One row per tracked stack file, that is, per file a `stack` pattern matches. *Content* is the file's full content apart from comments, complete enough to write the file anew: every dependency with its exact version, every script, every setting that differs from the tool's default. A file too long for a cell goes below the table as a fenced block under a heading with its path, and the cell names that heading.

| Path | Purpose | Content |
| --- | --- | --- |
| [e.g. `package.json`; the file's path, not a pattern] | [what the file configures] | [the full content apart from comments] |

## 5. Error Mapping Conventions

[How `E-x` conditions materialize: exceptions, result types, status codes, error payload shape.]

## 6. Test Framework Mapping

[How the test tables of §17 become executable tests: runner, layout, naming that carries the `AC` and requirement IDs, mocking at capability boundaries.]

## 7. Configuration & Secrets

[How neutral configuration parameters materialize (P-DES-6), naming, where secrets come from and how they stay out of the repo.]

## 8. Build, Run, Deploy

```bash
[exact commands: install, run locally, test, lint, build, deploy]
```

[CI pipeline in plain words: stages and what blocks a merge.]

## 9. Stack ADRs

| Decision | Capabilities | Reason |
| --- | --- | --- |
| [why this stack, or why this technology for a capability] | [`C-x` IDs with titles, or — for the whole stack] | [one or two sentences] |

## 10. Technology Skills

The installed skills that `/gam-engineering implement` and `review` load for this stack (P-DES-7). Keep one skill per situation; two skills covering the same framework rules stay out (e.g. one React skill, not two). Write `none` if the stack needs no technology skill.

| Situation | Skill | Loaded by |
| --- | --- | --- |
| [e.g. building or changing a screen or component] | [skill name] | [implement / review / both] |

Preset for a web frontend, offered by setup (delete the rows that do not apply):

| Situation | Skill | Loaded by |
| --- | --- | --- |
| Building or changing a screen or component | `frontend-design` | implement |
| Proving a story that changes the interface against the running app (P-DES-8) | `webapp-testing` | implement (*Finish*), review |
| Auditing accessibility and UX of changed interface code | `web-design-guidelines` | review |
| Writing React or Next.js code, if §1 names React | `react-best-practices` | implement, review |
| Building components with shadcn/ui, if §1 or §2 names it | `shadcn` | implement |
| Building animations, transitions, or overlays (modals, drawers, toasts), if the interface has or plans them | `emil-design-eng` | implement |
| Fetching and caching server data, if §1 names React | `tanstack-query-expert` | implement, review |

Libraries for P-DES-11, offered by setup together with the preset (delete the rows that do not apply):

| Need | Library | How it is added |
| --- | --- | --- |
| Controls: switch, toggle group, tooltip, popover, slider, tabs, if §1 or §2 names shadcn/ui | shadcn/ui (Radix Primitives) | `pnpm dlx shadcn add <component>` |
| Charts, if the interface shows any | Recharts | package manager |
| Data tables with sorting, filtering, paging, if the interface shows any | TanStack Table | package manager |
| Server-state fetching and caching | TanStack Query | package manager |

## 11. Storage mapping & migration state

How the records of the concepts are stored, and how far the migrations have run. Write `none` if the system stores no data. The record and field rows themselves live in the concept documents (*Persisted layout*); this section holds only the technology side.

### Stored names

| Record | Store | Physical name | Indexes |
| --- | --- | --- | --- |
| [the *Stored as* name of a record in a concept's *Persisted layout*] | [the data store of §2] | [the table, collection, file, or key prefix the store keeps it under] | [indexes that enforce nothing, with their fields; `—` for none] |

### Migrations

| Migration files | Heads procedure | Migration state |
| --- | --- | --- |
| [patterns of the migration files, each in backticks; they are kept by a rebuild] | [the command or steps that report the head IDs from the migration files alone, without a data store] | [the head IDs that procedure reports now, each in backticks, separated by commas; every head where the scheme has several, e.g. `0007`] |
