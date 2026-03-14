// Fork aggregate root — a planning-branch copy of a workspace baseline
// Invariants:
//   - A fork is always derived from a specific baseline version of a workspace.
//   - A fork can diverge from its origin and be submitted back via a Change Request.
//   - Only one pending merge-back CR per fork is allowed at a time.
