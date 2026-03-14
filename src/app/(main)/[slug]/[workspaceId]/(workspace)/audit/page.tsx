/**
 * WorkspaceAuditPage — workspace-level audit activity feed.
 *
 * Source equivalent: workspace.slice/gov.audit/_components/audit.workspace-view.tsx
 * Adapted: uses useWorkspaceAuditLog hook + AuditLogView component.
 *
 * URL: /[slug]/[workspaceId]/audit
 */

import type { Metadata } from "next";
import { WorkspaceAuditView } from "@/modules/audit.module/_components/workspace-audit-view";

export const metadata: Metadata = {
  title: "稽核記錄 — 玄武平台",
};

export default async function WorkspaceAuditPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceAuditView workspaceId={workspaceId} />;
}
