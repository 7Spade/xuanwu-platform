# GitHub Copilot 客製化指南

Xuanwu 平台的 GitHub Copilot 客製化完整文件，包含代理架構、智能理解管道，以及 Serena 協同最大化原則。

## 文件索引

| 文件 | 說明 |
|------|------|
| 本文件 | 總覽與快速導航 |
| `.github/README.md` | 倉庫維護指南（customization 結構、資料夾規則） |
| `.github/copilot-instructions.md` | 全域 always-on 規則 |
| `AGENTS.md` | 多代理共用約定 |

---

## 客製化類型選擇矩陣

| 需求 | 類型 | 啟動方式 | 儲存位置 |
|------|------|---------|---------|
| 套用於所有任務的穩定規則 | Always-on Instructions | 每次對話自動載入 | `.github/copilot-instructions.md` |
| 針對特定檔案類型或框架的規則 | File-based Instructions | `applyTo` 匹配時自動載入 | `.github/instructions/*.instructions.md` |
| 以 `/指令` 觸發的可重用工作流程 | Prompt Files | 手動 slash-command | `.github/prompts/*.prompt.md` |
| 具備工具限制與交接能力的專業角色 | Custom Agents | 明確選擇或被呼叫為子代理 | `.github/agents/*.agent.md` |
| 可攜帶的按需能力（含腳本/資源） | Agent Skills | 按需載入或 `/` 觸發 | `.github/skills/<skill>/SKILL.md` |
| 生命週期邊界的確定性自動化 | Hooks | 生命週期事件觸發 | `.github/hooks/*.json` |

官方參考：https://code.visualstudio.com/docs/copilot/customization

---

## 六步驟智能理解管道

### 設計原理

為了真正理解用戶問題、最大化代理執行效益，Xuanwu 代理系統在處理任何請求之前，執行以下六步驟結構化理解流程：

```
用戶請求
   │
   ▼
① 接收原始輸入（Raw Input）
   │   完整保留用戶原始文字或指令，不做早期解釋
   ▼
② 語意分析（Intent Detection）
   │   判斷目標類型：建立 / 重構 / 稽核 / 修復 / 文件化 / 最佳化
   │   識別行為意圖：主動 / 被動 / 探索 / 確認
   ▼
③ 上下文抓取（Context Extraction）
   │   透過 Serena 取得倉庫現況（相關模組、檔案、邊界）
   │   透過 agent-memory 取得跨 session 歷史決策
   ▼
④ 關鍵資訊標記（Entity & Parameter Extraction）
   │   解析指令為結構化元素：
   │   ・模組（module）：identity.module、workspace.module…
   │   ・層（layer）：Domain / Application / Infrastructure / Presentation
   │   ・檔案路徑、操作類型、約束條件
   ▼
⑤ 依賴與優先級分析（Dependency & Priority Analysis）
   │   確定任務序列：哪個步驟必須先執行？
   │   識別阻擋因素（blockers）與並行可能性
   ▼
⑥ 生成任務指令（Task Instruction Generation）
       形成清晰、可執行的操作方案：
       ・推薦代理（agent）
       ・推薦 prompt 指令
       ・分階段任務清單
       ・預期交付物
```

### 在代理中的應用

- **`xuanwu-commander`** — 對所有進入請求執行完整六步驟管道，然後交接
- **`xuanwu-orchestrator`** — 在跨功能任務中對每個子任務重新執行步驟 ④-⑥
- **`xuanwu-research`** — 專注於步驟 ③ 的深度上下文抓取
- **`xuanwu-software-planner`** — 以步驟 ⑤-⑥ 為核心，產出可執行計劃

技能：`.github/skills/xuanwu-intent-pipeline/SKILL.md`

---

## 代理架構總覽

### 入口層（Entry Points）

```
用戶請求
   ├─ @xuanwu-commander  → 意圖分析 + 智能交接（Master Entry Point）
   └─ /xuanwu-orchestrator → 跨功能交付路由（Multi-function Delivery）
```

### 核心功能代理

| 代理 | 職責 | 主要工具 |
|------|------|---------|
| `xuanwu-orchestrator` | 交付協調者，路由跨功能任務 | `serena/*`, `agent-memory/*`, `software-planning/*` |
| `xuanwu-product` | 需求精煉、驗收條件、執行計劃 | `serena/*`, `sequential-thinking/*` |
| `xuanwu-research` | 倉庫探索、Context7 文件查詢 | `serena/*`, `context7/*`, `repomix/*`, `agent-memory/*` |
| `xuanwu-architect` | 系統設計、邊界稽核 | `serena/*`, `sequential-thinking/*`, `repomix/*` |
| `xuanwu-implementer` | 程式碼實作與重構 | `serena/*`, `firebase-mcp-server/*`, `shadcn/*` |
| `xuanwu-ui` | UI/UX、i18n、響應式設計 | `serena/*`, `shadcn/*`, `playwright/*`, `next-devtools/*` |
| `xuanwu-quality` | 品質審查、安全性、效能 | `serena/*`, `sequential-thinking/*`, `next-devtools/*` |
| `xuanwu-docs` | 文件撰寫與同步 | `serena/*`, `repomix/*`, `markitdown/*` |
| `xuanwu-ops` | CI/CD、部署、運維 | `serena/*`, `firebase-mcp-server/*` |
| `xuanwu-test-expert` | Next.js 預檢、瀏覽器診斷 | `serena/*`, `playwright/*`, `next-devtools/*` |

### 專業子代理

| 代理 | 職責 |
|------|------|
| `xuanwu-commander` | 主入口點、意圖理解、智能交接 |
| `xuanwu-software-planner` | 架構與實作計劃 |
| `xuanwu-sequential-thinking` | 逐步推理與除錯 |
| `xuanwu-architecture-chief` | 架構文件精煉 |
| `xuanwu-architecture-refactor` | 文件結構重組 |
| `xuanwu-diagram-designer` | Mermaid 圖表設計 |
| `xuanwu-repo-browser` | 唯讀架構分析 |

### DDD 子叢集

| 代理 | 職責 |
|------|------|
| `ddd-orchestrator` | DDD 遷移協調者 |
| `ddd-domain-modeler` | 領域層設計 |
| `ddd-application-layer` | 應用層設計 |
| `ddd-infrastructure` | 基礎設施層設計 |

---

## Serena 協同最大化原則

Serena MCP 是本倉庫的主要程式碼智能工具。代理系統與 Serena 的最佳協同方式：

### Session 啟動序列（所有代理必須遵守）

```
1. serena-check_onboarding_performed → 確認專案已初始化
2. serena-list_memories → 列出可用記憶
3. serena-read_memory(project/architecture) → 載入架構概覽
4. serena-read_memory(project/conventions) → 載入編碼約定
```

### 工具選擇優先級

```
Serena 符號工具 > grep/glob > filesystem > 原始碼庫搜尋
```

| 操作 | 優先工具 |
|------|---------|
| 符號查找 | `serena-find_symbol` before `grep` |
| 檔案導覽 | `serena-list_dir` / `serena-find_file` |
| 程式碼編輯 | `serena-replace_symbol_body` / `serena-insert_*` |
| 模式搜尋 | `serena-search_for_pattern` |
| 重命名 | `serena-rename_symbol` (全倉庫安全重命名) |

### 記憶層次

```
Serena 記憶（.serena/memories/）    → 專案文件記憶（長效）
agent-memory（Redis 向量搜尋）       → 跨 Session 語意召回（長效）
Working Memory                      → Session 內暫時記憶（短效）
```

---

## MCP 工具指派矩陣

完整的代理-工具指派規則請參考 `.github/README.md`。

| MCP 工具 | 指派代理 |
|---------|---------|
| `serena/*` | 所有接觸程式碼或文件的倉庫代理 |
| `agent-memory/*` | `xuanwu-research`, `xuanwu-orchestrator` |
| `context7/*` | `xuanwu-research`（版本敏感框架文件） |
| `repomix/*` | `xuanwu-research`, `xuanwu-docs`, `xuanwu-architect`, `xuanwu-architecture-chief`, `xuanwu-repo-browser` |
| `markitdown/*` | `xuanwu-research`, `xuanwu-docs` |
| `sequential-thinking/*` | `xuanwu-software-planner`, `xuanwu-sequential-thinking`, `xuanwu-product`, `xuanwu-architect`, `ddd-orchestrator`, `xuanwu-quality` |
| `software-planning/*` | `xuanwu-orchestrator`, `xuanwu-commander`, `xuanwu-software-planner` |
| `playwright/*` | `xuanwu-ui`, `xuanwu-test-expert` |
| `next-devtools/*` | `xuanwu-ui`, `xuanwu-test-expert`, `xuanwu-architect`, `xuanwu-quality` |
| `shadcn/*` | `xuanwu-ui`, `xuanwu-implementer` |
| `firebase-mcp-server/*` | `xuanwu-implementer`, `xuanwu-ops`, `xuanwu-quality`, `ddd-infrastructure` |
| `filesystem/*` | 需要直接 I/O 的代理（超出 `editFiles` 範圍） |

---

## Slash 指令速查

```
/xuanwu-orchestrator     跨功能任務交付路由
/xuanwu-product          需求精煉、計劃
/xuanwu-research         倉庫探索、文件查詢
/xuanwu-architect        架構稽核或設計
/xuanwu-architecture-realign  架構文件重新對齊
/xuanwu-ssot-sync        架構文件與語意核心 SSOT 同步
/xuanwu-implementer      程式碼實作與重構
/xuanwu-ui               UI 稽核、shadcn/ui、i18n
/xuanwu-code-review      品質與安全審查
/xuanwu-docs             文件撰寫
/xuanwu-ops              CI/CD 與運維
/xuanwu-test-expert      Next.js 預檢與診斷
/xuanwu-planning         快速實作計劃
/xuanwu-refactor         程式碼重構
/xuanwu-debug            除錯與根因分析
/ddd-domain-model        DDD 領域層設計
/ddd-application-service DDD 應用層設計
/ddd-infrastructure-adapter  DDD 基礎設施層設計
/ddd-layer-audit         DDD 層邊界稽核
/ddd-slice-scaffold      DDD 功能切片鷹架
/ddd-progressive-layering    DDD 漸進式遷移
```

---

## GitHub Coding Agent 環境

Coding Agent 在每個 session 的全新 Ubuntu 環境（GitHub Actions runner）中執行。MCP 依賴透過 `.github/workflows/copilot-setup-steps.yml` 預裝：

| MCP 伺服器 | 依賴 | 安裝方式 |
|-----------|------|---------|
| `serena` | `uv`/`uvx` | `astral-sh/setup-uv@v5` |
| `markitdown` | `uv`/`uvx` | 同上 |
| `agent-memory` | `uv`/`uvx` | 同上 |
| `sequential-thinking` | npm | `npm install -g` |
| `software-planning` | npm | `npm install -g` |
| `everything` | npm | `npm install -g` |
| `filesystem` | npm | `npm install -g` |
| `context7` | npm | `npm install -g` |
| `repomix` | npm | `npm install -g` |

Coding Agent MCP 設定請複製 `.github/copilot/mcp-coding-agent.json` 至  
[Settings → Copilot → Coding agent → MCP configuration](https://github.com/7Spade/xuanwu-platform/settings/copilot/coding_agent)。
