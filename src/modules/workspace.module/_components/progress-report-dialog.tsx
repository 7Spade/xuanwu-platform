"use client";
/**
 * ProgressReportDialog — report completedQuantity for a WBS task.
 * Wave 43: WBS Tree Engine progress reporting.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/design-system/primitives/ui/dialog";
import { Button } from "@/design-system/primitives/ui/button";
import { Input } from "@/design-system/primitives/ui/input";
import { Label } from "@/design-system/primitives/ui/label";
import { useTranslation } from "@/shared/i18n";
import { reportProgress } from "@/modules/work.module/core/_use-cases";
import { FirestoreWorkItemRepository } from "@/modules/work.module/infra.firestore/_repository";
import type { WorkItemDTO } from "@/modules/work.module/core/_use-cases";

let _repo: FirestoreWorkItemRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreWorkItemRepository();
  return _repo;
}

interface ProgressReportDialogProps {
  item: WorkItemDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function ProgressReportDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
}: ProgressReportDialogProps) {
  const t = useTranslation("zh-TW");
  const [value, setValue] = useState(String(item.completedQuantity ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setValue(String(item.completedQuantity ?? 0));
      setError(null);
    }
    onOpenChange(o);
  };

  const handleSave = async () => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      setError(t("tasks.progressInvalid"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await reportProgress(getRepo(), item.id, num);
      if (!result.ok) throw result.error;
      onUpdated();
      onOpenChange(false);
    } catch {
      setError(t("tasks.failedToSaveTask"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("tasks.progressReport")}</DialogTitle>
          <DialogDescription className="text-xs">
            {item.quantity !== undefined
              ? `${t("tasks.budget")}: ${item.quantity}`
              : t("tasks.progressReport")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="progress-qty">{t("tasks.completedQuantity")}</Label>
            <Input
              id="progress-qty"
              type="number"
              min={0}
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="rounded-xl"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
