import type { Metadata } from "next";
import { WorkspaceQaView } from "@/modules/workspace.module/_components/workspace-qa-view";

export const metadata: Metadata = {
  title: "品保 — 玄武平台",
};

export default async function WorkspaceQaPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceQaView workspaceId={workspaceId} />;
}
