# app — File Index（Next.js App Router 路由）

**層次**: 表現層 / Presentation Layer
**職責**: Next.js App Router 路由定義 — 頁面（page.tsx）、佈局（layout.tsx）、預設視圖（default.tsx）。
**架構**: 以 Route Groups 劃分應用程式區域，使用 Parallel Routes（`@sidebar`）組成側邊欄。

---

## 路由群組概覽

| Route Group | URL 前綴 | 用途 |
|-------------|----------|------|
| `(admin)` | `/admin` | 平台管理員後台 |
| `(auth)` | `/login`, `/register`, `/forgot-password` | 未認證使用者的身份驗證頁面 |
| `(invite)` | `/invite/[token]` | 邀請連結接受頁面 |
| `(main)` | `/*`（認證後） | 主應用程式（帳號管理、工作區、設定） |
| `(marketing)` | `/`（行銷） | 行銷/落地頁 |
| `(shared)` | `/share/[shareId]` | 公開分享頁面（無需登入） |

---

## Root 層

### `src/app/layout.tsx`
**描述**: Next.js 根佈局 — 設定全域 HTML 結構（`<html lang="zh-TW">`）、全域樣式（globals.css）及預設 metadata。
**函數清單**:
- `export const metadata: Metadata` — 全域 SEO metadata（title: "Xuanwu Platform"）
- `export default function RootLayout({ children })` — 根佈局，包裹所有頁面

### `src/app/page.tsx`
**描述**: 首頁（`/`） — 顯示平台名稱、版本、歡迎訊息及啟動時間，使用 shared 工具函數。
**函數清單**:
- `export default function HomePage()` — 使用 `APP_NAME`、`APP_VERSION`、`useTranslation`、`formatDate` 渲染首頁

---

## `(admin)` 路由群組

### `src/app/(admin)/layout.tsx`
**描述**: Admin 路由群組佈局 — 包裹所有 `/admin/*` 頁面（目前為 passthrough）。
**函數清單**:
- `export default function AdminLayout({ children })` — Admin 佈局容器

### `src/app/(admin)/admin/page.tsx`
**描述**: 管理員後台主頁（`/admin`）— 目前為佔位元件（Placeholder）。
**函數清單**:
- `export default function AdminPage()` — 管理員後台入口頁

---

## `(auth)` 路由群組

### `src/app/(auth)/layout.tsx`
**描述**: Auth 路由群組佈局 — 包裹所有未認證頁面（目前為 passthrough）。
**函數清單**:
- `export default function AuthLayout({ children })` — Auth 佈局容器（可擴充為置中卡片佈局）

### `src/app/(auth)/login/page.tsx`
**描述**: 登入頁（`/login`）— 目前為佔位元件。
**函數清單**:
- `export default function LoginPage()` — 電子郵件/密碼及 OAuth 登入表單（待實作）

### `src/app/(auth)/register/page.tsx`
**描述**: 註冊頁（`/register`）— 目前為佔位元件。
**函數清單**:
- `export default function RegisterPage()` — 新帳號建立表單（待實作）

### `src/app/(auth)/forgot-password/page.tsx`
**描述**: 忘記密碼頁（`/forgot-password`）— 目前為佔位元件。
**函數清單**:
- `export default function ForgotPasswordPage()` — 密碼重置信件發送表單（待實作）

---

## `(invite)` 路由群組

### `src/app/(invite)/layout.tsx`
**描述**: Invite 路由群組佈局 — 包裹邀請相關頁面（目前為 passthrough）。
**函數清單**:
- `export default function InviteLayout({ children })` — Invite 佈局容器

### `src/app/(invite)/invite/[token]/page.tsx`
**描述**: 邀請連結接受頁（`/invite/[token]`）— async Server Component，解析 token 並顯示邀請資訊。目前為佔位元件。
**函數清單**:
- `export default async function InviteTokenPage({ params })` — 取得 `params.token`，驗證邀請並渲染加入頁（待實作）

---

## `(main)` 路由群組

### `src/app/(main)/layout.tsx`
**描述**: Main 路由群組佈局（AccountProvider layout）— 應載入認證使用者與可用帳號清單，並向所有 `(main)` 子路由提供帳號 context（目前為 passthrough）。
**函數清單**:
- `export default function MainLayout({ children })` — Main 佈局容器（待擴充加入認證守衛與 AccountProvider）

### `src/app/(main)/onboarding/page.tsx`
**描述**: 新使用者引導頁（`/onboarding`）— 目前為佔位元件。
**函數清單**:
- `export default function OnboardingPage()` — 新帳號引導流程（待實作）

### `src/app/(main)/firebase-check/page.tsx`
**描述**: Firebase 連線狀態檢查頁（`/firebase-check`）— Server Component 包裝，設定 SEO metadata 後渲染 Client 端檢查元件。
**函數清單**:
- `export const metadata: Metadata` — 頁面 metadata（title: "Firebase 連線狀態"）
- `export default function FirebaseCheckPage()` — 渲染 `FirebaseCheckClient`

### `src/app/(main)/firebase-check/firebase-check-client.tsx`
**描述**: Firebase 服務連線狀態檢查 Client Component — 逐一測試 Firebase App、App Check、Analytics、Auth（匿名登入）、Firestore、Realtime Database、Storage 的連線狀態，以卡片列表顯示結果。
**函數清單**:
- `type ServiceStatus` — `"pending" | "ok" | "error"` 服務狀態類型
- `interface ServiceResult` — `{ status: ServiceStatus; detail?: string }` 服務結果
- `interface CheckResults` — 7 個服務（app/appCheck/analytics/auth/firestore/database/storage）的結果 map
- `function StatusBadge({ status })` — 狀態 badge 元件（⏳/✅/❌）
- `function ServiceRow({ name, result })` — 單一服務結果列元件
- `export function FirebaseCheckClient()` — 主元件，執行所有服務連線測試並即時更新狀態

---

## `(main)/(account)` 子路由群組（帳號管理）

### `src/app/(main)/(account)/layout.tsx`
**描述**: Account 子路由群組佈局 — 使用 Parallel Routes，包含 `@sidebar` 和主內容區域。
**函數清單**:
- `export default function AccountLayout({ children, sidebar })` — Account 佈局，組合側邊欄與主內容

### `src/app/(main)/(account)/@sidebar/default.tsx`
**描述**: Account 側邊欄 Parallel Route 預設視圖 — 當 `@sidebar` 無活躍頁面時渲染 null。
**函數清單**:
- `export default function Default()` — 回傳 null

### `src/app/(main)/(account)/default.tsx`
**描述**: Account 路由群組預設視圖 — 當無子路由匹配時渲染 null（例如直接訪問 account group 根路徑）。
**函數清單**:
- `export default function Default()` — 回傳 null

### `src/app/(main)/(account)/profile/page.tsx`
**描述**: 個人資料設定頁（`/profile`）— 目前為佔位元件。
**函數清單**:
- `export default function ProfilePage()` — 個人資料編輯表單（待實作）

### `src/app/(main)/(account)/notifications/page.tsx`
**描述**: 通知設定頁（`/notifications`）— 目前為佔位元件。
**函數清單**:
- `export default function NotificationsPage()` — 通知偏好設定（待實作）

### `src/app/(main)/(account)/organizations/page.tsx`
**描述**: 組織管理頁（`/organizations`）— 目前為佔位元件。
**函數清單**:
- `export default function OrganizationsPage()` — 組織清單與加入/建立組織（待實作）

### `src/app/(main)/(account)/security/page.tsx`
**描述**: 帳號安全設定頁（`/security`）— 目前為佔位元件。
**函數清單**:
- `export default function SecurityPage()` — 密碼變更、二步驟驗證設定（待實作）

---

## `(main)/[slug]` 動態路由（命名空間）

### `src/app/(main)/[slug]/layout.tsx`
**描述**: SlugProvider 佈局 — 應從 URL params 解析 `slug`，載入對應的 namespace 資料，並向所有子路由提供 context。目前已記錄職責但為 passthrough。
**函數清單**:
- `export default function SlugLayout({ children, sidebar })` — Slug 佈局（待擴充加入 namespace 解析）

### `src/app/(main)/[slug]/default.tsx`
**描述**: Slug 路由群組預設視圖 — 無子路由匹配時 null。
**函數清單**:
- `export default function Default()` — 回傳 null

### `src/app/(main)/[slug]/@sidebar/default.tsx`
**描述**: Slug 側邊欄 Parallel Route 預設視圖 — null。
**函數清單**:
- `export default function Default()` — 回傳 null

### `src/app/(main)/[slug]/workspaces/page.tsx`
**描述**: 工作區清單頁（`/[slug]/workspaces`）— 目前為佔位元件。
**函數清單**:
- `export default function WorkspacesPage()` — 命名空間下的工作區清單（待實作）

### `src/app/(main)/[slug]/settings/general/page.tsx`
**描述**: 命名空間一般設定頁（`/[slug]/settings/general`）— 目前為佔位元件。
**函數清單**:
- `export default function GeneralSettingsPage()` — 命名空間名稱、描述設定（待實作）

### `src/app/(main)/[slug]/settings/members/page.tsx`
**描述**: 命名空間成員管理頁（`/[slug]/settings/members`）— 目前為佔位元件。
**函數清單**:
- `export default function MembersSettingsPage()` — 成員清單、邀請、移除成員（待實作）

### `src/app/(main)/[slug]/settings/billing/page.tsx`
**描述**: 命名空間帳務設定頁（`/[slug]/settings/billing`）— 目前為佔位元件。
**函數清單**:
- `export default function BillingSettingsPage()` — 訂閱方案、付款方式管理（待實作）

### `src/app/(main)/[slug]/settings/api-keys/page.tsx`
**描述**: API 金鑰管理頁（`/[slug]/settings/api-keys`）— 目前為佔位元件。
**函數清單**:
- `export default function ApiKeysSettingsPage()` — API 金鑰建立、撤銷管理（待實作）

---

## `(main)/[slug]/[workspaceId]` 動態路由（工作區）

### `src/app/(main)/[slug]/[workspaceId]/layout.tsx`
**描述**: WorkspaceProvider 佈局 — 應依 `workspaceId` 載入工作區資料並向子路由提供 context。目前已記錄職責但為 passthrough。
**函數清單**:
- `export default function WorkspaceIdLayout({ children })` — 工作區 ID 佈局（待擴充）

### `src/app/(main)/[slug]/[workspaceId]/(workspace)/layout.tsx`
**描述**: Workspace 子路由群組佈局 — 使用 Parallel Routes，包含 `@sidebar` 和主工作區內容。
**函數清單**:
- `export default function WorkspaceLayout({ children, sidebar })` — 工作區佈局（側邊欄 + 主內容）

### `src/app/(main)/[slug]/[workspaceId]/(workspace)/default.tsx`
**描述**: Workspace 路由群組預設視圖 — null。
**函數清單**:
- `export default function Default()` — 回傳 null

### `src/app/(main)/[slug]/[workspaceId]/(workspace)/@sidebar/default.tsx`
**描述**: Workspace 側邊欄 Parallel Route 預設視圖 — null。
**函數清單**:
- `export default function Default()` — 回傳 null

### `src/app/(main)/[slug]/[workspaceId]/(workspace)/wbs/page.tsx`
**描述**: WBS（Work Breakdown Structure）頁面（`/[slug]/[workspaceId]/wbs`）— 目前為佔位元件。
**函數清單**:
- `export default function WbsPage()` — 工作分解結構視圖（待實作，使用 work.module）

### `src/app/(main)/[slug]/[workspaceId]/(standalone)/editor/page.tsx`
**描述**: 獨立編輯器頁（`/[slug]/[workspaceId]/editor`，standalone 路由群組）— 目前為佔位元件。
**函數清單**:
- `export default function EditorPage()` — 全螢幕編輯器視圖，不含側邊欄（待實作）

---

## `(marketing)` 路由群組

### `src/app/(marketing)/layout.tsx`
**描述**: Marketing 路由群組佈局 — 包裹行銷/落地頁（目前為 passthrough）。
**函數清單**:
- `export default function MarketingLayout({ children })` — Marketing 佈局容器（可擴充加入 Nav/Footer）

---

## `(shared)` 路由群組

### `src/app/(shared)/layout.tsx`
**描述**: Shared 路由群組佈局 — 包裹公開分享頁面（目前為 passthrough）。
**函數清單**:
- `export default function SharedLayout({ children })` — Shared 佈局容器

### `src/app/(shared)/share/[shareId]/page.tsx`
**描述**: 公開分享頁（`/share/[shareId]`）— async Server Component，解析 shareId 後顯示分享內容。目前為佔位元件。
**函數清單**:
- `export default async function SharePage({ params })` — 取得 `params.shareId`，渲染公開分享視圖（待實作）
