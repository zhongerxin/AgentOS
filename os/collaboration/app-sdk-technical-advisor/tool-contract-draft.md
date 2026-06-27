# Tool Contract Draft

## Candidate Tools

### `start_hand`

Starts a new hand at the current table.

Input:

```json
{
  "table_id": "string"
}
```

Output:

```json
{
  "hand_id": "string",
  "table_state": "object",
  "message": "string"
}
```

### `player_action`

Applies a player action.

Input:

```json
{
  "hand_id": "string",
  "player_id": "string",
  "action": "fold | check | call | bet | raise",
  "amount": 0
}
```

Output:

```json
{
  "accepted": true,
  "table_state": "object",
  "message": "string"
}
```

### `get_table_state`

Returns the visible state for the current table.

Input:

```json
{
  "table_id": "string"
}
```

Output:

```json
{
  "table_state": "object"
}
```

### `explain_rule`

Explains a poker rule in the context of the current hand.

Input:

```json
{
  "hand_id": "string",
  "question": "string"
}
```

Output:

```json
{
  "answer": "string",
  "related_rule": "string"
}
```

