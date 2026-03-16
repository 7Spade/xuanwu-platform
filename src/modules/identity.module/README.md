# identity.module

**Bounded Context:** Identity · Authentication / 身份識別 · 驗證  
**Layer:** SaaS (cross-cutting)

## Purpose

`identity.module` is the **authentication** boundary for the platform.
It answers the question: **"Are you who you claim to be?"**

It manages credentials, sessions, identity providers, and JWT auth claims
for **any** account type — personal or organization.

It replaces direct Firebase Auth SDK usage throughout the codebase.
All sign-in, sign-out, and session-refresh operations are mediated through this module's Application layer.

> **Boundary vs `account.module`:**  
> `identity.module` = "How do you prove you are you?" (authentication: login, logout, session, tokens, providers)  
> `account.module` = "What is your account?" (profile, handle, team, membership — the data that belongs to you after you've proven who you are)  
>  
> Login / logout / password reset / provider linking → `identity.module`  
> Display name / avatar / organization membership / team role → `account.module`

## What this module owns

| Concern | Description |
|---------|-------------|
| IdentityProvider | Firebase, Google, GitHub, Email |
| Session | Creation, refresh, revocation |
| AuthClaims | JWT custom claims (accountId, accountType, role) |
| ProviderLinking | Attaching additional providers to an account |
| PasswordReset | Password reset (unauthenticated forgot-password flow) and password change (authenticated user changing their own password) |

## What this module does NOT own

| Concern | Owned by |
|---------|----------|
| Account entity (name, avatar, handle) | `account.module` |
| Authorization (role-based access control) | `account.module` (MemberRole) + `audit.module` (policy) |
| User-visible profile data | `account.module` |
| Team / Membership governance | `account.module` |

## Key aggregate

`Identity` — authentication record keyed by (provider, providerUid), linked to one Account.

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `account.module` | → | Identity is linked to one Account (creates Account on first registration) |

## Standard 4-layer structure

```
identity.module/
├── index.ts                     # Public API barrel
├── domain.identity/
│   ├── _entity.ts               # Identity aggregate root
│   ├── _value-objects.ts        # IdentityId, IdentityProvider, SessionToken, AuthClaims
│   ├── _ports.ts                # IIdentityRepository, IAuthProviderPort, ISessionPort
│   └── _events.ts               # IdentityRegistered, IdentitySignedIn, SessionRevoked
├── core/
│   ├── _use-cases.ts            # RegisterIdentityUseCase, SignInUseCase, SignOutUseCase …
│   ├── _actions.ts              # signInAction, signOutAction, linkProviderAction
│   └── _queries.ts              # getCurrentIdentityQuery, getSessionStatusQuery
├── infra.firestore/
│   ├── _repository.ts           # Implements IIdentityRepository + IAuthProviderPort
│   └── _mapper.ts               # Firestore doc ↔ IdentityEntity
└── _components/                 # Sign-in UI components (future)
```

## Domain Governance（必填）

### 1. 上下文邊界（Bounded Context）
- 本模組邊界：**Identity / 驗證、Session、Credential**。
- 僅允許透過 `src/modules/identity.module/index.ts` 對外暴露能力；禁止跨模組直連 `core/`、`domain.*`、`infra.*`、`_components/`。

### 2. 核心域與支撐域識別
- 本模組定位：**核心域**。
- 核心能力放在 `domain.*` + `core/`；跨域整合、通知、搜尋等配套能力視為支撐能力，由應用層編排。

### 3. 上下文映射（Context Mapping）
- 主要上下游關聯：**Account、Namespace、Governance**。
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
