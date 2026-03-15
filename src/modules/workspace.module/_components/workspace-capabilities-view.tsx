"use client";
/**
 * WorkspaceCapabilitiesView — manages mounted capabilities for a workspace.
 *
 * Source equivalent: workspace.slice/core/_components/workspace-capabilities.tsx
 * Wave 32: read-only display.
 * Wave 34: added Mount button (dialog), Unmount button (confirmation), write-path via Server Actions.
 *
 * Shows: capability cards (icon + name + description + status badge + unmount button)
 *        → "+ Mount New Capability" button → empty state.
 */

import {
  Box,
  FileText,
  ListTodo,
  ShieldCheck,
  Trophy,
  AlertCircle,
  MessageSquare,
  Layers,
  Users,
  Activity,
  Landmark,
  Calendar,
  FileScan,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

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
import { Badge } from "@/design-system/primitives/ui/badge";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/primitives/ui/dialog";
import { Label } from "@/design-system/primitives/ui/label";
import { Checkbox } from "@/design-system/primitives/ui/checkbox";
import { useTranslation } from "@/shared/i18n";
import type { WorkspaceCapability } from "@/modules/workspace.module/domain.workspace/_value-objects";
import {
  CAPABILITY_SPECS,
  NON_MOUNTABLE_CAPABILITY_IDS,
} from "@/modules/workspace.module/domain.workspace/_capability-specs";
import { mountCapabilities, unmountCapability } from "@/modules/workspace.module/core/_actions";
import { FirestoreWorkspaceRepository } from "@/modules/workspace.module/infra.firestore/_repository";

import { useWorkspace } from "./use-workspace";

// ---------------------------------------------------------------------------
// Repo singleton
// ---------------------------------------------------------------------------

let _repo: FirestoreWorkspaceRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreWorkspaceRepository();
  return _repo;
}

// ---------------------------------------------------------------------------
// Icon registry — maps capability IDs to icons
// ---------------------------------------------------------------------------

function CapabilityIcon({ id }: { id: string }) {
  const size = "size-5";
  switch (id) {
    case "tasks":             return <ListTodo className={size} />;
    case "quality-assurance": return <ShieldCheck className={size} />;
    case "acceptance":        return <Trophy className={size} />;
    case "finance":           return <Landmark className={size} />;
    case "issues":            return <AlertCircle className={size} />;
    case "daily":             return <MessageSquare className={size} />;
    case "schedule":          return <Calendar className={size} />;
    case "document-parser":   return <FileScan className={size} />;
    case "files":             return <FileText className={size} />;
    case "members":           return <Users className={size} />;
    case "audit":             return <Activity className={size} />;
    default:                  return <Layers className={size} />;
  }
}

// ---------------------------------------------------------------------------
// Single capability card
// ---------------------------------------------------------------------------

function CapabilityCard({
  cap,
  onUnmount,
}: {
  cap: WorkspaceCapability;
  onUnmount: (cap: WorkspaceCapability) => void;
}) {
  const t = useTranslation("zh-TW");

  return (
    <Card className="group overflow-hidden border-border/60 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/40">
      <CardHeader className="pb-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-xl bg-primary/5 p-2.5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <CapabilityIcon id={cap.id} />
          </div>
          <Badge
            variant="outline"
            className="bg-background px-1.5 text-[9px] font-bold uppercase"
          >
            {cap.status === "stable"
              ? t("workspace.capabilities.production")
              : t("workspace.capabilities.beta")}
          </Badge>
        </div>
        <CardTitle className="text-lg transition-colors group-hover:text-primary">
          {cap.name}
        </CardTitle>
        <CardDescription className="mt-1 text-[11px] leading-relaxed">
          {cap.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between border-t border-border/10 bg-muted/5 py-4">
        <span className="font-mono text-[9px] text-muted-foreground opacity-60">
          SPEC_ID: {cap.id.toUpperCase()}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onUnmount(cap)}
          title={t("workspace.capabilities.unmount")}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Spec icon (for mount picker)
// ---------------------------------------------------------------------------

function SpecIcon({ type }: { type: string }) {
  const size = "size-6";
  switch (type) {
    case "governance": return <Users className={size} />;
    case "monitoring": return <Activity className={size} />;
    case "data":       return <FileText className={size} />;
    case "ui":         return <Layers className={size} />;
    default:           return <Box className={size} />;
  }
}

// ---------------------------------------------------------------------------
// Public view component
// ---------------------------------------------------------------------------

interface WorkspaceCapabilitiesViewProps {
  workspaceId: string;
}

export function WorkspaceCapabilitiesView({
  workspaceId,
}: WorkspaceCapabilitiesViewProps) {
  const t = useTranslation("zh-TW");
  const { workspace, loading, refresh } = useWorkspace(workspaceId);

  const [isMountOpen, setIsMountOpen] = useState(false);
  const [selectedCaps, setSelectedCaps] = useState<Set<string>>(new Set());
  const [isMounting, setIsMounting] = useState(false);
  const [pendingUnmount, setPendingUnmount] = useState<WorkspaceCapability | null>(null);
  const [isUnmounting, setIsUnmounting] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);

  const mountedIds = useMemo(
    () => new Set((workspace?.capabilities ?? []).map((c) => c.id)),
    [workspace?.capabilities],
  );

  const availableSpecs = useMemo(
    () =>
      CAPABILITY_SPECS.filter(
        (spec) =>
          !NON_MOUNTABLE_CAPABILITY_IDS.has(spec.id) &&
          !mountedIds.has(spec.id),
      ),
    [mountedIds],
  );

  const toggleCap = (id: string) => {
    setSelectedCaps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMount = useCallback(async () => {
    const caps = CAPABILITY_SPECS.filter((s) => selectedCaps.has(s.id));
    if (caps.length === 0) return;
    setIsMounting(true);
    setOpError(null);
    try {
      const result = await mountCapabilities(getRepo(), workspaceId, caps);
      if (!result.ok) {
        setOpError(result.error.message);
        return;
      }
      setIsMountOpen(false);
      setSelectedCaps(new Set());
      refresh();
    } finally {
      setIsMounting(false);
    }
  }, [selectedCaps, workspaceId, refresh]);

  const handleConfirmUnmount = useCallback(async () => {
    if (!pendingUnmount) return;
    setIsUnmounting(true);
    setOpError(null);
    try {
      const result = await unmountCapability(getRepo(), workspaceId, pendingUnmount.id);
      if (!result.ok) {
        setOpError(result.error.message);
        return;
      }
      setPendingUnmount(null);
      refresh();
    } finally {
      setIsUnmounting(false);
    }
  }, [pendingUnmount, workspaceId, refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const capabilities = workspace?.capabilities ?? [];

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      {/* Section header + Mount button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="size-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t("workspace.capabilities.mounted")}
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest"
          onClick={() => { setSelectedCaps(new Set()); setIsMountOpen(true); }}
        >
          <Plus className="size-3.5" />
          {t("workspace.capabilities.mountNew")}
        </Button>
      </div>

      {/* Error banner */}
      {opError && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {opError}
        </p>
      )}

      {capabilities.length === 0 ? (
        /* Empty state */
        <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-16 text-center">
          <div className="rounded-2xl bg-muted/40 p-4">
            <Box className="size-10 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">{t("workspace.capabilities.none")}</p>
            <p className="text-[11px] text-muted-foreground">
              {t("workspace.capabilities.noneHint")}
            </p>
          </div>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => { setSelectedCaps(new Set()); setIsMountOpen(true); }}
          >
            <Plus className="size-4" />
            {t("workspace.capabilities.mountFirst")}
          </Button>
        </div>
      ) : (
        /* Capability cards grid */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {capabilities.map((cap) => (
            <CapabilityCard key={cap.id} cap={cap} onUnmount={setPendingUnmount} />
          ))}
        </div>
      )}

      {/* Stats footer */}
      {capabilities.length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-muted/20 px-4 py-3">
          <Layers className="size-4 text-muted-foreground" />
          <p className="text-[11px] font-semibold text-muted-foreground">
            {t("workspace.capabilities.count").replace(
              "{count}",
              String(capabilities.length),
            )}
          </p>
        </div>
      )}

      {/* ── Mount Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={isMountOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedCaps(new Set());
          setIsMountOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t("workspace.capabilities.mountDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("workspace.capabilities.mountDialog.hint")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto py-4 md:grid-cols-2">
            {availableSpecs.length === 0 ? (
              <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                {t("workspace.capabilities.mountDialog.allMounted")}
              </p>
            ) : (
              availableSpecs.map((cap) => (
                <Label
                  key={cap.id}
                  htmlFor={`cap-${cap.id}`}
                  className={[
                    "flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors",
                    selectedCaps.has(cap.id)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50",
                  ].join(" ")}
                >
                  <Checkbox
                    id={`cap-${cap.id}`}
                    checked={selectedCaps.has(cap.id)}
                    onCheckedChange={() => toggleCap(cap.id)}
                  />
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <SpecIcon type={cap.type} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold uppercase">{cap.name}</p>
                    <p className="mt-0.5 whitespace-normal text-[10px] leading-tight text-muted-foreground">
                      {cap.description}
                    </p>
                  </div>
                </Label>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMountOpen(false)}
              disabled={isMounting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleMount}
              disabled={selectedCaps.size === 0 || isMounting}
            >
              {isMounting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("workspace.capabilities.mountSelected").replace(
                "{count}",
                String(selectedCaps.size),
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Unmount Confirmation ──────────────────────────────────── */}
      <AlertDialog
        open={!!pendingUnmount}
        onOpenChange={(open) => { if (!open) setPendingUnmount(null); }}
      >
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("workspace.capabilities.unmountDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("workspace.capabilities.unmountDialog.description").replace(
                "{name}",
                pendingUnmount?.name ?? "",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnmounting}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmUnmount}
              disabled={isUnmounting}
            >
              {isUnmounting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("workspace.capabilities.unmount")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

