import {
  mkdir,
  open,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import 'dotenv/config'

export interface CliOptions {
  limit: number
  maxPages: number
  headPages: number
  vaultRoot: string
}

export interface BookmarkPost {
  id: string
  text: string
  authorId?: string
  authorName?: string
  authorHandle?: string
  createdAt?: string
  publicMetrics?: {
    like_count?: number
    retweet_count?: number
    reply_count?: number
    quote_count?: number
  }
  links: string[]
}

export interface ReviewedEntry {
  post_id: string
  reviewed_at: string
  run_id: string
  decision: 'captured'
  source_record_path: string
  source: 'main'
}

export interface RunEntry {
  run_id: string
  started_at: string
  finished_at: string
  limit: number
  max_pages: number
  pages_fetched: number
  evaluated_count: number
  captured_count: number
  errors: string[]
}

export interface Checkpoint {
  last_successful_run_at?: string
  last_pages_fetched?: number
  head_pages?: number
  backlog_token?: string | null
  backlog_exhausted?: boolean
}

export interface BookmarkPage {
  posts: BookmarkPost[]
  requestToken: string | null
  nextToken: string | null
}

export interface CollectionResult {
  selected: BookmarkPost[]
  pagesFetched: number
  nextBacklogToken: string | null
  backlogExhausted: boolean
  cursorReset: boolean
  errors: string[]
}

type JsonRecord = Record<string, unknown>
export type XurlJsonRunner = (args: string[]) => Promise<JsonRecord>

const DEFAULT_OPTIONS: CliOptions = {
  limit: 15,
  maxPages: 10,
  headPages: 2,
  vaultRoot: process.cwd(),
}

const SAVED_CURSOR_REJECTED =
  'Saved backlog cursor was rejected; reset catch-up cursor to current head scan.'

const execFileAsync = promisify(execFile)
const XURL_MAX_BUFFER_BYTES = 64 * 1024 * 1024

export function parseArgs(argv: string[]): CliOptions {
  const options = { ...DEFAULT_OPTIONS }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--limit') {
      options.limit = parseIntegerFlag(arg, argv[index + 1])
      index += 1
      continue
    }

    if (arg === '--max-pages') {
      options.maxPages = parseIntegerFlag(arg, argv[index + 1])
      index += 1
      continue
    }

    if (arg === '--head-pages') {
      options.headPages = parseIntegerFlag(arg, argv[index + 1])
      index += 1
      continue
    }

    if (arg === '--path') {
      const next = argv[index + 1]
      if (next === undefined || next.startsWith('--')) {
        throw new Error(`${arg} requires a value`)
      }
      options.vaultRoot = path.resolve(next)
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

export function selectOldestReachableUnreviewed(
  pagesNewestFirst: BookmarkPost[][],
  reviewedIds: Set<string>,
  limit: number,
): BookmarkPost[] {
  const seen = new Set<string>()

  return pagesNewestFirst
    .flat()
    .filter((post) => {
      if (reviewedIds.has(post.id) || seen.has(post.id)) {
        return false
      }
      seen.add(post.id)
      return true
    })
    .slice(-limit)
    .reverse()
}

export function mergePagesWithoutDuplicatePosts(
  pageGroups: BookmarkPost[][][],
): BookmarkPost[][] {
  const seen = new Set<string>()
  const merged: BookmarkPost[][] = []

  for (const group of pageGroups) {
    for (const page of group) {
      const uniquePage = page.filter((post) => {
        if (seen.has(post.id)) {
          return false
        }
        seen.add(post.id)
        return true
      })
      merged.push(uniquePage)
    }
  }

  return merged
}

function recordNewestFirstOrder(
  posts: BookmarkPost[],
  postOrder: Map<string, number>,
  startOrdinal: number,
): number {
  let ordinal = startOrdinal
  for (const post of posts) {
    if (!postOrder.has(post.id)) {
      postOrder.set(post.id, ordinal)
    }
    ordinal += 1
  }
  return ordinal
}

function orderSelectedOldestToNewest(
  selected: BookmarkPost[],
  postOrder: Map<string, number>,
): BookmarkPost[] {
  return [...selected].sort((left, right) => {
    const leftOrder = postOrder.get(left.id) ?? -1
    const rightOrder = postOrder.get(right.id) ?? -1
    return rightOrder - leftOrder
  })
}

export function buildSourceMarkdown(
  post: BookmarkPost,
  capturedAt: string,
): string {
  const handle = normalizeHandle(post.authorHandle) ?? 'unknown'
  const author = post.authorName?.trim() || 'Unknown author'
  const postedAt = post.createdAt?.trim() || 'unknown'
  const sourceUrl = `https://x.com/${handle}/status/${post.id}`
  const title = markdownTitle(post.text)
  const links = post.links.length
    ? post.links.map((link) => `- ${link}`).join('\n')
    : '- unknown'
  const metrics = post.publicMetrics ?? {}

  return `---
tags:
  - external
source: x-bookmark
source_url: ${sourceUrl}
post_id: "${yamlEscape(post.id)}"
author: "${yamlEscape(author)}"
handle: "${yamlEscape(handle)}"
posted_at: "${yamlEscape(postedAt)}"
captured_at: "${yamlEscape(capturedAt)}"
---

# X Bookmark: ${title}

Source: [${sourceUrl}](${sourceUrl})
Author: ${author} (@${handle})
Posted: ${postedAt}

## Post

${post.text.trim() || 'unknown'}

## Links

${links}

## Metadata

- Likes: ${metricValue(metrics.like_count)}
- Reposts: ${metricValue(metrics.retweet_count)}
- Replies: ${metricValue(metrics.reply_count)}
- Quotes: ${metricValue(metrics.quote_count)}
`
}

export function sourceFilename(post: BookmarkPost, capturedAt: string): string {
  const day = dateDay(post.createdAt) ?? dateDay(capturedAt) ?? 'unknown-date'
  const identity = slugify(
    normalizeHandle(post.authorHandle) ?? post.authorName ?? 'unknown',
  )
  return `${day}-x-bookmark-${identity}-${post.id}.md`
}

export async function readReviewedIds(
  reviewedPath: string,
): Promise<Set<string>> {
  if (!(await exists(reviewedPath))) {
    return new Set()
  }

  const reviewedIds = new Set<string>()
  const content = await readFile(reviewedPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim()) {
      continue
    }
    const entry = JSON.parse(line) as { post_id?: unknown }
    if (typeof entry.post_id === 'string') {
      reviewedIds.add(entry.post_id)
    }
  }
  return reviewedIds
}

export async function readCheckpoint(
  checkpointPath: string,
): Promise<Checkpoint> {
  if (!(await exists(checkpointPath))) {
    return {}
  }
  return JSON.parse(await readFile(checkpointPath, 'utf8')) as Checkpoint
}

export async function uniquePath(filePath: string): Promise<string> {
  if (!(await exists(filePath))) {
    return filePath
  }

  const parsed = path.parse(filePath)
  for (let copy = 2; ; copy += 1) {
    const candidate = path.join(
      parsed.dir,
      `${parsed.name}-${copy}${parsed.ext}`,
    )
    if (!(await exists(candidate))) {
      return candidate
    }
  }
}

export async function collectSelectedBookmarks(
  xurlJson: XurlJsonRunner,
  userId: string,
  options: CliOptions,
  checkpoint: Checkpoint,
  reviewedIds: Set<string>,
): Promise<CollectionResult> {
  const errors: string[] = []
  const selected: BookmarkPost[] = []
  const selectedIds = new Set(reviewedIds)
  const postOrder = new Map<string, number>()
  let pagesFetched = 0
  let cursorReset = false
  let backlogExhausted = false
  let nextBacklogToken: string | null = checkpoint.backlog_token ?? null
  let headCursor: string | null = null
  let newestFirstOrdinal = 0

  const headPages: BookmarkPost[][] = []
  const headPageLimit = Math.min(options.headPages, options.maxPages)
  let token: string | null = null

  for (let pageIndex = 0; pageIndex < headPageLimit; pageIndex += 1) {
    const page = await fetchBookmarkPage(xurlJson, userId, token)
    pagesFetched += 1
    errors.push(...page.errors)
    headPages.push(page.bookmarkPage.posts)
    newestFirstOrdinal = recordNewestFirstOrder(
      page.bookmarkPage.posts,
      postOrder,
      newestFirstOrdinal,
    )
    headCursor = page.bookmarkPage.nextToken
    token = page.bookmarkPage.nextToken

    if (!token) {
      break
    }
  }

  for (const post of selectOldestReachableUnreviewed(
    headPages,
    reviewedIds,
    options.limit,
  )) {
    selected.push(post)
    selectedIds.add(post.id)
  }

  if (selected.length >= options.limit) {
    return {
      selected: orderSelectedOldestToNewest(selected, postOrder),
      pagesFetched,
      nextBacklogToken: checkpoint.backlog_token ?? headCursor,
      backlogExhausted: checkpoint.backlog_exhausted ?? false,
      cursorReset,
      errors,
    }
  }

  if (checkpoint.backlog_exhausted) {
    return {
      selected: orderSelectedOldestToNewest(selected, postOrder),
      pagesFetched,
      nextBacklogToken: null,
      backlogExhausted: true,
      cursorReset,
      errors,
    }
  }

  token = checkpoint.backlog_token ?? headCursor
  nextBacklogToken = token

  while (selected.length < options.limit && pagesFetched < options.maxPages) {
    if (!token) {
      backlogExhausted = true
      nextBacklogToken = null
      break
    }

    let page: NormalizedPage
    try {
      page = await fetchBookmarkPage(xurlJson, userId, token)
    } catch (error) {
      if (
        checkpoint.backlog_token &&
        token === checkpoint.backlog_token &&
        !cursorReset &&
        isRejectedCursorError(error)
      ) {
        errors.push(SAVED_CURSOR_REJECTED)
        cursorReset = true
        token = headCursor
        nextBacklogToken = token
        if (!token) {
          backlogExhausted = true
          nextBacklogToken = null
          break
        }
        continue
      }
      throw error
    }

    pagesFetched += 1
    errors.push(...page.errors)
    newestFirstOrdinal = recordNewestFirstOrder(
      page.bookmarkPage.posts,
      postOrder,
      newestFirstOrdinal,
    )

    const oldestToNewest = [...page.bookmarkPage.posts].reverse()
    for (let index = 0; index < oldestToNewest.length; index += 1) {
      const post = oldestToNewest[index]
      if (selectedIds.has(post.id)) {
        continue
      }
      selected.push(post)
      selectedIds.add(post.id)
      if (selected.length >= options.limit) {
        nextBacklogToken =
          index < oldestToNewest.length - 1
            ? page.bookmarkPage.requestToken
            : page.bookmarkPage.nextToken
        break
      }
    }

    if (selected.length >= options.limit) {
      break
    }

    token = page.bookmarkPage.nextToken
    nextBacklogToken = token
    if (!token) {
      backlogExhausted = true
      nextBacklogToken = null
      break
    }
  }

  return {
    selected: orderSelectedOldestToNewest(selected, postOrder),
    pagesFetched,
    nextBacklogToken,
    backlogExhausted,
    cursorReset,
    errors,
  }
}

export async function run(
  options: CliOptions,
  xurlJson: XurlJsonRunner = runXurlJsonCommand,
): Promise<void> {
  const runId = new Date().toISOString().replace(/[-:.TZ]/g, '')
  const startedAt = new Date().toISOString()
  const stateDir = path.join(options.vaultRoot, 'raw', 'state', 'x-bookmarks')
  const sourcesDir = path.join(options.vaultRoot, 'raw', 'sources')
  const reviewedPath = path.join(stateDir, 'reviewed.jsonl')
  const runsPath = path.join(stateDir, 'runs.jsonl')
  const checkpointPath = path.join(stateDir, 'checkpoint.json')
  const sourceRecords: string[] = []
  const writeErrors: string[] = []

  await mkdir(stateDir, { recursive: true })
  await mkdir(sourcesDir, { recursive: true })

  const reviewedIds = await readReviewedIds(reviewedPath)
  const checkpoint = await readCheckpoint(checkpointPath)
  const me = await xurlJson(['whoami'])
  const userId = getNestedString(asRecord(me), ['data', 'id'])
    ?? stringValue(asRecord(me).id)
  if (!userId) {
    throw new Error('Failed to resolve authenticated user through xurl whoami.')
  }

  const collection = await collectSelectedBookmarks(
    xurlJson,
    userId,
    options,
    checkpoint,
    reviewedIds,
  )

  for (const post of collection.selected) {
    const capturedAt = new Date().toISOString()
    const desiredPath = path.join(sourcesDir, sourceFilename(post, capturedAt))

    try {
      const sourcePath = await uniquePath(desiredPath)
      await writeFile(sourcePath, buildSourceMarkdown(post, capturedAt), {
        encoding: 'utf8',
        flag: 'wx',
      })
      const reviewedEntry: ReviewedEntry = {
        post_id: post.id,
        reviewed_at: capturedAt,
        run_id: runId,
        decision: 'captured',
        source_record_path: path.relative(options.vaultRoot, sourcePath),
        source: 'main',
      }
      try {
        await appendJsonLine(reviewedPath, reviewedEntry)
      } catch (error) {
        try {
          await rm(sourcePath, { force: true })
        } catch (cleanupError) {
          throw new Error(
            `${errorMessage(error)}; failed to remove orphaned source record ${sourcePath}: ${errorMessage(cleanupError)}`,
          )
        }
        throw error
      }
      sourceRecords.push(reviewedEntry.source_record_path)
    } catch (error) {
      writeErrors.push(errorMessage(error))
    }
  }

  const allErrors = [...collection.errors, ...writeErrors]
  const finishedAt = new Date().toISOString()
  const runEntry: RunEntry = {
    run_id: runId,
    started_at: startedAt,
    finished_at: finishedAt,
    limit: options.limit,
    max_pages: options.maxPages,
    pages_fetched: collection.pagesFetched,
    evaluated_count: collection.selected.length,
    captured_count: sourceRecords.length,
    errors: allErrors,
  }

  await appendJsonLine(runsPath, runEntry)

  if (writeErrors.length === 0) {
    const nextCheckpoint: Checkpoint = {
      last_successful_run_at: finishedAt,
      last_pages_fetched: collection.pagesFetched,
      head_pages: options.headPages,
      backlog_token: collection.nextBacklogToken,
      backlog_exhausted: collection.backlogExhausted,
    }
    await writeCheckpointAtomically(checkpointPath, nextCheckpoint)
  }

  const summary = {
    user_id: userId,
    ...runEntry,
    source_records: sourceRecords,
    next_backlog_token: collection.nextBacklogToken,
    backlog_exhausted: collection.backlogExhausted,
    cursor_reset: collection.cursorReset,
  }
  console.log(JSON.stringify(summary, null, 2))

  if (writeErrors.length > 0) {
    throw new Error(
      'Run completed with source/state write errors; checkpoint was not advanced.',
    )
  }
}

interface NormalizedPage {
  bookmarkPage: BookmarkPage
  errors: string[]
}

async function fetchBookmarkPage(
  xurlJson: XurlJsonRunner,
  userId: string,
  paginationToken: string | null,
): Promise<NormalizedPage> {
  const query = new URLSearchParams({
    max_results: '100',
    expansions: 'author_id,attachments.media_keys',
    'tweet.fields': 'author_id,created_at,entities,note_tweet,public_metrics',
    'user.fields': 'id,name,username',
    'media.fields': 'url,preview_image_url,type',
  })
  if (paginationToken) {
    query.set('pagination_token', paginationToken)
  }
  const response = await xurlJson([
    '--auth',
    'oauth2',
    `/2/users/${userId}/bookmarks?${query.toString()}`,
  ])

  return normalizeBookmarkPage(response, paginationToken)
}

async function runXurlJsonCommand(args: string[]): Promise<JsonRecord> {
  try {
    const { stdout } = await execFileAsync('xurl', args, {
      maxBuffer: XURL_MAX_BUFFER_BYTES,
    })
    return JSON.parse(stdout) as JsonRecord
  } catch (error) {
    throw new Error(formatXurlError(error))
  }
}

function formatXurlError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'xurl execution failed'
  }

  const parts = [error.message]
  const detail = error as { stdout?: unknown; stderr?: unknown }
  if (typeof detail.stdout === 'string' && detail.stdout.trim().length > 0) {
    parts.push(detail.stdout.trim())
  }
  if (typeof detail.stderr === 'string' && detail.stderr.trim().length > 0) {
    parts.push(detail.stderr.trim())
  }
  return parts.join('\n')
}

function normalizeBookmarkPage(
  response: unknown,
  requestToken: string | null,
): NormalizedPage {
  const record = asRecord(response)
  const data = asArray(record.data)
  const includes = asRecord(record.includes)
  const users = new Map<string, JsonRecord>()

  for (const user of asArray(includes.users)) {
    const userRecord = asRecord(user)
    const id = stringValue(userRecord.id)
    if (id) {
      users.set(id, userRecord)
    }
  }

  const posts = data
    .map((item) => normalizePost(asRecord(item), users))
    .filter((post): post is BookmarkPost => post !== null)
  const meta = asRecord(record.meta)
  const nextToken =
    stringValue(meta.next_token) ?? stringValue(meta.nextToken) ?? null
  const errors = asArray(record.errors).map((error) => errorMessage(error))

  return {
    bookmarkPage: {
      posts,
      requestToken,
      nextToken,
    },
    errors,
  }
}

function normalizePost(
  tweet: JsonRecord,
  users: Map<string, JsonRecord>,
): BookmarkPost | null {
  const id = stringValue(tweet.id)
  if (!id) {
    return null
  }

  const authorId =
    stringValue(tweet.author_id) ?? stringValue(tweet.authorId) ?? undefined
  const author = authorId ? users.get(authorId) : undefined
  const publicMetrics =
    optionalRecord(tweet.public_metrics) ?? optionalRecord(tweet.publicMetrics)
  const noteTweet =
    optionalRecord(tweet.note_tweet) ?? optionalRecord(tweet.noteTweet)
  const text =
    stringValue(noteTweet?.text) ?? stringValue(tweet.text) ?? ''

  return {
    id,
    text,
    authorId,
    authorName: author ? (stringValue(author.name) ?? undefined) : undefined,
    authorHandle: author
      ? (stringValue(author.username) ?? undefined)
      : (stringValue(tweet.username) ?? undefined),
    createdAt:
      stringValue(tweet.created_at) ??
      stringValue(tweet.createdAt) ??
      undefined,
    publicMetrics: {
      like_count: numberValue(
        publicMetrics?.like_count ?? publicMetrics?.likeCount,
      ),
      retweet_count: numberValue(
        publicMetrics?.retweet_count ?? publicMetrics?.retweetCount,
      ),
      reply_count: numberValue(
        publicMetrics?.reply_count ?? publicMetrics?.replyCount,
      ),
      quote_count: numberValue(
        publicMetrics?.quote_count ?? publicMetrics?.quoteCount,
      ),
    },
    links: extractLinks(tweet, noteTweet),
  }
}

function extractLinks(
  tweet: JsonRecord,
  noteTweet?: JsonRecord,
): string[] {
  const entityGroups = [asRecord(tweet.entities), asRecord(noteTweet?.entities)]
  const seen = new Set<string>()
  const links: string[] = []

  for (const entities of entityGroups) {
    for (const url of asArray(entities?.urls)) {
      const urlRecord = asRecord(url)
      const link =
        stringValue(urlRecord.unwound_url) ??
        stringValue(urlRecord.unwoundUrl) ??
        stringValue(urlRecord.expanded_url) ??
        stringValue(urlRecord.expandedUrl) ??
        stringValue(urlRecord.url)
      if (link && !seen.has(link)) {
        seen.add(link)
        links.push(link)
      }
    }
  }

  return links
}

async function appendJsonLine(filePath: string, entry: unknown): Promise<void> {
  const prefix = (await needsJsonLineSeparator(filePath)) ? '\n' : ''
  await writeFile(filePath, `${prefix}${JSON.stringify(entry)}\n`, {
    encoding: 'utf8',
    flag: 'a',
  })
}

async function needsJsonLineSeparator(filePath: string): Promise<boolean> {
  let fileInfo: Awaited<ReturnType<typeof stat>>
  try {
    fileInfo = await stat(filePath)
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return false
    }
    throw error
  }

  if (fileInfo.size === 0) {
    return false
  }

  const handle = await open(filePath, 'r')
  try {
    const buffer = Buffer.alloc(1)
    await handle.read(buffer, 0, 1, fileInfo.size - 1)
    return buffer[0] !== 10
  } finally {
    await handle.close()
  }
}

async function writeCheckpointAtomically(
  checkpointPath: string,
  checkpoint: Checkpoint,
): Promise<void> {
  const tempPath = path.join(
    path.dirname(checkpointPath),
    `.${path.basename(checkpointPath)}.${process.pid}.${Date.now()}.tmp`,
  )

  try {
    await writeFile(
      tempPath,
      `${JSON.stringify(checkpoint, null, 2)}\n`,
      'utf8',
    )
    await rename(tempPath, checkpointPath)
  } catch (error) {
    await rm(tempPath, { force: true }).catch(() => undefined)
    throw error
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

function parseIntegerFlag(flag: string, value: string | undefined): number {
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${flag} requires a value`)
  }
  if (!/^(?:[1-9][0-9]?)$|^100$/.test(value)) {
    throw new Error(`${flag} must be an integer from 1 to 100`)
  }
  return Number(value)
}

function markdownTitle(text: string): string {
  const title = text.replace(/\s+/g, ' ').trim().slice(0, 80)
  return title || 'Untitled'
}

function yamlEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
}

function normalizeHandle(handle: string | undefined): string | undefined {
  const normalized = handle?.trim().replace(/^@+/, '')
  return normalized || undefined
}

function metricValue(value: number | undefined): string {
  return typeof value === 'number' ? String(value) : 'unknown'
}

function dateDay(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return date.toISOString().slice(0, 10)
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'unknown'
}

function getNestedString(
  record: JsonRecord,
  pathParts: string[],
): string | undefined {
  let current: unknown = record
  for (const part of pathParts) {
    current = asRecord(current)?.[part]
  }
  return stringValue(current) ?? undefined
}

function asRecord(value: unknown): JsonRecord {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord
  }
  return {}
}

function optionalRecord(value: unknown): JsonRecord | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as JsonRecord
  }
  return undefined
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

function isRejectedCursorError(error: unknown): boolean {
  const message = errorMessage(error).toLowerCase()
  return (
    message.includes('pagination') ||
    message.includes('token') ||
    message.includes('cursor') ||
    message.includes('invalid')
  )
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error
}

if (typeof require !== 'undefined' && require.main === module) {
  run(parseArgs(process.argv.slice(2))).catch((error) => {
    console.error(errorMessage(error))
    process.exit(1)
  })
}
