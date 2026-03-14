// Audit domain services.
// PolicyEvaluationService — deterministically applies a list of PolicyRules
//   to a pending AuditEntry. Returns pass/fail/blocked outcome.
//   Pure function — no I/O.
// ComplianceReportService — aggregates PolicyOutcomes for a workspace into
//   a ComplianceReport (percentage pass rate, violation categories).
