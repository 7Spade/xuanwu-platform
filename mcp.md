# MCP Server Configuration

> **格式說明**
> - **GitHub Coding Agent 設定頁**（`mcpServers`）使用 `type: "local"` 和必要的 `tools` 欄位。
> - **VS Code 本機 Copilot Chat**（`.vscode/mcp.json`）使用 `servers` 鍵和 `type: "stdio"`，無 `tools` 欄位。
> - 兩份配置已同步至 `.vscode/mcp.json`（本機）與下方 JSON（Coding Agent）。

---

## GitHub Coding Agent 完整設定（貼至設定頁）

貼到 [GitHub Copilot Coding Agent 設定頁](https://github.com/7Spade/xuanwu-platform/settings/copilot/coding_agent) 的 **MCP configuration** 輸入框：

```json
{
  "mcpServers": {
    "agent-memory": {
      "type": "stdio",
      "command": "uvx",
      "args": ["--from", "agent-memory-server", "agent-memory", "mcp"],
      "env": {
        "REDIS_URL": "$COPILOT_MCP_REDIS_URL",
        "OPENAI_API_KEY": "$COPILOT_MCP_OPENAI_API_KEY",
        "DISABLE_AUTH": "true"
      },
      "tools": ["*"]
    },
    "filesystem": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
      "tools": ["*"]
    },
    "repomix": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "repomix", "--mcp"],
      "tools": ["*"]
    },
    "context7": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "tools": ["*"]
    },
    "sequential-thinking": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "tools": ["*"]
    },
    "software-planning": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@joshuarileydev/software-planning-tool"],
      "tools": ["*"]
    },
    "playwright": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "tools": ["*"]
    },
    "next-devtools": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@next/mcp"],
      "tools": ["*"]
    },
    "shadcn": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "shadcn@latest"],
      "tools": ["*"]
    },
    "markitdown": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "markitdown-mcp"],
      "tools": ["*"]
    },
    "everything": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"],
      "tools": ["*"]
    },
    "serena": {
      "type": "local",
      "command": "uvx",
      "args": ["serena"],
      "tools": ["*"]
    },
    "firebase-mcp-server": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "firebase-mcp-server"],
      "env": {
        "FIREBASE_PROJECT_ID": "xuanwu-i-00708880-4e2d8",
        "FIREBASE_SERVICE_ACCOUNT_KEY": "${COPILOT_MCP_FIREBASE_SERVICE_ACCOUNT_KEY}"
      },
      "tools": ["*"]
    }
  }
}
```

> **注意事項：**
> - `filesystem` 伺服器：Coding Agent 使用 `"."` （執行目錄即 repo 根目錄）；VS Code 本機使用 `"${workspaceFolder}"` （VS Code 變數替換）。兩者行為相同，格式不同。
> - `serena` 需要 `uv` / `uvx` 工具。若 Coding Agent 環境缺少，請在 `.github/workflows/copilot-setup-steps.yml` 加入安裝步驟。
> - `firebase-mcp-server` 已綁定至 Firebase 專案 `xuanwu-i-00708880-4e2d8`。Admin SDK 功能（Firestore write、Auth 管理等）需要 Service Account：在 GitHub 或 Copilot 環境的 Secrets 設定 `COPILOT_MCP_FIREBASE_SERVICE_ACCOUNT_KEY`（JSON 字串）。唯讀 / 結構查詢只需 `FIREBASE_PROJECT_ID`，本機開發亦可透過 `firebase login` 取得 ADC 憑證。
> - `agent-memory` 需要 `uv` / `uvx`（已由 `copilot-setup-steps.yml` 安裝）。需設定兩個 Copilot 環境 Secrets：`COPILOT_MCP_REDIS_URL`（Redis TLS URL，格式：`rediss://default:PASSWORD@host:port`）及 `COPILOT_MCP_OPENAI_API_KEY`（OpenAI API key，用於 embedding 與 generation）。本機 VS Code 使用時，伺服器啟動時會透過 input 對話框提示輸入。
> - `agent-memory` 的 `DISABLE_AUTH: "true"`：stdio 模式下伺服器透過 stdin/stdout 與 MCP host（VS Code / Copilot Coding Agent）通訊，不對外暴露任何網路端口，因此 OAuth2/JWT 驗證不適用且無需啟用。存取控制完全由 MCP host 本身（VS Code 或 GitHub Copilot）管理。若改用 SSE/HTTP 模式部署至公開網路，**必須移除 `DISABLE_AUTH` 並設定完整 OAuth2 認證**（參考 `agent-memory-server` [Authentication 文件](https://redis.github.io/agent-memory-server/authentication/)）。

---

## agent-memory-server 與 GitHub Copilot Coding Agent 相容性

**結論：✅ 100% 相容**

根據以下官方文件驗證：
- **GitHub Copilot Coding Agent MCP 官方文件**：支援 `type: "stdio"` 和 `type: "local"` 本地進程 MCP 伺服器（[參考](https://docs.github.com/en/copilot/using-github-copilot/coding-agent/extending-copilot-coding-agent-with-mcp)）。
- **`redis/agent-memory-server` 官方文件**：支援 stdio 傳輸模式，可透過 `uvx --from agent-memory-server agent-memory mcp` 啟動（[參考](https://github.com/redis/agent-memory-server)）。
- **`uv` / `uvx` 依賴**：已由 `.github/workflows/copilot-setup-steps.yml`（`astral-sh/setup-uv@v5`）在 Coding Agent 環境中預先安裝。

| 相容性條件 | 狀態 |
|------------|------|
| GitHub Copilot Coding Agent 支援 stdio MCP | ✅ |
| `uvx` 在 runner 環境已安裝 | ✅（`copilot-setup-steps.yml`） |
| `agent-memory-server` 支援 stdio 模式 | ✅ |
| 憑證可透過 `COPILOT_MCP_*` secrets 傳遞 | ✅ |
| Redis Cloud TLS URL 格式支援 | ✅（`rediss://` scheme） |

**需要設定的 Copilot 環境 Secrets：**

| Secret 名稱 | 說明 |
|-------------|------|
| `COPILOT_MCP_REDIS_URL` | Redis Cloud TLS URL（格式：`rediss://default:PASSWORD@host:port`） |
| `COPILOT_MCP_OPENAI_API_KEY` | OpenAI API key（用於 embedding 與 generation） |

---

## 各伺服器用途速查

| 優先度 | 伺服器 | 主要用途 |
|--------|--------|----------|
| ⭐⭐⭐ | `agent-memory` | 跨 session 持久記憶（Redis 向量搜尋） |
| ⭐⭐⭐ | `filesystem` | 讀寫本地檔案 |
| ⭐⭐⭐ | `repomix` | 全 repo 快照，理解 DDD 結構 |
| ⭐⭐⭐ | `context7` | Next.js 15 / React 19 官方文件 |
| ⭐⭐⭐ | `sequential-thinking` | 多步驟推理、DDD 層分解 |
| ⭐⭐⭐ | `software-planning` | 實作計畫與 todo 追蹤 |
| ⭐⭐⭐ | `serena` | TS 符號智慧 + 跨 session 記憶 |
| ⭐⭐⭐ | `firebase-mcp-server` | Firebase 整合（Firestore / Auth / Hosting） |
| ⭐⭐ | `playwright` | 平行路由 E2E 測試 |
| ⭐⭐ | `next-devtools` | Next.js 路由診斷 |
| ⭐⭐ | `shadcn` | shadcn/ui 元件安裝 |
| ⭐⭐ | `markitdown` | 外部文件轉 Markdown |
| ⭐ | `everything` | 通用工具 |
