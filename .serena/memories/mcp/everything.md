# MCP: everything

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `everything` |
| Package | `@modelcontextprotocol/server-everything` (npm) |
| Runtime | `npx` |
| 用途定位 | MCP 協定測試 + 通用工具展示 |

## 功能特性

- **協定測試**：覆蓋 MCP 所有功能（工具、資源、提示詞、sampling），用於測試 MCP 客戶端實作
- **多媒體資源**：提供文字和 Blob 格式的資源讀取示例
- **長時間操作**：模擬帶進度更新的長時間操作，測試客戶端進度處理
- **生成功能**：計算、回響、結構化內容生成
- **日誌模擬**：模擬不同級別的日誌輸出

## 工具列表

| 工具 | 用途 |
|------|------|
| `everything-echo` | 回響輸入字串（測試基本通訊） |
| `everything-get-sum` | 計算兩數之和（測試數值傳遞） |
| `everything-get-env` | 取得所有環境變數（除錯 MCP 設定） |
| `everything-get-tiny-image` | 返回 MCP logo 小圖（測試圖片傳輸） |
| `everything-get-annotated-message` | 展示帶 annotations 的不同類型訊息（error/success/debug） |
| `everything-get-resource-reference` | 取得資源參考（Text 或 Blob 格式） |
| `everything-get-resource-links` | 取得多個資源連結（1–10 個） |
| `everything-get-structured-content` | 取得結構化內容 + 輸出 schema（Chicago/New York/LA） |
| `everything-gzip-file-as-resource` | 壓縮 URL 內容為 gzip（resourceLink 或 resource 形式） |
| `everything-trigger-long-running-operation` | 觸發帶進度更新的長時間操作（測試用） |
| `everything-simulate-research-query` | 模擬研究查詢（多階段進度 + elicitation 測試） |
| `everything-toggle-simulated-logging` | 開/關模擬日誌輸出 |
| `everything-toggle-subscriber-updates` | 開/關模擬資源訂閱更新 |

## 應用場景

### 1. 驗證 MCP 環境設定
```
everything-get-env()
→ 確認環境變數是否正確傳入（例如 REDIS_URL 是否存在）
```

### 2. 測試 MCP 客戶端連線
```
everything-echo(message="Hello MCP")
→ 確認 MCP server 正常回應
```

### 3. 除錯 MCP 設定問題
```
// 如果懷疑某個 MCP 工具無回應，先用 everything-echo 確認 MCP 通訊正常
everything-echo(message="test")
→ 若成功，問題在特定 MCP server；若失敗，問題在 MCP 客戶端
```

### 4. 取得結構化資料範例
```
everything-get-structured-content(location="New York")
→ 返回結構化 JSON 內容 + JSON Schema（展示 structured output 功能）
```

## 注意事項

- `everything` 是測試/展示工具，**不適合**生產環境的實際任務
- 主要用於：MCP 設定驗證、協定除錯、客戶端開發測試
- `everything-get-env` 可以確認 Coding Agent 是否正確接收到 `COPILOT_MCP_*` secrets
