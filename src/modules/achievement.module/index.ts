// achievement.module — Public API barrel
// Bounded Context: Achievement Rules · Badge Unlocking
// Layer: SaaS
//
// Note: User Profile has been extracted to profile.module — it is a cross-cutting concern
// aggregated from both achievement.module and social.module.
// Badge unlocks are written to profile.module via the IProfileBadgeWritePort.
//
// Re-export DTOs, actions, and queries as they are implemented.
// NEVER export entities, value objects, repositories, or domain events.
export {};
