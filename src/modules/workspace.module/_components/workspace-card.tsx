"use client";
/**
 * WorkspaceCard — displays a workspace summary in the grid.
 *
 * Wave 37: Added lifecycle advance button (preparatory→active, active→stopped)
 *          and settings quick-access gear icon.
 *
 * Source: workspace.slice/core/_components/workspace-card.tsx
 * Adapted: removes app-runtime deps, uses platform i18n + design-system
 */

import { useState } from "react";
import { ArrowRight, Clock, Globe, Layers, Loader2, Lock, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/shared/i18n";
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
  Card,
  CardContent,
  CardHeader,
} from "@/design-system/primitives/ui/card";
import type { WorkspaceDTO } from "@/modules/workspace.module";
import type { WorkspaceLifecycleState } from "@/modules/workspace.module/domain.workspace/_value-objects";
import { advanceWorkspaceLifecycle } from "@/modules/workspace.module/core/_actions";
import { FirestoreWorkspaceRepository } from "@/modules/workspace.module/infra.firestore/_repository";
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog";

interface WorkspaceCardProps {
  workspace: WorkspaceDTO;
  slug: string;
}

// Module-level singleton repository instance.
let _repo: FirestoreWorkspaceRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreWorkspaceRepository();
  return _repo;
}

const NEXT_STATE: Partial<Record<WorkspaceLifecycleState, WorkspaceLifecycleState>> = {
  preparatory: "active",
  active: "stopped",
};

function lifecycleVariant(
  state: WorkspaceDTO["lifecycleState"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (state) {
    case "active":
      return "default";
    case "stopped":
      return "secondary";
    case "preparatory":
      return "outline";
    default:
      return "outline";
  }
}

export function WorkspaceCard({ workspace, slug }: WorkspaceCardProps) {
  const t = useTranslation("zh-TW");
  const router = useRouter();
  const href = `/${slug}/${workspace.id}/wbs`;
  const isPrivate = workspace.visibility === "hidden";

  const nextState = NEXT_STATE[workspace.lifecycleState];

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(workspace);

  const handleAdvance = async () => {
    if (!nextState) return;
    setAdvancing(true);
    try {
      const result = await advanceWorkspaceLifecycle(getRepo(), currentWorkspace.id, nextState);
      if (result.ok) {
        setCurrentWorkspace(result.value);
      }
    } finally {
      setAdvancing(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
    <Card className="group relative flex h-full flex-col overflow-hidden border-border/60 bg-card/80 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      {currentWorkspace.photoURL ? (
        <div
          className="h-24 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${currentWorkspace.photoURL})` }}
        />
      ) : (
        <div className="flex h-24 w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <Layers className="size-10 text-primary/30" />
        </div>
      )}

      <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight tracking-tight">
            {currentWorkspace.name}
          </h3>
          {currentWorkspace.slug && (
            <p className="mt-0.5 truncate text-[10px] font-mono text-muted-foreground/60">
              /{currentWorkspace.slug}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isPrivate ? (
            <Lock className="size-3.5 text-muted-foreground" />
          ) : (
            <Globe className="size-3.5 text-muted-foreground" />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="size-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            <Settings className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-3 px-4 pb-4 pt-0">
        <div className="flex items-center gap-2">
          <Badge
            variant={lifecycleVariant(currentWorkspace.lifecycleState)}
            className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider"
          >
            {currentWorkspace.lifecycleState}
          </Badge>
          {nextState && (
            <Button
              variant="outline"
              size="sm"
              className="h-5 gap-1 px-2 text-[10px] font-bold uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setConfirmOpen(true)}
            >
              {t("workspace.card.advance")}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="size-3" />
            <span>
              {new Date(currentWorkspace.updatedAt).toLocaleDateString("zh-TW", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Link href={href}>
              {t("common.open")}
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Lifecycle advance confirmation */}
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("workspace.card.advanceConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            {t("workspace.card.advanceConfirmDescription")
              .replace("{name}", currentWorkspace.name)
              .replace("{from}", currentWorkspace.lifecycleState)
              .replace("{to}", nextState ?? "")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={advancing}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAdvance}
            disabled={advancing}
          >
            {advancing
              ? <Loader2 className="size-4 animate-spin" />
              : t("workspace.card.advanceConfirmButton")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Inline settings dialog */}
    <WorkspaceSettingsDialog
      workspace={currentWorkspace}
      open={settingsOpen}
      onOpenChange={setSettingsOpen}
      onSaved={(updated) => {
        setCurrentWorkspace(updated);
        setSettingsOpen(false);
      }}
      onDeleted={() => {
        setSettingsOpen(false);
        router.refresh();
      }}
    />
    </>
  );
}
