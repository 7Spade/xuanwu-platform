# MCP: markitdown

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `markitdown` |
| Package | `markitdown-mcp` (PyPI) |
| Runtime | `uvx` (Python) |
| 支援格式 | HTTP URL、HTTPS URL、file:// URI、data: URI |

## 功能特性

- **多源轉換**：將網頁 URL、本地檔案、data URI 轉換為 Markdown
- **內容簡化**：去除 HTML 標籤和格式，提取純文字內容，便於 AI 分析
- **PDF 支援**：可轉換 PDF 文件為可讀 Markdown
- **Office 文件**：支援 Word、Excel、PowerPoint 轉換
- **圖片 OCR**：可提取圖片中的文字（需 OCR 支援）

## 工具列表

| 工具 | 用途 |
|------|------|
| `markitdown-convert_to_markdown` | 將 URI 內容轉換為 Markdown |

## 使用方式

```
markitdown-convert_to_markdown(uri="https://example.com/docs/api")
markitdown-convert_to_markdown(uri="https://oraios.github.io/serena/02-usage/030_clients.html")
markitdown-convert_to_markdown(uri="file:///path/to/document.pdf")
```

## 應用場景

### 1. 讀取官方文件（本專案重點用途）
```
markitdown-convert_to_markdown(
  uri="https://oraios.github.io/serena/02-usage/030_clients.html"
)
→ 取得 Serena MCP 官方設定文件的純文字版本
```

### 2. 分析 GitHub 文件
```
markitdown-convert_to_markdown(
  uri="https://github.com/microsoft/vscode-docs/blob/main/docs/copilot/customization/custom-agents.md"
)
→ 讀取 VS Code 官方 agent 文件
```

### 3. 讀取 PDF 報告
```
markitdown-convert_to_markdown(
  uri="file:///path/to/architecture-report.pdf"
)
```

## 與其他工具的分工

| 使用 markitdown | 使用 context7 |
|---------------|--------------|
| 任意 URL 的通用文件轉換 | Next.js/React/Firebase 等特定框架文件 |
| PDF、Office 文件 | 版本精準的 API 文件和程式碼範例 |
| 一次性 URL 內容讀取 | 需要跨版本比較的文件查詢 |

## 注意事項

- 需要 `uv` 安裝（Coding Agent 環境由 `copilot-setup-steps.yml` 處理）
- 網路存取受沙箱限制，某些 URL 可能被封鎖
- 轉換品質依據網頁 HTML 結構而定，動態渲染頁面效果可能較差
