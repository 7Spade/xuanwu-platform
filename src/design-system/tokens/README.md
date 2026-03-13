# Design System — Tokens

**Location:** `src/design-system/tokens/`

---

## 概覽

`tokens/` 是 design-system 的第四層，專門存放設計令牌（Design Tokens）：

- **顏色（Colors）** — 品牌色、語意色（success / warning / error）、中性色階
- **間距（Spacing）** — 間距比例（spacing scale），與 Tailwind v4 CSS 變數保持同步
- **字體（Typography）** — 字型家族、字體大小、字重、行高
- **圓角（Radii）** — 邊框圓角值
- **陰影（Shadows）** — 盒陰影值
- **Z 軸（Z-index）** — z-index 常數
- **動畫（Motion）** — 過渡 / 動畫持續時間與緩動函數

所有令牌均為純常數，**無副作用**，**不依賴 React 或任何外部框架**。

---

## 1️⃣ 目錄結構

```
src/design-system/tokens/
├── colors.ts        # 顏色令牌
├── spacing.ts       # 間距令牌
├── typography.ts    # 字體令牌
├── radii.ts         # 圓角令牌
├── shadows.ts       # 陰影令牌
├── motion.ts        # 動畫令牌
├── z-index.ts       # Z 軸令牌
├── index.ts         # 公開 barrel（唯一對外入口）
└── README.md        # 本設計文件
```

---

## 2️⃣ 使用方式

```typescript
import { colorBrand, spacingBase } from "@/design-system/tokens";
```

令牌值與 `globals.css` 和 `tailwind.config.ts` 中定義的 CSS 自訂屬性保持同步，確保 TypeScript 消費端擁有統一的型別提示。

---

## 3️⃣ 規則

| 規則 | 說明 |
|------|------|
| 純常數 | 令牌只能是常數，不包含業務邏輯或副作用 |
| 與 Tailwind 同步 | 數值必須與 `tailwind.config.ts` CSS 變數保持一致 |
| 從 barrel 引入 | 外部不得直接引用子路徑；使用 `@/design-system/tokens` |
| 無框架依賴 | 不得引入 React、Next.js 或任何 UI 框架 |

---

## 4️⃣ 狀態

目前為規劃階段。令牌檔案待從 `tailwind.config.ts` 和 `globals.css` 中提取後加入。
