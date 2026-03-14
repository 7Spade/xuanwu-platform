// Identity aggregate root — represents an authenticated subject's credential record
// A single Identity is always associated with exactly one Account.
// Invariants:
//   - An Identity is uniquely keyed by its provider + provider UID (e.g. firebase:uid123).
//   - An Identity belongs to exactly one Account (personal or organization).
//   - An Identity cannot be transferred between Accounts.
//   - Session tokens are short-lived; refresh tokens are managed separately.
