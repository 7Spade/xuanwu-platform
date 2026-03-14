import type { NotificationRecord } from "./_entity";
import type { NotificationId } from "./_value-objects";

export interface INotificationRepository {
  findById(id: NotificationId): Promise<NotificationRecord | null>;
  findByRecipient(accountId: string, unreadOnly?: boolean): Promise<NotificationRecord[]>;
  save(record: NotificationRecord): Promise<void>;
  markRead(id: NotificationId, readAt: string): Promise<void>;
}

export interface INotificationDeliveryPort {
  deliver(record: NotificationRecord): Promise<void>;
}
