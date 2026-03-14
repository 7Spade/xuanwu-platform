// WorkItem aggregate root — lightweight planning entity (issue-like, not WBS-structured)
// Sub-aggregates: Milestone, Dependency
// Invariants:
//   - A Milestone has a target date and groups multiple WorkItems.
//   - A Dependency is a directed link between WorkItems (A blocks B).
//   - WorkItems can be promoted to WBS Tasks by attaching structured records.
