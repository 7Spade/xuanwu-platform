# MCP: software-planning

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `software-planning` |
| Package | `github:NightTrek/Software-planning-mcp` (npm GitHub) |
| Runtime | `npx` |

## 功能特性

- **計劃持久化**：實作計劃（Plan）儲存在工具狀態中，跨多次呼叫持續追蹤
- **Todo 管理**：新增、移除、更新 todo 項目的完成狀態
- **複雜度評分**：每個 todo 可設定 0–10 的複雜度分數
- **程式碼範例**：todo 可附帶程式碼範例說明
- **目標追蹤**：從高層次目標出發，分解為可執行的步驟

## 工具列表

| 工具 | 用途 |
|------|------|
| `software-planning-start_planning` | 以目標開始新的計劃 session |
| `software-planning-save_plan` | 儲存當前實作計劃文字 |
| `software-planning-add_todo` | 新增 todo 項目（標題、描述、複雜度、程式碼範例） |
| `software-planning-remove_todo` | 刪除指定 todo 項目 |
| `software-planning-get_todos` | 取得當前計劃的所有 todo |
| `software-planning-update_todo_status` | 更新 todo 完成狀態 |

## 使用流程

```
1. software-planning-start_planning(goal="實作 Auth Module 的 Login 功能")
   → 初始化計劃 session

2. software-planning-add_todo(
     title="建立 LoginEntity",
     description="定義 Login 領域實體，包含 email/password 值物件",
     complexity=3
   )

3. // 逐步執行 todo 並更新狀態
   software-planning-update_todo_status(todoId="xxx", isComplete=true)

4. software-planning-get_todos()
   → 查看所有 todo 的完成狀態
```

## 應用場景

### 1. 功能實作規劃
```
目標：實作 Workforce Module 的員工管理功能
Todo:
- [ ] 設計 EmployeeEntity（複雜度 4）
- [ ] 建立 IEmployeeRepository port（複雜度 2）
- [ ] 實作 CreateEmployeeUseCase（複雜度 5）
- [ ] 建立 Firestore 適配器（複雜度 4）
- [ ] 新增 Server Action（複雜度 3）
```

### 2. 重構規劃
```
目標：將 auth.module 遷移到 DDD 4-layer 架構
Todo:
- [ ] 分析現有程式碼結構（複雜度 2）
- [ ] 提取 UserEntity（複雜度 4）
- [ ] 建立 IUserRepository（複雜度 2）
- [ ] 遷移 Firebase 呼叫到 infra 層（複雜度 5）
- [ ] 更新 Server Actions（複雜度 3）
```

### 3. 多步驟文件更新
```
目標：修正所有文件中的不一致
Todo:
- [x] 修正 ADR 索引（已完成）
- [x] 修正 i18n 路徑（已完成）
- [ ] 修正 DDD 圖表（進行中）
```

## 何時使用 software-planning

| 適合 | 不適合 |
|------|--------|
| 多步驟任務需要追蹤進度 | 簡單的單步任務 |
| 需要估計複雜度和規劃順序 | 即興的快速修復 |
| 有明確目標的功能實作 | 探索性研究 |
| 需要跨多次對話維持計劃 | 一次性查詢 |

## 注意事項

- 計劃狀態在 session 內持久，但 session 結束後清除
- `complexity` 範圍 0–10，0 = 極簡單，10 = 極複雜
- `todoId` 由工具自動生成，用 `get_todos` 查詢
