# social.module — File Index

**Bounded Context**: 社交 / Social
**職責**: 社交關係管理（star/watch/follow）、社群互動圖。
**不包含**: 評論（collaboration.module）、成就/XP（achievement.module）、通知（notification.module 整合）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type SocialRelationDTO` — 社交關係公開 DTO
- `export addRelation` — 建立社交關係（star/watch/follow）
- `export removeRelation` — 移除社交關係
- `export getRelationsBySubject` — 查詢主體的社交關係清單
- `export type ISocialGraphRepository` — 社交圖 Repository Port 介面

---

## `core/_use-cases.ts`
**描述**: 社交關係 CRUD 用例，支援三種關係類型。
**函數清單**:
- `interface SocialRelationDTO` — 社交關係公開 DTO（id, subjectId, objectId, objectType, relationType, createdAt）
- `addRelation(repo, subjectId, objectId, objectType, relationType): Promise<Result<SocialRelationDTO>>` — 建立關係（冪等）
- `removeRelation(repo, subjectId, objectId, relationType): Promise<Result<void>>` — 移除關係
- `getRelationsBySubject(repo, subjectId, relationType): Promise<Result<SocialRelationDTO[]>>` — 查詢主體的關係清單

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `SocialRelationDTO`（型別）
- 重新匯出 `addRelation`、`removeRelation`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `SocialRelationDTO`（型別）
- 重新匯出 `getRelationsBySubject`

---

## `domain.social/_value-objects.ts`
**描述**: 社交 domain 的 Branded Types。
**函數清單**:
- `SocialRelationTypeSchema` / `type SocialRelationType` — 關係類型 enum: `"star"|"watch"|"follow"`

---

## `domain.social/_entity.ts`
**描述**: `SocialRelation` 值物件 / 關係記錄。
**函數清單**:
- `interface SocialRelation` — 社交關係記錄（id, subjectId, objectId, objectType, relationType, createdAt）
- `buildSocialRelation(params, now): SocialRelation` — 建立社交關係記錄

---

## `domain.social/_events.ts`
**描述**: Social Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface WorkspaceStarred` — 工作空間被加星事件（subjectId, workspaceId）
- `interface UserFollowed` — 使用者被追蹤事件（followerId, followedId）
- `type SocialDomainEventUnion` — 上述事件的 union type

---

## `domain.social/_ports.ts`
**描述**: Social domain 的 Port 介面定義。
**函數清單**:
- `interface ISocialGraphRepository` — 社交圖持久化（findBySubject, findByObject, save, delete, exists）

---

## `domain.social/_service.ts`
**描述**: Social Domain Service 規格說明。
**函數清單**:
- `SocialFeedService`（描述）— 根據關注關係聚合 Feed 內容
- `PopularityRankingService`（描述）— 基於 star/watch 數計算熱門度排名

---

## `infra.firestore/_repository.ts`
**描述**: `ISocialGraphRepository` 的 Firestore 實作骨架。使用雙向索引（subjectId + objectId）以支援高效雙向查詢。
**函數清單**: *(待實作，目前為佔位註解)*

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ SocialRelation 的雙向轉換。
**函數清單**: *(待實作，目前為佔位註解)*
