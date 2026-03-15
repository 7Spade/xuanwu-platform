"use client";
/**
 * DailyLogCard — shows a single daily log entry with edit/delete actions.
 * Wave 45: core card. Wave 52: social reactions (like + bookmark).
 * Wave 55: comment thread (collaboration.module).
 */

import { useState } from "react";
import { Calendar, Pencil, Trash2 } from "lucide-react";
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
import { FirestoreDailyLogRepository } from "@/modules/workspace.module/infra.firestore/_daily-log-repository";
import { deleteDailyLog } from "@/modules/workspace.module/core/_daily-log-use-cases";
import type { DailyLogDTO } from "@/modules/workspace.module/core/_daily-log-use-cases";
import { useCurrentAccount } from "@/modules/account.module/_components/account-provider";
import { SocialActionsBar } from "@/modules/social.module/_components/social-actions-bar";
import { CommentThread } from "@/modules/collaboration.module/_components/comment-thread";

let _repo: FirestoreDailyLogRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreDailyLogRepository();
  return _repo;
}

interface DailyLogCardProps {
  log: DailyLogDTO;
  onEdit: () => void;
  onDeleted: () => void;
}

export function DailyLogCard({ log, onEdit, onDeleted }: DailyLogCardProps) {
  const t = useTranslation("zh-TW");
  const { account } = useCurrentAccount();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDailyLog(getRepo(), log.id);
      setDeleteOpen(false);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="group rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition-colors hover:bg-card/80">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">{log.date}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{log.content}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-md p-1 hover:bg-muted"
              aria-label="Edit"
            >
              <Pencil className="size-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="rounded-md p-1 hover:bg-destructive/10"
              aria-label="Delete"
            >
              <Trash2 className="size-4 text-destructive/70" />
            </button>
          </div>
        </div>

        {log.photoURLs.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {log.photoURLs.map((url, idx) => (
              <img
                key={idx}
                src={/^https?:\/\//i.test(url) ? url : ""}
                alt={t("tasks.attachmentPreviewAlt")}
                className="h-24 w-24 shrink-0 rounded-xl border object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ))}
          </div>
        )}

        {/* Social reactions — Wave 52 */}
        <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
          <SocialActionsBar
            targetId={log.id}
            targetType="daily-log"
            currentAccountId={account?.id}
          />
        </div>

        {/* Comment thread — Wave 55 */}
        <CommentThread
          artifactType="daily-log"
          artifactId={log.id}
          defaultCollapsed
        />
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("workspace.daily.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("workspace.daily.deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
