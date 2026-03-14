"use client";
/**
 * useNotifications — client-side hook that fetches notifications for the current user.
 *
 * Source equivalent: notification-hub.slice/core/_hooks/use-notifications.ts
 * Adapted: uses FirestoreNotificationRepository (Web SDK) + getNotificationsByAccount
 * use-case. Returns the full list; callers filter for unread if needed.
 *
 * Refreshes when accountId changes or `refresh()` is called (e.g., after mark-read).
 */

import { useEffect, useMemo, useState } from "react";
import { FirestoreNotificationRepository } from "../infra.firestore/_repository";
import {
  getNotificationsByAccount,
  markNotificationRead,
  type NotificationDTO,
} from "../core/_use-cases";

export interface UseNotificationsResult {
  notifications: NotificationDTO[];
  loading: boolean;
  error: string | null;
  /** Re-fetch (e.g., after marking a notification as read). */
  refresh: () => void;
  /** Mark a single notification as read, then refresh. */
  markRead: (id: string) => Promise<void>;
  /** Mark all unread notifications as read, then refresh. */
  markAllRead: () => Promise<void>;
}

/**
 * Fetches all notifications for the given accountId.
 * Pass undefined/null to skip fetching until the user is resolved.
 */
export function useNotifications(
  accountId: string | null | undefined,
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const repo = useMemo(() => new FirestoreNotificationRepository(), []);

  useEffect(() => {
    if (!accountId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getNotificationsByAccount(repo, accountId)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          // Sort newest first for display convenience.
          const sorted = [...result.value].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setNotifications(sorted);
        } else {
          setError(result.error?.message ?? "Failed to load notifications");
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accountId, repo, tick]);

  const refresh = () => setTick((n) => n + 1);

  const markRead = async (id: string) => {
    try {
      await markNotificationRead(repo, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return;
    }
    refresh();
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    try {
      await Promise.all(unread.map((n) => markNotificationRead(repo, n.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return;
    }
    refresh();
  };

  return { notifications, loading, error, refresh, markRead, markAllRead };
}
