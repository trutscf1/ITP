#!/usr/bin/env node
// Updates the vendored skills (skills/gam-v-*, copied from upstream) in two steps, so that an AI checks each new
// version against the gam- skills before it is applied (references/skill-update-check.md):
//   --stage   clones each upstream, rewrites it (`name:` becomes the gam name, references and ../<name>/ paths to
//             vendored skills of the same repository are renamed, upstream.dropFrontmatter keys removed), re-applies the skill's local.patch, and writes the result to
//             <repo>/.skill-update/<gam-name>/ plus the report <repo>/.skill-update/report.md. skills/ is not touched.
//   --apply   copies the staged skills into skills/ (SOURCE.md, CREDITS.md and local.patch are kept), updates
//             SOURCE.md and skill-deps.json, and removes their staging. A skill whose patch failed is skipped.
//   --patch=<gam-name>  writes skills/<gam-name>/local.patch: the difference between the upstream at the commit the
//             copy records (rewritten like an update) and the folder as it is now. Edit the folder, then run it.
//   (none)    dry run: --stage's summary without writing anything.
// --only=<gam-name>[,...] limits every mode; --root=<skills dir> points at another skills folder (tests).
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, mkdtempSync, rmSync, existsSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, relative, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const opt = (name) => (args.find((a) => a.startsWith(`--${name}=`)) || '').slice(name.length + 3)
const stage = args.includes('--stage')
const apply = args.includes('--apply')
const patchFor = opt('patch')
const only = opt('only').split(',').filter(Boolean)

const here = dirname(fileURLToPath(import.meta.url))
const skillsRoot = opt('root') ? resolve(opt('root')) : join(here, '..', '..')
const manifestPath = join(skillsRoot, 'gam-engineering', 'scripts', 'skill-deps.json')
const stageRoot = join(skillsRoot, '..', '.skill-update')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const KEEP = new Set(['SOURCE.md', 'CREDITS.md', 'local.patch'])
const TEXT = new Set(['.md', '.yaml', '.yml', '.json', '.txt', '.mjs', '.js', '.ts', '.sh', '.ps1', '.py', '.cmd', ''])
const today = new Date().toISOString().slice(0, 10)

const run = (cmd, cwd, a, ok = [0]) => {
  const r = spawnSync(cmd, a, { cwd, encoding: 'utf8' })
  if (!ok.includes(r.status)) throw new Error(`${cmd} ${a.join(' ')} failed: ${r.stderr}`)
  return r
}
const git = (cwd, ...a) => run('git', cwd, ['-c', 'core.autocrlf=false', ...a]).stdout.trim()

// The upstream skill name: `upstream.name`, or the gam name without its prefix.
const upstreamNameOf = (s) => s.upstream.name || s.name.replace(/^gam-v-/, '')
// Per upstream repository: upstream skill name -> gam name. References are renamed only between skills of the same
// repository, so a word that names a skill in one repository (e.g. `animate`) stays as is in another.
const namesByRepo = new Map()
for (const s of manifest.skills) {
  if (!namesByRepo.has(s.upstream.repo)) namesByRepo.set(s.upstream.repo, new Map())
  namesByRepo.get(s.upstream.repo).set(upstreamNameOf(s), s.name)
}
// A reference is /name, `name` or "name" that is not part of a path (no word, dot or slash before, no slash after),
// not a call or JSX prop (no "(" or "=" after, e.g. Motion's `animate(` and `animate={`), and not a code word
// introduced by "word" (e.g. "the word `prototype`").
const refPatternFor = (names) => new RegExp(`(?<![\\w.~/-])(?<!word )([/\`"])(${[...names].join('|')})(?![\\w/(=-])`, 'g')
// A sibling path ../name/ points at the folder of another vendored skill, which is installed under its gam name.
const siblingPatternFor = (names) => new RegExp(`(\\.\\./)(${[...names].join('|')})(?=/)`, 'g')
// `upstream.dropFrontmatter`: SKILL.md frontmatter keys removed on every update, e.g. disable-model-invocation for a
// skill the gam- skills call through the Skill tool (Q436, Q567). It replaces a local.patch that only deletes a key.
const dropFrontmatter = (text, s) => {
  const keys = s.upstream.dropFrontmatter || []
  if (!keys.length) return text
  return text.replace(/^---\n[\s\S]*?\n---\n/, (fm) =>
    fm
      .split('\n')
      .filter((l) => !keys.some((k) => l.startsWith(`${k}:`)))
      .join('\n'),
  )
}

// `upstream.renameRefs: false` keeps every reference: for a skill whose own name is also a CLI or file name.
const rewrite = (text, s, counter) => {
  let out = text.replace(/^(name:\s*)(\S+)/m, (_, p) => {
    counter.name++
    return `${p}${s.name}`
  })
  if (s.upstream.renameRefs === false) return out
  const names = namesByRepo.get(s.upstream.repo)
  out = out.replace(refPatternFor(names.keys()), (_, p, n) => {
    counter.refs++
    return `${p}${names.get(n)}`
  })
  out = out.replace(siblingPatternFor(names.keys()), (_, p, n) => {
    counter.refs++
    return `${p}${names.get(n)}`
  })
  return out
}

const listFiles = (dir, base = dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((f) => {
        const p = join(dir, f)
        return statSync(p).isDirectory() ? (f === '.git' ? [] : listFiles(p, base)) : [relative(base, p).replaceAll('\\', '/')]
      })
    : []
const norm = (s) => s.replace(/\r\n/g, '\n')
const isText = (f) => TEXT.has(extname(f).toLowerCase())
// Text is compared and staged with LF line endings; git converts on checkout.
const readNorm = (p) => (isText(p) ? Buffer.from(norm(readFileSync(p, 'utf8'))) : readFileSync(p))
const sameFile = (a, b) => existsSync(a) && existsSync(b) && readNorm(a).equals(readNorm(b))
const selected = manifest.skills.filter((s) => !only.length || only.includes(s.name))

// Copies the files of `from` (except KEEP) into `to`, normalized, and deletes files of `to` that `from` lacks.
const syncInto = (from, to) => {
  const files = listFiles(from).filter((f) => !KEEP.has(f))
  const changed = []
  for (const f of files) {
    if (!sameFile(join(from, f), join(to, f))) {
      changed.push(`${existsSync(join(to, f)) ? 'M' : 'A'} ${f}`)
      mkdirSync(dirname(join(to, f)), { recursive: true })
      writeFileSync(join(to, f), readNorm(join(from, f)))
    }
  }
  for (const f of listFiles(to).filter((f) => !KEEP.has(f) && !files.includes(f))) {
    changed.push(`D ${f}`)
    rmSync(join(to, f))
  }
  return changed
}

// Unified diff of two folders (no index), with paths relative to the folders.
const diffDirs = (a, b) => {
  const tmp = mkdtempSync(join(tmpdir(), 'skill-diff-'))
  try {
    git(tmp, 'init', '--quiet')
    syncInto(a, tmp)
    git(tmp, 'add', '-A')
    git(tmp, '-c', 'user.name=skill-update', '-c', 'user.email=skill-update@localhost', 'commit', '--quiet', '--allow-empty', '-m', 'upstream')
    syncInto(b, tmp)
    git(tmp, 'add', '-A')
    return run('git', tmp, ['-c', 'core.autocrlf=false', 'diff', '--cached', '--binary']).stdout
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

// The rewritten upstream folder of skill `s` at `commit` (the recorded one by default), written to `out`.
const writeUpstream = (s, src, out, counter = { name: 0, refs: 0 }) => {
  for (const f of listFiles(src).filter((f) => !KEEP.has(f))) {
    const raw = readFileSync(join(src, f))
    mkdirSync(dirname(join(out, f)), { recursive: true })
    if (!isText(f)) {
      writeFileSync(join(out, f), raw)
      continue
    }
    const text = norm(rewrite(raw.toString('utf8'), s, counter))
    writeFileSync(join(out, f), Buffer.from(f === 'SKILL.md' ? dropFrontmatter(text, s) : text))
  }
  return counter
}

if (patchFor) {
  const s = manifest.skills.find((x) => x.name === patchFor)
  if (!s) throw new Error(`${patchFor} is not in skill-deps.json`)
  const tmpP = mkdtempSync(join(tmpdir(), 'skill-patch-'))
  try {
    // the upstream at the commit this copy records, rewritten like an update would
    git(tmpP, 'clone', '--quiet', '--no-checkout', s.upstream.repo, 'u')
    git(join(tmpP, 'u'), 'checkout', '--quiet', s.upstream.commit)
    writeUpstream(s, join(tmpP, 'u', s.upstream.path), join(tmpP, 'up'))
    const patch = diffDirs(join(tmpP, 'up'), join(skillsRoot, patchFor))
    const target = join(skillsRoot, patchFor, 'local.patch')
    if (patch.trim()) writeFileSync(target, patch)
    else rmSync(target, { force: true })
    console.log(patch.trim() ? `Wrote ${target}; record it in SOURCE.md under "## Local changes".` : `No difference; ${target} removed.`)
  } finally {
    rmSync(tmpP, { recursive: true, force: true })
  }
  process.exit(0)
}

if (apply) {
  const summary = []
  for (const s of selected) {
    const dir = join(stageRoot, s.name)
    if (!existsSync(join(dir, 'meta.json'))) {
      if (only.length) summary.push(`${s.name}: not staged, run --stage first`)
      continue
    }
    const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'))
    if (meta.patch === 'failed') {
      summary.push(`${s.name}: SKIPPED, local.patch no longer applies (see report.md)`)
      continue
    }
    const dest = join(skillsRoot, s.name)
    const changed = syncInto(join(dir, 'files'), dest)
    if (changed.length || s.upstream.commit !== meta.commit) {
      const sp = join(dest, 'SOURCE.md')
      let t = readFileSync(sp, 'utf8')
      t = t.replace(/(Upstream commit at the time of copying: `)[0-9a-f]{7,40}(`)/, `$1${meta.commit}$2`)
      t = t.replace(/^(- Repository: )(https?:\/\/\S+)$/m, '$1<$2>') // a bare URL fails markdownlint MD034
      t = t.replace(/^- Copied on:.*$/m, `- Copied on: ${today}, by \`skills/gam-engineering/scripts/skill-update.mjs\` from a fresh clone of the upstream`)
      t = t.replace(
        /^- Upstream SKILL.md identical.*$/m,
        `- Upstream SKILL.md identical to this copy apart from the \`name:\` line and renamed references: ${meta.identical ? 'yes' : 'no'}`,
      )
      writeFileSync(sp, t)
      s.upstream.commit = meta.commit
      s.upstream.copied = today
      s.upstream.identical = meta.identical
    }
    rmSync(dir, { recursive: true, force: true })
    summary.push(`${s.name}: applied ${meta.commit.slice(0, 7)}, ${changed.length} file(s) changed`)
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  if (!summary.length) summary.push('Nothing staged; run --stage first.')
  console.log(summary.join('\n') + '\n\nApplied.')
  process.exit(0)
}

// --stage, or the dry run without it.
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
const report = [`# Staged update of the vendored skills`, ``, `Staged on ${today}. Check it with \`skills/gam-engineering/references/skill-update-check.md\`, then run \`--apply\`.`]
try {
  if (stage) mkdirSync(stageRoot, { recursive: true })
  for (const s of selected) {
    const { repo, path } = s.upstream
    const { dir, commit } = clone(repo)
    const src = join(dir, path)
    if (!existsSync(join(src, 'SKILL.md'))) {
      summary.push(`${s.name}: ERROR upstream path ${path} has no SKILL.md`)
      continue
    }
    const dest = join(skillsRoot, s.name)
    const work = join(tmp, `stage-${s.name}`)
    const counter = writeUpstream(s, src, join(work, 'upstream'))
    cpSync(join(work, 'upstream'), join(work, 'files'), { recursive: true })
    let patch = 'none'
    const patchFile = join(dest, 'local.patch')
    if (existsSync(patchFile)) {
      const r = spawnSync('git', ['apply', '--whitespace=nowarn', resolve(patchFile)], { cwd: join(work, 'files'), encoding: 'utf8' })
      patch = r.status === 0 ? 'applied' : 'failed'
      if (patch === 'failed') {
        rmSync(join(work, 'files'), { recursive: true, force: true })
        cpSync(join(work, 'upstream'), join(work, 'files'), { recursive: true })
      }
    }
    const up = norm(readFileSync(join(src, 'SKILL.md'), 'utf8'))
    const stripName = (t) => t.replace(/^name:.*$/m, '')
    const identical = stripName(dropFrontmatter(rewrite(up, s, { name: 0, refs: 0 }), s)) === stripName(up)
    const diff = diffDirs(dest, join(work, 'files'))
      .split(/^(?=diff --git )/m)
      .filter((d) => d && !/^diff --git a\/(SOURCE\.md|CREDITS\.md|local\.patch) /.test(d))
    const changed = diff.map((d) => (/^diff --git a\/(\S+)/.exec(d) || [])[1]).filter(Boolean)
    summary.push(
      `${s.name}: ${s.upstream.commit.slice(0, 7)} -> ${commit.slice(0, 7)}, ${changed.length} file(s) changed, ${counter.refs} ref(s) renamed, patch ${patch}${
        changed.length ? '\n    ' + changed.join('\n    ') : ''
      }`,
    )
    if (!stage || (!changed.length && s.upstream.commit === commit && patch !== 'failed')) continue
    const out = join(stageRoot, s.name)
    rmSync(out, { recursive: true, force: true })
    cpSync(work, out, { recursive: true })
    writeFileSync(join(out, 'meta.json'), JSON.stringify({ commit, identical, patch, changed }, null, 2) + '\n')
    // Every text diff is shown (scripts matter for checklist item 7), each cut to 300 lines.
    const shown = diff
      .filter((d) => !/^Binary files|GIT binary patch/m.test(d))
      .map((d) => {
        const lines = d.split('\n')
        return lines.length > 300 ? `${lines.slice(0, 300).join('\n')}\n… ${lines.length - 300} more line(s) in .skill-update/${s.name}/files\n` : d
      })
    report.push(
      ``,
      `## ${s.name}`,
      ``,
      `- Upstream: ${repo} \`${path}\`, \`${s.upstream.commit.slice(0, 7)}\` -> \`${commit.slice(0, 7)}\``,
      `- Files: ${changed.length ? changed.map((f) => `\`${f}\``).join(', ') : 'none (new commit only)'}`,
      `- Local patch: ${patch}${patch === 'failed' ? ' — the staged files are the plain upstream; decide per Q429 in the check' : ''}`,
      `- Integration notes: \`skills/${s.name}/SOURCE.md\`, section *Integration*`,
      ...(shown.length ? [``, '````diff', shown.join('').trimEnd(), '````'] : []),
    )
  }
  if (stage) writeFileSync(join(stageRoot, 'report.md'), report.join('\n') + '\n')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
console.log(summary.join('\n'))
console.log(stage ? `\nStaged in ${stageRoot}; report: ${join(stageRoot, 'report.md')}` : '\nDry run; pass --stage to stage.')
