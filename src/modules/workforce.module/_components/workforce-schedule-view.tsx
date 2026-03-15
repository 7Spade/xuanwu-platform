"use client";
/**
 * WorkforceScheduleView — workspace workforce scheduling capability tab.
 *
 * Wave 59: workforce.module presentation component.
 * Features:
 *  - Summary stats (total, proposals, official, completed)
 *  - Approve / Reject actions on PROPOSAL schedules
 *  - Sorted date range list of all assignments
 *  - Empty state
 */

import { useState } from "react";
import { Users, CalendarDays, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/design-system/primitives/ui/button";
import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import { useWorkforceSchedules } from "./use-workforce-schedules";
import { approveSchedule, rejectSchedule } from "@/modules/workforce.module/core/_use-cases";
import { FirestoreScheduleRepository } from "@/modules/workforce.module/infra.firestore/_repository";
import type { ScheduleDTO } from "@/modules/workforce.module/core/_use-cases";

// ---------------------------------------------------------------------------
// Singleton repo
// ---------------------------------------------------------------------------

let _repo: FirestoreScheduleRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreScheduleRepository();
  return _repo;
}

// ---------------------------------------------------------------------------
// Status badge colours
// ---------------------------------------------------------------------------

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PROPOSAL:  "secondary",
  OFFICIAL:  "default",
  REJECTED:  "destructive",
  COMPLETED: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  PROPOSAL:  "workforce.status.proposal",
  OFFICIAL:  "workforce.status.official",
  REJECTED:  "workforce.status.rejected",
  COMPLETED: "workforce.status.completed",
};

// ---------------------------------------------------------------------------
// Schedule row
// ---------------------------------------------------------------------------

function ScheduleRow({ schedule, onChanged }: { schedule: ScheduleDTO; onChanged: () => void }) {
  const t = useTranslation("zh-TW");
  const [acting, setActing] = useState(false);

  const handleApprove = async () => {
    setActing(true);
    try {
      await approveSchedule(getRepo(), schedule.id);
      onChanged();
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    setActing(true);
    try {
      await rejectSchedule(getRepo(), schedule.id);
      onChanged();
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3">
      <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium">{schedule.title}</p>
        <p className="text-xs text-muted-foreground">
          {schedule.startDate.slice(0, 10)} → {schedule.endDate.slice(0, 10)} · {schedule.assigneeIds.length} {t("workforce.assignees")}
        </p>
      </div>
      <Badge variant={STATUS_VARIANT[schedule.status] ?? "secondary"}>
        {t(STATUS_LABEL[schedule.status] ?? schedule.status)}
      </Badge>
      {schedule.status === "PROPOSAL" && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            title={t("workforce.approve")}
            onClick={handleApprove}
            disabled={acting}
          >
            <CheckCircle2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            title={t("workforce.reject")}
            onClick={handleReject}
            disabled={acting}
          >
            <XCircle className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WorkforceScheduleView
// ---------------------------------------------------------------------------

interface WorkforceScheduleViewProps {
  workspaceId: string;
}

export function WorkforceScheduleView({ workspaceId }: WorkforceScheduleViewProps) {
  const t = useTranslation("zh-TW");
  const { schedules, loading, error, refresh } = useWorkforceSchedules(workspaceId);

  const stats = {
    total:     schedules.length,
    proposals: schedules.filter((s) => s.status === "PROPOSAL").length,
    official:  schedules.filter((s) => s.status === "OFFICIAL").length,
    completed: schedules.filter((s) => s.status === "COMPLETED").length,
  };

  const sorted = [...schedules].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">{t("workspace.workforce.title")}</h2>
        {!loading && (
          <Badge variant="secondary" className="ml-auto h-5 px-2 text-[10px]">
            {stats.total}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{t("workspace.workforce.description")}</p>

      {/* Stats row */}
      {!loading && schedules.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t("workforce.status.proposal"), value: stats.proposals, color: "text-amber-500" },
            { label: t("workforce.status.official"),  value: stats.official,  color: "text-green-600" },
            { label: t("workforce.status.completed"), value: stats.completed, color: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-center">
              <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}

      {!loading && schedules.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
          <Users className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">{t("workspace.workforce.empty")}</p>
          <p className="text-xs text-muted-foreground/70">{t("workspace.workforce.emptyHint")}</p>
        </div>
      )}

      {/* Schedule list */}
      {!loading && sorted.length > 0 && (
        <div className="flex flex-col gap-2">
          {sorted.map((s) => (
            <ScheduleRow key={s.id} schedule={s} onChanged={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
