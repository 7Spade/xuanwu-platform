"use client";

import { useEffect, useState } from "react";
import { APP_NAME, APP_VERSION } from "@/shared/constants";
import { formatDate } from "@/shared/utils";
import { resolveLocale, useTranslation } from "@/shared/i18n";
import type { Locale } from "@/shared/types";
import { HomeHeader, LOCALE_STORAGE_KEY } from "./_components/home-header";

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("zh-TW");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const resolved = resolveLocale(stored);
    setLocale(resolved);
    document.documentElement.lang = resolved;
    setMounted(true);
  }, []);

  const t = useTranslation(locale);

  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <>
      <HomeHeader locale={locale} onLocaleChange={setLocale} />
      <main className="flex min-h-screen flex-col items-center justify-center p-24 pt-20">
        <h1 className="text-4xl font-bold">
          {APP_NAME} <span className="text-sm font-normal">v{APP_VERSION}</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">{t("home.welcome")}</p>
        <p className="mt-2 text-sm text-gray-400">
          {t("home.started")}: {formatDate(new Date())}
        </p>
      </main>
    </>
  );
}


