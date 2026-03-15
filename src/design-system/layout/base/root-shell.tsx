"use client";

import type { ReactNode } from "react";

interface RootShellProps {
  /** Main page content. */
  children: ReactNode;
  /** Optional sticky header slot (e.g. MarketingHeader, AppHeader). */
  header?: ReactNode;
  /** Optional footer slot. */
  footer?: ReactNode;
}

/**
 * RootShell — global, page-agnostic layout wrapper.
 *
 * Provides the outermost structural chrome: header (slot), main content
 * area, and footer (slot). Used by page-specific layouts in
 * `design-system/layout/[page]/` to avoid duplicating the structural HTML.
 *
 * Usage:
 * ```tsx
 * import { RootShell } from "@/design-system/layout/base";
 *
 * export function HomeLayout({ children }: { children: ReactNode }) {
 *   return (
 *     <RootShell header={<MarketingHeader />}>
 *       {children}
 *     </RootShell>
 *   );
 * }
 * ```
 */
export function RootShell({ children, header, footer }: RootShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {header && <div className="shrink-0">{header}</div>}
      <main className="flex-1">{children}</main>
      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  );
}
