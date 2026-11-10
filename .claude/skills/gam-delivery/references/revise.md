# Revise

Loaded by `/gam-engineering revise <MR>` (skill `gam-delivery`), for an MR the agent authored that has open review threads:

1. Collect every unresolved thread on the MR (the project's `gam-engineering/agents/issue-tracker.md` has the command).
2. Call the Skill tool with `gam-v-receiving-code-review` and work through the threads under override 8 of [gam-delivery](../SKILL.md#overrides-for-the-delivery-skills): verify each point against the code, the issue, and the concept document, then fix it or answer with the reason. One point at a time, with the tests after each fix.
3. Show the drafted replies and the fix commits as one `Q<n>` (override 6 of [gam-delivery](../SKILL.md#overrides-for-the-delivery-skills)), then push and post the replies. Resolving a thread is the reviewer's decision, not the agent's.
4. If every thread is answered, continue with [merge](merge.md) for this MR; its step 1 stops while a thread is still unresolved.
