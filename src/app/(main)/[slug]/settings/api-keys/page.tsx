import type { Metadata } from "next";
import { ApiKeysView } from "@/modules/identity.module";

export const metadata: Metadata = {
  title: "API 金鑰 — 玄武平台",
};

export default async function ApiKeysSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ApiKeysView slug={slug} />;
}
