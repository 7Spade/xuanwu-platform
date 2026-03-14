import type { Metadata } from "next";
import { WorkspacesView } from "@/modules/workspace.module/_components/workspaces-view";
import type { WorkspaceDTO } from "@/modules/workspace.module";

export const metadata: Metadata = {
  title: "工作空間 — 玄武平台",
};

export default async function WorkspacesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // In production this will call getWorkspacesByDimension(dimensionId).
  // For now return empty array — the view renders the creation CTA.
  const workspaces: WorkspaceDTO[] = [];

  return <WorkspacesView slug={slug} workspaces={workspaces} />;
}
