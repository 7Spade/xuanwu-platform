"use client";
/**
 * AdminView — system admin panel shell.
 *
 * Source: N/A (target-specific admin panel)
 */

import { ShieldCheck } from "lucide-react";
import { useTranslation } from "@/shared/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";

export function AdminView() {
  const t = useTranslation("zh-TW");

  return (
    <div className="mx-auto max-w-4xl space-y-8 duration-500 animate-in fade-in">
      <div className="flex items-center gap-3">
        <ShieldCheck className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("admin.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(["users", "orgs", "workspaces"] as const).map((section) => (
          <Card
            key={section}
            className="border-border/60 bg-card/80 shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">
                {section}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">—</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
