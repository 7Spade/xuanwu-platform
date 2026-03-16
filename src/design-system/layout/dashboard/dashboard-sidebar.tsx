"use client";
/**
 * DashboardSidebar — Main sidebar for authenticated pages.
 *
 * Assembles the sidebar structure using SidebarProvider + Sidebar components.
 * Aggregates navigation items from multiple domains:
 * - NavMain: hardcoded routes
 * - NavTopWorkspaces: workspace list from workspace.module
 * - NavUser: user profile from account.module + identity.module
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

import { NavMain } from "./nav-main";
import { NavTopWorkspaces } from "./nav-top-workspaces";
import { NavUser } from "./nav-user";

export function DashboardSidebar() {
  const t = useTranslation("zh-TW");

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-2">
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

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
            {t("nav.topWorkspaces")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavTopWorkspaces />
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
