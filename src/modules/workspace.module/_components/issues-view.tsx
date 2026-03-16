"use client";
/**
 * IssuesView — workspace issue tracking CRUD view.
 * Wave 46: capability-gated (requires "issues" capability).
 *
 * Source: workspace.slice/domain.issues/_components/issues-view.tsx
 */

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/design-system/primitives/ui/badge";
import { Button } from "@/design-system/primitives/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/design-system/primitives/ui/dialog";
import { Input } from "@/design-system/primitives/ui/input";
import { Label } from "@/design-system/primitives/ui/label";
import { Textarea } from "@/design-system/primitives/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/primitives/ui/select";
import { useTranslation } from "@/shared/i18n";
import { useCurrentAccount } from "@/modules/account.module";
import { FirestoreIssueRepository } from "@/modules/workspace.module/infra.firestore/_issue-repository";
import {
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue,
} from "@/modules/workspace.module/core/_issue-use-cases";
import type { IssueDTO } from "@/modules/workspace.module/core/_issue-use-cases";
import type { IssueSeverity, IssueStatus } from "@/modules/workspace.module/domain.issues/_entity";

let _repo: FirestoreIssueRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreIssueRepository();
  return _repo;
}

const SEVERITIES: IssueSeverity[] = ["critical", "high", "medium", "low"];

function statusIcon(status: IssueStatus) {
  switch (status) {
    case "resolved": return <CheckCircle2 className="size-4 text-green-500" />;
    case "in-progress": return <Clock className="size-4 text-blue-500" />;
    case "closed": return <XCircle className="size-4 text-muted-foreground" />;
    default: return <Circle className="size-4 text-orange-400" />;
  }
}

function severityVariant(s: IssueSeverity): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "critical": return "destructive";
    case "high": return "default";
    case "medium": return "outline";
    default: return "secondary";
  }
}

interface IssueFormDialogProps {
  workspaceId: string;
  reporterId: string;
  editIssue?: IssueDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function IssueFormDialog({ workspaceId, reporterId, editIssue, open, onOpenChange, onSaved }: IssueFormDialogProps) {
  const t = useTranslation("zh-TW");
  const [title, setTitle] = useState(editIssue?.title ?? "");
  const [description, setDescription] = useState(editIssue?.description ?? "");
  const [severity, setSeverity] = useState<IssueSeverity>(editIssue?.severity ?? "medium");
  const [status, setStatus] = useState<IssueStatus>(editIssue?.status ?? "open");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setTitle(editIssue?.title ?? "");
      setDescription(editIssue?.description ?? "");
      setSeverity(editIssue?.severity ?? "medium");
      setStatus(editIssue?.status ?? "open");
      setError(null);
    }
    onOpenChange(o);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError(t("workspace.issues.titleRequired")); return; }
    setSaving(true);
    setError(null);
    try {
      let result;
      if (editIssue) {
        result = await updateIssue(getRepo(), editIssue.id, {
          title: title.trim(),
          description: description.trim() || null,
          severity,
          status,
        });
      } else {
        result = await createIssue(
          getRepo(),
          crypto.randomUUID(),
          workspaceId,
          title.trim(),
          severity,
          reporterId,
          description.trim() || undefined,
        );
      }
      if (!result.ok) throw result.error;
      onSaved();
      onOpenChange(false);
    } catch {
      setError(t("workspace.issues.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {editIssue ? t("workspace.issues.editIssue") : t("workspace.issues.createIssue")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid gap-1.5">
            <Label>{t("workspace.issues.titleLabel")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
          </div>
          <div className="grid gap-1.5">
            <Label>{t("workspace.issues.descriptionLabel")}</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("workspace.issues.descriptionPlaceholder")}
              className="resize-none rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>{t("workspace.issues.severityLabel")}</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as IssueSeverity)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>{t(`workspace.issues.severity.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editIssue && (
              <div className="grid gap-1.5">
                <Label>{t("workspace.issues.statusLabel")}</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["open", "in-progress", "resolved", "closed"] as IssueStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{t(`workspace.issues.status.${s}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>{t("common.cancel")}</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface IssuesViewProps {
  workspaceId: string;
}

export function IssuesView({ workspaceId }: IssuesViewProps) {
  const t = useTranslation("zh-TW");
  const { account } = useCurrentAccount();
  const [issues, setIssues] = useState<IssueDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<IssueDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IssueDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getIssues(getRepo(), workspaceId);
      if (result.ok) setIssues(result.value);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { void fetchIssues(); }, [fetchIssues]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteIssue(getRepo(), deleteTarget.id);
      setDeleteTarget(null);
      void fetchIssues();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">{t("workspace.issues.title")}</h1>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs font-bold uppercase tracking-widest"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          {t("workspace.issues.addIssue")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : issues.length > 0 ? (
        <div className="space-y-2">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="group flex items-start gap-3 rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-sm transition-colors hover:bg-card/80"
            >
              <div className="mt-0.5 shrink-0">{statusIcon(issue.status)}</div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${issue.status === "closed" ? "line-through text-muted-foreground" : ""}`}>
                  {issue.title}
                </p>
                {issue.description && (
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{issue.description}</p>
                )}
              </div>
              <Badge variant={severityVariant(issue.severity)} className="shrink-0 h-5 px-2 text-[10px] font-bold uppercase tracking-wider">
                {t(`workspace.issues.severity.${issue.severity}`)}
              </Badge>
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditIssue(issue)}
                  className="rounded-md p-1 hover:bg-muted"
                  aria-label="Edit"
                >
                  <Pencil className="size-4 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(issue)}
                  className="rounded-md p-1 hover:bg-destructive/10"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4 text-destructive/70" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-16 text-center">
          <AlertTriangle className="mb-4 size-12 text-muted-foreground opacity-10" />
          <h3 className="text-lg font-bold">{t("workspace.issues.empty")}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t("workspace.issues.emptyHint")}</p>
          <Button
            size="lg"
            className="mt-8 rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-lg"
            onClick={() => setCreateOpen(true)}
          >
            {t("workspace.issues.addIssue")}
          </Button>
        </div>
      )}

      <IssueFormDialog
        workspaceId={workspaceId}
        reporterId={account?.id ?? ""}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={fetchIssues}
      />

      {editIssue && (
        <IssueFormDialog
          workspaceId={workspaceId}
          reporterId={account?.id ?? ""}
          editIssue={editIssue}
          open={!!editIssue}
          onOpenChange={(o) => { if (!o) setEditIssue(null); }}
          onSaved={() => { setEditIssue(null); void fetchIssues(); }}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("workspace.issues.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("workspace.issues.deleteDescription")}</AlertDialogDescription>
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
    </div>
  );
}
