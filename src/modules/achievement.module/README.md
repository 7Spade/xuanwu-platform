# achievement.module

**Bounded Context:** Achievement Rules · Badge Unlocking  
**Layer:** SaaS

## Purpose

`achievement.module` evaluates achievement rules and unlocks badges for accounts.
Badge unlocks are projected to the Account's public profile in `account.module`
via the `IAccountBadgeWritePort` cross-module port.

## What this module owns

| Concern | Description |
|---------|-------------|
| AchievementRule | Condition-based rule for unlocking a badge |
| Badge | Badge definition (name, icon, description) |
| AccountAchievementRecord | Per-account record of unlocked badges |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `account.module` | → | Badge unlocks are written via IAccountBadgeWritePort |
| All source modules | ← | Achievement rules are evaluated on domain events (e.g. WorkItemCompleted, FileUploaded) |

## Standard 4-layer structure

```
achievement.module/
├── index.ts
├── domain.achievement/
│   ├── _entity.ts               # AchievementRule + Badge + AccountAchievementRecord
│   ├── _value-objects.ts
│   ├── _ports.ts                # IAchievementRepository, IAccountBadgeWritePort
│   └── _events.ts
├── core/
├── infra.firestore/
└── _components/
```
