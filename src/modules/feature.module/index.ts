// feature.module — Public API barrel
// Bounded Context: Feature Flags · Rollout Management / 功能開關 · 功能推出管理
// Layer: SaaS (cross-cutting)
//
// feature.module provides:
//   - FeatureFlag evaluation: given an actor context, determine if a flag is ON or OFF
//   - Rollout management: percentage, account-list, account-type, and environment targeting
//   - Flag lifecycle: create, update, archive flags and their targeting rules
//   - Kill-switch: instant global override for a flag regardless of rules
//
// Distinction from account.module (Plan/Subscription):
//   - Plan gating → account.module owns Plan + Subscription entitlements
//   - Runtime toggles controlled by engineering/product ops → feature.module
//
// Relationship to other modules:
//   - identity.module: actor IdentityId used as evaluation context
//   - account.module: AccountType / Plan resolved for targeting rules
//   - audit.module: FlagStateChanged domain events projected as immutable audit entries
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
