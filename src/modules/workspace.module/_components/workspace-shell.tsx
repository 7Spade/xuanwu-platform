"use client";
/**
 * WorkspaceShell — workspace-level contextual header + tab navigation.
 *
 * Renders:
 *  - Workspace name (live from Firestore via useWorkspace)
 *  - Lifecycle state badge
 *  - WorkspaceNavTabs horizontal capability strip
 *
 * Source equivalent: the PageHeader + WorkspaceStatusBar + WorkspaceNavTabs
 * assembly in workspace.slice/core/_components/workspace-provider.tsx.
 *
 * Kept deliberately thin — no business logic.
 */

import { Loader2 } from "lucide-react";

import { Badge } from "@/design-system/primitives/ui/badge";

import { useWorkspace } from "./use-workspace";
import { WorkspaceNavTabs } from "./workspace-nav-tabs";

interface WorkspaceShellProps {
  slug: string;
  workspaceId: string;
}

/** Lifecycle state → badge variant mapping. */
const LIFECYCLE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  preparatory: "outline",
  active: "default",
  stopped: "secondary",
};

export function WorkspaceShell({ slug, workspaceId }: WorkspaceShellProps) {
  const { workspace, loading } = useWorkspace(workspaceId);

  return (
    <div className="space-y-3 border-b border-border/40 pb-3">
      {/* Workspace name row */}
      <div className="flex items-center gap-3">
        {loading ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <h2 className="text-sm font-bold tracking-tight">
              {workspace?.name ?? workspaceId}
            </h2>
            {workspace?.lifecycleState && (
              <Badge
                variant={
                  LIFECYCLE_VARIANT[workspace.lifecycleState] ?? "outline"
                }
                className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-widest"
              >
                {workspace.lifecycleState}
              </Badge>
            )}
          </>
        )}
      </div>

      {/* Capability tab navigation */}
      <WorkspaceNavTabs slug={slug} workspaceId={workspaceId} />
    </div>
  );
}
