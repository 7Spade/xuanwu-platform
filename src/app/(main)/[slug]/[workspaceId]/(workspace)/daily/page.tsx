import type { Metadata } from "next";
import { DailyWorkspaceView } from "@/modules/workspace.module/_components/daily-workspace-view";

export const metadata: Metadata = {
  title: "每日日誌 — 玄武平台",
};

export default async function WorkspaceDailyPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <DailyWorkspaceView workspaceId={workspaceId} />;
}
