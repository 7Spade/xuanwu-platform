/**
 * src/design-system/layout/dashboard/index.ts
 *
 * Pure presentation shell components for authenticated dashboard layouts.
 * These components have no business logic — they accept props for all dynamic data.
 *
 * For orchestrated versions that fetch data from modules, see app-specific
 * implementations in (main)/layout.tsx or individual modules.
 */

export { DashboardShell } from "./dashboard-shell";
export type { DashboardShellProps } from "./dashboard-shell";

export { NavMain } from "./nav-main";
export type { NavMainProps } from "./nav-main";

export { NavTopWorkspaces } from "./nav-top-workspaces";
export type { NavTopWorkspacesProps } from "./nav-top-workspaces";

export { NavUser } from "./nav-user";
export type { NavUserProps } from "./nav-user";

export { ShellHeader } from "./shell-header";
export type { ShellHeaderProps } from "./shell-header";
