---
name: vault-process
description: Process inbox items into notes with automatic linking
---

# Process Inbox

Process items from an inbox folder into notes, with automatic concept matching
and bidirectional linking.

## Arguments

`arguments` - Path and optional flags.

**Path:** Can be relative or absolute. Resolves from current working directory.

- `vault-process inbox` - Process `./inbox/` relative to cwd
- `vault-process ./notes/inbox` - Relative path
- `vault-process /Users/me/vault/inbox` - Absolute path
- `vault-process` - Defaults to `./inbox/`

**Flags:**

- `--dry-run` - Show what would be created/updated without doing it
- `--yes` - Execute without confirmation

**Examples:**

```
vault-process                    # Process ./inbox/, ask to confirm
vault-process inbox --dry-run    # Preview changes only
vault-process inbox --yes        # Process without confirmation
```

## Two-Pass Architecture

1. **First pass:** Parse inbox, extract items, create/update notes
2. **Second pass:** Scan all touched notes for concept matches, add links +
   backlinks

## Process

### Step 1: Detect inbox format

Scan the inbox folder and detect what's there:

- **Individual `.md` files** → Each file is one item
- **Daily log files** (e.g., `2025-01-04.md`) → Split by `##` headings or `---`
  separators
- **Single `inbox.md`** → Split by `##` headings or `---` separators
- **Mixed** → Handle each appropriately

Skip hidden files and folders (`.DS_Store`, etc.).

### Step 2: Extract and classify items

For each item extracted, classify it:

**URL item** - Line is primarily a URL:

- Bare URL: `https://example.com/article`
- Markdown link: `[Title](https://example.com/article)`
- URL with brief comment: `https://... - interesting approach`

**Text item** - Paragraphs of thought/content without a primary URL.

**Mixed item** - Substantial text with embedded URLs (treat as text, preserve
URLs).

### Step 3: Process each item

**For URL items** - Create lightweight reference note:

1. Fetch page metadata (title, description) using WebFetch
2. Create note with extracted metadata:

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [extracted, from, content]
source: url
---

# Page Title

Brief description from meta tags.

[Original](https://example.com/article)

## Related
```

Filename: kebab-case from title (e.g., `how-to-build-voice-apps.md`)

**For substantial text items (>280 characters)** - Create new atomic note:

1. Generate a concise title from the content
2. Infer relevant tags from the content
3. Create note:

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [inferred, topics]
source: inbox
---

# Generated Title

The captured thought/content.

## Related
```

Filename: kebab-case from generated title.

**For short text items (≤280 characters):**

1. Search existing notes for concept matches
2. If strong match found → Append to existing note:

```markdown
## Added YYYY-MM-DD

The short thought that was captured.
```

And update the note's `updated` field.

3. If no match → Create new atomic note anyway (don't lose content)

### Step 4: Discover and add links (second pass)

For each note that was created or updated:

1. **Extract concepts** - Key nouns, phrases, topics from the note
2. **Search for matches** in existing notes:
   - Filename matching (e.g., "voice UI" matches `voice-notes-app.md`)
   - Tag overlap (shared tags indicate relation)
   - Content scanning (key phrases appear in body)
3. **Rank matches** - Multiple signals = stronger match
4. **Add links** - Top ~5 matches, only if confidence is moderate+

**Inline links:** Where a concept is mentioned naturally in text, add
`[[note-name]]`.

**Related section:** Add discovered connections to `## Related` footer:

```markdown
## Related

- [[discovered-connection-1]]
- [[discovered-connection-2]]
```

### Step 5: Add backlinks

For each link added (A → B), also add the reverse (B → A):

1. Open the target note B
2. Find or create `## Related` section
3. Add `- [[A]]` if not already present
4. Update `updated` field

### Step 6: Archive processed items

Move processed inbox items to `_processed/` with date folder:

```
inbox/
├── _processed/
│   └── 2025-01-04/
│       ├── random-thought.md
│       └── daily-log.md
└── (now empty)
```

### Step 7: Report results

```
Processed 5 items from inbox:

Created:
  - how-to-build-voice-apps.md (from URL)
  - notification-fatigue.md (new thought)

Appended:
  - voice-notes-app.md (+1 thought)

Links added:
  - 12 new connections across 4 notes
  - 8 backlinks updated

Archived to: inbox/_processed/2025-01-04/
```

## Subagent Strategy

For large inboxes (10+ items), parallelize with subagents:

| Task                    | Model                 | Why                         |
| ----------------------- | --------------------- | --------------------------- |
| URL metadata extraction | small model           | Simple web fetches          |
| Content classification  | small model           | Straightforward detection   |
| Tag inference           | small model           | Basic NLP                   |
| Concept extraction      | small model           | Keyword extraction          |
| Link discovery/matching | high-capability model | Needs nuanced understanding |

Launch batch processing as background tasks, then synthesize results.

## Error Handling

- If URL fetch fails → Create note with URL only, mark for retry
- If note creation fails → Log error, continue with other items
- If linking pass fails → Notes are still created, just unlinked

## Safety

- **Never modify** notes outside the vault
- **Archive originals** before deleting from inbox
- **Confirm before executing** (unless `--yes`)
- **Dry-run available** to preview all changes
