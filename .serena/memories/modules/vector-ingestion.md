# vector-ingestion.module — File Index

**Bounded Context**: 向量嵌入 / Vector Ingestion  
**職責**: 向量嵌入管線、語意搜尋整合、文件向量化。  
**實作狀態**: 🚧 Scaffold only — 目錄結構已建立，尚無 entity 實作。  
**設計原則**: 屬於 SaaS (cross-cutting) Layer，作為 search.module 的 AI 增強後端。  
**不包含**: 全文搜尋索引（search.module）、檔案解析（file.module）。

> **ADR 參考**: ADR-014 — 此模組以 scaffold 狀態記錄於架構目錄。

---

## 預計職責

- 向量嵌入管線（Vector Embedding Pipeline）— 將文件/實體轉換為向量
- 語意搜尋（Semantic Search）整合 — 向量相似度查詢
- 向量索引管理（Vector Index Management）— 嵌入的儲存與更新

## 預計主要實體

- `VectorEmbedding` — 向量嵌入記錄（尚未實作）
- `IngestionJob` — 嵌入排程工作（尚未實作）

## 預計 Layer

**SaaS Layer (cross-cutting)** — 跨 Workspace 的 AI 搜尋增強基礎設施，由 Genkit pipeline 驅動。

---

> ⚠️ 此模組尚未有任何 `.ts` 實作檔案。本記憶檔案於 ADR-014 架構掃描後建立，供規劃用途。
