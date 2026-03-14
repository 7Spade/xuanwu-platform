# settlement.module

**Bounded Context:** Settlement · AR · AP  
**Layer:** SaaS

## Purpose

`settlement.module` handles the financial settlement lifecycle:
accounts receivable (AR), accounts payable (AP), and settlement records
for services rendered within the platform.

## What this module owns

| Concern | Description |
|---------|-------------|
| Settlement | Final settlement record for a billing period |
| AccountsReceivable | Amounts owed to the platform / service provider |
| AccountsPayable | Amounts owed by the platform to contributors |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `account.module` | → | Settlement parties are Accounts |
| `workforce.module` | → | Workforce allocations generate AP entries |
| `audit.module` | ← | Settlement events are audited |

## Standard 4-layer structure

```
settlement.module/
├── index.ts
├── domain.settlement/
│   ├── _entity.ts
│   ├── _value-objects.ts
│   ├── _ports.ts
│   └── _events.ts
├── core/
├── infra.firestore/
└── _components/
```
