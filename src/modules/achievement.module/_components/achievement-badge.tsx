"use client";
/**
 * AchievementBadge — renders a single badge pill with an emoji + slug label.
 *
 * Wave 56: achievement.module presentation component.
 */

import { Badge } from "@/design-system/primitives/ui/badge";
import type { AchievementDTO } from "@/modules/achievement.module/core/_use-cases";

// Map well-known badge slugs to emoji + label pairs.
// Falls back to a generic trophy for unknown slugs.
const BADGE_META: Record<string, { emoji: string; label: string }> = {
  "first-task":      { emoji: "🎯", label: "First Task" },
  "first-log":       { emoji: "📝", label: "First Log" },
  "ten-tasks":       { emoji: "🔟", label: "10 Tasks" },
  "team-player":     { emoji: "🤝", label: "Team Player" },
  "qa-champion":     { emoji: "✅", label: "QA Champion" },
  "finance-guru":    { emoji: "💰", label: "Finance Guru" },
  "schedule-master": { emoji: "📅", label: "Schedule Master" },
  "issue-solver":    { emoji: "🐛", label: "Issue Solver" },
  "accepted":        { emoji: "🏆", label: "Accepted" },
  "verified":        { emoji: "🔍", label: "Verified" },
  "social-butterfly":{ emoji: "🦋", label: "Social Butterfly" },
};

interface AchievementBadgeProps {
  achievement: AchievementDTO;
  size?: "sm" | "md";
}

export function AchievementBadge({ achievement, size = "md" }: AchievementBadgeProps) {
  const meta = BADGE_META[achievement.badgeSlug] ?? { emoji: "🏅", label: achievement.badgeSlug };
  return (
    <Badge
      variant="secondary"
      className={`gap-1 ${size === "sm" ? "h-5 px-1.5 text-[10px]" : "h-6 px-2 text-xs"}`}
      title={`Unlocked: ${new Date(achievement.unlockedAt).toLocaleDateString()}`}
    >
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </Badge>
  );
}
