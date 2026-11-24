// The number of a linked git worktree (P-WS-13, Q588): the lowest free number from 1, recorded in
// <common git dir>/gam-worktrees.json (path → number) and reserved while the worktree exists. Its own module, so that
// worktree-setup.mjs (which also imports prompt-export.mjs) and prompt-export.mjs (worktree letter) share it without an
// import cycle. Node, no dependencies.
import { readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const slash = (path) => resolve(path).replace(/\\/g, "/");
export const same = (a, b) => (process.platform === "win32" ? slash(a).toLowerCase() === slash(b).toLowerCase() : slash(a) === slash(b));

// The lowest free number from 1 for this worktree, recorded in <common git dir>/gam-worktrees.json (path → number) under
// a short lock file, as next-q does (A251). Rows of worktrees that no longer exist are dropped. Without `write` nothing
// is written and the number is only worked out.
export function numberFor(common, tree, main, alive, write = true) {
  const file = join(common, "gam-worktrees.json");
  const lock = `${file}.lock`;
  const compute = () => {
    let rows = {};
    try {
      rows = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      // no numbers yet
    }
    const kept = Object.fromEntries(Object.entries(rows).filter(([path]) => alive.some((item) => same(item, path)) && !same(path, main)));
    const own = Object.entries(kept).find(([path]) => same(path, tree));
    if (own) return { number: own[1], rows: kept, known: true };
    const taken = new Set(Object.values(kept));
    let number = 1;
    while (taken.has(number)) number += 1;
    return { number, rows: { ...kept, [slash(tree)]: number }, known: false };
  };
  if (!write) return { ...compute(), file };
  let locked = false;
  for (let attempt = 0; attempt < 50 && !locked; attempt += 1) {
    try {
      writeFileSync(lock, String(process.pid), { flag: "wx" });
      locked = true;
    } catch {
      try {
        if (Date.now() - statSync(lock).mtimeMs > 10_000) rmSync(lock, { force: true });
      } catch {
        // the lock went away meanwhile
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
  try {
    const result = compute();
    const text = `${JSON.stringify(result.rows, null, 2)}\n`;
    let before = "";
    try {
      before = readFileSync(file, "utf8");
    } catch {
      // first number
    }
    if (before !== text) writeFileSync(file, text);
    return { ...result, file };
  } finally {
    if (locked) rmSync(lock, { force: true });
  }
}
