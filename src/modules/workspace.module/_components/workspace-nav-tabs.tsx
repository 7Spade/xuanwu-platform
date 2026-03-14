"use client";
/**
 * WorkspaceNavTabs — horizontal capability tab navigation for workspace pages.
 *
 * Source equivalent: workspace.slice/core/_components/workspace-nav-tabs.tsx
 * Adapted: uses platform URL structure (/${slug}/${workspaceId}/<cap>),
 * presents the capabilities we have live routes for, and falls back gracefully
 * when workspace data is still loading.
 *
 * Tab order mirrors the source (Core → Governance → Business → Projection):
 *   WBS (tasks) → Editor (document-parser) → Audit (projection)
 */

import { usePathname } from "next/navigation";
import Link from "next/link";

import { useTranslation } from "@/shared/i18n";

// ---------------------------------------------------------------------------
// Tab definitions  — ordered: business → projection
// ---------------------------------------------------------------------------

interface TabDef {
  /** URL segment that identifies this tab (last segment of the path). */
  id: string;
  /** i18n key */
  labelKey: string;
}

const WORKSPACE_TABS: TabDef[] = [
  { id: "wbs",          labelKey: "workspace.nav.wbs" },
  { id: "capabilities", labelKey: "workspace.nav.capabilities" },
  { id: "editor",       labelKey: "workspace.nav.editor" },
  { id: "audit",        labelKey: "workspace.nav.audit" },
];

interface WorkspaceNavTabsProps {
  slug: string;
  workspaceId: string;
}

export function WorkspaceNavTabs({ slug, workspaceId }: WorkspaceNavTabsProps) {
  const t = useTranslation("zh-TW");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("workspace.nav.ariaLabel")}
      className="no-scrollbar flex w-full gap-1 overflow-x-auto rounded-2xl bg-background/55 p-1.5 shadow-sm ring-1 ring-border/55 backdrop-blur-md"
    >
      {WORKSPACE_TABS.map(({ id, labelKey }) => {
        // Match if the current path ends in this segment (covers nested routes).
        const isActive =
          pathname === `/${slug}/${workspaceId}/${id}` ||
          pathname.startsWith(`/${slug}/${workspaceId}/${id}/`);

        return (
          <Link
            key={id}
            href={`/${slug}/${workspaceId}/${id}`}
            className={[
              "inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-xl",
              "px-3.5 text-[10px] font-semibold uppercase tracking-tight",
              "ring-offset-2 ring-offset-background transition-all duration-200 ease-out",
              "active:scale-[0.98] sm:h-9 sm:min-h-0",
              isActive
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/70"
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground hover:ring-1 hover:ring-border/60",
            ].join(" ")}
          >
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
