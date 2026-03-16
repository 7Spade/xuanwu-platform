/**
 * MainLayout — Authenticated shell layout.
 *
 * Wraps all (main) routes with AccountProvider (auth + account state),
 * then the sidebar + header shell.
 * Uses SidebarProvider from design system to enable sidebar state.
 */
import { SidebarInset, SidebarProvider } from "@/design-system/primitives/ui/sidebar";
import { AccountProvider } from "@/modules/account.module";
import { DashboardSidebar, ShellHeader } from "@/design-system/layout/dashboard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <ShellHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AccountProvider>
  );
}
