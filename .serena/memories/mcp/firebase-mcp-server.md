# MCP: firebase-mcp-server

## 基本資訊

| 項目 | 值 |
|------|----|
| Server key | `firebase-mcp-server` |
| Package | `firebase-mcp-server` (npm) |
| Runtime | `npx` |
| Project ID | `xuanwu-i-00708880-4e2d8` |
| 必要 secret | `COPILOT_MCP_FIREBASE_SERVICE_ACCOUNT_KEY_PATH` |
| Docs | https://firebase.google.com/docs |

## 功能特性

- **預設配置**：已綁定 `xuanwu-i-00708880-4e2d8` 專案，無需額外設定
- **多服務覆蓋**：Firestore、Auth、Storage、Hosting、Realtime Database、Security Rules
- **免寫程式碼**：直接以 MCP 工具查詢 Firebase 資源，不需寫 Admin SDK 程式碼
- **安全性**：使用 Service Account Key（路徑從環境變數讀取，不硬編碼）
- **Read-first**：最適合查詢和驗證，寫入操作建議繼續使用 Server Actions 中的 Admin SDK

## 工具列表（按服務分類）

### Firestore
| 工具 | 用途 |
|------|------|
| 查詢集合/文件 | 檢查資料結構和內容 |
| 驗證 Security Rules | 確認規則是否符合設計 |
| 列出集合 | 了解資料庫結構 |

### Authentication
| 工具 | 用途 |
|------|------|
| 列出使用者 | 查看 Auth 使用者清單 |
| 檢查 Custom Claims | 驗證角色/權限設定 |

### Firebase Hosting
| 工具 | 用途 |
|------|------|
| 查看 Hosting 設定 | 確認 rewrites、redirects |
| 觸發/檢查部署 | 監控部署狀態 |

### 一般
| 工具 | 用途 |
|------|------|
| `firebase_get_project` | 取得當前 Firebase 專案資訊 |
| `firebase_list_apps` | 列出所有 Firebase Apps（iOS/Android/Web） |
| `firebase_get_environment` | 查看 CLI 環境設定 |
| `firebase_get_security_rules` | 取得 Firestore/RTDB/Storage 安全規則 |
| `firebase_read_resources` | 讀取 `firebase://` URI 資源 |

## 應用場景

### 資料查詢（免寫程式碼）
```
// 代替：
const snapshot = await admin.firestore().collection('orgs').get()
// 使用：
firebase-mcp-server 查詢 Firestore 集合 'orgs'
```

### 安全規則驗證
- 新增 Firestore 規則後，立即用 `firebase_get_security_rules` 確認部署成功
- 在 PR review 時確認規則符合最小權限原則

### 架構探索
- 了解現有資料結構（集合/文件 schema）
- 確認 Custom Claims 的實際欄位名稱

### 典型工作流程
1. 需要查詢 Firebase 資料 → 優先用 `firebase-mcp-server/*`
2. 需要伺服器端寫入 → 使用 Admin SDK（在 Server Actions 或 Route Handlers）
3. 需要客戶端即時訂閱 → 使用 Web SDK（在 Client Components）

## 在本專案的 Firebase 架構

```
src/infrastructure/firebase/
├── client/          # Web SDK（客戶端用）
│   ├── index.ts     # getFirestore, getAuth, getDatabase
│   └── app-check.ts # reCAPTCHA Enterprise App Check
├── admin/           # Admin SDK（伺服器端用）
│   └── index.ts     # adminDb, adminAuth
└── index.ts         # 匯出兩側 helper
```

## 工具選擇優先級

```
firebase-mcp-server/* (查詢/管理)
  > Admin SDK in Server Actions (伺服器端寫入)
  > Web SDK in Client Components (客戶端即時)
```

## 注意事項

- Coding Agent 環境需要 `COPILOT_MCP_FIREBASE_SERVICE_ACCOUNT_KEY_PATH` secret
- 本地開發：Service Account Key JSON 路徑設在環境變數中
- 不要將 Service Account Key 硬編碼進程式碼或設定檔
