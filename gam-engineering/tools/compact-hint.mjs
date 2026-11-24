// Stop hook of the gam-engineering skill (P-WS-7, P-WS-12): the hint to run /compact before stepping away. After a pause
// longer than the cache lifetime the next turn pays for the whole context again, and /compact is cheapest while the
// cache is warm. limit-statusline.mjs stores the context use (context) in the session's bridge file; this hook says once
// when it reaches env.GAM_ENGINEERING_SESSION_THRESHOLD percent (default 50) and again at every further 10-point step.
// compactStep in the file is the last step announced; a context below it (a compaction happened) lowers it, so the hints
// start over. The hint goes to the developer as systemMessage and never blocks. env.GAM_ENGINEERING_LIMIT_GUARD off
// silences it, like the other limit hints. The hook never fails: on any error it exits 0 and says nothing.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { readLimitSettings, readState, statePath, writeState } from "./limit-guard.mjs";

const STEP = 10;

// The step a context use has reached: 0 below the threshold, 1 at it, 2 ten points above it, and so on.
export function stepOf(context, threshold) {
  if (typeof context !== "number" || !(context >= threshold)) return 0;
  return Math.floor((context - threshold) / STEP) + 1;
}

export function hintMessage(context) {
  return `gam-engineering (P-WS-7): the context is at ${Math.round(context)} %. Before you step away, run /compact: after a longer pause the cache is cold and the whole context is billed again, and /compact is cheapest while the cache is warm.`;
}

function runHook() {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return;
  }
  const settings = readLimitSettings();
  if (!settings.on) return;
  const path = statePath(input.session_id);
  if (!path) return;
  const state = readState(path);
  if (!state || typeof state.context !== "number") return;
  const step = stepOf(state.context, settings.threshold);
  const last = typeof state.compactStep === "number" ? state.compactStep : 0;
  if (step === last) return;
  writeState(path, { ...state, compactStep: step });
  if (step > last) process.stdout.write(JSON.stringify({ systemMessage: hintMessage(state.context) }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runHook();
  } catch {
    // Never fail a Stop because of the hint.
  }
  process.exit(0);
}
