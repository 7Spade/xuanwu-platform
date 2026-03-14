# MCP: serena

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `serena` |
| Package | `git+https://github.com/oraios/serena` |
| Runtime | `uvx` (Python) |
| Launch | `uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide --project <path>` |
| VS Code path | `--project ${workspaceFolder}` |
| Coding Agent path | `--project .` |
| Docs | https://oraios.github.io/serena/02-usage/030_clients.html |

## 功能特性

- **語言伺服器整合**：底層使用 LSP (Language Server Protocol)，提供型別感知的符號搜尋與重構
- **Single-project mode**：`--project` 旗標啟用，自動停用不必要的 `activate_project` 工具
- **IDE context**：`--context ide` 停用與 VS Code 重複的工具，減少 token 消耗
- **記憶體系統**：`.serena/memories/` 目錄儲存專案筆記（Markdown 格式），跨對話持久化
- **符號層級操作**：可精確定位、重命名、替換程式碼符號，不需手動指定行號

## 工具列表

### 讀取工具（Read）
| 工具 | 用途 |
|------|------|
| `serena-get_symbols_overview` | 取得檔案或目錄的頂層符號地圖（第一步） |
| `serena-find_symbol` | 按名稱在整個代碼庫中定位類別、函數、型別 |
| `serena-find_referencing_symbols` | 追蹤符號被引用的所有位置（重命名前必用） |
| `serena-search_for_pattern` | Regex 搜尋（不限於程式碼，也可搜尋文件） |
| `serena-find_file` | 按名稱模式定位檔案 |
| `serena-list_dir` | 列出目錄內容（優先於 filesystem ls） |

### 編輯工具（Write）
| 工具 | 用途 |
|------|------|
| `serena-replace_symbol_body` | 替換整個符號實作（最精確） |
| `serena-insert_after_symbol` | 在指定符號後插入新函數/方法/類別 |
| `serena-insert_before_symbol` | 在指定符號前插入 import/型別/宣告 |
| `serena-replace_content` | 在檔案中替換字串或 Regex 匹配的內容 |
| `serena-rename_symbol` | 跨整個代碼庫安全重命名符號（LSP 支援） |

### 記憶體工具（Memory）
| 工具 | 用途 |
|------|------|
| `serena-write_memory` | 寫入專案筆記到 `.serena/memories/` |
| `serena-read_memory` | 讀取記憶體內容 |
| `serena-list_memories` | 列出所有可用記憶體，可按主題篩選 |
| `serena-delete_memory` | 刪除記憶體（需明確授權） |
| `serena-edit_memory` | 以 Regex 修改記憶體內容 |
| `serena-rename_memory` | 重命名或移動記憶體 |

### 管理工具
| 工具 | 用途 |
|------|------|
| `serena-activate_project` | 切換到指定專案（multi-project mode 才需要） |
| `serena-check_onboarding_performed` | 檢查是否已完成 onboarding |
| `serena-onboarding` | 執行 onboarding（取得初始化指示） |
| `serena-initial_instructions` | 取得 Serena 使用手冊 |
| `serena-get_current_config` | 顯示當前設定（專案、工具、模式） |

## 應用場景

### 在本專案的典型使用流程
1. **開始任務前**：`serena-list_memories` 查看現有記憶體 → `serena-read_memory` 讀取相關記憶
2. **探索陌生檔案**：`serena-get_symbols_overview` 取得符號地圖
3. **尋找程式碼**：`serena-find_symbol` 按名稱定位 → `serena-find_referencing_symbols` 追蹤用法
4. **安全重構**：`serena-rename_symbol`（LSP 確保所有引用同步更新）
5. **記錄發現**：`serena-write_memory` 寫入 `.serena/memories/<topic>/<name>.md`

### 優先使用 serena 而非 grep/glob 的情況
- 需要型別感知的符號搜尋
- 追蹤函數/類別的所有引用
- 跨多個檔案安全重命名

## 記憶體目錄結構（本專案）

```
.serena/memories/
├── project/
│   ├── overview.md      — 專案目的、技術棧、關鍵架構決策
│   ├── architecture.md  — 領域模組、DDD層、設計系統、Firebase
│   ├── conventions.md   — 命名規範、層次規則、MCP分配
│   └── commands.md      — 開發、建置、lint、型別檢查指令
├── mcp/
│   ├── INDEX.md         — MCP 伺服器總覽與索引（本目錄）
│   └── <server>.md      — 各 MCP 功能、特性、應用場景
└── pr-history/
    ├── INDEX.md         — 所有 PR 的導航索引
    └── pr-XX-*.md       — 各 PR 摘要
```

## 注意事項

- `serena-write_memory` 使用 `/` 組織主題，例如 `"mcp/serena"` 
- Memory 名稱若包含 `"global/"` 前綴，則跨專案共享
- Coding Agent 環境下需要 `uv` 預先安裝（由 `copilot-setup-steps.yml` 處理）
