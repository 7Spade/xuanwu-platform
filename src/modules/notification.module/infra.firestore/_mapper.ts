/**
 * Notification mapper — Firestore document ↔ NotificationRecord transformation.
 *
 * Keeps all Firestore-specific field names and null-coercions in one place,
 * so the domain layer never has to know about Firestore's wire format.
 */

import type { NotificationRecord } from "../domain.notification/_entity";
import type {
  NotificationId,
  NotificationChannel,
  NotificationPriority,
} from "../domain.notification/_value-objects";

// ---------------------------------------------------------------------------
// Firestore document shape (raw, unvalidated)
// ---------------------------------------------------------------------------

/** Raw Firestore document shape for a NotificationRecord. */
export interface NotificationDoc {
  id: string;
  recipientAccountId: string;
  channel: string;
  priority: string;
  title: string;
  body: string;
  sourceEventKey: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

// ---------------------------------------------------------------------------
// Firestore → Domain
// ---------------------------------------------------------------------------

/**
 * Maps a raw Firestore NotificationDoc to a typed NotificationRecord.
 */
export function notificationDocToRecord(d: NotificationDoc): NotificationRecord {
  return {
    id: d.id as NotificationId,
    recipientAccountId: d.recipientAccountId,
    channel: d.channel as NotificationChannel,
    priority: d.priority as NotificationPriority,
    title: d.title,
    body: d.body,
    sourceEventKey: d.sourceEventKey,
    ...(d.data != null ? { data: d.data } : {}),
    read: d.read,
    createdAt: d.createdAt,
    ...(d.readAt != null ? { readAt: d.readAt } : {}),
  };
}

// ---------------------------------------------------------------------------
// Domain → Firestore
// ---------------------------------------------------------------------------

/**
 * Maps a NotificationRecord to a plain object suitable for Firestore write.
 */
export function notificationRecordToDoc(e: NotificationRecord): NotificationDoc {
  return {
    id: e.id,
    recipientAccountId: e.recipientAccountId,
    channel: e.channel,
    priority: e.priority,
    title: e.title,
    body: e.body,
    sourceEventKey: e.sourceEventKey,
    data: e.data ?? null,
    read: e.read,
    createdAt: e.createdAt,
    readAt: e.readAt ?? null,
  };
}
