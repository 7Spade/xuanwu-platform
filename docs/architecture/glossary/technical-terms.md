# Technical Terms / 技術術語

Covers system architecture, data governance, integration patterns, and infrastructure primitives.

---

## Identity and Routing / 身份與路由

| Term | 中文 | Definition |
|------|------|------------|
| **Namespace** | 命名空間 | A unique path prefix that scopes workspace URLs and prevents naming collisions across users and organizations. Format: `{org-slug}/` or `{username}/`. Registered at org or personal workspace creation time. |
| **Slug** | 短識別碼 | The URL-safe string derived from an org or workspace name. Immutable after creation. Forms part of the namespace path. |
| **Workspace ID** | 工作空間識別碼 | An internal UUID assigned to a workspace at creation. Stable across namespace renames. Used in API paths and foreign-key references. |
| **Issue ID** | 議題識別碼 | A sequential, workspace-scoped identifier for issues (e.g. `ISSUE-2026-000123`). Monotonically incrementing. Referenced in task history, CR descriptions, and event payloads. |

---

## Workspace Versioning and Governance / 工作空間版本與治理

| Term | 中文 | Definition |
|------|------|------------|
| **Protected Baseline** | 受保護基線 | The canonical, write-locked snapshot of a workspace. Analogous to a `main` branch. Changes enter only via approved Change Requests or the Merge Queue. |
| **Snapshot** | 快照 | A point-in-time capture of a WBS task's work output submitted by the Assignee. Forms the content of a Change Request. |
| **Change Request (CR)** | 變更請求 | A versioned proposal to update the Protected Baseline. Contains one or more task snapshots, review state, approval records, and governance check results. Analogous to a Pull Request. |
| **Change Set** | 變更集 | The diff between a task snapshot and the current baseline. Routed from the Workspace to the WBS module and attached to a CR. |
| **Merge Queue** | 合併佇列 | An optional serialization gate. Enqueues multiple approved CRs, re-validates each against the latest baseline as a group, then merges atomically. Prevents conflicting concurrent merges. |
| **Merge Group** | 合併群組 | A batch of CRs composed by the Merge Queue for joint validation. If any item in the group fails governance checks, the failing item is dequeued and the remainder rebuild. |
| **Baseline History** | 基線歷史 | The append-only log of all accepted merges into the Protected Baseline. Used for audit, rollback reference, and WBS projection refresh. |
| **Fork** | 分叉 | A copy of a workspace planning branch created by a user for independent exploration. Changes are contributed back via a CR merge-back proposal. |
| **ADR (Architecture Decision Record)** | 架構決策紀錄 | A structured document capturing a significant design decision, its context, considered alternatives, and rationale. Stored in the workspace alongside WBS records. |

---

## Governance Rules and Automation / 治理規則與自動化

| Term | 中文 | Definition |
|------|------|------------|
| **Baseline Governance Rules** | 基線治理規則 | The policy set evaluated at merge time. Checks: required approval count, reviewer domain coverage, branch protection conditions, and custom rules. Returns `allow` or `deny`. |
| **Governance Check** | 治理檢查 | A single assertion within the Baseline Governance Rules evaluation. Each check must pass for the overall result to be `allow`. |
| **Integrity and Policy Automation** | 完整性與政策自動化 | Automated cross-module consistency checks: WBS dependency cycles, schedule over-allocation, resource conflicts, and file policy violations. Runs asynchronously and emits governance alerts. |
| **Governance Alert** | 治理警示 | An event emitted by Integrity and Policy Automation when a check fails. Routed via Event Bus to the Notification Engine. |
| **Policy Scope** | 政策範圍 | The boundary within which a set of access or governance rules applies. Defined at organization level, workspace level, or team level. |

---

## Intelligence Layer / 智能層

| Term | 中文 | Definition |
|------|------|------------|
| **Intelligence Layer** | 智能層 | The AI processing pipeline within the Workspace layer. Triggered automatically when a parseable document is uploaded to the File Module. Composed of Document Parsing followed by Object Extraction. |
| **Intelligence Pipeline** | 智能處理管線 | The ordered sequence of processing stages: `File Upload → Document Parsing → Object Extraction → WBS / Work Item population`. |
| **Document Parsing** | 文件解析 | Stage 1 of the Intelligence Pipeline. Converts raw file bytes into structured content: plain text, heading hierarchy, tables, and metadata (author, dates, language). |
| **Object Extraction** | 物件提取 | Stage 2 of the Intelligence Pipeline. Applies NLP or model-based extraction to identify actionable entities: dates, monetary amounts, party names, deliverables, and obligations. |
| **Actionable Object** | 可操作物件 | A typed entity extracted from a document (e.g. `date`, `amount`, `party`, `deliverable`, `obligation`). Linked to WBS tasks or Work Items for downstream processing. |
| **Parseable Document** | 可解析文件 | A file whose format supports structured content extraction. Typically: PDF, DOCX, XLSX, HTML, plain text. Binary formats (images, video) are not parseable without OCR pre-processing. |
| **Extraction Event** | 提取完成事件 | The domain event published to the Event Bus when Object Extraction completes. Carries extracted object references and links to target WBS tasks. |

---

## File Storage / 檔案儲存

| Term | 中文 | Definition |
|------|------|------------|
| **File Module** | 檔案模組 | The workspace-level service responsible for binary storage, metadata indexing, version tracking, and access policy enforcement. |
| **File ID** | 檔案識別碼 | A stable UUID assigned to a file at upload time. Referenced by WBS tasks and Work Items. Unchanged across version updates. |
| **File Version** | 檔案版本 | An immutable snapshot of a file's binary content at a point in time. New uploads to the same logical file create a new version without deleting prior ones. |
| **Storage Reference** | 儲存連結引用 | A pointer from a WBS task or Work Item to a file, containing only the File ID and version. The File Module resolves the actual binary on demand. |
| **Access Scope** | 存取範圍 | The permission boundary for a file, inherited from the workspace policy and optionally overridden per file. Controls who can read, write, or delete. |

---

## Event-Driven Infrastructure / 事件驅動基礎設施

| Term | 中文 | Definition |
|------|------|------------|
| **Event Bus** | 事件匯流排 | The central async message broker. All modules publish domain events here. Consumers subscribe by event type and filter rules. Decouples producers from consumers. |
| **Domain Event** | 領域事件 | An immutable record of something that happened within a bounded context (e.g. `task.accepted`, `cr.merged`, `issue.closed`). Published to the Event Bus with a timestamp, source ID, and payload. |
| **Event Payload** | 事件負載 | The structured data carried by a domain event. Contains enough context for consumers to act without querying back to the source system. |
| **Subscription Rule** | 訂閱規則 | A filter applied by the Notification Engine to determine which events trigger notifications for which recipients. Can match on event type, workspace ID, team, or mention. |
| **Notification Engine** | 通知引擎 | The Event Bus consumer responsible for resolving recipients and dispatching notifications. Applies subscription rules, deduplicates, and routes to Inbox, email, or mobile push. |
| **Inbox** | 站內信 | The in-product notification surface. Supports per-item triage actions: save, mark done, unsubscribe from thread. Also the aggregation point before email or push delivery. |

---

## Access Control / 存取控制

| Term | 中文 | Definition |
|------|------|------------|
| **Role** | 角色 | A named permission bundle. Built-in roles: `OrgOwner`, `Maintainer`, `Collaborator`. Roles are assigned at org or workspace scope. |
| **Permission** | 權限 | A discrete capability granted by a role (e.g. `workspace:write`, `cr:merge`, `file:delete`). Evaluated at the API boundary on every request. |
| **Access Policy** | 存取政策 | The declarative set of role and permission bindings applied to a workspace or organization. Evaluated by the File Module and Workspace on every resource access. |
| **Team Scope** | 團隊範圍 | The set of workspace permissions inherited by virtue of team membership. A user's effective permissions are the union of their direct grants and all team-scope grants. |

---

## Profile and Reputation / 個人檔案與聲譽

| Term | 中文 | Definition |
|------|------|------------|
| **User Profile** | 使用者檔案 | The public-facing page for a user. Displays contribution history, earned badges, workspace memberships, and follower / following counts. |
| **Achievement Rules** | 成就規則 | The rule engine that evaluates completed WBS task activity against milestone criteria. Stateless evaluation — runs after each qualifying activity event. |
| **Contribution Graph** | 貢獻圖譜 | A time-series visualization of a user's accepted WBS task activity. Displayed on the User Profile. |
