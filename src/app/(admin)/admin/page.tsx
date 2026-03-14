import type { Metadata } from "next";
import { AdminView } from "@/modules/identity.module/_components/admin-view";

export const metadata: Metadata = {
  title: "管理後台 — 玄武平台",
};

export default function AdminPage() {
  return <AdminView />;
}
