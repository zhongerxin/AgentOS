# Agent OS Filesystem Model

## Purpose

The OS folder turns local Markdown and JSON files into an operating surface for a solo developer and collaborating agents.

## Module Responsibilities

| Module | Responsibility |
| --- | --- |
| `todo` | Action lists by date. |
| `calendar` | Time-bound commitments by date. |
| `inbox` | Incoming messages and artifacts. |
| `collaboration` | Shared spaces with explicit editing rules. |
| `wiki` | Compiled knowledge and current truth. |
| `memory` | Durable observations, decisions, and session history. |
| `profiles` | People and agent context. |
| `workspace` | Active project execution. |
| `cron` | Scheduled jobs. |

## Writeback Rule

If a collaboration note changes the project direction, update the wiki or memory in the same pass.

## File-First Assumption

The filesystem is the database for now. Keep files small, human-readable, and easy for agents to diff.

