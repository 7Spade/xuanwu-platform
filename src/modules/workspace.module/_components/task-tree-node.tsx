"use client";
/**
 * TaskTreeNode — recursive tree row for WBS view.
 * Wave 43: expand/collapse, 8 configurable columns, per-node actions.
 *
 * Actions: add-child, edit, delete, report-progress, mark-blocked
 */

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  BarChart2,
  MapPin,
  Paperclip,
  AlertCircle,
  X,
} from "lucide-react";
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
import type { TaskWithChildren } from "@/modules/work.module/domain.work/_task-tree";
import {
  deleteWorkItem,
  updateWorkItem,
  createChildWorkItem,
} from "@/modules/work.module/core/_use-cases";
import { FirestoreWorkItemRepository } from "@/modules/work.module/infra.firestore/_repository";
import { TaskEditorDialog } from "./task-editor-dialog";
import { ProgressReportDialog } from "./progress-report-dialog";
import { AttachmentsDialog } from "./attachments-dialog";
import { CreateWorkItemDialog } from "./create-work-item-dialog";

let _repo: FirestoreWorkItemRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreWorkItemRepository();
  return _repo;
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "closed": return "secondary";
    case "in-progress": return "default";
    case "blocked": return "destructive";
    default: return "outline";
  }
}

function priorityColor(priority: string): string {
  switch (priority) {
    case "critical": return "text-destructive";
    case "high": return "text-orange-500";
    case "medium": return "text-yellow-500";
    default: return "text-muted-foreground";
  }
}

interface TaskTreeNodeProps {
  node: TaskWithChildren;
  depth?: number;
  onChanged: () => void;
}

export function TaskTreeNode({ node, depth = 0, onChanged }: TaskTreeNodeProps) {
  const t = useTranslation("zh-TW");
  const [expanded, setExpanded] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasChildren = node.children.length > 0;
  const indent = depth * 20;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteWorkItem(getRepo(), node.workspaceId, node.id);
      setDeleteOpen(false);
      onChanged();
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkBlocked = async () => {
    await updateWorkItem(getRepo(), node.id, { status: "blocked" });
    onChanged();
  };

  const handleSaveAttachments = async (photoURLs: string[]) => {
    await updateWorkItem(getRepo(), node.id, { photoURLs: photoURLs.length ? photoURLs : null });
    onChanged();
  };

  const progressPct =
    node.quantity !== undefined && node.quantity > 0 && node.completedQuantity !== undefined
      ? Math.min(100, Math.round((node.completedQuantity / node.quantity) * 100))
      : undefined;

  return (
    <>
      <div
        className="group flex items-center gap-2 rounded-xl border border-border/40 bg-card px-3 py-2 text-sm shadow-sm transition-colors hover:bg-card/80"
        style={{ marginLeft: indent }}
      >
        {/* Expand/collapse toggle */}
        <button
          type="button"
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {hasChildren
            ? (expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />)
            : <span className="inline-block size-4" />}
        </button>

        {/* WBS number */}
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground w-10">
          {node.wbsNo}
        </span>

        {/* Title + type */}
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${node.status === "closed" ? "line-through text-muted-foreground" : ""}`}>
            {node.title}
          </p>
          {node.type && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{t(`tasks.type.${node.type}`)}</span>
          )}
        </div>

        {/* Budget: subtotal */}
        {node.subtotal !== undefined && (
          <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
            {node.subtotal.toFixed(2)}
          </span>
        )}

        {/* Progress */}
        {progressPct !== undefined && (
          <div className="flex shrink-0 items-center gap-1">
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-border/50">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground">{progressPct}%</span>
          </div>
        )}

        {/* Indicators */}
        <div className="flex shrink-0 items-center gap-1">
          {node.location && (
            Object.values(node.location).some((v): v is string => typeof v === "string" && v.length > 0)
          ) && (
            <MapPin className="size-3.5 text-muted-foreground/60" />
          )}
          {node.photoURLs && node.photoURLs.length > 0 && (
            <Paperclip className="size-3.5 text-muted-foreground/60" />
          )}
        </div>

        {/* Priority dot */}
        <div className={`shrink-0 size-2 rounded-full ${
          node.priority === "critical" ? "bg-destructive" :
          node.priority === "high" ? "bg-orange-500" :
          node.priority === "medium" ? "bg-yellow-500" :
          "bg-muted-foreground/30"
        }`} />

        {/* Status badge */}
        <Badge
          variant={statusVariant(node.status)}
          className="shrink-0 h-5 px-2 text-[10px] font-bold uppercase tracking-wider"
        >
          {t(`wbs.status.${node.status}`)}
        </Badge>

        {/* Action buttons (group-hover) */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setAddChildOpen(true)}
            className="rounded-md p-1 hover:bg-muted"
            aria-label={t("tasks.splitIntoSubtasks")}
            title={t("tasks.splitIntoSubtasks")}
          >
            <Plus className="size-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-md p-1 hover:bg-muted"
            aria-label="Edit"
          >
            <Pencil className="size-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => setProgressOpen(true)}
            className="rounded-md p-1 hover:bg-muted"
            aria-label={t("tasks.progressReport")}
            title={t("tasks.progressReport")}
          >
            <BarChart2 className="size-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => setAttachOpen(true)}
            className="rounded-md p-1 hover:bg-muted"
            aria-label={t("tasks.attachments.title")}
            title={t("tasks.attachments.title")}
          >
            <Paperclip className="size-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={handleMarkBlocked}
            className="rounded-md p-1 hover:bg-amber-50"
            aria-label={t("tasks.markAsBlocked")}
            title={t("tasks.markAsBlocked")}
          >
            <AlertCircle className="size-3.5 text-amber-500/70" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-md p-1 hover:bg-destructive/10"
            aria-label="Delete"
          >
            <Trash2 className="size-3.5 text-destructive/70" />
          </button>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="space-y-1 mt-1">
          {node.children.map((child) => (
            <TaskTreeNode key={child.id} node={child} depth={depth + 1} onChanged={onChanged} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <TaskEditorDialog
        item={node}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={() => { onChanged(); }}
      />

      <ProgressReportDialog
        item={node}
        open={progressOpen}
        onOpenChange={setProgressOpen}
        onUpdated={() => { onChanged(); }}
      />

      <AttachmentsDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        photoURLs={node.photoURLs}
        onSave={handleSaveAttachments}
      />

      <CreateWorkItemDialog
        workspaceId={node.workspaceId}
        parentId={node.id}
        open={addChildOpen}
        onOpenChange={setAddChildOpen}
        onCreated={onChanged}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("wbs.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("tasks.confirmDestroyNode")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("wbs.deleteDialog.cancel")}</AlertDialogCancel>
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
