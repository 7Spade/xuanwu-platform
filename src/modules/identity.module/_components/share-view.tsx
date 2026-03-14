"use client";
/**
 * ShareView — shared content viewer page.
 *
 * Source: portal.slice/_components/ (share flows)
 * Adapted: shows share ID + content placeholder.
 */

import { Link2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";
import { useTranslation } from "@/shared/i18n";

interface ShareViewProps {
  shareId: string;
}

export function ShareView({ shareId }: ShareViewProps) {
  const t = useTranslation("zh-TW");

  // Will be replaced with real content lookup when share queries are implemented
  const isValid = shareId && shareId.length > 0;

  if (!isValid) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="size-6" />
          <p className="font-bold">{t("share.expired")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl duration-700 animate-in fade-in slide-in-from-bottom-4">
        <Card className="border-border/60 bg-card/80 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="size-5 text-primary" />
              <CardTitle className="text-lg font-bold">{t("share.title")}</CardTitle>
            </div>
            <CardDescription className="text-xs">{t("share.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider opacity-50">Share ID</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground truncate">{shareId}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
