"use client";
/**
 * DashboardSidebar — Main sidebar for authenticated pages.
 *
 * Assembles the sidebar structure using SidebarProvider + Sidebar components
 * from the design system. Uses AccountSwitcher for the top-left account context,
 * NavMain for navigation and NavUser for user menu.
 */

import { useTranslation } from "@/shared/i18n";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/design-system/primitives/ui/sidebar";

import { AccountSwitcher } from "./account-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function DashboardSidebar() {
  const t = useTranslation("zh-TW");

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-2">
        <AccountSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
            {t("nav.mainMenu")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

