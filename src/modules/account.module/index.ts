// account.module — Public API barrel
// Bounded Context: Account / 帳戶
// Layer: SaaS (shared — unified model for personal and organization accounts)
//
// An Account is the application-level representation of a subject (a person or an organization).
// AccountType: personal | organization
//
// This replaces the need for separate "User entity" and "Organization entity" identity concerns:
//   - A personal account is created when a user completes identity registration.
//   - An organization account is created when an org owner provisions a new organization.
//   - Both types have a public profile surface (display name, avatar, bio, handle).
//
// Relationship to other modules:
//   - identity.module: an Identity (auth credential) is always linked to one Account.
//   - namespace.module: a namespace slug is owned by one Account (personal or org).
//   - org.module: organization-operational concerns (teams, membership) depend on an org Account.
//   - achievement.module: badge unlocks are written to an Account via IAccountBadgeWritePort.
//   - social.module: social signals (follow, star) are read from Account public profile.
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
