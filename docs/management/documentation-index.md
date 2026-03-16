# Documentation Governance Index / 文件治理索引

> **範圍**：全域 `*.md` 文件治理，定義 SSOT、分類結構、重複檢查規則，以及各文件的唯一職責。
> **維護者**：`xuanwu-docs` 代理 + 文件貢獻者

---

## Single Source of Truth (SSOT)

本專案的文件分為兩個不重疊的 SSOT 範圍：

| SSOT | 文件 | 職責 |
|------|------|------|
| **架構 SSOT** | [`docs/architecture/notes/model-driven-hexagonal-architecture.md`](../architecture/notes/model-driven-hexagonal-architecture.md) | MDDD 設計哲學、Hexagonal Architecture、DDD 詞彙、層次定義、Port/Adapter 目錄、開發指南 |
| **Copilot 客製化 SSOT** | [`docs/copilot/README.md`](../copilot/README.md) | 代理架構、六步驟意圖管道、Serena 協同、MCP 工具指派矩陣、Slash 指令速查 |

> **規則**：任何架構或 DDD 相關描述，以架構 SSOT 為準；任何代理、Copilot 工具或客製化相關描述，以 Copilot SSOT 為準。兩者不得互相重複核心內容。

---

## 文件分類結構

### 1. Architecture / 架構文件

| 類別 | 位置 | 職責 |
|------|------|------|
| **架構 SSOT** | `docs/architecture/notes/model-driven-hexagonal-architecture.md` | 設計哲學（唯一定義） |
| **架構導覽** | `docs/architecture/README.md` | 導覽索引（不定義概念，只做連結） |
| **架構概覽** | `docs/architecture/overview.md` | 新人快速參考 |
| **ADR** | `docs/architecture/adr/` | 架構決策記錄 |
| **業務實體目錄** | `docs/architecture/catalog/business-entities.md` | 所有 Domain Entity 的規範定義 |
| **事件目錄** | `docs/architecture/catalog/event-catalog.md` | Domain Event 合約與 Payload 規範 |
| **服務邊界** | `docs/architecture/catalog/service-boundary.md` | SaaS ↔ Workspace 邊界協議 |
| **業務術語** | `docs/architecture/glossary/business-terms.md` | 業務詞彙（中/英） |
| **技術術語** | `docs/architecture/glossary/technical-terms.md` | 技術詞彙（中/英） |
| **圖表** | `docs/architecture/diagrams/` | Mermaid 原始圖表 |
| **架構筆記** | `docs/architecture/notes/` | 深度設計說明（SSOT + 補充文件） |

### 2. Copilot Customization / Copilot 客製化

| 類別 | 位置 | 職責 |
|------|------|------|
| **Copilot SSOT** | `docs/copilot/README.md` | 代理架構、工具指派、指令速查（唯一定義） |
| **MCP 設定** | `docs/copilot/mcp.md` | GitHub Coding Agent 完整 MCP JSON 設定 |
| **VS Code 官方參考** | `docs/copilot/**/*.md`（除 README.md 與 mcp.md） | 官方文件鏡像（唯讀參考，不得重寫） |

> **注意**：`docs/copilot/` 下除 `README.md` 與 `mcp.md` 以外的所有文件均為 VS Code 官方文件鏡像（帶有 `ContentId`/`DateApproved` 前置 YAML）。這些文件僅供參考，不在本專案維護範圍內。

### 3. Management / 問題管理

| 類別 | 位置 | 職責 |
|------|------|------|
| **本索引** | `docs/management/documentation-index.md` | 全域文件治理（唯一） |
| **目錄說明** | `docs/management/README.md` | 目錄導覽 |
| **架構問題** | `docs/management/issues.md` | DDD 違規、mDDD 問題主列表 |
| **文件缺陷** | `docs/management/doc-issues.md` | 失效連結、路徑錯誤、格式問題 |
| **API 問題** | `docs/management/api-issues.md` | API 契約問題 |
| **欄位問題** | `docs/management/fields-issues.md` | 欄位命名與型別問題 |
| **整合問題** | `docs/management/integration-issues.md` | 模組整合問題 |
| **效能問題** | `docs/management/performance-issues.md` | 效能問題 |
| **安全問題** | `docs/management/security-issues.md` | 安全性問題 |
| **語意問題** | `docs/management/semantics-issues.md` | 語意歧義問題 |
| **UI 問題** | `docs/management/ui-issues.md` | UI/UX 問題 |
| **工作流程問題** | `docs/management/workflow-issues.md` | CI/CD 流程問題 |

---

## 重複內容規則

下列內容有明確的唯一所屬位置，**不得在其他文件重複定義**：

| 內容主題 | 唯一所屬位置 |
|---------|------------|
| MDDD 詞彙定義（Bounded Context、Aggregate、Port、Adapter 等） | `docs/architecture/notes/model-driven-hexagonal-architecture.md` |
| DDD 4 層定義與職責 | `docs/architecture/notes/model-driven-hexagonal-architecture.md` |
| 依賴方向規則（Presentation → Application → Domain ← Infrastructure） | `docs/architecture/notes/model-driven-hexagonal-architecture.md` |
| 代理角色與職責定義 | `docs/copilot/README.md` |
| MCP 工具指派矩陣 | `docs/copilot/README.md` |
| Slash 指令清單 | `docs/copilot/README.md` |
| Domain Entity 規範定義 | `docs/architecture/catalog/business-entities.md` |
| Domain Event 合約 | `docs/architecture/catalog/event-catalog.md` |
| SaaS ↔ Workspace 邊界規則 | `docs/architecture/catalog/service-boundary.md` |
| 術語解釋 | `docs/architecture/glossary/` |
| GitHub Coding Agent MCP JSON 設定 | `docs/copilot/mcp.md` |

其他文件可以**引用**以上內容（加上連結），但不應**重複描述**相同內容。

---

## 重複檢查清單

新增或修改文件前，請確認：

- [ ] 我要寫的內容，是否已在上表的「唯一所屬位置」中定義？
- [ ] 若已定義，是否只需加入連結而非重複描述？
- [ ] 文件連結使用正確的相對路徑（不含絕對路徑前綴如 `./docs/`）？
- [ ] 文件標題層級符合本目錄其他文件的慣例？
- [ ] 若修改了 SSOT 文件，是否同步更新了引用該 SSOT 的索引與記憶？

---

## 文件路徑規範

| 規則 | 說明 | 範例 |
|------|------|------|
| 相對路徑 | 使用相對路徑，不加 `./docs/` 前綴 | ✅ `../architecture/README.md` ❌ `./docs/architecture/README.md` |
| 子目錄引用 | 從父層引用子目錄時加 `./subdir/` | ✅ `./notes/model-driven-hexagonal-architecture.md` |
| 外部連結 | 使用完整 URL | ✅ `https://nextjs.org/docs/` |

---

## 最後更新記錄

| 日期 | 變更 | 作者 |
|------|------|------|
| 2026-03-16 | 初始建立；定義 SSOT 範圍、分類結構、重複規則 | `xuanwu-docs` |
