# Apps SDK Architecture

## Summary

For this project, the ChatGPT app should be shaped as:

- An MCP server that exposes game tools to ChatGPT.
- A web UI component for the poker table, rendered inside ChatGPT.
- A small state model that keeps the current table, hand, betting round, visible cards, legal actions, and result message.

## Official Docs Notes

OpenAI's Apps SDK quickstart says Apps SDK apps connect to ChatGPT through MCP. The required part is an MCP server that defines capabilities as tools; the optional part is a web component rendered in an iframe when a UI is needed.

The same quickstart recommends building an MCP server endpoint, commonly `/mcp`, and testing locally before exposing it to ChatGPT through an HTTPS tunnel or deployment.

The MCP concept page describes the minimal Apps SDK server capabilities as listing tools, calling tools, and returning components. It also notes that Apps SDK supports Streamable HTTP and Server-Sent Events, with Streamable HTTP recommended.

## Local Design Decision

Use the MCP tools as the authoritative game engine boundary:

- ChatGPT chooses and calls tools.
- The server validates game legality.
- The UI renders the table state returned by tools.
- Rule explanations should be tied to current hand context where possible.

## Candidate Endpoint

```text
https://<dev-or-prod-host>/mcp
```

## Candidate Tools

- `start_hand`
- `player_action`
- `get_table_state`
- `explain_rule`

## Open Questions

- Whether authentication is needed for the first prototype.
- Whether table state should be in memory, file-backed, or database-backed.
- Whether bot opponents should be deterministic or personality-driven.

## Sources

- OpenAI Apps SDK Quickstart: https://developers.openai.com/apps-sdk/quickstart
- OpenAI Apps SDK MCP concept page: https://developers.openai.com/apps-sdk/concepts/mcp-server

