"use client";

import Link from "next/link";
import { useTranslation } from "@/shared/i18n";
import type { Locale } from "@/shared/types";
import { APP_NAME } from "@/shared/constants";

interface HomeHeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function HomeHeader({ locale, onLocaleChange }: HomeHeaderProps) {
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
          href="/login"
          className="inline-flex items-center rounded-md bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          {t("home.login")}
        </Link>
      </div>
    </header>
  );
}
