import type { NotificationId, NotificationChannel } from "./_value-objects";

interface NotificationDomainEvent {
  readonly notificationId: NotificationId;
  readonly occurredAt: string;
}

export interface NotificationDelivered extends NotificationDomainEvent {
  readonly type: "notification:delivered";
  readonly channel: NotificationChannel;
  readonly recipientAccountId: string;
}

export interface InboxItemRead extends NotificationDomainEvent {
  readonly type: "notification:inbox:read";
  readonly recipientAccountId: string;
}

export type NotificationDomainEventUnion = NotificationDelivered | InboxItemRead;
