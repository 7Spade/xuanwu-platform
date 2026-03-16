"use client";
/**
 * WorkspaceSettingsDialog — Workspace Sovereignty Settings dialog.
 *
 * Source equivalent: workspace.slice/core/_components/workspace-settings.tsx
 * Adapted: photo URL field (direct URL input), uses design-system components,
 * calls updateWorkspaceSettings Server Action via FirestoreWorkspaceRepository.
 *
 * Fields: name · lifecycleState · visibility · address · personnel (manager/supervisor/safety)
 */

import { useState, useEffect } from "react";
import { HardHat, ImageIcon, Loader2, Settings, ShieldCheck, Trash2, User2 } from "lucide-react";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/primitives/ui/dialog";
import { Input } from "@/design-system/primitives/ui/input";
import { Label } from "@/design-system/primitives/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/primitives/ui/select";
import { Switch } from "@/design-system/primitives/ui/switch";
import { useTranslation } from "@/shared/i18n";

import {
  deleteWorkspace,
  updateWorkspaceSettings,
  type WorkspaceDTO,
} from "@/modules/workspace.module";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMPTY_ADDRESS: WorkspaceAddress = {
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

type WorkspaceLifecycleState = WorkspaceDTO["lifecycleState"];
type WorkspaceAddress = NonNullable<WorkspaceDTO["address"]>;
type WorkspacePersonnel = NonNullable<WorkspaceDTO["personnel"]>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WorkspaceSettingsDialogProps {
  workspace: WorkspaceDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (updated: WorkspaceDTO) => void;
  onDeleted?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkspaceSettingsDialog({
  workspace,
  open,
  onOpenChange,
  onSaved,
  onDeleted,
}: WorkspaceSettingsDialogProps) {
  const t = useTranslation("zh-TW");

  const [name, setName] = useState(workspace.name);
  const [visibility, setVisibility] = useState(workspace.visibility);
  const [lifecycleState, setLifecycleState] = useState<WorkspaceLifecycleState>(
    workspace.lifecycleState,
  );
  const [address, setAddress] = useState<WorkspaceAddress>(
    workspace.address ?? EMPTY_ADDRESS,
  );
  const [personnel, setPersonnel] = useState<WorkspacePersonnel>(
    workspace.personnel ?? {},
  );
  const [photoURL, setPhotoURL] = useState(workspace.photoURL ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state when workspace changes (e.g., dialog reopened for a different workspace)
  useEffect(() => {
    setName(workspace.name);
    setVisibility(workspace.visibility);
    setLifecycleState(workspace.lifecycleState);
    setAddress(workspace.address ?? EMPTY_ADDRESS);
    setPersonnel(workspace.personnel ?? {});
    setPhotoURL(workspace.photoURL ?? "");
    setError(null);
  }, [workspace.id, workspace.lifecycleState, workspace.name, workspace.visibility, workspace.address, workspace.personnel, workspace.photoURL]);

  const handleAddressChange = (field: keyof WorkspaceAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePersonnelChange = (
    field: keyof WorkspacePersonnel,
    value: string,
  ) => {
    setPersonnel((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateWorkspaceSettings(workspace.id, {
        name,
        visibility: visibility as "visible" | "hidden",
        lifecycleState,
        address,
        personnel,
        photoURL: photoURL.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onSaved?.(result.value);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteWorkspace(workspace.id);
      if (!result.ok) {
        setError(result.error.message);
        setIsDeleteOpen(false);
        return;
      }
      setIsDeleteOpen(false);
      onOpenChange(false);
      onDeleted?.();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Settings className="size-5" />
            {t("workspace.settings.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto py-4 pr-2">
          {/* Photo URL */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="size-3.5" />
                {t("workspace.settings.photoURLLabel")}
              </span>
            </Label>
            {photoURL && /^https?:\/\//i.test(photoURL) && (
              <div className="relative h-24 w-full overflow-hidden rounded-xl border border-border/40">
                <img
                  src={photoURL}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
            <Input
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder={t("workspace.settings.photoURLPlaceholder")}
              className="h-11 rounded-xl"
              disabled={loading}
              type="url"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">
              {t("workspace.settings.nameLabel")}
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl"
              disabled={loading}
            />
          </div>

          {/* Personnel */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">
              {t("workspace.settings.personnelLabel")}
            </Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <User2 className="size-3.5" />
                  <span>{t("workspace.settings.manager")}</span>
                </div>
                <Input
                  placeholder="User ID"
                  value={personnel.managerId ?? ""}
                  onChange={(e) => handlePersonnelChange("managerId", e.target.value)}
                  className="h-9 rounded-xl"
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <HardHat className="size-3.5" />
                  <span>{t("workspace.settings.supervisor")}</span>
                </div>
                <Input
                  placeholder="User ID"
                  value={personnel.supervisorId ?? ""}
                  onChange={(e) => handlePersonnelChange("supervisorId", e.target.value)}
                  className="h-9 rounded-xl"
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  <span>{t("workspace.settings.safety")}</span>
                </div>
                <Input
                  placeholder="User ID"
                  value={personnel.safetyOfficerId ?? ""}
                  onChange={(e) => handlePersonnelChange("safetyOfficerId", e.target.value)}
                  className="h-9 rounded-xl"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Physical Address */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">
              {t("workspace.settings.addressLabel")}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder={t("workspace.settings.country")}
                value={address.country}
                onChange={(e) => handleAddressChange("country", e.target.value)}
                className="h-11 rounded-xl"
                disabled={loading}
              />
              <Input
                placeholder={t("workspace.settings.state")}
                value={address.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                className="h-11 rounded-xl"
                disabled={loading}
              />
            </div>
            <Input
              placeholder={t("workspace.settings.city")}
              value={address.city}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              className="h-11 rounded-xl"
              disabled={loading}
            />
            <Input
              placeholder={t("workspace.settings.street")}
              value={address.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
              className="h-11 rounded-xl"
              disabled={loading}
            />
            <Input
              placeholder={t("workspace.settings.postalCode")}
              value={address.postalCode}
              onChange={(e) => handleAddressChange("postalCode", e.target.value)}
              className="h-11 rounded-xl"
              disabled={loading}
            />
          </div>

          {/* Lifecycle State */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">
              {t("workspace.settings.lifecycleLabel")}
            </Label>
            <Select
              value={lifecycleState}
              onValueChange={(v) => setLifecycleState(v as WorkspaceLifecycleState)}
              disabled={loading}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preparatory">
                  {t("workspace.settings.lifecycle.preparatory")}
                </SelectItem>
                <SelectItem value="active">
                  {t("workspace.settings.lifecycle.active")}
                </SelectItem>
                <SelectItem value="stopped">
                  {t("workspace.settings.lifecycle.stopped")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold">
                {t("workspace.settings.visibilityLabel")}
              </Label>
              <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                {visibility === "visible"
                  ? t("workspace.settings.visibilityVisible")
                  : t("workspace.settings.visibilityHidden")}
              </p>
            </div>
            <Switch
              checked={visibility === "visible"}
              onCheckedChange={(checked) =>
                setVisibility(checked ? "visible" : "hidden")
              }
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          {/* Danger Zone */}
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-destructive/70">
              {t("workspace.settings.dangerZone.title")}
            </p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {t("workspace.settings.dangerZone.deleteLabel")}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("workspace.settings.dangerZone.deleteHint")}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 shrink-0 gap-1.5 rounded-xl text-[11px]"
                onClick={() => setIsDeleteOpen(true)}
                disabled={loading}
              >
                <Trash2 className="size-3.5" />
                {t("workspace.settings.dangerZone.deleteButton")}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation */}
    <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("workspace.settings.dangerZone.confirmTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            {t("workspace.settings.dangerZone.confirmDescription").replace(
              "{name}", workspace.name,
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting
              ? <Loader2 className="size-4 animate-spin" />
              : t("workspace.settings.dangerZone.confirmButton")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
