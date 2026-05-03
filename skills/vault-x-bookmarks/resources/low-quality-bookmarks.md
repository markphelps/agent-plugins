# Low Quality X Bookmark Examples

Use these examples to calibrate deletion during `vault-x-bookmarks` prune mode.
Do not delete by keyword, length, URL count, or any mechanical score. Read the
record and decide whether it contains durable value for this vault.

## Delete: Teaser For Missing Thread

Pattern:

- The post says a thread, mega-thread, guide, or playbook exists.
- The actual thread/guide content is not captured.
- There is no useful `## Article` or `## Linked Content` section.

Example judgment:

Delete a record that says "here's the mega thread on how I market my app with
TikTok ads" when the source only contains that teaser and a media/link pointer.
The promised playbook is absent, so the record cannot support later synthesis.

## Delete: Media Or Video Pointer Without Substance

Pattern:

- The post points to a video, image, or walkthrough.
- The source record does not include a transcript, meaningful linked content, or
  detailed post text.

Example judgment:

Delete a React Native "here's how" video pointer when the record contains only a
short teaser and the video URL. It may be interesting, but it does not preserve
the implementation details.

## Delete: Link-In-Reply Or Missing-Prompt Record

Pattern:

- The post says commands, prompts, templates, or resources are available
  elsewhere.
- The actual commands, prompts, templates, or resources are not present in the
  source record.

Example judgment:

Delete an Obsidian commands post when it promises links to prompts but the
captured record only says they are on a website or in a reply.

## Delete: Reaction Or Adoption Anecdote Only

Pattern:

- The post mostly reacts to another source or says someone built something from
  it.
- A stronger canonical source for the same idea already exists in the vault.

Example judgment:

Delete a reaction post about sending the Karpathy wiki idea to an agent when the
vault already has the Karpathy LLM wiki source. The reaction is weak evidence
and mostly duplicates the stronger source.

## Delete: Product Pointer With No Evidence

Pattern:

- The post announces a product, MCP, or tool.
- Linked content failed, is absent, or is mostly marketing boilerplate.
- The record does not explain the workflow, implementation, or market insight.

Example judgment:

Delete a social-scheduling MCP announcement when the source contains only a
short product pitch and no captured docs, workflow details, or useful page text.

## Delete: Interesting Idea, Missing Actual System

Pattern:

- The post names an appealing method or system.
- The phrase "the system" or equivalent appears, but the actual system is not
  captured.

Example judgment:

Delete a content "snowball method" record if it only says one topic can become
30 days of content but omits the actual prompt, workflow, or examples.
