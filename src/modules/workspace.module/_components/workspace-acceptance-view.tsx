"use client";
/**
 * WorkspaceAcceptanceView — Acceptance gate for workspace tasks.
 * Wave 49: capability-gated (requires "acceptance" capability).
 *
 * Source: workspace.slice/@businesstab/acceptance/WorkspaceAcceptance
 *
 * Flow: WBS (closed) → QA (verified) → Acceptance (accepted)
 * This view shows tasks in "verified" state waiting for acceptance sign-off,
 * and allows promoting them to "accepted" status.
 */

import { useCallback } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Loader2,
  PartyPopper,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/design-system/primitives/ui/badge";
import { Button } from "@/design-system/primitives/ui/button";
import { useTranslation } from "@/shared/i18n";
import { useWorkItems } from "./use-work-items";
import { FirestoreWorkItemRepository } from "@/modules/work.module/infra.firestore/_repository";
import { updateWorkItem } from "@/modules/work.module";

let _repo: FirestoreWorkItemRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreWorkItemRepository();
  return _repo;
}

interface WorkspaceAcceptanceViewProps {
  workspaceId: string;
}

export function WorkspaceAcceptanceView({ workspaceId }: WorkspaceAcceptanceViewProps) {
  const t = useTranslation("zh-TW");
  const { items, loading, refresh } = useWorkItems(workspaceId);

  // Tasks that passed QA and are awaiting acceptance
  const pendingAcceptance = items.filter((i) => i.status === "verified");
  // Already accepted
  const accepted = items.filter((i) => i.status === "accepted");

  const handleAccept = useCallback(
    async (itemId: string) => {
      const result = await updateWorkItem(itemId, {
        status: "accepted",
      });
      if (result.ok) refresh();
    },
    [refresh],
  );

  return (
    <div className="flex h-full flex-col space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <BadgeCheck className="size-5 text-primary" />
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            {t("workspace.acceptance.title")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("workspace.acceptance.description")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Pending acceptance section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-blue-500" />
              <h2 className="text-sm font-semibold">
                {t("workspace.acceptance.pendingTitle")}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {pendingAcceptance.length}
              </Badge>
            </div>

            {pendingAcceptance.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 py-8 text-center">
                <ShieldCheck className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {t("workspace.acceptance.noPending")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {t("workspace.acceptance.noPendingHint")}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {pendingAcceptance.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <ShieldCheck className="size-4 shrink-0 text-blue-500" />
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
                      onClick={() => handleAccept(item.id)}
                    >
                      <CheckCircle2 className="size-3.5" />
                      {t("workspace.acceptance.accept")}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Already accepted section */}
          {accepted.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-emerald-500" />
                <h2 className="text-sm font-semibold">
                  {t("workspace.acceptance.acceptedTitle")}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {accepted.length}
                </Badge>
              </div>
              <ul className="space-y-2">
                {accepted.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3 opacity-75"
                  >
                    <BadgeCheck className="size-4 shrink-0 text-emerald-500" />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {item.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[10px] uppercase text-emerald-600"
                    >
                      {t("workspace.acceptance.acceptedBadge")}
                    </Badge>
                  </li>
                ))}
              </ul>

              {accepted.length >= 5 && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
                  <PartyPopper className="size-4 shrink-0 text-emerald-500" />
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {t("workspace.acceptance.milestone")}
                  </p>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
