import type { Metadata } from "next";
import { SecurityView } from "@/modules/account.module";

export const metadata: Metadata = {
  title: "安全性設定 — 玄武平台",
};

export default function SecurityPage() {
  return <SecurityView />;
}
