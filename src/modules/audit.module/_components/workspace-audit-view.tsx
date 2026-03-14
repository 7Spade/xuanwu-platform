"use client";
/**
 * WorkspaceAuditView — client component that renders workspace audit activity.
 *
 * Source equivalent: workspace.slice/gov.audit/_components/audit.workspace-view.tsx
 * Adapted: uses useWorkspaceAuditLog hook + AuditLogView.
 */

import { Activity } from "lucide-react";

import { useTranslation } from "@/shared/i18n";

import { AuditLogView } from "./audit-log-view";
import { useWorkspaceAuditLog } from "./use-audit-log";

interface WorkspaceAuditViewProps {
  workspaceId: string;
}

export function WorkspaceAuditView({ workspaceId }: WorkspaceAuditViewProps) {
  const t = useTranslation("zh-TW");
  const { entries, loading, error } = useWorkspaceAuditLog(workspaceId, 100);

  return (
    <div className="flex h-full flex-col space-y-4 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <Activity className="size-5 animate-pulse text-primary" />
        <h1 className="text-lg font-bold tracking-tight">{t("audit.title")}</h1>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto pr-2">
        <AuditLogView entries={entries} loading={loading} error={error} />
      </div>
    </div>
  );
}
