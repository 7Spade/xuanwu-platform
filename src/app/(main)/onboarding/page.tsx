import type { Metadata } from "next";
import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { useTranslation } from "@/shared/i18n";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system/primitives/ui/card";

export const metadata: Metadata = {
  title: "開始使用 — 玄武平台",
};

export default function OnboardingPage() {
  const t = useTranslation("zh-TW");

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 duration-700 animate-in fade-in slide-in-from-bottom-4">
        {/* Logo / icon */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10">
            <Layers className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t("onboarding.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("onboarding.subtitle")}</p>
        </div>

        {/* Step cards */}
        <div className="space-y-3">
          <Card className="border-border/60 bg-card/80 shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  1
                </span>
                <CardTitle className="text-sm font-bold">{t("onboarding.step1")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <CardDescription className="text-xs">
                {t("profile.pageDescription")}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            asChild
            size="lg"
            className="w-full gap-2 rounded-2xl font-bold uppercase tracking-widest shadow-md"
          >
            <Link href="/profile">
              {t("onboarding.getStarted")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
            <Link href="/">{t("onboarding.skip")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
