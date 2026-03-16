# account.module

**Bounded Context:** Account / 帳戶  
**Layer:** SaaS

## Purpose

`account.module` provides the unified Account entity for the platform.
It answers the question: **"What is your account and what do you own?"**

`AccountType: personal | organization` — a single model covers both personal user accounts and organization accounts.

Previously, User and Organization were separate identity concepts. This module unifies them and also absorbs the organization operational concerns (Teams, Membership governance) that were previously in the removed `org.module`.

> **Boundary vs `identity.module`:**  
> `account.module` = "What is your account?" (profile data, handle, team structure, membership roles — the **data** that belongs to you)  
> `identity.module` = "How do you prove you are you?" (auth credentials, sessions, login/logout, password — the **authentication mechanism**)  
>  
> Display name / avatar / organization / team / member role → `account.module`  
> Sign in / sign out / session token / provider linking → `identity.module`

## What this module owns

| Concern | Description |
|---------|-------------|
| Account entity | Unified personal/org account with handle, profile, settings |
| AccountProfile | Public surface: display name, avatar, bio, badges |
| Team | Sub-aggregate for org accounts: team creation and management |
| Membership | Invitation, role assignment (owner/admin/member/viewer), revocation |
| MemberRole | Role assignment within an org: owner/admin/member/viewer (data structure; policy *enforcement* is `audit.module`) |
| Badge projection | Receives badge unlocks from `achievement.module` via `IAccountBadgeWritePort` |

## What this module does NOT own

| Concern | Owned by |
|---------|----------|
| Auth credentials / sessions / password | `identity.module` |
| Sign-in / sign-out / provider linking | `identity.module` |
| Namespace slug registration | `namespace.module` |
| Social graph (follow, star) | `social.module` |
| Badge rule evaluation | `achievement.module` |
| Audit / compliance policy enforcement | `audit.module` |

## Key aggregates

- `Account` — root aggregate; contains `AccountProfile`, `Team[]`, `Membership[]` (org only)
- `Team` — sub-aggregate of an org Account
- `Membership` — sub-aggregate tracking member roles within an org Account

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `identity.module` | ← | Identity links to this Account |
| `namespace.module` | ← | Namespace slug is owned by this Account |
| `achievement.module` | ← | Writes badge unlocks via IAccountBadgeWritePort |
| `social.module` | ← | Reads public profile via IAccountSocialReadPort |
| `collaboration.module` | ← | @mentions resolve to Account handles |
| `audit.module` | ← | Actor references resolve to Account handles |

## Standard 4-layer structure

```
account.module/
├── index.ts                     # Public API barrel
├── domain.account/
│   ├── _entity.ts               # Account aggregate root + Team + Membership sub-aggregates
│   ├── _value-objects.ts        # AccountId, AccountHandle, AccountType, TeamId, MemberRole …
│   ├── _ports.ts                # IAccountRepository, ITeamRepository, IMembershipRepository …
│   └── _events.ts               # PersonalAccountCreated, OrganizationAccountCreated, TeamCreated …
├── core/
│   ├── _use-cases.ts            # CreatePersonalAccountUseCase, CreateTeamUseCase, AddTeamMemberUseCase …
│   ├── _actions.ts              # createOrgAccountAction, updateProfileAction, addMemberAction
│   └── _queries.ts              # getAccountByHandleQuery, getTeamsByOrgQuery, getMembersQuery
├── infra.firestore/
│   ├── _repository.ts           # Implements IAccountRepository, ITeamRepository, IMembershipRepository
│   └── _mapper.ts               # Firestore doc ↔ AccountEntity / TeamEntity / MembershipEntity
└── _components/                 # Account settings, team management UI (future)
```

## Domain Governance（必填）

### 1. 上下文邊界（Bounded Context）
- 本模組邊界：**Account / 帳戶治理與身分關聯**。
- 僅允許透過 `src/modules/account.module/index.ts` 對外暴露能力；禁止跨模組直連 `core/`、`domain.*`、`infra.*`、`_components/`。

### 2. 核心域與支撐域識別
- 本模組定位：**核心域**。
- 核心能力放在 `domain.*` + `core/`；跨域整合、通知、搜尋等配套能力視為支撐能力，由應用層編排。

### 3. 上下文映射（Context Mapping）
- 主要上下游關聯：**Identity、Namespace、Workspace、Settlement、Audit、Notification**。
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
