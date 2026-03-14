# account.module — File Index

**Bounded Context**: 帳號資料 / Account Data
**職責**: 帳號 profile、handle（URL slug）、team 組織、membership 成員管理、MemberRole 角色。
**不包含**: 驗證流程（由 identity.module 負責）、政策執行（由 audit.module 負責）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type AccountDTO` — 帳號公開 DTO
- `export type PublicProfileDTO` — 公開個人資料 DTO
- `export createPersonalAccount` — 建立個人帳號
- `export createOrganizationAccount` — 建立組織帳號
- `export updateAccountProfile` — 更新帳號 profile
- `export getAccountById` — 依 ID 取得帳號
- `export getPublicProfile` — 取得公開個人資料
- `export type IAccountRepository` — 帳號 Repository Port 介面
- `export type IAccountHandleAvailabilityPort` — Handle 唯一性檢查 Port 介面
- `export type IMembershipRepository` — Membership Repository Port 介面

---

## `core/_use-cases.ts`
**描述**: 帳號管理用例，包含個人與組織帳號的建立、profile 更新及查詢。
**函數清單**:
- `interface AccountDTO` — 帳號公開資料投影
- `interface PublicProfileDTO` — 供訪客查看的最小公開 profile
- `createPersonalAccount(repo, handlePort, uid, handle, displayName): Promise<Result<AccountDTO>>` — 建立個人帳號（驗證 handle 唯一性）
- `createOrganizationAccount(repo, handlePort, uid, handle, displayName): Promise<Result<AccountDTO>>` — 建立組織帳號
- `updateAccountProfile(repo, accountId, patch): Promise<Result<AccountDTO>>` — 更新 displayName/avatarUrl（patch update）
- `getAccountById(repo, id): Promise<Result<AccountDTO | null>>` — 依 ID 查詢帳號
- `getPublicProfile(repo, handle): Promise<Result<PublicProfileDTO | null>>` — 依 handle 查詢公開 profile

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例供 Server Actions 使用。
**函數清單**:
- 重新匯出 `AccountDTO`、`PublicProfileDTO`（型別）
- 重新匯出 `createPersonalAccount`、`createOrganizationAccount`、`updateAccountProfile`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `AccountDTO`、`PublicProfileDTO`（型別）
- 重新匯出 `getAccountById`、`getPublicProfile`

---

## `domain.account/_value-objects.ts`
**描述**: 帳號 domain 使用的所有 Branded Types，以 Zod 驗證。
**函數清單**:
- `AccountIdSchema` / `type AccountId` — 帳號唯一識別碼
- `AccountTypeSchema` / `type AccountType` — enum: `"personal"|"organization"`
- `AccountHandleSchema` / `type AccountHandle` — URL slug（小寫英數字、連字號、底線，3–39 字）
- `DisplayNameSchema` / `type DisplayName` — 暱稱（1–100 字）
- `AvatarUrlSchema` / `type AvatarUrl` — 頭像 URL（需為有效 URL）
- `MemberRoleSchema` / `type MemberRole` — enum: `"owner"|"admin"|"member"|"viewer"`
- `MembershipStatusSchema` / `type MembershipStatus` — enum: `"pending"|"active"|"revoked"`
- `TeamIdSchema` / `type TeamId` — 團隊識別碼
- `TeamNameSchema` / `type TeamName` — 團隊名稱（1–80 字）

---

## `domain.account/_entity.ts`
**描述**: `AccountEntity` Aggregate Root，吸收了 Team 與 Membership 兩個子聚合。
**函數清單**:
- `interface AccountProfile` — profile 資料結構（displayName, avatarUrl, bio）
- `interface MembershipRecord` — 成員資格記錄（accountId, teamId, role, status, joinedAt）
- `interface TeamRecord` — 團隊記錄（id, accountId, name, createdAt）
- `interface AccountEntity` — Aggregate Root（id, type, handle, profile, memberships, teams, createdAt）
- `buildPersonalAccount(id, handle, displayName, now): AccountEntity` — 建立個人帳號 entity
- `buildOrganizationAccount(id, handle, displayName, now): AccountEntity` — 建立組織帳號 entity

---

## `domain.account/_events.ts`
**描述**: Account Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface PersonalAccountCreated` — 個人帳號建立事件
- `interface OrganizationAccountCreated` — 組織帳號建立事件
- `interface AccountProfileUpdated` — Profile 更新事件
- `interface AccountHandleChanged` — Handle（URL slug）變更事件
- `interface MemberJoined` — 成員加入組織事件
- `interface MemberRoleChanged` — 成員角色變更事件
- `interface MemberRemoved` — 成員移除事件
- `interface AccountBadgeUnlocked` — 帳號解鎖徽章事件（achievement.module 整合用）
- `type AccountDomainEventUnion` — 上述事件的 union type

---

## `domain.account/_ports.ts`
**描述**: Account domain 的 Port 介面定義。
**函數清單**:
- `interface IAccountRepository` — 帳號持久化（findById, findByHandle, save）
- `interface IAccountHandleAvailabilityPort` — Handle 唯一性檢查（isAvailable）
- `interface IAccountBadgeWritePort` — 帳號徽章寫入 Port（writeAchievement）
- `interface IMembershipRepository` — 成員資格持久化（findByAccountId, findByTeamId, save, delete）

---

## `domain.account/_service.ts`
**描述**: Account Domain Service 規格說明（跨 aggregate 邏輯描述）。
**函數清單**:
- `HandleTransferService`（描述）— 組織帳號 handle 所有權轉移邏輯
- `MembershipBulkInviteService`（描述）— 批量邀請成員加入組織

---

## `infra.firestore/_repository.ts`
**描述**: `IAccountRepository` 及 `IMembershipRepository` 的 Firestore 實作骨架。Handle 唯一性需使用 Firestore Transaction（原子性 check-and-write）。
**函數清單**: *(待實作，目前為佔位註解)*

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ AccountEntity 的雙向轉換。
**函數清單**: *(待實作，目前為佔位註解)*
