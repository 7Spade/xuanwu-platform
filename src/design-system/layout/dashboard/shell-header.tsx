"use client";
/**
 * ShellHeader — Sticky header for authenticated pages.
 * Shows sidebar trigger, breadcrumb navigation, and top-right controls.
 *
 * Aggregates from:
 * - search.module: GlobalSearchDialog component
 * - next/navigation: usePathname → breadcrumb segments
 * - shared/i18n: breadcrumb labels
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { useTranslation } from "@/shared/i18n";
import { Separator } from "@/design-system/primitives/ui/separator";
import { SidebarTrigger } from "@/design-system/primitives/ui/sidebar";
import { Button } from "@/design-system/primitives/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/design-system/primitives/ui/breadcrumb";
import { GlobalSearchDialog } from "@/modules/search.module";

/** Maps a URL segment to its i18n key. Falls back to capitalising the segment. */
const SEGMENT_I18N_KEYS: Record<string, string> = {
  dashboard: "nav.home",
  workspaces: "nav.workspaces",
  onboarding: "onboarding.title",
  profile: "nav.breadcrumb.profile",
  security: "nav.breadcrumb.security",
  notifications: "nav.breadcrumb.notifications",
  organizations: "nav.breadcrumb.organizations",
  settings: "nav.breadcrumb.settings",
  members: "nav.breadcrumb.members",
  billing: "nav.breadcrumb.billing",
};

function usePageBreadcrumbs(pathname: string, t: (key: string) => string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => {
    const i18nKey = SEGMENT_I18N_KEYS[seg];
    const label = i18nKey
      ? t(i18nKey)
      : seg.charAt(0).toUpperCase() + seg.slice(1);
    return {
      label,
      href: "/" + segments.slice(0, i + 1).join("/"),
      isLast: i === segments.length - 1,
    };
  });
}

export function ShellHeader() {
  const pathname = usePathname();
  const t = useTranslation("zh-TW");
  const breadcrumbs = usePageBreadcrumbs(pathname, t);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K / Ctrl+K keyboard shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 bg-background/70 ring-1 ring-border/55 backdrop-blur-xl sm:h-16">
        <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="min-w-0 flex-1">
            <BreadcrumbList className="flex-nowrap overflow-x-auto">
              {breadcrumbs.length === 0 ? (
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">
                    {t("nav.home")}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                breadcrumbs.flatMap((crumb) =>
                  crumb.isLast
                    ? [
                        <BreadcrumbItem key={crumb.href}>
                          <BreadcrumbPage className="max-w-[46vw] truncate font-semibold capitalize tracking-tight sm:max-w-none">
                            {crumb.label}
                          </BreadcrumbPage>
                        </BreadcrumbItem>,
                      ]
                    : [
                        <BreadcrumbItem
                          key={crumb.href}
                          className="hidden md:block"
                        >
                          <BreadcrumbLink asChild>
                            <Link
                              href={crumb.href}
                              className="capitalize tracking-tight"
                            >
                              {crumb.label}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>,
                        <BreadcrumbSeparator
                          key={`sep-${crumb.href}`}
                          className="hidden md:block"
                        />,
                      ]
                )
              )}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Cmd+K search trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="hidden h-8 gap-2 rounded-lg px-3 text-xs text-muted-foreground sm:flex"
            aria-label={t("search.placeholder")}
          >
            <Search className="size-3.5" />
            <span className="hidden lg:inline">{t("search.placeholder")}</span>
            <kbd className="pointer-events-none ml-1 hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-60 select-none lg:inline-block">
              {typeof window !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform)
                ? "⌘K"
                : "Ctrl+K"}
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="size-8 sm:hidden"
            aria-label={t("search.placeholder")}
          >
            <Search className="size-4" />
          </Button>
        </div>
      </header>
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
