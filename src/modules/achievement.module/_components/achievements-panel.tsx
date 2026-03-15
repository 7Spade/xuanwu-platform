"use client";
/**
 * AchievementsPanel — badge wall showing all unlocked achievements for an account.
 *
 * Wave 56: achievement.module presentation component.
 * Rendered in the profile page alongside the ProfileCard.
 */

import { Trophy } from "lucide-react";

import { useTranslation } from "@/shared/i18n";
import { useAchievements } from "./use-achievements";
import { AchievementBadge } from "./achievement-badge";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AchievementsPanelProps {
  accountId: string | null | undefined;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AchievementsPanel({ accountId }: AchievementsPanelProps) {
  const t = useTranslation("zh-TW");
  const { achievements, loading } = useAchievements(accountId);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="size-4 text-amber-500" />
        <h3 className="text-sm font-semibold">{t("achievement.title")}</h3>
        {!loading && (
          <span className="ml-auto text-xs text-muted-foreground">
            {achievements.length} {t("achievement.unlocked")}
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-xs text-muted-foreground">{t("common.loading")}</p>
      )}

      {/* Empty state */}
      {!loading && achievements.length === 0 && (
        <p className="text-xs text-muted-foreground">{t("achievement.empty")}</p>
      )}

      {/* Badge wall */}
      {!loading && achievements.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {achievements.map((a) => (
            <AchievementBadge key={a.id} achievement={a} />
          ))}
        </div>
      )}
    </div>
  );
}
