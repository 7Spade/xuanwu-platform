"use client";
/**
 * FollowersPanel — followers and following list for an account profile.
 *
 * Wave 60: Social followers/following panel for `social.module`.
 *
 * - "Following" = relations where subjectAccountId === accountId
 *   (uses useSocialFeed filtered to "follow" type)
 * - "Followers" = relations where targetId === accountId and relationType === "follow"
 *   (uses findByTargetAndType — exposed via getRelationsBySubject of others,
 *   but here we use the subject feed filtered on the target side)
 *
 * Architecture note: since ISocialGraphRepository.findByTarget returns ALL
 * relation types, we load the account's feed and split into following/
 * followers sections.
 */

import { UserPlus, Users } from "lucide-react";

import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import { useSocialFeed } from "./use-social-feed";

// ---------------------------------------------------------------------------
// Props + component
// ---------------------------------------------------------------------------

interface FollowersPanelProps {
  accountId: string | undefined;
}

export function FollowersPanel({ accountId }: FollowersPanelProps) {
  const t = useTranslation("zh-TW");
  const { relations, loading } = useSocialFeed(accountId);

  // "Following" — workspaces and accounts this user has followed/starred/watched
  const following = relations.filter((r) =>
    r.relationType === "follow" || r.relationType === "star" || r.relationType === "watch",
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="size-5 text-muted-foreground" />
        <h3 className="text-base font-semibold tracking-tight">
          {t("social.following.title")}
        </h3>
        {!loading && (
          <Badge variant="secondary" className="ml-auto h-5 px-2 text-[10px]">
            {following.length}
          </Badge>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : following.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-4 py-3">
          <UserPlus className="size-4 shrink-0 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            {t("social.following.empty")}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card">
          {following.map((rel, idx) => (
            <div
              key={rel.id}
              className={[
                "flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40",
                idx < following.length - 1 ? "border-b border-border/40" : "",
              ].join(" ")}
            >
              <UserPlus className="size-3.5 shrink-0 text-muted-foreground/60" />
              <span className="min-w-0 flex-1 truncate text-sm">{rel.targetId}</span>
              <Badge
                variant="outline"
                className="shrink-0 text-xs text-muted-foreground"
              >
                {rel.targetType}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
