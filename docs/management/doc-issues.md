# Documentation Issues / 文檔問題報告

> ⚠️ Historical snapshot: this file records legacy findings from earlier audit passes.
> Current governance baseline and active conflict classification are maintained in [`documentation-governance-baseline.md`](./documentation-governance-baseline.md).
> Scoped full inventory is maintained in [`documentation-index.md`](./documentation-index.md).

---

## [失效連結] Broken Links

### DOC-001 `docs/architecture/README.md` — MDHA 相對路徑錯誤

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響檔案** | `docs/architecture/README.md` |
| **行號** | 14, 31 |
| **失效路徑** | `./model-driven-hexagonal-architecture.md` |
| **實際路徑** | `./notes/model-driven-hexagonal-architecture.md` |

**問題描述**  
`docs/architecture/README.md` 中兩處超連結（Navigation 段落 line 31，以及 line 14 的正文引用）指向
`./model-driven-hexagonal-architecture.md`，但該檔案自遷移後位於 `docs/architecture/notes/` 子目錄。

**建議修正**
```diff
- [Model-Driven Hexagonal Architecture guide](./model-driven-hexagonal-architecture.md)
+ [Model-Driven Hexagonal Architecture guide](./notes/model-driven-hexagonal-architecture.md)
```

---

### DOC-002 `docs/architecture/README.md` — Architecture Issues 連結路徑雙重巢套

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響檔案** | `docs/architecture/README.md` |
| **行號** | 33 |
| **失效路徑** | `./docs/management/issues.md` |
| **實際路徑** | `../management/issues.md` |

**問題描述**  
Navigation 段落中 Architecture Issues 連結使用 `./docs/management/issues.md`，但 `docs/architecture/README.md` 本身已位於 `docs/architecture/`，因此正確的相對路徑應是 `../management/issues.md`。

**建議修正**
```diff
- [**Architecture Issues**](./docs/management/issues.md)
+ [**Architecture Issues**](../management/issues.md)
```

---

### DOC-003 `docs/architecture/overview.md` — MDHA 相對路徑錯誤

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響檔案** | `docs/architecture/overview.md` |
| **行號** | 147 |
| **失效路徑** | `./model-driven-hexagonal-architecture.md` |
| **實際路徑** | `./notes/model-driven-hexagonal-architecture.md` |

**建議修正**
```diff
- [`docs/architecture/notes/model-driven-hexagonal-architecture.md`](./model-driven-hexagonal-architecture.md)
+ [`docs/architecture/notes/model-driven-hexagonal-architecture.md`](./notes/model-driven-hexagonal-architecture.md)
```

---

### DOC-004 `docs/architecture/glossary/technical-terms.md` — MDHA 父層路徑錯誤

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響檔案** | `docs/architecture/glossary/technical-terms.md` |
| **行號** | 5 |
| **失效路徑** | `../model-driven-hexagonal-architecture.md` |
| **實際路徑** | `../notes/model-driven-hexagonal-architecture.md` |

**建議修正**
```diff
- [`model-driven-hexagonal-architecture.md`](../model-driven-hexagonal-architecture.md)
+ [`model-driven-hexagonal-architecture.md`](../notes/model-driven-hexagonal-architecture.md)
```

---

### DOC-005 `docs/architecture/catalog/service-boundary.md` — MDHA 父層路徑錯誤

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響檔案** | `docs/architecture/catalog/service-boundary.md` |
| **行號** | 8 |
| **失效路徑** | `../model-driven-hexagonal-architecture.md#6-context-mapping-in-xuanwu` |
| **實際路徑** | `../notes/model-driven-hexagonal-architecture.md#6-context-mapping-in-xuanwu` |

**建議修正**
```diff
- [Model-Driven Hexagonal Architecture guide](../model-driven-hexagonal-architecture.md#6-context-mapping-in-xuanwu)
+ [Model-Driven Hexagonal Architecture guide](../notes/model-driven-hexagonal-architecture.md#6-context-mapping-in-xuanwu)
```

---

### DOC-006 `docs/architecture/notes/model-driven-hexagonal-architecture.md` — 多處相對路徑錯誤

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 高（🔴） |
| **受影響檔案** | `docs/architecture/notes/model-driven-hexagonal-architecture.md` |
| **行號** | 109, 477, 640 |
| **失效路徑** | `./glossary/`, `./catalog/service-boundary.md` |
| **實際路徑** | `../glossary/`, `../catalog/service-boundary.md` |

**問題描述**  
MDHA 文件本身位於 `docs/architecture/notes/`，因此相對引用 `./glossary/` 和 `./catalog/` 都是錯誤的；
這兩個目錄位於父層 `docs/architecture/` 下。

**建議修正**
```diff
- [`docs/architecture/glossary/`](./glossary/)
+ [`docs/architecture/glossary/`](../glossary/)

- [`docs/architecture/catalog/service-boundary.md`](./catalog/service-boundary.md)
+ [`docs/architecture/catalog/service-boundary.md`](../catalog/service-boundary.md)
```

---

### DOC-007 `docs/architecture/notes/model-driven-hexagonal-architecture.md` — README 連結指向不存在檔案

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響檔案** | `docs/architecture/notes/model-driven-hexagonal-architecture.md` |
| **行號** | 679 |
| **失效路徑** | `./README.md` |
| **問題** | `docs/architecture/notes/` 目錄中無 README.md |
| **建議** | 改為 `../README.md`（指向 `docs/architecture/README.md`） |

**建議修正**
```diff
- [Architecture SSOT](./README.md)
+ [Architecture SSOT](../README.md)
```

---

### DOC-008 `docs/copilot/README.md` — mcp.md 連結雙重路徑

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響檔案** | `docs/copilot/README.md` |
| **行號** | 10 |
| **失效路徑** | `./docs/copilot/mcp.md` |
| **實際路徑** | `./mcp.md` |

**問題描述**  
`docs/copilot/README.md` 中的 mcp.md 連結包含了完整絕對路徑片段 `./docs/copilot/mcp.md`，  
但該檔案與 README 位於同一目錄，應為 `./mcp.md`。

**建議修正**
```diff
- [`mcp.md`](./docs/copilot/mcp.md)
+ [`mcp.md`](./mcp.md)
```

---

### DOC-009 `.github/skills/next-best-practices/SKILL.md` — 15 個 references 檔案不存在

| 屬性 | 值 |
|------|-----|
| **嚴重程度** | 中（🟡） |
| **受影響檔案** | `.github/skills/next-best-practices/SKILL.md` |
| **行號** | 19–37 |
| **失效路徑** | `./file-conventions.md`, `./rsc-boundaries.md`, `./directives.md`, `./data-patterns.md`, `./async-patterns.md`, `./metadata.md`, `./error-handling.md`, `./route-handlers.md`, `./image.md`, `./font.md`, `./suspense-boundaries.md`, `./hydration-error.md`, `./bundling.md`, `./runtime-selection.md`, `./scripts.md`, `./self-hosting.md`, `./parallel-routes.md`, `./functions.md`, `./debug-tricks.md` |

**問題描述**  
`next-best-practices` skill 引用了 19 個 `references/` 子檔案，但這些檔案均不存在於  
`.github/skills/next-best-practices/` 目錄中。技能的 `references/` 子目錄尚未建立。

**建議修正**  
選擇其一：
1. 在 `.github/skills/next-best-practices/references/` 下建立對應檔案（完整實作）。
2. 將 SKILL.md 中的 references 區段改為直接內嵌內容，移除失效連結（最小修正）。

---

## [索引更新建議] Serena Index Update Recommendations

### SERENA-IDX-001 INDEX.md 未反映 `docs/management/` 分類結構

`.serena/memories/INDEX.md` 中的「架構問題」入口僅指向 `docs/management/issues.md`，  
未涵蓋本次新建的 8 個分類問題檔案（`doc-issues.md` 至 `security-issues.md`）。

**建議動作**：在 INDEX.md 的「文件」分類下新增如下條目：

```markdown
| **管理文檔** | [management/](../docs/management/) | docs/management/ 下 9 個問題分類檔案 |
```

### SERENA-IDX-002 `project/architecture.md` 引用舊版 MDHA 路徑

`.serena/memories/project/architecture.md` 第 1 行引用：
```
> **Design philosophy**: See `docs/architecture/notes/model-driven-hexagonal-architecture.md`
```
此路徑目前正確。但 SSOT 說明 (`docs/architecture/README.md`) 中仍有 `./model-driven-hexagonal-architecture.md` 的失效路徑（見 DOC-001）。兩者需保持一致。

### SERENA-IDX-003 module INDEX 列出 15 個模組，但 SSOT 定義 16 個

`.serena/memories/modules/INDEX.md` 模組清單列出 16 個模組，與  
`docs/architecture/README.md` Domain Modules 表格（也是 16 個）一致。✅ 狀態正常，無需修改。

---

## [孤立檔案標註] Orphaned Files

### ORPHAN-001 `docs/architecture/notes/` 目錄缺乏 README

| 狀態 | `[TO_BE_PRUNED]` 或 新增 |
|------|--------------------------|
| **路徑** | `docs/architecture/notes/README.md` |
| **問題** | MDHA 文件(line 679)引用 `./README.md`，但該目錄無索引文件 |
| **建議** | 新增 `docs/architecture/notes/README.md` 作為索引，或修正引用路徑 |

### ORPHAN-002 `.github/skills/next-best-practices/` 無 `references/` 子目錄

| 狀態 | `[TO_BE_PRUNED]` — 失效連結應被清除或補充 |
|------|-------------------------------------------|
| **路徑** | `.github/skills/next-best-practices/references/*.md`（所有 19 個） |
| **問題** | SKILL.md 中有 19 個 references 連結，但目錄內僅有 SKILL.md |
| **建議** | 移除 SKILL.md 的無效 references 列表，或建立對應檔案 |

---

## 修正優先順序

| 優先級 | Issue | 說明 |
|--------|-------|------|
| P0（立即） | DOC-001, DOC-006 | MDHA 是架構憲法，所有入口連結均失效 |
| P1（本 PR） | DOC-002, DOC-007, DOC-008 | README 導覽連結失效，影響所有開發者 |
| P2（近期） | DOC-003, DOC-004, DOC-005 | 二階文件中的 MDHA 引用失效 |
| P3（計劃） | DOC-009 | next-best-practices skill 需完善 references |
