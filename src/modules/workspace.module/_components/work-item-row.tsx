"use client";
/**
 * WorkItemRow — displays a single work item in the WBS task list.
 *
 * Source equivalent: workspace.slice/domain.tasks/_components/task-row.tsx
 * Adapted: uses platform design-system badges + i18n.
 *
 * Shows status badge, priority indicator, title, and optional due date.
 * Wave 39: edit button (pencil) opens WorkItemEditDialog on hover.
 */

import { useState } from "react";
import { Calendar, Circle, Pencil } from "lucide-react";
import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import type { WorkItemDTO } from "@/modules/work.module/core/_use-cases";
import { WorkItemEditDialog } from "./work-item-edit-dialog";

interface WorkItemRowProps {
  item: WorkItemDTO;
  onUpdated?: () => void;
}

function statusVariant(
  status: WorkItemDTO["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "closed":
      return "secondary";
    case "in-progress":
      return "default";
    case "blocked":
      return "destructive";
    default:
      return "outline";
  }
}

function priorityColor(priority: WorkItemDTO["priority"]): string {
  switch (priority) {
    case "critical":
      return "text-destructive";
    case "high":
      return "text-orange-500";
    case "medium":
      return "text-yellow-500";
    default:
      return "text-muted-foreground";
  }
}

export function WorkItemRow({ item, onUpdated }: WorkItemRowProps) {
  const t = useTranslation("zh-TW");
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-sm transition-colors hover:bg-card/80">
        <Circle
          className={`mt-0.5 size-3 shrink-0 fill-current ${priorityColor(item.priority)}`}
        />

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold leading-tight ${
              item.status === "closed" ? "line-through text-muted-foreground" : ""
            }`}
          >
            {item.title}
          </p>
          {item.dueDate && (
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="size-3" />
              <span>{new Date(item.dueDate).toLocaleDateString("zh-TW")}</span>
            </div>
          )}
        </div>

        <Badge
          variant={statusVariant(item.status)}
          className="h-5 shrink-0 px-2 text-[10px] font-bold uppercase tracking-wider"
        >
          {t(`wbs.status.${item.status}`)}
        </Badge>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="ml-1 shrink-0 rounded-md p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          aria-label="Edit"
        >
          <Pencil className="size-4 text-muted-foreground" />
        </button>
      </div>

      <WorkItemEditDialog
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={onUpdated ?? (() => {})}
      />
    </>
  );
}
