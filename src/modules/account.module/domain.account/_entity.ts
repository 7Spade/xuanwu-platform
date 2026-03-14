// Account aggregate root — unified account entity for personal and organization subjects
// Sub-aggregates:
//   - AccountProfile (public surface: display name, avatar, bio, badges)
//   - Team          (only for AccountType: organization — teams within this org account)
//   - Membership    (only for AccountType: organization — member invitations and role assignments)
//
// AccountType: personal | organization
//
// Invariants:
//   - An Account is associated with exactly one Identity (via IdentityId value object).
//   - AccountHandle (slug) is globally unique across all account types.
//   - Account.handle must be synchronized with the namespace slug owned by this account.
//   - An Org Account has exactly one owner (another personal Account).
//   - Account public profile is eventually consistent — updated via domain events.
//   - Team and Membership sub-aggregates exist only for AccountType: organization.
//
// Design decision: org.module has been removed. Team and Membership governance
// are now sub-aggregates of an org Account in account.module.
