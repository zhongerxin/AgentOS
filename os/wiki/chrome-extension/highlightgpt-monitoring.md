# HighlightGPT Chrome Web Store Monitoring

## Extension

HighlightGPT - Highlight Text to Ask & Explain in ChatGPT

Chrome Web Store URL:

https://chromewebstore.google.com/detail/highlightgpt-%E2%80%93-highlight/bdjccdhalfkaiolllkadcohhieboaain?authuser=0&hl=en&pli=1

## Latest Manual Snapshot

Date checked: 2026-06-27 Asia/Shanghai.

Observed public listing fields:

- Users: 276
- Rating: 5.0
- Ratings count: 2
- Version: 1.0.5

## Monitoring Goal

Track whether user count is growing and catch listing changes that may indicate conversion problems.

## Metrics To Capture

- `users`
- `rating`
- `ratings_count`
- `version`
- `last_checked_at`
- `source_url`
- `notes`

## Suggested Review Questions

- Did user count increase since the last snapshot?
- Did rating or rating count change?
- Did the listing version change?
- Did Chrome Web Store change visible metadata or block scraping?

## Caveat

Chrome Web Store pages can be dynamic and may require a browser profile or manual verification. Treat automated scrape failures as a signal to run a manual check.

