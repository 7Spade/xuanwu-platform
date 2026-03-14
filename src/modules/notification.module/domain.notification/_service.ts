/**
 * Notification domain services.
 *
 * Pure functions — no I/O, no async, no side-effects.
 *
 * NotificationDeduplicationService:
 *   - shouldDispatch  — returns false when an identical notification (same
 *     sourceEventKey + recipientAccountId) was already emitted within the
 *     configurable deduplication window.
 *   - deduplicateNotifications — filters a batch down to the non-duplicate set.
 *
 * NotificationPriorityService:
 *   - NOTIFICATION_PRIORITY_ORDER — canonical ordering from highest to lowest.
 *   - priorityIndex — numeric rank of a priority value (lower = more urgent).
 *   - sortByPriority — sort notifications highest-to-lowest priority.
 */

import type { NotificationRecord } from "./_entity";
import type { NotificationPriority } from "./_value-objects";

// ---------------------------------------------------------------------------
// Priority constants & helpers
// ---------------------------------------------------------------------------

/**
 * Canonical priority ordering — index 0 is most urgent.
 */
export const NOTIFICATION_PRIORITY_ORDER: readonly NotificationPriority[] = [
  "urgent",
  "high",
  "normal",
  "low",
];

/**
 * Numeric rank of a priority value (0 = most urgent).
 * Unknown values are placed after "low".
 */
export function priorityIndex(p: NotificationPriority): number {
  const idx = NOTIFICATION_PRIORITY_ORDER.indexOf(p);
  return idx === -1 ? NOTIFICATION_PRIORITY_ORDER.length : idx;
}

/**
 * Sort a list of NotificationRecords from highest to lowest priority.
 * Does not mutate the input array.
 */
export function sortByPriority(
  records: readonly NotificationRecord[],
): NotificationRecord[] {
  return [...records].sort(
    (a, b) => priorityIndex(a.priority) - priorityIndex(b.priority),
  );
}

// ---------------------------------------------------------------------------
// NotificationDeduplicationService
// ---------------------------------------------------------------------------

/**
 * Return `true` if `record` should be dispatched — i.e. no matching
 * notification (same `sourceEventKey` + `recipientAccountId`) exists in
 * `existing` whose `createdAt` falls within `windowMs` milliseconds before
 * `record.createdAt`.
 */
export function shouldDispatch(
  record: NotificationRecord,
  existing: readonly NotificationRecord[],
  windowMs: number,
): boolean {
  const recordTime = new Date(record.createdAt).getTime();
  const cutoff = recordTime - windowMs;

  return !existing.some(
    (e) =>
      e.sourceEventKey === record.sourceEventKey &&
      e.recipientAccountId === record.recipientAccountId &&
      new Date(e.createdAt).getTime() >= cutoff,
  );
}

/**
 * Filter `records` down to those that should be dispatched given `windowMs`
 * deduplication window.  Records are evaluated in insertion order; each
 * accepted record is added to the "seen" pool before the next is evaluated.
 */
export function deduplicateNotifications(
  records: readonly NotificationRecord[],
  windowMs: number,
): NotificationRecord[] {
  const accepted: NotificationRecord[] = [];

  for (const record of records) {
    if (shouldDispatch(record, accepted, windowMs)) {
      accepted.push(record);
    }
  }

  return accepted;
}
