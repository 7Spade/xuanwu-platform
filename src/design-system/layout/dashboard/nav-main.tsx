"use client";
/**
 * NavMain — Primary navigation items in the sidebar.
 *
 * Items are derived from the 16 domain modules:
 *  - Home          → account-level dashboard
 *  - Workspaces    → workspace.module (core project management)
 *  - Notifications → notification.module (alerts + mentions)
 *  - Organizations → namespace.module + account.module (org management)
 *  - Search        → search.module (global search)
 */

import {
  Bell,
  Building2,
  LayoutDashboard,
  Layers,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTranslation } from "@/shared/i18n";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/design-system/primitives/ui/sidebar";

const HOME_ROUTE = "/dashboard";

const NAV_ITEMS = [
  { href: HOME_ROUTE, icon: LayoutDashboard, labelKey: "nav.home" },
  { href: "/workspaces", icon: Layers, labelKey: "nav.workspaces" },
  { href: "/notifications", icon: Bell, labelKey: "nav.notifications" },
  { href: "/organizations", icon: Building2, labelKey: "nav.organizations" },
  { href: "/search", icon: Search, labelKey: "nav.search" },
] as const;

export function NavMain() {
  const pathname = usePathname();
  const t = useTranslation("zh-TW");

  return (
    <SidebarMenu>
      {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(href)}
          >
            <Link href={href}>
              <Icon />
              <span className="font-semibold">{t(labelKey)}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
