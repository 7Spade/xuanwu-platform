import type { NotificationId, NotificationChannel, NotificationPriority } from "./_value-objects";

/**
 * An inbox notification item for a specific account.
 * Invariant: once read, it cannot be unread.
 */
export interface NotificationRecord {
  readonly id: NotificationId;
  readonly recipientAccountId: string;
  readonly channel: NotificationChannel;
  readonly priority: NotificationPriority;
  readonly title: string;
  readonly body: string;
  readonly sourceEventKey: string;
  readonly data?: Record<string, unknown>;
  readonly read: boolean;
  readonly createdAt: string;  // ISO-8601
  readonly readAt?: string;    // ISO-8601
}

export function buildNotificationRecord(
  id: NotificationId,
  recipientAccountId: string,
  channel: NotificationChannel,
  priority: NotificationPriority,
  title: string,
  body: string,
  sourceEventKey: string,
  now: string,
): NotificationRecord {
  return {
    id, recipientAccountId, channel, priority,
    title, body, sourceEventKey,
    read: false, createdAt: now,
  };
}
