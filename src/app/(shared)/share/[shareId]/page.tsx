import type { Metadata } from "next";
import { ShareView } from "@/modules/identity.module/_components/share-view";

export const metadata: Metadata = {
  title: "共用內容 — 玄武平台",
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  return <ShareView shareId={shareId} />;
}
