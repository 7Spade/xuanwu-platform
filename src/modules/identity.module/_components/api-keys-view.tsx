"use client";
/**
 * ApiKeysView — API key list with real Firestore data (Wave 28).
 *
 * Source: identity.slice/_components/api-keys*
 * Pattern: useApiKeys(slug) → loading spinner → key list → empty state
 * Key generation remains disabled (write-side wave 29+).
 */

import { Key, Plus, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/design-system/primitives/ui/badge";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";
import { useTranslation } from "@/shared/i18n";
import { useApiKeys } from "./use-api-keys";
import type { ApiKeyDTO } from "../core/_use-cases";

interface ApiKeysViewProps {
  slug: string;
}

function keyStatusBadge(key: ApiKeyDTO, now: string, t: ReturnType<typeof useTranslation>) {
  if (!key.isActive) {
    return (
      <Badge variant="secondary" className="text-xs opacity-70">
        {t("settings.apiKeys.status.revoked")}
      </Badge>
    );
  }
  if (key.expiresAt && key.expiresAt < now) {
    return (
      <Badge variant="destructive" className="text-xs">
        {t("settings.apiKeys.status.expired")}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-green-500/40 text-xs text-green-600 dark:text-green-400">
      {t("settings.apiKeys.status.active")}
    </Badge>
  );
}

export function ApiKeysView({ slug }: ApiKeysViewProps) {
  const t = useTranslation("zh-TW");
  const { apiKeys, loading, error } = useApiKeys(slug);
  const now = new Date().toISOString();

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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground opacity-40" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : apiKeys.length === 0 ? (
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
          ) : (
            <div className="divide-y divide-border/40">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{key.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      …{key.keyPreview}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {keyStatusBadge(key, now, t)}
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>
                        {t("settings.apiKeys.created")}:{" "}
                        {new Date(key.createdAt).toLocaleDateString()}
                      </span>
                      {key.lastUsedAt && (
                        <span>
                          {t("settings.apiKeys.lastUsed")}:{" "}
                          {new Date(key.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
