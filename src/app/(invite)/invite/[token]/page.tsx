import type { Metadata } from "next";
import { InviteView } from "@/modules/identity.module";

export const metadata: Metadata = {
  title: "邀請 — 玄武平台",
};

export default async function InviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InviteView token={token} />;
}
