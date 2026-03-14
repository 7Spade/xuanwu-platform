"use client";
/**
 * NotificationsView — notifications list with empty state.
 *
 * Source: notification-hub.slice/_components/notification-bell.tsx (adapted to full page)
 * For now shows empty state; real-time data wired in a future wave.
 */

import { Bell } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import { useTranslation } from "@/shared/i18n";

export function NotificationsView() {
  const t = useTranslation("zh-TW");

  return (
    <div className="mx-auto max-w-2xl space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{t("notifications.title")}</h1>
        </div>
        <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider opacity-60">
          {t("notifications.markAllRead")}
        </Button>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-16 text-center">
        <Bell className="mb-4 size-12 text-muted-foreground opacity-10" />
        <h3 className="text-lg font-bold">{t("notifications.empty")}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {t("notifications.emptyHint")}
        </p>
      </div>
    </div>
  );
}
