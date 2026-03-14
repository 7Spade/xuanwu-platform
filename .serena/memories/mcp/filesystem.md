# MCP: filesystem

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `filesystem` |
| Package | `@modelcontextprotocol/server-filesystem` (npm) |
| Runtime | `npx` |
| 允許路徑 | `.`（當前工作目錄及其子目錄） |

## 功能特性

- **沙箱安全**：只允許存取設定的目錄（`.` = 工作目錄），防止越界存取
- **完整 CRUD**：讀取、寫入、移動、刪除、建立目錄
- **目錄樹**：遞迴列出檔案樹結構（JSON 格式）
- **Glob 搜尋**：按檔名模式搜尋檔案
- **媒體支援**：讀取圖片和音訊檔案（base64 + MIME type）
- **檔案資訊**：取得詳細 metadata（大小、時間、權限）

## 工具列表

| 工具 | 用途 |
|------|------|
| `filesystem-read_text_file` | 讀取文字檔案（支援 head/tail 行數限制） |
| `filesystem-read_multiple_files` | 同時讀取多個檔案（高效率） |
| `filesystem-read_media_file` | 讀取圖片/音訊檔案（base64） |
| `filesystem-write_file` | 建立或完整覆寫檔案 |
| `filesystem-edit_file` | 行基礎編輯（git-style diff 輸出） |
| `filesystem-create_directory` | 建立目錄（包含巢狀目錄） |
| `filesystem-move_file` | 移動或重命名檔案/目錄 |
| `filesystem-list_directory` | 列出目錄內容（[FILE]/[DIR] 標示） |
| `filesystem-list_directory_with_sizes` | 列出目錄內容含大小（可排序） |
| `filesystem-directory_tree` | 遞迴取得 JSON 格式的目錄樹 |
| `filesystem-search_files` | Glob 模式搜尋檔案 |
| `filesystem-get_file_info` | 取得檔案詳細 metadata |
| `filesystem-list_allowed_directories` | 列出所有允許存取的目錄 |

## 應用場景

### 1. 批量讀取相關檔案
```
filesystem-read_multiple_files(paths=[
  "src/shared/i18n/index.ts",
  "src/app/page.tsx",
  "src/app/layout.tsx"
])
→ 一次取得多個相關檔案，比逐一讀取更高效
```

### 2. 建立新目錄結構
```
filesystem-create_directory("src/modules/reporting.module/domain.reports")
→ 建立深層巢狀目錄（自動建立中間目錄）
```

### 3. 精確行編輯
```
filesystem-edit_file(
  path="src/shared/i18n/index.ts",
  edits=[{oldText: "old string", newText: "new string"}]
)
→ 只修改指定的字串，其餘不動
```

### 4. 探索未知目錄
```
filesystem-directory_tree("src/modules", excludePatterns=["node_modules/**"])
→ 取得 JSON 格式的完整目錄樹
```

## 與 serena 的分工

| 使用 filesystem | 使用 serena |
|----------------|-------------|
| 讀取設定檔、Markdown 等非程式碼 | TypeScript/JS 程式碼符號操作 |
| 一次讀取多個任意類型檔案 | 型別感知的符號搜尋和重構 |
| 建立/移動目錄結構 | 跨檔案重命名符號 |
| 寫入/覆蓋整個檔案 | 插入/替換特定符號體 |

## 注意事項

- `filesystem-write_file` 會完整覆蓋現有檔案（無警告），謹慎使用
- `filesystem-edit_file` 的 `oldText` 必須完全匹配（含空格），否則編輯失敗
- 優先使用 `serena` 處理 TypeScript 程式碼，`filesystem` 處理設定、文件類型
- 沙箱限制：只能存取設定目錄（`.`），不能存取系統其他路徑
