# src/modules/

`src/modules/` は **Domain Modules（領域模組）** の集合です。

各モジュールは独立した **Bounded Context（境界付けられたコンテキスト）** であり、
4層の Modular DDD アーキテクチャに従います。

---

## Module とは / What is a Module?

```
src/modules/
└── <module-name>.module/          # Bounded Context の単位
    ├── index.ts                   # 🚪 Public API（バレル export のみ）
    │
    ├── domain.<aggregate>/        # 🧠 Domain Layer（純粋なビジネスロジック）
    │   ├── _entity.ts             #    Aggregate Root / Entity
    │   ├── _value-objects.ts      #    Value Objects（不変・自己検証）
    │   ├── _ports.ts              #    Port Interfaces（リポジトリ・イベントバス）
    │   ├── _events.ts             #    Domain Events
    │   └── _service.ts            #    Domain Service（複数集約にまたがるロジック）
    │
    ├── core/                      # ⚙️  Application Layer（ユースケース層）
    │   ├── _use-cases.ts          #    Use Case（Aggregate 操作のオーケストレーション）
    │   ├── _actions.ts            #    Next.js Server Actions（'use server' ミューテーション）
    │   └── _queries.ts            #    Server Queries（読み取り操作 + DTO 型定義）
    │
    ├── infra.<adapter>/           # 🔌 Infrastructure Layer（具体的 I/O 実装）
    │   ├── _repository.ts         #    IRepository ポートの Firestore 実装
    │   └── _mapper.ts             #    Firestore Doc ↔ Entity 変換
    │
    └── _components/               # 🎨 Presentation Layer（UI コンポーネント）
        └── <ComponentName>.tsx    #    Server / Client コンポーネント
```

---

## 4-Layer Architecture / 4層アーキテクチャ

```
Presentation  (_components/, src/app/)
      │  calls via DTOs
      ▼
Application   (core/_actions.ts, core/_queries.ts, core/_use-cases.ts)
      │  delegates domain logic, calls via ports
      ▼
Domain        (domain.*/_entity.ts, _value-objects.ts, _ports.ts, _events.ts, _service.ts)
      ▲  implements
      │
Infrastructure (infra.<adapter>/_repository.ts)
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Domain** | `domain.<aggregate>/` | Entities, Value Objects, Aggregates, Domain Events, Port Interfaces, Domain Services. **Pure — no I/O, no framework imports.** |
| **Application** | `core/` | Use cases, Server Actions, Queries, DTOs. Orchestrates: load → apply domain logic → persist via port → emit event. |
| **Infrastructure** | `infra.<adapter>/` | Firestore, Storage, Genkit, external API adapters. Implements port interfaces defined in Domain. |
| **Presentation** | `_components/` | React Server / Client components. Calls Application layer only via DTOs. |

---

## Module Directory Naming Convention / 命名規則

| Pattern | Meaning |
|---------|---------|
| `<name>.module/` | Bounded Context / Domain Module ルートディレクトリ |
| `domain.<aggregate>/` | 集約名（例: `domain.org`, `domain.wbs`） |
| `infra.<adapter>/` | アダプター名（例: `infra.firestore`, `infra.genkit`） |
| `core/` | Application Layer（ユースケース、アクション、クエリ） |
| `_components/` | Presentation Layer（UI コンポーネント） |

---

## Dependency Rules / 依存関係ルール

```typescript
// ✅ Correct: Presentation → Application (via index.ts barrel)
import { createOrgAction } from '@/modules/org.module'

// ✅ Correct: Application → Domain (same module)
import { OrgEntity } from '../domain.org/_entity'

// ✅ Correct: Application → Port interface (same module)
import type { IOrganizationRepository } from '../domain.org/_ports'

// ✅ Correct: Infrastructure implements Domain port
import type { IOrganizationRepository } from '../domain.org/_ports'
export class FirestoreOrgRepository implements IOrganizationRepository { ... }

// ❌ Forbidden: Presentation → Domain directly
import { OrgEntity } from '@/modules/org.module/domain.org/_entity'

// ❌ Forbidden: Domain → Application or Infrastructure
import { createOrgUseCase } from '../core/_use-cases'

// ❌ Forbidden: Application → Infrastructure directly (use ports)
import { FirestoreOrgRepository } from '../infra.firestore/_repository'

// ❌ Forbidden: Cross-module internal import (use index.ts barrel)
import { WorkspaceEntity } from '@/modules/workspace.module/domain.workspace/_entity'
```

---

## Public API Rule / バレル export ルール

```typescript
// ✅ src/modules/<name>.module/index.ts — public API
export { createOrgAction, createTeamAction } from './core/_actions'
export { getOrgByIdQuery, getTeamsByOrgQuery } from './core/_queries'
export type { OrgDTO, TeamDTO } from './core/_queries'

// ❌ NEVER export: entities, value objects, repositories, domain events
```

---

## Cross-Layer Communication Pattern / レイヤー間通信

```
UI Action (React component / form)
  └─> Server Action [Application: core/_actions.ts]
        └─> Use Case [Application: core/_use-cases.ts]
              ├─> Load Aggregate via IRepository port  [Domain port interface]
              │         ↑ implemented by [Infrastructure: infra.<adapter>/_repository.ts]
              ├─> Apply business rule on Aggregate      [Domain: _entity.ts]
              ├─> Persist via IRepository.save()        [Infrastructure via port]
              └─> Emit DomainEvent via IEventBus port   [Infrastructure via port]
```

---

## Domain Modules in this Project / 本プロジェクトの Domain Modules

| Module | Layer | Bounded Context |
|--------|-------|----------------|
| `identity.module/` | SaaS (cross-cutting) | Identity · Authentication · Sessions · Credentials (replaces raw Firebase Auth) |
| `account.module/` | SaaS | Unified Account entity (AccountType: personal \| organization) · Public profile · Team + Membership governance |
| `namespace.module/` | SaaS | Namespace (shared: org account namespaces + personal account namespaces) |
| `workspace.module/` | Workspace | Workspace · WBS · Issue · CR · QA · Acceptance · Baseline |
| `file.module/` | Workspace | File · FileVersion · Document Intelligence (DocParse · ObjExtract) |
| `work.module/` | Workspace | Work Items · Milestones · Dependencies |
| `fork.module/` | Workspace | Fork Network (planning branches · merge-back proposals) |
| `workforce.module/` | Bridge | Workforce Scheduling (SaaS ↔ Workspace) |
| `settlement.module/` | SaaS | Settlement · AR · AP |
| `notification.module/` | SaaS (cross-cutting) | Notification Engine · Inbox · Email · Mobile Push |
| `social.module/` | SaaS | Social Graph (Star/Watch/Follow) · Feed · Dashboard · Discovery |
| `achievement.module/` | SaaS | Achievement Rules · Badge Unlocking (projected to account.module) |
| `collaboration.module/` | Workspace (cross-cutting) | Comments · Reactions · Presence · Co-editing sessions |
| `search.module/` | SaaS (cross-cutting) | Full-text + semantic search index · Unified query surface |
| `audit.module/` | SaaS (cross-cutting) | Audit trail (immutable) · Policy automation (Sec) · Compliance reports |
| `causal-graph.module/` | SaaS / Workspace (cross-cutting) | Causal Graph · Impact Analysis · CausalPath query |

> Each module folder contains a `README.md` documenting its bounded context, aggregates, and cross-module dependencies.
> 
> **Removed modules:** `org.module` (→ `account.module`), `profile.module` (→ `account.module`), `feature.module` (removed — too vague to locate clearly as a BC; runtime feature flags belong in `src/infrastructure/` or Firebase Remote Config).

---

## Future Candidate Modules (Add Only When Ready) / 未來候選模組（達到條件才可直接新增）

以下模組目前屬於「條件式新增」。
只有當現有模組已出現明確的職責過載、邊界混雜或基礎能力需求時，才建議拆分為獨立 Domain Module。

| Candidate Module | Add When...（新增條件） | Definition（定義） | Importance（重要性） |
|---|---|---|---|
| `subscription.module` (訂閱與計費) | SaaS 訂閱方案（Free/Pro/Enterprise）、配額治理（Quotas）、付款流程已成為獨立產品能力，且不再只是 `settlement.module` 的延伸帳務欄位。 | 專責 Subscription Plan、Billing Cycle、Quota Policy、Payment Provider Integration。`settlement.module` 保持 AR/AP 會計帳務核心。 | 避免把產品計費策略與會計帳務耦合在同一模型，提升演進與合規可維護性。 |
| `governance.module` (權限與策略) | 權限邏輯明顯複雜化（例如跨組織自定義角色、策略組合、細粒度授權矩陣），導致 `account.module` 承擔過多授權規則。 | 專責角色模型、政策規則（Policy）、授權決策（Authorization Decision）、跨組織治理邏輯。 | 維持 `account.module` 單一職責，避免身份/帳戶邏輯與授權策略高度耦合。 |
| `knowledge.module` (核心知識領域) | 系統開始以知識條目與知識卡片為核心資產，且需要清楚版本演進與不可變歷史。 | 負責 Articles、Zettelkasten Notes、Knowledge Revision Graph。 | 知識庫的核心領域，確保知識原子性與不可變性。 |
| `taxonomy.module` (分類與標籤領域) | 全域與空間層級的分類、詞彙管理需求持續擴大，且命名一致性已成為系統痛點。 | 管理 Taxonomies、Tags、受控詞表（Ontologies）、命名規範。 | 維持語義一致性，降低重複命名與知識檢索歧義。 |
| `vector-ingestion.module` (向量化與處理領域) | RAG 流程（Chunking、Embedding、Index Push、回補重建）成為穩定工作流，且需要明確隔離外部模型與索引供應商。 | 專責文件切片、向量化處理、透過 `IVectorIndexPort` 推送向量索引，並以 ACL 封裝外部模型/服務。 | 企業知識庫 AI 檢索的關鍵能力，確保可替換性、安全隔離與可觀測性。 |

### Split Heuristics / 拆分啟動準則

- 權責準則：單一模組同時承擔 2 種以上獨立變更軸（例如帳務 + 產品計費策略）。
- 複雜度準則：核心規則需要獨立語言（Ubiquitous Language）與事件模型才能保持可維護。
- 邊界準則：跨模組依賴持續增加，且已難以透過現有 public barrel API 維持清晰邊界。
- 整合準則：外部供應商整合（支付、向量 DB、模型服務）需要獨立 ACL 以降低耦合與風險。

---

## Authoritative References / 参照ドキュメント

- Architecture SSOT: [`docs/architecture/README.md`](../../docs/architecture/README.md)
- Business Entities: [`docs/architecture/catalog/business-entities.md`](../../docs/architecture/catalog/business-entities.md)
- Service Boundary: [`docs/architecture/catalog/service-boundary.md`](../../docs/architecture/catalog/service-boundary.md)
- Event Catalog: [`docs/architecture/catalog/event-catalog.md`](../../docs/architecture/catalog/event-catalog.md)
