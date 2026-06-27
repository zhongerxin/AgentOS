# Decision: Texas Hold'em MVP Uses A Small Deterministic Loop

Date: 2026-06-27

## Decision

The first playable version should use one human player, two bot opponents, deterministic state transitions, and a single-table flow.

## Rationale

- Keeps the Apps SDK integration small.
- Makes rule validation easier.
- Lets UI and state synchronization be tested before adding bot personality or multiplayer complexity.

## Consequences

- Bot strategy can be simple at first.
- Side pots can be added after equal-stack hands work.
- The app should be framed as entertainment and education, not gambling.

