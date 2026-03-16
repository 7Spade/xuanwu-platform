// achievement.module — Public API barrel
// Bounded Context: Achievement Rules · Badge Unlocking
export type { AchievementDTO } from "./core/_use-cases";
export { unlockBadge, getAchievementsByAccount } from "./core/_use-cases";
export type { IAchievementRepository } from "./domain.achievement/_ports";
export { AchievementsPanel } from "./_components/achievements-panel";
