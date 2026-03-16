# taxonomy.module — File Index

**Bounded Context**: 分類法 / Taxonomy  
**職責**: 標籤分類法定義、標籤層級管理、跨模組分類樹。  
**實作狀態**: 🚧 Scaffold only — 目錄結構已建立，尚無 entity 實作。  
**設計原則**: 屬於 SaaS (cross-cutting) Layer，分類法跨多個 bounded context 使用。  
**不包含**: 搜尋索引（search.module）、成就徽章（achievement.module）。

> **ADR 參考**: ADR-011 — 此模組以 scaffold 狀態記錄於架構目錄。

---

## 預計職責

- 標籤分類法（Tag Taxonomy）的建立與版本管理
- 標籤層級（Label Hierarchy）— 父子關係的分類樹
- 分類樹（Classification Trees）的跨模組共用

## 預計主要實體

- `TaxonomyNode` — 分類法節點（尚未實作）
- `TaxonomyTree` — 分類樹根節點（尚未實作）

## 預計 Layer

**SaaS Layer (cross-cutting)** — 分類法由組織層級定義，供 Workspace 層實體使用。

---

> ⚠️ 此模組尚未有任何 `.ts` 實作檔案。本記憶檔案於 ADR-011 架構掃描後建立，供規劃用途。
