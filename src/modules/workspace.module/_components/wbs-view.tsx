"use client";
/**
 * WbsView — Work Breakdown Structure task tree with real data.
 *
 * Source: workspace.slice/domain.tasks/_components/
 * Wave 25: wired to Firestore via useWorkItems(workspaceId).
 * Wave 38: "+ Add Task" button opens CreateWorkItemDialog.
 * Wave 43: flat list replaced with tree engine (buildTaskTree + TaskTreeNode).
 */

import { useMemo, useState } from "react";
import { GitBranch, Loader2, Plus } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import { useTranslation } from "@/shared/i18n";
import { buildTaskTree } from "@/modules/work.module/domain.work/_task-tree";
import { useWorkItems } from "./use-work-items";
import { TaskTreeNode } from "./task-tree-node";
import { CreateWorkItemDialog } from "./create-work-item-dialog";

interface WbsViewProps {
  slug: string;
  workspaceId: string;
}

export function WbsView({ slug: _slug, workspaceId }: WbsViewProps) {
  const t = useTranslation("zh-TW");
  const { items, loading, refresh } = useWorkItems(workspaceId);
  const [createOpen, setCreateOpen] = useState(false);

  const tree = useMemo(() => buildTaskTree(items), [items]);

  return (
    <div className="flex h-full flex-col space-y-4 duration-500 animate-in fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <GitBranch className="size-5 text-primary" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">{t("tasks.wbsTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("tasks.wbsDescription")}</p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs font-bold uppercase tracking-widest"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          {t("tasks.createRootNode")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : tree.length > 0 ? (
        <div className="space-y-1">
          {tree.map((node) => (
            <TaskTreeNode key={node.id} node={node} onChanged={refresh} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-16 text-center">
          <GitBranch className="mb-4 size-12 text-muted-foreground opacity-10" />
          <h3 className="text-lg font-bold">{t("tasks.awaitingDefinition")}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t("tasks.createFirstTask")}
          </p>
          <Button
            size="lg"
            className="mt-8 rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-lg"
            onClick={() => setCreateOpen(true)}
          >
            {t("tasks.createRootNode")}
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
