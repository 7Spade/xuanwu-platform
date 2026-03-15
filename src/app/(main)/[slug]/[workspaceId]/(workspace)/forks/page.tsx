import type { Metadata } from "next";
import { ForksView } from "@/modules/fork.module/_components/forks-view";

export const metadata: Metadata = {
  title: "分支 — 玄武平台",
};

export default async function WorkspaceForksPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <ForksView workspaceId={workspaceId} />;
}
