"use client";
/**
 * WorkspaceSettingsView — general settings for an org/namespace.
 *
 * Source: workspace.slice/core/_components/workspace-settings.tsx
 * Wave 27: wired to real namespace data via useNamespaceBySlug(slug).
 * Shows real slug + workspace count; form inputs populated from Firestore.
 */

import { Settings, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";
import { Input } from "@/design-system/primitives/ui/input";
import { Label } from "@/design-system/primitives/ui/label";
import { Separator } from "@/design-system/primitives/ui/separator";
import { Badge } from "@/design-system/primitives/ui/badge";
import { useTranslation } from "@/shared/i18n";
import { useNamespaceBySlug } from "@/modules/namespace.module/_components/use-namespace-by-slug";

interface WorkspaceSettingsViewProps {
  slug: string;
}

export function WorkspaceSettingsView({ slug }: WorkspaceSettingsViewProps) {
  const t = useTranslation("zh-TW");
  const { namespace, loading } = useNamespaceBySlug(slug);

  return (
    <div className="mx-auto max-w-2xl space-y-8 duration-500 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Settings className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("settings.general.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">@{slug}</p>
        </div>
        {!loading && namespace && (
          <Badge variant="outline" className="ml-auto text-[10px] font-bold uppercase tracking-widest">
            {namespace.ownerType}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Identity */}
          <Card className="border-border/60 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">{t("settings.general.orgName")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider opacity-60">
                  {t("settings.general.orgName")}
                </Label>
                <Input
                  defaultValue={namespace?.slug ?? slug}
                  className="rounded-xl border-border/50"
                  placeholder={t("settings.general.orgName")}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider opacity-60">
                  {t("settings.general.orgSlug")}
                </Label>
                <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2">
                  <span className="text-sm text-muted-foreground">@</span>
                  <Input
                    defaultValue={namespace?.slug ?? slug}
                    className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              {namespace && (
                <p className="text-xs text-muted-foreground">
                  {t("organizations.workspaces")}: {namespace.workspaceCount}
                </p>
              )}

              <div className="flex justify-end border-t border-border/40 pt-4">
                <Button
                  size="sm"
                  className="gap-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                  disabled
                >
                  {t("common.saving")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Danger zone */}
          <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-destructive" />
                <CardTitle className="text-base font-bold text-destructive">
                  {t("settings.general.dangerZone")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs">{t("settings.general.deleteOrgHint")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl text-xs font-bold uppercase tracking-wider"
                disabled
              >
                {t("settings.general.deleteOrg")}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
