"use client";
/**
 * WorkspaceGrantsView — read-only workspace members (grants) list.
 *
 * Source equivalent: workspace.slice/core/_components/workspace-settings.tsx
 * (members section). Adapted: read-only display, no write-path mutations yet.
 *
 * Shows active grants for the workspace: user ID, role, and granted date.
 */

import { Loader2, Users, ShieldCheck, Eye, Edit } from "lucide-react";

import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import type { WorkspaceGrantDTO } from "@/modules/workspace.module/core/_use-cases";

import { useWorkspace } from "./use-workspace";

// ---------------------------------------------------------------------------
// Role → badge variant
// ---------------------------------------------------------------------------

const ROLE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  Manager:     "default",
  Contributor: "secondary",
  Viewer:      "outline",
};

function RoleIcon({ role }: { role: string }) {
  const cls = "size-3";
  switch (role) {
    case "Manager":     return <ShieldCheck className={cls} />;
    case "Contributor": return <Edit className={cls} />;
    default:            return <Eye className={cls} />;
  }
}

// ---------------------------------------------------------------------------
// Single grant row
// ---------------------------------------------------------------------------

function GrantRow({ grant }: { grant: WorkspaceGrantDTO }) {
  const formattedDate = new Date(grant.grantedAt).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/30 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs font-medium text-foreground">
          {grant.userId}
        </p>
        <p className="text-[10px] text-muted-foreground">{formattedDate}</p>
      </div>
      <Badge
        variant={ROLE_VARIANT[grant.role] ?? "outline"}
        className="flex shrink-0 items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
      >
        <RoleIcon role={grant.role} />
        {grant.role}
      </Badge>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public view component
// ---------------------------------------------------------------------------

interface WorkspaceGrantsViewProps {
  workspaceId: string;
}

export function WorkspaceGrantsView({ workspaceId }: WorkspaceGrantsViewProps) {
  const t = useTranslation("zh-TW");
  const { workspace, loading } = useWorkspace(workspaceId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const grants = workspace?.grants ?? [];

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Users className="size-4 text-muted-foreground" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("workspace.members.title")}
        </h3>
      </div>

      {grants.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-16 text-center">
          <div className="rounded-2xl bg-muted/40 p-4">
            <Users className="size-10 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">{t("workspace.members.none")}</p>
            <p className="text-[11px] text-muted-foreground">
              {t("workspace.members.noneHint")}
            </p>
          </div>
        </div>
      ) : (
        /* Grants list */
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
          <div className="divide-y divide-border/30 px-4">
            {grants.map((grant) => (
              <GrantRow key={grant.grantId} grant={grant} />
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {grants.length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-muted/20 px-4 py-3">
          <Users className="size-4 text-muted-foreground" />
          <p className="text-[11px] font-semibold text-muted-foreground">
            {t("workspace.members.count").replace("{count}", String(grants.length))}
          </p>
        </div>
      )}
    </div>
  );
}
