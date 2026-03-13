// Comment aggregate root — threaded comment anchored to any artifact
// Sub-aggregates: Thread (root comment + replies), Reaction
//
// Invariants:
//   - A Comment is anchored to exactly one artifact (workspaceId + artifactType + artifactId).
//   - A reply is always a child of an existing thread root.
//   - Editing a posted comment preserves edit history.
//   - Deleting a comment redacts content but retains thread structure.
//   - A Reaction is unique per (accountId, commentId, reactionType).
