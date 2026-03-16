"use client";
/**
 * WorkspacesView — grid view of all workspaces for a given namespace/slug.
 *
 * Source: workspace.slice/core/_components/workspaces-view.tsx
 * Adapted: fetches real workspace data using useWorkspaces + useCurrentAccount
 * instead of relying on server-side props. This follows the source pattern
 * (client-side subscription) and avoids needing Admin SDK for SSR auth.
 */

import { Terminal, LayoutGrid, List, Search, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useTranslation } from "@/shared/i18n";
import { Button } from "@/design-system/primitives/ui/button";
import { Input } from "@/design-system/primitives/ui/input";
import { useCurrentAccount } from "@/modules/account.module";
import type { WorkspaceDTO } from "@/modules/workspace.module";

import { useWorkspaces } from "./use-workspaces";
import { WorkspaceCard } from "./workspace-card";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

interface WorkspacesViewProps {
  /** The namespace slug, e.g. "my-org". Used to build workspace hrefs. */
  slug: string;
  /**
   * The account (dimension) ID whose workspaces to fetch.
   * When omitted, defaults to the currently active account (org or personal).
   * Pass this explicitly from AccountWorkspacesPage to respect the active
   * account context rather than always falling back to the personal account.
   */
  dimensionId?: string;
}

function filterWorkspaces(workspaces: WorkspaceDTO[], query: string): WorkspaceDTO[] {
  if (!query.trim()) return workspaces;
  const q = query.toLowerCase();
  return workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.slug?.toLowerCase().includes(q)
  );
}

export function WorkspacesView({ slug, dimensionId }: WorkspacesViewProps) {
  const t = useTranslation("zh-TW");
  const { account, activeAccount } = useCurrentAccount();
  // Use the explicitly provided dimensionId, or fall back to the active account
  // (org or personal), so switching accounts immediately shows the right workspaces.
  const effectiveDimensionId = dimensionId ?? activeAccount?.id ?? account?.id ?? null;
  const { workspaces, loading, error, refresh } = useWorkspaces(effectiveDimensionId);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = filterWorkspaces(workspaces, searchQuery);

  // Error banner
  if (error) {
    return (
      <div className="mx-auto max-w-7xl rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 duration-500 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("workspaces.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("workspaces.description").replace("{name}", slug)}
          </p>
        </div>
        <Button
          className="h-10 gap-2 px-4 text-[11px] font-bold uppercase tracking-widest shadow-sm"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">{t("workspaces.createSpace")}</span>
        </Button>
      </div>

      {/* Search + view toggle */}
      <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-3 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("workspaces.searchPlaceholder")}
            className="h-10 rounded-xl border-border/40 bg-background pl-10 focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center rounded-lg border border-border/60 bg-background p-1 shadow-sm">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="size-8 p-0"
            onClick={() => setViewMode("grid")}
            aria-label={t("common.gridView")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="size-8 p-0"
            onClick={() => setViewMode("list")}
            aria-label={t("common.listView")}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Grid or empty state */}
      {!loading && filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-16 text-center sm:p-24">
          <Terminal className="mx-auto mb-6 size-12 text-muted-foreground opacity-10 sm:size-16" />
          <h3 className="mb-2 text-2xl font-bold">{t("workspaces.spaceVoid")}</h3>
          <p className="mx-auto mb-8 max-w-sm text-sm text-muted-foreground">
            {t("workspaces.noSpacesFound")}
          </p>
          <Button
            size="lg"
            className="rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-lg"
            onClick={() => setCreateOpen(true)}
          >
            {t("workspaces.createInitialSpace")}
          </Button>
        </div>
      ) : !loading && viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} slug={slug} />
          ))}
        </div>
      ) : !loading ? (
        <div className="divide-y divide-border/40 rounded-2xl border border-border/60 bg-card/50 shadow-sm">
          {filtered.map((workspace) => (
            <div
              key={workspace.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{workspace.name}</p>
                {workspace.slug && (
                  <p className="truncate text-xs text-muted-foreground">
                    /{workspace.slug}
                  </p>
                )}
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/${slug}/${workspace.id}/wbs`}>{t("common.open")}</Link>
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {account && (
        <CreateWorkspaceDialog
          dimensionId={account.id}
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={() => { refresh(); }}
        />
      )}
    </div>
  );
}
