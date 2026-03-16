/**
 * src/design-system/layout/dashboard/index.ts
 *
 * Dashboard layout shell components that aggregate data from multiple domains.
 * These components are the presentation layer for the authenticated dashboard.
 *
 * - DashboardSidebar: Main sidebar orchestrating navigation and account switching
 * - NavMain: Primary navigation (hardcoded routes)
 * - NavTopWorkspaces: Workspace list from workspace.module
 * - NavUser: User profile menu from account.module + identity.module
 * - ShellHeader: Sticky header with breadcrumbs and search from search.module
 */

export { DashboardShell, type DashboardShellProps } from "./dashboard-shell";
export { DashboardSidebar } from "./dashboard-sidebar";
export { NavMain } from "./nav-main";
export { NavTopWorkspaces } from "./nav-top-workspaces";
export { NavUser } from "./nav-user";
export { ShellHeader } from "./shell-header";
