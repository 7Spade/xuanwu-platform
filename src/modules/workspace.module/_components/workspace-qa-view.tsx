"use client";
/**
 * WorkspaceQaView — Quality Assurance gate for workspace tasks.
 * Wave 48: capability-gated (requires "quality-assurance" capability).
 *
 * Source: workspace.slice/@businesstab/quality-assurance/WorkspaceQualityAssurance
 *
 * Flow: WBS (closed) → QA (verified) → Acceptance (accepted)
 * This view shows tasks in "closed" or "completed" state that need QA sign-off,
 * and allows promoting them to "verified" status.
 */

import { useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/design-system/primitives/ui/badge";
import { Button } from "@/design-system/primitives/ui/button";
import { useTranslation } from "@/shared/i18n";
import { useWorkItems } from "./use-work-items";
import { FirestoreWorkItemRepository } from "@/modules/work.module/infra.firestore/_repository";
import { updateWorkItem } from "@/modules/work.module/core/_use-cases";

let _repo: FirestoreWorkItemRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreWorkItemRepository();
  return _repo;
}

interface WorkspaceQaViewProps {
  workspaceId: string;
}

export function WorkspaceQaView({ workspaceId }: WorkspaceQaViewProps) {
  const t = useTranslation("zh-TW");
  const { items, loading, refresh } = useWorkItems(workspaceId);

  // Tasks ready for QA: "closed" (done in WBS) or "completed"
  const pendingQa = items.filter(
    (i) => i.status === "closed" || i.status === "completed",
  );
  // Already QA-verified
  const verified = items.filter((i) => i.status === "verified");

  const handleVerify = useCallback(
    async (itemId: string) => {
      const result = await updateWorkItem(getRepo(), itemId, {
        status: "verified",
      });
      if (result.ok) refresh();
    },
    [refresh],
  );

  return (
    <div className="flex h-full flex-col space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <ShieldCheck className="size-5 text-primary" />
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            {t("workspace.qa.title")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("workspace.qa.description")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Pending QA section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Circle className="size-4 text-orange-400" />
              <h2 className="text-sm font-semibold">
                {t("workspace.qa.pendingTitle")}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {pendingQa.length}
              </Badge>
            </div>

            {pendingQa.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 py-8 text-center">
                <ClipboardCheck className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {t("workspace.qa.noPending")}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {pendingQa.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <Circle className="size-4 shrink-0 text-orange-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] uppercase"
                    >
                      {item.priority}
                    </Badge>
                    <Button
                      size="sm"
                      variant="default"
                      className="shrink-0 gap-1.5 text-xs font-semibold"
                      onClick={() => handleVerify(item.id)}
                    >
                      <CheckCircle2 className="size-3.5" />
                      {t("workspace.qa.verify")}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Already verified section */}
          {verified.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                <h2 className="text-sm font-semibold">
                  {t("workspace.qa.verifiedTitle")}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {verified.length}
                </Badge>
              </div>
              <ul className="space-y-2">
                {verified.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3 opacity-75"
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {item.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[10px] uppercase text-green-600"
                    >
                      {t("workspace.qa.verifiedBadge")}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
