// Settlement domain services — logic spanning multiple settlement aggregates.

// SettlementCalculationService — aggregates total claimed, received, and outstanding
//   balances across multiple SettlementRecord aggregates for a given workspace or account.
//   Pure function — no I/O; accepts a pre-loaded list of settlement records.
//
// ReconciliationService — matches incoming payment amounts against outstanding
//   settlement obligations. When amounts match within a configurable tolerance,
//   emits ReconciliationMatched event. Discrepancies route to a manual review queue.
//   Invariant: never updates a SettlementRecord stage without an explicit approval action.
