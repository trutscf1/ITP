---
doc: test-data
format: gam-ai-knowledge/1
title: Test data
audience: [developer, reviewer, agent]
---
# Test data

The invented sample data that the tests of this project read: golden dumps of the stored data and examples of the external contracts. Developers and agents read it before they add a file under `test-data/` or write a test that reads one, because a rebuilt project is proven against these files.

## Every value is invented

Every dump and every example is invented. Its values are invented and generated from the *Persisted layout* and *External contracts* tables of a concept, so it never holds data of a real person: no real name, email address, phone number, address, account, or free text taken from a real system. It is never exported or copied from a production data store, a log, or a ticket. Use values that are obviously fake, such as `Quiz 1` or `user-1@example.org`. [SECURITY.md](../SECURITY.md) lists what else never belongs in this repository.

## Layout

One folder per feature, named like its concept file without `.md`: `test-data/<feature>/`. Dumps and examples are JSON files, not documents, so they carry no frontmatter. A concept with a *Persisted layout* has at least one golden dump here, and every row of its *External contracts* table names an example here.

| File | Holds | Written from |
| --- | --- | --- |
| Golden dump, `<name>.json` | A sample of the stored data at one migration state | The *Persisted layout* table of the concept |
| Contract example, `<contract>.json` | One request and its expected response, one outgoing call, or one exported file | One row of the *External contracts* table of the concept |
| `<name>.expected` | The expected content of a file that an outgoing contract writes | The contract example that names it |

## Golden dump

A golden dump holds records of the stored data under the names of the *Persisted layout*, at a migration state recorded in `STACK.md` §11. `migrationState` lists the head IDs of that state, the keys of `records` are the stored names of the records, and the keys of each row are the stored names of the fields.

```json
{ "migrationState": ["0007"], "records": { "quiz": [ { "id": 1, "title": "Quiz 1" } ] } }
```

## Contract example

A contract example is one JSON file per contract, named in the *Example* cell of its row. A value that changes from run to run (an id, a timestamp, a token) is written `<any>` and ignored when a result is compared with the example; every other field must match. The content depends on the direction of the contract:

| Direction | Content |
| --- | --- |
| `in` | `{ "contract": "<Contract>", "request": { … }, "response": { "status": …, "headers": { … }, "body": … } }` |
| `config` | `{ "contract": "<Contract>", "set": { "<KEY>": "<value>" }, "request": { … }, "response": { … } }` — the request and the response show the effect of the value |
| `out`, a call | `{ "contract": "<Contract>", "trigger": "<action>", "expectedCall": { "method": …, "url": …, "headers": { … }, "body": … }, "reply": { … } }` — `reply` is what the test double answers |
| `out`, a file | `{ "contract": "<Contract>", "trigger": "<action>", "file": "<name>.expected" }` — the expected file lies next to it and ends in `.expected` |
