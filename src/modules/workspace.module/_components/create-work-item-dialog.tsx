"use client";
/**
 * CreateWorkItemDialog — dialog for creating a new work item.
 *
 * Wave 38: Wires createWorkItem use-case to the WbsView "+ Add Task" button.
 * Source equivalent: workspace.slice/domain.tasks/_components/create-task-dialog.tsx
 */

import { useMemo, useState } from "react";
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
import { useTranslation } from "@/shared/i18n";
import { FirestoreWorkItemRepository } from "@/modules/work.module/infra.firestore/_repository";
import { createWorkItem } from "@/modules/work.module/core/_use-cases";
import type { WorkItemPriority } from "@/modules/work.module/domain.work/_value-objects";

interface CreateWorkItemDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

// Module-level singleton.
let _repo: FirestoreWorkItemRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreWorkItemRepository();
  return _repo;
}

const PRIORITIES: WorkItemPriority[] = ["high", "medium", "low"];

export function CreateWorkItemDialog({
  workspaceId,
  open,
  onOpenChange,
  onCreated,
}: CreateWorkItemDialogProps) {
  const t = useTranslation("zh-TW");

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<WorkItemPriority>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priorityLabel = useMemo(
    () =>
      ({
        high: t("wbs.createDialog.priority.high"),
        medium: t("wbs.createDialog.priority.medium"),
        low: t("wbs.createDialog.priority.low"),
        critical: t("wbs.createDialog.priority.high"),
      }) as Record<WorkItemPriority, string>,
    [t],
  );

  const reset = () => {
    setTitle("");
    setPriority("medium");
    setError(null);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const id = crypto.randomUUID();
      const result = await createWorkItem(getRepo(), id, workspaceId, title.trim(), priority);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      reset();
      onOpenChange(false);
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t("wbs.createDialog.title")}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate();
              }}
              placeholder={t("wbs.createDialog.titleLabel")}
              className="text-sm"
              disabled={loading}
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("wbs.createDialog.priorityLabel")}
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
                    {priorityLabel[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              reset();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={loading || !title.trim()}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("wbs.createDialog.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
