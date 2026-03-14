// Workforce domain services — logic spanning multiple workforce aggregates.

// CapacityAllocationService — given a list of ScheduleAssignments and available members,
//   determines whether capacity is sufficient and suggests rebalancing if not.
//   Pure function — no I/O.
//
// ScheduleConflictResolutionService — detects temporal overlaps between ScheduleAssignments
//   for the same assignee. Emits a conflict report but does not auto-resolve.
//   Invariant: conflict detection is always derived from committed schedules,
//   never from proposals (proposals can overlap until they become OFFICIAL).
