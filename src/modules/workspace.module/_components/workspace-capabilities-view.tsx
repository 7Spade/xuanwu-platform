"use client";
/**
 * WorkspaceCapabilitiesView — displays the mounted capabilities for a workspace.
 *
 * Source equivalent: workspace.slice/core/_components/workspace-capabilities.tsx
 * Adapted: read-only display using useWorkspace hook + WorkspaceDTO.capabilities.
 * Capability mount/unmount is a write-path operation (future wave).
 *
 * Shows: capability cards (icon + name + description + status badge) → empty state.
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
} from "lucide-react";

import { Badge } from "@/design-system/primitives/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";
import { useTranslation } from "@/shared/i18n";
import type { WorkspaceCapability } from "@/modules/workspace.module/domain.workspace/_value-objects";

import { useWorkspace } from "./use-workspace";

// ---------------------------------------------------------------------------
// Icon registry — maps capability IDs to icons
// ---------------------------------------------------------------------------

function CapabilityIcon({ id }: { id: string }) {
  const size = "size-5";
  switch (id) {
    case "tasks":            return <ListTodo className={size} />;
    case "quality-assurance": return <ShieldCheck className={size} />;
    case "acceptance":       return <Trophy className={size} />;
    case "finance":          return <Landmark className={size} />;
    case "issues":           return <AlertCircle className={size} />;
    case "daily":            return <MessageSquare className={size} />;
    case "schedule":         return <Calendar className={size} />;
    case "document-parser":  return <FileScan className={size} />;
    case "files":            return <FileText className={size} />;
    case "members":          return <Users className={size} />;
    case "audit":            return <Activity className={size} />;
    default:                 return <Layers className={size} />;
  }
}

// ---------------------------------------------------------------------------
// Single capability card
// ---------------------------------------------------------------------------

function CapabilityCard({ cap }: { cap: WorkspaceCapability }) {
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
      </CardFooter>
    </Card>
  );
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
  const { workspace, loading } = useWorkspace(workspaceId);

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
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Box className="size-4 text-muted-foreground" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("workspace.capabilities.mounted")}
        </h3>
      </div>

      {capabilities.length === 0 ? (
        /* Empty state */
        <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-16 text-center">
          <div className="rounded-2xl bg-muted/40 p-4">
            <Box className="size-10 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">
              {t("workspace.capabilities.none")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t("workspace.capabilities.noneHint")}
            </p>
          </div>
        </div>
      ) : (
        /* Capability cards grid */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {capabilities.map((cap) => (
            <CapabilityCard key={cap.id} cap={cap} />
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
    </div>
  );
}
