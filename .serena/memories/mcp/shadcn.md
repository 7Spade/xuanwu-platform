# MCP: shadcn

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `shadcn` |
| Package | `shadcn@latest` (npm) |
| Runtime | `npx` (需要 `mcp` 子命令) |
| Launch | `npx -y shadcn@latest mcp` |
| 需要 | `components.json`（已設定） |
| Docs | https://ui.shadcn.com |

## 功能特性

- **元件登錄檔查詢**：查詢 shadcn/ui 元件的完整原始碼和結構
- **使用範例搜尋**：找到 demo 和 example 元件，包含完整實作程式碼
- **安裝指令生成**：取得正確的 `npx shadcn add` 指令
- **模糊搜尋**：按名稱和描述搜尋元件
- **多 Registry 支援**：可查詢自定義 registry（需 `components.json` 配置）

## 工具列表

| 工具 | 用途 |
|------|------|
| `shadcn-get_project_registries` | 取得 `components.json` 中設定的 registry 名稱 |
| `shadcn-list_items_in_registries` | 列出 registry 中的所有元件（支援分頁） |
| `shadcn-search_items_in_registries` | 模糊搜尋元件（名稱 + 描述） |
| `shadcn-view_items_in_registries` | 查看特定元件的詳細資訊和原始碼 |
| `shadcn-get_item_examples_from_registries` | 尋找元件的使用範例和 demo |
| `shadcn-get_add_command_for_items` | 取得安裝元件的 CLI 指令 |
| `shadcn-get_audit_checklist` | 新增元件後的快速驗證清單 |

## 使用流程

```
1. shadcn-search_items_in_registries(registries=["@shadcn"], query="button")
   → 找到元件

2. shadcn-view_items_in_registries(items=["@shadcn/button"])
   → 查看完整實作

3. shadcn-get_item_examples_from_registries(registries=["@shadcn"], query="button-demo")
   → 取得使用範例

4. shadcn-get_add_command_for_items(items=["@shadcn/button"])
   → 取得: npx shadcn add button

5. 執行安裝指令後呼叫 shadcn-get_audit_checklist()
   → 驗證安裝是否正確
```

## 應用場景

### 1. 查詢元件原始碼（不需手動 clone）
```
shadcn-view_items_in_registries(items=["@shadcn/dialog"])
→ 查看 Dialog 的完整 Radix UI 整合程式碼
```

### 2. 找尋正確元件名稱
```
shadcn-search_items_in_registries(registries=["@shadcn"], query="modal overlay")
→ 找到 "dialog"、"sheet"、"drawer" 等相關元件
```

### 3. 取得完整使用範例
```
shadcn-get_item_examples_from_registries(
  registries=["@shadcn"],
  query="form-demo"  // 常見模式：{component}-demo
)
→ 包含 React Hook Form 整合的完整表單範例
```

## 在本專案的位置

shadcn/ui 元件是設計系統的 **primitives** 層（第一層）：
```
src/design-system/
├── primitives/    ← shadcn/ui 原始元件（57 個，已全部安裝）
│   ├── ui/        ← accordion, alert, alert-dialog, aspect-ratio, avatar, badge,
│   │               breadcrumb, button, button-group, calendar, card, carousel,
│   │               chart, checkbox, collapsible, combobox, command, context-menu,
│   │               dialog, direction, drawer, dropdown-menu, empty, field, form,
│   │               hover-card, input, input-group, input-otp, item, kbd, label,
│   │               menubar, native-select, navigation-menu, pagination, popover,
│   │               progress, radio-group, resizable, scroll-area, select, separator,
│   │               sheet, sidebar, skeleton, slider, sonner, spinner, switch, table,
│   │               tabs, textarea, toggle, toggle-group, tooltip
│   ├── hooks/     ← use-mobile.ts
│   └── lib/       ← utils.ts (cn helper)
├── components/    ← 業務包裝層
├── patterns/      ← 複合模式
└── tokens/        ← 設計常數
```

**全部 57 個元件已安裝完畢**（`npx shadcn@latest add --all` 執行於 PR #11）。

## Registry 格式

| 格式 | 範例 |
|------|------|
| 查詢元件 | `@shadcn/button`、`@shadcn/dialog` |
| 查詢範例 | `button-demo`、`form-demo`、`example-hero` |

## 注意事項

- 需要 `components.json` 才能使用（用 `shadcn-get_project_registries` 確認）
- 安裝後必須呼叫 `shadcn-get_audit_checklist` 驗證
- `mcp` 子命令是必要的（`npx shadcn@latest mcp`，非 `npx shadcn`）
