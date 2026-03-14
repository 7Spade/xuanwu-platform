"use client";
/**
 * ApiKeysView — API key list table with generate button shell.
 *
 * Source: identity.slice/_components/api-keys*
 * Adapted: table shell with empty state; key generation wired in future wave.
 */

import { Key, Plus } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";
import { useTranslation } from "@/shared/i18n";

interface ApiKeysViewProps {
  slug: string;
}

export function ApiKeysView({ slug }: ApiKeysViewProps) {
  const t = useTranslation("zh-TW");

  return (
    <div className="mx-auto max-w-3xl space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("settings.apiKeys.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">@{slug}</p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-2 text-xs font-bold uppercase tracking-widest"
          disabled
        >
          <Plus className="size-4" />
          {t("settings.apiKeys.generateKey")}
        </Button>
      </div>

      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">
            {t("settings.apiKeys.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Empty state */}
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 px-6 py-12 text-center">
            <Key className="mb-3 size-10 text-muted-foreground opacity-10" />
            <p className="font-bold">{t("settings.apiKeys.noKeys")}</p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-4 gap-2 text-xs font-bold uppercase tracking-wider"
              disabled
            >
              <Plus className="size-3.5" />
              {t("settings.apiKeys.generateKey")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
