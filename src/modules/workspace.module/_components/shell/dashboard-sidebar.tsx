"use client";
/**
 * DashboardSidebar — Main sidebar for authenticated pages.
 *
 * Assembles the sidebar structure using SidebarProvider + Sidebar components
 * from the design system. Uses NavMain for navigation and NavUser for user menu.
 */

import { ShieldCheck } from "lucide-react";
import Link from "next/link";

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
import { NavUser } from "./nav-user";

export function DashboardSidebar() {
  const t = useTranslation("zh-TW");

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-1 py-1 text-sm font-bold tracking-tight"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <span>{t("app.name")}</span>
        </Link>
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
