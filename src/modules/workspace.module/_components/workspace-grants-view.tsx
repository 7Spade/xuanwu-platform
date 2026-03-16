"use client";
/**
 * WorkspaceGrantsView — interactive workspace access-control (grants) view.
 *
 * Source equivalent: workspace.slice/core/_components/workspace-settings.tsx
 * (members section) + workspace-access.tsx write-path.
 * Adapted: grant + revoke + role-update write-path via grantWorkspaceAccess /
 * revokeWorkspaceAccess / updateWorkspaceRole Server Actions.
 */

import { useCallback, useState } from "react";
import { Loader2, Users, ShieldCheck, Eye, Edit, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/design-system/primitives/ui/badge";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/primitives/ui/dialog";
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
import { Input } from "@/design-system/primitives/ui/input";
import { Label } from "@/design-system/primitives/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/primitives/ui/select";
import { useTranslation } from "@/shared/i18n";
import {
  grantWorkspaceAccess,
  revokeWorkspaceAccess,
  updateWorkspaceRole,
  type WorkspaceGrantDTO,
  type WorkspaceRole,
} from "@/modules/workspace.module";

import { useWorkspace } from "./use-workspace";

// ---------------------------------------------------------------------------
// Role helpers
// ---------------------------------------------------------------------------

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  Manager:     "default",
  Contributor: "secondary",
  Viewer:      "outline",
};

const ROLES = ["Manager", "Contributor", "Viewer"] as const;

function RoleIcon({ role }: { role: string }) {
  const cls = "size-3";
  switch (role) {
    case "Manager":     return <ShieldCheck className={cls} />;
    case "Contributor": return <Edit className={cls} />;
    default:            return <Eye className={cls} />;
  }
}

// ---------------------------------------------------------------------------
// Grant row — role selector + revoke button
// ---------------------------------------------------------------------------

interface GrantRowProps {
  grant: WorkspaceGrantDTO;
  onRoleChange: (grantId: string, newRole: string) => Promise<void>;
  onRevoke: (grant: WorkspaceGrantDTO) => void;
  isUpdating: boolean;
}

function GrantRow({ grant, onRoleChange, onRevoke, isUpdating }: GrantRowProps) {
  const t = useTranslation("zh-TW");
  const formattedDate = new Date(grant.grantedAt).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-3 border-b border-border/30 py-3 last:border-0">
      {/* User info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs font-medium text-foreground">
          {grant.userId}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {t("workspace.members.grantDate").replace("{date}", formattedDate)}
        </p>
      </div>

      {/* Role selector */}
      <Select
        value={grant.role}
        onValueChange={(val) => void onRoleChange(grant.grantId, val)}
        disabled={isUpdating}
      >
        <SelectTrigger className="h-7 w-28 text-[10px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r} className="text-[11px]">
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Role badge (display-only, shown on larger screens) */}
      <Badge
        variant={ROLE_VARIANT[grant.role] ?? "outline"}
        className="hidden shrink-0 items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest sm:flex"
      >
        <RoleIcon role={grant.role} />
        {grant.role}
      </Badge>

      {/* Revoke */}
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={isUpdating}
        onClick={() => onRevoke(grant)}
        title={t("workspace.members.revoke")}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public view component
// ---------------------------------------------------------------------------

interface WorkspaceGrantsViewProps {
  workspaceId: string;
}

export function WorkspaceGrantsView({ workspaceId }: WorkspaceGrantsViewProps) {
  const t = useTranslation("zh-TW");
  const { workspace, loading, refresh } = useWorkspace(workspaceId);

  // Invite dialog
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("Contributor");
  const [isGranting, setIsGranting] = useState(false);

  // Revoke confirm
  const [pendingRevoke, setPendingRevoke] = useState<WorkspaceGrantDTO | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Role-update per-row loading
  const [updatingGrantId, setUpdatingGrantId] = useState<string | null>(null);

  const [opError, setOpError] = useState<string | null>(null);

  // ── Grant (invite)
  const handleGrant = useCallback(async () => {
    if (!inviteUserId.trim()) return;
    setIsGranting(true);
    setOpError(null);
    try {
      const result = await grantWorkspaceAccess(workspaceId, {
        userId: inviteUserId.trim(),
        role: inviteRole,
      });
      if (!result.ok) { setOpError(result.error.message); return; }
      setIsInviteOpen(false);
      setInviteUserId("");
      setInviteRole("Contributor");
      refresh();
    } finally {
      setIsGranting(false);
    }
  }, [inviteUserId, inviteRole, workspaceId, refresh]);

  // ── Revoke
  const handleConfirmRevoke = useCallback(async () => {
    if (!pendingRevoke) return;
    setIsRevoking(true);
    setOpError(null);
    try {
      const result = await revokeWorkspaceAccess(
        workspaceId,
        pendingRevoke.grantId,
      );
      if (!result.ok) { setOpError(result.error.message); return; }
      setPendingRevoke(null);
      refresh();
    } finally {
      setIsRevoking(false);
    }
  }, [pendingRevoke, workspaceId, refresh]);

  // ── Role update
  const handleRoleChange = useCallback(async (grantId: string, newRole: string) => {
    setUpdatingGrantId(grantId);
    setOpError(null);
    try {
      const result = await updateWorkspaceRole(
        workspaceId,
        grantId,
        newRole as WorkspaceRole,
      );
      if (!result.ok) { setOpError(result.error.message); return; }
      refresh();
    } finally {
      setUpdatingGrantId(null);
    }
  }, [workspaceId, refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const grants = (workspace?.grants ?? []).filter((g) => g.status === "active");

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      {/* Section header + Invite button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t("workspace.members.title")}
          </h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 rounded-xl text-[11px]"
          onClick={() => setIsInviteOpen(true)}
        >
          <Plus className="size-3" />
          {t("workspace.members.invite")}
        </Button>
      </div>

      {/* Error banner */}
      {opError != null && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2 text-xs text-destructive">
          {opError}
        </p>
      )}

      {grants.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-16 text-center">
          <div className="rounded-2xl bg-muted/40 p-4">
            <Users className="size-10 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">{t("workspace.members.none")}</p>
            <p className="text-[11px] text-muted-foreground">
              {t("workspace.members.noneHint")}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 h-9 gap-1.5 rounded-xl"
            onClick={() => setIsInviteOpen(true)}
          >
            <Plus className="size-3.5" />
            {t("workspace.members.inviteFirst")}
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
          <div className="divide-y divide-border/30 px-4">
            {grants.map((grant) => (
              <GrantRow
                key={grant.grantId}
                grant={grant}
                onRoleChange={handleRoleChange}
                onRevoke={setPendingRevoke}
                isUpdating={updatingGrantId === grant.grantId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary footer */}
      {grants.length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-muted/20 px-4 py-3">
          <Users className="size-4 text-muted-foreground" />
          <p className="text-[11px] font-semibold text-muted-foreground">
            {t("workspace.members.count").replace("{count}", String(grants.length))}
          </p>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog
        open={isInviteOpen}
        onOpenChange={(open) => {
          if (!open) { setInviteUserId(""); setInviteRole("Contributor"); }
          setIsInviteOpen(open);
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t("workspace.members.inviteDialog.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("workspace.members.inviteDialog.userIdLabel")}
              </Label>
              <Input
                value={inviteUserId}
                onChange={(e) => setInviteUserId(e.target.value)}
                placeholder={t("workspace.members.inviteDialog.userIdPlaceholder")}
                className="rounded-xl text-sm"
                disabled={isGranting}
                onKeyDown={(e) => { if (e.key === "Enter") void handleGrant(); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("workspace.members.inviteDialog.roleLabel")}
              </Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as WorkspaceRole)} disabled={isGranting}>
                <SelectTrigger className="rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {opError != null && (
            <p className="text-xs text-destructive">{opError}</p>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsInviteOpen(false)}
              disabled={isGranting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => void handleGrant()}
              disabled={isGranting || !inviteUserId.trim()}
            >
              {isGranting
                ? <Loader2 className="size-4 animate-spin" />
                : t("workspace.members.inviteDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <AlertDialog
        open={pendingRevoke != null}
        onOpenChange={(open) => { if (!open) setPendingRevoke(null); }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("workspace.members.revokeDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              {t("workspace.members.revokeDialog.description").replace(
                "{userId}", pendingRevoke?.userId ?? "",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleConfirmRevoke()}
              disabled={isRevoking}
            >
              {isRevoking
                ? <Loader2 className="size-4 animate-spin" />
                : t("workspace.members.revoke")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
