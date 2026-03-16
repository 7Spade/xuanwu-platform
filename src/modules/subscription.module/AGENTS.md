# subscription.module Agent Rules

Purpose: document automation boundaries for `subscription.module` and keep DDD layer direction intact.

## 邊界簡述
- Bounded Context：**Subscription / 訂閱、配額、方案生命週期**
- 模組定位：**支撐域**
- 核心責任：維持本域規則與契約，不外溢到他模組。

## 自動化任務 / Agent 說明
1. 新增或修改功能時，先確認規則屬於本模組上下文邊界。
2. 變更流程時，優先更新 `domain.*` / `core/`，再調整 `infra.*` 與 `_components/`。
3. 跨模組需求只能使用對方 `index.ts` 公開 API 或事件契約。
4. 外部資料整合須經由 ACL（mapper/adapter），禁止將外部格式直接帶入 Domain。

## 依賴方向與圖
```
Presentation (_components/ or src/app)
        ↓
Application (core/)
        ↓
Domain (domain.*)
        ↑
Infrastructure (infra.* implements ports)
```

Context mapping (high-level):
`subscription.module` ↔ Account、Settlement、Governance

## 防線（Hard Rules）
- 禁止從其他模組直接 import 內部路徑（`core/*`, `domain.*/*`, `infra.*/*`, `_components/*`）。
- 禁止在 Domain 層引入 I/O、SDK、framework side effects。
- 禁止在 Infrastructure 層編寫業務規則。
- 禁止在 Presentation 層直接呼叫 Firebase / Upstash SDK。

## 模組契約檢查清單
- [ ] 上下文邊界是否清楚（Bounded Context）
- [ ] 核心域 / 支撐域分類是否維持一致
- [ ] Context Mapping 是否僅透過契約互動
- [ ] ACL 是否隔離外部資料模型
- [ ] 核心業務邏輯是否只在 Domain/Application
- [ ] 操作流程是否符合 Presentation → Application → Domain ← Infrastructure
- [ ] 模組間契約（DTO / Event）是否向後相容
