"use client";
/**
 * ForksView — workspace forks capability tab.
 *
 * Wave 58: fork.module presentation component.
 * Shows all forks of the current workspace with status badge, baseline version,
 * creation date, and an Abandon action for active forks.
 */

import { useState } from "react";
import { GitBranch, AlertTriangle } from "lucide-react";

import { Button } from "@/design-system/primitives/ui/button";
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
import { useForks } from "./use-forks";
import { abandonFork } from "@/modules/fork.module/core/_use-cases";
import { FirestoreForkRepository } from "@/modules/fork.module/infra.firestore/_repository";
import type { ForkDTO } from "@/modules/fork.module/core/_use-cases";

// ---------------------------------------------------------------------------
// Singleton repo
// ---------------------------------------------------------------------------

let _repo: FirestoreForkRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreForkRepository();
  return _repo;
}

// ---------------------------------------------------------------------------
// Status badge colours
// ---------------------------------------------------------------------------

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active:    "default",
  abandoned: "secondary",
  merged:    "outline",
};

const STATUS_LABEL: Record<string, string> = {
  active:    "fork.status.active",
  abandoned: "fork.status.abandoned",
  merged:    "fork.status.merged",
};

// ---------------------------------------------------------------------------
// Fork row
// ---------------------------------------------------------------------------

function ForkRow({ fork, onAbandoned }: { fork: ForkDTO; onAbandoned: () => void }) {
  const t = useTranslation("zh-TW");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [abandoning, setAbandoning] = useState(false);

  const handleAbandon = async () => {
    setAbandoning(true);
    try {
      await abandonFork(getRepo(), fork.id);
      setConfirmOpen(false);
      onAbandoned();
    } finally {
      setAbandoning(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3">
        <GitBranch className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-medium">{fork.id}</p>
          <p className="text-xs text-muted-foreground">
            {t("fork.baseline")} {fork.baselineVersion} · {new Date(fork.createdAt).toLocaleDateString("zh-TW")}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[fork.status] ?? "secondary"}>
          {t(STATUS_LABEL[fork.status] ?? fork.status)}
        </Badge>
        {fork.status === "active" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            {t("fork.abandon")}
          </Button>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              {t("fork.abandonTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>{t("fork.abandonDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={abandoning}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAbandon}
              disabled={abandoning}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("fork.abandon")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// ForksView
// ---------------------------------------------------------------------------

interface ForksViewProps {
  workspaceId: string;
}

export function ForksView({ workspaceId }: ForksViewProps) {
  const t = useTranslation("zh-TW");
  const { forks, loading, error, refresh } = useForks(workspaceId);

  const active = forks.filter((f) => f.status === "active");
  const inactive = forks.filter((f) => f.status !== "active");

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <GitBranch className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">{t("workspace.forks.title")}</h2>
        {!loading && (
          <Badge variant="secondary" className="ml-auto h-5 px-2 text-[10px]">
            {forks.length}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{t("workspace.forks.description")}</p>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}

      {!loading && forks.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
          <GitBranch className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">{t("workspace.forks.empty")}</p>
          <p className="text-xs text-muted-foreground/70">{t("workspace.forks.emptyHint")}</p>
        </div>
      )}

      {!loading && active.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("fork.status.active")}</p>
          {active.map((f) => <ForkRow key={f.id} fork={f} onAbandoned={refresh} />)}
        </div>
      )}

      {!loading && inactive.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("workspace.forks.historyTitle")}</p>
          {inactive.map((f) => <ForkRow key={f.id} fork={f} onAbandoned={refresh} />)}
        </div>
      )}
    </div>
  );
}
