import type { Metadata } from "next";
import { MembersSettingsView } from "@/modules/workspace.module/_components/members-settings-view";

export const metadata: Metadata = {
  title: "成員管理 — 玄武平台",
};

export default async function MembersSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MembersSettingsView slug={slug} />;
}
