# Modules File Index — Master Index

> 主索引請見：[../ INDEX.md](../INDEX.md)（涵蓋 app、shared、design-system、infrastructure、modules 所有區域）

每個 Domain Module 的完整 `.ts` 檔案索引。詳細內容請參閱各模組子文件。

## 模組清單

| 模組 | 記憶檔案 | 主要職責 |
|------|----------|----------|
| `identity.module` | [identity.md](./identity.md) | 身份驗證（登入/登出/session/密碼重置） |
| `account.module` | [account.md](./account.md) | 帳號資料（profile/handle/team/membership/MemberRole） |
| `workspace.module` | [workspace.md](./workspace.md) | 專案規劃/WBS/範圍/存取控制 |
| `namespace.module` | [namespace.md](./namespace.md) | URL slug 命名空間/路徑解析 |
| `workforce.module` | [workforce.md](./workforce.md) | 排班/容量/指派排程 |
| `settlement.module` | [settlement.md](./settlement.md) | 財務結算/請款/付款生命週期 |
| `notification.module` | [notification.md](./notification.md) | 通知送達/收件匣/multi-channel |
| `audit.module` | [audit.md](./audit.md) | 稽核日誌（append-only） |
| `work.module` | [work.md](./work.md) | 工作項目/里程碑/任務依賴 |
| `file.module` | [file.md](./file.md) | 檔案上傳/版本/文件解析 |
| `search.module` | [search.md](./search.md) | 全文搜尋索引與查詢 |
| `causal-graph.module` | [causal-graph.md](./causal-graph.md) | 因果圖節點/邊/影響範圍分析 |
| `governance.module` | [governance.md](./governance.md) | 治理規則/政策執行 — scaffold |
| `knowledge.module` | [knowledge.md](./knowledge.md) | 知識庫/文件庫 — scaffold |
| `subscription.module` | [subscription.md](./subscription.md) | 訂閱方案/計費週期 — scaffold |
| `taxonomy.module` | [taxonomy.md](./taxonomy.md) | 標籤分類法/標籤層級 — scaffold |
| `vector-ingestion.module` | [vector-ingestion.md](./vector-ingestion.md) | 向量嵌入管線/語意搜尋 — scaffold |
| `social.module` | [social.md](./social.md) | 社交關係（star/watch/follow） |
| `achievement.module` | [achievement.md](./achievement.md) | 成就/徽章解鎖（XP） |
| `collaboration.module` | [collaboration.md](./collaboration.md) | 評論/協作（artifact 層級） |
| `fork.module` | [fork.md](./fork.md) | Workspace 分叉/合併/廢棄 |

## 每個模組的標準檔案結構

```
src/modules/{name}.module/
├── index.ts                          # 公開 API barrel（DTOs + 用例 + Port 介面）
├── core/
│   ├── _use-cases.ts                 # 與框架無關的用例，回傳 Result<T>
│   ├── _actions.ts                   # 'use server' 薄包裝層
│   └── _queries.ts                   # 查詢重新匯出
├── domain.{name}/
│   ├── _value-objects.ts             # Zod 驗證的 Branded Types
│   ├── _entity.ts                    # Aggregate Root + factory helpers
│   ├── _events.ts                    # Domain Event union 型別
│   ├── _ports.ts                     # Repository + Specialty Port 介面
│   └── _service.ts                   # Domain Service 描述（跨 aggregate 邏輯）
└── infra.firestore/
    ├── _repository.ts                # IRepository 實作（Firebase Admin SDK）
    └── _mapper.ts                    # Firestore doc ↔ Entity 轉換
```

## 層次依賴方向

```
Presentation → Application (core/) → Domain (domain.*/) ← Infrastructure (infra.*)
```

- `index.ts` 只匯出 DTOs、用例函數、Port 介面。**不匯出** Entity、VO、Domain Events。
- `_actions.ts` 加上 `'use server'` 標記，作為 Next.js Server Actions 入口。
- `_queries.ts` 重新匯出唯讀查詢函數，供 React Server Components 直接呼叫。
- `infra.firestore/` 實作 `domain.*/_ports.ts` 定義的介面，不含業務邏輯。
