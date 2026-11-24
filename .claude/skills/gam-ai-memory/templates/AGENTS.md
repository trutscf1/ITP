# Agent Entry Point

All AI agents — Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, Cursor — must read [gam-ai-memory/CLAUDE.md](gam-ai-memory/CLAUDE.md) first and follow it.

- **Before any of these:** run `node gam-ai-memory/tools/agent-memory.mjs detect`; its `entry:` line says which one applies. `agent-memory.mjs read` prints what the agents already remember about this project.
- **Start of a session:** [gam-ai-memory/prompts/startup.md](gam-ai-memory/prompts/startup.md)
- **End of a session:** [gam-ai-memory/prompts/handover.md](gam-ai-memory/prompts/handover.md) — never end a session that changed something without it.
- **At a merge into the integration branch:** [gam-ai-memory/prompts/sync.md](gam-ai-memory/prompts/sync.md) — the light update between handovers.
- **Last session ended without a handover** (timeout, session limit): [gam-ai-memory/prompts/recover.md](gam-ai-memory/prompts/recover.md)
- **Where to find what:** [gam-ai-memory/README_AI.md](gam-ai-memory/README_AI.md)
