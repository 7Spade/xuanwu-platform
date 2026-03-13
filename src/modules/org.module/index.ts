// org.module — Public API barrel
// Bounded Context: Organization · Team · Membership Governance
// Layer: SaaS
//
// org.module handles organization-OPERATIONAL concerns only:
//   - Team creation and management
//   - Member invitation, role assignment, and governance
//   - Workspace provisioning under an organization account
//
// What org.module does NOT own:
//   - Identity/authentication → identity.module
//   - Account entity (name, handle, avatar, public profile) → account.module
//   - Namespace registration and workspace path binding → namespace.module
//
// An Org Account (the entity representing the organization) lives in account.module
// with AccountType: organization. org.module holds only the operational data for
// that organization (its teams and member relationships).
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
