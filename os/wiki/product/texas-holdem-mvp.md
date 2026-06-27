# Texas Hold'em ChatGPT App MVP

## Product Goal

Create a playable Texas Hold'em game inside ChatGPT where the user can play hands, see table state, and ask for rule explanations.

## Target User

A ChatGPT user who wants a light poker experience and in-context guidance, not a professional gambling tool.

## MVP Scope

- One table.
- One human player.
- Two bot opponents.
- No real money.
- Deterministic game state.
- Basic legal action validation.
- Showdown and winner explanation.
- Simple web component UI.

## Out Of Scope For First Pass

- Multiplayer networking.
- Real-money mechanics.
- Account systems.
- Advanced bot strategy.
- Tournament mode.
- Full analytics dashboard.

## Experience Principles

- Keep the table visible.
- Make the next legal actions obvious.
- Explain rule violations kindly.
- Keep narration short.
- Never imply real-money betting.

## First Demo Script

1. User starts a hand.
2. App displays hole cards and table.
3. ChatGPT prompts the user to fold, call, raise, or check depending on legality.
4. Bots act.
5. Board runs to showdown.
6. App highlights winner and explains the winning hand.

