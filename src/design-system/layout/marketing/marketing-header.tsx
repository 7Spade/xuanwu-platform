"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { useTranslation } from "@/shared/i18n";
import type { Locale } from "@/shared/types";
import { APP_NAME } from "@/shared/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/design-system/primitives/ui/dropdown-menu";
import { Button } from "@/design-system/primitives/ui/button";
import { ModeToggle } from "./mode-toggle";

export interface MarketingHeaderProps {
  /** Active locale — controlled by the parent page. */
  locale: Locale;
  /** Called when the user requests a locale change. */
  onLocaleChange: (locale: Locale) => void;
}

/**
 * MarketingHeader — sticky top navigation for marketing / landing pages.
 *
 * Presentational: receives locale via props and delegates persistence to
 * the parent (typically via the `useLocale` directive from
 * `@/shared/directives`).
 *
 * Slots:
 *   - App name / brand (left)
 *   - Language dropdown + theme toggle + Login CTA (right)
 */
export function MarketingHeader({ locale, onLocaleChange }: MarketingHeaderProps) {
  const t = useTranslation(locale);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
      <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
      <div className="flex items-center gap-2">
        {/* Language selector dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label={t("home.langToggle")}
              className="gap-1.5 text-xs"
            >
              <Globe className="size-3.5" />
              {locale === "zh-TW" ? t("home.langZhTW") : t("home.langEn")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onLocaleChange("zh-TW")}>
              {t("home.langZhTW")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLocaleChange("en")}>
              {t("home.langEn")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dark / light / system theme toggle */}
        <ModeToggle locale={locale} />

        {/* Login CTA */}
        <Link
          href="/login?callbackUrl=/"
          className="inline-flex items-center rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("home.login")}
        </Link>
      </div>
    </header>
  );
}
