---
doc: qa-log
format: engineering-human/2
title: "Question log — Observability baseline"
audience: [developer, reviewer, agent]
concept: "observability.md"
---
# Question log — Observability baseline

The verbatim record of every question round of the concept [observability.md](observability.md), for anyone who wants to know why a decision was made and who answered what (P-GRILL-2). Answers are quoted exactly and never rewritten; the distilled decisions live in the concept's §13.

Question numbers continue from the highest `Q<n>` already in this file. Assumptions are numbered `A<n>` and become a question of the next round if rejected.

**How these rounds were answered.** The owner `trutscf1` gave the standing instruction on 2026-10-27 to work without questions. Every question below was therefore put in the usual form, with options and a recommendation, and answered by the agent with the recommended option. Each answer is marked "decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR". A decision the owner rejects in the merge request becomes a question of a new round, and the concept is changed before the merge. On 2026-11-02 the owner answered round 6: it confirms the other decisions (Q41) and replaces Q4, Q12, Q22, and Q31 (Q35–Q37, Q39).

## Round 1 — 2026-10-27 — grill, goal and scope (agent for `trutscf1`)

Applied standing decisions (not asked): P-GOAL-1…3 (goal first, derivation chain), P-DOC-4 and P-DOC-6 (prefix `OBS`, work items in `work-items/observability/`), P-HUM-1…4 (dual-readable rows, Part H), P-DES-4 to P-DES-6 (no technology in the concept, neutral types, no hard-coded configuration), P-GRILL-1…5, P-GIT-5 (documentation in the same change), P-TEAM-4 and P-TEAM-5 (single owner, provisional IDs), P-MR-2 and P-MR-4 (review by another person, merge policy from `.claude/settings.json`). Goal check: the feature serves `G-1` through the need of the operator `R-2` in `GOAL.md` ("see errors and bottlenecks at once") and touches no non-goal; it must keep `G-1.S1` (start with one command, no service on the internet).

Assumptions stated with the round, none rejected:

- **A1**: The draft of 2026-10-06 (feature goal, two stories, ten acceptance criteria, ten requirements) is the starting point; its requirement IDs `OBS-F-1` to `OBS-F-10` keep their titles and are sharpened in place, new requirements continue from `OBS-F-11`.
- **A2**: The skill `privacy-by-design` is not installed in this session; the agent applies its procedure itself (which data is really needed, how long it is kept, how it is deleted, which rights a person has) and refers legal questions to the school management. The precedent is `public-content.qa-log.md`, A32.
- **A3**: Concept branch `concept/observability` from `origin/dev`, tracking issue #114; the feature issue is #88, the story issues are #82 and #83.
- **A4**: Observability stays infrastructure, not a sixth unit (`scaffolding.md` Q1, ADR-0001): the collector, the stores, and the dashboard tool are containers of the local stack without a health report of their own.

❓ **Q1** - **Deviations**: Do the standing decisions listed above and the assumptions A1–A4 apply to this feature unchanged? Options: Apply unchanged / Reject an assumption / Deviate from a decision

➡️ Apply unchanged

> **Answer:** Apply unchanged (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q2** - **Feature goal wording**: The draft goal says "every service", but the glossary avoids "service" and calls the five processes units. Which wording does §1 use? Options: Keep the goal, say "unit" / Keep the goal as it is / Narrow it to self-hosting (`G-1.S1`)

➡️ Keep the goal, say "unit"

> **Answer:** Keep the goal, say "unit" (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q3** - **Instrumented units**: `OBS-AC-1.1` names only web, storage API, and worker; the system has five units (`SCF-F-1`). Which units deliver telemetry? Options: All five units / Only the three named / The four with own code, without `cms`

➡️ All five units

> **Answer:** All five units (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q4** - **Optional stack**: `OBS-AC-1.5` makes the observability stack optional. Does it start by default, and what happens to the units without it? Options: Opt-in profile, units unaffected without it / Always part of the local stack / A separate stack definition file

➡️ Opt-in profile, units unaffected without it

> **Answer:** Opt-in profile, units unaffected without it (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — replaced by Q35 on 2026-11-02

❓ **Q5** - **Where alerts appear**: E-mail delivery is a service on the internet and must be switchable off (`SCF-NF-2`). Where does a firing alert show? Options: Alert list of the dashboard tool only / Also e-mail behind a switch / Also on the status page of `web`

➡️ Alert list of the dashboard tool only

> **Answer:** Alert list of the dashboard tool only (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q6** - **Personal data in telemetry**: Requests carry IP addresses, member IDs, file names, and share-link tokens. Which identifiers of a person may telemetry hold? Options: None — no person identifier at all / The member's surrogate ID, kept 7 days / Everything the unit sees

➡️ None — no person identifier at all

> **Answer:** None — no person identifier at all (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q7** - **Browser telemetry**: `OBS-AC-1.3` speaks of "a request from the frontend". Does the browser send telemetry too? Options: No — a trace starts at the first unit / Yes — browser spans through the proxy

➡️ No — a trace starts at the first unit

> **Answer:** No — a trace starts at the first unit (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

## Round 2 — 2026-10-27 — grill, stories and acceptance criteria (agent for `trutscf1`)

Assumptions stated with the round, none rejected:

- **A5**: The technology names in the criteria of 2026-10-06 (OpenTelemetry, Prometheus, Loki, Tempo, Grafana) are replaced by the neutral names *collector*, *metric store*, *log store*, *trace store*, and *dashboard tool*; the technology stands in `STACK.md` §1 (P-DES-4).
- **A6**: "Operations dashboard" is the name for a page of the dashboard tool, because "dashboard" alone already means the member's start page in the web client (`PUB-F-12`). It goes into the glossary with *telemetry*, *observability stack*, *trace*, and *alert rule*.
- **A7**: An error in the error rate is a response with a server error status (500–599); client errors (400–499) are the caller's fault and do not count.
- **A8**: The priorities stay: `OBS-US-1` Must, `OBS-US-2` Should.

❓ **Q8** - **Silent unit**: A unit that crashes sends no errors, so the error-rate alert stays quiet. Add an alert for a unit that stops reporting? Options: Yes, new criterion `OBS-AC-2.8` / No, the status page is enough

➡️ Yes, new criterion `OBS-AC-2.8`

> **Answer:** Yes, new criterion `OBS-AC-2.8` (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q9** - **One alert per criterion**: `OBS-AC-2.3` holds three triggers in one row, against "one statement per row". Split it? Options: Split — 2.3 error rate, 2.6 storage, 2.7 queue / Keep one criterion

➡️ Split — 2.3 error rate, 2.6 storage, 2.7 queue

> **Answer:** Split — 2.3 error rate, 2.6 storage, 2.7 queue (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q10** - **Health requests**: Container health checks and the status page call `/health` every few seconds. Do these requests count in telemetry? Options: Excluded entirely / Counted, not traced or logged / Treated like any request

➡️ Excluded entirely

> **Answer:** Excluded entirely (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q11** - **Metrics of later features**: Upload throughput, waiting jobs, and storage usage come from features not built yet (R5, R9). How does R2 handle them? Options: R2 fixes the metric contract, panels show "No data" until R5 and R9 emit / R2 builds the metrics itself in `storage` and `worker` / Leave the panels out until R5 and R9

➡️ R2 fixes the metric contract, panels show "No data" until R5 and R9 emit

> **Answer:** R2 fixes the metric contract, panels show "No data" until R5 and R9 emit (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q12** - **Address of the dashboard tool**: How does an operator reach it? Options: Through the reverse proxy under `/observability`, with its own login / A host port bound to the server itself / Through the proxy under the product name

➡️ Through the reverse proxy under `/observability`, with its own login

> **Answer:** Through the reverse proxy under `/observability`, with its own login (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — replaced by Q36 on 2026-11-02

❓ **Q13** - **Retention**: How long are telemetry data kept? Options: Logs and traces 7 days, metrics 15 days, configurable within limits / 30 days for everything / Limited by disk size only

➡️ Logs and traces 7 days, metrics 15 days, configurable within limits

> **Answer:** Logs and traces 7 days, metrics 15 days, configurable within limits (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q14** - **Alert thresholds**: The criteria name 5 % and 90 %. Are thresholds fixed or configuration? Options: Configuration with these defaults / Fixed in the rule files

➡️ Configuration with these defaults

> **Answer:** Configuration with these defaults (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

## Round 3 — 2026-10-27 — grill, requirements (agent for `trutscf1`)

Assumptions stated with the round, none rejected:

- **A9**: Alert rules are evaluated every 60 seconds; a rule whose condition is false at an evaluation is no longer firing.
- **A10**: A unit exports metrics every 15 seconds by default (configuration `TELEMETRY_EXPORT_INTERVAL_MS`).
- **A11**: Every log entry is also written as one JSON line to the unit's standard output, so the container runtime's log command works without the observability stack.
- **A12**: The dashboard tool and the stores make no connection to the internet: update checks, usage reporting, and plugin downloads are off (`G-1.S1`).

❓ **Q15** - **Alert windows**: How are the four alert conditions measured? Options: Error rate over 5 minutes with at least 20 requests; storage over the threshold for 5 minutes; waiting jobs rising at each of 3 steps of 5 minutes to at least 10; silent for 2 minutes after reporting in the last 24 hours / Shorter windows of 1 minute each

➡️ Error rate over 5 minutes with at least 20 requests; storage over the threshold for 5 minutes; waiting jobs rising at each of 3 steps of 5 minutes to at least 10; silent for 2 minutes after reporting in the last 24 hours

> **Answer:** Error rate over 5 minutes with at least 20 requests; storage over the threshold for 5 minutes; waiting jobs rising at each of 3 steps of 5 minutes to at least 10; silent for 2 minutes after reporting in the last 24 hours (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q16** - **No data**: A fresh installation has no upload, queue, or storage metrics yet. What state does an alert rule without data have? Options: Normal, not firing / Its own "no data" alert

➡️ Normal, not firing

> **Answer:** Normal, not firing (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q17** - **Redaction**: How are passwords, tokens, e-mail addresses, and IP addresses kept out of telemetry? Options: Two layers — the unit by attribute name, the collector by attribute name and text pattern / In the unit only / In the collector only

➡️ Two layers — the unit by attribute name, the collector by attribute name and text pattern

> **Answer:** Two layers — the unit by attribute name, the collector by attribute name and text pattern (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q18** - **Paths in telemetry**: A raw path can hold a share-link token or a file ID. What does telemetry record? Options: The route pattern the unit matched, never the raw path or the query / The raw path without the query

➡️ The route pattern the unit matched, never the raw path or the query

> **Answer:** The route pattern the unit matched, never the raw path or the query (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q19** - **Collector unreachable**: What does a unit do when the collector does not answer, for example without the profile? Options: Keep working, buffer at most 2048 items per kind and drop the oldest, no dependency check / Report `degraded` through a dependency check

➡️ Keep working, buffer at most 2048 items per kind and drop the oldest, no dependency check

> **Answer:** Keep working, buffer at most 2048 items per kind and drop the oldest, no dependency check (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q20** - **Sampling**: Which share of traces is kept? Options: All, ratio 1.0 as configuration / One in ten

➡️ All, ratio 1.0 as configuration

> **Answer:** All, ratio 1.0 as configuration (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q21** - **Where the telemetry code lives**: Five units of four owners need the same instrumentation. Where is it built? Options: A new shared package `telemetry` of the Platform track; each unit owner adds the start call / A copy in each unit / Inside the contracts package

➡️ A new shared package `telemetry` of the Platform track; each unit owner adds the start call

> **Answer:** A new shared package `telemetry` of the Platform track; each unit owner adds the start call (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q22** - **Accounts of the dashboard tool**: Who can log in, and what can they change? Options: One operator account from configuration, no self-registration, no anonymous access, stored dashboards read-only, lock after 5 failed logins / Self-registration of operators / Anonymous read access inside the server

➡️ One operator account from configuration, no self-registration, no anonymous access, stored dashboards read-only, lock after 5 failed logins

> **Answer:** One operator account from configuration, no self-registration, no anonymous access, stored dashboards read-only, lock after 5 failed logins (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — replaced by Q37 on 2026-11-02

❓ **Q23** - **Trace through a job**: How does the trace reach the `worker` job? Options: An optional field `traceContext` in the envelope of every job payload, added in the contracts core / A side table that maps job IDs to traces

➡️ An optional field `traceContext` in the envelope of every job payload, added in the contracts core

> **Answer:** An optional field `traceContext` in the envelope of every job payload, added in the contracts core (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q24** - **Trace context from outside**: A browser can send its own trace headers. Are they trusted? Options: The reverse proxy removes them, so every trace starts at the first unit / Units accept them

➡️ The reverse proxy removes them, so every trace starts at the first unit

> **Answer:** The reverse proxy removes them, so every trace starts at the first unit (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q25** - **Memory bound**: The stack must run on one own server next to five units and six data services. Is the observability stack limited? Options: At most 1.5 GB of memory for all its containers together / No limit

➡️ At most 1.5 GB of memory for all its containers together

> **Answer:** At most 1.5 GB of memory for all its containers together (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q26** - **Checking the stack configuration**: Retention, thresholds, and the operator password are configuration of third-party containers. Who checks them? Options: A check step that runs before the stores and the dashboard tool and stops the profile like `SCF-E-1` / Rely on the defaults of the tools

➡️ A check step that runs before the stores and the dashboard tool and stops the profile like `SCF-E-1`

> **Answer:** A check step that runs before the stores and the dashboard tool and stops the profile like `SCF-E-1` (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

## Round 4 — 2026-10-27 — artifact interactions (agent for `trutscf1`)

The existing parts of the system were checked against the requirements of round 3 (concept §14). Assumptions stated with the round, none rejected:

- **A13**: The image scan of `SCF-NF-6` covers the images of the observability profile like every other image of the stack definition; no exception is planned.
- **A14**: The status page of `web` (`SCF-F-8`) does not show the observability stack: it is not a unit and has no health report.
- **A15**: The load tests of R13 read their results in the operations dashboards of this feature; R13 adds no store of its own.

❓ **Q27** - **Changes to `scaffolding.md`**: The routing table, the package list (`SCF-F-18`), and the proxy behaviour change. When are they made? Options: By `trutscf1` in the MR of the slice that needs them / Now, in this concept MR

➡️ By `trutscf1` in the MR of the slice that needs them

> **Answer:** By `trutscf1` in the MR of the slice that needs them (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q28** - **Operator accounts in the privacy template**: The account of the dashboard tool is personal data of an operator, and `PUB-F-22` lists every kind of personal data. Add it? Options: Yes, in the MR of `OBS-US-2` slice 1 / No, operators are not members

➡️ Yes, in the MR of `OBS-US-2` slice 1

> **Answer:** Yes, in the MR of `OBS-US-2` slice 1 (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q29** - **Shared understanding**: Is the design tree complete, so that the work items and the concept (Phases 1–3) can be written? Options: Confirmed, write them / Another round first

➡️ Confirmed, write them

> **Answer:** Confirmed, write them (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

## Round 5 — 2026-10-27 — architecture and test concept (agent for `trutscf1`)

Assumptions stated with the round, none rejected:

- **A16**: The skill `doubt-driven-development` is not installed in this session; instead of the optional adversarial check before the Phase 4 gate, the agent read §1 and Part H against `GOAL.md` and Part S once more and fixed the findings in place (§13, Q32).
- **A17**: Phases 5 and 6 are written in the same merge request as Phases 1–4, as for `scaffolding.md`; the approval of the reviewer signs off the Phase 4 gate for the whole document, and a large change from the review restarts at Phase 1.

❓ **Q30** - **Slices**: How are the two stories cut? Options: By track — the Platform track builds the stack and the package, each unit owner instruments their unit / One slice per story

➡️ By track — the Platform track builds the stack and the package, each unit owner instruments their unit

> **Answer:** By track — the Platform track builds the stack and the package, each unit owner instruments their unit (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

❓ **Q31** - **Test seams**: Where do the tests run? Options: Package and file tests in CI; tests against the started stack locally until CI has a container runtime, as in `scaffolding.md` §17 / All against the started stack

➡️ Package and file tests in CI; tests against the started stack locally until CI has a container runtime, as in `scaffolding.md` §17

> **Answer:** Package and file tests in CI; tests against the started stack locally until CI has a container runtime, as in `scaffolding.md` §17 (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — replaced by Q39 on 2026-11-02

❓ **Q32** - **Adversarial check**: The feature handles data about persons. Run a check of §1 and Part H before the gate? Options: Self-check by the agent, findings fixed in place / Skip it

➡️ Self-check by the agent, findings fixed in place

> **Answer:** Self-check by the agent, findings fixed in place (Recommended) — decided by the agent on the owner's standing instruction of 2026-10-27; to be confirmed by trutscf1 in the MR — confirmed by trutscf1 on 2026-11-02 (Q41)

Findings of the self-check, all fixed in the document: Part H called the trace store a "database" (now "trace store"); H3 promised that alerts "notify" the operator (they only appear in the alert list, Q5); `OBS-AC-1.6` first named "the member's ID" without saying that telemetry holds none at all (now explicit, Q6).

## Round 6 — 2026-11-02 — revise the Phase 4 gate after the review of `tschudea07` (`trutscf1`)

The review of `tschudea07` on !22 (2026-11-02) asked for a human answer to the decisions of rounds 1–5, above all Q4, Q12, Q22, and Q31, and named a contradiction between `OBS-AC-1.4` and `OBS-F-4`. `trutscf1` answered in this session; the questions were asked as pop-ups and are recorded verbatim. Assumptions stated with the round, none rejected (numbered A70–A74 in the session; renumbered here to continue this log):

- **A18** (session A70): The concept names no technology in story titles. `OBS-US-1` is "Telemetry of every unit", `OBS-US-2` "Operations dashboards and alerts", also in Part H, the *Derives from* cells, `feature.md`, the story files and their file names; the issues #82 and #83 are renamed on GitLab.
- **A19** (session A71): The criteria that need storage and processing — `OBS-AC-1.3`, `OBS-AC-2.1`, `OBS-AC-2.6`, `OBS-AC-2.7` — go into slices blocked by R5 and R9; the silent-unit alert `OBS-AC-2.8` moves to a later slice as well. Slice 1 of `OBS-US-1` still depends only on R1.
- **A20** (session A72): The five images of the profile are pinned to exact tags in slice 1 of `OBS-US-1`, and the job `container-scan` (#149) scans them. The secret key lists gain `backupCodes`, `recoveryCode`, `otp` as fragments and `code`, `state` as exact keys (as fragments they would also remove `statusCode` and `stateful`); the lists are a contract of the package `telemetry` that R3 extends.
- **A21** (session A73): The notes of OBS-C-6 in `STACK.md` only map technology and point to the requirement IDs; the log rows of this branch in `ROADMAP-DETAILS.md` stand in date order.
- **A22** (session A74): Until R3 delivers the operator login, the dashboard tool is reachable only on a host port bound to `127.0.0.1`, with anonymous read-only access and nothing savable; whoever reaches it has a shell on the server.

❓ **Q35** - **!22 Profil vs. G-1.S1 (Q4)**: G-1.S1 verlangt 'das komplette System startet mit 1 Befehl'; der Agent hat Observability als Opt-in-Profil entschieden. Wie startet es? Options: Profil, standardmäßig an (Recommended) / Immer Teil des Stacks / Opt-in wie entschieden

➡️ Profil, standardmäßig an — `COMPOSE_PROFILES=observability` in the example configuration; the start command starts the profile, an operator can switch it off in the configuration; the units run without it; the deployed server (R14) runs it

> **Answer:** Profil, standardmäßig an (Recommended)

❓ **Q36** - **!22 Zugang ohne TLS (Q12)**: /observability über den Proxy würde Logins bis R14 per HTTP schicken. Wie erreichbar? Options: Bis R14 nur lokal (Recommended) / Proxy-Route nur mit TLS / Wie entschieden

➡️ Bis R14 nur lokal — a host port bound to `127.0.0.1` (SSH tunnel) until TLS; with R14 behind the reverse proxy under `/observability`, over HTTPS only

> **Answer:** Bis R14 nur lokal (Recommended)

❓ **Q37** - **!22 Login vs. Argon2id (Q22)**: Grafana hasht eigene Passwörter nicht mit Argon2id, die Schule verlangt 'mindestens Argon2ID bei hashes'. Wie anmelden? Options: Über identity (Recommended) / ADR-Ausnahme / Nur lokal ohne Login

➡️ Über identity — the reverse proxy asks `identity` for an operator session before it forwards to the dashboard tool, which trusts the login name set by the proxy and stores no password; depends on R3, until then local only (Q36, A22)

> **Answer:** Über identity (Recommended)

❓ **Q38** - **!22 Widerspruch OBS-AC-1.4 vs. OBS-F-4**: AC sagt 'jeder Eintrag hat eine Trace-ID', F-4 lässt sie ohne aktiven Span weg. Was gilt? Options: AC präzisieren (Recommended) / F-4 ändern

➡️ AC präzisieren — every log entry written inside a request or a job carries its trace ID; entries outside (start, shutdown) carry none

> **Answer:** AC präzisieren (Recommended)

❓ **Q39** - **!22 Stack-Tests in CI (Q31)**: Die meisten OBS-T-Tests laufen nur lokal gegen den gestarteten Stack. Welche werden CI-Jobs, sobald CI eine Container-Runtime hat (SCF-US-5, tschudea07)? Options: Alle Stack-Tests (Recommended) / Nur ein Smoke-Teil / Bleibt lokal

➡️ Alle Stack-Tests — one CI job `stack-test` starts the local stack with the profile and runs every stack test of §17 once SCF-US-5 provides a container runtime; until then they run locally

> **Answer:** Alle Stack-Tests (Recommended)

❓ **Q40** - **!22 Gate und #114**: Das MR ist das Phase-4-Gate, enthält aber schon Phase 5/6 (§16, §17); 'Closes #114' ist zu früh (Issues noch nicht geschnitten). Wie? Options: Gate für Phasen 1–6 (Recommended) / MR am Gate teilen

➡️ Gate für Phasen 1–6 — the approval of the MR signs off Phases 1–6 together; the MR says `Part of #114`, and #114 closes with `/engineering-human tickets observability`; position "6, test concept"

> **Answer:** Gate für Phasen 1–6 (Recommended)

❓ **Q41** - **!22 Übrige Entscheidungen**: Bestätigst du Q1–Q3, Q5–Q11, Q13–Q21, Q23–Q30 und Q32 so, wie der Agent sie am 27.10. entschieden hat (Liste in observability.qa-log.md)? Options: Alle bestätigen (Recommended) / Einzeln durchgehen

➡️ Alle bestätigen — each of those answers carries the note "confirmed by trutscf1 on 2026-11-02 (Q41)"; Q4, Q12, Q22, Q31 carry "replaced by Q35/Q36/Q37/Q39"

> **Answer:** Alle bestätigen (Recommended)

Asked in the same session and logged in `documentation/qa-log.md` (delivery questions of several merge requests), it applies here: **Q216** - **!22 Gewichte**: Die Story-Dateien sagen 8 (OBS-US-1) / 5 (OBS-US-2), GitLab #82/#83 sagen 5 / 3. Welche Zahl gilt? — **Answer:** Story-Dateien 8/5 (Recommended). The story files keep 8 and 5; #82 and #83 are set to them on GitLab.

## Open questions for the school management

Legal questions the agent does not decide (grill flow, personal data). They are not answered in this log; the owner takes them to the data-protection contact of the school and records the answers here.

❓ **Q33** - **Telemetry and personal data**: Telemetry holds no person identifier (no IP address, member ID, e-mail address, name, or file name), but it records when a request reached which route. Does it still count as personal data, and does the privacy policy template need a paragraph on it?

> **Answer:** open

❓ **Q34** - **Operator accounts**: On which lawful basis does an operator keep the login name of the people who may open the operations dashboards, and does the team's installation need an agreement for it?

> **Answer:** open
