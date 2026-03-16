"use client";
/**
 * NavTopWorkspaces — Pure UI component for workspace navigation list.
 *
 * Props-based design: accepts workspace data and expansion state.
 * For the orchestrated version with data fetching, see:
 * src/modules/workspace.module/_components/shell/nav-top-workspaces.tsx
 */

import { Layers } from "lucide-react";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/design-system/primitives/ui/sidebar";

export interface Workspace {
  id: string;
  name: string;
}

export interface NavTopWorkspacesProps {
  workspaces: Workspace[];
  slug: string; // dimensionId or account handle for URL
  loading?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  showMoreLabel?: string;
  showLessLabel?: string;
  initialVisible?: number;
  maxVisible?: number;
}

const INITIAL_VISIBLE = 2;
const MAX_VISIBLE = 10;

export function NavTopWorkspaces({
  workspaces,
  slug,
  loading = false,
  expanded = false,
  onExpandedChange,
  showMoreLabel = "Show more",
  showLessLabel = "Show less",
  initialVisible = INITIAL_VISIBLE,
  maxVisible = MAX_VISIBLE,
}: NavTopWorkspacesProps) {
  const capped = workspaces.slice(0, maxVisible);
  const visible = expanded ? capped : capped.slice(0, initialVisible);
  const hasMore = capped.length > initialVisible;

  if (loading || capped.length === 0) {
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
            onClick={() => onExpandedChange?.(!expanded)}
            className="text-muted-foreground"
          >
            <span className="text-xs font-medium">
              {expanded ? showLessLabel : showMoreLabel}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
