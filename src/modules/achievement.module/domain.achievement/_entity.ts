// Achievement aggregate root — enforces achievement rule evaluation and badge unlock invariants
// Sub-aggregates: Badge, AchievementRule, UserAchievementRecord
//
// Badge unlocks are projected to Account public profile via IAccountBadgeWritePort
// in account.module (cross-module via event bus).
