# System Glossary / 系統詞彙表

Vocabulary reference for xuanwu-platform — SaaS Layer, Workspace Layer, and shared infrastructure.
See also: [Business Terms](./business-terms.md) | [Technical Terms](./technical-terms.md)

---

## Actors / 角色

| Term | 中文 | Layer | Description |
|------|------|-------|-------------|
| **User** | 使用者 | Both | Any authenticated person using the platform. Can create organizations or personal workspaces. |
| **Organization Owner** | 組織擁有者 | SaaS | A User who has created an organization. Controls org-level settings, teams, workspaces, and billing. |
| **Maintainer** | 維護者 | Workspace | Appointed by the workspace owner. Manages workspace settings, reviews change requests, and triggers merges. |
| **Task Assignee** | 任務指派人 | Workspace | A member assigned to execute a specific WBS task. Receives assignments via Workforce Scheduling. |
| **Collaborator** | 協作者 | Workspace | An external user invited to contribute to a workspace. Scoped access, not a full org member. |

---

## SaaS Layer / SaaS 層

| Term | 中文 | Layer | Description |
|------|------|-------|-------------|
| **Organization** | 組織 | SaaS | The top-level entity. Groups workspaces, teams, and members under a single billing and governance unit. |
| **Namespace** | 命名空間 | SaaS | A unique path identifier. Scopes workspace URLs and prevents naming collisions. Format: `org/workspace` or `user/workspace`. |
| **Team** | 團隊 | SaaS | A named group of org members. Used to grant bulk workspace access and for `@team` mentions in reviews. |
| **Workforce Scheduling** | 人力排程 | SaaS ↔ Workspace | Cross-boundary service. Receives task requirements from WBS (skills, time window, effort) and matches them to available org members. |
| **Settlement Layer** | 結算層 | SaaS | Post-acceptance financial processing. Triggers AR and AP records once a WBS task reaches Accepted state. |
| **Accounts Receivable (AR)** | 應收帳款 | SaaS | Records amounts owed by clients for completed and accepted deliverables. Generates invoices. |
| **Accounts Payable (AP)** | 應付帳款 | SaaS | Records amounts owed to assignees or vendors for completed work. |

---

## Workspace Layer / Workspace 層

| Term | 中文 | Layer | Description |
|------|------|-------|-------------|
| **Workspace** | 工作空間 | Workspace | The primary logical container for work. Analogous to a GitHub repository but for operational work. |
| **Protected Baseline** | 受保護基線 | Workspace | The canonical, locked version of the workspace. Changes enter only via approved change requests or the merge queue. |
| **WBS Module** | WBS 模組 | Workspace | Work Breakdown Structure. Structures deliverables into a hierarchy of tasks. |
| **WBS Task State Machine** | WBS 任務狀態機 | Workspace | Lifecycle: `Pending` → `In Progress` → `Done` → `QA In Review` → `Acceptance Review` → `Accepted`. |
| **Issue Module** | 議題模組 | Workspace | Tracks blockers and defects against WBS tasks. Each issue receives a sequential ID (`#1` `#2` `#3`). |
| **Change Request (CR)** | 變更請求 | Workspace | A formal proposal to update the workspace baseline. Requires review approval before merging. Analogous to a Pull Request. |
| **Merge Queue** | 合併佇列 | Workspace | Optional governance gate. Groups multiple change requests, validates them together, then merges atomically. |
| **File Module** | 檔案模組 | Workspace | Stores binary files, metadata, and version history. |
| **Intelligence Layer** | 智能層 | Workspace | AI processing pipeline triggered when a parseable document is uploaded. |
| **Document Parsing** | 文件解析 | Workspace | First stage of the Intelligence Layer. Extracts raw text, structure, tables, and metadata. |
| **Object Extraction** | 物件提取 | Workspace | Second stage. Identifies actionable entities from parsed content: dates, amounts, parties, deliverables, obligations. |
| **QA Review** | 質量檢查 | Workspace | Post-completion gate before acceptance. Validates that the task output meets quality criteria. |
| **Acceptance** | 驗收 | Workspace | Final gate after QA. Approval triggers the Settlement Layer. |

---

## Infrastructure / 基礎設施

| Term | 中文 | Layer | Description |
|------|------|-------|-------------|
| **Event Bus** | 事件匯流排 | Both | Central async message broker. All modules publish domain events here. Decouples producers from consumers. |
| **Notification Engine** | 通知引擎 | Both | Subscribes to Event Bus. Resolves recipients by participation, `@mention`, watch subscription, team membership, or custom rules. |
| **Inbox** | 站內信 | Both | User-facing notification surface. Supports triage actions: save, mark done, unsubscribe. |

---

## Social and Discovery / 社交與探索

| Term | 中文 | Layer | Description |
|------|------|-------|-------------|
| **Star / Watch / Follow Graph** | 收藏 / 關注 / 追蹤圖譜 | SaaS | Social signals. Star = bookmark a workspace. Watch = subscribe to its events. Follow = track another user's public activity. |
| **Dashboard / Discovery Feed** | 儀表板 / 探索 | SaaS | Personalised home surface. Aggregates activity from watched workspaces and followed users. |

---

## Profile and Achievement / 個人檔案與成就

| Term | 中文 | Layer | Description |
|------|------|-------|-------------|
| **User Profile** | 使用者檔案 | Both | Public-facing page showing a user's contributions, badges, activity, and workspace memberships. |
| **Achievement Rules** | 成就規則 | Both | Rule engine that evaluates completed WBS task activity against milestone criteria. Awards badges. |
