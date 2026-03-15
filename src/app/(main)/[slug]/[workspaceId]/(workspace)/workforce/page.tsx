import type { Metadata } from "next";
import { WorkforceScheduleView } from "@/modules/workforce.module/_components/workforce-schedule-view";

export const metadata: Metadata = {
  title: "排班管理 — 玄武平台",
};

export default async function WorkspaceWorkforcePage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkforceScheduleView workspaceId={workspaceId} />;
}
