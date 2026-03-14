"use client";
/**
 * WbsView — Work Breakdown Structure task list with real data.
 *
 * Source: workspace.slice/domain.tasks/_components/
 * Wave 25: wired to Firestore via useWorkItems(workspaceId).
 * Wave 38: "+ Add Task" button opens CreateWorkItemDialog.
 * Shows loading spinner → task list → empty state.
 */

import { useState } from "react";
import { GitBranch, Loader2, Plus } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import { useTranslation } from "@/shared/i18n";
import { useWorkItems } from "./use-work-items";
import { WorkItemRow } from "./work-item-row";
import { CreateWorkItemDialog } from "./create-work-item-dialog";

interface WbsViewProps {
  slug: string;
  workspaceId: string;
}

export function WbsView({ slug: _slug, workspaceId }: WbsViewProps) {
  const t = useTranslation("zh-TW");
  const { items, loading, refresh } = useWorkItems(workspaceId);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex h-full flex-col space-y-4 duration-500 animate-in fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <GitBranch className="size-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">{t("wbs.title")}</h1>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs font-bold uppercase tracking-widest"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          {t("wbs.addTask")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <WorkItemRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-16 text-center">
          <GitBranch className="mb-4 size-12 text-muted-foreground opacity-10" />
          <h3 className="text-lg font-bold">{t("wbs.empty")}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t("wbs.emptyHint")}
          </p>
          <Button
            size="lg"
            className="mt-8 rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-lg"
            onClick={() => setCreateOpen(true)}
          >
            {t("wbs.addTask")}
          </Button>
        </div>
      )}

      <CreateWorkItemDialog
        workspaceId={workspaceId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refresh}
      />
    </div>
  );
}
