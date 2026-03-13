// Account aggregate root — unified account entity for personal and organization subjects
// Sub-aggregates: AccountProfile (public surface: display name, avatar, bio, badges)
//
// AccountType: personal | organization
//
// Invariants:
//   - An Account is associated with exactly one Identity (via IdentityId value object).
//   - AccountHandle (slug) is globally unique across all account types.
//   - Account.handle must be synchronized with the namespace slug owned by this account.
//   - An Org Account has exactly one owner (another personal Account).
//   - Account public profile is eventually consistent — updated via domain events.
//
// Design decision: Unified Account replaces separate User/Org entity concepts.
// Org-specific operational data (teams, members) remains in org.module.
