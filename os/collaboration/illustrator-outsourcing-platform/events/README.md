# Events

This folder stores append-only event logs for the illustrator outsourcing platform.

Expected event types:

- `task_created`
- `submission_received`
- `delivery_accepted`
- `revision_requested`
- `asset_copied_to_workspace`

For the future automation watcher, a new file under a task's `submissions/` folder should create a `submission_received` event and send a message to the Owner Agent.

