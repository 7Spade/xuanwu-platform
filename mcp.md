# MCP Server Configuration

貼到 [GitHub Copilot Coding Agent 設定頁](https://github.com/7Spade/xuanwu-platform/settings/copilot/coding_agent) 的 **MCP configuration** 輸入框。

---

## 完整設定（直接貼上）

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "repomix": {
      "command": "npx",
      "args": ["-y", "repomix", "--mcp"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "software-planning": {
      "command": "npx",
      "args": ["-y", "@joshuarileydev/software-planning-tool"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "@next/mcp"]
    },
    "shadcn": {
      "command": "npx",
      "args": ["-y", "shadcn@latest"]
    },
    "markitdown": {
      "command": "npx",
      "args": ["-y", "markitdown-mcp"]
    },
    "everything": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    }
  }
}
```

---

## 選用伺服器（視需求加入）

若要使用以下功能，請將對應區塊加入上方 `mcpServers` 物件：

### Serena — 深度 TypeScript 符號導覽與跨 session 記憶

```json
"serena": {
  "command": "uvx",
  "args": ["serena"]
}
```

### Firebase — Firestore / Auth / App Hosting

```json
"firebase-mcp-server": {
  "command": "npx",
  "args": ["-y", "firebase-mcp-server"]
}
```

---

## 各伺服器用途速查

| 優先度 | 伺服器 | 主要用途 |
|--------|--------|----------|
| ⭐⭐⭐ | `filesystem` | 讀寫本地檔案 |
| ⭐⭐⭐ | `repomix` | 全 repo 快照，理解 DDD 結構 |
| ⭐⭐⭐ | `context7` | Next.js 15 / React 19 官方文件 |
| ⭐⭐⭐ | `sequential-thinking` | 多步驟推理、DDD 層分解 |
| ⭐⭐⭐ | `software-planning` | 實作計畫與 todo 追蹤 |
| ⭐⭐ | `playwright` | 平行路由 E2E 測試 |
| ⭐⭐ | `next-devtools` | Next.js 路由診斷 |
| ⭐⭐ | `shadcn` | shadcn/ui 元件安裝 |
| ⭐⭐ | `markitdown` | 外部文件轉 Markdown |
| ⭐ | `everything` | 通用工具 |
| 選用 | `serena` | TS 符號智慧 + 記憶 |
| 選用 | `firebase-mcp-server` | Firebase 整合 |
