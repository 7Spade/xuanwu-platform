import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Layers, UserCircle, ArrowRight } from "lucide-react";
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

  const steps = [
    {
      num: 1,
      icon: UserCircle,
      title: t("onboarding.step1"),
      desc: t("onboarding.step1Desc"),
      href: "/profile",
      cta: t("onboarding.getStarted"),
    },
    {
      num: 2,
      icon: Building2,
      title: t("onboarding.step2"),
      desc: t("onboarding.step2Desc"),
      href: "/organizations",
      cta: t("onboarding.createOrg"),
    },
    {
      num: 3,
      icon: Layers,
      title: t("onboarding.step3"),
      desc: t("onboarding.step3Desc"),
      href: "/workspaces",
      cta: t("nav.workspaces"),
    },
  ] as const;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8 duration-700 animate-in fade-in slide-in-from-bottom-4">
        {/* Logo / icon */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="select-none text-5xl">🐢</div>
          <h1 className="text-2xl font-bold tracking-tight">{t("onboarding.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("onboarding.subtitle")}</p>
        </div>

        {/* Step cards */}
        <div className="space-y-3">
          {steps.map(({ num, icon: Icon, title, desc, href, cta }) => (
            <Card
              key={num}
              className="border-border/60 bg-card/80 shadow-sm transition-colors hover:border-primary/30 hover:bg-card"
            >
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    {num}
                  </span>
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <CardTitle className="text-sm font-bold">{title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <CardDescription className="mb-3 text-xs">{desc}</CardDescription>
                <Button asChild size="sm" variant="outline" className="h-8 rounded-xl text-xs">
                  <Link href={href}>
                    {cta}
                    <ArrowRight className="ml-1.5 size-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skip */}
        <div className="flex justify-center">
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
            <Link href="/">{t("onboarding.skip")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
