# MCP: sequential-thinking

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `sequential-thinking` |
| Package | `@modelcontextprotocol/server-sequential-thinking` (npm) |
| Runtime | `npx` |
| GitHub | https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking |

## 功能特性

- **結構化思考鏈**：強制逐步推理，每個 thought 明確編號和關聯
- **動態調整**：可隨時調整預計 thought 總數（`totalThoughts` 可增減）
- **分支思考**：支援從某個 thought 分支出不同路徑（`branchFromThought`）
- **修正機制**：可標記某個 thought 為對前面 thought 的修正（`isRevision`）
- **假設驗證**：可生成解決方案假設，然後驗證假設
- **不確定性表達**：允許在 thought 中表達不確定性和探索性思考

## 工具列表

| 工具 | 用途 |
|------|------|
| `sequential-thinking-sequentialthinking` | 逐步推理（每次呼叫代表一個思考步驟） |

## 工具參數

| 參數 | 說明 |
|------|------|
| `thought` | 當前思考步驟的內容 |
| `thoughtNumber` | 當前步驟編號（從 1 開始） |
| `totalThoughts` | 預計總步驟數（可隨時調整） |
| `nextThoughtNeeded` | 是否需要繼續思考（false = 完成） |
| `isRevision` | 是否修正前面的 thought |
| `revisesThought` | 若 isRevision=true，指定修正哪個 thought |
| `branchFromThought` | 從哪個 thought 分支出新路徑 |
| `branchId` | 分支識別符 |
| `needsMoreThoughts` | 即將結束但需要更多步驟 |

## 應用場景

### 1. 複雜架構決策分析
```
// 決定是否引入 Event Sourcing
thought 1: 分析當前 Firestore 直接寫入的問題
thought 2: 評估 Event Sourcing 的優缺點
thought 3: 考慮本專案規模的合適性
thought 4: 最終建議
```

### 2. 除錯複雜問題
```
// Hydration 錯誤根因分析
thought 1: 確認錯誤訊息和發生位置
thought 2: 分析 Server vs Client 渲染差異
thought 3: 追蹤資料依賴路徑
thought 4: 假設根因
thought 5: 驗證假設（修正 thought 4 如果錯誤）
thought 6: 確認解決方案
```

### 3. 多方案比較
```
// 比較狀態管理方案
thought 1: 列出候選方案（Zustand/Context API/Jotai）
thought 2: 評估 Zustand（分支 A）
thought 3: 評估 Context API（分支 B）
thought 4: 評估 Jotai（分支 C）
thought 5: 綜合比較和最終建議
```

### 4. 演算法設計
```
// 設計資料分頁邏輯
thought 1: 定義問題和邊界條件
thought 2: 設計初步方案
thought 3: 分析 edge cases
thought 4: 優化方案
```

## 何時使用 sequential-thinking

| 適合 | 不適合 |
|------|--------|
| 多步驟推理問題 | 簡單的事實查詢 |
| 需要說明推理過程 | 直接的程式碼生成 |
| 複雜決策需要追蹤 | 明確已知答案的問題 |
| 架構設計和評估 | 快速的 CRUD 操作 |
| 需要假設-驗證循環 | 文件搜尋和查詢 |

## 注意事項

- 當 `nextThoughtNeeded=false` 時代表推理完成，提供最終答案
- `totalThoughts` 只是估計，可以超過，需要時設 `needsMoreThoughts=true`
- 每個 thought 都應該建立在前面 thought 的基礎上，或明確說明為何要修正
