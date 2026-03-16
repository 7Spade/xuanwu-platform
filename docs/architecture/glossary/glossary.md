# Glossary / 系統詞彙表

> Tags: `glossary` `vocabulary-reference` `business-terms` `technical-terms`  
> Unified vocabulary reference for xuanwu-platform — business concepts, MDDD architecture vocabulary, and technical infrastructure.  
> See also: [Architecture SSOT](../notes/model-driven-hexagonal-architecture.md) · [Business Entities Catalog](../catalog/business-entities.md)

---

## Part A: Business Terms / 業務術語

### Organization and Access / 組織與存取

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

### Work Structure / 工作結構

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

### WBS Task Lifecycle / WBS 任務生命週期

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

### Issue and Defect Tracking / 議題與缺陷追蹤

| Term | 中文 | Definition |
|------|------|------------|
| **Issue** | 議題 | A discrete blocker, defect, or question raised against a WBS task. Receives a sequential workspace-scoped ID (`#1`, `#2`, `#3`). |
| **Issue ID** | 議題編號 | Sequential identifier scoped to the workspace (e.g. `ISSUE-2026-000123`). Used to cross-reference issues in task history, notifications, and change requests. |
| **Rework** | 返工 | The action of revising a task after a failed QA or Acceptance review. The task returns to `In Progress` with the rejection feedback attached. |

---

### Workforce Operations / 人力運營

| Term | 中文 | Definition |
|------|------|------------|
| **Workforce Scheduling** | 人力排程 | The cross-boundary service that matches WBS task requirements (skill, time window, effort estimate) to available org members and produces an approved assignment schedule. |
| **Skill Requirement** | 技能需求 | A tag or structured attribute on a WBS task describing the competency needed to execute it. Used by Workforce Scheduling for member matching. |
| **Time Window** | 時間窗口 | The start and end dates within which a WBS task must be executed. Provided by the workspace, validated against member availability by Workforce Scheduling. |
| **Effort Estimate** | 工時估算 | The expected person-hours required to complete a WBS task. Informs scheduling decisions and AP payment calculations. |
| **Capacity** | 容量 | The available working hours of a team or member within a given time window. Queried by Workforce Scheduling when building assignment proposals. |
| **Assignment Schedule** | 指派排程 | The output of Workforce Scheduling: a mapping of WBS tasks to members with confirmed time slots. Requires OrgOwner approval before being pushed to WBS. |

---

### Quality and Acceptance / 質量與驗收

| Term | 中文 | Definition |
|------|------|------------|
| **QA Review** | 質量檢查 | The post-completion validation gate. A designated reviewer checks that the task output meets predefined quality criteria before forwarding to Acceptance. |
| **Acceptance** | 驗收 | The final stakeholder sign-off gate. Confirms the deliverable satisfies requirements. A passed Acceptance triggers the Settlement Layer. |
| **Rejection** | 拒絕 | The outcome when QA or Acceptance finds the output unsatisfactory. Returns the task to `In Progress` and attaches feedback as a linked issue. |
| **Quality Criteria** | 質量標準 | The set of conditions a deliverable must meet to pass QA Review. Defined per workspace or per task type by the Maintainer or OrgOwner. |

---

### Settlement and Finance / 結算與財務

| Term | 中文 | Definition |
|------|------|------------|
| **Settlement Layer** | 結算層 | The SaaS-layer service that processes financial records once a WBS task reaches `Accepted`. Produces AR and AP records. |
| **Accounts Receivable (AR)** | 應收帳款 | A financial record representing money owed to the organization by a client for an accepted deliverable. Linked to the task and workspace that produced it. |
| **Accounts Payable (AP)** | 應付帳款 | A financial record representing money the organization owes to a task assignee or vendor for completed work. Calculated from task completion data and the assignment schedule. |
| **Invoice** | 發票 | A document generated from an AR record. References the task, workspace, deliverable, and amount. Issued to the client on Acceptance. |
| **Payment Schedule** | 付款排程 | The timeline generated from an AP record. Specifies when and how much will be paid to the assignee or vendor. |
| **Billable Deliverable** | 可計費交付物 | A deliverable that triggers an AR record upon Acceptance. Indicates the client will be invoiced for this work. |

---

### Social and Discovery / 社交與探索

| Term | 中文 | Definition |
|------|------|------------|
| **Star** | 收藏 | Bookmarking a workspace. Surfaces it in the user's dashboard and signals popularity for discovery ranking. |
| **Watch** | 關注 | Subscribing to a workspace's event stream. Generates inbox notifications for activity in that workspace. |
| **Follow** | 追蹤 | Tracking another user's public activity. Their contributions and workspace interactions appear in the follower's discovery feed. |
| **Discovery Feed** | 探索 | The algorithmically ranked stream of workspaces and users surfaced on the dashboard. Driven by star, watch, and follow signals. |

---

### Achievement / 成就

| Term | 中文 | Definition |
|------|------|------------|
| **Achievement** | 成就 | A recognition milestone unlocked when an assignee completes qualifying WBS task activity. Rendered as a badge on the user profile. |
| **Badge** | 徽章 | The visible award artifact displayed on a user's profile after an achievement is unlocked. |
| **Qualifying Activity** | 符合條件的活動 | A public WBS task completion event that matches one or more achievement rule criteria. Must be non-trivial and publicly visible. |

---

## Part B: Architecture Vocabulary / 架構詞彙

### MDDD Core Concepts / 模型驅動領域發現核心概念

| Term | 中文 | Definition |
|------|------|------------|
| **MDDD (Model-Driven Domain Discovery)** | 模型驅動領域發現 | The design process used in Xuanwu. Domain modelling drives all design decisions — the database, UI, and framework are all secondary to the domain model. |
| **Bounded Context** | 限界上下文 | A linguistic and logical boundary within which a domain model is defined and applicable. In Xuanwu, each `src/modules/{name}.module/` is a Bounded Context. |
| **Ubiquitous Language** | 通用語言 | Shared vocabulary used by domain experts and developers alike. All code identifiers, event names, and docs use the same terms. |
| **Aggregate** | 聚合 | A cluster of domain objects treated as a single consistency unit. Changes enter only through the Aggregate Root. |
| **Aggregate Root** | 聚合根 | The single entry point to an Aggregate. All external references use the root's ID only. Repositories load and save only roots. |
| **Entity** | 實體 | An object with a stable identity that persists across time. Identified by its ID, not its field values. |
| **Value Object** | 值物件 | An immutable object identified entirely by its field values. No identity; equality is structural. Examples: `AccountHandle`, `SkillTag`. |
| **Domain Service** | 領域服務 | Business logic that doesn't naturally belong to a single Entity. Stateless; takes entities/VOs as inputs and returns results. |
| **Domain Event** | 領域事件 | A record of something that happened in the domain. Immutable; named in past-tense verb form: `{domain}.{entity}.{verb}`. |
| **Port** | 端口 | A TypeScript interface defined in the Domain layer that describes a dependency boundary. Implemented by Infrastructure adapters. |
| **Adapter** | 適配器 | A concrete class in the Infrastructure layer that implements a Port interface. Examples: `FirestoreWorkspaceRepository`, `FirebaseAuthAdapter`. |
| **Invariant** | 不變性約束 | A business rule that must always hold. Enforced exclusively by the Aggregate Root's methods, never in Application or Infrastructure layers. |
| **Repository** | 資源庫 | A Port interface (and its Adapter) responsible for loading and persisting Aggregate Roots. Hides all storage details from the domain. |
| **Factory** | 工廠 | A function or static method that encapsulates the construction logic for a complex Aggregate or Entity. |
| **DTO (Data Transfer Object)** | 資料傳輸物件 | A plain data structure used to carry data across layer boundaries. Contains no business logic. |
| **Published Language** | 已發布語言 | A well-documented domain event format exchanged between Bounded Contexts via the Event Bus. |
| **Anticorruption Layer (ACL)** | 防腐層 | A translation layer that converts an upstream model into the consuming context's own model, preventing upstream concepts from polluting the downstream domain. |
| **Open Host Service** | 開放主機服務 | An upstream context that exposes a well-defined, versioned API for multiple downstream consumers. |

---

### Context Mapping Patterns / 上下文映射模式

| Pattern | 中文 | Usage in Xuanwu |
|---------|------|-----------------|
| **Upstream / Downstream** | 上游 / 下游 | SaaS Layer modules are upstream; Workspace Layer modules are downstream |
| **Customer / Supplier** | 客戶 / 供應商 | `account.module` (supplier) → `workspace.module` (customer): workspace negotiates interface requirements |
| **Conformist** | 遵奉者 | `settlement.module` reacts to `wbs.task.state_changed` without translating the model |
| **Partnership** | 合夥關係 | `workforce.module` ↔ `workspace.module`: co-evolve WBS skill requirements and capacity queries |
| **Anticorruption Layer** | 防腐層 | `identity.module` translates Firebase Auth → `IdentityUser`; all external API integrations |
| **Open Host Service** | 開放主機服務 | `notification.module` subscribes to Event Bus without coupling to any module internals |
| **Published Language** | 已發布語言 | Domain events on the Event Bus: `{domain}.{entity}.{verb}` format |
| **Shared Kernel** | 共享核心 | `src/shared/` utilities: only purely stable, zero-business-logic primitives shared here |

---

## Part C: Technical Infrastructure / 技術基礎設施

### Identity and Routing / 身份與路由

| Term | 中文 | Definition |
|------|------|------------|
| **Identity** | 身份識別 | The Firebase Auth principal linked to a platform Account. Managed exclusively by `identity.module`. |
| **AuthClaims** | 身份聲明 | Custom JWT claims set on the Firebase token: `accountId`, `accountType`, `role`. Read by Server Actions for authorization. |
| **Namespace** | 命名空間 | A unique path identifier that scopes workspace URLs and prevents naming collisions. Format: `{account-slug}/{workspace-slug}`. |
| **Slug** | 別名路徑 | The URL-safe identifier component within a namespace path. Must be unique per account. |

---

### Workspace Versioning and Governance / 工作空間版本與治理

| Term | 中文 | Definition |
|------|------|------------|
| **Protected Baseline** | 受保護基線 | The canonical, locked version of the workspace. Changes enter only via approved Change Requests or the Merge Queue. |
| **Change Request (CR)** | 變更請求 | A formal proposal to update the workspace baseline. Requires review approval before merging. Analogous to a GitHub Pull Request. |
| **Merge Queue** | 合併佇列 | Optional governance gate. Groups multiple CRs, validates them together, then merges atomically into the baseline. |
| **Fork** | 分叉 | A copy of a workspace baseline created for experimental changes. Changes are merged back to the origin workspace via a CR. |
| **Snapshot** | 快照 | A point-in-time read of a workspace's state. Used in progress reporting and QA evidence. |
| **Lifecycle State** | 生命週期狀態 | The current phase of a workspace: `preparatory` → `active` → `stopped`. Controls which operations are permitted. |
| **Grant** | 授權 | A scoped access record linking a user or team to a workspace with specific permissions. |
| **Access Expiry** | 存取到期 | Optional timestamp on a Grant after which the granted access is automatically revoked. |

---

### Governance Rules and Automation / 治理規則與自動化

| Term | 中文 | Definition |
|------|------|------------|
| **Capability** | 能力 | A feature flag on a Workspace that toggles specific behaviors (e.g., enable Merge Queue, enable Intelligence Layer). |
| **Workflow Blocker** | 工作流阻斷 | A derived state indicating that a workspace or task cannot progress because of unresolved issues, failed reviews, or violated invariants. |
| **CQRS** | 命令查詢職責分離 | Commands mutate state through Use Cases; Queries read state directly from repositories. Prevents unintentional side effects in read paths. |
| **Composition Root** | 組合根 | The single location in the application where all dependencies (repositories, adapters, use cases) are wired together. |
| **Idempotency Key** | 冪等鍵 | A unique identifier attached to a mutating request so that retrying the same request produces no additional side effects. |

---

### Intelligence Layer / 智能層

| Term | 中文 | Definition |
|------|------|------------|
| **Document Parsing** | 文件解析 | Phase 1 of the AI pipeline. Uses Google Cloud Document AI to extract raw text, tables, and structure from uploaded files. |
| **Object Extraction** | 物件提取 | Phase 2. Gemini 2.5 Flash identifies actionable entities from parsed content: dates, amounts, parties, deliverables, obligations. |
| **ParsedLineItem** | 解析明細 | A structured output from Object Extraction representing a single work item candidate (title, quantity, unit price, semantic tag). |
| **ParsingIntent** | 解析意圖 | The digital twin of a document parsing operation. Records the source file, extracted items, and SHA-256 semantic hash for deduplication. |
| **Semantic Tag** | 語義標籤 | A slug-based classification applied to a ParsedLineItem during Object Extraction. Used to map extracted items to WBS task categories. |
| **ParsingImport** | 解析匯入 | An idempotent log of the work-item materialisation step. Tracks which ParsedLineItems were converted to WorkItems. |
| **Sidecar File** | 附屬檔案 | A `.document-ai.json` file generated alongside the original upload. Contains the raw `OcrDocumentObject` for Phase 2 processing. |

---

### File Storage / 檔案儲存

| Term | 中文 | Definition |
|------|------|------------|
| **File Module** | 檔案模組 | Manages binary file uploads, metadata, version history, and the Intelligence Layer pipeline. |
| **MimeGroup** | MIME 分類 | A coarse classification of file types (image, pdf, spreadsheet, etc.) derived from the MIME type. Used to select the correct viewer and extraction strategy. |
| **Version History** | 版本歷史 | The append-only log of file uploads for a given workspace resource. Each version is addressable by version ID. |
| **Storage Bucket** | 儲存桶 | Firebase Storage bucket where binary file blobs are stored. Referenced by path in `FileRecord`. |
| **Tombstone** | 墓碑記錄 | A soft-delete marker left when a file is logically deleted. Prevents re-indexing and ensures audit completeness. |

---

### Event-Driven Infrastructure / 事件驅動基礎設施

| Term | 中文 | Definition |
|------|------|------------|
| **Event Bus** | 事件匯流排 | Central async message broker. All modules publish domain events here; consumers subscribe without coupling to producers. |
| **Event Envelope** | 事件封包 | The standard wrapper for all domain events: `{ eventType, aggregateId, occurredAt, payload }`. |
| **Notification Engine** | 通知引擎 | Subscribes to the Event Bus. Resolves recipients by participation, `@mention`, watch subscription, team membership, or custom rules. Writes to `NotificationRecord`. |
| **Inbox** | 站內信 | User-facing notification surface. Supports triage actions: save, mark done, unsubscribe. |
| **Outbox Pattern** | 發件箱模式 | Guarantees at-least-once event delivery by writing events to a Firestore outbox document before publishing. Prevents silent event loss on failure. |
| **Idempotent Consumer** | 冪等消費者 | An event handler that can safely process the same event multiple times without producing duplicate side effects. Uses the `eventId` to skip already-processed events. |

---

### Access Control / 存取控制

| Term | 中文 | Definition |
|------|------|------------|
| **Role** | 角色 | A named permission level within a Bounded Context (e.g., `org_admin`, `maintainer`, `assignee`). Stored in AuthClaims and `MembershipRecord`. |
| **Grant** | 授權記錄 | A scoped access record linking a user or team to a workspace with specific permissions. Has an optional expiry. |
| **Membership** | 成員資格 | The record of a user's participation in an organization account. Status: `pending` → `active` → `revoked`. |
| **Firestore Security Rules** | 資料庫安全規則 | Server-side rules enforced by Firestore for all client SDK reads/writes. Last line of defence; must mirror Domain access control invariants. |

---

### Profile and Reputation / 個人檔案與聲譽

| Term | 中文 | Definition |
|------|------|------------|
| **Account Profile** | 帳號檔案 | Public-facing page showing an account's contributions, badges, activity, and workspace memberships. Sub-aggregate of `account.module`. |
| **Achievement Rules** | 成就規則 | Rule engine that evaluates completed WBS task activity against milestone criteria. Awards badges on qualification. |
| **Badge Slug** | 徽章別名 | The stable, URL-safe identifier for a badge. Stored in `AccountEntity.profile.badgeSlugs[]`. Referenced in `AchievementUnlocked` domain events. |
