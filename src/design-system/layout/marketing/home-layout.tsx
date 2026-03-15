"use client";

import type { ReactNode } from "react";
import { useLocale, useAuthState } from "@/shared/directives";
import { RootShell } from "@/design-system/layout/base";
import { MarketingHeader } from "./marketing-header";

interface HomeLayoutProps {
  /** Page body content (rendered inside RootShell main area). */
  children: ReactNode;
}

/**
 * HomeLayout — page-specific layout for the marketing homepage (`/`).
 *
 * Composes:
 *   - `RootShell`       — structural chrome (base/)
 *   - `MarketingHeader` — sticky top nav with locale toggle + login CTA
 *
 * Owns the `useLocale` state so `page.tsx` only handles routing and
 * page-level content composition. The children receive the translated
 * locale indirectly via the header; if `page.tsx` also needs `locale`
 * (e.g. for `useTranslation`), use the `useLocale` directive directly.
 */
export function HomeLayout({ children }: HomeLayoutProps) {
  const [locale, setLocale] = useLocale();
  const { user, loading } = useAuthState();

  return (
    <RootShell
      header={
        <MarketingHeader
          locale={locale}
          onLocaleChange={setLocale}
          isAuthenticated={!loading && !!user}
        />
      }
    >
      {children}
    </RootShell>
  );
}
