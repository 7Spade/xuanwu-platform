# MCP: agent-memory

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `agent-memory` |
| Package | `agent-memory-server` (PyPI) |
| Runtime | `uvx` (Python) |
| Launch | `uvx --from agent-memory-server agent-memory mcp` |
| 必要 secrets | `COPILOT_MCP_REDIS_URL` + `COPILOT_MCP_OPENAI_API_KEY` |
| 安全設定 | `DISABLE_AUTH=true`（stdio 模式下安全，無網路暴露） |

## 功能特性

- **Redis 向量存儲**：記憶體以 embedding 形式儲存，支援語義相似度搜尋
- **跨對話持久化**：記憶體在 Redis 中長期保存，跨 VS Code 對話/Coding Agent session 共享
- **語義搜尋**：自然語言查詢，返回最相關的記憶體（不需完全匹配）
- **記憶體類型**：支援 `semantic`（事實/偏好）和 `episodic`（事件/時序）兩種類型
- **Working Memory**：每個 session 有暫存工作記憶，session 結束後可提升為長期記憶
- **Namespace 組織**：可用 namespace 分隔不同類型的記憶體

## 工具列表

| 工具 | 用途 |
|------|------|
| `agent-memory-create_long_term_memories` | 建立長期記憶（semantic 或 episodic 類型） |
| `agent-memory-search_long_term_memory` | 語義搜尋記憶體（向量相似度） |
| `agent-memory-memory_prompt` | 以記憶體豐富查詢的上下文（hybrid 搜尋） |
| `agent-memory-get_long_term_memory` | 按 ID 取得特定記憶體 |
| `agent-memory-edit_long_term_memory` | 更新現有記憶體的內容/標籤 |
| `agent-memory-delete_long_term_memories` | 永久刪除指定記憶體（不可復原） |
| `agent-memory-set_working_memory` | 設定 session 工作記憶（結構化 JSON 或 messages） |
| `agent-memory-get_working_memory` | 取得 session 工作記憶 |
| `agent-memory-get_current_datetime` | 取得當前 UTC 時間（用於 episodic 記憶時間標記） |

## Semantic vs Episodic 記憶體

| 類型 | 何時使用 | 範例 |
|------|---------|------|
| `semantic` | 無時效性的事實、偏好、規範 | "專案使用 src/modules/<name>.module/ 結構" |
| `episodic` | 特定事件、時間相關資訊（必須有 event_date） | "PR #10 於 2026-03-13 修正了設計系統命名" |

## 與 serena 記憶體的區別

| 關切點 | 使用工具 |
|--------|---------|
| 專案級別檔案筆記（`.serena/memories/`） | `serena-write_memory` / `serena-list_memories` |
| 跨對話語義搜尋（Redis 向量） | `agent-memory-create_long_term_memories` / `agent-memory-search_long_term_memory` |

## 應用場景

### 1. 任務開始時回顧先前上下文
```
agent-memory-search_long_term_memory(text="Domain Module architecture conventions")
→ 找回之前記錄的架構決策
```

### 2. 記錄重要的架構決策
```
agent-memory-create_long_term_memories(memories=[{
  "text": "Domain Modules 使用 src/modules/<name>.module/ 結構",
  "memory_type": "semantic",
  "topics": ["architecture", "modules"]
}])
```

### 3. 記錄特定事件
```
agent-memory-create_long_term_memories(memories=[{
  "text": "PR #10 完成 features→modules 重命名，設計系統改為 tokens/ 第四層",
  "memory_type": "episodic",
  "event_date": "2026-03-13T00:00:00Z",
  "topics": ["pr-history", "architecture"]
}])
```

### 4. 豐富查詢上下文（memory_prompt）
```
agent-memory-memory_prompt(query="如何處理 Firebase Firestore 的 Security Rules？")
→ 返回相關記憶體 + 查詢，讓回應更有上下文
```

## 使用本專案的指定 Agent

`agent-memory/*` 主要由以下 agent 使用：
- **`xuanwu-research`**：任務開始時搜尋先前記錄的知識
- **`xuanwu-orchestrator`**：每次 session 開始呼叫 `agent-memory-search_long_term_memory` 取回先前上下文

## 注意事項

- `DISABLE_AUTH=true` 在 stdio 模式下安全（無網路埠暴露），VS Code 使用 `inputs` promptString
- 刪除操作不可復原，謹慎使用 `agent-memory-delete_long_term_memories`
- episodic 記憶體必須設定 `event_date`（ISO 8601 格式）
- 時間表達式（"今天"、"上週"）需先呼叫 `agent-memory-get_current_datetime` 轉換為絕對時間
