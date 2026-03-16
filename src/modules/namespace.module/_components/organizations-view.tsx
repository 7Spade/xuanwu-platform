"use client";
/**
 * OrganizationsView — lists the current user's organizations with a
 * create-org CTA that opens an inline dialog.
 *
 * DDD chain:
 *   Presentation (this view)
 *     ← Application context: organizations[] via AccountProvider
 *     → CreateOrgDialog (Presentation) → Application use cases (create account + namespace)
 *
 * Data source fixed: uses organizations[] from AccountProvider context
 * (AccountDTO[]) instead of namespace lookup by personal account ID.
 */

import { useState } from "react";
import { Building2, Plus, Loader2 } from "lucide-react";

import { Button } from "@/design-system/primitives/ui/button";
import { useTranslation } from "@/shared/i18n";
import { useCurrentAccount } from "@/modules/account.module";
import type { AccountDTO } from "@/modules/account.module";

import { OrgCard } from "./org-card";
import { CreateOrgDialog } from "./create-org-dialog";

export function OrganizationsView() {
  const t = useTranslation("zh-TW");
  const { loading: authLoading, orgsLoading, organizations, refreshOrganizations } =
    useCurrentAccount();

  const loading = authLoading || orgsLoading;
  const [createOpen, setCreateOpen] = useState(false);

  const handleOrgCreated = async (_org: AccountDTO) => {
    // Re-fetch the org list from Firestore so the new card appears immediately.
    await refreshOrganizations();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("organizations.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("organizations.subtitle")}</p>
          </div>
        </div>
        <Button
          className="gap-2 px-4 text-[11px] font-bold uppercase tracking-widest"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          {t("organizations.createOrg")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : organizations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-16 text-center">
          <Building2 className="mb-4 size-12 text-muted-foreground opacity-10" />
          <h3 className="text-lg font-bold">{t("organizations.noOrgs")}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t("organizations.noOrgsHint")}
          </p>
          <Button
            size="lg"
            className="mt-8 rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-lg"
            onClick={() => setCreateOpen(true)}
          >
            {t("organizations.createOrg")}
          </Button>
        </div>
      )}

      <CreateOrgDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleOrgCreated}
      />
    </div>
  );
}

