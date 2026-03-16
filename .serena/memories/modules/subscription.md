# subscription.module — File Index

**Bounded Context**: 訂閱 / Subscription  
**職責**: 訂閱方案定義、功能授權、計費週期管理。  
**實作狀態**: 🚧 Scaffold only — 目錄結構已建立，尚無 entity 實作。  
**設計原則**: 屬於 SaaS Layer，訂閱與 AccountEntity 綁定。  
**不包含**: 財務結算（settlement.module）、帳號資料（account.module）。

> **ADR 參考**: ADR-014 — 此模組以 scaffold 狀態記錄於架構目錄。

---

## 預計職責

- 訂閱方案（Subscription Plans）定義與查詢
- 功能授權（Feature Entitlements）— 依方案控制功能開放
- 計費週期（Billing Cycle）與續約管理

## 預計主要實體

- `SubscriptionPlan` — 訂閱方案（尚未實作）
- `AccountSubscription` — 帳號訂閱記錄（尚未實作）

## 預計 Layer

**SaaS Layer** — 訂閱方案與組織或個人 AccountEntity 關聯。

---

> ⚠️ 此模組尚未有任何 `.ts` 實作檔案。本記憶檔案於 ADR-014 架構掃描後建立，供規劃用途。
