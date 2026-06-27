# Texas Hold'em Rules Summary

## MVP Rule Model

Texas Hold'em deals each player two private hole cards and up to five shared community cards. Each player makes the best five-card poker hand from any combination of their hole cards and the community cards.

## Hand Flow

1. Post blinds.
2. Deal two hole cards to each player.
3. Preflop betting.
4. Deal the flop: three community cards.
5. Flop betting.
6. Deal the turn: one community card.
7. Turn betting.
8. Deal the river: one community card.
9. River betting.
10. Showdown if more than one player remains.

## Hand Rankings, Strongest To Weakest

1. Royal flush.
2. Straight flush.
3. Four of a kind.
4. Full house.
5. Flush.
6. Straight.
7. Three of a kind.
8. Two pair.
9. One pair.
10. High card.

## Implementation Notes

- Legal actions depend on the current bet and player stack.
- Folded players leave the hand.
- All-in players remain eligible for pots they contributed to.
- Side pots are required when all-in stack sizes differ.
- Showdown compares the best five-card hand for each active player.

## MVP Simplification

Implement equal starting stacks and one main pot first. Add side pots after the core game loop is tested.

## Sources

- PokerNews beginner Texas Hold'em rules: https://www.pokernews.com/rules-router/texas-holdem.htm
- Poker hand rankings overview: https://www.pokerology.com/poker/rules/hand-rankings/

