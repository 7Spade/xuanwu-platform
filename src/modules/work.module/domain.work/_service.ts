// Work domain services.
// DependencyGraphValidationService — detects cycles in the WorkItem DAG before a new
//   dependency is committed. Pure function over a pre-loaded adjacency list.
// MilestoneProgressCalculationService — computes milestone completion % from
//   the count of closed vs total work items.
