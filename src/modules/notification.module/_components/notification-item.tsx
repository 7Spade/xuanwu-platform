"use client";
/**
 * NotificationItem — displays a single notification row.
 *
 * Source equivalent: notification-hub.slice/_components/notification-item.tsx
 * Adapted: uses platform i18n + design-system primitives.
 *
 * Shows priority indicator, title, body, relative timestamp, and a
 * "mark as read" ghost button that appears on hover for unread items.
 */

import { Bell, CheckCheck, Clock } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import type { NotificationDTO } from "@/modules/notification.module/core/_use-cases";

interface NotificationItemProps {
  notification: NotificationDTO;
  onMarkRead: (id: string) => void;
}

function priorityVariant(
  priority: NotificationDTO["priority"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case "urgent":
      return "destructive";
    case "high":
      return "default";
    case "normal":
      return "secondary";
    default:
      return "outline";
  }
}

export function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const t = useTranslation("zh-TW");

  function formatRelativeTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return t("notifications.justNow");
    if (minutes < 60) return `${minutes} ${t("notifications.minutesAgo")}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${t("notifications.hoursAgo")}`;
    const days = Math.floor(hours / 24);
    return `${days} ${t("notifications.daysAgo")}`;
  }

  return (
    <div
      className={`group relative flex items-start gap-3 rounded-2xl border px-4 py-3 transition-colors ${
        notification.read
          ? "border-border/40 bg-card/50 opacity-60"
          : "border-border/60 bg-card shadow-sm"
      }`}
    >
      {/* Unread dot */}
      {!notification.read && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      )}
      {notification.read && (
        <Bell className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      )}

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold leading-tight">
            {notification.title}
          </p>
          <Badge
            variant={priorityVariant(notification.priority)}
            className="h-4 shrink-0 px-1.5 text-[9px] font-bold uppercase tracking-wider"
          >
            {notification.priority}
          </Badge>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {notification.body}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="size-3" />
          <span>{formatRelativeTime(notification.createdAt)}</span>
        </div>
      </div>

      {/* Mark-read action (hover reveal for unread items) */}
      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 gap-1 px-2 text-[10px] font-bold uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onMarkRead(notification.id)}
        >
          <CheckCheck className="size-3" />
          {t("notifications.markRead")}
        </Button>
      )}
    </div>
  );
}

