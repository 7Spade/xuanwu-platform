---
name: xuanwu-intent-pipeline
description: >
  Xuanwu 六步驟智能理解管道（Six-Step Intent Pipeline）。
  在執行任何代理任務之前，透過結構化步驟完整理解用戶意圖。
  Use this skill when: decomposing an ambiguous request, routing to the
  correct agent, or verifying you have captured all parameters before
  making code or documentation changes.
  Triggers: "understand intent", "analyze request", "pipeline",
  "六步驟", "意圖分析", "任務拆解", "before dispatch", "clarify scope".
---

# Xuanwu 六步驟智能理解管道

本技能定義 Xuanwu 代理系統處理所有進入請求的**標準理解流程**。

---

## 六步驟流程

### ① 接收原始輸入（Raw Input）

**目的：** 完整保留用戶的原始文字或指令，不做早期解釋。

```
輸出：verbatim_request = "<用戶原始文字>"
```

規則：
- 不刪除、不改寫任何部分
- 如有程式碼片段或錯誤訊息，完整保留
- 識別輸入語言（中文 / 英文 / 混合）

---

### ② 語意分析（Intent Detection）

**目的：** 判斷用戶的目標和行為意圖。

```
輸出：
  action_type: create | audit | fix | refactor | document | optimize | research | configure
  domain_area: architecture | code | ui | ci-cd | docs | security | performance | testing
  urgency: blocking | high | normal | low
```

問題清單：
1. 用戶要「建立」還是「修改」還是「查詢」？
2. 這是一次性任務還是重複性工作流程？
3. 有沒有隱含的約束（時間、範圍、品質）？
4. 請求是否涉及多個領域（需要跨代理協調）？

---

### ③ 上下文抓取（Context Extraction）

**目的：** 收集與任務相關的背景資訊。

```
工具序列：
  1. serena-list_memories → 檢查現有專案記憶
  2. serena-read_memory(project/architecture) → 架構現況
  3. agent-memory-search_long_term_memory(query) → 跨 session 歷史
  4. serena-find_symbol / serena-search_for_pattern → 具體程式碼位置
```

輸出：
- 相關模組列表（`src/modules/<name>.module/`）
- 相關層（Domain / Application / Infrastructure / Presentation）
- 現有實作模式（參考相似程式碼）
- 已知約束（ADR 決策、架構邊界）

---

### ④ 關鍵資訊標記（Entity & Parameter Extraction）

**目的：** 將指令拆解為結構化的模組、參數和設定。

```
輸出結構：
{
  "modules": ["identity.module", "workspace.module"],
  "files": ["src/modules/identity.module/domain.auth/_entity.ts"],
  "layers": ["Domain", "Application"],
  "operation": "add PasswordReset aggregate",
  "constraints": ["must not break existing sign-in flow"],
  "dependencies": ["FirebaseAuth", "IIdentityRepository"]
}
```

標記規則：
- 模組名稱必須使用倉庫的 `<name>.module` 格式
- 層必須使用 Presentation / Application / Domain / Infrastructure
- 明確識別外部依賴（Firebase、第三方 API）
- 識別共享層（`src/shared/`）涉及範圍

---

### ⑤ 依賴與優先級分析（Dependency & Priority Analysis）

**目的：** 確定任務執行順序與先後關係。

```
輸出：
  sequence:
    - step: 1
      task: "Domain layer: PasswordReset entity + value objects"
      agent: ddd-domain-modeler
      depends_on: []
      blocking: [step-2, step-3]
    - step: 2
      task: "Application layer: ResetPasswordUseCase"
      agent: ddd-application-layer
      depends_on: [step-1]
      blocking: [step-3]
    - step: 3
      task: "Infrastructure: FirebaseEmailAdapter"
      agent: ddd-infrastructure
      depends_on: [step-2]
      blocking: []
```

分析維度：
1. 哪些任務有**技術依賴**（B 需要 A 的介面）？
2. 哪些任務可以**平行執行**？
3. 哪個代理最適合每個步驟？
4. 什麼是**最小可驗證單元**（MVP）？

---

### ⑥ 生成任務指令（Task Instruction Generation）

**目的：** 形成清晰、可執行的操作方案。

```
輸出格式：

問題摘要：[一句話總結]

推薦代理：[agent-name]
推薦指令：[/slash-command 如適用]

執行計劃：
  Phase 1 (今): ...
  Phase 2 (可選): ...

預期交付物：
  - 檔案路徑 + 說明
  - 測試覆蓋範圍

驗證方式：
  - 如何確認任務完成？
```

---

## 在代理中應用

### xuanwu-commander（主入口）

對所有請求執行完整六步驟，輸出「建議交接」。

### xuanwu-orchestrator（跨功能協調）

在分配子任務時，對每個子任務的範圍重新執行步驟 ④-⑥。

### xuanwu-research（上下文研究）

深度執行步驟 ③，產出帶有引用的發現報告。

### xuanwu-software-planner（計劃生成）

以步驟 ⑤-⑥ 為核心，詳細展開任務序列。

---

## 快速模板

```markdown
## 六步驟分析

**① 原始輸入**
> [verbatim user request]

**② 意圖分析**
- 動作類型：[create/audit/fix/refactor/document/optimize]
- 領域範圍：[architecture/code/ui/ci-cd/docs]

**③ 上下文（Serena 查詢結果）**
- 相關模組：[list]
- 現有模式：[reference]

**④ 關鍵參數**
- 模組：[list]
- 層：[list]
- 操作：[description]
- 約束：[list]

**⑤ 依賴序列**
1. [任務] → [代理]
2. [任務] → [代理]

**⑥ 執行方案**
推薦代理：[agent]
推薦指令：[/command]
交付物：[list]
```

---

## 何時使用此技能

- **請求模糊時** — 使用步驟 ①-② 找出真實意圖
- **範圍不清時** — 使用步驟 ③-④ 確定邊界
- **跨代理協調時** — 使用步驟 ⑤ 確定執行序列
- **準備交接時** — 使用步驟 ⑥ 產出交接文件

不需要在步驟間等待用戶確認 — 以推論補充不確定資訊，並在步驟 ⑥ 標記假設。
