import type { Metadata } from "next";
import { WorkspaceLocationsView } from "@/modules/workspace.module/_components/workspace-locations-view";

export const metadata: Metadata = {
  title: "地點管理 — 玄武平台",
};

export default async function WorkspaceLocationsPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { slug, workspaceId } = await params;
  return <WorkspaceLocationsView slug={slug} workspaceId={workspaceId} />;
}
