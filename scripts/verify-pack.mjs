#!/usr/bin/env node
/**
 * Publish-readiness gate for every package in this repo.
 *
 * The DSH desktop resolves plugins from the npm registry and validates each one
 * before activating it: the manifest must name the package, and `dsh.bundle.patch`
 * must point at a file that is actually inside the published tarball. A package
 * missing that file installs nowhere — the desktop rejects it outright.
 *
 * Three failure modes this gate catches, all of which have already happened here:
 *   1. `cordis.patch.yml` absent from `files`, so the tarball ships no patch.
 *   2. A `workspace:` protocol survives into the manifest — npm cannot publish it.
 *   3. The package version drifts from the harness line it targets.
 *
 * Usage: node scripts/verify-pack.mjs
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const REPO = resolve(import.meta.dirname, '..')
const PACKAGES_DIR = join(REPO, 'packages')
/** The harness line these packages are built and verified against. */
const EXPECTED_VERSION = '0.2.0'

const failures = []

for (const dir of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const packageDir = join(PACKAGES_DIR, dir.name)
  const manifestPath = join(packageDir, 'package.json')
  if (!existsSync(manifestPath)) continue

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const label = manifest.name
  const problems = []

  if (manifest.version !== EXPECTED_VERSION) {
    problems.push(`version ${manifest.version} != ${EXPECTED_VERSION}`)
  }

  // A workspace protocol can never be published, and cannot be resolved by a
  // plugin installed from the registry.
  for (const section of ['dependencies', 'peerDependencies', 'devDependencies']) {
    for (const [name, spec] of Object.entries(manifest[section] ?? {})) {
      if (String(spec).includes('workspace:')) problems.push(`${section}.${name} uses ${spec}`)
    }
  }

  // The desktop refuses any plugin whose declared patch is missing on disk.
  const declaredPatch = manifest.dsh?.bundle?.patch
  if (typeof declaredPatch !== 'string' || declaredPatch === '') {
    problems.push('dsh.bundle.patch is not declared')
  } else if (!existsSync(join(packageDir, declaredPatch))) {
    problems.push(`dsh.bundle.patch ${declaredPatch} does not exist in the source tree`)
  }

  // Ask npm what would actually ship.
  // Windows exposes the CLI as `npm.cmd`, and Node refuses to spawn a `.cmd`
  // without a shell (CVE-2024-27980), so the Windows branch goes through cmd.exe.
  // Every argument here is a static literal, so no shell interpolation happens.
  const useShell = process.platform === 'win32'
  let shipped = []
  try {
    const raw = execFileSync('npm', ['pack', '--dry-run', '--json'], {
      cwd: packageDir,
      encoding: 'utf8',
      shell: useShell,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const parsed = JSON.parse(raw)
    const info = Object.values(parsed)[0]
    shipped = (info?.files ?? []).map(entry => entry.path)
  } catch (error) {
    problems.push(`npm pack --dry-run failed: ${error instanceof Error ? error.message : String(error)}`)
  }

  if (shipped.length > 0) {
    if (typeof declaredPatch === 'string' && !shipped.includes(declaredPatch.replace(/^\.\//u, ''))) {
      problems.push(`tarball is missing the bundle patch (${declaredPatch})`)
    }
    if (!shipped.includes('lib/index.js')) problems.push('tarball is missing lib/index.js')
  }

  if (problems.length === 0) {
    console.log(`OK   ${label}@${manifest.version}  (${shipped.length} files)`)
  } else {
    console.log(`FAIL ${label}`)
    for (const problem of problems) console.log(`       ${problem}`)
    failures.push(label)
  }
}

console.log(failures.length === 0
  ? '\n===> every package is publishable'
  : `\n===> ${failures.length} package(s) are NOT publishable`)
process.exit(failures.length === 0 ? 0 : 1)
