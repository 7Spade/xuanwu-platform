"use client";
/**
 * InviteView — invitation acceptance page.
 *
 * Source: organization.slice/gov.members/_components/ (invite flows)
 * Adapted: shows invite token info + accept/decline buttons.
 */

import { Mail, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";
import { useTranslation } from "@/shared/i18n";

interface InviteViewProps {
  token: string;
}

export function InviteView({ token }: InviteViewProps) {
  const t = useTranslation("zh-TW");
  // token will be used for actual invite lookup in a future wave

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-md duration-700 animate-in fade-in slide-in-from-bottom-4">
        <Card className="border-border/60 bg-card/80 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-3xl bg-primary/10">
              <Mail className="size-7 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">{t("invite.title")}</CardTitle>
            <CardDescription className="text-sm">{t("invite.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Token info placeholder */}
            <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-center">
              <p className="text-xs font-bold uppercase tracking-wider opacity-50">Token</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground truncate">{token}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 gap-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                disabled
              >
                <XCircle className="size-4" />
                {t("invite.decline")}
              </Button>
              <Button
                className="flex-1 gap-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
                disabled
              >
                <CheckCircle className="size-4" />
                {t("invite.accept")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
