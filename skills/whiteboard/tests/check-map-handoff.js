const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

function parseInlineList(value) {
  const result = []
  let token = ''
  let quote = null

  for (const character of value.trim().replace(/^\[/, '').replace(/\]$/, '')) {
    if (
      (character === "'" || character === '"') &&
      (!quote || quote === character)
    ) {
      quote = quote ? null : character
    } else if (character === ',' && !quote) {
      if (token.trim()) result.push(token.trim().replace(/^['"]|['"]$/g, ''))
      token = ''
    } else {
      token += character
    }
  }

  if (token.trim()) result.push(token.trim().replace(/^['"]|['"]$/g, ''))
  return result
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/)
  if (!match) return null

  const value = (key) =>
    match[1].match(new RegExp(`^${key}:\\s*(.*?)\\s*$`, 'm'))?.[1]
  const paths = match[1].match(/^paths:\s*(\[[^\]]*\])\s*$/m)?.[1]

  return {
    region: value('region')?.replace(/^['"]|['"]$/g, ''),
    title: value('title')?.replace(/^['"]|['"]$/g, ''),
    paths: paths ? parseInlineList(paths) : [],
  }
}

function section(markdown, heading) {
  const start = markdown.search(new RegExp(`^## ${heading}\\s*$`, 'm'))
  if (start < 0) return ''
  const contentStart = markdown.indexOf('\n', start) + 1
  const remaining = markdown.slice(contentStart)
  const nextHeading = remaining.search(/^## /m)
  return nextHeading < 0 ? remaining : remaining.slice(0, nextHeading)
}

function parseRegionRows(markdown) {
  return section(markdown, 'Regions')
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(
        /^\|\s*\[([^\]]+)\]\(([^)]+\.md)\)\s*\|\s*`([^`]+)`\s*\|/,
      )
      return match
        ? [{ title: match[1], target: match[2], path: match[3] }]
        : []
    })
}

function parseUnexploredRows(markdown) {
  const lines = section(markdown, 'Unexplored').split(/\r?\n/)
  const entries = []

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^- \*\*(.+?)\*\* \((.+?)\):\s*(.*)$/)
    if (!match) continue
    const paths = [...match[2].matchAll(/`([^`]+)`/g)].map((item) => item[1])
    const reason = [match[3].trim()]
    while (index + 1 < lines.length && /^\s{2,}\S/.test(lines[index + 1])) {
      reason.push(lines[index + 1].trim())
      index += 1
    }
    entries.push({ title: match[1], paths, reason: reason.join(' ') })
  }

  return entries
}

function normalizedMarkdown(markdown) {
  return markdown.replace(/\r?\n[ \t]*/g, ' ')
}

function normalizedPaths(paths = []) {
  return [...paths]
    .map((item) =>
      item.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/$/, ''),
    )
    .sort()
}

function fixedPrefix(glob) {
  const parts = glob.split('/')
  const wildcard = parts.findIndex((part) => /[*?{}\[\]]/.test(part))
  return wildcard < 0 ? parts.join('/') : parts.slice(0, wildcard).join('/')
}

function scopesOverlap(left, right) {
  const a = fixedPrefix(left)
  const b = fixedPrefix(right)
  return !a || !b || a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`)
}

function validateEvidenceTag(tag) {
  return (
    /^\[documented: [^\]]+\]$/.test(tag) ||
    /^\[historical: [0-9a-f]{7,40}\]$/i.test(tag) ||
    tag === '[inferred]' ||
    /^\[stated: \d{4}-\d{2}-\d{2}\]$/.test(tag)
  )
}

function checkMapHandoff({ repositoryRoot, inventory, reports, mapRoot }) {
  const errors = []
  const conflicts = []
  const error = (message) => errors.push(message)
  const reportCounts = new Map()
  const inventoryById = new Map()
  const committedPaths = new Set(
    execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    })
      .split(/\r?\n/)
      .filter(Boolean),
  )

  for (const area of inventory) {
    if (inventoryById.has(area.id))
      error(`Duplicate inventory area identifier '${area.id}'.`)
    inventoryById.set(area.id, area)
  }

  for (const report of reports) {
    reportCounts.set(report.areaId, (reportCounts.get(report.areaId) || 0) + 1)
    if (!inventoryById.has(report.areaId))
      error(`Report references unknown area '${report.areaId}'.`)
  }

  for (const area of inventory) {
    const count = reportCounts.get(area.id) || 0
    if (count === 0) error(`Missing delegate report for area '${area.id}'.`)
    if (count > 1)
      error(`Area '${area.id}' has ${count} delegate reports; expected one.`)
  }

  const assignedScopes = []
  const assignedSlugs = new Map()
  for (const report of reports) {
    const area = inventoryById.get(report.areaId)
    if (!area) continue
    if (
      normalizedPaths(report.paths).join('\n') !==
      normalizedPaths(area.paths).join('\n')
    ) {
      error(
        `Delegate scope for '${area.id}' does not match its inventory paths.`,
      )
    }
    for (const scope of report.paths || []) {
      for (const prior of assignedScopes) {
        if (scopesOverlap(scope, prior.scope)) {
          error(
            `Duplicate path ownership: '${scope}' (${report.areaId}) overlaps '${prior.scope}' (${prior.owner}).`,
          )
        }
      }
      assignedScopes.push({ scope, owner: report.areaId })
    }
    if (report.disposition === 'mapped') {
      if (!report.regionSlug)
        error(`Mapped area '${report.areaId}' has no region identifier.`)
      const prior = assignedSlugs.get(report.regionSlug)
      if (prior)
        error(
          `Duplicate region identifier '${report.regionSlug}' for '${prior}' and '${report.areaId}'.`,
        )
      else assignedSlugs.set(report.regionSlug, report.areaId)
    } else if (report.disposition !== 'unexplored') {
      error(
        `Area '${report.areaId}' has unsupported disposition '${report.disposition}'.`,
      )
    }
  }

  const indexPath = path.join(mapRoot, 'index.md')
  if (!fs.existsSync(indexPath)) {
    error('Missing docs/map/index.md.')
    return { valid: false, errors, conflicts }
  }

  const indexMarkdown = fs.readFileSync(indexPath, 'utf8')
  const indexFrontmatter = parseFrontmatter(indexMarkdown)
  if (!indexFrontmatter || indexFrontmatter.region !== 'index') {
    error('Index is missing valid region:index frontmatter.')
  }
  const regionRows = parseRegionRows(indexMarkdown)
  const unexploredRows = parseUnexploredRows(indexMarkdown)
  const regionFiles = fs
    .readdirSync(mapRoot)
    .filter((file) => file.endsWith('.md') && file !== 'index.md')
    .map((file) => ({
      file,
      markdown: fs.readFileSync(path.join(mapRoot, file), 'utf8'),
      frontmatter: parseFrontmatter(
        fs.readFileSync(path.join(mapRoot, file), 'utf8'),
      ),
    }))
  const allMapFiles = [
    { file: 'index.md', markdown: indexMarkdown },
    ...regionFiles,
  ]
  const mapText = allMapFiles
    .map((item) => normalizedMarkdown(item.markdown))
    .join('\n')
  const regionIdCounts = new Map()
  const mapScopes = []

  for (const item of regionFiles) {
    const metadata = item.frontmatter
    if (!metadata?.region || !metadata.paths.length) {
      error(`Region '${item.file}' is missing region or paths frontmatter.`)
      continue
    }
    regionIdCounts.set(
      metadata.region,
      (regionIdCounts.get(metadata.region) || 0) + 1,
    )
    if (
      !regionRows.some((row) => path.posix.basename(row.target) === item.file)
    ) {
      error(`Region '${item.file}' is not linked from the index Regions table.`)
    }
    const row = regionRows.find(
      (candidate) => path.posix.basename(candidate.target) === item.file,
    )
    if (
      row &&
      normalizedPaths([row.path]).join('\n') !==
        normalizedPaths(metadata.paths).join('\n')
    ) {
      error(
        `Index path scope for '${item.file}' does not match its frontmatter.`,
      )
    }
    for (const scope of metadata.paths) {
      for (const prior of mapScopes) {
        if (scopesOverlap(scope, prior.scope)) {
          error(
            `Duplicate path ownership in map: '${scope}' (${item.file}) overlaps '${prior.scope}' (${prior.owner}).`,
          )
        }
      }
      mapScopes.push({ scope, owner: item.file })
    }
  }

  for (const [regionId, count] of regionIdCounts) {
    if (count > 1)
      error(`Duplicate region identifier '${regionId}' in map frontmatter.`)
  }

  const byRegionId = new Map()
  for (const item of regionFiles) {
    const regionId = item.frontmatter?.region
    if (!regionId) continue
    const matches = byRegionId.get(regionId) || []
    matches.push(item)
    byRegionId.set(regionId, matches)
  }
  const representedUnexplored = new Set()

  for (const area of inventory) {
    const matches = reports.filter((report) => report.areaId === area.id)
    if (matches.length !== 1) continue
    const report = matches[0]
    const pathsMatch = (row) =>
      normalizedPaths(row.paths).join('\n') ===
      normalizedPaths(area.paths).join('\n')
    const mappedRows = regionFiles.filter(
      (item) =>
        item.frontmatter &&
        pathsMatch(item.frontmatter) &&
        regionRows.some((row) => path.posix.basename(row.target) === item.file),
    )
    const unexploredMatches = unexploredRows.filter(
      (row) =>
        row.title.toLowerCase() === area.name.toLowerCase() && pathsMatch(row),
    )

    if (mappedRows.length + unexploredMatches.length !== 1) {
      error(
        `Inventory area '${area.id}' must appear exactly once as a mapped region or Unexplored entry.`,
      )
    }
    if (report.disposition === 'mapped') {
      const regions = byRegionId.get(report.regionSlug) || []
      if (regions.length !== 1) {
        error(
          `Mapped area '${area.id}' must have exactly one '${report.regionSlug}' region file.`,
        )
      } else {
        const region = regions[0]
        if (!pathsMatch(region.frontmatter))
          error(
            `Region '${report.regionSlug}' has the wrong path scope for '${area.id}'.`,
          )
        const heading = region.markdown.match(/^# (.+)$/m)?.[1]?.trim()
        if (heading && heading.toLowerCase() !== area.name.toLowerCase()) {
          error(
            `Region '${report.regionSlug}' title does not match inventory area '${area.name}'.`,
          )
        }
        if (
          !regionRows.some(
            (row) =>
              row.target === `${report.regionSlug}.md` &&
              row.title === area.name,
          )
        ) {
          error(`Mapped area '${area.id}' is missing its index Regions link.`)
        }
      }
      if (unexploredMatches.length)
        error(`Mapped area '${area.id}' is also listed as Unexplored.`)
    } else {
      representedUnexplored.add(area.id)
      const row = unexploredMatches[0]
      if (!row || !row.reason) {
        error(
          `Unexplored area '${area.id}' needs a matching path and reason in the index.`,
        )
      } else if (report.reason && !row.reason.includes(report.reason)) {
        error(
          `Unexplored reason for '${area.id}' does not preserve the delegate report.`,
        )
      }
      if (mappedRows.length)
        error(`Unexplored area '${area.id}' also has a mapped region.`)
    }

    if (report.disposition === 'mapped') {
      const claimMapText = normalizedMarkdown(
        (byRegionId.get(report.regionSlug) || [])[0]?.markdown || '',
      )
      for (const claim of report.claims || []) {
        if (claim.value && !mapText.includes(claim.value)) {
          error(
            `Map output dropped claim '${claim.key}' from region '${report.regionSlug}'.`,
          )
        }
        if (!claim.receipt || !committedPaths.has(claim.receipt)) {
          error(
            `Claim '${claim.key}' cites a receipt not present in committed HEAD: '${claim.receipt || '<missing>'}'.`,
          )
        } else if (!claimMapText.includes(claim.receipt)) {
          error(
            `Region '${report.regionSlug}' dropped committed-source receipt '${claim.receipt}'.`,
          )
        }
        if (claim.rationale && !validateEvidenceTag(claim.evidenceTag || '')) {
          error(`Rationale claim '${claim.key}' has no valid evidence tag.`)
        } else if (
          claim.evidenceTag &&
          !claimMapText.includes(claim.evidenceTag)
        ) {
          error(
            `Region '${report.regionSlug}' dropped rationale evidence tag '${claim.evidenceTag}'.`,
          )
        }
        if (claim.evidenceTag?.startsWith('[documented: ')) {
          const evidencePath = claim.evidenceTag.slice(
            '[documented: '.length,
            -1,
          )
          if (!committedPaths.has(evidencePath)) {
            error(
              `Documented rationale receipt is not present in committed HEAD: '${evidencePath}'.`,
            )
          }
        }
      }
    }
  }

  for (const row of unexploredRows) {
    const area = inventory.find(
      (item) =>
        item.name.toLowerCase() === row.title.toLowerCase() &&
        normalizedPaths(item.paths).join('\n') ===
          normalizedPaths(row.paths).join('\n'),
    )
    if (!area) error(`Unexplored entry '${row.title}' is not in the inventory.`)
    else if (!representedUnexplored.has(area.id))
      error(
        `Unexplored entry '${row.title}' is not expected by its delegate report.`,
      )
  }

  const claimsByKey = new Map()
  for (const report of reports) {
    for (const claim of report.claims || []) {
      if (!claim.key || !claim.value) continue
      const claims = claimsByKey.get(claim.key) || []
      claims.push({ ...claim, areaId: report.areaId })
      claimsByKey.set(claim.key, claims)
    }
  }
  const frictionSections = allMapFiles.map((item) =>
    normalizedMarkdown(section(item.markdown, 'Open questions & friction')),
  )
  for (const [key, claims] of claimsByKey) {
    const values = [...new Set(claims.map((claim) => claim.value))]
    if (values.length < 2) continue
    const receipts = [
      ...new Set(claims.map((claim) => claim.receipt).filter(Boolean)),
    ]
    conflicts.push({ key, values, receipts })
    const surfaced = frictionSections.some(
      (friction) =>
        /inconsistent|conflict|disagree/i.test(friction) &&
        [...values, ...receipts].every((value) => friction.includes(value)),
    )
    if (!surfaced)
      error(
        `Contradictory reports for '${key}' are not preserved in Open questions & friction.`,
      )
  }

  return { valid: errors.length === 0, errors, conflicts }
}

module.exports = { checkMapHandoff }
