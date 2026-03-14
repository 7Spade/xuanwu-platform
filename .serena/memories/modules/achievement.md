# achievement.module — File Index

**Bounded Context**: 成就 / Achievement
**職責**: 成就徽章解鎖、XP 積分系統、成就記錄持久化。
**不包含**: 社交分享（social.module）、帳號資料（account.module — 持有 AccountBadgeUnlocked 事件整合）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type AchievementDTO` — 成就公開 DTO
- `export unlockBadge` — 為帳號解鎖指定徽章
- `export getAchievementsByAccount` — 依帳號查詢成就清單
- `export type IAchievementRepository` — 成就 Repository Port 介面

---

## `core/_use-cases.ts`
**描述**: 徽章解鎖與成就查詢用例，`unlockBadge` 為冪等操作（重複解鎖相同徽章不報錯）。
**函數清單**:
- `interface AchievementDTO` — 成就公開 DTO（id, accountId, badgeSlug, unlockedAt, xpAwarded）
- `unlockBadge(repo, accountId, badgeSlug, xpAwarded): Promise<Result<AchievementDTO>>` — 解鎖徽章（冪等，已解鎖時回傳現有記錄）
- `getAchievementsByAccount(repo, accountId): Promise<Result<AchievementDTO[]>>` — 查詢帳號成就清單

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `AchievementDTO`（型別）
- 重新匯出 `unlockBadge`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `AchievementDTO`（型別）
- 重新匯出 `getAchievementsByAccount`

---

## `domain.achievement/_value-objects.ts`
**描述**: 成就 domain 的 Branded Types。
**函數清單**:
- `AchievementIdSchema` / `type AchievementId` — 成就記錄唯一識別碼
- `BadgeSlugSchema` / `type BadgeSlug` — 徽章 slug（小寫英數字、連字號，正規式驗證）

---

## `domain.achievement/_entity.ts`
**描述**: `AchievementRecord` 成就記錄 entity。
**函數清單**:
- `interface AchievementRecord` — 成就記錄（id, accountId, badgeSlug, xpAwarded, unlockedAt）
- `buildAchievementRecord(params, now): AchievementRecord` — 建立成就記錄

---

## `domain.achievement/_events.ts`
**描述**: Achievement Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface AchievementUnlocked` — 成就解鎖事件（accountId, badgeSlug, xpAwarded, unlockedAt）
- `type AchievementDomainEventUnion` — 上述事件的 union type（= `AchievementUnlocked`）

---

## `domain.achievement/_ports.ts`
**描述**: Achievement domain 的 Port 介面定義。
**函數清單**:
- `interface IAchievementRepository` — 成就記錄持久化（findById, findByAccount, findByBadge, save）

---

## `domain.achievement/_service.ts`
**描述**: Achievement Domain Service 規格說明。
**函數清單**:
- `XPCalculationService`（描述）— 計算帳號累積 XP 與等級
- `BadgeEligibilityService`（描述）— 依業務規則評估帳號是否符合解鎖條件

---

## `infra.firestore/_repository.ts`
**描述**: `IAchievementRepository` 的 Firestore 實作骨架。
**函數清單**: *(待實作，目前為佔位註解)*

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ AchievementRecord 的雙向轉換。
**函數清單**: *(待實作，目前為佔位註解)*
