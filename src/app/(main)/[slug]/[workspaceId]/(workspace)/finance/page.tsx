import type { Metadata } from "next";
import { WorkspaceFinanceView } from "@/modules/workspace.module/_components/workspace-finance-view";

export const metadata: Metadata = {
  title: "財務 — 玄武平台",
};

export default async function WorkspaceFinancePage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceFinanceView workspaceId={workspaceId} />;
}
