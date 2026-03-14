import type { Metadata } from "next";
import { WbsView } from "@/modules/workspace.module/_components/wbs-view";

export const metadata: Metadata = {
  title: "工作分解結構 — 玄武平台",
};

export default async function WbsPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { slug, workspaceId } = await params;
  return <WbsView slug={slug} workspaceId={workspaceId} />;
}
