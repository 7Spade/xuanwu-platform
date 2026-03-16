import type { Metadata } from "next";
import { DashboardView } from "@/modules/workspace.module/_components/dashboard-view";

export const metadata: Metadata = {
  title: "首頁 — 玄武平台",
};

export default function DashboardPage() {
  return <DashboardView />;
}
