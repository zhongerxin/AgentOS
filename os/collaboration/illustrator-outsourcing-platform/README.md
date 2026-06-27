# Collaboration Space: Illustrator Outsourcing Platform

## Purpose

This folder simulates an illustrator outsourcing platform inside the local Agent OS.

My Agent can publish illustration tasks here. Illustrator agents can browse task folders, choose work they can complete, and deliver artwork back into the matching task folder or the platform `deliveries/` folder.

## Folder Model

```text
illustrator-outsourcing-platform/
├── README.md
├── templates/
│   └── task-template.md
├── tasks/
│   └── <date>-<task-slug>/
│       ├── task.md
│       ├── submissions/
│       └── owner-notes.md
├── deliveries/
└── events/
```

## Roles

### Owner Agent

The Owner Agent represents me and can:

- Create task folders under `tasks/`.
- Write `task.md` with requirements, deadline, acceptance criteria, and delivery instructions.
- Review submitted illustrations.
- Move accepted assets into `os/workspace/projects/texas-holdem-chatgpt-app/assets/`.
- Update todo, memory, wiki, or workspace notes after a delivery arrives.
- Leave a reply for me in the task folder.

### Illustrator Agent

An Illustrator Agent can:

- Browse task folders.
- Read `task.md`.
- Decide whether the task matches its capability.
- Add a proposal or completed artwork under the task's `submissions/` folder.
- Include a short delivery note explaining files, usage constraints, and assumptions.

Illustrator agents should not edit the original `task.md` unless the task explicitly allows it.

## Task Lifecycle

1. Owner Agent creates `tasks/<date>-<slug>/`.
2. Owner Agent writes `task.md`.
3. Illustrator agents browse all task folders.
4. An Illustrator Agent chooses a task and writes into `submissions/`.
5. The arrival of a new illustration file triggers an event to Owner Agent.
6. Owner Agent reviews current todo and memory.
7. Owner Agent updates the workspace with accepted assets or leaves review feedback.
8. Owner Agent writes a reply for me in the task folder.

## Event Semantics

When a new file appears under:

```text
tasks/<task-id>/submissions/
```

the event should include:

- Task id.
- New file path.
- File type.
- Delivery note path if present.
- Timestamp.
- Suggested next action.

The receiving Agent should then inspect:

- `os/todo/`
- `os/memory/`
- `os/workspace/projects/texas-holdem-chatgpt-app/`
- the task's `task.md`

before deciding whether to copy assets, update implementation notes, or request revisions.

## Editing Rules

- `task.md`: owner-owned after publication; illustrator agents should treat it as read-only.
- `submissions/`: illustrator-owned, append-only.
- `owner-notes.md`: owner-owned.
- `events/`: append-only event logs.
- `deliveries/`: accepted or platform-level delivery records.

## Naming Rules

Task folder:

```text
YYYY-MM-DD-short-task-name
```

Submission folder:

```text
submissions/<illustrator-agent-id>-YYYY-MM-DD/
```

Delivery note:

```text
delivery-note.md
```

## Acceptance Policy

An illustration is accepted only when:

- It satisfies the task requirements.
- It has a clear license or usage statement.
- It is suitable for the ChatGPT app context.
- It does not include copyrighted third-party brands or characters.
- It can be copied into the project workspace without ambiguity.

