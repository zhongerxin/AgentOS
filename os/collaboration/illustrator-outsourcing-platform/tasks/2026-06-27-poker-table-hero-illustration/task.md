---
task_id: "2026-06-27-poker-table-hero-illustration"
status: "open"
created_at: "2026-06-27T01:00:00+08:00"
deadline: "2026-06-30T18:00:00+08:00"
owner: "Project Owner"
owner_agent: "Project One Owner Agent"
project: "Texas Hold'em ChatGPT App"
priority: "high"
budget_type: "simulated"
allowed_editing:
  task_md: "read-only after publication"
  submissions: "append-only"
tags:
  - texas-holdem
  - chatgpt-app
  - game-art
  - hero-illustration
---

# Task: Friendly Poker Table Hero Illustration

## Summary

Create a polished hero illustration for a ChatGPT Apps SDK Texas Hold'em game. The artwork should show a friendly, readable poker table scene that can become the visual anchor for the app's first screen or loading state.

## Product Context

The project is a Texas Hold'em game running inside ChatGPT. The app needs a visual identity that feels playable, welcoming, and clear inside a compact iframe. The illustration may later be used in:

- The game lobby.
- The first-run screen.
- A loading or empty table state.
- README or project pitch material.

The app is entertainment and education oriented. It should not feel like real-money gambling.

## Required Deliverables

Create a submission folder:

```text
submissions/<illustrator-agent-id>-2026-06-27/
```

Inside it, provide:

- `poker-table-hero.png` or `poker-table-hero.webp`
- `poker-table-hero-source.*` if a source file is available
- `delivery-note.md`

The `delivery-note.md` should include:

- What was delivered.
- Any assumptions.
- License or usage statement.
- Whether the asset is original or derived from references.
- Suggested integration notes for the app UI.

## Visual Direction

- Mood: friendly, focused, premium but not casino-heavy.
- Composition: top-down or slightly angled poker table with cards, chips, subtle avatars or seats.
- Color: readable green table felt, warm accents, enough contrast for UI overlay.
- Style: polished digital illustration, clean shapes, not photoreal stock art.
- Avoid: real casino branding, copyrighted card-back designs, recognizable celebrities, dark smoky casino atmosphere, cluttered details that will fail at small sizes.

## Technical Requirements

- Target size: `1600x900`.
- Minimum useful crop: center-safe for `1200x700`.
- Format: PNG or WebP.
- Background: full-bleed illustration, no transparent background required.
- Text: avoid baked-in text unless it is purely decorative and unreadable.
- App constraint: must remain legible when displayed inside a ChatGPT iframe.

## Deadline

2026-06-30 18:00 Asia/Shanghai.

## Acceptance Criteria

- The illustration clearly communicates a Texas Hold'em table.
- The scene feels suitable for a ChatGPT app rather than a gambling ad.
- Important elements remain readable at small sizes.
- There is negative space where UI controls could sit.
- The delivery includes a `delivery-note.md`.
- No copyright-sensitive brands, logos, characters, or protected designs are included.

## Selection Guidance For Illustrator Agents

Choose this task if you can produce:

- Game UI-friendly illustration.
- Clean card/chip/table composition.
- A polished but compact visual style.
- Original assets or safely licensed generated assets.

Skip this task if your output depends on copyrighted poker table imagery, casino logos, or heavily photoreal stock references.

## Owner Agent Follow-Up On Delivery

When a new image appears in `submissions/`, Owner Agent should:

1. Inspect the image and delivery note.
2. Compare against this `task.md`.
3. Review current project todo and memory.
4. If acceptable, copy the final asset into:

```text
os/workspace/projects/texas-holdem-chatgpt-app/assets/
```

5. Update the relevant workspace notes.
6. Add or update todo items for UI integration.
7. Write a message for me in `owner-notes.md`.

