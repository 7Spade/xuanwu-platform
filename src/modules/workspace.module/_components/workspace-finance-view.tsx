"use client";
/**
 * WorkspaceFinanceView — Financial lifecycle tracking for workspace tasks.
 * Wave 50: capability-gated (requires "finance" capability).
 *
 * Source: finance.slice/core/_components/FinanceView + FinanceLifecycleTracker
 *
 * Lifecycle stages: claim-preparation → claim-submitted → claim-approved →
 *   invoice-requested → payment-term → payment-received → completed
 *
 * Architecture:
 *  - Uses work items with subtotal/unitPrice/quantity as financial items.
 *  - Lifecycle stage is tracked via a separate field on each item's type prefix.
 *  - A 7-stage lifecycle progress bar is shown per item.
 */

import { useCallback, useState } from "react";
import {
  BadgeDollarSign,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/primitives/ui/select";
import { useTranslation } from "@/shared/i18n";
import { updateWorkItem, type WorkItemDTO } from "@/modules/work.module";
import { useWorkItems } from "./use-work-items";

// ---------------------------------------------------------------------------
// Finance lifecycle constants
// ---------------------------------------------------------------------------

const LIFECYCLE_STAGES = [
  "claim-preparation",
  "claim-submitted",
  "claim-approved",
  "invoice-requested",
  "payment-term",
  "payment-received",
  "completed",
] as const;

type FinanceStage = (typeof LIFECYCLE_STAGES)[number];

function stageIndex(stage: FinanceStage | undefined): number {
  if (!stage) return 0;
  const idx = LIFECYCLE_STAGES.indexOf(stage);
  return idx >= 0 ? idx : 0;
}

function StageIcon({ stage }: { stage: FinanceStage }) {
  switch (stage) {
    case "claim-preparation": return <FileText className="size-3.5" />;
    case "claim-submitted": return <Receipt className="size-3.5" />;
    case "claim-approved": return <CheckCircle2 className="size-3.5" />;
    case "invoice-requested": return <FileText className="size-3.5" />;
    case "payment-term": return <Clock className="size-3.5" />;
    case "payment-received": return <DollarSign className="size-3.5" />;
    case "completed": return <CheckCircle2 className="size-3.5" />;
    default: return <Circle className="size-3.5" />;
  }
}

// Store finance stage in the work item `type` field with prefix "finance:"
function getFinanceStage(item: WorkItemDTO): FinanceStage | undefined {
  if (!item.type?.startsWith("finance:")) return undefined;
  const extracted = item.type.slice("finance:".length);
  // Validate the extracted stage against the known set
  const stage = LIFECYCLE_STAGES.find((s) => s === extracted);
  return stage;
}

// ---------------------------------------------------------------------------
// Lifecycle bar
// ---------------------------------------------------------------------------

interface LifecycleBarProps {
  stage: FinanceStage | undefined;
}

function LifecycleBar({ stage }: LifecycleBarProps) {
  const t = useTranslation("zh-TW");
  const idx = stageIndex(stage);

  return (
    <div className="flex items-center gap-0.5">
      {LIFECYCLE_STAGES.map((s, i) => (
        <div key={s} className="flex items-center">
          <div
            title={t(`workspace.finance.stage.${s}`) || s}
            className={[
              "flex size-5 items-center justify-center rounded-full text-[9px] transition-colors",
              i <= idx
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            <StageIcon stage={s} />
          </div>
          {i < LIFECYCLE_STAGES.length - 1 && (
            <div
              className={[
                "h-0.5 w-3",
                i < idx ? "bg-primary" : "bg-muted",
              ].join(" ")}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Finance item row
// ---------------------------------------------------------------------------

interface FinanceItemRowProps {
  item: WorkItemDTO;
  workspaceId: string;
  onUpdated: () => void;
}

function FinanceItemRow({ item, workspaceId: _workspaceId, onUpdated }: FinanceItemRowProps) {
  const t = useTranslation("zh-TW");
  const stage = getFinanceStage(item);
  const [updating, setUpdating] = useState(false);

  const handleStageChange = useCallback(
    async (newStage: string) => {
      setUpdating(true);
      const result = await updateWorkItem(item.id, {
        type: `finance:${newStage}`,
      });
      if (result.ok) onUpdated();
      setUpdating(false);
    },
    [item.id, onUpdated],
  );

  const advanceStage = useCallback(async () => {
    const idx = stageIndex(stage);
    if (idx < LIFECYCLE_STAGES.length - 1) {
      await handleStageChange(LIFECYCLE_STAGES[idx + 1]);
    }
  }, [stage, handleStageChange]);

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <BadgeDollarSign className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{item.title}</p>
          {item.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>
        {typeof item.subtotal === "number" && item.subtotal > 0 && (
          <span className="shrink-0 text-sm font-bold text-primary">
            {item.subtotal.toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <LifecycleBar stage={stage} />

        <div className="ml-auto flex items-center gap-2">
          <Select
            value={stage ?? "claim-preparation"}
            onValueChange={handleStageChange}
            disabled={updating}
          >
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIFECYCLE_STAGES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {t(`workspace.finance.stage.${s}`) || s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {stage !== "completed" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs"
              onClick={advanceStage}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <ChevronRight className="size-3" />
              )}
              {t("workspace.finance.advance")}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

interface WorkspaceFinanceViewProps {
  workspaceId: string;
}

export function WorkspaceFinanceView({ workspaceId }: WorkspaceFinanceViewProps) {
  const t = useTranslation("zh-TW");
  const { items, loading, refresh } = useWorkItems(workspaceId);

  // Finance items: any task with a subtotal, or tagged with "finance:" prefix
  const financeItems = items.filter(
    (i) =>
      (typeof i.subtotal === "number" && i.subtotal > 0) ||
      i.type?.startsWith("finance:"),
  );

  const totalBudget = financeItems.reduce(
    (sum, i) => sum + (i.subtotal ?? 0),
    0,
  );

  const completedItems = financeItems.filter(
    (i) => getFinanceStage(i) === "completed",
  );

  return (
    <div className="flex h-full flex-col space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="size-5 text-primary" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              {t("workspace.finance.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("workspace.finance.description")}
            </p>
          </div>
        </div>
        {totalBudget > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {t("workspace.finance.totalBudget")}
            </p>
            <p className="text-lg font-bold text-primary">
              {totalBudget.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {financeItems.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {t("workspace.finance.total")}
            </p>
            <p className="text-xl font-bold">{financeItems.length}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {t("workspace.finance.inProgress")}
            </p>
            <p className="text-xl font-bold text-orange-500">
              {financeItems.length - completedItems.length}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {t("workspace.finance.completed")}
            </p>
            <p className="text-xl font-bold text-green-500">
              {completedItems.length}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : financeItems.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
          <BadgeDollarSign className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {t("workspace.finance.empty")}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t("workspace.finance.emptyHint")}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {financeItems.map((item) => (
            <FinanceItemRow
              key={item.id}
              item={item}
              workspaceId={workspaceId}
              onUpdated={refresh}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
