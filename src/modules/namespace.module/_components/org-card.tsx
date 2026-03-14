"use client";
/**
 * OrgCard — displays an organization/namespace summary card.
 *
 * Source equivalent: organization.slice/core/_components/org-card.tsx
 * Adapted: uses FirestoreNamespaceRepository DTO, design-system primitives, i18n.
 */

import { Building2, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/shared/i18n";
import { Badge } from "@/design-system/primitives/ui/badge";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/design-system/primitives/ui/card";
import type { NamespaceDTO } from "@/modules/namespace.module/core/_use-cases";

interface OrgCardProps {
  namespace: NamespaceDTO;
}

export function OrgCard({ namespace }: OrgCardProps) {
  const t = useTranslation("zh-TW");
  const href = `/${namespace.slug}`;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-border/60 bg-card/80 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="flex h-24 w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <Building2 className="size-10 text-primary/30" />
      </div>

      <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight tracking-tight">
            {namespace.slug}
          </h3>
          <p className="mt-0.5 truncate text-[10px] font-mono text-muted-foreground/60">
            /{namespace.slug}
          </p>
        </div>
        <Badge
          variant="outline"
          className="h-5 shrink-0 px-2 text-[10px] font-bold uppercase tracking-wider"
        >
          {namespace.ownerType}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-3 px-4 pb-4 pt-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Layers className="size-3" />
          <span>
            {namespace.workspaceCount}&nbsp;{t("organizations.workspaces")}
          </span>
        </div>

        <div className="flex items-center justify-end">
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
