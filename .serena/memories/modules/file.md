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
**描述**: File domain service — 純函數，無 I/O。版本衝突偵測、MIME 分群、版本查找。
**函數清單**:
- `type MimeGroup = 'image'|'document'|'code'|'data'|'other'` — MIME 粗分類型別
- `MIME_PREFIX_MAP` — MIME 前綴 → MimeGroup 映射常數
- `getMimeGroup(mimeType): MimeGroup` — 將 mimeType 分類至 MimeGroup
- `getCurrentVersion(file): FileVersion|undefined` — 找到 currentVersionId 對應的版本
- `resolveCanonicalVersion(versions): FileVersion` — 返回 versionNumber 最大的版本
- `isVersionStale(version, file): boolean` — 版本是否不再是目前版本
- `detectVersionConflict(a, b): boolean` — 同 versionNumber 但不同 versionId（並發衝突）
- `getVersionByNumber(file, n): FileVersion|undefined` — 按版本號查找版本
- `buildFileVersion(id, versionNumber, versionName, size, uploadedBy, downloadURL, now, storagePath?): FileVersion` — Factory
- `isParseComplete(file): boolean`
- `isParseInProgress(file): boolean`
- `canSubmitForParsing(file, supportedGroups?): boolean`

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore document ↔ FileEntity / FileVersion 雙向轉換。
**函數清單**:
- `interface FileVersionDoc` — Firestore 版本子文件結構
- `interface FileEntityDoc` — Firestore 檔案文件結構
- `fileVersionDocToVO(doc): FileVersion`
- `fileVersionToDoc(version): FileVersionDoc`
- `fileEntityDocToEntity(doc): FileEntity`
- `fileEntityToDoc(entity): FileEntityDoc`

---

## `infra.firestore/_repository.ts`
**描述**: `IFileRepository` 的 Firestore 實作。扁平集合 `files/{fileId}`，workspaceId 為索引欄位。
**函數清單**:
- `class FirestoreFileRepository implements IFileRepository`
  - `findById(id): Promise<FileEntity|null>`
  - `findByWorkspaceId(workspaceId): Promise<FileEntity[]>`
  - `save(file): Promise<void>`
  - `deleteById(id): Promise<void>`

---

## `_components/use-files.ts` *(Wave 29)*
**描述**: Client-side React hook。透過 `FirestoreFileRepository.findByWorkspaceId(workspaceId)` 取得工作空間檔案清單。回傳 `{ files, loading, error }`。
**Export**: `useFiles(workspaceId: string | null | undefined)` — 用於 `EditorView`

## `_components/file-item.tsx` *(Wave 29)*
**描述**: 單一檔案列，顯示 mime group badge（image/document/code/data/other）、版本數、建立日期。
**Export**: `FileItem` — 用於 `EditorView`
