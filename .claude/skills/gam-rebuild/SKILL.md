---
name: gam-rebuild
description: Rebuild commands of the gam-engineering process — rebuild the code of a project from its documentation on a branch rebuild/<date> (rebuild), list what in the documentation still blocks a rebuild without changing anything (rebuild check), and prove the documentation sufficient by rebuilding in a throwaway copy that ends in a verdict (rebuild drill). Use when /gam-engineering routes here, or when the developer runs /gam-rebuild, rebuild check, or rebuild drill, or when an unmerged rebuild/ branch exists.
---

# gam-rebuild

The rebuild commands of [gam-engineering](../gam-engineering/SKILL.md): the documentation in `gam-ai-knowledge/` is the source of truth, so the code can be deleted and built again from it (concept *Rebuild from documentation*). The review and merge of the resulting branch belong to [gam-delivery](../gam-delivery/SKILL.md) (`merge.md`, `review.md`).

Before the first step, apply the shared rules of the core once per session — skip what already ran when the core routed here — [Before anything else](../gam-engineering/SKILL.md#before-anything-else), [Asking the developer](../gam-engineering/SKILL.md#asking-the-developer), and [The contract](../gam-engineering/SKILL.md#the-contract). The model line and the delegation of [Models](../gam-engineering/references/models.md) apply to every command, also when the core routed here: print the start line first, and send each step the command's row names to a subagent of its tier. All three commands need git; outside a repository they refuse (`the rebuild commands need git`, P-GIT-7).

| Invocation | Procedure |
| --- | --- |
| `rebuild` | [references/rebuild.md](references/rebuild.md): check, branch, cross-check, deletion, scaffold, slices, green check, review and merge; resumes an unmerged `rebuild/` branch |
| `rebuild check` | [references/rebuild-check.md](references/rebuild-check.md): list what still blocks a rebuild; changes nothing and starts only on this command |
| `rebuild drill` | [references/rebuild-drill.md](references/rebuild-drill.md): rebuild in a throwaway copy and give a verdict; starts only on this command |

The mechanical rules run in the helper `gam-engineering/tools/rebuild.mjs` (`check`, `plan`, `verdict`), copied into a project by `migrate tools`; the procedures judge what a script cannot read.
