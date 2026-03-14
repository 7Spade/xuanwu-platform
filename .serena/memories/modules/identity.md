# identity.module — File Index

**Bounded Context**: 身份識別 / Authentication
**職責**: 驗證憑證、管理 session、處理多重 identity provider 及 JWT custom claims。
**不包含**: 帳號資料（由 account.module 負責）、政策執行（由 audit.module 負責）。

---

## `index.ts`
**描述**: 公開 API barrel — 僅匯出 DTOs、用例函數及 Port 介面，不暴露 Entity/VO。
**函數清單**:
- `export type IdentityDTO` — 身份識別公開 DTO
- `export type SessionStatusDTO` — Session 狀態 DTO
- `export signIn` — 電子郵件/密碼登入
- `export signOut` — 登出當前使用者
- `export signInAnonymously` — 匿名登入
- `export sendPasswordResetEmail` — 發送密碼重置信件
- `export registerIdentity` — 建立新 Auth 帳號
- `export getCurrentIdentity` — 取得當前認證使用者 DTO
- `export getIdentityById` — 依 ID 讀取持久化身份記錄
- `export type IAuthProviderPort` — 外部 Auth Provider Port 介面
- `export type IIdentityRepository` — 身份記錄 Repository Port 介面
- `export type IAuthClaimsPort` — JWT Claims 寫入 Port 介面
- `export type ISessionPort` — Server-side Session Port 介面
- `export type AuthUser` — Auth Provider 回傳的最小使用者快照

---

## `core/_use-cases.ts`
**描述**: 與框架無關的用例函數。所有函數接受 Port 介面（依賴注入），回傳 `Result<T>`。
**函數清單**:
- `interface IdentityDTO` — 安全的身份識別公開投影
- `interface SessionStatusDTO` — Session 狀態 DTO
- `authUserToDTO(user, provider): IdentityDTO` — 將 AuthUser 轉為 DTO（私有 helper）
- `signIn(auth, email, password): Promise<Result<string>>` — 登入，回傳 uid
- `signOut(auth): Promise<Result<void>>` — 登出
- `signInAnonymously(auth): Promise<Result<string>>` — 匿名登入，回傳 uid
- `sendPasswordResetEmail(auth, email): Promise<Result<void>>` — 發送重置信
- `registerIdentity(auth, email, password, displayName): Promise<Result<string>>` — 建立帳號並設定暱稱
- `getCurrentIdentity(auth): IdentityDTO | null` — 取得當前使用者（同步）
- `getIdentityById(repo, id): Promise<Result<IdentityDTO | null>>` — 依 ID 查詢

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，作為 Next.js Server Actions 入口，重新匯出用例函數。
**函數清單**:
- 重新匯出 `IdentityDTO`、`SessionStatusDTO`（型別）
- 重新匯出 `signIn`、`signOut`、`signInAnonymously`、`sendPasswordResetEmail`、`registerIdentity`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出，供 React Server Components 直接呼叫。
**函數清單**:
- 重新匯出 `IdentityDTO`、`SessionStatusDTO`（型別）
- 重新匯出 `getCurrentIdentity`、`getIdentityById`

---

## `domain.identity/_value-objects.ts`
**描述**: Zod 驗證的 Branded Types，定義 identity.module 使用的所有值物件。
**函數清單**:
- `IdentityIdSchema` / `type IdentityId` — 驗證不為空字串的身份識別 ID
- `makeIdentityId(raw): IdentityId` — 建立 IdentityId 的 factory function
- `IdentityProviderSchema` / `type IdentityProvider` — enum: `"email"|"google"|"github"|"anonymous"`
- `ProviderUidSchema` / `type ProviderUid` — 外部 Provider UID
- `interface AuthClaims` — JWT 自定義 claims 結構（accountId, accountType, role）
- `interface AuthUser` — Provider 操作回傳的最小使用者快照
- `SessionTokenSchema` / `type SessionToken` — 短效 JWT access token

---

## `domain.identity/_entity.ts`
**描述**: `IdentityRecord` Aggregate Root，代表單一主體的認證憑證記錄。
**不變式**:
- Identity 唯一索引為 `(provider, providerUid)` 組合
- Identity 僅屬於一個 Account，不可跨帳號轉移
- 匿名 Identity 可升級為永久 Provider Identity
**函數清單**:
- `interface IdentityRecord` — Aggregate Root 結構（id, provider, providerUid, accountId, email, displayName, isAnonymous, claims, createdAt, lastSignedInAt）
- `buildIdentityRecord(user, provider, now): IdentityRecord` — 從 AuthUser 建立 IdentityRecord

---

## `domain.identity/_events.ts`
**描述**: Identity Bounded Context 的 Domain Event 型別定義（union type）。
**函數清單**:
- `interface IdentityRegistered` — 使用者完成首次註冊並完成帳號佈建後觸發
- `interface IdentitySignedIn` — 每次成功登入後觸發
- `interface IdentitySignedOut` — 使用者明確登出後觸發
- `interface AuthClaimsUpdated` — JWT custom claims 更新後觸發（應強制刷新 token）
- `interface SessionRevoked` — Session 被主動撤銷（登出/管理員/安全封鎖）
- `type IdentityDomainEventUnion` — 上述事件的 union type

---

## `domain.identity/_ports.ts`
**描述**: Port 介面定義，由 Infrastructure 層實作，Application 層依賴注入。
**函數清單**:
- `interface IAuthProviderPort` — 外部 Auth Provider 抽象（signIn, signOut, createUser, sendReset, updateProfile, getCurrentUser, onAuthStateChanged）
- `interface IIdentityRepository` — 身份記錄持久化介面（findById, save, deleteById）
- `interface IAuthClaimsPort` — JWT Claims 管理（emitRefreshSignal）
- `interface ISessionPort` — Server-side Session（createSessionCookie, verifySessionCookie, revokeRefreshTokens）

---

## `domain.identity/_service.ts`
**描述**: Identity Domain Service — 純商業規則函數（無 I/O、無框架依賴）。衍生自 7Spade/xuanwu `_claims-handler.ts`，適配 4 層 DDD 架構。
**函數清單**:
- `isActiveSession(identity): boolean` — 判斷 identity 是否為活躍的非匿名 session
- `canUpgradeAnonymous(identity): boolean` — 判斷匿名 identity 是否可升級為永久 provider
- `claimedAccountId(identity): IdentityId | null` — 從 custom claims 中取出 accountId
- `isTokenStale(identity, expectedVersion): boolean` — 判斷 JWT token 是否需要強制刷新（支援 TOKEN_REFRESH_SIGNAL 握手）
- `isSessionExpired(identity, maxDurationMs, nowMs?): boolean` — 判斷 session 是否超過最大存活時間
- `findExpiredSessions(identities, maxDurationMs, nowMs?): IdentityRecord[]` — 批次過濾過期 session（SessionCleanupService 使用）

---

## `infra.firestore/_repository.ts`
**描述**: `IIdentityRepository`、`IAuthProviderPort`、`IAuthClaimsPort` 的 Firestore + Firebase Auth 實作。衍生自 7Spade/xuanwu `identity.slice/_claims-handler.ts`。
**函數清單**:
- `class FirestoreIdentityRepository` — 實作 IIdentityRepository
  - `findById(id): Promise<IdentityRecord | null>`
  - `save(identity): Promise<void>`
  - `deleteById(id): Promise<void>`
- `class FirebaseAuthAdapter` — 實作 IAuthProviderPort（Firebase Auth client SDK）
  - `signInWithEmailAndPassword(email, password): Promise<AuthUser>`
  - `createUserWithEmailAndPassword(email, password): Promise<AuthUser>`
  - `signInAnonymously(): Promise<AuthUser>`
  - `sendPasswordResetEmail(email): Promise<void>`
  - `updateProfile(user, profile): Promise<void>`
  - `signOut(): Promise<void>`
  - `getCurrentUser(): AuthUser | null`
  - `onAuthStateChanged(callback): () => void`
- `class FirestoreAuthClaimsAdapter` — 實作 IAuthClaimsPort（TOKEN_REFRESH_SIGNAL 寫入）
  - `emitRefreshSignal(accountId): Promise<void>` — 寫入 tokenRefreshSignals/{accountId}

---

## `_client-actions.ts` *(Wave 17 — 新增)*
**描述**: 客戶端 Firebase Auth 操作封裝。無 `'use server'`，直接使用 Firebase Web SDK（因為 Auth 必須在瀏覽器端執行）。
**函數清單**:
- `clientSignIn(email, password): Promise<Result<string>>` — Email + 密碼登入，回傳 UID
- `clientRegister(email, password, displayName): Promise<Result<string>>` — 建立帳號並設定顯示名稱
- `clientSignInAnonymously(): Promise<Result<string>>` — 匿名登入
- `clientSendPasswordResetEmail(email): Promise<Result<void>>` — 發送密碼重置郵件
- `clientSignOut(): Promise<Result<void>>` — 登出

---

## `_components/login-form.tsx` *(Wave 17 — 新增)*
**描述**: 登入表單 UI 元件（email + 密碼欄位、忘記密碼按鈕）。
**Props**: `email`, `setEmail`, `password`, `setPassword`, `handleLogin`, `isLoading`, `onForgotPassword`

## `_components/register-form.tsx` *(Wave 17 — 新增)*
**描述**: 註冊表單 UI 元件（暱稱 + email + 密碼欄位）。
**Props**: `name`, `setName`, `email`, `setEmail`, `password`, `setPassword`, `handleRegister`, `isLoading`

## `_components/reset-password-form.tsx` *(Wave 17 — 新增)*
**描述**: 密碼重置表單（email 輸入、發送/取消按鈕、內建錯誤顯示）。
**Props**: `defaultEmail?`, `onSuccess`, `onCancel`

## `_components/auth-tabs-root.tsx` *(Wave 17 — 新增)*
**描述**: 驗證卡片容器，含登入/註冊分頁 (Tabs) 和訪客登入按鈕。
**Props**: `isLoading`, `email`, `setEmail`, `password`, `setPassword`, `name`, `setName`, `handleAuth`, `handleAnonymous`, `openResetDialog`

## `_components/auth-view.tsx` *(Wave 17 — 新增)*
**描述**: 智能驗證容器。管理所有 auth 狀態，委派渲染給子元件。含重置密碼彈窗 (Dialog)。成功後 router.push("/")。
**Export**: `AuthView` — 直接在 `app/(auth)/login/page.tsx` 使用

## `_components/admin-view.tsx` *(Wave 21)*
**描述**: 管理員面板頁面 shell（`/admin`）— 系統管理功能入口框架（Wave 23+ 接資料）。
**Export**: `AdminView` — 用於 `app/(admin)/admin/page.tsx`

## `_components/api-keys-view.tsx` *(Wave 20)*
**描述**: API 金鑰管理頁面（`/[slug]/settings/api-keys`）— 金鑰列表 + 產生 CTA shell。
**Export**: `ApiKeysView` — 用於 `app/(main)/[slug]/settings/api-keys/page.tsx`

## `_components/invite-view.tsx` *(Wave 21)*
**描述**: 邀請連結接受頁面（`/invite/[token]`）— 邀請 token 顯示與接受 CTA shell。
**Export**: `InviteView({ token })` — 用於 `app/(invite)/invite/[token]/page.tsx`

## `_components/share-view.tsx` *(Wave 21)*
**描述**: 共享分享連結頁面（`/share/[shareId]`）— 分享資源預覽 shell。
**Export**: `ShareView({ shareId })` — 用於 `app/(shared)/share/[shareId]/page.tsx`

## `domain.identity/_api-key-entity.ts` *(Wave 28 — 新增)*
**描述**: `ApiKeyRecord` 聚合根 — 命名空間 API 金鑰（id, namespaceSlug, name, keyPreview, createdAt, expiresAt, lastUsedAt, isActive）。
**Export**: `ApiKeyRecord` interface

## `domain.identity/_api-key-service.ts` *(Wave 28 — 新增)*
**描述**: API 金鑰 domain service（純函數）。
**Functions**: `isApiKeyExpired`, `isApiKeyUsable`, `sortApiKeysByCreatedAt`, `countActiveApiKeys`

## `infra.firestore/_api-key-mapper.ts` *(Wave 28 — 新增)*
**描述**: Firestore 文件 ↔ ApiKeyRecord 轉換（`ApiKeyDoc` interface, `apiKeyDocToRecord`, `apiKeyRecordToDoc`）。

## `infra.firestore/_api-key-repository.ts` *(Wave 28 — 新增)*
**描述**: `FirestoreApiKeyRepository implements IApiKeyRepository`。Firestore 路徑: `namespaces/{slug}/api-keys/{id}`。
**Methods**: `findById`, `findByNamespaceSlug`, `save`, `revokeById`

## `_components/use-api-keys.ts` *(Wave 28 — 新增)*
**描述**: `useApiKeys(namespaceSlug)` hook — memoized FirestoreApiKeyRepository → getApiKeysBySlug use-case。Returns `{ apiKeys, loading, error }`。

## `_components/api-keys-view.tsx` *(Wave 28 — 升級)*
**描述**: API 金鑰管理頁面 — 已接 Firestore 真實資料（loading spinner → key 列表 → empty state）。每筆金鑰顯示名稱、keyPreview、狀態 badge（active/revoked/expired）、建立時間、上次使用時間。
