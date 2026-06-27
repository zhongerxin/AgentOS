# MVP Brief

## Goal

Ship a prototype that proves a poker hand can be played inside ChatGPT with visible table state and valid player actions.

## Primary Loop

1. Start hand.
2. Show player cards and visible table state.
3. Present legal actions.
4. Resolve bot actions.
5. Advance betting rounds.
6. Show showdown.
7. Explain winner.

## Success Criteria

- User can complete one hand without manual state repair.
- UI and ChatGPT messages stay synchronized.
- Illegal actions are rejected with clear explanations.
- The app can be tested locally through an MCP Inspector or ChatGPT connector tunnel.

