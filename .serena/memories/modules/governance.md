# governance.module — File Index

**Bounded Context**: 治理 / Governance  
**職責**: 治理規則定義、政策執行、合規工作流程。  
**實作狀態**: 🚧 Scaffold only — 目錄結構已建立，尚無 entity 實作。  
**設計原則**: 屬於 SaaS Layer，治理規則跨 Workspace 套用。  
**不包含**: 稽核日誌（audit.module）、帳號角色（account.module）。

> **ADR 參考**: ADR-014 — 此模組以 scaffold 狀態記錄於架構目錄。

---

## 預計職責

- 治理規則（Governance Rules）定義與版本管理
- 政策執行（Policy Enforcement）— 對 Workspace 操作施加約束
- 合規工作流程（Compliance Workflows）

## 預計主要實體

- `GovernanceRule` — 治理規則（尚未實作）
- `PolicyViolation` — 政策違規記錄（尚未實作）

## 預計 Layer

**SaaS Layer** — 跨 Workspace 套用的治理規則，由組織帳號管理員設定。

---

> ⚠️ 此模組尚未有任何 `.ts` 實作檔案。本記憶檔案於 ADR-014 架構掃描後建立，供規劃用途。
