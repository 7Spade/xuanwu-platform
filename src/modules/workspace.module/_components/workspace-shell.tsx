"use client";
/**
 * WorkspaceShell — workspace-level contextual header + tab navigation.
 *
 * Renders:
 *  - Workspace name (live from Firestore via useWorkspace)
 *  - Lifecycle state badge + Settings gear button
 *  - WorkspaceStatusBar (ID + Mounted/Isolated + Flowing/Blocked)
 *  - Physical address (if present)
 *  - WorkspaceNavTabs horizontal capability strip (dynamic from capabilities)
 *
 * Source equivalent: WorkspaceLayoutInner in workspace.slice/[id]/layout.tsx.
 */

import { MapPin, Loader2, Settings } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/design-system/primitives/ui/badge";
import { Button } from "@/design-system/primitives/ui/button";
import type { WorkspaceDTO } from "@/modules/workspace.module";

import { useWorkspace } from "./use-workspace";
import { WorkspaceNavTabs } from "./workspace-nav-tabs";
import { WorkspaceStatusBar } from "./workspace-status-bar";
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type WorkspaceAddress = NonNullable<WorkspaceDTO["address"]>;

function formatWorkspaceAddress(address: WorkspaceAddress): string {
  return [
    address.street,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

// ---------------------------------------------------------------------------
// Props + component
// ---------------------------------------------------------------------------

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
  const { workspace, loading, refresh } = useWorkspace(workspaceId);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const formattedAddress = workspace?.address
    ? formatWorkspaceAddress(workspace.address)
    : null;

  return (
    <div className="space-y-3 border-b border-border/40 pb-4">
      {/* Workspace name + lifecycle badge + settings button */}
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
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-7 text-muted-foreground hover:text-foreground"
              onClick={() => setSettingsOpen(true)}
              title="Workspace settings"
            >
              <Settings className="size-4" />
            </Button>
          </>
        )}
      </div>

      {/* Status bar (ID + Mounted/Isolated + Flowing/Blocked) */}
      {!loading && (
        <WorkspaceStatusBar
          workspaceId={workspaceId}
          workspaceVisibility={workspace?.visibility ?? "hidden"}
        />
      )}

      {/* Physical address */}
      {formattedAddress && (
        <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-2 ring-1 ring-border/40">
          <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{formattedAddress}</p>
        </div>
      )}

      {/* Capability tab navigation */}
      <WorkspaceNavTabs
        slug={slug}
        workspaceId={workspaceId}
        capabilities={workspace?.capabilities}
      />

      {/* Settings dialog */}
      {workspace && settingsOpen && (
        <WorkspaceSettingsDialog
          workspace={workspace}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onSaved={() => { refresh(); }}
        />
      )}
    </div>
  );
}

