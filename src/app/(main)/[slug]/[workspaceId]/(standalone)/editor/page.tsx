import type { Metadata } from "next";
import { EditorView } from "@/modules/workspace.module/_components/editor-view";

export const metadata: Metadata = {
  title: "編輯器 — 玄武平台",
};

export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug: string; workspaceId: string }>;
}) {
  const { slug, workspaceId } = await params;
  return <EditorView slug={slug} workspaceId={workspaceId} />;
}
