# Agent Entry Point

All AI agents — Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, Cursor — must read [gam-ai-memory/CLAUDE.md](gam-ai-memory/CLAUDE.md) first and follow it.

- **Start of a session:** [gam-ai-memory/prompts/startup.md](gam-ai-memory/prompts/startup.md)
- **End of a session:** [gam-ai-memory/prompts/handover.md](gam-ai-memory/prompts/handover.md) — never end a session that changed something without it.
- **Where to find what:** [gam-ai-memory/README_AI.md](gam-ai-memory/README_AI.md)
- Long-term project knowledge — goal, roadmap and status, concepts, decisions, glossary, stack: [gam-ai-knowledge/](gam-ai-knowledge/); read `GOAL.md` and `CONTEXT.md` first.

## AI chat export

Rules for every AI agent in this repo (P-TEAM-6). Setup and `migrate tools` copy this section into every agent instruction file the repo has (`AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/`), so agents that do not load the gam- skills follow it too.

1. **Hook:** At the start of every session in this repo, run `node gam-engineering/tools/prompt-export.mjs install-hook` without asking; it changes nothing when the hook is already active. Only if you cannot run it or it fails, tell the person why and give them the command, adding that their chats are not exported otherwise. If it prints `username unknown`, ask once for their GitHub or GitLab user name and set it with `install-hook --username <name>`.
2. **Log it yourself:** Whatever your tool's own storage does not hold (questions to the person, their answers, approvals, rejections), append verbatim at once to `docs/prompts/<handle>/manual/<YYYY-MM-DD>.md`.
3. **Before handing in:** When the person says they are done or hand in, run `node gam-engineering/tools/prompt-export.mjs export --stage` and propose a commit of `docs/prompts/<handle>`. Say that anything discussed afterwards reaches the repo only with the next commit.
4. **Web chats:** When the person mentions an AI chat in the browser (claude.ai, ChatGPT, Gemini, Copilot on the web), remind them of `docs/prompts/<handle>/manual/web-<YYYY-MM-DD>-<topic>.md` (tool, date, share link if any, their prompts verbatim) and offer to create it.
5. **Do not touch exports:** Files under `docs/prompts/` outside `manual/` are written only by the script. Never change, shorten, or delete them, not even on request; to keep chats out of the repo, point to the mode `local` (`/gam-engineering settings prompts local`).
