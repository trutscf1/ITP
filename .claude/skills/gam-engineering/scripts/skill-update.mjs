#!/usr/bin/env node
// Updates the vendored skills (skills/gam-*, copied from upstream) from their upstream repositories and
// rewrites them: `name:` gets the `gam-v-` prefix and references to other vendored skills are renamed.
// Usage: node skill-update.mjs [--apply] [--only=<gam-name>[,<gam-name>...]]
// Without --apply nothing is written (dry run: lists what would change).
// Writes: the skill folders (except SOURCE.md and CREDITS.md, which are kept), each SOURCE.md and skill-deps.json.
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const only = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean)

const here = dirname(fileURLToPath(import.meta.url))
const manifestPath = join(here, 'skill-deps.json')
const skillsRoot = join(here, '..', '..')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const KEEP = new Set(['SOURCE.md', 'CREDITS.md'])
const TEXT = new Set(['.md', '.yaml', '.yml', '.json', '.txt', '.mjs', '.js', '.ts', '.sh', '.ps1', '.py'])
const today = new Date().toISOString().slice(0, 10)

const git = (cwd, ...a) => {
  const r = spawnSync('git', a, { cwd, encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`git ${a.join(' ')} failed: ${r.stderr}`)
  return r.stdout.trim()
}

const upstreamNames = manifest.skills.map((s) => s.name.replace(/^gam-v-/, ''))
// A reference is /name, `name` or "name" that is not part of a path (no word, dot or slash before, no slash after)
// and not a code word introduced by "word" (e.g. "the word `prototype`").
const refPattern = new RegExp(`(?<![\\w.~/-])(?<!word )([/\`"])(${upstreamNames.join('|')})(?![\\w/-])`, 'g')

const rewrite = (text, upstreamName, counter) => {
  let out = text.replace(/^(name:\s*)(?:gam-v-|gam-)?(\S+)/m, (_, p, n) => {
    counter.name++
    return `${p}gam-v-${n}`
  })
  out = out.replace(refPattern, (_, p, n) => {
    counter.refs++
    return `${p}gam-v-${n}`
  })
  return out
}

const listFiles = (dir, base = dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? (f === '.git' ? [] : listFiles(p, base)) : [relative(base, p).replaceAll('\\', '/')]
  })

const norm = (s) => s.replace(/\r\n/g, '\n')
const tmp = mkdtempSync(join(tmpdir(), 'skill-update-'))
const clones = new Map()
const clone = (repo) => {
  if (!clones.has(repo)) {
    const dir = join(tmp, String(clones.size))
    git(tmp, 'clone', '--depth', '1', '--quiet', repo, dir)
    clones.set(repo, { dir, commit: git(dir, 'rev-parse', 'HEAD') })
  }
  return clones.get(repo)
}

const summary = []
try {
  for (const s of manifest.skills) {
    if (only.length && !only.includes(s.name)) continue
    const { repo, path } = s.upstream
    const upstreamName = s.name.replace(/^gam-v-/, '')
    const { dir, commit } = clone(repo)
    const src = join(dir, path)
    if (!existsSync(join(src, 'SKILL.md'))) {
      summary.push(`${s.name}: ERROR upstream path ${path} has no SKILL.md`)
      continue
    }
    const dest = join(skillsRoot, s.name)
    const counter = { name: 0, refs: 0 }
    const changed = []
    const upstreamFiles = listFiles(src).filter((f) => !KEEP.has(f))
    for (const f of upstreamFiles) {
      const raw = readFileSync(join(src, f))
      const isText = TEXT.has(extname(f).toLowerCase())
      const next = isText ? Buffer.from(rewrite(raw.toString('utf8'), upstreamName, counter)) : raw
      const target = join(dest, f)
      const old = existsSync(target) ? readFileSync(target) : null
      const same = old && (isText ? norm(old.toString('utf8')) === norm(next.toString('utf8')) : old.equals(next))
      if (!same) {
        changed.push(`${old ? 'M' : 'A'} ${f}`)
        if (apply) {
          mkdirSync(dirname(target), { recursive: true })
          writeFileSync(target, next)
        }
      }
    }
    const stale = existsSync(dest) ? listFiles(dest).filter((f) => !KEEP.has(f) && !upstreamFiles.includes(f)) : []
    for (const f of stale) {
      changed.push(`D ${f}`)
      if (apply) rmSync(join(dest, f))
    }
    // SKILL.md identical to upstream apart from the name line?
    const up = readFileSync(join(src, 'SKILL.md'), 'utf8')
    const stripName = (t) => norm(t).replace(/^name:.*$/m, '')
    const identical = stripName(rewrite(up, upstreamName, { name: 0, refs: 0 })) === stripName(up)
    if (apply && (changed.length || s.upstream.commit !== commit)) {
      const sp = join(dest, 'SOURCE.md')
      let t = readFileSync(sp, 'utf8')
      t = t.replace(/(Upstream commit at the time of copying: `)[0-9a-f]{7,40}(`)/, `$1${commit}$2`)
      t = t.replace(/^- Copied on:.*$/m, `- Copied on: ${today}, by \`skills/gam-engineering/scripts/skill-update.mjs\` from a fresh clone of the upstream`)
      t = t.replace(
        /^- Upstream SKILL.md identical.*$/m,
        `- Upstream SKILL.md identical to this copy apart from the \`name:\` line and renamed references: ${identical ? 'yes' : 'no'}`,
      )
      writeFileSync(sp, t)
      s.upstream.commit = commit
      s.upstream.copied = today
      s.upstream.identical = identical
    }
    summary.push(
      `${s.name}: ${s.upstream.commit.slice(0, 7)} -> ${commit.slice(0, 7)}, ${changed.length} file(s) changed, ${counter.refs} ref(s) renamed${
        changed.length ? '\n    ' + changed.join('\n    ') : ''
      }`,
    )
  }
  if (apply) writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
console.log(summary.join('\n'))
console.log(apply ? '\nApplied.' : '\nDry run; pass --apply to write.')
