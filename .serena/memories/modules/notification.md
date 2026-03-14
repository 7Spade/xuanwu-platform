# notification.module — File Index

**Bounded Context**: 通知 / Notification
**職責**: 通知送達、多管道分發（inbox/email/push）、已讀標記管理。
**不包含**: 事件觸發邏輯（由各業務模組負責）、帳號資料（account.module）。

---

## `index.ts`
**描述**: 公開 API barrel — 匯出 DTOs、用例函數及 Port 介面。
**函數清單**:
- `export type NotificationDTO` — 通知公開 DTO
- `export sendNotification` — 發送通知至指定帳號
- `export markNotificationRead` — 標記通知為已讀
- `export getNotificationsByAccount` — 依帳號查詢通知清單
- `export type INotificationRepository` — 通知 Repository Port 介面
- `export type INotificationDeliveryPort` — 通知分發 Port 介面（email/push）

---

## `core/_use-cases.ts`
**描述**: 通知建立、送達與已讀管理用例。
**函數清單**:
- `interface NotificationDTO` — 通知公開 DTO（id, accountId, channel, priority, title, body, isRead, createdAt）
- `sendNotification(repo, deliveryPort, params): Promise<Result<NotificationDTO>>` — 建立並分發通知
- `markNotificationRead(repo, id): Promise<Result<void>>` — 標記已讀（冪等）
- `getNotificationsByAccount(repo, accountId, options): Promise<Result<NotificationDTO[]>>` — 查詢收件匣

---

## `core/_actions.ts`
**描述**: `'use server'` 薄包裝層，重新匯出寫入型用例。
**函數清單**:
- 重新匯出 `NotificationDTO`（型別）
- 重新匯出 `sendNotification`、`markNotificationRead`

---

## `core/_queries.ts`
**描述**: 伺服器端唯讀查詢重新匯出。
**函數清單**:
- 重新匯出 `NotificationDTO`（型別）
- 重新匯出 `getNotificationsByAccount`

---

## `domain.notification/_value-objects.ts`
**描述**: 通知 domain 的 Branded Types。
**函數清單**:
- `NotificationIdSchema` / `type NotificationId` — 通知唯一識別碼
- `NotificationChannelSchema` / `type NotificationChannel` — enum: `"inbox"|"email"|"push"`
- `NotificationPrioritySchema` / `type NotificationPriority` — enum: `"low"|"normal"|"high"|"urgent"`

---

## `domain.notification/_entity.ts`
**描述**: `NotificationRecord` Aggregate Root，代表一則通知記錄。
**函數清單**:
- `interface NotificationRecord` — Aggregate Root 結構（id, accountId, channel, priority, title, body, isRead, readAt, createdAt）
- `buildNotificationRecord(params, now): NotificationRecord` — 建立通知 entity（isRead 預設 false）

---

## `domain.notification/_events.ts`
**描述**: Notification Bounded Context 的 Domain Event 型別定義。
**函數清單**:
- `interface NotificationDelivered` — 通知送達事件（含 channel 資訊）
- `interface InboxItemRead` — 收件匣通知已讀事件
- `type NotificationDomainEventUnion` — 上述事件的 union type

---

## `domain.notification/_ports.ts`
**描述**: Notification domain 的 Port 介面定義。
**函數清單**:
- `interface INotificationRepository` — 通知持久化（findById, findByAccount, save, markRead）
- `interface INotificationDeliveryPort` — 外部分發抽象（deliver: 依 channel 送達 email/push）

---

## `domain.notification/_service.ts`
**描述**: Notification Domain Service — 純函數，無 I/O。NotificationDeduplicationService（去重邏輯）+ NotificationPriorityService（優先級排序）。Wave 11 實作。
**函數清單**:
- `NOTIFICATION_PRIORITY_ORDER` — 常數陣列，urgent → high → normal → low
- `priorityIndex(p): number` — 回傳優先級的數字索引（0 = 最緊急）
- `sortByPriority(records): NotificationRecord[]` — 由高至低優先級排序
- `shouldDispatch(record, existing, windowMs): boolean` — 判斷是否在去重窗口內已存在相同通知
- `deduplicateNotifications(records, windowMs): NotificationRecord[]` — 過濾批次中的重複通知

---

## `infra.firestore/_mapper.ts`
**描述**: Firestore 文件 ↔ NotificationRecord 的雙向轉換（Wave 11 實作）。
**函數清單**:
- `interface NotificationDoc` — NotificationRecord Firestore 文件格式
- `notificationDocToRecord(d): NotificationRecord` — Firestore → NotificationRecord
- `notificationRecordToDoc(e): NotificationDoc` — NotificationRecord → Firestore

---

## `infra.firestore/_repository.ts`
**描述**: `INotificationRepository` 的 Firestore 實作（Wave 11 實作，使用 Client SDK）。
**函數清單**:
- `class FirestoreNotificationRepository` — 實作 `INotificationRepository`（findById, findByRecipient, save, markRead）
