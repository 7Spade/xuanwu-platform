# MCP: context7

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `context7` |
| Package | `@upstash/context7-mcp` (npm) |
| Runtime | `npx` |
| Docs | https://context7.com |

## 功能特性

- **版本精準文件**：按指定版本查詢框架/函式庫的官方文件和 API
- **程式碼範例**：返回完整、可執行的程式碼片段，附帶來源引用
- **多框架支援**：Next.js、React、TypeScript、Tailwind、Firebase、shadcn/ui 等
- **避免幻覺**：提供真實、版本對應的 API，不依賴訓練資料的過期知識
- **Library ID 系統**：使用 `/org/project` 格式的 library ID 定位文件

## 工具列表

| 工具 | 用途 |
|------|------|
| `context7-resolve-library-id` | 將套件名稱轉換為 Context7 library ID（必須先呼叫） |
| `context7-query-docs` | 按 library ID 和查詢問題取得文件和程式碼範例 |

## 使用流程

1. 呼叫 `context7-resolve-library-id(libraryName="next.js", query="...")`
2. 取得 library ID（例如 `/vercel/next.js`）
3. 呼叫 `context7-query-docs(libraryId="/vercel/next.js", query="...")`

## 應用場景

### Next.js App Router（本專案重點）
```
版本敏感 API：params/searchParams async 處理、Route Handlers、
Server Actions、Suspense boundaries、loading.tsx、error.tsx
```

### React 19 新特性
```
use() hook、Server Components、Actions、
transitions、optimistic updates
```

### Tailwind CSS v4
```
新的 CSS-first 設定方式、@theme 指令、
Layer utilities、Dynamic utility values
```

### Firebase v11
```
Firestore SDK 操作、Security Rules 語法、
App Check 設定、Analytics 事件追蹤
```

### shadcn/ui（本專案 UI 基礎）
```
元件安裝與客製化、主題設定、
Radix UI 整合模式
```

## 本專案使用的關鍵 Library IDs

| 套件 | Library ID |
|------|-----------|
| Next.js 15 | `/vercel/next.js` |
| React 19 | `/facebook/react` |
| TypeScript | `/microsoft/typescript` |
| Tailwind CSS v4 | `/tailwindlabs/tailwindcss` |
| Firebase | `/firebase/firebase-js-sdk` |
| shadcn/ui | `/shadcn-ui/ui` |

## 注意事項

- 每個問題最多呼叫 3 次（resolve + query × 2）
- 若找不到 library ID，用最佳結果繼續，不要無限查詢
- 版本敏感的 API（Next.js async params、React 19 hooks）**必須**先查詢 Context7
- 不要用訓練資料中可能過期的 API 直接實作版本敏感功能
