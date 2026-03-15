import type { Metadata } from "next";
import { CausalGraphView } from "@/modules/causal-graph.module/_components/causal-graph-view";

export const metadata: Metadata = {
  title: "因果圖 — 玄武平台",
};

export default async function WorkspaceCausalGraphPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <CausalGraphView workspaceId={workspaceId} />;
}
