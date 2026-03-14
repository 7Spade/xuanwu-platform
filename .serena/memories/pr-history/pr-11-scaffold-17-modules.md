# PR #11 — feat: scaffold all 17 MDDD modules from core-logic.mermaid + domain-lookup decision framework

**Status**: ✅ Merged
**Branch**: `copilot/create-modules-for-mddd`

## Summary

Scaffolded all 17 Domain Modules from analysis of `core-logic.mermaid`. Each module uses the standard 4-layer DDD structure with README.md, index.ts, domain.<aggregate>/, core/, infra.firestore/, and _components/. Also created the domain-lookup.md architectural decision framework.

## Final Module Count: 17

| Module | Layer | Core Problem |
|--------|-------|-------------|
| `identity.module` | SaaS (cross-cutting) | 你是誰？如何驗證身份？ |
| `account.module` | SaaS | 你擁有什麼帳戶？有哪些服務與成員？ |
| `namespace.module` | SaaS | 你的路徑在哪裡？ |
| `workspace.module` | Workspace | 你在管理什麼專案？ |
| `file.module` | Workspace | 你上傳了什麼文件？如何解析？ |
| `work.module` | Workspace | 你在執行什麼工作項目？ |
| `fork.module` | Workspace | 你想另開一條規劃分支嗎？ |
| `workforce.module` | Bridge | 誰負責哪些工作？容量如何？ |
| `settlement.module` | SaaS | 款項如何計算與結算？ |
| `notification.module` | SaaS (cross-cutting) | 誰需要被通知？透過什麼管道？ |
| `social.module` | SaaS | 誰在關注誰？有什麼動態？ |
| `achievement.module` | SaaS | 你達成了什麼成就？徽章如何解鎖？ |
| `collaboration.module` | Workspace (cross-cutting) | 你在討論什麼？誰在線？ |
| `search.module` | SaaS (cross-cutting) | 如何找到它？ |
| `audit.module` | SaaS (cross-cutting) | 誰做了什麼？是否符合政策？ |
| `feature.module` | SaaS (cross-cutting) | 這個功能現在應該開啟嗎？對誰開？ |
| `causal-graph.module` | SaaS/Workspace (cross-cutting) | 為什麼 X 發生了？X 影響了什麼？ |

## Removed Modules
- `org.module` — Team/Membership absorbed into `account.module` (AccountType: organization)
- `profile.module` — Public profile is a sub-aggregate of Account; absorbed into `account.module`

## Rejected Proposals (domain-lookup.md section ⑦)
- `event.module` → `audit.module` + `src/infrastructure/`
- `activity.module` → `social.module` (Feed IS an activity stream)
- `entitlement.module` → `account.module` (Plan/Subscription)
- `timeline.module` → not a BC; each domain provides `_queries.ts` CQRS projections

## domain-lookup.md Decision Framework
- 17 routing entries (✅ one per module)
- 20 architectural questions (Q1–Q9 boundary, Q10–Q12 aggregate, Q13–Q14 event, Q15–Q17 service, Q18–Q20 data ownership)
- Merge/split rules and 6-step routing flowchart
- Section ⑦ overlap analysis for 4 rejected proposals

## Key Files Changed
- `src/modules/` — 17 module directories, each with README.md + index.ts + 4-layer scaffold
- `docs/architecture/README.md` — Domain Modules table updated to 17
- `src/modules/README.md` — reference table updated to 17
- `.serena/memories/project/architecture.md` — 17-module architecture
- `.serena/memories/project/domain-lookup.md` — complete decision framework
- `issue.md` — Issues 15–18 conflict analysis and design decisions

## Full Iteration Log
See `pr-history/pr-create-modules-for-mddd.md` for the complete 8-iteration scaffolding history.
