// Achievement aggregate root — enforces achievement rule evaluation and badge unlock invariants
// Sub-aggregates: Badge, AchievementRule, UserAchievementRecord
//
// Note: User Profile is owned by profile.module.
// Badge unlocks are projected to User Profile via IProfileBadgeWritePort (cross-module via event bus).
