"use client";
/**
 * DashboardShell — Pure UI container for authenticated app layouts.
 *
 * Combines sidebar and header into a two-column layout.
 * All content is passed as children and props.
 * For the orchestrated version, see: src/app/(main)/layout.tsx
 */

import { ReactNode } from "react";
import { SidebarProvider } from "@/design-system/primitives/ui/sidebar";

export interface DashboardShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  sidebarOpen?: boolean;
}

export function DashboardShell({
  children,
  sidebar,
  header,
  sidebarOpen,
}: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <div className="grid h-screen w-full grid-cols-1 grid-rows-[auto_1fr]">
        {header && <div className="col-span-full">{header}</div>}
        <div className="grid grid-cols-[auto_1fr]">
          {sidebar && <aside className="hidden sm:block">{sidebar}</aside>}
          <main className="overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
