"use client";
/**
 * NavMain — Pure UI component for primary navigation.
 *
 * Props-based design: accepts nav items and active pathname as props.
 * Suitable for inclusion in design-system layouts.
 *
 * For the orchestrated version with routing logic, see:
 * src/modules/workspace.module/_components/shell/nav-main.tsx
 */

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/design-system/primitives/ui/sidebar";

export interface NavMainItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export interface NavMainProps {
  items: NavMainItem[];
  pathname: string;
  homeRoute?: string;
}

export function NavMain({ items, pathname, homeRoute = "/dashboard" }: NavMainProps) {
  return (
    <SidebarMenu>
      {items.map(({ href, icon: Icon, label }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton
            asChild
            isActive={
              pathname === href || (href !== homeRoute && pathname.startsWith(href))
            }
          >
            <Link href={href}>
              <Icon />
              <span className="font-semibold">{label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
