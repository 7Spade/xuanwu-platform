"use client";
/**
 * CreateWorkspaceDialog — dialog for creating a new workspace.
 * Wave 44: wires existing createWorkspace use case to the WorkspacesView "+ Create" button.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import { createWorkspace } from "@/modules/workspace.module";

interface CreateWorkspaceDialogProps {
  dimensionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateWorkspaceDialog({
  dimensionId,
  open,
  onOpenChange,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const t = useTranslation("zh-TW");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setError(null);
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const id = crypto.randomUUID();
      const result = await createWorkspace(id, dimensionId, trimmed);
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
          <DialogTitle>{t("workspaces.createLogicalSpace")}</DialogTitle>
          <DialogDescription className="text-xs">
            {t("workspaces.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="ws-name">{t("workspaces.spaceName")}</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); }}
              placeholder={t("workspaces.spaceNamePlaceholder")}
              disabled={loading}
              className="rounded-xl"
            />
          </div>
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { reset(); onOpenChange(false); }}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loading ? t("common.creating") : t("common.confirmCreation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
