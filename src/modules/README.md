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
Domain        (domain.*/_entity.ts, _value-objects.ts, _ports.ts, _events.ts)
      ▲  implements
      │
Infrastructure (infra.<adapter>/_repository.ts)
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Domain** | `domain.<aggregate>/` | Entities, Value Objects, Aggregates, Domain Events, Port Interfaces. **Pure — no I/O, no framework imports.** |
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
| `feature.module/` | SaaS (cross-cutting) | Feature Flags · Rollout Management · Kill-switch |
| `causal-graph.module/` | SaaS / Workspace (cross-cutting) | Causal Graph · Impact Analysis · CausalPath query |

> Each module folder contains a `README.md` documenting its bounded context, aggregates, and cross-module dependencies.

---

## Authoritative References / 参照ドキュメント

- Architecture SSOT: [`docs/architecture/README.md`](../../docs/architecture/README.md)
- Business Entities: [`docs/architecture/catalog/business-entities.md`](../../docs/architecture/catalog/business-entities.md)
- Service Boundary: [`docs/architecture/catalog/service-boundary.md`](../../docs/architecture/catalog/service-boundary.md)
- Event Catalog: [`docs/architecture/catalog/event-catalog.md`](../../docs/architecture/catalog/event-catalog.md)
