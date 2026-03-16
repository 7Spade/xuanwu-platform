# knowledge.module — File Index

**Bounded Context**: 知識庫 / Knowledge Base  
**職責**: 知識庫、文件庫、Wiki 頁面管理。  
**實作狀態**: 🚧 Scaffold only — 目錄結構已建立，尚無 entity 實作。  
**設計原則**: 屬於 Workspace Layer，知識內容與工作空間綁定。  
**不包含**: 檔案版本控制（file.module）、搜尋索引（search.module）。

> **ADR 參考**: ADR-014 — 此模組以 scaffold 狀態記錄於架構目錄。

---

## 預計職責

- 知識庫（Knowledge Base）文章的建立、版本與查詢
- 文件庫（Document Library）分類與組織
- Wiki 頁面（Wiki Pages）的階層管理

## 預計主要實體

- `KnowledgeArticle` — 知識庫文章（尚未實作）
- `WikiPage` — Wiki 頁面（尚未實作）

## 預計 Layer

**Workspace Layer** — 知識內容隸屬於特定 WorkspaceEntity。

---

> ⚠️ 此模組尚未有任何 `.ts` 實作檔案。本記憶檔案於 ADR-014 架構掃描後建立，供規劃用途。
