"use client";
/**
 * BillingView — current plan + upgrade CTA.
 *
 * Source: finance.slice/_components/
 * Wave 27: wired to real namespace data via useNamespaceBySlug(slug).
 * Shows real workspace usage (workspaceCount / 5 free tier).
 */

import { CreditCard, Zap, Loader2 } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";
import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import { useNamespaceBySlug } from "@/modules/namespace.module/_components/use-namespace-by-slug";

const FREE_TIER_LIMIT = 5;

interface BillingViewProps {
  slug: string;
}

export function BillingView({ slug }: BillingViewProps) {
  const t = useTranslation("zh-TW");
  const { namespace, loading } = useNamespaceBySlug(slug);

  const used = namespace?.workspaceCount ?? 0;
  const usagePct = FREE_TIER_LIMIT > 0 ? Math.min(Math.round((used / FREE_TIER_LIMIT) * 100), 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center gap-3">
        <CreditCard className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("settings.billing.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">@{slug}</p>
        </div>
      </div>

      {/* Current plan */}
      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">{t("settings.billing.currentPlan")}</CardTitle>
            <Badge variant="secondary" className="rounded-full text-xs font-bold uppercase tracking-widest">
              {t("settings.billing.freePlan")}
            </Badge>
          </div>
          <CardDescription className="text-xs">{t("settings.billing.usage")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {used} / {FREE_TIER_LIMIT} {t("organizations.workspaces").toLowerCase()}
                </span>
                <span>{usagePct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-border/40 pt-4">
            <Button
              size="sm"
              className="gap-2 rounded-xl text-xs font-bold uppercase tracking-wider"
              disabled
            >
              <Zap className="size-3.5" />
              {t("settings.billing.upgrade")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
