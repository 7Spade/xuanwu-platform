# Architecture Catalog Index / 架構目錄索引

The catalog defines core architecture contracts used across the system.
It covers all **22 domain modules** (17 implemented + 5 scaffold) across the
SaaS, Workspace, and Bridge layers.

---

## Catalog Documents / 目錄文件

- [Business Entities](./business-entities.md)  
  Canonical domain entities, fields, relationships, and invariants.
  Covers all implemented modules and lists the 5 scaffold modules pending implementation.
- [Event Catalog](./event-catalog.md)  
  Domain event taxonomy, payload contracts, and notification rules.
- [Service Boundary](./service-boundary.md)  
  SaaS ↔ Workspace ownership boundaries and crossing protocols.

---

## Module Coverage / 模組涵蓋範圍

| Layer | Modules |
|-------|---------|
| SaaS | `identity` · `account` · `namespace` · `settlement` · `notification` · `social` · `achievement` · `audit` · `search` · `governance`* · `subscription`* · `taxonomy`* · `vector-ingestion`* |
| Workspace | `workspace` (3 aggregates) · `file` · `work` · `fork` · `collaboration` · `knowledge`* |
| Bridge | `workforce` |
| Cross-cutting | `causal-graph` |

> \* scaffold only — implementation pending (ADR-014)

---

## Suggested Reading Order / 建議閱讀順序

1. [Business Entities](./business-entities.md)
2. [Service Boundary](./service-boundary.md)
3. [Event Catalog](./event-catalog.md)
