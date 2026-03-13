# MCP: next-devtools

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `next-devtools` |
| Package | `next-devtools-mcp@latest` (npm) |
| Runtime | `npx` |
| 需要 | Next.js 16+（本專案使用 Next.js 15，部分功能可能不可用） |
| Dev server port | `9002`（本專案） |

## 功能特性

- **MCP 端點整合**：連接到運行中 Next.js dev server 的 `/_next/mcp` 端點
- **即時診斷**：直接從 Next.js 執行時取得錯誤、路由、build 狀態資訊
- **零設定**：Next.js 16+ 預設啟用，無需額外設定
- **Cache Components**：支援 `cacheComponents` 模式的遷移和配置（Next.js 16+）
- **文件存取**：按路徑查詢 Next.js 官方文件

## 工具列表

| 工具 | 用途 |
|------|------|
| `next-devtools-nextjs_index` | 探索運行中的 Next.js dev server，列出可用 MCP 工具 |
| `next-devtools-nextjs_call` | 呼叫特定 Next.js MCP 工具（get_errors、list_routes 等） |
| `next-devtools-nextjs_docs` | 按路徑查詢 Next.js 官方文件 |
| `next-devtools-init` | 初始化 Next.js DevTools MCP 環境（每次 session 開始） |
| `next-devtools-browser_eval` | 瀏覽器自動化（整合 playwright） |
| `next-devtools-upgrade_nextjs_16` | 升級到 Next.js 16 的引導流程 |
| `next-devtools-enable_cache_components` | 遷移到 Cache Components 模式 |

## Next.js MCP 動態工具（`nextjs_call` 使用）

| 工具名稱 | 用途（版本相關，以實際 server 為準） |
|---------|-------------------------------------|
| `get_errors` | 取得編譯和執行時錯誤 |
| `list_routes` | 列出所有路由 |
| `get_build_status` | 檢查編譯狀態 |
| `clear_cache` | 清除 Next.js cache |

## 使用流程

```
1. next-devtools-init()                          // 初始化（每次 session）
2. next-devtools-nextjs_index(port="9002")       // 探索 dev server
3. next-devtools-nextjs_call(
     port="9002",
     toolName="get_errors"                       // 呼叫特定工具
   )
```

## 應用場景

### 1. 編譯錯誤診斷
```
next-devtools-nextjs_call(port="9002", toolName="get_errors")
→ 即時查看 TypeScript 編譯錯誤、import 錯誤
```

### 2. 路由結構探索
```
next-devtools-nextjs_call(port="9002", toolName="list_routes")
→ 確認 App Router 路由是否正確生成
```

### 3. 查詢 Next.js 官方文件
```
next-devtools-nextjs_docs(path="/docs/app/api-reference/functions/cookies")
→ 取得版本對應的 API 文件（需先查 nextjs-docs://llms-index）
```

### 4. 升級到 Next.js 16
```
next-devtools-upgrade_nextjs_16(project_path="/path/to/project")
→ 執行官方 codemod，自動處理 async params/searchParams 等 breaking changes
```

## 與 playwright 的分工

| 使用 next-devtools | 使用 playwright |
|-------------------|----------------|
| 伺服器端編譯錯誤 | 客戶端瀏覽器錯誤 |
| 路由結構確認 | UI 渲染視覺驗證 |
| Build status 監控 | E2E 使用者流程 |
| Next.js runtime 診斷 | Hydration 問題（配合 console） |

## 注意事項

- `next-devtools-nextjs_index` 自動探索需要 dev server 運行中
- 若自動探索失敗，請詢問 dev server port 後再次呼叫並帶入 `port` 參數
- Next.js 15（本專案版本）：`/_next/mcp` 端點可能不存在，需確認後再用
- 若 MCP 端點不可用，降級使用 playwright + console_messages 取得錯誤
