# infrastructure — File Index

**層次**: 基礎設施層 / Infrastructure Layer
**職責**: 封裝所有外部 I/O：Firebase Web SDK（Client 端）、Firebase Admin SDK（Server 端）。
**不包含**: 業務邏輯（由 Domain Modules 負責）、UI 元件（由 design-system 負責）。
**安全提示**: `admin/`（Admin SDK）只能在 Server Actions 或 Route Handlers 中使用，**絕不**匯入到 Client Components 或瀏覽器 bundle。

---

## `src/infrastructure/firebase/index.ts`
**描述**: Firebase 基礎設施根 barrel，重新匯出 `app` 初始化與完整 `client` 子層。Server 端請使用 `admin/` 子路徑。
**函數清單**:
- `export { getFirebaseApp, resolvedFirebaseConfig }` — Firebase App 初始化（來自 `./app`）
- `export * from './client'` — 完整 Web SDK Client 子層

---

## `src/infrastructure/firebase/app.ts`
**描述**: Firebase App 初始化 — 管理 Web SDK App 單例，解析環境變數覆蓋（NEXT_PUBLIC_FIREBASE_*）並提供 `resolvedFirebaseConfig` 供其他 adapter 使用。
**函數清單**:
- `function getFirebaseApp(): FirebaseApp` — 取得（或初始化）Firebase App 單例
- `resolvedFirebaseConfig: FirebaseOptions` — 已解析的 Firebase 設定物件（環境變數優先於硬編碼開發設定）

---

## `src/infrastructure/firebase/client/index.ts`
**描述**: Firebase Web SDK Client 子層 barrel。重新匯出所有 Client 端 adapter 的公開 API，限用於 Client Components 和瀏覽器環境。
**函數清單**:
- `export { getFirebaseApp, resolvedFirebaseConfig }` — App 初始化
- `export { getFirebaseAuth, GoogleAuthProvider, GithubAuthProvider, EmailAuthProvider }` — Auth adapter
- `export { getFirestoreDb, collection, doc, getDoc, ... }` — Firestore adapter
- `export { getFirebaseDatabase, dbRef, get, set, ... }` — Realtime Database adapter
- `export { getFirebaseStorage, ref as storageRef, ... }` — Storage adapter
- `export { getFirebaseAnalytics, logAnalyticsEvent, ... }` — Analytics adapter（可選）
- `export { initAppCheck }` — App Check 初始化
- `export { getFirebaseMessaging, requestFcmToken, ... }` — FCM adapter
- `export { getFirebaseRemoteConfig, fetchConfig, ... }` — Remote Config adapter

---

## `src/infrastructure/firebase/client/auth.ts`
**描述**: Firebase Authentication adapter — 提供懶載入的 Auth 單例及 Auth Provider 類別。
**函數清單**:
- `function getFirebaseAuth(): Auth` — 取得 Firebase Auth 單例（懶載入）
- `GoogleAuthProvider` — re-export，供 OAuth Google 登入使用
- `GithubAuthProvider` — re-export，供 OAuth GitHub 登入使用
- `EmailAuthProvider` — re-export，供電子郵件/密碼重認證使用

---

## `src/infrastructure/firebase/client/firestore.ts`
**描述**: Firestore adapter — 提供懶載入的 Firestore 單例與常用操作函數的 re-export，供 repository 實作使用。
**函數清單**:
- `function getFirestoreDb(): Firestore` — 取得 Firestore 單例（懶載入）
- re-export：`collection`, `doc`, `getDoc`, `getDocs`, `setDoc`, `addDoc`, `updateDoc`, `deleteDoc`, `query`, `where`, `orderBy`, `limit`, `serverTimestamp`, `Timestamp`, `DocumentData`

---

## `src/infrastructure/firebase/client/database.ts`
**描述**: Firebase Realtime Database adapter — 提供懶載入的 RTDB 單例與常用操作函數的 re-export，支援即時監聽。
**函數清單**:
- `function getFirebaseDatabase(): Database` — 取得 RTDB 單例（懶載入）
- re-export：`dbRef`, `get`, `set`, `update`, `remove`, `push`, `onValue`, `off`, `serverTimestamp`, `DataSnapshot`, `DatabaseReference`, `Unsubscribe`

---

## `src/infrastructure/firebase/client/storage.ts`
**描述**: Firebase Storage adapter — 提供懶載入的 Storage 單例與上傳/下載 helper 函數。
**函數清單**:
- `function getFirebaseStorage(): FirebaseStorage` — 取得 Storage 單例（懶載入）
- re-export：`ref`, `uploadBytes`, `uploadBytesResumable`, `getDownloadURL`, `deleteObject`, `listAll`, `StorageReference`, `UploadTask`, `UploadMetadata`

---

## `src/infrastructure/firebase/client/analytics.ts`
**描述**: Google Analytics for Firebase adapter — 選擇性地（可選）初始化 Analytics 單例，在不支援的環境中優雅 no-op。
**函數清單**:
- `async function getFirebaseAnalytics(): Promise<Analytics | null>` — 取得 Analytics 單例（懶載入，SSR 或缺少 measurementId 時回傳 null）
- `function logAnalyticsEvent(name: string, params?: Record<string, unknown>): Promise<void>` — 記錄自訂事件（Analytics 不可用時 no-op）
- `function setAnalyticsUserId(userId: string | null): Promise<void>` — 設定使用者 ID（Analytics 不可用時 no-op）

---

## `src/infrastructure/firebase/client/app-check.ts`
**描述**: Firebase App Check adapter — 使用 reCAPTCHA Enterprise provider 保護 Firebase 後端資源，防止濫用。App Check 必須在其他 Firebase 服務前初始化。
**函數清單**:
- `function initAppCheck(): AppCheck | null` — 初始化 App Check（已初始化時回傳現有實例，開發環境下設定 debug token 支援）

---

## `src/infrastructure/firebase/client/messaging.ts`
**描述**: Firebase Cloud Messaging (FCM) adapter — 提供推播通知授權請求與 registration token 取得，僅限瀏覽器環境使用。
**函數清單**:
- `function getFirebaseMessaging(): Messaging` — 取得 FCM 單例（非瀏覽器環境拋出 Error）
- `async function requestFcmToken(swPath?: string): Promise<string | null>` — 請求通知授權並取得 FCM token（授權被拒或錯誤時回傳 null）
- `function onForegroundMessage(handler): Unsubscribe` — 訂閱前景訊息（app 在前台時收到通知時觸發）

---

## `src/infrastructure/firebase/client/remoteConfig.ts`
**描述**: Firebase Remote Config adapter — 提供動態設定值的取得，支援功能開關、數值閾值、A/B 測試參數，帶 12 小時預設 fetch 間隔。
**函數清單**:
- `function getFirebaseRemoteConfig(): RemoteConfig` — 取得 Remote Config 單例（懶載入）
- `async function fetchConfig(minimumFetchIntervalMillis?: number): Promise<boolean>` — 拉取並啟用最新設定，回傳是否已活化新值
- `function getConfigString(key: string): string` — 取得字串設定值
- `function getConfigBoolean(key: string): boolean` — 取得布林設定值
- `function getConfigNumber(key: string): number` — 取得數字設定值

---

## `src/infrastructure/firebase/admin/index.ts`
**描述**: Firebase Admin SDK 伺服器端入口 — 管理 firebase-admin App 單例，支援三種認證方式（Service Account JSON、GOOGLE_APPLICATION_CREDENTIALS、ADC）。
**只可用於**: Server Actions、Route Handlers — **禁止**匯入 Client Components。
**函數清單**:
- `function getAdminApp(): App` — 取得（或初始化）firebase-admin App 單例

---

## `src/infrastructure/firebase/admin/auth/index.ts`
**描述**: 伺服器端 Firebase Auth helpers — 使用 firebase-admin Auth 進行特權操作（自訂 token 建立、session 驗證、使用者管理）。
**函數清單**:
- `function getAdminAuth(): Auth` — 取得 firebase-admin Auth 單例
- `async function verifyIdToken(idToken: string)` — 驗證 Firebase ID token，回傳解碼後的 claims（失效或過期時拋出）
- `async function setCustomClaims(uid: string, claims: Record<string, unknown>): Promise<void>` — 設定使用者的 JWT custom claims
- `async function revokeRefreshTokens(uid: string): Promise<void>` — 撤銷使用者的所有 refresh token

---

## `src/infrastructure/firebase/admin/db/batchWrite.ts`
**描述**: 伺服器端 Firestore 批次寫入器 — 緩衝寫入操作並原子性沖刷（支援超過 500 操作限制的自動分批）。減少 Firestore 寫入成本。
**函數清單**:
- `type WriteOperation` — 批次操作 union type（set、update、delete）
- `class BatchWriter` — 批次寫入器主類別
  - `add(op: WriteOperation): void` — 加入寫入操作至緩衝區
  - `flush(): Promise<void>` — 立即沖刷所有緩衝操作至 Firestore（自動分批）
  - `scheduleFlush(delayMs?: number): void` — 延遲沖刷（debounce 模式）
  - `size(): number` — 目前緩衝區操作數量

---

## `src/infrastructure/firebase/admin/db/cacheLayer.ts`
**描述**: 伺服器端快取層 — 輕量級記憶體快取（in-process Map），減少 Firestore 讀取操作與成本。可升級為 Redis 多實例快取。
**函數清單**:
- `interface CacheStore` — 快取儲存抽象介面（get, set, delete, clear）
- `class MemoryCacheStore implements CacheStore` — 記憶體快取實作（帶 TTL 支援）
- `async function cacheAside<T>(store, key, fetcher, ttlMs?): Promise<T>` — Cache-aside 模式：先讀快取，miss 時呼叫 fetcher 並存入快取

---

## `src/infrastructure/firebase/admin/storage/index.ts`
**描述**: 伺服器端 Firebase Storage helpers — 使用 firebase-admin Storage 進行特權檔案操作（生成簽名 URL、處理上傳、原子移動/複製）。
**函數清單**:
- `function getAdminBucket()` — 取得預設 Storage bucket
- `async function generateSignedDownloadUrl(filePath: string, expirationMs?: number): Promise<string>` — 生成指定檔案的簽名下載 URL

---

## `src/infrastructure/firebase/admin/utils/index.ts`
**描述**: 共用伺服器端純函數工具 — 無 Firebase 依賴，可由其他 admin/ 模組匯入。
**函數清單**:
- `function toDate(value: unknown): Date | null` — 將 Firestore Timestamp/Date/number/string 轉為 Date（安全型別轉換）
- `function toIsoString(value: unknown): string | null` — 將 Timestamp/Date 轉為 ISO-8601 字串
- `function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T>` — 移除物件中 undefined 值（Firestore 不接受 undefined）
- `function sleep(ms: number): Promise<void>` — 等待指定毫秒數（用於測試或重試邏輯）
