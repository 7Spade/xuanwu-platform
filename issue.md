# Documentation Inconsistencies / 文件不一致問題報告

> 本文件記錄在 xuanwu-platform 儲存庫中發現的文件不一致項目。
> 每個問題包含：所在檔案、問題描述、以及建議修正方向。

---

## Issue 1：`docs/architecture/README.md` — 設計系統層級數量自相矛盾

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

### 建議修正

將第 19 行技術概覽表中的描述更新為：

```
Four-tier: primitives / components / patterns / tokens (see Design System)
```

---

## Issue 2：`docs/architecture/README.md` 與 `docs/architecture/adr/README.md` — ADR 索引不同步

**檔案：** `docs/architecture/README.md`（第 227–233 行）、`docs/architecture/adr/README.md`  
**嚴重程度：** 中

### 問題描述

兩份文件的 ADR 索引條目數量不一致：

| 文件 | ADR 條目 |
|------|---------|
| `docs/architecture/README.md` | ADR-001 ～ ADR-007（7 筆） |
| `docs/architecture/adr/README.md` | ADR-001 ～ ADR-005（5 筆） |

ADR-006（Adopt Modular DDD）和 ADR-007（Use `@atlaskit/pragmatic-drag-and-drop`）出現在 `docs/architecture/README.md`，但**未被加入** `docs/architecture/adr/README.md` 的索引中。

### 建議修正

在 `docs/architecture/adr/README.md` 的 ADR 索引表中補上：

```markdown
| ADR-006 | Adopt Modular DDD — each slice is self-contained, no shared global domain directory | Accepted | — |
| ADR-007 | Use `@atlaskit/pragmatic-drag-and-drop` for drag-and-drop interactions + VIs | Accepted | — |
```

---

## Issue 3：`docs/architecture/README.md` Domain Modules 表格缺少 `workforce.module`

**檔案：** `docs/architecture/README.md`（Domain Modules 章節）、`src/modules/README.md`  
**嚴重程度：** 低

### 問題描述

`src/modules/README.md` 列出了 5 個 Domain Module：

| Module | Layer |
|--------|-------|
| `org.module/` | SaaS |
| `workspace.module/` | Workspace |
| `file.module/` | Workspace |
| **`workforce.module/`** | **Bridge** |
| `settlement.module/` | SaaS |

但 `docs/architecture/README.md` 的 Domain Modules 表格**只列出 4 個**，漏掉了 `workforce.module/`（雖然 SaaS ↔ Workspace 邊界圖中提到了 Workforce Scheduling）。

### 建議修正

在 `docs/architecture/README.md` 的 Domain Modules 表格補上：

```markdown
| Workforce Scheduling | `src/modules/workforce.module/` | Bridge | Workforce Scheduling (SaaS ↔ Workspace bridge) |
```

---

## Issue 4：`.github/copilot-instructions.md` — i18n 指示指向不存在的檔案

**檔案：** `.github/copilot-instructions.md`（第 37–38 行）  
**嚴重程度：** 高

### 問題描述

`copilot-instructions.md` 的 i18n 規則要求更新以下兩個檔案：

```
public/localized-files/en.json
public/localized-files/zh-TW.json
```

但這個目錄和檔案**並不存在**。`public/` 只有 `firebase-messaging-sw.example.js`。

> **為何嚴重程度為「高」：** `.github/copilot-instructions.md` 是專案的 always-on 規則，GitHub Copilot Coding Agent 在每次任務中都會讀取並遵循此文件。若 Agent 依照錯誤指示嘗試更新不存在的 JSON 文件，將導致無效操作或創建多餘檔案。

### 實際狀況

專案實際使用的 i18n 方案是**程式碼內嵌字典**，定義在：

```
src/shared/i18n/index.ts
```

字典為 `Dictionary` 型別，包含 `en` 和 `zh-TW` 兩個 locale，在 build 時編譯，**不需要外部 JSON 檔案**。

### 建議修正

將 `.github/copilot-instructions.md` 的 i18n 章節修改為：

```markdown
### i18n

- Do not hardcode UI text in pages or components.
- When UI text changes, update the in-code translation dictionary in:
  - `src/shared/i18n/index.ts` (add keys to both the `en` and `zh-TW` locale entries)
```

---

## Issue 5：`README.md` — DDD 層次結構圖描述的目錄不存在

**檔案：** `README.md`（DDD Layer Structure 章節，約第 218–235 行）  
**嚴重程度：** 高

### 問題描述

`README.md` 的 DDD Layer Structure 區塊顯示如下目錄結構：

```
src/
├── shared/
│   ├── domain/        # 不存在
│   ├── ui/            # 不存在
│   └── lib/           # 不存在
└── <domain>/          # Domain slices (e.g., user, product)
    ├── domain/
    ├── application/
    ├── infrastructure/
    └── ui/
```

這與實際程式碼結構**完全不符**：

1. `src/shared/` 的實際子目錄為：`constants/`、`directives/`、`errors/`、`i18n/`、`interfaces/`、`pipes/`、`types/`、`utils/`（**不含** `domain/`、`ui/`、`lib/`）
2. Domain 模組位於 `src/modules/<name>.module/`，**不是** `src/<domain>/`
3. 模組內部結構為 `domain.<aggregate>/`、`core/`、`infra.<adapter>/`、`_components/`，**不是** `domain/`、`application/`、`infrastructure/`、`ui/`

### 建議修正

將 README.md 的 DDD Layer Structure 區塊更新為與實際架構一致的描述，例如：

```
src/
├── app/                   # Next.js App Router (UI + route handlers only)
│   ├── @modal/            # Parallel route: modal slot
│   ├── @sidebar/          # Parallel route: sidebar slot
│   └── (features)/        # Feature-grouped route segments
├── modules/               # Domain Modules (Bounded Contexts)
│   └── <name>.module/     # e.g., org.module, workspace.module
│       ├── index.ts       # Public barrel — only export from here
│       ├── domain.<aggregate>/  # Domain layer (entities, VOs, ports, events)
│       ├── core/          # Application layer (use cases, actions, queries)
│       ├── infra.<adapter>/    # Infrastructure layer (Firestore, etc.)
│       └── _components/   # Presentation layer (React components)
├── design-system/         # Four-tier UI system (primitives/components/patterns/tokens)
├── infrastructure/        # Shared infrastructure (Firebase client + Admin SDK)
└── shared/                # Cross-cutting utilities (constants, i18n, interfaces, types, utils)
```

---

## Issue 6：`.github/README.md` 和 `.github/instructions/` — 引用不存在的 `docs/copilot/` 目錄

**檔案：** `.github/README.md`、`.github/instructions/xuanwu-customization-authoring.instructions.md`、`.github/instructions/xuanwu-test-expert.instructions.md`  
**嚴重程度：** 高

### 問題描述

多個文件頻繁引用 `docs/copilot/customization/` 路徑下的多個 Markdown 文件，例如：

```
docs/copilot/customization/custom-instructions.md
docs/copilot/customization/prompt-files.md
docs/copilot/customization/custom-agents.md
docs/copilot/customization/agent-skills.md
docs/copilot/customization/hooks.md
docs/copilot/customization/agent-plugins.md
docs/copilot/customization/overview.md
```

然而 **`docs/copilot/` 目錄不存在**。`docs/` 目錄下只有 `architecture/`。

### 受影響的引用位置

| 檔案 | 行數 |
|------|------|
| `.github/README.md` | 7–15, 43–50, 86, 112, 116, 120, 128, 135, 142 |
| `.github/instructions/xuanwu-customization-authoring.instructions.md` | 11 |
| `.github/instructions/xuanwu-test-expert.instructions.md` | 48–50 |
| `.github/copilot-instructions.md` | 30, 56 |

### 建議修正

**建議採用選項 B（更新引用為官方線上文件 URL）**，因為 `docs/` 目錄目前僅維護與本專案業務架構相關的文件（`docs/architecture/`），與 Copilot 工具的一般說明文件分屬不同關注點。建立一套 `docs/copilot/` 鏡像可能造成版本維護負擔。

**選項 B（推薦）：** 將所有 `docs/copilot/customization/*.md` 的引用替換為對應的官方 VS Code 線上文件 URL，例如：
- `https://code.visualstudio.com/docs/copilot/customization/custom-instructions`
- `https://code.visualstudio.com/docs/copilot/customization/prompt-files`
- `https://code.visualstudio.com/docs/copilot/customization/copilot-agents`
- `https://code.visualstudio.com/docs/copilot/customization/agent-skills`

**選項 A（備選）：** 在 `docs/copilot/customization/` 下建立對應的 Markdown 參考文件，並持續與官方文件同步更新。

---

## Issue 7：`src/design-system/tokens/README.md` 和 `src/infrastructure/firebase/README.md` — 文件描述尚未實現的組件為現有功能

**檔案：** `src/design-system/tokens/README.md`（原 `presentation/README.md`）、`src/infrastructure/firebase/README.md`  
**嚴重程度：** 低

### 問題描述

`tokens/` 層目前為規劃階段，令牌常數尚未從 `tailwind.config.ts` / `globals.css` 提取。`index.ts` 只有 `export {}`，所有匯出均以注解形式作為**佔位符（placeholder）**，等待後續實現。

Firebase README（Section 6）提供 Vis.js 和 PDnD 組件的**使用範例程式碼**，給人這些組件已可使用的印象，但相關組件（`VisNetwork`、`VisTimeline`、`DragDropBoard`）尚未實現。

### 建議修正

在 `src/infrastructure/firebase/README.md` 的相關使用範例程式碼旁，加入「尚未實現」的提示說明，例如：

```markdown
> ⚠️ 以下範例為**規劃中**的 API，相關組件尚未實現。待安裝依賴並實現組件後，此範例才可使用。
```

---

## 摘要表 / Summary

| # | 嚴重程度 | 受影響檔案 | 問題類型 |
|---|---------|-----------|---------|
| 1 | 中 | `docs/architecture/README.md` | 設計系統層數描述自相矛盾（3層 vs 4層） |
| 2 | 中 | `docs/architecture/README.md`、`docs/architecture/adr/README.md` | ADR 索引不同步（5筆 vs 7筆） |
| 3 | 低 | `docs/architecture/README.md`、`src/modules/README.md` | Domain Modules 表格缺少 `workforce.module/` |
| 4 | 高 | `.github/copilot-instructions.md` | i18n 指示引用不存在的 JSON 檔案路徑 |
| 5 | 高 | `README.md` | DDD 層次結構圖描述的目錄路徑與實際不符 |
| 6 | 高 | `.github/README.md`、`.github/instructions/` | 引用不存在的 `docs/copilot/` 目錄 |
| 7 | 低 | `src/design-system/tokens/README.md`、`src/infrastructure/firebase/README.md` | 文件範例描述尚未實現的組件如同現有功能 |
