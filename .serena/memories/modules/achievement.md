# achievement.module — File Index

**Bounded Context**: 成就 / Achievement
**職責**: 成就徽章解鎖、XP 積分系統、技能等級推導、成就記錄持久化。
**不包含**: 社交分享（social.module）、帳號資料（account.module — 持有 AccountBadgeUnlocked 事件整合）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type AchievementDTO`
- `export unlockBadge`
- `export getAchievementsByAccount`
- `export type IAchievementRepository`

---

## `core/_use-cases.ts`
**描述**: 徽章解鎖與成就查詢用例，`unlockBadge` 為冪等操作。
**函數清單**:
- `interface AchievementDTO`
- `unlockBadge(repo, accountId, badgeSlug, xpAwarded): Promise<Result<AchievementDTO>>`
- `getAchievementsByAccount(repo, accountId): Promise<Result<AchievementDTO[]>>`

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**: 重新匯出 `AchievementDTO`、`unlockBadge`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**: 重新匯出 `AchievementDTO`、`getAchievementsByAccount`

---

## `domain.achievement/_value-objects.ts`
**描述**: 成就 domain 的 Branded Types。
**函數清單**:
- `AchievementIdSchema` / `type AchievementId`
- `BadgeSlugSchema` / `type BadgeSlug` — 小寫英數字連字號正規式

---

## `domain.achievement/_entity.ts`
**描述**: `AchievementRecord` 成就記錄 entity + factory helper。
**函數清單**:
- `interface AchievementRecord` — `{ id, accountId, badgeSlug, unlockedAt }`
- `buildAchievementRecord(id, accountId, badgeSlug, now): AchievementRecord`

---

## `domain.achievement/_events.ts`
**描述**: Achievement Bounded Context Domain Event union type。
**函數清單**:
- `interface AchievementUnlocked`
- `type AchievementDomainEventUnion`

---

## `domain.achievement/_ports.ts`
**描述**: Achievement domain Port 介面。
**函數清單**:
- `interface IAchievementRepository` — `findByAccountId`, `findById`, `save`

---

## `domain.achievement/_service.ts` ✅ Wave 12
**描述**: Achievement Domain Service — 純函式，無 I/O。SkillTierCalculationService + AchievementEvaluationService + BadgeGrantService。
**函數清單**:
- `type SkillTier` — `"apprentice" | "journeyman" | "expert" | "artisan" | "grandmaster" | "legendary" | "titan"`
- `interface TierDefinition` — `{ tier, rank, label, minXp, maxXp }`
- `XP_MAX = 525` — Titan 等級上限
- `XP_MIN = 0`
- `TIER_DEFINITIONS: readonly TierDefinition[]` — 7 個等級定義（源自 7Spade/xuanwu shared-kernel/skill-tier）
- `clampXp(xp: number): number`
- `resolveSkillTier(xp: number): SkillTier` — 純推導，不存入 DB（Invariant #12）
- `hasBadge(records, badgeSlug): boolean`
- `getBadgesByAccountId(records): BadgeSlug[]`
- `isEligibleForBadge(records, badgeSlug): boolean`
- `evaluateAchievementRules(currentBadgeSlugs, candidateBadgeSlug): BadgeSlug[]`

---

## `infra.firestore/_mapper.ts` ✅ Wave 12
**描述**: Firestore 文件 ↔ AchievementRecord 的雙向轉換。
**函數清單**:
- `interface AchievementDoc`
- `achievementDocToRecord(d: AchievementDoc): AchievementRecord`
- `achievementRecordToDoc(e: AchievementRecord): AchievementDoc`

---

## `infra.firestore/_repository.ts` ✅ Wave 12
**描述**: `IAchievementRepository` 的 Firestore Web SDK 實作。
**函數清單**:
- `class FirestoreAchievementRepository implements IAchievementRepository`
  - `findByAccountId(accountId: string): Promise<AchievementRecord[]>`
  - `findById(id: AchievementId): Promise<AchievementRecord | null>`
  - `save(record: AchievementRecord): Promise<void>`
