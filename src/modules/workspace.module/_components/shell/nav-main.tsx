"use client";
/**
 * NavMain — Primary navigation items in the sidebar.
 */

import {
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

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, labelKey: "nav.home" },
  { href: "/workspaces", icon: Layers, labelKey: "nav.workspaces" },
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
            isActive={
              pathname === href ||
              (href !== "/" && pathname.startsWith(href))
            }
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
