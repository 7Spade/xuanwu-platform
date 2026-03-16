# Business Terms / 業務術語

Covers organizational structure, work management, workforce operations, financial settlement, and quality governance.

---

## Organization and Access / 組織與存取

| Term | 中文 | Definition |
|------|------|------------|
| **Account (organization)** | 帳號（組織型） | An `Account` with `accountType = "organization"`. The top-level billing and governance unit. Groups workspaces, teams, and members. Managed by `account.module`. The `org.module` has been removed — organization accounts are a unified variant of the Account aggregate. |
| **Organization Owner** | 組織擁有者 | The owner of an organization-type Account. Full control over membership, billing, teams, and workspace provisioning. |
| **Personal Workspace** | 個人工作空間 | A workspace created directly under a user's personal namespace, not under any organization. The creating user is both owner and default maintainer. |
| **Collaborator** | 協作者 | An external user granted scoped access to a specific workspace. Does not hold an org-level role. Mirrors the GitHub collaborator concept. |
| **Team** | 團隊 | A named group of org members used to assign workspace access in bulk and to receive `@team` review mentions. Mirrors GitHub Teams. |
| **Maintainer** | 維護者 | A user appointed by the workspace owner to manage day-to-day workspace operations: settings, change request reviews, and merge decisions. |
| **Task Assignee** | 任務指派人 | The org member scheduled by Workforce Scheduling to execute a specific WBS task. Dynamically bound per task — not a static role. |
| **Invitation** | 邀請 | The mechanism by which an OrgOwner or workspace owner grants access to a collaborator. Must be accepted before access is active. |

---

## Work Structure / 工作結構

| Term | 中文 | Definition |
|------|------|------------|
| **Workspace** | 工作空間 | The primary logical container for a project or engagement. Contains WBS tasks, issues, files, and governance history. Analogous to a GitHub repository but for operational work, not source code. |
| **WBS (Work Breakdown Structure)** | 工作分解結構 | A hierarchical decomposition of a deliverable into manageable tasks. Each node in the tree is a WBS task with its own assignee, schedule, and state. |
| **WBS Task** | WBS 任務 | The atomic unit of work. Has a title, description, assignee, scheduled time window, current state, linked issues, and attached files. |
| **Epic** | 史詩 | A large body of work composed of multiple WBS tasks or milestones. Used to group related deliverables under a single business objective. |
| **Milestone** | 里程碑 | A time-bound checkpoint grouping a set of WBS tasks. Signals a significant stage completion within a workspace. |
| **Work Item** | 工作項目 | A general planning primitive. May be a task, a sub-task, or a reference point. Can be populated automatically from Object Extraction outputs. |
| **Dependency** | 依賴 | A sequencing constraint between two WBS tasks. Task B cannot start until Task A reaches a specified state. Enforced by the WBS module. |
| **Deliverable** | 交付物 | The tangible output produced by one or more WBS tasks. Linked to Acceptance and Settlement records upon completion. |

---

## WBS Task Lifecycle / WBS 任務生命週期

| State | 中文 | Meaning |
|-------|------|---------|
| **Pending** | 待處理 | Task created and assigned but not yet started. Waiting for the scheduled start time or assignee action. |
| **In Progress** | 進行中 | Assignee has started work. Snapshots can be submitted for review. |
| **Done** | 完成 | Assignee marks work complete and submits for QA. |
| **QA In Review** | 質檢中 | Quality check in progress. Reviewer validates output against criteria. |
| **Acceptance Review** | 驗收審查中 | QA passed. Stakeholder or domain owner performs final acceptance check. |
| **Accepted** | 已驗收 | Deliverable approved. Triggers the Settlement Layer. |
| **Blocked** | 阻擋中 | Task has one or more open issues linked to it. Cannot progress until all linked issues are resolved. |

---

## Issue and Defect Tracking / 議題與缺陷追蹤

| Term | 中文 | Definition |
|------|------|------------|
| **Issue** | 議題 | A discrete blocker, defect, or question raised against a WBS task. Receives a sequential workspace-scoped ID (`#1`, `#2`, `#3`). |
| **Issue ID** | 議題編號 | Sequential identifier scoped to the workspace (e.g. `ISSUE-2026-000123`). Used to cross-reference issues in task history, notifications, and change requests. |
| **Rework** | 返工 | The action of revising a task after a failed QA or Acceptance review. The task returns to `In Progress` with the rejection feedback attached. |

---

## Workforce Operations / 人力運營

| Term | 中文 | Definition |
|------|------|------------|
| **Workforce Scheduling** | 人力排程 | The cross-boundary service that matches WBS task requirements (skill, time window, effort estimate) to available org members and produces an approved assignment schedule. |
| **Skill Requirement** | 技能需求 | A tag or structured attribute on a WBS task describing the competency needed to execute it. Used by Workforce Scheduling for member matching. |
| **Time Window** | 時間窗口 | The start and end dates within which a WBS task must be executed. Provided by the workspace, validated against member availability by Workforce Scheduling. |
| **Effort Estimate** | 工時估算 | The expected person-hours required to complete a WBS task. Informs scheduling decisions and AP payment calculations. |
| **Capacity** | 容量 | The available working hours of a team or member within a given time window. Queried by Workforce Scheduling when building assignment proposals. |
| **Assignment Schedule** | 指派排程 | The output of Workforce Scheduling: a mapping of WBS tasks to members with confirmed time slots. Requires OrgOwner approval before being pushed to WBS. |

---

## Quality and Acceptance / 質量與驗收

| Term | 中文 | Definition |
|------|------|------------|
| **QA Review** | 質量檢查 | The post-completion validation gate. A designated reviewer checks that the task output meets predefined quality criteria before forwarding to Acceptance. |
| **Acceptance** | 驗收 | The final stakeholder sign-off gate. Confirms the deliverable satisfies requirements. A passed Acceptance triggers the Settlement Layer. |
| **Rejection** | 拒絕 | The outcome when QA or Acceptance finds the output unsatisfactory. Returns the task to `In Progress` and attaches feedback as a linked issue. |
| **Quality Criteria** | 質量標準 | The set of conditions a deliverable must meet to pass QA Review. Defined per workspace or per task type by the Maintainer or OrgOwner. |

---

## Settlement and Finance / 結算與財務

| Term | 中文 | Definition |
|------|------|------------|
| **Settlement Layer** | 結算層 | The SaaS-layer service that processes financial records once a WBS task reaches `Accepted`. Produces AR and AP records. |
| **Accounts Receivable (AR)** | 應收帳款 | A financial record representing money owed to the organization by a client for an accepted deliverable. Linked to the task and workspace that produced it. |
| **Accounts Payable (AP)** | 應付帳款 | A financial record representing money the organization owes to a task assignee or vendor for completed work. Calculated from task completion data and the assignment schedule. |
| **Invoice** | 發票 | A document generated from an AR record. References the task, workspace, deliverable, and amount. Issued to the client on Acceptance. |
| **Payment Schedule** | 付款排程 | The timeline generated from an AP record. Specifies when and how much will be paid to the assignee or vendor. |
| **Billable Deliverable** | 可計費交付物 | A deliverable that triggers an AR record upon Acceptance. Indicates the client will be invoiced for this work. |

---

## Social and Discovery / 社交與探索

| Term | 中文 | Definition |
|------|------|------------|
| **Star** | 收藏 | Bookmarking a workspace. Surfaces it in the user's dashboard and signals popularity for discovery ranking. |
| **Watch** | 關注 | Subscribing to a workspace's event stream. Generates inbox notifications for activity in that workspace. |
| **Follow** | 追蹤 | Tracking another user's public activity. Their contributions and workspace interactions appear in the follower's discovery feed. |
| **Discovery Feed** | 探索 | The algorithmically ranked stream of workspaces and users surfaced on the dashboard. Driven by star, watch, and follow signals. |

---

## Achievement / 成就

| Term | 中文 | Definition |
|------|------|------------|
| **Achievement** | 成就 | A recognition milestone unlocked when an assignee completes qualifying WBS task activity. Rendered as a badge on the user profile. |
| **Badge** | 徽章 | The visible award artifact displayed on a user's profile after an achievement is unlocked. |
| **Qualifying Activity** | 符合條件的活動 | A public WBS task completion event that matches one or more achievement rule criteria. Must be non-trivial and publicly visible. |
