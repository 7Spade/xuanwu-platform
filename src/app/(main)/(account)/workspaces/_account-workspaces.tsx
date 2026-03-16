"use client";
/**
 * AccountWorkspacesPage — client wrapper for the account-level workspaces view.
 *
 * Derives the namespace slug from the currently active account context
 * (activeAccount → personal account → fallback to account.id) and renders
 * WorkspacesView, which handles its own data fetching via useWorkspaces.
 */

import { Loader2 } from "lucide-react";
import { useCurrentAccount } from "@/modules/account.module";
import { WorkspacesView } from "@/modules/workspace.module/_components/workspaces-view";

export function AccountWorkspacesPage() {
  const { account, activeAccount, loading } = useCurrentAccount();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const effectiveAccount = activeAccount ?? account;
  // Slug is the account handle (org handle or personal handle).
  // Falls back to the Firestore document ID so WorkspaceCard hrefs are always valid.
  const slug = effectiveAccount?.handle ?? effectiveAccount?.id ?? "";
  // Pass the effective account ID as dimensionId so WorkspacesView fetches
  // workspaces for the active org (not always the personal account).
  const dimensionId = effectiveAccount?.id ?? "";

  return <WorkspacesView slug={slug} dimensionId={dimensionId} />;
}
