# PR #11 — feat: scaffold all 17 MDDD modules from core-logic.mermaid + document conflicts + architectural decision framework

Branch: `copilot/create-modules-for-mddd`  
Base: `copilot/init-serena-and-index-memory`  
Status: ✅ Merged (PR #11)

## Summary

Scaffolded all Domain Modules for the Xuanwu Platform from analysis of `core-logic.mermaid`.  
Final module count: **16** (15 core BC + `causal-graph.module`; `feature.module` removed in PR #12).

Each module uses the standard 4-layer DDD structure:
```
<name>.module/
├── README.md          # bounded context, owns/not-owns, cross-module deps
├── index.ts           # public barrel only
├── domain.<agg>/      # entity, value-objects, ports, events, service
├── core/              # use-cases, _actions.ts, _queries.ts
├── infra.firestore/   # repository, mapper
└── _components/       # Presentation layer
```

## Conversational Decisions (PR iteration log)

| Iteration | Action | Result |
|-----------|--------|--------|
| 1 | Scaffold 8 modules from `core-logic.mermaid` | org, workspace, file, workforce, settlement, notification, social, achievement |
| 2 | Extract `namespace` from `org`; add work/fork/profile | 12 modules; namespace independent (serves both personal + org accounts) |
| 3 | Add `identity` + `account`; remove `profile` | 13 modules; identity replaces raw Firebase Auth; account unifies User/Org |
| 4 | Add collaboration/search/audit; delete `org`; add per-module READMEs | 15 modules; org absorbed into account (AccountType: organization) |
| 5 | Build domain-lookup.md routing table (15 domains × 核心問題 × 主要概念) | Routing table created |
| 6 | Expand domain-lookup.md with 20 Architectural Questions + merge/split rules + 6-step flowchart | Decision framework complete |
| 7 | Evaluate 6 new proposals; scaffold `feature` + `causal-graph`; reject 4 overlaps | 17 modules; overlap analysis in domain-lookup.md section ⑦ |
| 8 | Pre-merge memory extraction; add routing entries for feature/causal-graph | domain-lookup.md complete; INDEX.md updated |

## Final Module List (17)

| Module | Layer | Core Problem |
|--------|-------|-------------|
| `identity` | SaaS (cross-cutting) | 你是誰？如何驗證身份？ |
| `account` | SaaS | 你擁有什麼帳戶？有哪些服務與成員？ |
| `namespace` | SaaS | 你的路徑在哪裡？ |
| `workspace` | Workspace | 你在管理什麼專案？ |
| `file` | Workspace | 你上傳了什麼文件？如何解析？ |
| `work` | Workspace | 你在執行什麼工作項目？ |
| `fork` | Workspace | 你想另開一條規劃分支嗎？ |
| `workforce` | Bridge | 誰負責哪些工作？容量如何？ |
| `settlement` | SaaS | 款項如何計算與結算？ |
| `notification` | SaaS (cross-cutting) | 誰需要被通知？透過什麼管道？ |
| `social` | SaaS | 誰在關注誰？有什麼動態？ |
| `achievement` | SaaS | 你達成了什麼成就？徽章如何解鎖？ |
| `collaboration` | Workspace (cross-cutting) | 你在討論什麼？誰在線？ |
| `search` | SaaS (cross-cutting) | 如何找到它？ |
| `audit` | SaaS (cross-cutting) | 誰做了什麼？是否符合政策？ |
| `feature` | SaaS (cross-cutting) | 這個功能現在應該開啟嗎？對誰開？ |
| `causal-graph` | SaaS/Workspace (cross-cutting) | 為什麼 X 發生了？X 影響了什麼？ |

## Removed Modules

| Module | Reason |
|--------|--------|
| `org.module` | Team/Membership absorbed into `account.module` as org-Account sub-aggregates |
| `profile.module` | Public profile is a sub-aggregate of Account; absorbed into `account.module` |

## Rejected Proposals (Overlap Analysis)

| Proposal | Why Rejected | Correct Home |
|----------|-------------|--------------|
| `event.module` (事件來源) | `audit.module` = append-only event log; EventBus = `src/infrastructure/` | `audit.module` + infra |
| `activity.module` (活動流) | `social.module` already owns Feed/FeedEntry/Discovery | `social.module` |
| `entitlement.module` (訂閱/權限) | `account.module` owns Plan/Subscription | `account.module` |
| `timeline.module` (時間軸投影) | "投影" = CQRS read-model, not a BC; each domain provides its own timeline `_queries.ts` | Each domain's `_queries.ts` |

## Key Architectural Decisions

1. **`namespace.module` is independent** — NS serves both personal + org accounts; cannot live inside `org.module`
2. **`identity.module` replaces raw Firebase Auth** — All auth SDK calls should go through `identity.module` ports
3. **`account.module` unifies User/Org** — `AccountType: personal | organization`; Team/Membership are org sub-aggregates
4. **`causal-graph.module` ≠ `work.module` Dependency** — Work Dependency = scheduling order; CausalGraph = cross-BC cause-effect reasoning
5. **EventBus is Infrastructure** — `src/infrastructure/event-bus/`, not a Domain Module
6. **Timeline queries are not a BC** — Each domain provides `_queries.ts` CQRS projections for its own timeline view
7. **`feature.module` removed (PR #12)** — Feature flag infrastructure is too vague to locate clearly as a BC; can use Firebase Remote Config or `src/infrastructure/` if needed

## Files Changed (Key)

- `src/modules/` — 17 module folders, each with README.md + index.ts + 4-layer scaffold
- `docs/architecture/README.md` — Domain Modules table updated 5 → 17
- `src/modules/README.md` — reference table updated 5 → 17
- `.serena/memories/project/architecture.md` — reflects 17-module architecture
- `.serena/memories/project/domain-lookup.md` — full decision framework (3 core Qs + 20 judgment Qs + merge/split rules + 6-step flowchart + routing entries for all 17 domains + overlap analysis)
- `issue.md` — Issues 15–18 document conflict analysis and design decisions
