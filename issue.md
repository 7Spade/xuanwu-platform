# Documentation Inconsistencies / 文件不一致問題報告

> 本文件記錄在 xuanwu-platform 儲存庫中發現的文件不一致項目。
> 每個問題包含：所在檔案、問題描述、以及建議修正方向。

---

## Issue 1：`docs/architecture/README.md` — 設計系統層級數量自相矛盾 ✅ FIXED

**檔案：** `docs/architecture/README.md`  
**嚴重程度：** 中

### 問題描述

同一份文件在不同位置對設計系統的層數有衝突的描述：

| 位置 | 描述 |
|------|------|
| 第 19 行（技術概覽表） | `"Three-tier: primitives / components / patterns"` |
| 第 124 行（Design System 章節） | `"follows a **four-tier hierarchy**"` |

### 實際狀況

程式碼確認是**四層**：`primitives`、`components`、`patterns`、`tokens`。

- `src/design-system/index.ts`：`export * from "./primitives"; export * from "./components"; export * from "./patterns"; export * from "./tokens";`（四個層級均有匯出）
- `src/design-system/` 目錄下存在 `primitives/`、`components/`、`patterns/`、`tokens/` 四個子目錄

### 修正

將第 19 行技術概覽表更新為：`Four-tier: primitives / components / patterns / tokens (see Design System)`

---

## Issue 2：`docs/architecture/README.md` 與 `docs/architecture/adr/README.md` — ADR 索引不同步 ✅ FIXED

**檔案：** `docs/architecture/README.md`（第 227–233 行）、`docs/architecture/adr/README.md`  
**嚴重程度：** 中

### 問題描述

兩份文件的 ADR 索引條目數量不一致：

| 文件 | ADR 條目 |
|------|---------|
| `docs/architecture/README.md` | ADR-001 ～ ADR-007（7 筆） |
| `docs/architecture/adr/README.md` | ADR-001 ～ ADR-005（5 筆） |

ADR-006（Adopt Modular DDD）和 ADR-007（Use `@atlaskit/pragmatic-drag-and-drop`）出現在 `docs/architecture/README.md`，但**未被加入** `docs/architecture/adr/README.md` 的索引中。

### 修正

已在 `docs/architecture/adr/README.md` 的 ADR 索引表中補上 ADR-006（"each module is self-contained" — 術語從 "slice" 更新為 "module" 以與 Domain Module 重命名保持一致）和 ADR-007。

---

## Issue 3：`docs/architecture/README.md` Domain Modules 表格缺少 `workforce.module` ✅ FIXED

**檔案：** `docs/architecture/README.md`（Domain Modules 章節）、`src/modules/README.md`  
**嚴重程度：** 低

### 問題描述

`src/modules/README.md` 列出了 5 個 Domain Module，但 `docs/architecture/README.md` 的 Domain Modules 表格只列出 4 個，漏掉了 `workforce.module/`（雖然 SaaS ↔ Workspace 邊界圖中提到了 Workforce Scheduling）。

### 修正

已在 `docs/architecture/README.md` 的 Domain Modules 表格補上 `workforce.module/`（Layer: Bridge）。

---

## Issue 4：`.github/copilot-instructions.md` — i18n 指示指向不存在的檔案 ✅ FIXED

**檔案：** `.github/copilot-instructions.md`（第 36–38 行）  
**嚴重程度：** 高

### 問題描述

`copilot-instructions.md` 的 i18n 規則要求更新 `public/localized-files/en.json` 和 `public/localized-files/zh-TW.json`，但這些檔案**不存在**。

> **為何嚴重程度為「高」：** `.github/copilot-instructions.md` 是專案的 always-on 規則，GitHub Copilot Coding Agent 在每次任務中都會讀取並遵循此文件。

### 實際狀況

專案實際使用的 i18n 方案是**程式碼內嵌字典**，定義在 `src/shared/i18n/index.ts`。

### 修正

已將 `.github/copilot-instructions.md` 的 i18n 章節修改為引用 `src/shared/i18n/index.ts`。

---

## Issue 5：`README.md` — DDD 層次結構圖描述的目錄不存在 ✅ FIXED

**檔案：** `README.md`（DDD Layer Structure 章節）  
**嚴重程度：** 高

### 問題描述

`README.md` 的 DDD Layer Structure 區塊顯示 `src/shared/domain/`、`src/shared/ui/`、`src/<domain>/application/` 等目錄，但這些路徑**完全不存在**。

### 修正

已更新 `README.md` 的 DDD Layer Structure 為與實際架構一致的描述，使用 `src/modules/<name>.module/` 結構。

---

## Issue 6：`.github/README.md` 和 `.github/instructions/` — 引用不存在的 `docs/copilot/` 目錄 ✅ FIXED

**檔案：** `.github/README.md`、`.github/instructions/xuanwu-customization-authoring.instructions.md`、`.github/instructions/xuanwu-test-expert.instructions.md`、`.github/copilot-instructions.md`、`.github/skills/xuanwu-test-expert/SKILL.md`  
**嚴重程度：** 高

### 問題描述

多個文件頻繁引用 `docs/copilot/customization/` 路徑下的多個 Markdown 文件，但 **`docs/copilot/` 目錄不存在**。`docs/` 目錄下只有 `architecture/`。

### 修正

已將所有 `docs/copilot/customization/*.md` 的引用替換為對應的官方 VS Code 線上文件 URL：

- `docs/copilot/customization/custom-instructions.md` → `https://code.visualstudio.com/docs/copilot/customization/custom-instructions`
- `docs/copilot/customization/prompt-files.md` → `https://code.visualstudio.com/docs/copilot/customization/prompt-files`
- `docs/copilot/customization/custom-agents.md` → `https://code.visualstudio.com/docs/copilot/customization/copilot-agents`
- `docs/copilot/customization/agent-skills.md` → `https://code.visualstudio.com/docs/copilot/customization/agent-skills`
- `docs/copilot/customization/hooks.md` → `https://code.visualstudio.com/docs/copilot/customization/hooks`
- `docs/copilot/customization/agent-plugins.md` → `https://code.visualstudio.com/docs/copilot/customization/agent-plugins`
- `docs/copilot/customization/overview.md` → `https://code.visualstudio.com/docs/copilot/customization`

---

## Issue 7：`src/design-system/tokens/README.md` 和 `src/infrastructure/firebase/README.md` — 文件描述尚未實現的組件為現有功能 ✅ FIXED

**檔案：** `src/design-system/tokens/README.md`（原 `presentation/README.md`）、`src/infrastructure/firebase/README.md`  
**嚴重程度：** 低

### 問題描述

`tokens/` 層目前為規劃階段，`index.ts` 只有 `export {}`。Firebase README（Section 6）提供 Vis.js 和 PDnD 組件的使用範例程式碼，給人這些組件已可使用的印象，但 `VisNetwork`、`VisTimeline`、`DragDropBoard` 尚未實現。

另外，Firebase README Section 6 原本寫 `presentation/` 層，但正確路徑是各 Module 的 `_components/` 目錄。

### 修正

- 已在 `src/infrastructure/firebase/README.md` Section 6 開頭加入「尚未實現」警告說明。
- 已將 Section 6 中的 `presentation/` 引用修正為 `_components/`。

---

## Issue 8：`docs/architecture/README.md` — Visual Indicators 路徑錯誤 ✅ FIXED

**檔案：** `docs/architecture/README.md`（第 148 行）  
**嚴重程度：** 中

### 問題描述

文件描述 Visual Indicators (VIs) 位置時使用了錯誤的路徑：

```
They live in the module's presentation layer (`src/modules/<module>/presentation/`)
```

但 Domain Module 的 Presentation Layer 實際路徑是 `_components/`，不是 `presentation/`。

### 修正

已將第 148 行更新為：`src/modules/<module>/_components/`。

---

## Issue 9：`.github/agents/xuanwu-ui.agent.md` — i18n 指示指向不存在的 JSON 檔案 ✅ FIXED

**檔案：** `.github/agents/xuanwu-ui.agent.md`（第 68 行、第 77 行）  
**嚴重程度：** 高

### 問題描述

`xuanwu-ui.agent.md` 的 i18n 規則與 Issue 4 相同問題 — 要求更新 `public/localized-files/en.json` 和 `public/localized-files/zh-TW.json`，但這些檔案不存在。Issue 4 修正了 `copilot-instructions.md`，但遺漏了此 Agent 定義檔案。

### 修正

已將 `xuanwu-ui.agent.md` 的 i18n 章節更新為引用 `src/shared/i18n/index.ts`。

---

## Issue 10：`.github/instructions/xuanwu-application-architecture.instructions.md` — 仍使用 Feature Slice 術語 ✅ FIXED

**檔案：** `.github/instructions/xuanwu-application-architecture.instructions.md`  
**嚴重程度：** 中

### 問題描述

此指令檔案標題仍使用 "feature-slice boundaries" 和 "Feature Slice Architecture"，與 PR #10 將術語從 `features/slice` 改為 `modules/module` 的決策不一致：

| 位置 | 舊術語 | 正確術語 |
|------|--------|---------|
| 第 3 行（description） | `"feature-slice boundaries"` | `"Domain Module boundaries"` |
| 第 9 行（章節標題） | `## Feature Slice Architecture` | `## Domain Module Architecture` |
| 第 11–14 行（規則） | `feature queries.ts / feature adapters / cross-feature imports / feature READMEs` | `module queries.ts / module adapters / cross-module imports / module READMEs` |

### 修正

已更新 `xuanwu-application-architecture.instructions.md` 中的所有 "feature" / "slice" 術語為 "module" / "Domain Module"。

---

## Issue 11：`.github/copilot-instructions.md` — 仍使用 "slice boundaries" 術語 ✅ FIXED

**檔案：** `.github/copilot-instructions.md`（第 22 行、第 54 行）  
**嚴重程度：** 低

### 問題描述

`copilot-instructions.md` 在兩個地方仍使用 "slice boundaries" 術語，與 Domain Module 重命名不一致：

- 第 22 行：`"Respect layer direction, slice boundaries, and public APIs."`
- 第 54 行：`"verify architecture correctness, slice boundaries, and existing tests"`

### 修正

已將兩處 "slice boundaries" 更新為 "module boundaries"。

---

## Issue 12：多個 DDD 相關檔案 — 引用不存在的 `docs/architecture/` 子目錄 ✅ FIXED

**檔案：** `.github/instructions/xuanwu-ddd-layers.instructions.md`（第 110–112 行）、`.github/skills/ddd-architecture/SKILL.md`（第 213–214 行）、`.github/prompts/ddd-domain-model.prompt.md`（第 21 行）、`.github/prompts/ddd-slice-scaffold.prompt.md`（第 43 行）  
**嚴重程度：** 中

### 問題描述

多個 DDD 指令/技能/提示檔案引用了不存在的 `docs/architecture/` 子目錄：

| 引用路徑 | 實際存在？ |
|---------|----------|
| `docs/architecture/models/domain-model.md` | ❌ 不存在 |
| `docs/architecture/blueprints/application-service-spec.md` | ❌ 不存在 |
| `docs/architecture/guidelines/infrastructure-spec.md` | ❌ 不存在 |

`docs/architecture/` 實際只有：`README.md`、`adr/`、`catalog/`、`diagrams/`、`glossary/`

### 修正

已將所有幻象路徑替換為實際存在的文件路徑：
- `docs/architecture/models/domain-model.md` → `docs/architecture/catalog/business-entities.md` + `docs/architecture/glossary/business-terms.md`
- `docs/architecture/blueprints/application-service-spec.md` → `docs/architecture/README.md`
- `docs/architecture/guidelines/infrastructure-spec.md` → `docs/architecture/README.md`

---

## Issue 13：`.github/prompts/ddd-slice-scaffold.prompt.md` — `.serena\memories\*` 幻象本地路徑

**檔案：** `.github/prompts/ddd-slice-scaffold.prompt.md`（第 57 行）  
**嚴重程度：** 低

### 問題描述

Guardrails 章節引用 `.serena\memories\*`（Windows 反斜線格式路徑），但 `.serena/` 目錄**不存在**於本地儲存庫中。Serena 的 memories 是透過 MCP 伺服器管理的，不是本地目錄。

### 修正

已將 `.serena\memories\*` 替換為 `Serena project memories`（描述性文字，不引用本地路徑）。

---

## Issue 14：多個 prompt/agent/instruction 檔案 — 仍使用 "slice" 術語或路徑慣例不符 ✅ FIXED

**嚴重程度：** 低至中

### 問題描述

以下檔案在 PR #10 重命名後仍有殘留 "slice" 術語或路徑不符合 `<name>.module/` 慣例：

| 檔案 | 問題 |
|------|------|
| `.github/prompts/xuanwu-refactor.prompt.md` | argument-hint 範例使用 `src/modules/auth/service.ts`（缺少 `.module` 後綴） |
| `.github/prompts/xuanwu-architect.prompt.md` | description 使用 "vertical slices"；modes 使用 "slice boundaries"、"Vertical slice design"；argument-hint 使用 "reporting slice" |
| `.github/prompts/xuanwu-code-review.prompt.md` | argument-hint 使用 `review src/modules/auth`（缺少 `.module` 後綴） |
| `.github/prompts/ddd-infrastructure-adapter.prompt.md` | "Feature slice domain.*"；輸出路徑 `src/modules/infra.*/`（缺少模組段） |
| `.github/prompts/ddd-layer-audit.prompt.md` | D24 規則中 `src/modules/infra.*` 路徑無效（缺少模組段） |
| `.github/prompts/ddd-domain-model.prompt.md` | argument-hint 和 input 使用 `.slice` 後綴 |
| `.github/prompts/ddd-slice-scaffold.prompt.md` | scaffold 路徑使用 `{slice-name}` 而非 `{module-name}.module` |
| `AGENTS.md` | "owning slice" → "owning module" |
| `.github/instructions/xuanwu-ddd-layers.instructions.md` | "live inside the owning slice" |
| `.github/instructions/xuanwu-repo-structure.instructions.md` | "modules/" 誤導為根層目錄；範例使用 `feature/` 路徑 |
| `.github/agents/ddd-infrastructure.agent.md` | "owning slice" |
| `.github/skills/ddd-architecture/SKILL.md` | 引用不存在的 `/ddd-module-scaffold` 提示；Server Action 路徑錯誤（`_actions.ts` 而非 `core/_actions.ts`） |
| `.github/skills/x-framework-guardian/SKILL.md` | "切片" → "模組"；"cross-slice" → "cross-module" |
| `README.md` | "DDD slices" 術語 |
| `src/modules/README.md` | 路徑描述為 `modules/` 而非 `src/modules/` |

### 修正

已批次修正所有上述檔案中的術語和路徑。

---

---

## Issue 15：`docs/architecture/README.md`、`src/modules/README.md` — `core-logic.mermaid` 中 3 個 Bounded Context 未對應到任何 Domain Module ✅ FIXED

**檔案：** `docs/architecture/README.md`（Domain Modules 章節）、`src/modules/README.md`、`docs/architecture/diagrams/core-logic.mermaid`
**嚴重程度：** 高

### 問題描述

`core-logic.mermaid` 序列圖定義了下列 participant，但兩份架構文件均未將其對應到任何 Domain Module：

| 邏輯圖 Participant | 所在章節 | 缺失的 Module |
|--------------------|---------|--------------|
| `Notify`（通知引擎）、`Inbox`（站內信 / 電子郵件 / 行動推播） | Section G — Event Bus and Notification Delivery | `notification.module` |
| `Social`（Star/Watch/Follow 圖譜）、`Feed`（儀表板 / 探索） | Section H — SaaS Extensions | `social.module` |
| `Achv`（成就規則）、`Profile`（使用者檔案） | Section I — Achievement Post-Processing | `achievement.module` |

### 分析：與現有架構的衝突點

1. **`notification.module` 缺失**：Section G 顯示 `EventBus → Notify → Inbox → User` 的完整通知鏈，Notify 負責依訂閱規則路由事件、解析收件者，Inbox 負責多管道投遞。這是獨立的 Bounded Context，但架構文件中完全缺失。

2. **`social.module` 缺失**：Section H 顯示 Social 與 Feed 作為獨立系統——`User->>Social: star or watch workspace`、`Social->>Feed: contribute discovery and ranking signals`、`Feed-->>User: dashboard and recommendation updates`。星號/關注/追蹤是獨立的圖譜資料模型，不屬於 `org.module` 或 `workspace.module`。

3. **`achievement.module` 缺失**：Section I 顯示完整的成就後處理流程——`Assignee->>Achv: complete qualifying WBS task activity`、`Achv->>Profile: unlock and render badge`。Achievement 有自己的規則評估引擎，Profile badge 渲染是獨立的 UI 關切點。

4. **`workspace.module` 描述不完整**：現有描述為 "Workspace · WBS · Issues · CR"，但邏輯圖 Section C 中還有 `QA`（質量檢查）和 `Acceptance`（驗收）兩個獨立的狀態機節點；Section F 還有 `Rules`（基線治理規則）、`Queue`（Merge Queue）、`Main`（Protected Baseline）。

5. **`Sec`（完整性與政策自動化）無 Module 歸屬**：Section H 中 `Sec` 執行 cross-module 一致性與政策檢查，是跨模組的治理關切，目前文件中無任何 Module 聲稱擁有它。此關切點由 `workspace.module` 的 Domain Service 層承接。

6. **`EventBus` 的架構定位未明**：邏輯圖中 EventBus 作為一個 participant 出現，但架構文件說事件應透過 port interfaces 發布。EventBus 應定位為 infrastructure 層關切點（`src/infrastructure/`），而非 Domain Module。

### 修正

已建立三個新 Domain Module 的完整目錄骨架：

```
src/modules/
├── notification.module/    ← 新增
│   ├── index.ts
│   ├── domain.notification/  (_entity, _value-objects, _ports, _events)
│   ├── core/                 (_use-cases, _actions, _queries)
│   ├── infra.firestore/      (_repository, _mapper)
│   └── _components/
├── social.module/          ← 新增
│   ├── index.ts
│   ├── domain.social/
│   ├── core/
│   ├── infra.firestore/
│   └── _components/
└── achievement.module/     ← 新增
    ├── index.ts
    ├── domain.achievement/
    ├── core/
    ├── infra.firestore/
    └── _components/
```

已更新 `docs/architecture/README.md` 和 `src/modules/README.md` 的 Domain Modules 表格以反映完整的 8 個模組。
已更新 `workspace.module` 的描述以包含 QA、Acceptance、Baseline 相關的 bounded context。

---

## Issue 16：`org.module` 和 `achievement.module` — `Namespace` 與 `Profile` 應為獨立 Module ✅ FIXED

**檔案：** `docs/architecture/README.md`（Domain Modules 章節）、`src/modules/README.md`、`src/modules/org.module/`、`src/modules/achievement.module/`
**嚴重程度：** 高

### 問題描述

#### 16-A：`NS`（Namespace）被歸入 `org.module`，但應為獨立模組

`core-logic.mermaid` Section A 顯示 Namespace 同時服務兩個路徑：

| 路徑 | 操作 |
|------|------|
| 組織建立路徑 | `Org->>NS: register organization namespace` |
| 個人工作空間路徑 | `User->>NS: register personal namespace` |
| 共享行為 | `NS->>WS: bind workspace under [org|personal] namespace` |
| Section H | `NS->>WS: resolve workspace path and ownership scope` |

`NS` 不是 `org.module` 的子集 — 它是一個**獨立的共享服務**，同時被組織和個人用戶使用。將它歸入 `org.module` 會造成個人工作空間依賴組織模組的錯誤邊界。

#### 16-B：`Profile`（使用者檔案）被歸入 `achievement.module`，但應為獨立模組

`Profile` 在 Section H（`Note over User,Profile: H. SaaS Extensions`）的章節標題中出現，表明它不僅屬於成就系統。多個 bounded context 寫入或讀取 Profile：

| 模組 | 對 Profile 的操作 |
|------|------------------|
| `achievement.module` | `Achv->>Profile: unlock and render badge` |
| `social.module` | 社交圖譜上下文中讀取用戶 Profile 資料 |

`Profile` 是跨領域的讀寫匯聚點，應為獨立模組。

#### 16-C：其他尚未有獨立 Module 的 Participant

| Participant | 所在章節 | 說明 |
|-------------|---------|------|
| `Work`（Work Items / Milestones / Dependencies） | Section H | 輕量規劃原語，與 WBS Tasks 不同；`Work->>WBS: attach WBS structured records` |
| `Forks`（Fork Network） | Section H | 工作空間規劃分支管理；`Forks->>CR: submit merge-back proposal` |
| `Apps`（Other Workspace Apps） | Section H | 文件、目標、表單、資產等模組 — 定義較模糊，暫歸入 `workspace.module` 待後續細化 |

### 修正

已新增 4 個 Domain Module 的完整目錄骨架（共計 12 個模組）：

```
src/modules/
├── namespace.module/   ← 新增（從 org.module 提取）
│   ├── index.ts
│   ├── domain.namespace/  (_entity, _value-objects, _ports, _events)
│   ├── core/              (_use-cases, _actions, _queries)
│   ├── infra.firestore/   (_repository, _mapper)
│   └── _components/
├── profile.module/     ← 新增（從 achievement.module 提取）
│   ├── index.ts
│   ├── domain.profile/
│   ├── core/
│   ├── infra.firestore/
│   └── _components/
├── work.module/        ← 新增
│   ├── index.ts
│   ├── domain.work/
│   ├── core/
│   ├── infra.firestore/
│   └── _components/
└── fork.module/        ← 新增
    ├── index.ts
    ├── domain.fork/
    ├── core/
    ├── infra.firestore/
    └── _components/
```

已更新 `org.module/index.ts` 說明 Namespace 已遷移至 `namespace.module`。
已更新 `achievement.module/index.ts` 說明 Profile 已遷移至 `profile.module`，並透過 `IProfileBadgeWritePort` 跨模組寫入。
已更新 `docs/architecture/README.md` 和 `src/modules/README.md` 的 Domain Modules 表格以反映完整的 12 個模組。

---

## 摘要表 / Summary

| # | 嚴重程度 | 受影響檔案 | 問題類型 | 狀態 |
|---|---------|-----------|---------|------|
| 1 | 中 | `docs/architecture/README.md` | 設計系統層數描述自相矛盾（3層 vs 4層） | ✅ Fixed |
| 2 | 中 | `docs/architecture/README.md`、`docs/architecture/adr/README.md` | ADR 索引不同步（5筆 vs 7筆） | ✅ Fixed |
| 3 | 低 | `docs/architecture/README.md`、`src/modules/README.md` | Domain Modules 表格缺少 `workforce.module/` | ✅ Fixed |
| 4 | 高 | `.github/copilot-instructions.md` | i18n 指示引用不存在的 JSON 檔案路徑 | ✅ Fixed |
| 5 | 高 | `README.md` | DDD 層次結構圖描述的目錄路徑與實際不符 | ✅ Fixed |
| 6 | 高 | `.github/README.md`、`.github/instructions/`、`.github/skills/` | 引用不存在的 `docs/copilot/` 目錄 | ✅ Fixed |
| 7 | 低 | `src/design-system/tokens/README.md`、`src/infrastructure/firebase/README.md` | 文件範例描述尚未實現的組件如同現有功能 | ✅ Fixed |
| 8 | 中 | `docs/architecture/README.md` | VIs 路徑錯誤（`presentation/` → `_components/`） | ✅ Fixed |
| 9 | 高 | `.github/agents/xuanwu-ui.agent.md` | i18n 指示引用不存在的 JSON 檔案路徑 | ✅ Fixed |
| 10 | 中 | `.github/instructions/xuanwu-application-architecture.instructions.md` | 仍使用 Feature Slice 術語而非 Domain Module | ✅ Fixed |
| 11 | 低 | `.github/copilot-instructions.md` | 仍使用 "slice boundaries" 術語 | ✅ Fixed |
| 12 | 中 | 多個 DDD 指令/技能/提示檔案 | 引用不存在的 `docs/architecture/models/`、`blueprints/`、`guidelines/` | ✅ Fixed |
| 13 | 低 | `.github/prompts/ddd-slice-scaffold.prompt.md` | `.serena\memories\*` 幻象本地路徑 | ✅ Fixed |
| 14 | 低至中 | 14 個 prompt/agent/instruction/skill 檔案 | 殘留 "slice" 術語或路徑慣例不符 `<name>.module/` | ✅ Fixed |
| 15 | 高 | `docs/architecture/README.md`、`src/modules/README.md`、`src/modules/` | `core-logic.mermaid` 中 3 個 Bounded Context（Notification、Social、Achievement）未對應到任何 Domain Module | ✅ Fixed |
| 16 | 高 | `org.module/`、`achievement.module/`、`docs/architecture/README.md`、`src/modules/README.md` | `Namespace` 被錯誤歸入 `org.module`；`Profile` 被錯誤歸入 `achievement.module`；`Work`、`Fork` 無獨立 Module | ✅ Fixed |
