"use client";

import Link from "next/link";
import { Globe, LayoutDashboard, LogOut } from "lucide-react";
import { useTranslation } from "@/shared/i18n";
import type { Locale } from "@/shared/types";
import { APP_NAME } from "@/shared/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/primitives/ui/dropdown-menu";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/design-system/primitives/ui/avatar";
import { ModeToggle } from "./mode-toggle";

/** Slim user info needed by the header (avoids importing Firebase Auth types). */
export interface HeaderUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface MarketingHeaderProps {
  /** Active locale — controlled by the parent page. */
  locale: Locale;
  /** Called when the user requests a locale change. */
  onLocaleChange: (locale: Locale) => void;
  /**
   * Whether the current visitor is authenticated.
   * When `true`, the Login CTA is replaced with a user avatar + dropdown.
   * Defaults to `false` (unauthenticated view) so SSR / loading states are safe.
   */
  isAuthenticated?: boolean;
  /** Firebase user info used to render the avatar. Required when `isAuthenticated` is `true`. */
  user?: HeaderUser | null;
  /** Called when the user chooses "Sign Out" from the avatar dropdown. */
  onSignOut?: () => void;
}

/** Derives 1–2 uppercase initials from displayName, then email, then "?". */
function getInitials(displayName: string | null, email: string | null): string {
  if (displayName) {
    return displayName
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "?";
}

/**
 * MarketingHeader — sticky top navigation for marketing / landing pages.
 *
 * Presentational: receives locale via props and delegates persistence to
 * the parent (typically via the `useLocale` directive from
 * `@/shared/directives`).
 *
 * Auth states:
 *   - Unauthenticated: shows a "Login" CTA button.
 *   - Authenticated:   shows a user avatar that opens a dropdown with
 *                      "Enter Platform" and "Sign Out" actions.
 *
 * Slots:
 *   - App name / brand (left)
 *   - Language dropdown + theme toggle + auth CTA (right)
 */
export function MarketingHeader({
  locale,
  onLocaleChange,
  isAuthenticated = false,
  user,
  onSignOut,
}: MarketingHeaderProps) {
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

        {/* Auth CTA: avatar + dropdown when signed in, "Login" button otherwise */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={user?.displayName ?? user?.email ?? "User menu"}
                className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar size="sm">
                  {user?.photoURL && (
                    <AvatarImage
                      src={user.photoURL}
                      alt={user.displayName ?? ""}
                    />
                  )}
                  <AvatarFallback>
                    {getInitials(user?.displayName ?? null, user?.email ?? null)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem asChild>
                <Link
                  href="/onboarding"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <LayoutDashboard className="size-4" />
                  {t("home.enterPlatform")}
                </Link>
              </DropdownMenuItem>
              {onSignOut && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onSignOut}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-4" />
                    {t("home.signOut")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm">
            <Link href="/login?callbackUrl=/">{t("home.login")}</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
