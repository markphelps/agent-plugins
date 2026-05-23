# Portent Knowledge Base Spec

Portent is an opinionated model for personal and work knowledge bases. Use it to
organize information as typed objects connected by explicit relationships, with
a simple lifecycle.

## Core Rules

- Model reality first. Do not use folders as the main source of meaning.
- Every durable object should answer: what is this?
- Every organized object should answer: what will this be useful for?
- Prefer Portent defaults before creating custom types or relationships.
- Keep captured material easy to record, then organize it later.
- Keep archived material searchable, but hidden from active work by default.

## Object Shape

Every Portent object should have:

- `title`: human-readable name
- `type`: one of the Portent types
- `content`: readable body text
- lifecycle metadata: organized/archived state
- relationships: explicit links to other objects

In Markdown, store metadata in frontmatter and use wikilinks for local
references.

Example:

```yaml
---
type: Event
organized: true
archived: false
belongs_to: '[[Launch Portent v0.1]]'
related_to:
  - '[[Alice Example]]'
  - '[[Knowledge graphs]]'
---
```

## Types

Portent has eight default types.

### Project

A bounded effort that produces an output.

Use for work that:

- has a beginning and an end
- cannot be completed in one sitting
- has success criteria or a definition of done
- advances one or more responsibilities

Projects are about outputs.

### Operation

Recurring work that can usually be completed in one sitting.

Use for repeatable actions such as reviews, checks, publishing routines,
maintenance routines, or recurring admin work.

Operations usually belong to a responsibility, but can also support a project.

### Responsibility

A long-running area of accountability.

Use for outcomes that should be maintained or improved over time.

Responsibilities usually:

- do not have a natural end date
- are measured by indicators, metrics, KPIs, or standards
- collect projects and operations that improve or maintain the outcome

Responsibilities are about outcomes.

### Task

One-off work that can usually be completed in one sitting.

Tasks are part of Portent's worldview, but they do not have to live inside the
knowledge base. They can live in Todoist, Linear, GitHub Issues, or another task
tool as long as they can be related back to Portent objects.

### Event

Something that happened and should be retained in long-term memory.

Use for meetings, conversations, decisions, achievements, incidents, personal
events, external changes, or historical records.

Events often belong to a project or responsibility and are related to people and
topics.

### Note

A durable knowledge artifact.

Use for documents, resources, references, research summaries, decision records,
checklists, tools, or any material that helps understand or advance another
object.

### Topic

An area of interest or conceptual lens.

Use for knowledge that should be collected without implying ownership,
completion, or performance expectations.

Topics are useful for grouping notes and events across projects and
responsibilities.

### Person

A real-world person or, when useful, an AI agent treated as an actor.

Use for contacts, collaborators, customers, vendors, authors, attendees,
decision makers, stakeholders, or agents.

## Type Groups

PORT types are actionable:

- Project
- Operation
- Responsibility
- Task

ENTP types are non-actionable records:

- Event
- Note
- Topic
- Person

Use PORT when the object is something to do or operate. Use ENTP when the object
records what happened, what is known, what is interesting, or who is involved.

## Relationships

Portent uses two default relationship types.

### belongs_to

Primary context, ownership, or composition.

Use when an object has a main parent or main operating context.

Examples:

- a task belongs to a project
- an operation belongs to a responsibility
- an event belongs to a project
- a note belongs to the project or responsibility it primarily supports

Most objects should have at most one primary parent for a given organizing
purpose.

Inverse: `has`, `contains`, or `children`.

### related_to

Secondary usefulness or association without ownership.

Use for many-to-many links and supporting context.

Examples:

- a meeting event is related to attendees
- a note is related to multiple topics
- a project is related to a responsibility it improves
- a person is related to projects they influence

Inverse: `referred_by`, `linked_from`, backlinks, or related items.

## Lifecycle

Every object can move through three lifecycle states.

### Captured

Recorded but not yet actionable.

Captured objects may have unclear titles, missing types, missing relationships,
or incomplete context. They belong in an inbox or temporary surface.

Capture optimistically.

### Organized

Structured enough to be useful later.

An object is organized when it has:

- a clear title
- a type
- enough relationships to explain future use

Organize pessimistically. If a captured object cannot attach to a project,
responsibility, operation, or topic, consider deleting it.

### Archived

No longer useful in active work, but still useful as memory.

Archived objects should remain searchable and referenceable, but hidden from
active views by default.

Archive instead of deleting when the object still has historical, audit, or
reference value.

## Lifecycle Fields

Use any representation that preserves organized and archived state.

Separate fields:

```yaml
organized: true
archived: false
```

Single status field:

```yaml
status: organized
```

Allowed statuses should map to:

- captured
- organized
- archived

## Extension Rules

Portent can be extended, but defaults should come first.

Add a custom type only when:

- the object has different behavior, templates, relationships, or workflows
- a property on an existing type is not enough

Add a custom relationship only when:

- `belongs_to` or `related_to` hides important meaning
- the relationship needs distinct behavior or validation

Prefer properties before root types. Prefer default relationships before custom
relationships.
