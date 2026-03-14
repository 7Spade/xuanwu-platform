// Achievement domain services.
// AchievementEvaluationService — applies AchievementRules to incoming events to determine
//   which badges an account has newly qualified for.
// BadgeGrantService — orchestrates badge unlock and write-back to account profile via
//   IAccountBadgeWritePort (cross-module via event bus).
