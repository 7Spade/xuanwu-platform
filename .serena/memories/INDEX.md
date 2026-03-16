# Serena Memories — Master Index

Xuanwu Platform 所有 Serena 記憶檔案的主索引。

---

## 記憶分類

| 分類 | 記憶檔案 | 說明 |
|------|----------|------|
| **App 路由** | [app/INDEX.md](./app/INDEX.md) | Next.js App Router 所有 page.tsx / layout.tsx / default.tsx |
| **Shared 層** | [shared.md](./shared.md) | `src/shared/` 所有共用工具、類型、錯誤、i18n、Pipe、常數、directives、ports |
| **Design System** | [design-system.md](./design-system.md) | `src/design-system/` 五層設計系統（primitives/components/patterns/tokens/layout）+ providers |
| **Infrastructure** | [infrastructure.md](./infrastructure.md) | `src/infrastructure/firebase/` Firebase Web SDK + Admin SDK |
| **Domain Modules** | [modules/INDEX.md](./modules/INDEX.md) | `src/modules/` 全部 16 個 Domain Module 的 .ts 檔案索引 |
| **MCP 工具** | [mcp/INDEX.md](./mcp/INDEX.md) | 已配置的 MCP servers 使用指南 |
| **PR 歷史** | [pr-history/INDEX.md](./pr-history/INDEX.md) | 每個合併 PR 的摘要與決策記錄 |
| **專案知識** | [project/](./project/) | 架構概覽、Domain 路由表、慣例文件、指令清單 |

---

## 快速查找

### 我要找某個 ts/tsx 檔案的用途
1. 確認檔案路徑屬於哪個分類：
   - `src/app/**` → [app/INDEX.md](./app/INDEX.md)
   - `src/shared/**` → [shared.md](./shared.md)
   - `src/design-system/**` → [design-system.md](./design-system.md)
   - `src/infrastructure/**` → [infrastructure.md](./infrastructure.md)
   - `src/modules/**` → [modules/INDEX.md](./modules/INDEX.md) → 各模組子文件

### 我要了解架構決策
- 架構 SSOT：`docs/architecture/notes/model-driven-hexagonal-architecture.md`
- Domain 路由表：[project/domain-lookup.md](./project/domain-lookup.md)
- ADR 索引：`docs/architecture/adr/README.md`

### 我要了解如何操作某個 MCP Server
- [mcp/INDEX.md](./mcp/INDEX.md)

---

## 標準 .ts 檔案涵蓋率

| 區域 | 已索引 | 總計 |
|------|--------|------|
| `src/app/` | ✅ 38 檔 | 38 |
| `src/shared/` | ✅ 10 檔 | 10 |
| `src/design-system/` | ✅ 72 檔 | 72 |
| `src/infrastructure/` | ✅ 17 檔 | 17 |
| `src/modules/` (×16) | ✅ 253 檔 | 253 |
| **總計** | **✅ 415 檔** | **415** |

> *Last updated: PR copilot/update-file-consistency. Added: `src/design-system/layout/` tier (base/root-shell + marketing/home-layout/marketing-header/mode-toggle), `src/design-system/providers/theme-provider.tsx`, `src/shared/ports/index.ts` (9 ACL port interfaces), `useLocale` + `useAuthState` in `src/shared/directives/index.ts`. 0 lint errors, 0 tsc errors, 255/255 tests, 0 CodeQL alerts.*

---

## 維護規範

- 每次新增 .ts/.tsx 檔案時，必須同步更新對應分類的記憶檔案。
- 每個條目必須包含：**檔案名稱（File Name）**、**描述/用途（Description/Purpose）**、**簡單函數清單（Function List）**。
- 記憶檔案以繁體中文書寫，函數名稱保持英文。
