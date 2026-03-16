# src/modules/

`src/modules/` is the collection of all **Domain Modules（領域模組）**.

Each module is an independent **Bounded Context（限界上下文）** following
the 4-layer Modular DDD architecture.

---

## What is a Module? / 什麼是 Module？

```
src/modules/
└── <module-name>.module/          # Bounded Context root / 限界上下文根目錄
    ├── index.ts                   # 🚪 Public API (barrel exports only / 僅作匯出桶)
    │
    ├── domain.<aggregate>/        # 🧠 Domain Layer (pure business logic / 純業務邏輯)
    │   ├── _entity.ts             #    Aggregate Root / Entity（聚合根 / 實體）
    │   ├── _value-objects.ts      #    Value Objects (immutable, self-validating / 不可變、自我驗證)
    │   ├── _ports.ts              #    Port Interfaces (repository, event bus / 儲存庫、事件匯流排)
    │   ├── _events.ts             #    Domain Events（領域事件）
    │   └── _service.ts            #    Domain Service (cross-aggregate logic / 跨聚合邏輯)
    │
    ├── core/                      # ⚙️  Application Layer (use case orchestration / 用例層)
    │   ├── _use-cases.ts          #    Use Cases (aggregate orchestration / 聚合操作協調)
    │   ├── _actions.ts            #    Next.js Server Actions ('use server' mutations / 變更操作)
    │   └── _queries.ts            #    Server Queries (read ops + DTO types / 讀取操作與 DTO)
    │
    ├── infra.<adapter>/           # 🔌 Infrastructure Layer (concrete I/O / 具體 I/O 實作)
    │   ├── _repository.ts         #    Firestore impl of IRepository port（Port 的 Firestore 實作）
    │   └── _mapper.ts             #    Firestore Doc ↔ Entity conversion（文件 ↔ 實體轉換）
    │
    └── _components/               # 🎨 Presentation Layer (UI components / UI 元件)
        └── <ComponentName>.tsx    #    Server / Client components（伺服器 / 客戶端元件）
```

---

## 4-Layer Architecture / 4 層架構

```
Presentation  (_components/, src/app/)
      │  calls via DTOs / 透過 DTO 呼叫
      ▼
Application   (core/_actions.ts, core/_queries.ts, core/_use-cases.ts)
      │  delegates domain logic, calls via ports / 委派領域邏輯、透過 Port 呼叫
      ▼
Domain        (domain.*/_entity.ts, _value-objects.ts, _ports.ts, _events.ts, _service.ts)
      ▲  implements / 實作
      │
Infrastructure (infra.<adapter>/_repository.ts)
```

| Layer 層次 | Location 位置 | EN Responsibility | 中文職責 |
|-----------|--------------|-------------------|---------|
| **Domain 領域層** | `domain.<aggregate>/` | Entities, Value Objects, Aggregates, Domain Events, Port Interfaces, Domain Services. **Pure — no I/O, no framework imports.** | 實體、值物件、聚合、領域事件、Port 介面、領域服務。**純粹 — 不含 I/O，不引用框架。** |
| **Application 應用層** | `core/` | Use cases, Server Actions, Queries, DTOs. Orchestrates: load → apply domain logic → persist via port → emit event. | 用例、Server Actions、查詢、DTO。協調：載入 → 套用領域邏輯 → 透過 Port 持久化 → 發出事件。 |
| **Infrastructure 基礎設施層** | `infra.<adapter>/` | Firestore, Storage, Genkit, external API adapters. Implements port interfaces defined in Domain. | Firestore、Storage、Genkit、外部 API 適配器。實作 Domain 層定義的 Port 介面。 |
| **Presentation 展示層** | `_components/` | React Server / Client components. Calls Application layer only via DTOs. | React 伺服器 / 客戶端元件。僅透過 DTO 呼叫應用層。 |

---

## Module Directory Naming Convention / 目錄命名規則

| Pattern 模式 | EN Meaning | 中文說明 |
|-------------|-----------|---------|
| `<name>.module/` | Bounded Context / Domain Module root directory | 限界上下文 / 領域模組根目錄 |
| `domain.<aggregate>/` | Aggregate name (e.g. `domain.org`, `domain.wbs`) | 聚合名稱（例：`domain.org`、`domain.wbs`） |
| `infra.<adapter>/` | Adapter name (e.g. `infra.firestore`, `infra.genkit`) | 適配器名稱（例：`infra.firestore`、`infra.genkit`） |
| `core/` | Application Layer (use cases, actions, queries) | 應用層（用例、Server Actions、查詢） |
| `_components/` | Presentation Layer (UI components) | 展示層（UI 元件） |

---

## Dependency Rules / 依賴規則

```typescript
// ✅ Correct / 正確：Presentation → Application (via index.ts barrel)
import { createOrgAction } from '@/modules/org.module'

// ✅ Correct / 正確：Application → Domain (same module / 同模組內)
import { OrgEntity } from '../domain.org/_entity'

// ✅ Correct / 正確：Application → Port interface (same module / 同模組內)
import type { IOrganizationRepository } from '../domain.org/_ports'

// ✅ Correct / 正確：Infrastructure implements Domain port
import type { IOrganizationRepository } from '../domain.org/_ports'
export class FirestoreOrgRepository implements IOrganizationRepository { ... }

// ❌ Forbidden / 禁止：Presentation → Domain directly（展示層不得直接存取領域層）
import { OrgEntity } from '@/modules/org.module/domain.org/_entity'

// ❌ Forbidden / 禁止：Domain → Application or Infrastructure（領域層不得依賴上層）
import { createOrgUseCase } from '../core/_use-cases'

// ❌ Forbidden / 禁止：Application → Infrastructure directly — use ports（應用層應透過 Port，不得直接引用基礎設施）
import { FirestoreOrgRepository } from '../infra.firestore/_repository'

// ❌ Forbidden / 禁止：Cross-module internal import — use index.ts barrel（跨模組必須透過 index.ts 匯出桶）
import { WorkspaceEntity } from '@/modules/workspace.module/domain.workspace/_entity'
```

---

## Public API Rule / 公開 API 規則（匯出桶）

```typescript
// ✅ src/modules/<name>.module/index.ts — public API / 唯一合法的跨模組匯入入口
export { createOrgAction, createTeamAction } from './core/_actions'
export { getOrgByIdQuery, getTeamsByOrgQuery } from './core/_queries'
export type { OrgDTO, TeamDTO } from './core/_queries'

// ❌ NEVER export / 禁止匯出：entities, value objects, repositories, domain events
```

---

## Cross-Layer Communication Pattern / 跨層通信模式

```
UI Action (React component / form)
  └─> Server Action [Application: core/_actions.ts]
        └─> Use Case [Application: core/_use-cases.ts]
              ├─> Load Aggregate via IRepository port  [Domain port / 領域 Port 介面]
              │         ↑ implemented by [Infrastructure: infra.<adapter>/_repository.ts]
              ├─> Apply business rule on Aggregate      [Domain: _entity.ts / 領域規則]
              ├─> Persist via IRepository.save()        [Infrastructure via port / 透過 Port 持久化]
              └─> Emit DomainEvent via IEventBus port   [Infrastructure via port / 透過 Port 發出事件]
```

---

## Bounded Context, Cohesion, Consistency & Event Flow
## 界限上下文、內聚、一致性與事件流

### 1) Bounded Context must be explicit / 界限上下文必須明確

- Each `<name>.module/` is one Bounded Context with a single Ubiquitous Language and single ownership boundary.
- 每個 `<name>.module/` 都是單一 Bounded Context，必須有單一語言模型與單一擁有邊界。
- Cross-context collaboration must go through public APIs (`index.ts`) and documented contracts (DTO / events), never internal files.
- 跨上下文協作只能透過公開 API（`index.ts`）與已文件化契約（DTO / 事件），不得直接引用內部檔案。

### 2) Cohesion and one-way dependency / 上下文內聚與依賴單向

- Keep each context cohesive: business rules that change for the same reason should stay in the same module.
- 維持上下文內聚：會因相同商業原因變更的規則，應留在同一模組。
- Dependency direction is one-way by layer: Presentation → Application → Domain, while Infrastructure implements Domain ports.
- 分層依賴方向必須單向：Presentation → Application → Domain，Infrastructure 僅實作 Domain ports。
- Cross-module imports must use the target module public barrel only; importing `core/`, `domain.*`, or `infra.*` of another module is forbidden.
- 跨模組匯入必須只走對方 public barrel；直接匯入他模組的 `core/`、`domain.*`、`infra.*` 一律禁止。

### 3) Consistency and event flow / 一致性與事件流

- Aggregate invariants are enforced synchronously inside the owning context before persistence.
- 聚合不變量必須在擁有該聚合的上下文內、持久化前同步驗證。
- A use case should follow: load aggregate → apply domain rules → persist state → emit domain event.
- 用例流程應遵循：載入聚合 → 套用領域規則 → 持久化狀態 → 發出領域事件。
- Cross-context effects are integration concerns and should be handled by event subscribers / application orchestration, not by direct domain coupling.
- 跨上下文副作用屬整合責任，應由事件訂閱者或應用層協調處理，不可用直接領域耦合。
- Treat cross-context propagation as eventually consistent unless a documented same-context transactional guarantee exists.
- 跨上下文傳播預設採最終一致性；只有在同一上下文且有明確文件化交易保證時，才視為同步強一致。

---

## Domain Modules in this Project / 本專案 Domain Modules 一覽

| Module 模組 | Layer 層次 | EN Bounded Context | 中文限界上下文 |
|------------|-----------|-------------------|--------------|
| `identity.module/` | SaaS (cross-cutting) | Identity · Authentication · Sessions · Credentials | 身份識別 · 驗證 · 工作階段 · 憑證（取代直接使用 Firebase Auth） |
| `account.module/` | SaaS | Unified Account (personal \| organization) · Profile · Team · Membership | 統一帳戶實體（個人 / 組織）· 公開檔案 · 團隊 · 成員治理 |
| `namespace.module/` | SaaS | Namespace · Slug-to-Account binding · Path resolution | 命名空間 · Slug 綁定帳戶 · 路徑解析 |
| `workspace.module/` | Workspace | Workspace · WBS · Issue · CR · QA · Acceptance · Baseline | 工作區 · WBS · Issue · 變更請求 · QA · 驗收 · 基準 |
| `file.module/` | Workspace | File · FileVersion · Document Intelligence (DocParse · ObjExtract) | 檔案 · 版本管理 · 文件智能（文件解析 · 物件抽取） |
| `work.module/` | Workspace | Work Items · Milestones · Dependencies | 工作項目 · 里程碑 · 依賴關係 |
| `fork.module/` | Workspace | Fork Network · Planning branches · Merge-back proposals | 分叉網路 · 規劃分支 · 合併提案 |
| `workforce.module/` | Bridge (SaaS ↔ Workspace) | Workforce Scheduling · Capacity planning · Person-to-work allocation | 工作力排班 · 人力容量規劃 · 人員配置 |
| `settlement.module/` | SaaS | Settlement · Accounts Receivable · Accounts Payable | 結算 · 應收帳款 · 應付帳款 |
| `notification.module/` | SaaS (cross-cutting) | Notification Engine · Inbox · Email · Mobile Push | 通知引擎 · 收件匣 · 電子郵件 · 行動推播 |
| `social.module/` | SaaS | Social Graph (Follow/Star/Watch) · Feed · Discovery | 社交圖譜（追蹤 / 星標 / 關注）· 動態流 · 探索介面 |
| `achievement.module/` | SaaS | Achievement Rules · Badge Unlocking (projected to account.module) | 成就規則 · 徽章解鎖（投影至 account.module） |
| `collaboration.module/` | Workspace (cross-cutting) | Comments · Reactions · Presence · Co-editing sessions | 討論串留言 · 表情反應 · 即時在線狀態 · 共同編輯工作階段 |
| `search.module/` | SaaS (cross-cutting) | Full-text + semantic search · Unified query surface · Suggestions | 全文 + 語義搜尋 · 統一查詢介面 · 自動完成建議 |
| `audit.module/` | SaaS (cross-cutting) | Audit trail (immutable) · Policy automation · Compliance reports | 不可變稽核記錄 · 政策自動化 · 法規合規報告 |
| `causal-graph.module/` | SaaS / Workspace (cross-cutting) | Causal Graph · Impact Analysis · CausalPath query | 因果圖 · 影響分析 · 因果路徑查詢 |

> Each module folder contains a `README.md` documenting its bounded context, aggregates, and cross-module dependencies.
> 每個模組資料夾均包含 `README.md`，說明其限界上下文、聚合與跨模組依賴。
>
> **Removed modules / 已移除模組：** `org.module` (→ `account.module`)、`profile.module` (→ `account.module`)、`feature.module`（移除 — 職責不明確；執行環境功能旗標應屬於 `src/infrastructure/` 或 Firebase Remote Config）。

---

## Future Candidate Modules / 未來候選模組（達到條件才可新增）

以下模組目前屬於「條件式新增」。
Only add when an existing module shows clear responsibility overload, boundary confusion, or foundational capability demand.
只有當現有模組已出現明確的職責過載、邊界混雜或基礎能力需求時，才建議拆分為獨立 Domain Module。

| Candidate Module 候選模組 | EN: Add When... | 中文新增條件 | EN Definition | 中文定義 |
|--------------------------|----------------|------------|--------------|---------|
| `subscription.module`<br>訂閱與計費 | SaaS subscription plans (Free/Pro/Enterprise), quota governance, and payment flow become independent product capabilities no longer coupled to `settlement.module` accounting fields. | SaaS 訂閱方案、配額治理、付款流程已成為獨立產品能力，不再只是 `settlement.module` 的延伸帳務欄位。 | Owns Subscription Plan, Billing Cycle, Quota Policy, Payment Provider Integration. `settlement.module` retains AR/AP accounting core. | 專責訂閱方案、計費週期、配額政策、支付供應商整合。`settlement.module` 保持 AR/AP 會計帳務核心。 |
| `governance.module`<br>治理 · 授權政策 | Authorization logic grows significantly complex (cross-org custom roles, policy composition, fine-grained authorization matrices), causing `account.module` to absorb too many authorization rules. | 權限邏輯明顯複雜化（跨組織自定義角色、策略組合、細粒度授權矩陣），導致 `account.module` 承擔過多授權規則。 | Owns role models, policy rules, authorization decisions, and cross-org governance logic. | 專責角色模型、政策規則、授權決策、跨組織治理邏輯。 |
| `knowledge.module`<br>核心知識領域 | The system starts treating knowledge entries and knowledge cards as core assets requiring clear version evolution and immutable history. | 系統以知識條目與知識卡片為核心資產，且需要版本演進與不可變歷史記錄。 | Owns Articles, Zettelkasten Notes, Knowledge Revision Graph. | 負責文章、Zettelkasten 知識卡片、知識修訂歷程圖。 |
| `taxonomy.module`<br>分類與標籤領域 | Global and space-level classification and vocabulary management needs grow significantly and naming consistency becomes a system pain point. | 全域與空間層級的分類、詞彙管理需求持續擴大，命名一致性已成系統痛點。 | Manages Taxonomies, Tags, controlled vocabularies (Ontologies), and naming governance. | 管理分類樹、標籤、受控詞表（Ontologies）、命名規範。 |
| `vector-ingestion.module`<br>向量化與處理領域 | The RAG pipeline (Chunking, Embedding, Index Push, backfill rebuild) becomes a stable workflow requiring explicit isolation of external models and index providers. | RAG 流程（分塊、嵌入、索引推送、回補重建）成為穩定工作流，需要明確隔離外部模型與索引供應商。 | Owns document chunking, vectorization, index push via `IVectorIndexPort`, with ACL wrapping external models/services. | 專責文件分塊、向量化處理、透過 `IVectorIndexPort` 推送索引，以 ACL 封裝外部模型 / 服務。 |

### Split Heuristics / 拆分啟動準則

- **Responsibility** — A single module simultaneously carries 2+ independent axes of change (e.g. accounting + product billing strategy). 單一模組同時承擔 2 種以上獨立變更軸。
- **Complexity** — Core rules require an independent Ubiquitous Language and event model to stay maintainable. 核心規則需要獨立語言與事件模型才能保持可維護。
- **Boundary** — Cross-module dependencies keep growing and can no longer be maintained through existing public barrel APIs. 跨模組依賴持續增加，且已難以透過現有 barrel API 維持清晰邊界。
- **Integration** — External provider integrations (payments, vector DB, model services) require independent ACLs to reduce coupling and risk. 外部供應商整合需要獨立 ACL 以降低耦合與風險。

---

## Authoritative References / 權威參考文件

- Architecture SSOT / 架構唯一真相來源: [`docs/architecture/README.md`](../../docs/architecture/README.md)
- Business Entities / 業務實體: [`docs/architecture/catalog/business-entities.md`](../../docs/architecture/catalog/business-entities.md)
- Service Boundary / 服務邊界: [`docs/architecture/catalog/service-boundary.md`](../../docs/architecture/catalog/service-boundary.md)
- Event Catalog / 事件目錄: [`docs/architecture/catalog/event-catalog.md`](../../docs/architecture/catalog/event-catalog.md)
