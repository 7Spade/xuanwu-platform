"use client";
/**
 * NavTopWorkspaces — sidebar section listing the top workspaces (up to 10)
 * for the currently active account.
 *
 * Behaviour:
 *  - Shows the first 2 workspaces immediately.
 *  - Workspaces 3–10 are revealed when the user clicks "Show more".
 *  - Clicking any workspace navigates to its WBS view.
 *  - A loading skeleton is shown while workspaces are fetching.
 */

import { Layers, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useTranslation } from "@/shared/i18n";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/design-system/primitives/ui/sidebar";
import { useCurrentAccount } from "@/modules/account.module/_components/account-provider";

import { useWorkspaces } from "../use-workspaces";

const INITIAL_VISIBLE = 2;
const MAX_VISIBLE = 10;

export function NavTopWorkspaces() {
  const t = useTranslation("zh-TW");
  const { account, activeAccount } = useCurrentAccount();

  const dimensionId = activeAccount?.id ?? account?.id ?? null;
  const slug = (activeAccount?.handle ?? account?.handle ?? dimensionId) ?? "";

  const { workspaces, loading } = useWorkspaces(dimensionId);
  const [expanded, setExpanded] = useState(false);

  const capped = workspaces.slice(0, MAX_VISIBLE);
  const visible = expanded ? capped : capped.slice(0, INITIAL_VISIBLE);
  const hasMore = capped.length > INITIAL_VISIBLE;

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        <span className="truncate">{t("nav.topWorkspaces")}</span>
      </div>
    );
  }

  if (capped.length === 0) {
    return null;
  }

  return (
    <SidebarMenu>
      {visible.map((ws) => (
        <SidebarMenuItem key={ws.id}>
          <SidebarMenuButton asChild>
            <Link href={`/${slug}/${ws.id}/wbs`}>
              <Layers />
              <span className="truncate">{ws.name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

      {hasMore && (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setExpanded((v) => !v)}
            className="text-muted-foreground"
          >
            <span className="text-xs font-medium">
              {expanded ? t("nav.showLess") : t("nav.showMore")}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
