import type { Metadata } from "next";
import { WorkspaceCapabilitiesView } from "@/modules/workspace.module";

export const metadata: Metadata = {
  title: "功能模組 — 玄武平台",
};

export default async function CapabilitiesPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceCapabilitiesView workspaceId={workspaceId} />;
}
