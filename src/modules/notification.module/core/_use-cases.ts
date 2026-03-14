import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { NotificationRecord } from "../domain.notification/_entity";
import { buildNotificationRecord } from "../domain.notification/_entity";
import type { NotificationId, NotificationChannel, NotificationPriority } from "../domain.notification/_value-objects";
import type { INotificationRepository } from "../domain.notification/_ports";

export interface NotificationDTO {
  readonly id: string;
  readonly recipientAccountId: string;
  readonly channel: NotificationChannel;
  readonly priority: NotificationPriority;
  readonly title: string;
  readonly body: string;
  readonly read: boolean;
  readonly createdAt: string;
}

function entityToDTO(r: NotificationRecord): NotificationDTO {
  return {
    id: r.id, recipientAccountId: r.recipientAccountId,
    channel: r.channel, priority: r.priority,
    title: r.title, body: r.body,
    read: r.read, createdAt: r.createdAt,
  };
}

export async function sendNotification(
  repo: INotificationRepository,
  id: string,
  recipientAccountId: string,
  channel: NotificationChannel,
  priority: NotificationPriority,
  title: string,
  body: string,
  sourceEventKey: string,
): Promise<Result<NotificationDTO>> {
  try {
    const now = new Date().toISOString();
    const record = buildNotificationRecord(
      id as NotificationId, recipientAccountId, channel, priority, title, body, sourceEventKey, now,
    );
    await repo.save(record);
    return ok(entityToDTO(record));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function markNotificationRead(
  repo: INotificationRepository,
  id: string,
): Promise<Result<void>> {
  try {
    await repo.markRead(id as NotificationId, new Date().toISOString());
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getNotificationsByAccount(
  repo: INotificationRepository,
  accountId: string,
  unreadOnly = false,
): Promise<Result<NotificationDTO[]>> {
  try {
    const records = await repo.findByRecipient(accountId, unreadOnly);
    return ok(records.map(entityToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
