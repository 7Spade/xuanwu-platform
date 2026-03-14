// achievement.module — Public API barrel
// Bounded Context: Achievement Rules · Badge Unlocking
// Layer: SaaS
//
// Badge unlocks are projected to the Account public profile via IAccountBadgeWritePort
// in account.module. achievement.module evaluates rules and publishes AccountBadgeUnlocked
// domain events; account.module applies the projection.
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
