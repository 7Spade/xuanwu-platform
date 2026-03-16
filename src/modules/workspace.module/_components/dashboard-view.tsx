"use client";
/**
 * DashboardView — the main account dashboard overview page.
 *
 * Source equivalent: workspace.slice/core/_components/dashboard-view.tsx
 * Adapted: removes app-runtime deps (useApp, useAuth), uses platform patterns:
 *   - useCurrentAccount() from account-provider
 *   - useWorkspaces(dimensionId) for workspace list
 *   - useResourceAuditLog(accountId) for audit trail (org context only)
 *
 * Shows:
 *   - Account name / workspace node count / role badge (org context)
 *   - Personal dimension placeholder (personal context)
 *   - WorkspacesView embedded inline (simplified grid)
 *   - AuditLogView panel (org context only)
 */

import { User as UserIcon, Loader2 } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/shared/i18n";
import { Badge } from "@/design-system/primitives/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system/primitives/ui/card";
import { useCurrentAccount } from "@/modules/account.module";
import type { AccountDTO } from "@/modules/account.module/core/_use-cases";
import { AuditLogView } from "@/modules/audit.module/_components/audit-log-view";
import { useResourceAuditLog } from "@/modules/audit.module/_components/use-audit-log";

import { useWorkspaces } from "./use-workspaces";
import { WorkspaceCard } from "./workspace-card";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveRole(account: AccountDTO | null, userId: string | undefined): string {
  if (!account || !userId) return "Guest";
  if (account.ownerId === userId) return "Owner";
  // TODO: look up the caller's membership role when MembershipDTO is available
  // on AccountDTO. For now fall back to "Member" for non-owners.
  return "Member";
}

// ---------------------------------------------------------------------------
// Dashboard inner (loaded)
// ---------------------------------------------------------------------------

interface DashboardInnerProps {
  account: AccountDTO;
  userId: string;
}

function DashboardInner({ account, userId }: DashboardInnerProps) {
  const t = useTranslation("zh-TW");

  const isOrg = account.accountType === "organization";
  const role = resolveRole(account, userId);

  const { workspaces, loading: wsLoading } = useWorkspaces(account.id);

  const {
    entries: auditEntries,
    loading: auditLoading,
  } = useResourceAuditLog(isOrg ? account.id : null, 30);

  const slug = account.handle ?? account.id;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20 duration-700 animate-in fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            {account.displayName ?? account.handle ?? t("nav.account")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isOrg
              ? t("dashboard.orgDescription")
              : t("dashboard.personalDescription")}
          </p>
        </div>

        {isOrg && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/50 bg-muted/40 p-3 shadow-sm backdrop-blur-sm sm:gap-6 sm:p-4">
            <div className="border-border/50 px-3 text-center sm:border-r sm:px-4">
              <p className="font-headline text-2xl font-bold">{workspaces.length}</p>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                {t("workspaces.workspaceNodes")}
              </p>
            </div>
            <div className="px-3 text-center sm:px-4">
              <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">
                {t("workspaces.yourRole")}
              </p>
              <Badge className="border-primary/20 bg-primary/10 font-headline text-primary">
                {role}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Personal dimension placeholder */}
      {!isOrg && (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-accent/20 bg-accent/5 px-6 py-10 text-center sm:p-8">
          <UserIcon className="mb-4 size-12 text-accent/50 sm:size-16" />
          <h3 className="font-headline text-xl font-bold">
            {t("workspaces.personalDimension")}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("workspaces.personalDimensionHelp")}
          </p>
        </div>
      )}

      {/* Main grid: workspace list + audit panel */}
      <div
        className={`grid grid-cols-1 gap-8 ${isOrg ? "lg:grid-cols-2" : ""}`}
      >
        {/* Workspace list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {t("workspaces.title")}
            </h2>
            <Link
              href={`/${slug}/workspaces`}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("dashboard.viewAll")}
            </Link>
          </div>

          {wsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : workspaces.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {workspaces.slice(0, 6).map((ws) => (
                <WorkspaceCard key={ws.id} workspace={ws} slug={slug} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border/40 p-10 text-center">
              <p className="text-sm font-bold">{t("workspaces.spaceVoid")}</p>
              <Link
                href={`/${slug}/workspaces`}
                className="text-xs text-primary hover:underline"
              >
                {t("workspaces.createInitialSpace")}
              </Link>
            </div>
          )}
        </div>

        {/* Audit panel — org context only */}
        {isOrg && (
          <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-headline text-xl font-bold tracking-tight">
                {t("audit.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[32rem] overflow-y-auto pr-2">
                <AuditLogView
                  entries={auditEntries}
                  loading={auditLoading}
                  personalContext={false}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * DashboardView — renders the account dashboard.
 * Guards against unauthenticated state and delegates to DashboardInner.
 */
export function DashboardView() {
  const { user, account, loading } = useCurrentAccount();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !account) return null;

  return <DashboardInner account={account} userId={user.uid} />;
}
