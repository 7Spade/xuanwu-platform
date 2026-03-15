"use client";
/**
 * AuditLogView — displays a timeline of audit log entries.
 *
 * Source equivalent: workspace.slice/gov.audit/_components/audit.account-view.tsx
 *                    + audit.workspace-view.tsx + audit-event-item.tsx
 * Adapted: uses AuditDisplayEntry (from use-audit-log hook) instead of the
 * source's in-memory AuditLog context. Follows the same visual timeline style.
 */

import { format } from "date-fns";
import {
  Activity,
  AlertCircle,
  Loader2,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";

import { useTranslation } from "@/shared/i18n";

import type { AuditDisplayEntry, AuditEntryType } from "./use-audit-log";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AuditTypeIcon({ type }: { type: AuditEntryType }) {
  switch (type) {
    case "create":
      return <Zap className="size-3.5 text-green-500" />;
    case "delete":
      return <Shield className="size-3.5 text-destructive" />;
    case "security":
      return <Terminal className="size-3.5 text-muted-foreground" />;
    case "update":
    default:
      return <Activity className="size-3.5 text-primary" />;
  }
}

function actionColour(type: AuditEntryType): string {
  switch (type) {
    case "create":
      return "text-green-500";
    case "delete":
      return "text-destructive";
    case "security":
      return "text-muted-foreground";
    default:
      return "text-primary";
  }
}

interface AuditEntryRowProps {
  entry: AuditDisplayEntry;
}

function AuditEntryRow({ entry }: AuditEntryRowProps) {
  const timeLabel = (() => {
    try {
      return format(new Date(entry.occurredAt), "PPP p");
    } catch {
      return entry.occurredAt;
    }
  })();

  return (
    <div className="relative pl-8">
      {/* vertical line */}
      <div className="absolute left-[7px] top-1 h-full w-px bg-border/50" />
      {/* dot */}
      <div className="absolute left-1.5 top-1 flex size-4 items-center justify-center rounded-full border-2 border-border bg-background">
        <AuditTypeIcon type={entry.type} />
      </div>
      <div className="space-y-1 py-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium leading-none">
            <span className="font-bold">{entry.actor}</span>{" "}
            <span className={actionColour(entry.type)}>{entry.action}</span>{" "}
            <span className="text-foreground/80">{entry.target}</span>
          </p>
          <time className="shrink-0 text-[10px] text-muted-foreground">
            {timeLabel}
          </time>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface AuditLogViewProps {
  entries: AuditDisplayEntry[];
  loading: boolean;
  error?: string | null;
  /** When true, shows the "not available in personal context" message. */
  personalContext?: boolean;
}

/**
 * AuditLogView — pure presentation component for the audit timeline.
 * Accepts pre-fetched entries from `useWorkspaceAuditLog` or
 * `useResourceAuditLog`.
 */
export function AuditLogView({
  entries,
  loading,
  error,
  personalContext = false,
}: AuditLogViewProps) {
  const t = useTranslation("zh-TW");

  if (personalContext) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <AlertCircle className="size-10 text-muted-foreground" />
        <h3 className="font-bold">{t("audit.notAvailable")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("audit.notAvailableDescription")}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-16 text-center opacity-40">
        <Terminal className="size-12" />
        <p className="text-sm font-black uppercase tracking-widest">
          {t("audit.noEntries")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 duration-300 animate-in fade-in">
      {entries.map((entry) => (
        <AuditEntryRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
