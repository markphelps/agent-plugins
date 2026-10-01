const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { checkMapHandoff } = require('./check-map-handoff.js')

const fixtureRoot = path.join(__dirname, 'fixtures', 'multi-area')
const fixture = JSON.parse(
  fs.readFileSync(path.join(fixtureRoot, 'areas-and-reports.json'), 'utf8'),
)
const scenarios = JSON.parse(
  fs.readFileSync(path.join(fixtureRoot, 'scenarios.json'), 'utf8'),
)

function copyContents(source, destination) {
  fs.mkdirSync(destination, { recursive: true })
  for (const entry of fs.readdirSync(source)) {
    fs.cpSync(path.join(source, entry), path.join(destination, entry), {
      recursive: true,
    })
  }
}

function makeRepository(t) {
  const repositoryRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), 'whiteboard-map-'),
  )
  copyContents(path.join(fixtureRoot, 'sources'), repositoryRoot)
  execFileSync('git', ['init', '--quiet'], { cwd: repositoryRoot })
  execFileSync('git', ['config', 'user.name', 'Whiteboard fixture'], {
    cwd: repositoryRoot,
  })
  execFileSync(
    'git',
    ['config', 'user.email', 'whiteboard-fixture@example.test'],
    {
      cwd: repositoryRoot,
    },
  )
  execFileSync('git', ['add', '--all'], { cwd: repositoryRoot })
  execFileSync('git', ['commit', '--quiet', '-m', 'Commit fixture sources'], {
    cwd: repositoryRoot,
  })

  const mapRoot = path.join(repositoryRoot, 'docs', 'map')
  copyContents(path.join(fixtureRoot, 'maps'), mapRoot)
  t.after(() => fs.rmSync(repositoryRoot, { recursive: true, force: true }))
  return { repositoryRoot, mapRoot }
}

function copyFixture(value) {
  return JSON.parse(JSON.stringify(value))
}

function runCheck(t, reports = copyFixture(fixture.reports)) {
  const repository = makeRepository(t)
  return {
    ...repository,
    reports,
    result: checkMapHandoff({
      ...repository,
      inventory: copyFixture(fixture.inventory),
      reports,
    }),
  }
}

test('accepts complete multi-area output with committed evidence', (t) => {
  const { result } = runCheck(t)
  assert.deepEqual(result, { valid: true, errors: [], conflicts: [] })
})

test('accepts a rationale tag wrapped across Markdown lines', (t) => {
  const { mapRoot, repositoryRoot } = makeRepository(t)
  const regionPath = path.join(mapRoot, 'auth.md')
  const region = fs
    .readFileSync(regionPath, 'utf8')
    .replace(
      '[documented: design/decisions/auth.md]',
      '[documented:\n  design/decisions/auth.md]',
    )
  fs.writeFileSync(regionPath, region)
  const result = checkMapHandoff({
    repositoryRoot,
    inventory: copyFixture(fixture.inventory),
    reports: copyFixture(fixture.reports),
    mapRoot,
  })
  assert.deepEqual(result, { valid: true, errors: [], conflicts: [] })
})

test('rejects an inventoried area with no delegate report', (t) => {
  const reports = copyFixture(fixture.reports).filter(
    (report) => report.areaId !== scenarios.missingAreaId,
  )
  const { result } = runCheck(t, reports)
  assert.ok(
    result.errors.some((message) =>
      message.includes("Missing delegate report for area 'billing'"),
    ),
  )
})

test('rejects an inventory area omitted from the index', (t) => {
  const { mapRoot, repositoryRoot } = makeRepository(t)
  const indexPath = path.join(mapRoot, 'index.md')
  const index = fs
    .readFileSync(indexPath, 'utf8')
    .replace(/^\| \[Billing\]\(billing\.md\).*\r?\n/m, '')
  fs.writeFileSync(indexPath, index)
  const result = checkMapHandoff({
    repositoryRoot,
    inventory: copyFixture(fixture.inventory),
    reports: copyFixture(fixture.reports),
    mapRoot,
  })
  assert.ok(
    result.errors.some((message) =>
      message.includes("Inventory area 'billing' must appear exactly once"),
    ),
  )
})

test('rejects overlapping delegate path scopes', (t) => {
  const reports = copyFixture(fixture.reports)
  const report = reports.find(
    (item) => item.areaId === scenarios.duplicateScope.areaId,
  )
  report.paths = scenarios.duplicateScope.paths
  const { result } = runCheck(t, reports)
  assert.ok(
    result.errors.some((message) =>
      message.includes('Duplicate path ownership'),
    ),
  )
})

test('rejects duplicate path ownership in mapped regions', (t) => {
  const { mapRoot, repositoryRoot } = makeRepository(t)
  const billingPath = path.join(mapRoot, 'billing.md')
  const billing = fs
    .readFileSync(billingPath, 'utf8')
    .replace("paths: ['src/billing/**']", "paths: ['src/auth/**']")
  fs.writeFileSync(billingPath, billing)
  const result = checkMapHandoff({
    repositoryRoot,
    inventory: copyFixture(fixture.inventory),
    reports: copyFixture(fixture.reports),
    mapRoot,
  })
  assert.ok(
    result.errors.some((message) =>
      message.includes('Duplicate path ownership in map'),
    ),
  )
})

test('rejects duplicate region identifiers', (t) => {
  const reports = copyFixture(fixture.reports)
  const report = reports.find(
    (item) => item.areaId === scenarios.duplicateRegionIdentifier.areaId,
  )
  report.regionSlug = scenarios.duplicateRegionIdentifier.regionSlug
  const { result } = runCheck(t, reports)
  assert.ok(
    result.errors.some((message) =>
      message.includes("Duplicate region identifier 'auth'"),
    ),
  )
})

test('rejects duplicate region identifiers in map frontmatter', (t) => {
  const { mapRoot, repositoryRoot } = makeRepository(t)
  const billingPath = path.join(mapRoot, 'billing.md')
  const billing = fs
    .readFileSync(billingPath, 'utf8')
    .replace('region: billing', 'region: auth')
  fs.writeFileSync(billingPath, billing)
  const result = checkMapHandoff({
    repositoryRoot,
    inventory: copyFixture(fixture.inventory),
    reports: copyFixture(fixture.reports),
    mapRoot,
  })
  assert.ok(
    result.errors.some((message) =>
      message.includes("Duplicate region identifier 'auth' in map frontmatter"),
    ),
  )
})

test('surfaces contradictory reports in map friction with both receipts', (t) => {
  const reports = copyFixture(fixture.reports)
  for (const item of scenarios.conflictingClaims) {
    reports
      .find((report) => report.areaId === item.areaId)
      .claims.push(item.claim)
  }

  const { mapRoot, repositoryRoot } = makeRepository(t)
  const indexPath = path.join(mapRoot, 'index.md')
  const index = fs.readFileSync(indexPath, 'utf8')
  const [first, second] = scenarios.conflictingClaims.map((item) => item.claim)
  const conflict = `- \`inconsistent\` ${first.value} ${second.value} (\`${first.receipt}\`, \`${second.receipt}\`)`
  fs.writeFileSync(indexPath, index.replace('- None identified.', conflict))
  const checked = checkMapHandoff({
    repositoryRoot,
    inventory: copyFixture(fixture.inventory),
    reports,
    mapRoot,
  })

  assert.equal(checked.valid, true, checked.errors.join('\n'))
  assert.equal(checked.conflicts.length, 1)
  assert.deepEqual(checked.conflicts[0].values, [first.value, second.value])
})

test('rejects a contradictory handoff that is silently merged', (t) => {
  const reports = copyFixture(fixture.reports)
  for (const item of scenarios.conflictingClaims) {
    reports
      .find((report) => report.areaId === item.areaId)
      .claims.push(item.claim)
  }
  const { result } = runCheck(t, reports)
  assert.ok(
    result.errors.some((message) =>
      message.includes('not preserved in Open questions & friction'),
    ),
  )
})

test('rejects map output that drops a committed receipt', (t) => {
  const { mapRoot, repositoryRoot } = makeRepository(t)
  const regionPath = path.join(mapRoot, 'auth.md')
  const region = fs
    .readFileSync(regionPath, 'utf8')
    .replaceAll('src/auth/session.js', 'src/auth/missing-session.js')
  fs.writeFileSync(regionPath, region)
  const result = checkMapHandoff({
    repositoryRoot,
    inventory: copyFixture(fixture.inventory),
    reports: copyFixture(fixture.reports),
    mapRoot,
  })
  assert.ok(
    result.errors.some((message) =>
      message.includes('dropped committed-source receipt'),
    ),
  )
})

test('rejects a source receipt that is not committed in HEAD', (t) => {
  const reports = copyFixture(fixture.reports)
  reports.find((report) => report.areaId === 'auth').claims[0].receipt =
    scenarios.uncommittedReceipt
  const { mapRoot, repositoryRoot } = makeRepository(t)
  const regionPath = path.join(mapRoot, 'auth.md')
  const region = fs
    .readFileSync(regionPath, 'utf8')
    .replaceAll('src/auth/session.js', scenarios.uncommittedReceipt)
  fs.writeFileSync(regionPath, region)
  const result = checkMapHandoff({
    repositoryRoot,
    inventory: copyFixture(fixture.inventory),
    reports,
    mapRoot,
  })
  assert.ok(
    result.errors.some((message) =>
      message.includes('not present in committed HEAD'),
    ),
  )
})

test('rejects map output that drops a rationale evidence tag', (t) => {
  const { mapRoot, repositoryRoot } = makeRepository(t)
  const regionPath = path.join(mapRoot, 'auth.md')
  const region = fs
    .readFileSync(regionPath, 'utf8')
    .replace(/\[documented:\s+design\/decisions\/auth\.md\]/g, '')
  fs.writeFileSync(regionPath, region)
  const result = checkMapHandoff({
    repositoryRoot,
    inventory: copyFixture(fixture.inventory),
    reports: copyFixture(fixture.reports),
    mapRoot,
  })
  assert.ok(
    result.errors.some((message) =>
      message.includes('dropped rationale evidence tag'),
    ),
  )
})
