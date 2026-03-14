// Workspace domain services — logic spanning multiple workspace aggregates.

// WorkspaceVisibilityService — evaluates which workspaces are visible to a given user:
//   - Personal accounts: user sees all workspaces they own.
//   - Org accounts: owners see everything; members see via visibility setting or explicit grant.
//   Pure function — no I/O. Lives here because the rule touches multiple workspace aggregates.
//
// TaskBlockingService — derives which tasks are blocked by open Issues:
//   Traverses the WBS tree and emits workspace:workflow:blocked / unblocked events
//   when all blocking issues on a task are resolved or re-opened.
//   Invariant: task blocking state is always derived, never stored independently.
