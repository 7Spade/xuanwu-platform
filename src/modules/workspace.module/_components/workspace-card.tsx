"use client";
/**
 * WorkspaceCard — displays a workspace summary in the grid.
 *
 * Source: workspace.slice/core/_components/workspace-card.tsx
 * Adapted: removes app-runtime deps, uses platform i18n + design-system
 */

import { Layers, Lock, Globe, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/shared/i18n";
import { Badge } from "@/design-system/primitives/ui/badge";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/design-system/primitives/ui/card";
import type { WorkspaceDTO } from "@/modules/workspace.module";

interface WorkspaceCardProps {
  workspace: WorkspaceDTO;
  slug: string;
}

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
  const href = `/${slug}/${workspace.id}/wbs`;
  const isPrivate = workspace.visibility === "hidden";

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-border/60 bg-card/80 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      {workspace.photoURL ? (
        <div
          className="h-24 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${workspace.photoURL})` }}
        />
      ) : (
        <div className="flex h-24 w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <Layers className="size-10 text-primary/30" />
        </div>
      )}

      <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight tracking-tight">
            {workspace.name}
          </h3>
          {workspace.slug && (
            <p className="mt-0.5 truncate text-[10px] font-mono text-muted-foreground/60">
              /{workspace.slug}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isPrivate ? (
            <Lock className="size-3.5 text-muted-foreground" />
          ) : (
            <Globe className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-3 px-4 pb-4 pt-0">
        <div className="flex items-center gap-2">
          <Badge
            variant={lifecycleVariant(workspace.lifecycleState)}
            className="h-5 px-2 text-[10px] font-bold uppercase tracking-wider"
          >
            {workspace.lifecycleState}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="size-3" />
            <span>
              {new Date(workspace.updatedAt).toLocaleDateString("zh-TW", {
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
  );
}
