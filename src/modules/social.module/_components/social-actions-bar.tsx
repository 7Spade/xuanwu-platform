"use client";
/**
 * SocialActionsBar — like + bookmark toggle buttons with live counts.
 *
 * Wave 52: Social reactions on DailyLogCard.
 * Follows the same pattern as other interactive components:
 *   - Lazy-initialised Firestore repository singleton
 *   - Optimistic UI update on click (immediate toggle, then re-sync)
 *   - Requires currentAccountId (from useCurrentAccount)
 */

import { useCallback, useEffect, useState } from "react";
import { Bookmark, Heart } from "lucide-react";

import { useTranslation } from "@/shared/i18n";
import { FirestoreSocialGraphRepository } from "@/modules/social.module/infra.firestore/_repository";
import { toggleReaction, getReactionState } from "@/modules/social.module/core/_use-cases";
import type { SocialTargetType } from "@/modules/social.module/domain.social/_value-objects";

// ---------------------------------------------------------------------------
// Singleton repo
// ---------------------------------------------------------------------------

let _repo: FirestoreSocialGraphRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreSocialGraphRepository();
  return _repo;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SocialActionsBarProps {
  /** ID of the resource being reacted to (e.g. daily log id). */
  targetId: string;
  /** Type of the resource. */
  targetType: SocialTargetType;
  /** ID of the currently signed-in account (undefined = not signed in). */
  currentAccountId: string | undefined;
  /** Optional CSS class for the wrapping element. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SocialActionsBar({
  targetId,
  targetType,
  currentAccountId,
  className,
}: SocialActionsBarProps) {
  const t = useTranslation("zh-TW");

  const [likeActive, setLikeActive] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkActive, setBookmarkActive] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    if (!currentAccountId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      const [likeResult, bookmarkResult] = await Promise.all([
        getReactionState(getRepo(), currentAccountId, targetId, "like"),
        getReactionState(getRepo(), currentAccountId, targetId, "bookmark"),
      ]);
      if (cancelled) return;
      if (likeResult.ok) {
        setLikeActive(likeResult.value.active);
        setLikeCount(likeResult.value.count);
      }
      if (bookmarkResult.ok) {
        setBookmarkActive(bookmarkResult.value.active);
        setBookmarkCount(bookmarkResult.value.count);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [currentAccountId, targetId]);

  const handleLike = useCallback(async () => {
    if (!currentAccountId) return;
    // Capture state before the optimistic update
    const wasActive = likeActive;
    const newActive = !wasActive;
    // Optimistic update
    setLikeActive(newActive);
    setLikeCount((c) => newActive ? c + 1 : Math.max(0, c - 1));
    const result = await toggleReaction(getRepo(), currentAccountId, targetId, targetType, "like");
    if (result.ok) {
      setLikeActive(result.value.active);
      setLikeCount(result.value.count);
    } else {
      // Revert using the captured pre-toggle state
      setLikeActive(wasActive);
      setLikeCount((c) => wasActive ? c + 1 : Math.max(0, c - 1));
    }
  }, [currentAccountId, targetId, targetType, likeActive]);

  const handleBookmark = useCallback(async () => {
    if (!currentAccountId) return;
    // Capture state before the optimistic update
    const wasActive = bookmarkActive;
    const newActive = !wasActive;
    setBookmarkActive(newActive);
    setBookmarkCount((c) => newActive ? c + 1 : Math.max(0, c - 1));
    const result = await toggleReaction(getRepo(), currentAccountId, targetId, targetType, "bookmark");
    if (result.ok) {
      setBookmarkActive(result.value.active);
      setBookmarkCount(result.value.count);
    } else {
      // Revert using the captured pre-toggle state
      setBookmarkActive(wasActive);
      setBookmarkCount((c) => wasActive ? c + 1 : Math.max(0, c - 1));
    }
  }, [currentAccountId, targetId, targetType, bookmarkActive]);

  if (loading) {
    return (
      <div className={`flex items-center gap-3 ${className ?? ""}`}>
        <span className="h-4 w-12 animate-pulse rounded bg-muted" />
        <span className="h-4 w-12 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      <button
        type="button"
        disabled={!currentAccountId}
        onClick={handleLike}
        aria-label={likeActive ? t("social.liked") : t("social.like")}
        aria-pressed={likeActive}
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          "transition-all duration-150 select-none",
          "disabled:cursor-not-allowed disabled:opacity-40",
          likeActive
            ? "bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:hover:bg-rose-900"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        ].join(" ")}
      >
        <Heart
          className={`size-3.5 ${likeActive ? "fill-rose-500 stroke-rose-500 dark:fill-rose-400 dark:stroke-rose-400" : ""}`}
        />
        <span>{likeCount > 0 ? likeCount : ""}</span>
        <span className="sr-only">{likeActive ? t("social.liked") : t("social.like")}</span>
      </button>

      <button
        type="button"
        disabled={!currentAccountId}
        onClick={handleBookmark}
        aria-label={bookmarkActive ? t("social.bookmarked") : t("social.bookmark")}
        aria-pressed={bookmarkActive}
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          "transition-all duration-150 select-none",
          "disabled:cursor-not-allowed disabled:opacity-40",
          bookmarkActive
            ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        ].join(" ")}
      >
        <Bookmark
          className={`size-3.5 ${bookmarkActive ? "fill-amber-500 stroke-amber-500 dark:fill-amber-400 dark:stroke-amber-400" : ""}`}
        />
        <span>{bookmarkCount > 0 ? bookmarkCount : ""}</span>
        <span className="sr-only">{bookmarkActive ? t("social.bookmarked") : t("social.bookmark")}</span>
      </button>
    </div>
  );
}
