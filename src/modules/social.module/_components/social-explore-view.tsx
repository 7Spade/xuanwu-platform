"use client";
/**
 * SocialExploreView — discover trending starred resources.
 *
 * Wave 60: "Explore" page for `social.module`.
 *
 * Displays items that have the most "star" reactions across the whole platform.
 * Uses `getRelationsBySubject` for the current user's own starred items to
 * show personalised "already starred" state, and a static discover section.
 *
 * Architecture note: full trending query would require a server-side
 * aggregation; here we show the current user's starred list grouped by
 * targetType as a reasonable "explore" approximation that uses only the
 * existing ISocialGraphRepository contract.
 */

import { Compass, Star, Building2, Users } from "lucide-react";

import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import type { SocialRelationDTO } from "../core/_use-cases";
import { useSocialFeed } from "./use-social-feed";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TARGET_ICON: Record<string, React.ElementType> = {
  workspace: Building2,
  account: Users,
  "daily-log": Star,
  issue: Star,
};

// ---------------------------------------------------------------------------
// Props + component
// ---------------------------------------------------------------------------

interface SocialExploreViewProps {
  accountId: string | undefined;
}

export function SocialExploreView({ accountId }: SocialExploreViewProps) {
  const t = useTranslation("zh-TW");
  const { relations, loading } = useSocialFeed(accountId);

  // Filter to starred items only (star relation = bookmarked for workspace/account)
  const starred = relations.filter((r) => r.relationType === "star");
  const watched = relations.filter((r) => r.relationType === "watch");
  const followed = relations.filter((r) => r.relationType === "follow");

  const sections: { title: string; items: SocialRelationDTO[] }[] = [
    { title: t("social.star"), items: starred },
    { title: t("social.watch"), items: watched },
    { title: t("social.follow"), items: followed },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Compass className="size-5 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("social.explore.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("social.explore.description")}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Compass className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {t("social.explore.empty")}
          </p>
        </div>
      ) : (
        sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <div className="rounded-2xl border border-border/50 bg-card">
              {section.items.map((item, idx) => {
                const Icon = TARGET_ICON[item.targetType] ?? Star;
                return (
                  <div
                    key={item.id}
                    className={[
                      "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                      idx < section.items.length - 1 ? "border-b border-border/40" : "",
                    ].join(" ")}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {item.targetId}
                    </span>
                    <Badge
                      variant="outline"
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      {item.targetType}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
