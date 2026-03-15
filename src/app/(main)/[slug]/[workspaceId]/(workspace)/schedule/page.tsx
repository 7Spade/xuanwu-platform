import type { Metadata } from "next";
import { WorkspaceScheduleView } from "@/modules/workspace.module/_components/workspace-schedule-view";

export const metadata: Metadata = {
  title: "排程 — 玄武平台",
};

export default async function WorkspaceSchedulePage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceScheduleView workspaceId={workspaceId} />;
}
