# work.module

**Bounded Context:** Work Items · Milestones · Dependencies  
**Layer:** Workspace

## Purpose

`work.module` manages the Work Item layer — tasks, milestones, and dependency tracking.
This is distinct from WBS Tasks in `workspace.module`: Work Items represent the execution
layer with assignments, status tracking, and inter-item dependencies.

## What this module owns

| Concern | Description |
|---------|-------------|
| WorkItem | Assignable unit of work with status, priority, and estimates |
| Milestone | Date-bound delivery checkpoint grouping Work Items |
| Dependency | Directional relationship between Work Items (blocks / depends-on) |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `workspace.module` | → | Work Items live within a workspace context |
| `account.module` | → | Work Items are assigned to Accounts |
| `collaboration.module` | ← | Comments anchor to Work Items |
| `notification.module` | ← | Assignment and status change events trigger notifications |

## Standard 4-layer structure

```
work.module/
├── index.ts
├── domain.work/
│   ├── _entity.ts               # WorkItem + Milestone + Dependency
│   ├── _value-objects.ts
│   ├── _ports.ts
│   └── _events.ts
├── core/
├── infra.firestore/
└── _components/
```

## Domain Governance（必填）

### 1. 上下文邊界（Bounded Context）
- 本模組邊界：**Work / 任務、里程碑、依賴**。
- 僅允許透過 `src/modules/work.module/index.ts` 對外暴露能力；禁止跨模組直連 `core/`、`domain.*`、`infra.*`、`_components/`。

### 2. 核心域與支撐域識別
- 本模組定位：**核心域**。
- 核心能力放在 `domain.*` + `core/`；跨域整合、通知、搜尋等配套能力視為支撐能力，由應用層編排。

### 3. 上下文映射（Context Mapping）
- 主要上下游關聯：**Workspace、Collaboration、Audit**。
- 跨上下文資料交換需使用 DTO／事件，不共享對方內部實體。

### 4. 防腐層（Anti-Corruption Layer）
- 外部系統（Firebase / Upstash / 外部 API）必須封裝在 `infra.*`。
- 使用 Mapper / Adapter 將外部資料格式轉換為本域 Value Object 與 Entity，避免污染領域模型。

### 5. 核心業務邏輯
- 不變條件（invariants）與規則放在 `domain.*`（Entity / VO / Domain Service）。
- `core/_use-cases.ts` 僅做流程協調：載入 → 套用規則 → 透過 Port 持久化 → 發布事件。

### 6. 操作流程
1. Presentation（`_components/` 或 `src/app`）呼叫模組公開 Action/Query。
2. Application（`core/`）執行用例並調用 Domain。
3. Domain 計算狀態變更與事件。
4. Infrastructure（`infra.*`）透過 Port 落地 I/O。

### 7. 模組間契約
- 同步契約：`index.ts` 匯出的 Action / Query / DTO。
- 非同步契約：Domain Event payload（版本化、向後相容）。
- 契約變更需先更新 README 與呼叫端，避免破壞既有流程。
