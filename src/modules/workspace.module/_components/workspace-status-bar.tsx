"use client";
/**
 * WorkspaceStatusBar — compact status ribbon below the workspace header.
 *
 * Source equivalent: workspace.slice/core/_components/workspace-status-bar.tsx
 * Adapted: derives blocked state from work-item statuses instead of blockedBy arrays.
 *
 * Shows:
 *  - Workspace ID (monospace badge)
 *  - Mounted / Isolated (visibility flag)
 *  - Flowing / Blocked  (any work items with status === "blocked")
 */

import { AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react";

import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";

import { useWorkItems } from "./use-work-items";

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface WorkspaceStatusBarProps {
  workspaceId: string;
  workspaceVisibility: string;
}

export function WorkspaceStatusBar({
  workspaceId,
  workspaceVisibility,
}: WorkspaceStatusBarProps) {
  const t = useTranslation("zh-TW");
  const { items } = useWorkItems(workspaceId);

  const isVisible = workspaceVisibility === "visible";
  const blockedCount = items.filter((i) => i.status === "blocked").length;
  const hasBlocked = blockedCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Workspace ID */}
      <Badge className="border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
        ID: {workspaceId.toUpperCase()}
      </Badge>

      {/* Mounted / Isolated */}
      <Badge
        variant="outline"
        className="flex items-center gap-1 bg-background/50 text-[9px] font-bold uppercase backdrop-blur-sm"
      >
        {isVisible ? (
          <Eye className="size-3.5" />
        ) : (
          <EyeOff className="size-3.5" />
        )}
        {isVisible
          ? t("workspace.statusBar.mounted")
          : t("workspace.statusBar.isolated")}
      </Badge>

      {/* Flowing / Blocked */}
      <Badge
        variant="outline"
        className={[
          "flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
          hasBlocked
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
        ].join(" ")}
      >
        {hasBlocked ? (
          <AlertTriangle className="size-3.5" />
        ) : (
          <CheckCircle2 className="size-3.5" />
        )}
        {hasBlocked
          ? `${t("workspace.statusBar.blocked")} (${blockedCount})`
          : t("workspace.statusBar.flowing")}
      </Badge>
    </div>
  );
}
