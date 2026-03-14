import type { Metadata } from "next";
import { WorkspacesView } from "@/modules/workspace.module/_components/workspaces-view";

export const metadata: Metadata = {
  title: "工作空間 — 玄武平台",
};

export default async function WorkspacesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // WorkspacesView fetches its own data via useWorkspaces + useCurrentAccount.
  // The RSC page just provides the slug (used for navigation hrefs).
  return <WorkspacesView slug={slug} />;
}
