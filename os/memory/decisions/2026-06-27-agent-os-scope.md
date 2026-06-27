# Decision: Agent OS Starts As Filesystem-First

Date: 2026-06-27

## Decision

Use a local Markdown and JSON filesystem structure as the first version of the Agent OS.

## Rationale

- The project is early-stage.
- The owner is a solo developer.
- Files are easy to inspect, diff, and edit with agents.
- The plan explicitly asks for folder-based organization.

## Consequences

- No database is needed yet.
- Naming conventions matter.
- Agents should update wiki and memory files directly when durable knowledge changes.

