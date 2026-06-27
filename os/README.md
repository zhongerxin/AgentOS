# Agent OS

This folder is a local-file-system operating layer for a solo developer building a ChatGPT Apps SDK Texas Hold'em game.

The layout follows `plan.md`:

- `todo/`: dated task files with status-aware checklist items.
- `calendar/`: dated event files sorted by time with durations.
- `inbox/`: dated mail folders; each Markdown file is one message with YAML metadata.
- `collaboration/`: shared spaces for people or agents that contribute assets, research, or implementation notes.
- `wiki/`: compiled knowledge base, following the LLM wiki pattern: raw sources are inputs, wiki pages are the current working truth.
- `memory/`: durable observations, decisions, chronicles, and session summaries.
- `profiles/`: user and collaborator profiles.
- `workspace/`: project working areas.
- `cron/`: scheduled task definitions in JSON.

## Operating Rules

1. Put incoming material in `inbox/` or `collaboration/` first.
2. Promote stable conclusions into `wiki/`.
3. Record decisions in `memory/decisions/`.
4. Keep project execution details in `workspace/projects/`.
5. Use `cron/` for repeatable monitoring jobs.

## Current Project Focus

Build a ChatGPT Apps SDK app for a Texas Hold'em game.

Seed context:

- The owner is a solo developer.
- Collaborators may be humans or agents.
- Expected contributions include game illustration, poker rules research, UI/UX notes, and Apps SDK implementation help.
- The owner likes climbing and collaborates with colleagues in the United States, so the calendar includes both personal training blocks and cross-time-zone meetings.

