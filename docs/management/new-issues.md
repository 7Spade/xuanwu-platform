# New Issues — Module Boundary Violations (2026-03-17)

> Tags: `boundary` `ddd` `architecture` `presentation-layer` `infra-leak`
> Found by: systematic `_components` import audit across all 21 modules.
> Owner: `xuanwu-quality` + `xuanwu-implementer`

---

## Summary at a Glance

| ID | Severity | Module | Violation |
|----|----------|--------|-----------|
| BDY-001 | 🔴 Critical | `collaboration.module` | `_components` 直接實例化 `infra.firestore/_repository` |
| BDY-002 | 🔴 Critical | `fork.module` | `_components` 直接實例化 `infra.firestore/_repository` |
| BDY-003 | 🔴 Critical | `social.module` | `_components` 直接實例化 `infra.firestore/_repository` |
| BDY-004 | 🔴 Critical | `workforce.module` | `_components` 直接實例化 `infra.firestore/_repository` |
| BDY-005 | 🟡 Moderate | `collaboration.module` | `_components` → `core/_use-cases` 直通，繞過 `index.ts` |
| BDY-006 | 🟡 Moderate | `fork.module` | `_components` → `core/_use-cases` 直通，繞過 `index.ts` |
| BDY-007 | 🟡 Moderate | `social.module` | `_components` → `core/_use-cases` 直通，繞過 `index.ts` |
| BDY-008 | 🟡 Moderate | `workforce.module` | `_components` → `core/_use-cases` 直通，繞過 `index.ts` |
| BDY-009 | 🟡 Moderate | `achievement.module` | `_components` → `core/_use-cases` 直通，繞過 `index.ts` |
| BDY-010 | 🟡 Moderate | `notification.module` | `_components` → `core/_use-cases` 直通，繞過 `index.ts` |
| BDY-011 | 🟡 Moderate | `social.module` | `_components` → `domain.social/_value-objects` 直通 |
| BDY-012 | 🟡 Moderate | `fork.module` | `index.ts` 繞過 `_actions`/`_queries`，直接 re-export `_use-cases` |
| BDY-013 | 🟡 Moderate | `workforce.module` | `index.ts` 繞過 `_actions`/`_queries`，直接 re-export `_use-cases` |
| BDY-014 | 🟡 Moderate | `social.module` | `index.ts` 繞過 `_actions`/`_queries`，直接 re-export `_use-cases` |
| BDY-015 | 🟡 Moderate | `achievement.module` | `index.ts` 繞過 `_actions`/`_queries`，直接 re-export `_use-cases` |
| BDY-016 | 🟡 Moderate | `notification.module` | `index.ts` 繞過 `_actions`/`_queries`，直接 re-export `_use-cases` |
| BDY-017 | 🟡 Moderate | `collaboration.module` | `index.ts` 繞過 `_actions`/`_queries`，直接 re-export `_use-cases` |

---

## 🔴 Critical: Presentation Layer 直接實例化 Infrastructure Repository

### BDY-001 — `collaboration.module` infra leak in `_components`

**檔案:** `src/modules/collaboration.module/_components/comment-thread.tsx`

**違規 import:**
```typescript
import { postComment } from "@/modules/collaboration.module/core/_use-cases";
import { FirestoreCommentRepository } from "@/modules/collaboration.module/infra.firestore/_repository";
import type { CommentDTO } from "@/modules/collaboration.module/core/_use-cases";
```

**問題:** `FirestoreCommentRepository` 在 component 內以 singleton 模式實例化 (`let _repo = new FirestoreCommentRepository()`)。Presentation layer 不應感知 Infrastructure。

**修復方向:**
1. `core/_actions.ts` 補上 `postComment(id, workspaceId, ...)` facade（不傳 repo 參數）— 內部自行持有 `FirestoreCommentRepository` 單例。
2. `index.ts` 從 `core/_actions` re-export `postComment`。
3. `comment-thread.tsx` 改 import `postComment` from `@/modules/collaboration.module`，刪除 `FirestoreCommentRepository` import 與 `getRepo()` 函式。

---

### BDY-002 — `fork.module` infra leak in `_components`

**檔案:** `src/modules/fork.module/_components/forks-view.tsx`

**違規 import:**
```typescript
import { abandonFork } from "@/modules/fork.module/core/_use-cases";
import { FirestoreForkRepository } from "@/modules/fork.module/infra.firestore/_repository";
import type { ForkDTO } from "@/modules/fork.module/core/_use-cases";
```

**問題:** 同 BDY-001，`_components` 直接 `new FirestoreForkRepository()`。

**修復方向:**
1. `core/_actions.ts` 補上 `abandonFork(id)` facade，內部持有 `FirestoreForkRepository` 單例。
2. `index.ts` 從 `core/_actions` re-export（見 BDY-012）。
3. `forks-view.tsx` 改使用 `abandonFork` from `@/modules/fork.module`。

---

### BDY-003 — `social.module` infra leak in `_components`

**檔案:** `src/modules/social.module/_components/social-actions-bar.tsx`

**違規 import:**
```typescript
import { FirestoreSocialGraphRepository } from "@/modules/social.module/infra.firestore/_repository";
import { toggleReaction, getReactionState } from "@/modules/social.module/core/_use-cases";
import type { SocialTargetType } from "@/modules/social.module/domain.social/_value-objects";
```

**問題:** 三層違規：Infra、Core use-case、Domain value-object 全部直通到 component。

**修復方向:**
1. `core/_actions.ts` 補 `toggleReaction(subjectAccountId, targetId, targetType, relationType)` facade。
2. `core/_queries.ts` 補 `getReactionState(subjectAccountId, targetId, relationType)` facade。
3. `index.ts` 從 `_actions`/`_queries` re-export；`SocialTargetType` 已在 `index.ts` 中 export，只需改 component import 來源。
4. `social-actions-bar.tsx` 刪除 `FirestoreSocialGraphRepository` import 與 `getRepo()` 函式，改從 `@/modules/social.module` 取用所有需要的符號。

---

### BDY-004 — `workforce.module` infra leak in `_components`

**檔案:** `src/modules/workforce.module/_components/workforce-schedule-view.tsx`

**違規 import:**
```typescript
import { approveSchedule, rejectSchedule } from "@/modules/workforce.module/core/_use-cases";
import { FirestoreScheduleRepository } from "@/modules/workforce.module/infra.firestore/_repository";
import type { ScheduleDTO } from "@/modules/workforce.module/core/_use-cases";
```

**問題:** 同 BDY-001，`_components` 直接 `new FirestoreScheduleRepository()`。

**修復方向:**
1. `core/_actions.ts` 補 `approveSchedule(id)` / `rejectSchedule(id)` facade，內部持有 `FirestoreScheduleRepository` 單例。
2. `index.ts` 從 `core/_actions` re-export（見 BDY-013）。
3. `workforce-schedule-view.tsx` 改使用 facade，刪除 infra import。

---

## 🟡 Moderate: `_components` 繞過 `index.ts`，直接 import `core/_use-cases`

### BDY-005 ~ BDY-010 — 六個模組的 `_components` 直通 `core/_use-cases`

| ID | 模組 | 檔案 | 繞過的符號 |
|----|------|------|-----------|
| BDY-005 | `collaboration` | `comment-thread.tsx` | `postComment`, `CommentDTO` |
| BDY-006 | `fork` | `forks-view.tsx` | `abandonFork`, `ForkDTO` |
| BDY-007 | `social` | `social-actions-bar.tsx` | `toggleReaction`, `getReactionState` |
| BDY-008 | `workforce` | `workforce-schedule-view.tsx` | `approveSchedule`, `rejectSchedule`, `ScheduleDTO` |
| BDY-009 | `achievement` | `achievement-badge.tsx` | `AchievementDTO` |
| BDY-010 | `notification` | `notification-item.tsx` | `NotificationDTO` |

**修復方向（統一）:** 確保 `index.ts` 已 export 所需符號後，將 component 內的
`from "@/modules/xxx.module/core/_use-cases"` 改為 `from "@/modules/xxx.module"`。

---

## 🟡 Moderate: `_components` 直接 import Domain Layer

### BDY-011 — `social.module` domain value-object 直通

**檔案:** `src/modules/social.module/_components/social-actions-bar.tsx`

**違規 import:**
```typescript
import type { SocialTargetType } from "@/modules/social.module/domain.social/_value-objects";
```

**狀態:** `social.module/index.ts` 已 export `SocialTargetType`，直接改 import 路徑即可修復。

---

## 🟡 Moderate: `index.ts` Facade 層未就位（`_actions`/`_queries` stub 未接 repo）

### BDY-012 ~ BDY-017 — 六個模組 `index.ts` 直接 re-export `_use-cases`

**現象:** `index.ts` 的 export 指向 `./core/_use-cases`，而非 `./core/_actions` 或 `./core/_queries`。`_actions.ts`/`_queries.ts` 雖已存在，但屬「pass-through stub」（仍接受 `repo` 參數），未完成 adapter-backed facade 模式。

**對照 account.module 正確模式:**
```typescript
// core/_actions.ts — 正確：自行持有 repo 單例，不暴露 repo 至外部
const accountRepository = new FirestoreAccountRepository();
export async function createPersonalAccount(uid: string, displayName: string) {
  return createPersonalAccountUseCase(accountRepository, uid, displayName);
}
// index.ts — 正確：從 _actions/_queries re-export
export { createPersonalAccount } from "./core/_actions";
```

| ID | 模組 | `index.ts` 現況 | 需要改為 |
|----|------|----------------|---------|
| BDY-012 | `fork` | export from `./core/_use-cases` | export from `./core/_actions` / `./core/_queries` |
| BDY-013 | `workforce` | export from `./core/_use-cases` | export from `./core/_actions` / `./core/_queries` |
| BDY-014 | `social` | export from `./core/_use-cases` | export from `./core/_actions` / `./core/_queries` |
| BDY-015 | `achievement` | export from `./core/_use-cases` | export from `./core/_actions` / `./core/_queries` |
| BDY-016 | `notification` | export from `./core/_use-cases` | export from `./core/_actions` / `./core/_queries` |
| BDY-017 | `collaboration` | export from `./core/_use-cases` | export from `./core/_actions` / `./core/_queries` |

**修復方向（每個模組）:**
1. 將 `core/_actions.ts` 改為 adapter-backed facade：移除 `repo` 參數，在檔案頂層建立 `const xxxRepository = new FirestoreXxxRepository()` 單例，包裝所有 write use-cases。
2. 將 `core/_queries.ts` 同樣改為 adapter-backed facade：包裝所有 read use-cases。
3. `index.ts` 改為從 `./core/_actions` 和 `./core/_queries` re-export DTOs 及函式。

---

## Fix Priority

```
BDY-001 ~ BDY-004  (🔴 Infra in Presentation)  → 最優先，架構完整性
BDY-012 ~ BDY-017  (🟡 _actions/_queries stub)  → 配合 BDY-001~004 一起修，facade 就位後 component 才能改
BDY-005 ~ BDY-011  (🟡 direct internal imports)  → facade 就位後改 import 路徑即完成
```

---

## Modules Confirmed Clean

下列 16 個模組（排除 5 個存根）在本次审計中無 `_components` boundary violations：

`account` · `audit` · `causal-graph` · `identity` · `namespace` · `search` · `settlement` · `work` · `workspace`  
存根（無 `_components`）：`governance` · `knowledge` · `subscription` · `taxonomy` · `vector-ingestion`
