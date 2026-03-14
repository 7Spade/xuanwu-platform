"use client";
/**
 * UserSettingsView — top-level layout for account settings pages.
 *
 * Source: account.slice/domain.profile/_components/user-settings-view.tsx + user-settings.tsx
 * Adapted: uses ProfileCard + placeholder cards for future settings.
 */

import { Settings } from "lucide-react";

import { useTranslation } from "@/shared/i18n";

import { ProfileCard } from "./profile-card";

export function UserSettingsView() {
  const t = useTranslation("zh-TW");

  return (
    <div className="mx-auto max-w-3xl space-y-8 duration-500 animate-in fade-in">
      <div>
        <div className="flex items-center gap-3">
          <Settings className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">{t("profile.pageTitle")}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.pageDescription")}</p>
      </div>

      <ProfileCard />
    </div>
  );
}
