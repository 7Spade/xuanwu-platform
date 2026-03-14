/**
 * MainLayout — Authenticated shell layout.
 *
 * Wraps all (main) routes with the sidebar + header shell.
 * Uses SidebarProvider from design system to enable sidebar state.
 */
import { SidebarInset, SidebarProvider } from "@/design-system/primitives/ui/sidebar";
import { DashboardSidebar } from "@/modules/workspace.module/_components/shell/dashboard-sidebar";
import { ShellHeader } from "@/modules/workspace.module/_components/shell/shell-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <ShellHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
