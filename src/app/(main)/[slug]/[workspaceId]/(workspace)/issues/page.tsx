import type { Metadata } from "next";
import { IssuesView } from "@/modules/workspace.module/_components/issues-view";

export const metadata: Metadata = {
  title: "問題追蹤 — 玄武平台",
};

export default async function WorkspaceIssuesPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <IssuesView workspaceId={workspaceId} />;
}
