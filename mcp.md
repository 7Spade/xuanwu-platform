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
      "tools": ["*"]
    }
  }
}
```

> **注意事項：**
> - `serena` 需要 `uv` / `uvx` 工具。若 Coding Agent 環境缺少，請在 `.github/workflows/copilot-setup-steps.yml` 加入安裝步驟。
> - `firebase-mcp-server` 需要 Firebase 認證。請在 Copilot 環境的 `Secrets` 中設定 `COPILOT_MCP_FIREBASE_*` 對應的憑證，並透過 `env:` 欄位注入。

---

## 各伺服器用途速查

| 優先度 | 伺服器 | 主要用途 |
|--------|--------|----------|
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
