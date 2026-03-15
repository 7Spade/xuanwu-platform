"use client";
/**
 * DailyWorkspaceView — workspace daily log feed.
 * Wave 45: capability-gated daily log view (requires "daily" capability).
 *
 * Source: workspace.slice/domain.daily/_components/
 */

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Loader2, Plus } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import { useTranslation } from "@/shared/i18n";
import { useCurrentAccount } from "@/modules/account.module/_components/account-provider";
import { FirestoreDailyLogRepository } from "@/modules/workspace.module/infra.firestore/_daily-log-repository";
import { getDailyLogs } from "@/modules/workspace.module/core/_daily-log-use-cases";
import type { DailyLogDTO } from "@/modules/workspace.module/core/_daily-log-use-cases";
import { DailyLogCard } from "./daily-log-card";
import { DailyLogDialog } from "./daily-log-dialog";

let _repo: FirestoreDailyLogRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreDailyLogRepository();
  return _repo;
}

interface DailyWorkspaceViewProps {
  workspaceId: string;
}

export function DailyWorkspaceView({ workspaceId }: DailyWorkspaceViewProps) {
  const t = useTranslation("zh-TW");
  const { account } = useCurrentAccount();
  const [logs, setLogs] = useState<DailyLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editLog, setEditLog] = useState<DailyLogDTO | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDailyLogs(getRepo(), workspaceId);
      if (result.ok) setLogs(result.value);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { void fetchLogs(); }, [fetchLogs]);

  return (
    <div className="flex h-full flex-col space-y-4 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">{t("workspace.daily.title")}</h1>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs font-bold uppercase tracking-widest"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          {t("workspace.daily.addEntry")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length > 0 ? (
        <div className="space-y-3">
          {logs.map((log) => (
            <DailyLogCard
              key={log.id}
              log={log}
              onEdit={() => setEditLog(log)}
              onDeleted={fetchLogs}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-16 text-center">
          <BookOpen className="mb-4 size-12 text-muted-foreground opacity-10" />
          <h3 className="text-lg font-bold">{t("workspace.daily.empty")}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t("workspace.daily.emptyHint")}
          </p>
          <Button
            size="lg"
            className="mt-8 rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-lg"
            onClick={() => setCreateOpen(true)}
          >
            {t("workspace.daily.addEntry")}
          </Button>
        </div>
      )}

      <DailyLogDialog
        workspaceId={workspaceId}
        authorId={account?.id ?? ""}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={fetchLogs}
      />

      {editLog && (
        <DailyLogDialog
          workspaceId={workspaceId}
          authorId={account?.id ?? ""}
          existingLog={editLog}
          open={!!editLog}
          onOpenChange={(o) => { if (!o) setEditLog(null); }}
          onSaved={() => { setEditLog(null); void fetchLogs(); }}
        />
      )}
    </div>
  );
}
