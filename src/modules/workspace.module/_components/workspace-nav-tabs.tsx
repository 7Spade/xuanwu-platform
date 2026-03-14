"use client";
/**
 * WorkspaceNavTabs — horizontal capability tab navigation for workspace pages.
 *
 * Source equivalent: workspace.slice/core/_components/workspace-nav-tabs.tsx
 *
 * Tab order matches the source layer model:
 *   Core (capabilities) → Governance (members) → Business (mounted caps) → Projection (audit)
 *
 * Business tabs are derived dynamically from workspace.capabilities.
 * Permanent Core + Projection tabs are always rendered.
 */

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useTranslation } from "@/shared/i18n";
import type { WorkspaceCapability } from "@/modules/workspace.module/domain.workspace/_value-objects";

// ---------------------------------------------------------------------------
// Capability registry  — known cap IDs → i18n keys (or fallback label)
// ---------------------------------------------------------------------------

const CAPABILITY_LABEL_KEY: Record<string, string> = {
  // Core
  capabilities:        "workspace.nav.capabilities",
  // Governance
  members:             "workspace.nav.members",
  // Business
  wbs:                 "workspace.nav.wbs",
  tasks:               "workspace.nav.wbs",
  "quality-assurance": "workspace.nav.qa",
  acceptance:          "workspace.nav.acceptance",
  finance:             "workspace.nav.finance",
  issues:              "workspace.nav.issues",
  files:               "workspace.nav.files",
  daily:               "workspace.nav.daily",
  schedule:            "workspace.nav.schedule",
  "document-parser":   "workspace.nav.editor",
  editor:              "workspace.nav.editor",
  // Projection
  audit:               "workspace.nav.audit",
};

// IDs that are permanently shown (never in the dynamic business layer)
const PERMANENT_IDS = new Set(["capabilities", "members", "audit"]);

interface Tab {
  id: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Tab builder
// ---------------------------------------------------------------------------

function buildTabs(
  t: (key: string) => string,
  capabilities: readonly WorkspaceCapability[] | undefined,
): Tab[] {
  // Layer 1 — Core (always present)
  const core: Tab[] = [{ id: "capabilities", label: t("workspace.nav.capabilities") }];

  // Layer 2 — Governance (always shown — all workspaces in [slug] are org workspaces)
  const governance: Tab[] = [{ id: "members", label: t("workspace.nav.members") }];

  // Layer 3 — Business (from mounted capabilities, excluding permanent layers)
  const business: Tab[] = (capabilities ?? [])
    .filter((c) => !PERMANENT_IDS.has(c.id))
    .map((c) => {
      const labelKey = CAPABILITY_LABEL_KEY[c.id];
      return { id: c.id, label: labelKey ? t(labelKey) : c.name };
    });

  // Layer 4 — Projection (always present)
  const projection: Tab[] = [{ id: "audit", label: t("workspace.nav.audit") }];

  return [...core, ...governance, ...business, ...projection];
}

// ---------------------------------------------------------------------------
// Props + component
// ---------------------------------------------------------------------------

interface WorkspaceNavTabsProps {
  slug: string;
  workspaceId: string;
  /** Live capabilities from Firestore (passed in from WorkspaceShell). */
  capabilities?: readonly WorkspaceCapability[];
}

export function WorkspaceNavTabs({
  slug,
  workspaceId,
  capabilities,
}: WorkspaceNavTabsProps) {
  const t = useTranslation("zh-TW");
  const pathname = usePathname();

  const tabs = useMemo(
    () => buildTabs(t, capabilities),
    // capabilities is the only dynamic value; t is a stable hook reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capabilities],
  );

  return (
    <nav
      aria-label={t("workspace.nav.ariaLabel")}
      className="no-scrollbar flex w-full gap-1 overflow-x-auto rounded-2xl bg-background/55 p-1.5 shadow-sm ring-1 ring-border/55 backdrop-blur-md"
    >
      {tabs.map(({ id, label }) => {
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
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

