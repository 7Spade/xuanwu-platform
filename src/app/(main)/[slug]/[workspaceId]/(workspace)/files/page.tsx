import type { Metadata } from "next";
import { WorkspaceFilesView } from "@/modules/workspace.module/_components/workspace-files-view";

export const metadata: Metadata = {
  title: "檔案管理 — 玄武平台",
};

export default async function WorkspaceFilesPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceFilesView workspaceId={workspaceId} />;
}
