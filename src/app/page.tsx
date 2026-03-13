import { APP_NAME, APP_VERSION } from "@/shared/constants";
import { formatDate } from "@/shared/utils";
import { useTranslation } from "@/shared/i18n";

export default function HomePage() {
  const t = useTranslation("zh-TW");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">
        {APP_NAME} <span className="text-sm font-normal">v{APP_VERSION}</span>
      </h1>
      <p className="mt-4 text-lg text-gray-600">{t("home.welcome")}</p>
      <p className="mt-2 text-sm text-gray-400">
        {t("home.started")}: {formatDate(new Date())}
      </p>
    </main>
  );
}
