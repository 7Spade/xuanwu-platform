# MCP: repomix

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `repomix` |
| Package | `repomix` (npm) |
| Runtime | `npx` |
| GitHub | https://github.com/yamadashy/repomix |

## 功能特性

- **整合代碼庫**：將本地或遠端 repo 打包成單一 AI 可讀文件
- **多種格式**：XML（結構化標籤）、Markdown（人類可讀）、JSON（機器可讀）、Plain（簡單分隔）
- **Tree-sitter 壓縮**：可選壓縮模式，擷取關鍵程式碼結構，減少約 70% token
- **安全掃描**：自動偵測並防止敏感資訊（API key、密碼）包含在輸出中
- **Glob 過濾**：可指定 include/exclude 模式精確控制打包範圍
- **增量搜尋**：用 `grep_repomix_output` 在打包輸出中搜尋，不需重新打包

## 工具列表

| 工具 | 用途 |
|------|------|
| `repomix-pack_codebase` | 打包本地代碼庫（絕對路徑） |
| `repomix-pack_remote_repository` | 打包遠端 GitHub repo（URL 或 user/repo 格式） |
| `repomix-generate_skill` | 生成 Claude Agent Skill（`.claude/skills/<name>/`） |
| `repomix-attach_packed_output` | 載入現有打包輸出檔案 |
| `repomix-read_repomix_output` | 讀取打包輸出內容（支援分頁） |
| `repomix-grep_repomix_output` | 在打包輸出中搜尋（Regex，類似 grep） |
| `repomix-file_system_read_file` | 讀取本地檔案（含安全驗證） |
| `repomix-file_system_read_directory` | 列出目錄內容（格式化） |

## 應用場景

### 1. 快速了解整個代碼庫
```
repomix-pack_codebase(
  directory="/absolute/path",
  compress=true,     // 大型 repo 建議壓縮
  style="xml"
)
→ 打包後用 grep_repomix_output 搜尋特定模式
```

### 2. 研究外部函式庫
```
repomix-pack_remote_repository(
  remote="yamadashy/repomix",
  includePatterns="src/**/*.ts,README.md"
)
→ 無需 clone 即可分析外部 repo 結構
```

### 3. 專注特定子模組
```
repomix-pack_codebase(
  directory="/home/runner/.../xuanwu-platform",
  includePatterns="src/modules/auth.module/**",
  ignorePatterns="node_modules/**,dist/**"
)
```

### 4. 在打包輸出中搜尋
```
repomix-grep_repomix_output(
  outputId="xxx",
  pattern="useTranslation|i18n",
  contextLines=3
)
```

## 何時使用 repomix vs serena

| 情境 | 推薦工具 |
|------|---------|
| 需要整個代碼庫的快照（初始分析） | `repomix` |
| 尋找特定符號、函數、類別 | `serena` |
| 分析遠端/外部 repo | `repomix` |
| 精確程式碼編輯和重構 | `serena` |
| 大型 PR 全局影響分析 | `repomix` |

## 壓縮模式注意事項

- `compress=true` 使用 Tree-sitter 提取程式碼簽名和結構，移除實作細節
- 減少 token 約 70%，適合大型 repo 的初步分析
- 不適合需要完整實作細節的任務
