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
// Organization operational concerns (teams, member governance) were previously in org.module.
// With org.module removed, account.module now also owns:
//   - Team sub-aggregate (teams within an org Account)
//   - Membership (invitations, role assignment, access revocation)
//   - Workspace provisioning governance (which Account types may create workspaces)
//
// Relationship to other modules:
//   - identity.module: an Identity (auth credential) is always linked to one Account.
//   - namespace.module: a namespace slug is owned by one Account (personal or org).
//   - achievement.module: badge unlocks are written to an Account via IAccountBadgeWritePort.
//   - social.module: social signals (follow, star) are read from Account public profile.
//   - collaboration.module: @mentions resolve to Account handles.
//   - audit.module: actor references are resolved to Account handles.
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
