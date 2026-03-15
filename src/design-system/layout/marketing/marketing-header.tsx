"use client";

import Link from "next/link";
import { useTranslation } from "@/shared/i18n";
import type { Locale } from "@/shared/types";
import { APP_NAME } from "@/shared/constants";

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
 *   - Language toggle + Login CTA (right)
 */
export function MarketingHeader({ locale, onLocaleChange }: MarketingHeaderProps) {
  const t = useTranslation(locale);

  function toggleLocale() {
    const next: Locale = locale === "zh-TW" ? "en" : "zh-TW";
    onLocaleChange(next);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-white/80 px-6 backdrop-blur">
      <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleLocale}
          aria-label={t("home.langToggle")}
          title={t("home.langToggle")}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          <span aria-hidden>🌐</span>
          {locale === "zh-TW" ? t("home.langEn") : t("home.langZhTW")}
        </button>
        <Link
          href="/login?callbackUrl=/"
          className="inline-flex items-center rounded-md bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          {t("home.login")}
        </Link>
      </div>
    </header>
  );
}
