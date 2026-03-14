# namespace.module — File Index

**Bounded Context**: 命名空間 / Namespace
**職責**: URL slug 命名空間管理、工作空間路徑解析（`/{namespace}/{workspace-slug}`）。
**不包含**: 工作空間業務邏輯（由 workspace.module 負責）、帳號資料（由 account.module 負責）。
**特別說明**: namespace 同時服務於個人帳號與組織帳號，因此獨立於 account.module。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type NamespaceDTO` — 命名空間公開 DTO
- `export type WorkspacePathDTO` — 路徑解析結果 DTO
- `export registerNamespace` — 為帳號註冊命名空間 slug
- `export getNamespaceBySlug` — 依 slug 取得命名空間
- `export resolveWorkspacePath` — 解析完整 URL 路徑為 (namespaceId, workspaceId)
- `export bindWorkspaceToNamespace` — 綁定工作空間至命名空間
- `export type INamespaceRepository` — 命名空間 Repository Port 介面
- `export type INamespaceSlugAvailabilityPort` — Slug 唯一性檢查 Port 介面

---

## `core/_use-cases.ts`
**描述**: 命名空間管理與路徑解析用例。
**函數清單**:
- `interface NamespaceDTO` — 命名空間公開 DTO（id, slug, ownerAccountId, ownerType, workspaceBindings）
- `interface WorkspacePathDTO` — 路徑解析結果（namespaceId, workspaceId, slug, workspaceSlug）
- `registerNamespace(repo, slugPort, ownerAccountId, ownerType, slug): Promise<Result<NamespaceDTO>>` — 建立並驗證 slug 唯一性
- `getNamespaceBySlug(repo, slug): Promise<Result<NamespaceDTO | null>>` — 依 slug 查詢
- `resolveWorkspacePath(repo, namespaceSl, workspaceSlug): Promise<Result<WorkspacePathDTO | null>>` — 路徑解析
- `bindWorkspaceToNamespace(repo, namespaceId, workspaceId, slug): Promise<Result<void>>` — 綁定工作空間

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `NamespaceDTO`、`WorkspacePathDTO`（型別）
- 重新匯出 `registerNamespace`、`bindWorkspaceToNamespace`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `NamespaceDTO`、`WorkspacePathDTO`（型別）
- 重新匯出 `getNamespaceBySlug`、`resolveWorkspacePath`

---

## `domain.namespace/_value-objects.ts`
**描述**: 命名空間 domain 的 Branded Types。
**函數清單**:
- `NamespaceIdSchema` / `type NamespaceId` — 命名空間識別碼
- `NamespaceSlugSchema` / `type NamespaceSlug` — URL slug（小寫英數字、連字號，3–39 字）
- `NamespaceOwnerTypeSchema` / `type NamespaceOwnerType` — enum: `"personal"|"organization"`
- `WorkspacePathSchema` / `type WorkspacePath` — 完整路徑格式（`/{ns}/{ws}`）

---

## `domain.namespace/_entity.ts`
**描述**: `NamespaceEntity` Aggregate Root，持有 WorkspaceBinding 子聚合清單。
**函數清單**:
- `interface WorkspaceBinding` — 工作空間綁定記錄（workspaceId, slug, boundAt）
- `interface NamespaceEntity` — Aggregate Root 結構（id, slug, ownerAccountId, ownerType, workspaceBindings, createdAt）
- `buildWorkspacePath(namespaceSl, workspaceSlug): WorkspacePath` — 組合完整路徑字串
- `findWorkspaceBinding(entity, workspaceSlug): WorkspaceBinding | undefined` — 在 entity 中查找 binding
- `buildNamespace(params, now): NamespaceEntity` — Aggregate factory

---

## `domain.namespace/_events.ts`
**描述**: Namespace Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface NamespaceRegistered` — 命名空間建立事件
- `interface NamespaceSlugChanged` — Slug 變更事件
- `interface WorkspaceBoundToNamespace` — 工作空間綁定事件
- `type NamespaceDomainEventUnion` — 上述事件的 union type

---

## `domain.namespace/_ports.ts`
**描述**: Namespace domain 的 Port 介面定義。
**函數清單**:
- `interface INamespaceRepository` — 命名空間持久化（findById, findBySlug, findByOwner, save）
- `interface INamespaceSlugAvailabilityPort` — Slug 唯一性即時檢查（isAvailable）

---

## `domain.namespace/_service.ts`
**描述**: Namespace Domain Service — 純函數，無 I/O。NamespacePathResolutionService（路徑解析）+ NamespaceConflictDetectionService（slug 衝突偵測）。
**函數清單**:
- `RESERVED_NAMESPACE_SLUGS: ReadonlySet<string>` — 平台保留 slug 集合（api, admin, settings…）
- `parseWorkspacePath(path): { namespaceSlug, workspaceSlug } | null` — 拆解 "ns-slug/ws-slug" 字串
- `resolveWorkspaceIdFromPath(namespace, workspaceSlug): string | null` — 從已載入的 NamespaceEntity 解析 workspaceId
- `isSlugReserved(slug, reservedSlugs?): boolean` — 判斷 slug 是否為保留字
- `hasWorkspaceSlug(namespace, workspaceSlug): boolean` — 判斷 slug 是否已存在於命名空間
- `buildWorkspaceBinding(workspaceId, workspaceSlug, now): WorkspaceBinding` — 建立綁定值物件
- `addWorkspaceBinding(namespace, binding, now): NamespaceEntity` — 新增綁定（重複 slug 拋錯）
- `removeWorkspaceBinding(namespace, workspaceId, now): NamespaceEntity` — 移除指定 workspaceId 的綁定

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ NamespaceEntity 雙向轉換；含子文件 WorkspaceBindingDoc。
**函數清單**:
- `interface WorkspaceBindingDoc` — Firestore 工作空間綁定子文件結構
- `interface NamespaceDoc` — Firestore 命名空間文件結構
- `namespaceDocToEntity(d): NamespaceEntity` — Firestore → Domain
- `namespaceEntityToDoc(e): NamespaceDoc` — Domain → Firestore

---

## `infra.firestore/_repository.ts`
**描述**: `INamespaceRepository` 的 Firestore 實作；save() 使用 runTransaction 保證 slug 唯一性。
**函數清單**:
- `class FirestoreNamespaceRepository implements INamespaceRepository`
  - `findById(id): Promise<NamespaceEntity | null>`
  - `findBySlug(slug): Promise<NamespaceEntity | null>` — limit(1) query
  - `findByOwnerId(ownerId): Promise<NamespaceEntity | null>` — limit(1) query
  - `save(namespace): Promise<void>` — 首次寫入以 transaction + `namespace-slugs/{slug}` 保留文件確保 slug 唯一性（無 TOCTOU race condition）
  - `deleteById(id): Promise<void>`

## `_components/organizations-view.tsx` *(Wave 20)*
**描述**: 組織列表頁面容器（`/(account)/organizations`）— org grid + 建立 CTA shell，Wave 23 接 Firestore 資料。
**Export**: `OrganizationsView` — 用於 `app/(main)/(account)/organizations/page.tsx`
