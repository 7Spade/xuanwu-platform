import type { Metadata } from "next";
import { BillingView } from "@/modules/settlement.module/_components/billing-view";

export const metadata: Metadata = {
  title: "帳單 — 玄武平台",
};

export default async function BillingSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BillingView slug={slug} />;
}
