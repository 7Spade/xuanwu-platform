"use client";
/**
 * SocialFeedView — displays a chronological list of the current account's
 * social relations (starred, followed, bookmarked items).
 *
 * Wave 60: Social feed for `social.module`.
 *
 * Architecture:
 *  - Uses `useSocialFeed` hook backed by `getRelationsBySubject`.
 *  - Groups relations by type: star / watch / follow / like / bookmark.
 *  - Clicking an item does nothing (read-only view for now).
 */

import {
  Bookmark,
  Building2,
  Eye,
  Heart,
  Rss,
  Star,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import type { SocialRelationDTO } from "../core/_use-cases";
import { useSocialFeed } from "./use-social-feed";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RELATION_ICON: Record<string, React.ElementType> = {
  star: Star,
  watch: Eye,
  follow: UserPlus,
  like: Heart,
  bookmark: Bookmark,
};

const RELATION_BADGE_CLASS: Record<string, string> = {
  star: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  watch: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  follow: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  like: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  bookmark: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

function RelationRow({ relation, t }: { relation: SocialRelationDTO; t: (k: string) => string }) {
  const Icon = RELATION_ICON[relation.relationType] ?? Building2;
  const badgeClass =
    RELATION_BADGE_CLASS[relation.relationType] ??
    "bg-muted/60 text-muted-foreground border-border/40";

  const labelKey = `social.${relation.relationType}`;

  return (
    <div className="flex items-start gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/50">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{relation.targetId}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {relation.targetType} ·{" "}
          {new Date(relation.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Badge variant="outline" className={`shrink-0 text-xs ${badgeClass}`}>
        {t(labelKey) !== labelKey ? t(labelKey) : relation.relationType}
      </Badge>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props + component
// ---------------------------------------------------------------------------

interface SocialFeedViewProps {
  accountId: string | undefined;
}

export function SocialFeedView({ accountId }: SocialFeedViewProps) {
  const t = useTranslation("zh-TW");
  const { relations, loading, error } = useSocialFeed(accountId);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Rss className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">
          {t("social.feed.title")}
        </h2>
        {!loading && relations.length > 0 && (
          <Badge variant="secondary" className="ml-auto h-5 px-2 text-[10px]">
            {relations.length}
          </Badge>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-destructive">{error}</p>
      ) : relations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Rss className="size-10 text-muted-foreground/30" />
          <p className="text-sm font-medium">{t("social.feed.empty")}</p>
          <p className="text-xs text-muted-foreground">
            {t("social.feed.emptyHint")}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card">
          {relations.map((rel, idx) => (
            <div
              key={rel.id}
              className={idx < relations.length - 1 ? "border-b border-border/40" : ""}
            >
              <RelationRow relation={rel} t={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
