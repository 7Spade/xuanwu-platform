# Semantics Issues / 語意衝突問題報告

> 記錄跨模組或同模組內**概念語意重疊、術語不一致、邊界模糊**的問題。
> 這類問題不一定造成即時執行錯誤，但長期會導致維護者理解偏差與模型腐化。

---

## SEM-002 `WorkspaceTask`（workspace.module）vs `WorkItemEntity`（work.module）語意重疊

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響模組** | `workspace.module`, `work.module` |
| **受影響檔案** | `domain.workspace/_entity.ts`, `domain.work/_entity.ts` |

**問題描述**  
兩個模組都定義了「任務」概念：

| 特性 | `WorkspaceTask`（workspace.module） | `WorkItemEntity`（work.module） |
|------|-------------------------------------|--------------------------------|
| 位置 | 嵌入於 `WorkspaceEntity.tasks` | 獨立聚合根 |
| 主鍵方式 | `Record<string, WorkspaceTask>` key | `WorkItemId` |
| 進度欄位 | `progressState: TaskState` | `status: WorkItemStatus` |
| 標題欄位 | `name: string` | `title: string` |
| 財務欄位 | `quantity`, `unitPrice`, `subtotal` | `quantity`, `unitPrice`, `discount`, `subtotal` |

兩者都涵蓋了任務的進度、財務金額、指派、父子關係等欄位，但命名不統一。

**根本原因**  
`work.module` 負責獨立的 WBS 工作項目管理，而 `workspace.module` 內嵌了一個與其高度相似的 `WorkspaceTask`，
可能是歷史遺留或並行開發造成的語意分裂。

**建議修正方向**  
1. 釐清職責邊界：`WorkspaceTask`（workspace.module）是否應委派給 `work.module` 的 `WorkItemEntity`？
2. 若兩者確有不同語意（Workspace-level task vs. WBS Work Item），需在文件中明確定義差異。
3. 統一命名：`name` vs `title`，`progressState` vs `status`。

---

## SEM-004 單一 `assigneeId` vs 複數 `assigneeIds` 語意不一致

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響模組** | `workspace.module`, `work.module`, `workforce.module` |

**問題描述**  
「任務被指派給誰」這個概念在不同模組中建模方式不同：

| 位置 | 欄位 | 型別 |
|------|------|------|
| `WorkspaceTask.assigneeId` | 可選單一人員 | `string \| undefined` |
| `WorkItemEntity.assigneeId` | 可選單一人員 | `string \| undefined` |
| `ScheduleAssignment.assigneeIds` | 必填陣列 | `readonly string[]` |

同一業務概念（「指派」）建模為不同型別，且無文件說明是刻意設計（排班需要多人同時指派）還是歷史不一致。

**建議修正方向**  
在 Glossary 中定義：「assignee（單一）」與「assignees（多人）」各自適用的場景，
並確保欄位名稱反映複數或單數語意。

---

> **已轉譯為 ADR 的問題** / Issues translated to ADRs:
> - SEM-001, SEM-006 → [ADR-010](../architecture/adr/20260316-status-semantic-disambiguation.md): `status` field semantic disambiguation
> - SEM-003, SEM-005 → [ADR-012](../architecture/adr/20260316-workspace-namespace-isolation.md): Workspace-Namespace isolation
