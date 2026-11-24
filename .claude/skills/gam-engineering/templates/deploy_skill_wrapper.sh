#!/usr/bin/env bash
# Launcher (Linux, macOS): deploys the skill(s) of this repo with deploy-skill.mjs of the gam-engineering skill.
# Template: gam-engineering skills/gam-engineering/templates/deploy_skill_wrapper.sh (Windows: deploy_skill_wrapper.cmd).
# Arguments go through: --what-if, --skills-root <folder>. Needs Node and the installed gam-engineering skill.
# Started from a file manager (no terminal, TERM unset): reopens itself in Konsole. Error: waits for Enter there.
here=$(dirname "$(readlink -f "$0")")
if [ ! -t 0 ] && [ ! -t 1 ] && [ -z "${TERM:-}" ] && [ -z "${DEPLOY_SKILL_IN_TERMINAL:-}" ] \
    && [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ] && command -v konsole >/dev/null; then
  DEPLOY_SKILL_IN_TERMINAL=1 exec konsole -e "$here/$(basename "$0")" "$@"
fi
tool="$here/skills/gam-engineering/scripts/deploy-skill.mjs"
[ -f "$tool" ] || tool="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/gam-engineering/scripts/deploy-skill.mjs"
[ -f "$tool" ] || tool="$HOME/.claude/skills/gam-engineering/scripts/deploy-skill.mjs"
pause() { [ -n "${DEPLOY_SKILL_IN_TERMINAL:-}" ] && read -r -p "Press Enter to close..." _; }
if [ ! -f "$tool" ]; then
  echo "ERROR: deploy-skill.mjs not found - deploy the gam-engineering skill first."
  pause
  exit 1
fi
if ! node "$tool" --root "$here" "$@"; then
  echo
  echo "Deploy failed - see the error above."
  pause
  exit 1
fi
if [ -n "${DEPLOY_SKILL_IN_TERMINAL:-}" ]; then
  echo
  echo "Closing in 5 seconds..."
  sleep 5
fi
exit 0
