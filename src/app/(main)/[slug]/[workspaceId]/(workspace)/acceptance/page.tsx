import type { Metadata } from "next";
import { WorkspaceAcceptanceView } from "@/modules/workspace.module/_components/workspace-acceptance-view";

export const metadata: Metadata = {
  title: "驗收 — 玄武平台",
};

export default async function WorkspaceAcceptancePage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceAcceptanceView workspaceId={workspaceId} />;
}
