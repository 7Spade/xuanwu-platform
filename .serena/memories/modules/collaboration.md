# collaboration.module — File Index

**Bounded Context**: 協作 / Collaboration
**職責**: Artifact 層級的評論管理（可附加於工作項目、檔案、工作空間等資源）。
**不包含**: 即時通訊（future infra）、社交關係（social.module）、通知觸發（notification.module 整合）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type CommentDTO` — 評論公開 DTO
- `export postComment` — 在 artifact 上發表評論
- `export getCommentsByArtifact` — 查詢指定 artifact 的評論清單
- `export type ICommentRepository` — 評論 Repository Port 介面

---

## `core/_use-cases.ts`
**描述**: 評論發表與查詢用例，支援巢狀回覆（parentCommentId）。
**函數清單**:
- `interface CommentDTO` — 評論公開 DTO（id, artifactId, artifactType, authorId, body, parentCommentId, reactions, createdAt）
- `postComment(repo, params): Promise<Result<CommentDTO>>` — 發表評論或回覆
- `getCommentsByArtifact(repo, artifactId, artifactType): Promise<Result<CommentDTO[]>>` — 查詢評論清單（按時間排序）

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `CommentDTO`（型別）
- 重新匯出 `postComment`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `CommentDTO`（型別）
- 重新匯出 `getCommentsByArtifact`

---

## `domain.collaboration/_value-objects.ts`
**描述**: 協作 domain 的 Branded Types。
**函數清單**:
- `CommentIdSchema` / `type CommentId` — 評論唯一識別碼
- `ReactionTypeSchema` / `type ReactionType` — 反應類型 enum: `"like"|"heart"|"celebrate"|"eyes"|"rocket"`

---

## `domain.collaboration/_entity.ts`
**描述**: `Comment` 評論 entity，支援巢狀回覆結構。
**函數清單**:
- `interface Comment` — 評論記錄（id, artifactId, artifactType, authorId, body, parentCommentId, reactions, createdAt）
- `buildComment(params, now): Comment` — 建立評論 entity

---

## `domain.collaboration/_events.ts`
**描述**: Collaboration Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface CommentPosted` — 評論發表事件（artifactId, artifactType, authorId, commentId）
- `type CollaborationDomainEventUnion` — 上述事件的 union type（= `CommentPosted`）

---

## `domain.collaboration/_ports.ts`
**描述**: Collaboration domain 的 Port 介面定義。
**函數清單**:
- `interface ICommentRepository` — 評論持久化（findById, findByArtifact, save, delete）

---

## `domain.collaboration/_service.ts`
**描述**: Collaboration Domain Service 規格說明。
**函數清單**:
- `CommentModerationService`（描述）— 評論內容審核（含黑名單過濾）
- `ReactionAggregationService`（描述）— 聚合計算各類型反應數量

---

## `infra.firestore/_repository.ts`
**描述**: `ICommentRepository` 的 Firestore 實作骨架。使用 artifact 子集合結構以支援高效查詢。
**函數清單**: *(待實作，目前為佔位註解)*

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ Comment 的雙向轉換。
**函數清單**: *(待實作，目前為佔位註解)*
