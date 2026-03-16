"use client";
/**
 * ShellHeader — Pure UI component for sticky dashboard header.
 *
 * Props-based: accepts breadcrumbs and optional search trigger.
 * For the orchestrated version with breadcrumb resolution, see:
 * src/modules/workspace.module/_components/shell/shell-header.tsx
 */

import { Search } from "lucide-react";
import Link from "next/link";

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

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface ShellHeaderProps {
  breadcrumbs?: Breadcrumb[];
  homeLabel?: string;
  onSearchOpen?: () => void;
  searchPlaceholder?: string;
}

export function ShellHeader({
  breadcrumbs = [],
  homeLabel = "Home",
  onSearchOpen,
  searchPlaceholder = "Search (Cmd+K)",
}: ShellHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 bg-background/70 ring-1 ring-border/55 backdrop-blur-xl sm:h-16">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-nowrap overflow-x-auto">
            {breadcrumbs.length === 0 ? (
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">
                  {homeLabel}
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              breadcrumbs.flatMap((crumb, idx) =>
                crumb.href ? (
                  [
                    idx > 0 && (
                      <BreadcrumbSeparator key={`sep-${idx}`} />
                    ),
                    <BreadcrumbItem key={crumb.href}>
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>,
                  ].filter(Boolean)
                ) : (
                  [
                    idx > 0 && (
                      <BreadcrumbSeparator key={`sep-${idx}`} />
                    ),
                    <BreadcrumbItem key={`page-${idx}`}>
                      <BreadcrumbPage className="max-w-[46vw] truncate font-semibold capitalize tracking-tight sm:max-w-none">
                        {crumb.label}
                      </BreadcrumbPage>
                    </BreadcrumbItem>,
                  ].filter(Boolean)
                ),
              )
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 px-2 sm:px-4">
        {onSearchOpen && (
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground"
            onClick={onSearchOpen}
          >
            <Search className="size-4" />
            <span className="hidden text-xs sm:inline-block">
              {searchPlaceholder}
            </span>
          </Button>
        )}
      </div>
    </header>
  );
}
