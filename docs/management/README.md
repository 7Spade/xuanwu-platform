# Documentation Management / 文件管理

> 本目錄記錄 xuanwu-platform 的架構問題、文件缺陷，以及系統整合/安全/語意問題。
> 文件管理索引請見 [`documentation-index.md`](./documentation-index.md)。

---

## 目錄說明

| 檔案 | 說明 |
|------|------|
| [`documentation-index.md`](./documentation-index.md) | 全域文件治理索引，定義 SSOT、分類結構，以及重複內容指引 |
| [`issues.md`](./issues.md) | 架構問題主列表（含 DDD 違規、壞味道） |
| [`doc-issues.md`](./doc-issues.md) | 文件缺陷：失效連結、路徑錯誤、格式問題 |
| [`api-issues.md`](./api-issues.md) | API 契約與介面問題 |
| [`fields-issues.md`](./fields-issues.md) | 欄位命名、型別與資料模型問題 |
| [`integration-issues.md`](./integration-issues.md) | 模組間整合與跨邊界問題 |
| [`performance-issues.md`](./performance-issues.md) | 效能問題與最佳化建議 |
| [`security-issues.md`](./security-issues.md) | 安全性問題與 Firestore 規則缺陷 |
| [`semantics-issues.md`](./semantics-issues.md) | 語意歧義與術語不一致問題 |
| [`ui-issues.md`](./ui-issues.md) | UI/UX 與 Presentation 層問題 |
| [`workflow-issues.md`](./workflow-issues.md) | CI/CD、部署流程與工作流程問題 |

---

## 問題嚴重程度說明

| 等級 | 符號 | 說明 |
|------|------|------|
| 高 | 🔴 | 影響系統正確性或架構合規性，需立即處理 |
| 中 | 🟡 | 影響開發體驗或文件一致性，應盡快解決 |
| 低 | 🟢 | 技術債或改善建議，排入計劃處理 |

---

## 參考 SSOT

- **架構哲學**：[`docs/architecture/notes/model-driven-hexagonal-architecture.md`](../architecture/notes/model-driven-hexagonal-architecture.md)
- **架構導覽**：[`docs/architecture/README.md`](../architecture/README.md)
- **Copilot 客製化**：[`docs/copilot/README.md`](../copilot/README.md)
