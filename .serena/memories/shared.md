# shared — File Index

**層次**: 共用工具 / Shared Layer
**職責**: 提供跨模組共用的工具函數、類型定義、錯誤類別、i18n 翻譯、常數和 Pipe 抽象。
**不包含**: 業務邏輯（由 Domain Modules 負責）、React 元件（由 design-system 負責）、Firebase SDK 呼叫（由 infrastructure 負責）。

---

## `src/shared/index.ts`
**描述**: 共用層統一具名匯出 barrel。所有跨模組共用工具、類型、常數、錯誤皆應從此單一入口匯入，使重構透明。
**注意**: Client-side React hooks（`useToggle`、`useDebounce` 等）在 `@/shared/directives` — 需帶 `"use client"` 指令，不在此 barrel。
**函數清單**:
- `export * from './constants'` — APP_NAME、APP_VERSION、DEFAULT_LOCALE 等常數
- `export * from './errors'` — AppError 及所有子類別、`toAppError`
- `export * from './interfaces'` — API 信封介面、Pagination 介面、Firestore 文件介面
- `export * from './i18n'` — `isSupportedLocale`、`resolveLocale`、`useTranslation`、`getMessages`
- `export * from './pipes'` — `Pipe`、`schemaPipe`、`transformPipe`、`composePipes`、`trimPipe`
- `export * from './types'` — Zod 基礎類型、`Result<T>`、`ok`、`fail`
- `export * from './utils'` — `formatDate`、`formatDateTime`、`capitalise`、`toKebabCase`、`omit`、`pick`、`unique`、`chunk`

---

## `src/shared/constants/index.ts`
**描述**: 應用程式層級常數 — 名稱、版本、locale、日期格式 token。
**函數清單**:
- `APP_NAME: string` — `"Xuanwu Platform"` 平台顯示名稱
- `APP_VERSION: string` — `"0.1.0"` 平台版本號
- `DEFAULT_LOCALE: string` — `"zh-TW"` 預設語系
- `SUPPORTED_LOCALES: readonly string[]` — `["zh-TW", "en"]` 支援語系清單
- `DATE_FORMAT: string` — `"YYYY-MM-DD"` 日期格式 token（供 dayjs/date-fns 使用）
- `DATETIME_FORMAT: string` — `"YYYY-MM-DD HH:mm:ss"` 日期時間格式 token

---

## `src/shared/errors/index.ts`
**描述**: 應用程式錯誤類別階層。`AppError` 為所有錯誤基底類別，加入機器可讀的 `code` 與 HTTP `statusCode`。
**函數清單**:
- `class AppError extends Error` — 基底應用錯誤類別（code, statusCode）
- `class NotFoundError extends AppError` — 資源找不到（404, "NOT_FOUND"）
- `class UnauthorizedError extends AppError` — 未認證（401, "UNAUTHORIZED"）
- `class ForbiddenError extends AppError` — 無存取權（403, "FORBIDDEN"）
- `class ValidationError extends AppError` — 輸入驗證失敗（422, "VALIDATION_ERROR"，附 `fields`）
- `class ConflictError extends AppError` — 資源已存在衝突（409, "CONFLICT"）
- `function toAppError(err: unknown): AppError` — 將任意拋出值轉為 AppError

---

## `src/shared/interfaces/index.ts`
**描述**: 前後端共用的 TypeScript 結構性介面（API 信封、分頁、Firestore 文件基底、VisDate metadata）。
**函數清單**:
- `interface ApiResponse<T>` — 通用 API 信封（ok, data?, error?, code?）
- `interface ApiError` — 標準化 API 錯誤（message, code, statusCode）
- `interface PaginationQuery` — 分頁查詢參數（page?, pageSize?, cursor?）
- `interface PaginatedResult<T>` — 分頁結果（items, total, page, pageSize, hasNextPage, nextCursor?）
- `interface FirestoreDocument` — Firestore 文件基底標記介面（id, createdAt, updatedAt）
- `interface VisDateMetadata` — vis-date/DnD 資料合約（詳見檔案）

---

## `src/shared/i18n/index.ts`
**描述**: 輕量級程式碼內嵌 i18n 解決方案。內含雙語（zh-TW/en）翻譯字典，提供翻譯函數 factory。
**函數清單**:
- `function isSupportedLocale(locale: string): locale is Locale` — 型別守衛，判斷是否為支援語系
- `function resolveLocale(locale?: string | null): Locale` — 解析語系，不支援時退回預設語系
- `function useTranslation(locale?: string | null): (key: string) => string` — 回傳綁定語系的翻譯函數 `t(key)`
- `function getMessages(locale?: string | null): Messages` — 取得指定語系的完整翻譯字典

---

## `src/shared/pipes/index.ts`
**描述**: 函數式管線（Pipe）抽象，用於輸入轉換與驗證。包含 Zod schema pipe、轉換 pipe 和組合工具。
**函數清單**:
- `type Pipe<I, O>` — 純轉換函數類型 `(input: I) => O`
- `function schemaPipe<T>(schema): Pipe<unknown, Result<T, ValidationError>>` — 建立 Zod 解析 pipe，回傳 `Result`
- `function transformPipe<I, O>(fn): Pipe<I, O>` — 包裝任意轉換函數為 Pipe
- `function composePipes<A, B, C>(first, second): Pipe<A, C>` — 左至右組合兩個 Pipe（A→B→C）
- `function trimPipe<T>(input: T): T` — 遞迴剝除物件所有字串值的頭尾空白

---

## `src/shared/types/index.ts`
**描述**: Zod 驗證的基礎值物件類型、Locale 類型、以及通用 `Result<T>` 成功/失敗 union 類型。
**函數清單**:
- `NonEmptyString: ZodSchema` — 非空字串 schema
- `UuidSchema: ZodSchema` — UUID v4 schema
- `IsoDateString: ZodSchema` — ISO-8601 日期字串 schema
- `PositiveInt: ZodSchema` — 正整數 schema
- `PaginationSchema: ZodSchema` — 分頁查詢 schema（page, pageSize）
- `PaginatedResponseSchema<T>(itemSchema): ZodSchema` — 泛型分頁回應 schema
- `type PaginatedResponse<T>` — 分頁回應類型
- `LocaleSchema: ZodEnum` — 語系 enum schema
- `type Locale` — `"zh-TW" | "en"` 語系 union 類型
- `type Success<T>` — `{ ok: true; value: T }` 成功類型
- `type Failure<E>` — `{ ok: false; error: E }` 失敗類型
- `type Result<T, E>` — `Success<T> | Failure<E>` 結果 union 類型
- `function ok<T>(value: T): Success<T>` — 建立成功結果
- `function fail<E>(error: E): Failure<E>` — 建立失敗結果

---

## `src/shared/utils/index.ts`
**描述**: 純函數工具集，涵蓋日期格式化、字串轉換、物件操作、陣列工具。無副作用。
**函數清單**:
- `function formatDate(date: Date, locale?: string): string` — 格式化日期（locale-aware，預設 zh-TW）
- `function formatDateTime(date: Date, locale?: string): string` — 格式化日期時間（locale-aware）
- `function capitalise(str: string): string` — 首字母大寫
- `function toKebabCase(str: string): string` — camelCase/PascalCase 轉 kebab-case
- `function omit<T, K>(obj: T, keys: K[]): Omit<T, K>` — 從物件移除指定 key
- `function pick<T, K>(obj: T, keys: K[]): Pick<T, K>` — 從物件挑選指定 key
- `function unique<T>(arr: T[]): T[]` — 移除陣列重複元素
- `function chunk<T>(arr: T[], size: number): T[][]` — 將陣列切割為指定大小的子陣列

---

## `src/shared/directives/index.ts`
**描述**: Client-side React hooks，標記 `"use client"` 指令。僅限 Client Components 匯入，不包含在 `@/shared` barrel。
**函數清單**:
- `function useToggle(initial?: boolean): [boolean, () => void, (value: boolean) => void]` — 布林切換 hook
- `function useDebounce<T>(value: T, delay: number): T` — 防抖值 hook
- `function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void]` — localStorage 持久化 hook（支援 updater 函數）
- `function usePrevious<T>(value: T): T | undefined` — 取得前一個值 hook
- `function useIsMounted(): boolean` — 判斷元件是否已 mount hook
- `const LOCALE_STORAGE_KEY = "xuanwu-locale"` — localStorage key 常數
- `function useLocale(): [Locale, (locale: Locale) => void]` — 語系持久化 hook；實作 `ILocalePort`；在 `useLocalStorage` 之上處理語系解析與 `html[lang]` 同步
- `function useAuthState(): { user: User | null; loading: boolean }` — 輕量 Firebase Auth 狀態監聽 hook；在 `AccountProvider` 之外使用；回傳 `{ user, loading }`

---

## `src/shared/ports/index.ts`
**描述**: 防腐層（ACL）跨模組 Port 介面集。供 Application 層以穩定合約取代直接依賴基礎設施。按介面類型（Cache、Queue、Vector、Workflow、Storage、Locale、Logger、Analytics、Auth）分組。
**匯入規則**: `import type { ICachePort } from "@/shared/ports"` 或透過 barrel `import type { ICachePort } from "@/shared"`。
**函數清單**:
- `interface ICachePort` — Cache 抽象（get/set/del/exists/incr/ttl）；具體實作：`src/infrastructure/upstash/redis.ts`
- `interface IQueuePort` — Queue 抽象（publish/publishJSON/publishDelayed）；具體實作：`src/infrastructure/upstash/qstash.ts`
- `interface IVectorIndexPort<TMetadata>` — 向量索引抽象（upsert/query/fetch/delete）；具體實作：`src/infrastructure/upstash/vector.ts`
- `interface IWorkflowPort` — Workflow 抽象（trigger/cancel/getState）；具體實作：`src/infrastructure/upstash/workflow.ts`
- `interface IStoragePort` — 瀏覽器同步鍵值儲存抽象（getItem/setItem/removeItem）；具體實作：`window.localStorage`（via `useLocalStorage`）
- `interface ILocalePort` — Locale 持久化與 `html[lang]` 同步抽象（locale/setLocale/supported）；具體實作：`useLocale` directive
- `interface ILoggerPort` — 結構化日誌抽象（debug/info/warn/error）；具體實作：ConsoleLoggerAdapter / Cloud Logging
- `interface IAnalyticsPort` — 事件追蹤抽象（track/identify/page）；具體實作：Firebase Analytics / Mixpanel
- `interface IAuthPort` — Auth 狀態與 ID token 抽象（getUser/getIdToken/signOut）；具體實作：`src/infrastructure/firebase/admin/auth`
