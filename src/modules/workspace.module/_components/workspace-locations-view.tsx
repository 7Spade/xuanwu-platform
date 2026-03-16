"use client";
/**
 * WorkspaceLocationsView — manages sub-locations for a workspace.
 *
 * Wave 42: Shows buildings, floors (parentId = buildingId), and rooms
 * (parentId = floorId) in a hierarchical layout. Supports add and delete.
 */

import { useState, useCallback } from "react";
import { Building2, Layers, DoorOpen, Plus, Trash2, Loader2, MapPin } from "lucide-react";

import { Button } from "@/design-system/primitives/ui/button";
import { Input } from "@/design-system/primitives/ui/input";
import { Label } from "@/design-system/primitives/ui/label";
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
import { useTranslation } from "@/shared/i18n";
import { useWorkspace } from "./use-workspace";
import { addWorkspaceLocation, removeWorkspaceLocation } from "../core/_actions";
import type { WorkspaceDTO } from "../core/_queries";

interface WorkspaceLocationsViewProps {
  slug: string;
  workspaceId: string;
}

type LocationType = "building" | "floor" | "room";
type WorkspaceLocation = NonNullable<WorkspaceDTO["locations"]>[number];

// ---------------------------------------------------------------------------
// AddLocationDialog
// ---------------------------------------------------------------------------

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: LocationType;
  parentId?: string;
  onAdd: (label: string) => Promise<void>;
}

function AddLocationDialog({ open, onOpenChange, type, onAdd }: AddLocationDialogProps) {
  const t = useTranslation("zh-TW");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!label.trim()) return;
    setLoading(true);
    try {
      await onAdd(label.trim());
      setLabel("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const typeLabel =
    type === "building"
      ? t("workspace.locations.buildingType")
      : type === "floor"
        ? t("workspace.locations.floorType")
        : t("workspace.locations.roomType");

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setLabel(""); onOpenChange(v); }}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("workspace.locations.addDialog.title")} — {typeLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{typeLabel}</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("workspace.locations.labelPlaceholder")}
              className="text-sm"
              disabled={loading}
              onKeyDown={(e) => { if (e.key === "Enter") void handleConfirm(); }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("workspace.locations.addDialog.cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !label.trim()}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t("workspace.locations.addDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WorkspaceLocationsView({ workspaceId }: WorkspaceLocationsViewProps) {
  const t = useTranslation("zh-TW");
  const { workspace, loading, refresh } = useWorkspace(workspaceId);

  // Add dialog state
  const [addDialog, setAddDialog] = useState<{
    open: boolean;
    type: LocationType;
    parentId?: string;
  }>({ open: false, type: "building" });

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceLocation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = useCallback((type: LocationType, parentId?: string) => {
    setAddDialog({ open: true, type, parentId });
  }, []);

  const handleAdd = useCallback(
    async (label: string) => {
      const id = `loc-${crypto.randomUUID()}`;
      await addWorkspaceLocation(workspaceId, {
        id,
        label,
        type: addDialog.type,
        parentId: addDialog.parentId,
      });
      refresh();
    },
    [workspaceId, addDialog.type, addDialog.parentId, refresh],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeWorkspaceLocation(workspaceId, deleteTarget.locationId);
      setDeleteTarget(null);
      refresh();
    } finally {
      setDeleting(false);
    }
  };

  const locations = workspace?.locations ?? [];
  const buildings = locations.filter((l) => l.type === "building" || !l.type);
  const floors = locations.filter((l) => l.type === "floor");
  const rooms = locations.filter((l) => l.type === "room");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <MapPin className="size-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">{t("workspace.locations.title")}</h1>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs font-bold uppercase tracking-widest"
          onClick={() => openAdd("building")}
        >
          <Plus className="size-4" />
          {t("workspace.locations.addBuilding")}
        </Button>
      </div>

      {/* Empty state */}
      {locations.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-16 text-center">
          <MapPin className="mb-4 size-12 text-muted-foreground opacity-10" />
          <h3 className="text-lg font-bold">{t("workspace.locations.empty")}</h3>
          <Button
            size="lg"
            className="mt-8 rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-lg"
            onClick={() => openAdd("building")}
          >
            {t("workspace.locations.addBuilding")}
          </Button>
        </div>
      )}

      {/* Buildings */}
      {buildings.map((building) => {
        const buildingFloors = floors.filter((f) => f.parentId === building.locationId);
        return (
          <div key={building.locationId} className="rounded-2xl border border-border/50 bg-card shadow-sm">
            {/* Building header */}
            <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
              <Building2 className="size-4 text-primary" />
              <span className="flex-1 font-semibold">{building.label}</span>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-[10px] font-bold uppercase tracking-widest"
                onClick={() => openAdd("floor", building.locationId)}
              >
                <Plus className="size-3" />
                {t("workspace.locations.addFloor")}
              </Button>
              <button
                type="button"
                onClick={() => setDeleteTarget(building)}
                className="rounded-md p-1 hover:bg-destructive/10"
                aria-label="Delete building"
              >
                <Trash2 className="size-4 text-destructive/70" />
              </button>
            </div>

            {/* Floors */}
            <div className="divide-y divide-border/30">
              {buildingFloors.map((floor) => {
                const floorRooms = rooms.filter((r) => r.parentId === floor.locationId);
                return (
                  <div key={floor.locationId} className="px-4 py-2">
                    <div className="flex items-center gap-2 py-1">
                      <Layers className="size-3.5 text-muted-foreground" />
                      <span className="flex-1 text-sm font-medium">{floor.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-2 text-[10px] font-bold uppercase tracking-widest"
                        onClick={() => openAdd("room", floor.locationId)}
                      >
                        <Plus className="size-3" />
                        {t("workspace.locations.addRoom")}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(floor)}
                        className="rounded-md p-1 hover:bg-destructive/10"
                        aria-label="Delete floor"
                      >
                        <Trash2 className="size-3.5 text-destructive/70" />
                      </button>
                    </div>
                    {/* Rooms */}
                    {floorRooms.length > 0 && (
                      <div className="ml-5 mt-1 space-y-1">
                        {floorRooms.map((room) => (
                          <div
                            key={room.locationId}
                            className="flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-1.5"
                          >
                            <DoorOpen className="size-3 text-muted-foreground" />
                            <span className="flex-1 text-xs">{room.label}</span>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(room)}
                              className="rounded p-0.5 hover:bg-destructive/10"
                              aria-label="Delete room"
                            >
                              <Trash2 className="size-3 text-destructive/70" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {buildingFloors.length === 0 && (
                <p className="px-4 py-3 text-xs text-muted-foreground">
                  {t("workspace.locations.empty")}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Add location dialog */}
      <AddLocationDialog
        open={addDialog.open}
        onOpenChange={(v) => setAddDialog((s) => ({ ...s, open: v }))}
        type={addDialog.type}
        parentId={addDialog.parentId}
        onAdd={handleAdd}
      />

      {/* Delete confirm dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("workspace.locations.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("workspace.locations.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("workspace.locations.addDialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
