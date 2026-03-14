// collaboration.module — Public API barrel
// Bounded Context: Collaboration / 協作
// Layer: Workspace (cross-cutting — spans workspace, work, and file contexts)
//
// Collaboration handles all real-time and async multi-participant interaction surfaces:
//   - Comments (threaded, inline, @mention)
//   - Reactions (emoji, upvote)
//   - Presence indicators (who is viewing / editing)
//   - Co-editing sessions (CRDT / OT coordination signals)
//   - Change requests and review threads on work items and files
//
// Relationship to other modules:
//   - workspace.module: comments and reviews anchor to workspace artifacts (Issue, CR, QA)
//   - work.module: comments anchor to Work Items and Milestones
//   - file.module: inline comments anchor to file lines/blocks
//   - account.module: participants are Accounts; @mentions resolve to Account handles
//   - notification.module: MentionCommentPosted, ReviewRequested events trigger notifications
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
