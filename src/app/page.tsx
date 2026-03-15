"use client";

import { APP_NAME, APP_VERSION } from "@/shared/constants";
import { formatDate } from "@/shared/utils";
import { useTranslation } from "@/shared/i18n";
import { useLocale, useIsMounted } from "@/shared/directives";
import { HomeLayout } from "@/design-system/layout/marketing";

export default function HomePage() {
  const isMounted = useIsMounted();
  const [locale] = useLocale();
  const t = useTranslation(locale);

  if (!isMounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <HomeLayout>
      <div className="flex min-h-screen flex-col items-center justify-center p-24 pt-20">
        <h1 className="text-4xl font-bold">
          {APP_NAME} <span className="text-sm font-normal">v{APP_VERSION}</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">{t("home.welcome")}</p>
        <p className="mt-2 text-sm text-gray-400">
          {t("home.started")}: {formatDate(new Date())}
        </p>
      </div>
    </HomeLayout>
  );
}


