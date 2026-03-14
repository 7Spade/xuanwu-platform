# workforce.module — File Index

**Bounded Context**: 勞動力管理 / Workforce Scheduling
**職責**: 排班提案、容量規劃、指派管理（"誰做什麼、何時做"）。
**不包含**: 工作空間存取控制（workspace.module）、財務結算（settlement.module）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type ScheduleDTO` — 排班公開 DTO
- `export proposeSchedule` — 提交排班提案
- `export approveSchedule` — 核准排班
- `export rejectSchedule` — 拒絕排班
- `export getSchedulesByWorkspace` — 依工作空間查詢排班
- `export getSchedulesByAssignee` — 依指派人查詢排班
- `export type IScheduleRepository` — 排班 Repository Port 介面
- `export type IEligibilityCheckPort` — 資格審核 Port 介面

---

## `core/_use-cases.ts`
**描述**: 排班生命週期管理用例（PROPOSAL → OFFICIAL → COMPLETED）。
**函數清單**:
- `interface ScheduleDTO` — 排班公開 DTO（id, workspaceId, assigneeId, startAt, endAt, status）
- `proposeSchedule(repo, params): Promise<Result<ScheduleDTO>>` — 建立排班提案
- `approveSchedule(repo, id, approverId): Promise<Result<ScheduleDTO>>` — 核准排班（PROPOSAL→OFFICIAL）
- `rejectSchedule(repo, id, reason): Promise<Result<ScheduleDTO>>` — 拒絕排班
- `getSchedulesByWorkspace(repo, workspaceId): Promise<Result<ScheduleDTO[]>>` — 依工作空間查詢
- `getSchedulesByAssignee(repo, assigneeId): Promise<Result<ScheduleDTO[]>>` — 依指派人查詢

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `ScheduleDTO`（型別）
- 重新匯出 `proposeSchedule`、`approveSchedule`、`rejectSchedule`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `ScheduleDTO`（型別）
- 重新匯出 `getSchedulesByWorkspace`、`getSchedulesByAssignee`

---

## `domain.workforce/_value-objects.ts`
**描述**: 排班 domain 的 Branded Types 與輔助結構。
**函數清單**:
- `ScheduleIdSchema` / `type ScheduleId` — 排班唯一識別碼
- `ScheduleStatusSchema` / `type ScheduleStatus` — enum: `"PROPOSAL"|"OFFICIAL"|"COMPLETED"|"REJECTED"`
- `ScheduleOriginTypeSchema` / `type ScheduleOriginType` — enum: `"MANUAL"|"TASK_AUTOMATION"`
- `EffortUnitSchema` / `type EffortUnit` — enum: `"hours"|"days"|"units"`
- `AssignmentStatusSchema` / `type AssignmentStatus` — 指派狀態 enum
- `interface SkillRequirement` — 技能要求結構（skillSlug, minTier, quantity?）

---

## `domain.workforce/_entity.ts`
**描述**: `ScheduleAssignment` Aggregate Root，代表一個排班指派記錄。
**不變式**:
- 只有 PROPOSAL 狀態可被核准或拒絕
- COMPLETED 狀態不可再變更
**函數清單**:
- `interface ScheduleLocation` — 排班地點資訊（type: "onsite"|"remote"|"hybrid"）
- `interface ScheduleAssignment` — Aggregate Root 結構（id, workspaceId, assigneeId, startAt, endAt, status, originType）
- `buildScheduleProposal(params, now): ScheduleAssignment` — 建立排班提案 entity

---

## `domain.workforce/_events.ts`
**描述**: Workforce Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface ScheduleProposalCreated` — 排班提案建立事件
- `interface ScheduleApproved` — 排班核准事件
- `interface ScheduleRejected` — 排班拒絕事件
- `interface ScheduleCompleted` — 排班完成事件
- `type WorkforceDomainEventUnion` — 上述事件的 union type

---

## `domain.workforce/_ports.ts`
**描述**: Workforce domain 的 Port 介面定義。
**函數清單**:
- `interface IScheduleRepository` — 排班持久化（findById, findByWorkspace, findByAssignee, save）
- `interface IEligibilityCheckPort` — 資格審核 Port（checkEligibility: 驗證指派人是否符合技能要求）

---

## `domain.workforce/_service.ts`
**描述**: Workforce Domain Services — 純函數，跨多個排班 aggregate 的業務規則。Wave 10 實作。
**函數清單**:
- `interface EligibleMemberSkill` — 成員技能快照（skillSlug, tier）
- `interface EligibleMemberSnapshot` — 可指派成員快照（accountId, eligible, skills[]）
- `interface CandidateAssignment` — 單一指派決策（candidate, requirement）
- `const SAGA_TIER_ORDER` — 技能等級有序陣列（apprentice→titan）
- `sagaTierIndex(tier): number` — 取得技能等級的序數（未知等級預設 0）
- `findEligibleCandidate(members, requirements): EligibleMemberSnapshot | undefined` — 找到第一個滿足所有技能需求的成員
- `findEligibleCandidatesForRequirements(members, requirements): CandidateAssignment[] | undefined` — 多槽位指派：為每個技能需求找到足夠數量的成員
- `isCapacitySufficient(schedules, memberCount, startDate, endDate): boolean` — 容量充足性檢查
- `interface ScheduleConflict` — 時間衝突報告（assigneeId, scheduleAId, scheduleBId, overlapStart, overlapEnd）
- `detectScheduleConflicts(schedules): ScheduleConflict[]` — 偵測 OFFICIAL 排班的時間重疊
- `const VALID_STATUS_TRANSITIONS` — 排班狀態機有效轉換表
- `canTransitionScheduleStatus(from, to): boolean` — 驗證狀態轉換合法性

---

## `infra.firestore/_repository.ts`
**描述**: `IScheduleRepository` 的 Firestore 實作。Wave 10 實作。
**函數清單**:
- `class FirestoreScheduleRepository` — implements `IScheduleRepository`
  - `findById(id): Promise<ScheduleAssignment | null>`
  - `findByWorkspaceId(workspaceId): Promise<ScheduleAssignment[]>`
  - `findByAccountId(accountId): Promise<ScheduleAssignment[]>`
  - `findByAssigneeId(assigneeId): Promise<ScheduleAssignment[]>`（uses `array-contains` query）
  - `save(schedule): Promise<void>`
  - `deleteById(id): Promise<void>`

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ ScheduleAssignment 的雙向轉換，含技能要求與地點子文件。Wave 10 實作。
**函數清單**:
- `interface ScheduleDoc` — 原始 Firestore 文件結構
- `interface ScheduleLocationDoc` — 地點子文件
- `interface SkillRequirementDoc` — 技能要求子文件
- `scheduleDocToEntity(doc): ScheduleAssignment` — Firestore → domain
- `scheduleEntityToDoc(entity): ScheduleDoc` — domain → Firestore
