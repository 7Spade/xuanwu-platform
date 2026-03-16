"use client";
/**
 * WorkItemEditDialog — dialog for editing an existing work item.
 *
 * Wave 39: Allows inline editing of title, description, status, priority,
 * assignee, and due date from the WBS task list.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/design-system/primitives/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/primitives/ui/dialog";
import { Input } from "@/design-system/primitives/ui/input";
import { Label } from "@/design-system/primitives/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/primitives/ui/select";
import { Textarea } from "@/design-system/primitives/ui/textarea";
import { useTranslation } from "@/shared/i18n";
import { FirestoreWorkItemRepository } from "@/modules/work.module/infra.firestore/_repository";
import { updateWorkItem } from "@/modules/work.module";
import type { WorkItemDTO, WorkItemStatus, WorkItemPriority } from "@/modules/work.module";

export interface WorkItemEditDialogProps {
  item: WorkItemDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

// Module-level singleton.
let _repo: FirestoreWorkItemRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreWorkItemRepository();
  return _repo;
}

const STATUSES: WorkItemStatus[] = ["open", "in-progress", "blocked", "closed", "completed"];
const PRIORITIES: WorkItemPriority[] = ["critical", "high", "medium", "low"];

export function WorkItemEditDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
}: WorkItemEditDialogProps) {
  const t = useTranslation("zh-TW");

  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [status, setStatus] = useState<WorkItemStatus>(item.status);
  const [priority, setPriority] = useState<WorkItemPriority>(item.priority);
  const [assigneeId, setAssigneeId] = useState(item.assigneeId ?? "");
  const [dueDate, setDueDate] = useState(item.dueDate ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep local state in sync when item prop changes (dialog re-opens for a different item).
  const syncToItem = () => {
    setTitle(item.title);
    setDescription(item.description ?? "");
    setStatus(item.status);
    setPriority(item.priority);
    setAssigneeId(item.assigneeId ?? "");
    setDueDate(item.dueDate ?? "");
    setError(null);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await updateWorkItem(item.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigneeId: assigneeId.trim() || null,
        dueDate: dueDate || null,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onOpenChange(false);
      onUpdated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) syncToItem();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t("wbs.editDialog.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("wbs.createDialog.titleLabel")}
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("wbs.createDialog.titleLabel")}
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("wbs.editDialog.descriptionLabel")}
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("wbs.editDialog.descriptionPlaceholder")}
              className="min-h-[72px] resize-none text-sm"
              disabled={loading}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("wbs.editDialog.statusLabel")}
            </Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as WorkItemStatus)}
              disabled={loading}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-sm">
                    {t(`wbs.status.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("wbs.editDialog.priorityLabel")}
            </Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as WorkItemPriority)}
              disabled={loading}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p} className="text-sm">
                    {t(`wbs.priority.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee ID */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("wbs.editDialog.assigneeLabel")}
            </Label>
            <Input
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              placeholder="User ID"
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("wbs.editDialog.dueDateLabel")}
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              syncToItem();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={loading || !title.trim()}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("wbs.editDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
