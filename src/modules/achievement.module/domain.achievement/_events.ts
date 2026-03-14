export interface AchievementUnlocked { readonly type: "achievement:unlocked"; readonly accountId: string; readonly badgeSlug: string; readonly occurredAt: string; }
export type AchievementDomainEventUnion = AchievementUnlocked;
