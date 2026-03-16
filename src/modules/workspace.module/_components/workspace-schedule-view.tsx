"use client";
/**
 * WorkspaceScheduleView — Schedule/Calendar view for workspace tasks.
 * Wave 51: capability-gated (requires "schedule" capability).
 *
 * Source: workforce-scheduling.slice/domain.ui/components/UnifiedCalendarGrid
 *         + workforce-scheduling.slice/domain.ui/components/TimelineCanvas
 *
 * Architecture:
 *  - Uses work items with dueDate to build a month-grid calendar.
 *  - Tasks are grouped by due date and displayed as compact cards on their date cells.
 *  - Navigation: prev/next month, current month indicator.
 *  - No external vis.js dependency — pure React implementation.
 */

import { useMemo, useState } from "react";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { Badge } from "@/design-system/primitives/ui/badge";
import { Button } from "@/design-system/primitives/ui/button";
import { useTranslation } from "@/shared/i18n";
import { useWorkItems } from "./use-work-items";
import type { WorkItemDTO } from "@/modules/work.module";

// ---------------------------------------------------------------------------
// Calendar utilities
// ---------------------------------------------------------------------------

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfWeek(year: number, month: number): number {
  // 0=Sun, 1=Mon, …
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function parseIsoDate(iso: string): string {
  // Extract YYYY-MM-DD portion
  return iso.slice(0, 10);
}

// ---------------------------------------------------------------------------
// Priority colour helper
// ---------------------------------------------------------------------------

function priorityColor(p: WorkItemDTO["priority"]): string {
  switch (p) {
    case "critical": return "bg-red-500 text-white";
    case "high": return "bg-orange-400 text-white";
    case "medium": return "bg-blue-400 text-white";
    default: return "bg-muted text-muted-foreground";
  }
}

// ---------------------------------------------------------------------------
// Day cell
// ---------------------------------------------------------------------------

interface DayCellProps {
  year: number;
  month: number;
  day: number;
  today: string;
  items: WorkItemDTO[];
}

function DayCell({ year, month, day, today, items }: DayCellProps) {
  const dateStr = formatDate(year, month, day);
  const isToday = dateStr === today;
  const isWeekend = [0, 6].includes(new Date(year, month, day).getDay());

  return (
    <div
      className={[
        "min-h-[72px] rounded-lg border p-1.5 transition-colors",
        isToday
          ? "border-primary/60 bg-primary/5"
          : isWeekend
            ? "border-border/30 bg-muted/20"
            : "border-border/40 bg-card",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span
          className={[
            "inline-flex size-5 items-center justify-center rounded-full text-[10px] font-semibold",
            isToday
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground",
          ].join(" ")}
        >
          {day}
        </span>
        {items.length > 0 && (
          <Badge
            variant="secondary"
            className="h-4 px-1 text-[9px] font-bold"
          >
            {items.length}
          </Badge>
        )}
      </div>
      <div className="mt-1 space-y-0.5">
        {items.slice(0, 2).map((item) => (
          <div
            key={item.id}
            title={item.title}
            className={[
              "truncate rounded px-1 py-0.5 text-[9px] font-medium",
              priorityColor(item.priority),
            ].join(" ")}
          >
            {item.title}
          </div>
        ))}
        {items.length > 2 && (
          <div className="px-1 text-[9px] text-muted-foreground">
            +{items.length - 2}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface WorkspaceScheduleViewProps {
  workspaceId: string;
}

export function WorkspaceScheduleView({ workspaceId }: WorkspaceScheduleViewProps) {
  const t = useTranslation("zh-TW");
  const { items, loading } = useWorkItems(workspaceId);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  const today = formatDate(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  // Group items by dueDate
  const itemsByDate = useMemo(() => {
    const map: Record<string, WorkItemDTO[]> = {};
    for (const item of items) {
      if (!item.dueDate) continue;
      const dateStr = parseIsoDate(item.dueDate);
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(item);
    }
    return map;
  }, [items]);

  // Items with no due date — exclude all terminal statuses
  const unscheduled = useMemo(
    () => items.filter(
      (i) => !i.dueDate &&
        i.status !== "closed" &&
        i.status !== "completed" &&
        i.status !== "verified" &&
        i.status !== "accepted",
    ),
    [items],
  );

  // Calendar grid
  const totalDays = daysInMonth(year, month);
  const startDow = firstDayOfWeek(year, month);
  const weeks: Array<Array<number | null>> = [];
  let currentDay = 1;
  for (let week = 0; currentDay <= totalDays; week++) {
    const row: Array<number | null> = [];
    for (let dow = 0; dow < 7; dow++) {
      if (week === 0 && dow < startDow) {
        row.push(null);
      } else if (currentDay > totalDays) {
        row.push(null);
      } else {
        row.push(currentDay++);
      }
    }
    weeks.push(row);
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); };

  const monthLabel = new Date(year, month, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex h-full flex-col space-y-4 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">
            {t("workspace.schedule.title")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>
            {t("workspace.schedule.today")}
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={prevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[130px] text-center text-sm font-semibold">
            {monthLabel}
          </span>
          <Button variant="ghost" size="icon" className="size-8" onClick={nextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Calendar grid */}
          <div className="flex-1 overflow-auto">
            {/* Weekday headers */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {week.map((day, di) =>
                    day === null ? (
                      <div key={di} className="min-h-[72px]" />
                    ) : (
                      <DayCell
                        key={day}
                        year={year}
                        month={month}
                        day={day}
                        today={today}
                        items={itemsByDate[formatDate(year, month, day)] ?? []}
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Unscheduled tasks */}
          {unscheduled.length > 0 && (
            <section className="rounded-xl border border-dashed border-border/60 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("workspace.schedule.unscheduled")} ({unscheduled.length})
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {unscheduled.map((item) => (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className="max-w-[160px] truncate text-xs"
                    title={item.title}
                  >
                    {item.title}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {items.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
              <Calendar className="size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {t("workspace.schedule.empty")}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {t("workspace.schedule.emptyHint")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
