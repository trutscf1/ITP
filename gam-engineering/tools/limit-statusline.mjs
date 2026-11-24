// Status line command of the gam-engineering skill (P-WS-12). Claude Code passes the session's data on stdin, and only
// here the plan's usage limits (rate_limits.five_hour and .seven_day, for Pro, Max, and Ultra subscribers, after the
// first answer). The script writes them to the session's bridge file, which limit-guard.mjs reads, and prints one line:
// model, context use, and the two limits. Under env.GAM_ENGINEERING_LIMIT_GUARD off it prints the line but writes no
// file. The context use is stored also without rate_limits (context, read by compact-hint.mjs). The rewrite keeps
// firstSeen (the session age of limit-guard.mjs), compactStep (compact-hint.mjs), and notified from the previous file. It never
// fails: on any error it prints what it has.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { readLimitSettings, readState, statePath, writeState } from "./limit-guard.mjs";

export function line(input) {
  const parts = [];
  if (input.model?.display_name) parts.push(input.model.display_name);
  const context = input.context_window?.used_percentage;
  if (typeof context === "number") parts.push(`ctx ${Math.round(context)}%`);
  const five = input.rate_limits?.five_hour?.used_percentage;
  if (typeof five === "number") parts.push(`5h ${Math.round(five)}%`);
  const seven = input.rate_limits?.seven_day?.used_percentage;
  if (typeof seven === "number") parts.push(`7d ${Math.round(seven)}%`);
  return parts.join(" · ");
}

function record(input) {
  if (!readLimitSettings().on) return;
  const context = input.context_window?.used_percentage;
  const hasContext = typeof context === "number";
  if (!input.rate_limits && !hasContext) return;
  const path = statePath(input.session_id);
  if (!path) return;
  const previous = readState(path) ?? {};
  // The context use is stored always (compact-hint.mjs reads it), the limits only when Claude Code gives them.
  const next = {
    ...(typeof previous.firstSeen === "number" ? { firstSeen: previous.firstSeen } : {}),
    ...(typeof previous.compactStep === "number" ? { compactStep: previous.compactStep } : {}),
    ...(hasContext ? { context } : typeof previous.context === "number" ? { context: previous.context } : {}),
  };
  if (input.rate_limits) {
    Object.assign(next, {
      updated: Date.now(),
      five_hour: input.rate_limits.five_hour ?? null,
      seven_day: input.rate_limits.seven_day ?? null,
    });
  } else {
    for (const key of ["updated", "five_hour", "seven_day"]) if (key in previous) next[key] = previous[key];
  }
  next.notified = Array.isArray(previous.notified) ? previous.notified : [];
  writeState(path, next);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    // Unreadable input: print an empty line.
  }
  try {
    record(input);
  } catch {
    // The line matters more than the bridge file.
  }
  process.stdout.write(`${line(input)}\n`);
  process.exit(0);
}
