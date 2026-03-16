# Xuanwu Platform — Documentation Index / 文件索引

> **快速導覽**：本索引按層次分類列出所有專案文件。
> 詳細文件治理規則請見 [`docs/management/documentation-index.md`](./management/documentation-index.md)。

---

## 文件層次結構

```
docs/
├── architecture/              ← 架構 SSOT 與核心知識
│   ├── notes/                 ← 深度設計說明
│   │   ├── model-driven-hexagonal-architecture.md  ★ 架構 SSOT
│   │   └── document-ai.md
│   ├── catalog/               ← 業務契約（實體/事件/邊界）
│   ├── adr/                   ← 架構決策記錄
│   ├── glossary/              ← 術語詞彙表
│   ├── diagrams/              ← Mermaid 圖表
│   ├── README.md              ← 架構導覽索引
│   └── overview.md            ← 快速參考（新人入門）
├── copilot/                   ← Copilot 客製化 SSOT
│   ├── README.md              ★ Copilot SSOT
│   └── mcp.md                 ← GitHub Coding Agent MCP 設定
└── management/                ← 問題追蹤與文件治理
    ├── documentation-index.md ← 全域文件治理索引
    ├── README.md              ← 目錄說明
    └── *.md                   ← 各類問題分類報告
```

---

## 層次一：SSOT（Single Source of Truth）

| 文件 | 職責 |
|------|------|
| [Architecture SSOT](./architecture/notes/model-driven-hexagonal-architecture.md) | MDDD 設計哲學、Hexagonal Architecture、DDD 詞彙、層次定義、Port/Adapter 目錄、開發指南 |
| [Copilot SSOT](./copilot/README.md) | 代理架構、六步驟意圖管道、Serena 協同、MCP 工具指派矩陣、Slash 指令速查 |

> 任何與架構、DDD 相關的規範以架構 SSOT 為準；任何代理、Copilot 工具或客製化規範以 Copilot SSOT 為準。

---

## 層次二：核心業務知識

| 文件 | 職責 |
|------|------|
| [業務實體目錄](./architecture/catalog/business-entities.md) | 所有 Domain Entity 的規範定義（欄位、不變性約束、Firestore 對應） |
| [Domain Event 目錄](./architecture/catalog/event-catalog.md) | Domain Event 合約、Payload 規範、Published Language |
| [服務邊界契約](./architecture/catalog/service-boundary.md) | SaaS ↔ Workspace 邊界協議、跨邊界規則 |
| [業務術語詞彙表](./architecture/glossary/business-terms.md) | 業務詞彙（中英對照） |
| [技術術語詞彙表](./architecture/glossary/technical-terms.md) | 技術詞彙（中英對照） |
| [ADR 索引](./architecture/adr/README.md) | 架構決策記錄完整清單 |

---

## 層次三：參考資料

| 文件 | 職責 |
|------|------|
| [架構導覽](./architecture/README.md) | 架構文件導覽索引（含建議閱讀順序） |
| [架構快速參考](./architecture/overview.md) | 新人入門：技術棧、目錄佈局、DDD 4 層架構快速說明 |
| [架構筆記目錄](./architecture/notes/README.md) | notes/ 子目錄說明 |
| [Diagrams](./architecture/diagrams/) | Mermaid 原始圖表（核心邏輯、ERD、狀態機、L1-L7 層次） |
| [MCP 設定](./copilot/mcp.md) | GitHub Coding Agent 完整 MCP JSON 設定 |
| [Document AI 設計](./architecture/notes/document-ai.md) | OCR 雙階段管道、GenKit 語意萃取、ParsingIntent 聚合 |

---

## 層次四：問題管理

| 文件 | 職責 |
|------|------|
| [文件治理索引](./management/documentation-index.md) | 全域文件 SSOT 定義、分類結構、重複規則、路徑規範 |
| [架構問題](./management/issues.md) | DDD 違規、mDDD 問題主列表 |
| [文件缺陷](./management/doc-issues.md) | 失效連結、路徑錯誤、格式問題 |
| [API 問題](./management/api-issues.md) | API 契約問題 |
| [欄位問題](./management/fields-issues.md) | 欄位命名與型別問題 |
| [整合問題](./management/integration-issues.md) | 模組整合問題 |
| [效能問題](./management/performance-issues.md) | 效能問題 |
| [安全問題](./management/security-issues.md) | 安全性問題 |
| [語意問題](./management/semantics-issues.md) | 語意歧義問題 |
| [UI 問題](./management/ui-issues.md) | UI/UX 問題 |
| [工作流程問題](./management/workflow-issues.md) | CI/CD 流程問題 |

---

## VS Code 官方文件

VS Code 官方 Copilot 客製化文件請直接參考線上版本，不在本倉庫維護：

- **Copilot 客製化總覽**：https://code.visualstudio.com/docs/copilot/customization
- **Custom Instructions**：https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- **Prompt Files**：https://code.visualstudio.com/docs/copilot/customization/prompt-files
- **Custom Agents**：https://code.visualstudio.com/docs/copilot/customization/custom-agents
- **Agent Skills**：https://code.visualstudio.com/docs/copilot/customization/agent-skills
- **Hooks**：https://code.visualstudio.com/docs/copilot/customization/hooks
- **MCP Servers**：https://code.visualstudio.com/docs/copilot/customization/mcp-servers
- **Sub-agents**：https://code.visualstudio.com/docs/copilot/agents/subagents
