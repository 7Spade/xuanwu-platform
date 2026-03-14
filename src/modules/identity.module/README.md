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
