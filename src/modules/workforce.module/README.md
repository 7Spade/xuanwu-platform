# workforce.module

**Bounded Context:** Workforce Scheduling  
**Layer:** Bridge (SaaS ↔ Workspace)

## Purpose

`workforce.module` is the Bridge context between the SaaS layer and the Workspace layer.
It answers the question: **"Who is doing the work, when, and at what capacity?"**

It handles workforce capacity planning, scheduling, and allocation of accounts to workspace work items.

> **Boundary vs `workspace.module`:**  
> `workforce.module` = "Who does what, and when?" (scheduling, capacity, person-to-work allocation)  
> `workspace.module` = "What is the workspace and what work is planned?" (project scope, structure, WBS, issues)  
>  
> Assigning a person to a task / planning capacity for a sprint → `workforce.module`  
> Creating a task / issue / WBS item / workspace settings → `workspace.module`  
>  
> Note: This module bridges SaaS accounts (people, HR) with workspace work items (tasks, milestones). Neither `workspace.module` nor `account.module` owns allocation scheduling.

## What this module owns

| Concern | Description |
|---------|-------------|
| WorkforceSchedule | Capacity plan for an org account's members |
| WorkAllocation | Assignment of an account to workspace work items |
| CapacityConstraint | Limits on how much work can be assigned per period |

## What this module does NOT own

| Concern | Owned by |
|---------|----------|
| Workspace settings / access control | `workspace.module` |
| Work items / milestones definition | `work.module` |
| Account / membership governance | `account.module` |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `account.module` | → | Members being scheduled are Accounts |
| `workspace.module` | → | Work is scoped to a workspace |
| `work.module` | → | Allocations reference Work Items |

## Standard 4-layer structure

```
workforce.module/
├── index.ts
├── domain.workforce/
│   ├── _entity.ts
│   ├── _value-objects.ts
│   ├── _ports.ts
│   └── _events.ts
├── core/
├── infra.firestore/
└── _components/
```

## Domain Governance（必填）

### 1. 上下文邊界（Bounded Context）
- 本模組邊界：**Workforce / 人力排程與能力匹配**。
- 僅允許透過 `src/modules/workforce.module/index.ts` 對外暴露能力；禁止跨模組直連 `core/`、`domain.*`、`infra.*`、`_components/`。

### 2. 核心域與支撐域識別
- 本模組定位：**核心域**。
- 核心能力放在 `domain.*` + `core/`；跨域整合、通知、搜尋等配套能力視為支撐能力，由應用層編排。

### 3. 上下文映射（Context Mapping）
- 主要上下游關聯：**Workspace、Account、Settlement**。
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
