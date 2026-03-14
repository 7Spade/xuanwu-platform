# feature.module

**Bounded Context:** Feature Flags · Rollout Management / 功能開關 · 功能推出管理  
**Layer:** SaaS (cross-cutting)

## Purpose

`feature.module` manages runtime feature flags that control whether a specific capability
is visible or executable for a given actor (Account, identity, workspace, or globally).

Feature flags decouple **deployment** from **release** — a feature can be deployed to
production but only enabled for a subset of accounts (staff preview, beta, canary rollout,
A/B test, or kill-switch).

> **Key distinction from `account.module` (Plan/Subscription):**  
> Entitlements based on *plan* live in `account.module`.  
> Operational toggles controlled by *engineering or product ops at runtime* live here.
> Example: `new-editor-ui` flag enabled for 20% of accounts regardless of plan tier.

## What this module owns

| Concern | Description |
|---------|-------------|
| FeatureFlag | Declared flag with key, default state, and rollout strategy |
| FlagRule | Targeting rule: percentage, account list, account type, workspace, environment |
| FlagEvaluation | Deterministic ON/OFF result for a given actor context |
| FlagAuditEntry | Append-only log of flag state changes (projected to `audit.module`) |

## What this module does NOT own

| Concern | Correct module |
|---------|----------------|
| Plan / Subscription gating | `account.module` |
| Permission / Role enforcement | `identity.module` (JWT claims) |
| Analytics / experiment results | external analytics service or future `analytics.module` |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `identity.module` | → | Resolve actor IdentityId for evaluation context |
| `account.module` | → | Resolve AccountType / Plan for targeting rules |
| `audit.module` | ← | Flag state changes published as domain events |

## Standard 4-layer structure

```
feature.module/
├── index.ts
├── domain.feature/
│   ├── _entity.ts               # FeatureFlag · FlagRule
│   ├── _value-objects.ts        # FlagKey · FlagState · RolloutStrategy · EvaluationContext
│   ├── _ports.ts                # IFeatureFlagRepository · IFlagEvaluator
│   └── _events.ts               # FlagStateChanged · FlagRuleUpdated
├── core/
│   ├── _use-cases.ts            # EvaluateFlagUseCase · SetFlagStateUseCase · CreateFlagUseCase
│   ├── _actions.ts
│   └── _queries.ts
├── infra.firestore/
│   ├── _repository.ts
│   └── _mapper.ts
└── _components/
```
