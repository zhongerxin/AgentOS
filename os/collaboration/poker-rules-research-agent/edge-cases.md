# Texas Hold'em Edge Cases To Validate

## Betting

- Player can fold, check, call, bet, or raise depending on current bet state.
- Preflop action starts left of the big blind in a normal game.
- Postflop action starts left of the dealer button among active players.
- A betting round ends when all active non-all-in players have matched the current bet or folded.

## All-In

- All-in players remain eligible only for pots they contributed to.
- Side pots may be needed if players have different stack sizes.
- All-in players no longer act in later betting rounds.

## Showdown

- Best five-card hand is selected from each player's two hole cards plus five community cards.
- Ties split the relevant pot.
- Folded players are not eligible to win any pot.

## Product Simplifications For MVP

- Start with one table and three players total.
- Use deterministic bots until the action engine is stable.
- Side pots can be implemented after simple equal-stack hands work.

