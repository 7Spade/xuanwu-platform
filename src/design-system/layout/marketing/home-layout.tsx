"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useAuthState } from "@/shared/directives";
import { RootShell } from "@/design-system/layout/base";
import { clientSignOut } from "@/modules/identity.module/_client-actions";
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
 *   - `MarketingHeader` — sticky top nav with locale toggle + auth CTA
 *
 * Owns the `useLocale` state and `useAuthState` so `page.tsx` only handles
 * routing and page-level content composition.
 *
 * Auth flow:
 *   - Unauthenticated: header shows "Login" button.
 *   - Authenticated:   header shows user avatar + dropdown (Enter Platform / Sign Out).
 */
export function HomeLayout({ children }: HomeLayoutProps) {
  const [locale, setLocale] = useLocale();
  const { user, loading } = useAuthState();
  const router = useRouter();

  async function handleSignOut() {
    const result = await clientSignOut();
    if (result.ok) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <RootShell
      header={
        <MarketingHeader
          locale={locale}
          onLocaleChange={setLocale}
          isAuthenticated={!loading && !!user}
          user={user}
          onSignOut={handleSignOut}
        />
      }
    >
      {children}
    </RootShell>
  );
}
