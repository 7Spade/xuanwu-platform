"use client";
/**
 * OrganizationsView — list of user's organizations with create CTA.
 *
 * Source: organization.slice/core/_components/
 * Wave 23: wired to real Firestore data via useCurrentAccount + useNamespace.
 * Shows the user's namespace (org card) when it exists; empty state otherwise.
 */

import { Building2, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/design-system/primitives/ui/button";
import { useTranslation } from "@/shared/i18n";
import { useCurrentAccount } from "@/modules/account.module/_components/account-provider";
import { useNamespace } from "./use-namespace";
import { OrgCard } from "./org-card";

export function OrganizationsView() {
  const t = useTranslation("zh-TW");
  const { account, loading: authLoading } = useCurrentAccount();
  const { namespace, loading: nsLoading } = useNamespace(account?.id);

  const loading = authLoading || nsLoading;

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
          asChild
          className="gap-2 px-4 text-[11px] font-bold uppercase tracking-widest"
        >
          <Link href="/onboarding">
            <Plus className="size-4" />
            {t("organizations.createOrg")}
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : namespace ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OrgCard namespace={namespace} />
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
            asChild
            size="lg"
            className="mt-8 rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-lg"
          >
            <Link href="/onboarding">{t("organizations.createOrg")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

