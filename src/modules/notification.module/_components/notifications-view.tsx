"use client";
/**
 * NotificationsView — notifications list with real-time data.
 *
 * Source: notification-hub.slice/_components/notification-bell.tsx (adapted to full page)
 * Wave 24: wired to Firestore via useCurrentAccount + useNotifications.
 * Shows loading spinner → sorted notification list → empty state.
 */

import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import { useTranslation } from "@/shared/i18n";
import { useCurrentAccount } from "@/modules/account.module/_components/account-provider";
import { useNotifications } from "./use-notifications";
import { NotificationItem } from "./notification-item";

export function NotificationsView() {
  const t = useTranslation("zh-TW");
  const { account, loading: authLoading } = useCurrentAccount();
  const {
    notifications,
    loading: notifLoading,
    markRead,
    markAllRead,
  } = useNotifications(account?.id);

  const loading = authLoading || notifLoading;
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{t("notifications.title")}</h1>
        </div>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-bold uppercase tracking-wider"
            onClick={() => void markAllRead()}
          >
            {t("notifications.markAllRead")}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={(id) => void markRead(id)}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-16 text-center">
          <Bell className="mb-4 size-12 text-muted-foreground opacity-10" />
          <h3 className="text-lg font-bold">{t("notifications.empty")}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t("notifications.emptyHint")}
          </p>
        </div>
      )}
    </div>
  );
}
