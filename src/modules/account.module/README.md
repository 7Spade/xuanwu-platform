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
