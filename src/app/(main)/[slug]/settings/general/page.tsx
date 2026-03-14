import type { Metadata } from "next";
import { WorkspaceSettingsView } from "@/modules/workspace.module/_components/workspace-settings-view";

export const metadata: Metadata = {
  title: "一般設定 — 玄武平台",
};

export default async function GeneralSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <WorkspaceSettingsView slug={slug} />;
}
