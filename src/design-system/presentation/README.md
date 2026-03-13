# Presentation Layer — Vis.js + Pragmatic Drag-and-Drop Design Guide

**Location:** `src/design-system/presentation/`

> 🔗 **See also:** [`src/infrastructure/firebase/README.md`](../../infrastructure/firebase/README.md) — Firebase client/functions infrastructure that supplies data to the components defined here.

---

## 概覽

`presentation/` 是 design-system 的第四層，專門存放高階 UI 互動模組：

- **Vis.js** — 網路圖（`VisNetwork`）與時間軸（`VisTimeline`）渲染組件
- **Pragmatic Drag-and-Drop (PDnD)** — 以 `@atlaskit/pragmatic-drag-and-drop` 為底層的拖拽看板（`DragDropBoard`）

所有組件均為 `"use client"` 組件，**不含業務邏輯**，不直接存取 Firestore。  
資料由 Server Actions 透過 `cacheAside` 讀取後序列化為 props 傳入。

---

## 1️⃣ 檔案結構（整合 Vis 與 PDnD）

```
src/
├─ infrastructure/
│   └─ firebase/
│       ├─ client/                  # 前端 Firebase SDK 封裝
│       │   ├─ firestore.ts         # 讀取 networkNodes / timelineItems
│       │   └─ ...
│       └─ functions/               # 後端 Firebase Admin
│           ├─ db/
│           │   ├─ batchWrite.ts    # 批次寫入
│           │   └─ cacheLayer.ts    # 快取層
│           └─ ...
│
├─ design-system/
│   ├─ primitives/
│   ├─ components/
│   ├─ presentation/                # ← 本層
│   │   ├─ VisNetwork.tsx           # Vis.js 網路圖組件
│   │   ├─ VisTimeline.tsx          # Vis.js 時間軸組件
│   │   ├─ DragDropBoard.tsx        # PDnD 拖拽看板組件
│   │   ├─ index.ts                 # 公開 barrel
│   │   └─ README.md               # 本設計文件
│   └─ patterns/
│
└─ shared/
    ├─ types/
    ├─ constants/                   # Firebase Collection 名稱、事件名稱
    └─ interfaces/                  # VisDateMetadata、API 契約
```

---

## 2️⃣ 名稱映射表（Firebase + Vis + PDnD）

| 層級 | 名稱 | 功能 | 對應檔案 | 成本控制策略 |
|------|------|------|----------|------------|
| `infrastructure/firebase/client` | `firebaseAuth` | 前端登入 / 第三方 | `client/auth.ts` | 前端登入即可，避免頻繁驗證 API |
| `infrastructure/firebase/client` | `firestore` | 讀取 networkNodes / networkEdges / timelineItems | `client/firestore.ts` | 使用快取層減少直接 DB 調用 |
| `infrastructure/firebase/client` | `firebaseStorage` | 上傳 / 下載檔案 | `client/storage.ts` | 批量上傳、大檔案分段 |
| `infrastructure/firebase/client` | `cloudMessaging` | FCM / In-App Messaging | `client/messaging.ts` | 控制推播頻率 |
| `infrastructure/firebase/client` | `remoteConfig` | 動態配置 | `client/remoteConfig.ts` | 減少更新頻率（預設 12h） |
| `infrastructure/firebase/functions` | `firebase-admin` | 後端管理寫入、批次操作 | `functions/db/batchWrite.ts` | 快取 + 批次寫入降低成本 |
| `infrastructure/firebase/functions` | `cacheLayer` | 暫存資料 / 聚合 | `functions/db/cacheLayer.ts` | 讀寫分離，彙整後批次寫入 |
| `presentation` | `VisNetwork` | 網路圖渲染 | `presentation/VisNetwork.tsx` | 讀快取資料，減少 DB 直連 |
| `presentation` | `VisTimeline` | 時間軸渲染 | `presentation/VisTimeline.tsx` | 同上 |
| `presentation` | `DragDropBoard` | 拖拽任務板（PDnD） | `presentation/DragDropBoard.tsx` | 前端操作快取，後端批次寫入 |
| `shared` | `constants/types/interfaces` | 共用型別、collection 名稱、事件 | `shared/` | 前後端統一接口 |

---

## 3️⃣ 開發指南

### (A) 前端開發

#### 1. Firebase client 封裝

- `firestore.ts` 只讀：拉取網路圖 / 時間軸資料（`networkNodes`、`networkEdges`、`timelineItems`）
- `cacheLayer.ts` 實現暫存，避免頻繁 Firestore 訪問
- `auth.ts` 處理登入與用戶狀態
- `storage.ts` 上傳 / 下載大檔案時使用 resumable upload

#### 2. Vis.js 組件

- `VisNetwork` / `VisTimeline` 綁定快取層資料渲染
- 變更節點或事件 → 先更新本地快取 → 批次同步後端

```typescript
// Server Action — 以 cacheAside 拉取 networkNodes
import { cacheAside, cacheKey } from "@/infrastructure/firebase/functions/db/cacheLayer";

// Client Component — 渲染網路圖
import { VisNetwork } from "@/design-system/presentation";

// 資料流：Server Action → serialised props → VisNetwork
```

#### 3. Pragmatic Drag-and-Drop（PDnD）

- 拖拽操作只更新本地快取，**不直接寫入 Firestore**
- 拖動完成 → 呼叫 `commitBatch()` 批次寫入後端

```typescript
// 拖動完成後批次寫入
import { commitBatch } from "@/infrastructure/firebase/functions/db/batchWrite";
import type { VisDateMetadata } from "@/shared/interfaces";

// 前端操作快取 → 批次寫入 Firestore
```

---

### (B) 後端開發

#### 1. Cloud Functions / firebase-admin

- 聚合前端變更 → 批次寫入 Firestore / RealtimeDB
- `cacheLayer.ts` 控制寫入頻率
- 敏感資料、權限檢查由後端完成

#### 2. 批次寫入策略

- 設定 `BATCH_SIZE`（預設 490 ops / batch，符合 Firestore 硬上限 500）
- 可定時 flush（例如每 5 秒或每次操作完成後觸發）

```typescript
import { commitBatch, type WriteOperation } from "@/infrastructure/firebase/functions/db/batchWrite";

const ops: WriteOperation[] = items.map((item) => ({
  type: "set",
  ref: db.collection("timelineItems").doc(item.id),
  data: item,
  merge: true,
}));
await commitBatch(ops); // 自動分片，每批最多 490 筆
```

---

### (C) 快取層設計

| 環境 | 快取方案 |
|------|---------|
| 前端 | memory（React state / SWR）或 IndexedDB |
| 後端（單實例） | `MemoryCacheStore`（`cacheLayer.ts`） |
| 後端（多實例） | Redis（`ioredis`）— 替換 `MemoryCacheStore` 即可 |

**原則：**
1. 先更新快取 → 前端立即渲染
2. 快取滿 / 定時觸發 → 批次寫入後端
3. 減少 Firestore 直接寫入次數，降低成本

```typescript
// Cache-aside 讀取（Server Action）
import { cacheAside, invalidateCache, cacheKey } from "@/infrastructure/firebase/functions/db/cacheLayer";

const nodes = await cacheAside(
  cacheKey("network", graphId, "nodes"),
  () => fetchNodesFromFirestore(graphId),
  5 * 60 * 1000, // TTL: 5 min
);

// 寫入後失效
await invalidateCache(cacheKey("network", graphId, "nodes"));
```

---

### (D) 成本控制策略

| 策略 | 實作 |
|------|------|
| 批次寫入降低 Firestore 寫入費用 | `commitBatch()` 自動分片 |
| 降低即時訂閱頻率 | 前端優先讀快取，不用 `onSnapshot` |
| 事件收集最小化 | Analytics / Crashlytics 僅收集必要事件 |
| Storage 優化 | 大檔案分段（resumable upload）/ 壓縮後再上傳 |

---

### (E) 前後端統一命令接口

Callable Functions 統一入口（定義於 `functions/index.ts`）：

| Function | 用途 |
|----------|------|
| `updateNode(nodeChange)` | 更新網路圖節點 |
| `updateEdge(edgeChange)` | 更新網路圖邊 |
| `updateTimeline(eventChange)` | 更新時間軸事件 |
| `updateDragDrop(itemsChange)` | 更新拖拽看板項目 |

後端判斷是否直接寫入或先快取 → 批次寫入。

---

### (F) Vis + PDnD 使用建議

#### VisNetwork / VisTimeline

- 綁定 `nodes`、`edges`、`items` props（皆為 serialised Firestore 資料）
- 對快取資料渲染，**不直接操作 DB**
- 節點 / 事件變更時，先更新本地 state，再透過 Server Action 批次同步

#### DragDropBoard（PDnD）

- 拖拽 → 更新本地快取 → 呼叫 `commitBatch()`
- 可與網路圖節點或時間軸事件關聯（透過 `VisDateMetadata.sourceDocId`）

#### vis-date + Firebase 協作架構

```
前端操作（VisNetwork / VisTimeline / DragDropBoard）
         │
         ▼ 更新快取（React state / SWR）
         │
  Vis / PDnD 立即渲染
         │
  定時或滿批次
         │
         ▼
  Server Action → commitBatch()
         │
         ▼
  Firestore / RealtimeDB（持久化）
         │
         ▼
  前端 onSnapshot（選擇性，低頻）→ 更新快取 → 重新渲染
```

完整資料契約請參見 [`src/shared/interfaces/index.ts`](../../shared/interfaces/index.ts) 中的 `VisDateMetadata`。

---

## 4️⃣ 組件計劃

以下組件計劃在安裝相應依賴後加入本層：

| 組件 | 依賴 | 狀態 |
|------|------|------|
| `VisNetwork.tsx` | `vis-network` | 待實現 |
| `VisTimeline.tsx` | `vis-timeline` | 待實現 |
| `DragDropBoard.tsx` | `@atlaskit/pragmatic-drag-and-drop` | 待實現 |
| `DropIndicator` (VI) | `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` | 待實現 |

---

> 📌 **架構原則：** Presentation 層永遠不直接存取 Firebase。所有資料由 Server Actions 透過 `cacheAside` 讀取後以 props 傳入，確保 UI 層與資料層解耦。
