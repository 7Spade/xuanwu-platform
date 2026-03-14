# file.module — File Index

**Bounded Context**: 檔案管理 / File Management
**職責**: 檔案上傳、版本管理、文件解析狀態追蹤。
**不包含**: 工作項目附件關聯（work.module）、搜尋索引（search.module）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type FileDTO` — 檔案公開 DTO
- `export uploadFile` — 上傳新檔案（建立 FileEntity 並觸發解析）
- `export getFilesByWorkspace` — 依工作空間查詢檔案清單
- `export type IFileRepository` — 檔案 Repository Port 介面
- `export type IStoragePort` — 儲存服務 Port 介面（Firebase Storage 抽象）

---

## `core/_use-cases.ts`
**描述**: 檔案上傳與查詢用例，含版本管理邏輯。
**函數清單**:
- `interface FileDTO` — 檔案公開 DTO（id, workspaceId, fileName, mimeType, sizeBytes, storageUrl, parseStatus, currentVersion, createdAt）
- `uploadFile(repo, storagePort, params): Promise<Result<FileDTO>>` — 上傳檔案並建立版本記錄
- `getFilesByWorkspace(repo, workspaceId): Promise<Result<FileDTO[]>>` — 查詢工作空間檔案清單

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `FileDTO`（型別）
- 重新匯出 `uploadFile`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `FileDTO`（型別）
- 重新匯出 `getFilesByWorkspace`

---

## `domain.file/_value-objects.ts`
**描述**: 檔案 domain 的 Branded Types。
**函數清單**:
- `FileIdSchema` / `type FileId` — 檔案唯一識別碼
- `FileVersionIdSchema` / `type FileVersionId` — 版本唯一識別碼
- `ParseStatusSchema` / `type ParseStatus` — 文件解析狀態 enum: `"pending"|"processing"|"success"|"failed"`

---

## `domain.file/_entity.ts`
**描述**: `FileEntity` Aggregate Root，持有 FileVersion 版本記錄清單。
**函數清單**:
- `interface FileVersion` — 檔案版本快照（versionId, storageUrl, sizeBytes, mimeType, createdAt）
- `interface FileEntity` — Aggregate Root（id, workspaceId, fileName, mimeType, parseStatus, versions, currentVersion, createdAt）
- `buildFileEntity(params, now): FileEntity` — 建立初始版本為 v1 的 FileEntity

---

## `domain.file/_events.ts`
**描述**: File Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface FileUploaded` — 檔案上傳完成事件（含 workspaceId, fileName, storageUrl）
- `interface DocumentParsed` — 文件解析完成事件（含解析狀態與結果摘要）
- `type FileDomainEventUnion` — 上述事件的 union type

---

## `domain.file/_ports.ts`
**描述**: File domain 的 Port 介面定義。
**函數清單**:
- `interface IFileRepository` — 檔案元資料持久化（findById, findByWorkspace, save）
- `interface IStoragePort` — 儲存服務抽象（upload, generateSignedUrl, delete）— 對應 Firebase Storage

---

## `domain.file/_service.ts`
**描述**: File Domain Service 規格說明。
**函數清單**:
- `FileVersioningService`（描述）— 管理版本號遞增與舊版本清理
- `DocumentParsingOrchestrator`（描述）— 協調文件解析流程（PDF/Office 格式）

---

## `infra.firestore/_repository.ts`
**描述**: `IFileRepository` 的 Firestore 實作骨架。Storage URL 存於 Firestore，實際檔案存於 Firebase Storage。
**函數清單**: *(待實作，目前為佔位註解)*

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ FileEntity 的雙向轉換（含版本記錄子集合映射）。
**函數清單**: *(待實作，目前為佔位註解)*
