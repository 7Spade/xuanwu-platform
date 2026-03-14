"use client";
import { useState } from "react";
import { Calendar, Circle, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/design-system/primitives/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/design-system/primitives/ui/alert-dialog";
import { useTranslation } from "@/shared/i18n";
import type { WorkItemDTO } from "@/modules/work.module/core/_use-cases";
import { deleteWorkItem } from "@/modules/work.module/core/_use-cases";
import { FirestoreWorkItemRepository } from "@/modules/work.module/infra.firestore/_repository";
import { WorkItemEditDialog } from "./work-item-edit-dialog";

interface WorkItemRowProps {
  item: WorkItemDTO;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

function statusVariant(status: WorkItemDTO["status"]): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "closed": return "secondary";
    case "in-progress": return "default";
    case "blocked": return "destructive";
    default: return "outline";
  }
}

function priorityColor(priority: WorkItemDTO["priority"]): string {
  switch (priority) {
    case "critical": return "text-destructive";
    case "high": return "text-orange-500";
    case "medium": return "text-yellow-500";
    default: return "text-muted-foreground";
  }
}

// Module-level singleton — same pattern as work-item-edit-dialog.tsx
let _repo: FirestoreWorkItemRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreWorkItemRepository();
  return _repo;
}

export function WorkItemRow({ item, onUpdated, onDeleted }: WorkItemRowProps) {
  const t = useTranslation("zh-TW");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteWorkItem(getRepo(), item.workspaceId, item.id);
      setDeleteOpen(false);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-sm transition-colors hover:bg-card/80">
        <Circle className={`mt-0.5 size-3 shrink-0 fill-current ${priorityColor(item.priority)}`} />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold leading-tight ${item.status === "closed" ? "line-through text-muted-foreground" : ""}`}>
            {item.title}
          </p>
          {item.description && (
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {item.description}
            </p>
          )}
          {item.dueDate && (
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="size-3" />
              <span>{new Date(item.dueDate).toLocaleDateString("zh-TW")}</span>
            </div>
          )}
        </div>
        <Badge variant={statusVariant(item.status)} className="h-5 shrink-0 px-2 text-[10px] font-bold uppercase tracking-wider">
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
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="shrink-0 rounded-md p-1 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
          aria-label="Delete"
        >
          <Trash2 className="size-4 text-destructive/70" />
        </button>
      </div>

      <WorkItemEditDialog
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={onUpdated ?? (() => {})}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("wbs.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("wbs.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("wbs.deleteDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("wbs.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
