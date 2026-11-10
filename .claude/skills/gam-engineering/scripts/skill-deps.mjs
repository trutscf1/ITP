#!/usr/bin/env node
// Checks that the vendored skills (skills/gam-*, copied from upstream) the gam- skills call are deployed.
// Usage: node skill-deps.mjs [--once] [--json]
// Exit code: 0 when nothing required is missing, 1 when a required skill is missing.
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, cpSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)

const here = dirname(fileURLToPath(import.meta.url))
const manifestText = readFileSync(join(here, 'skill-deps.json'), 'utf8')
const skills = JSON.parse(manifestText).skills
const configDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude')
const skillsDir = join(configDir, 'skills')
const markerPath = join(configDir, 'gam-skill-deps.json')
const manifestHash = createHash('sha256').update(manifestText).digest('hex').slice(0, 16)

const isInstalled = (name) =>
  existsSync(join(skillsDir, name, 'SKILL.md')) || existsSync(join(process.cwd(), '.claude', 'skills', name, 'SKILL.md'))

const readMarker = () => {
  try { return JSON.parse(readFileSync(markerPath, 'utf8')) } catch { return null }
}

if (flag('once') && readMarker()?.manifest === manifestHash) process.exit(0)

const report = skills.map((s) => ({ ...s, installed: isInstalled(s.name) }))

const missing = report.filter((s) => !s.installed)
const missingRequired = missing.filter((s) => s.tier === 'required')

if (flag('json')) {
  console.log(JSON.stringify({ skillsDir, missing: missing.map(({ name, tier, used, source }) => ({ name, tier, used, source })) }, null, 2))
} else if (missing.length === 0) {
  console.log(`All ${report.length} vendored skills are deployed.`)
} else {
  console.log(`Skills missing (${missing.length} of ${report.length}); the commands continue without them:`)
  for (const s of missing) console.log(`  [${s.tier}] ${s.name} (${s.used})`)
  console.log('Deploy them: pwsh -File deploy_skill_wrapper.ps1 in the gam-engineering repo.')
}

if (flag('once')) {
  try {
    mkdirSync(configDir, { recursive: true })
    writeFileSync(markerPath, JSON.stringify({ manifest: manifestHash, checked: new Date().toISOString() }) + '\n')
  } catch { /* marker is a convenience; the check works without it */ }
}
process.exit(missingRequired.length ? 1 : 0)
