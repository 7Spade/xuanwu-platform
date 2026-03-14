import type { Metadata } from "next";
import { OrganizationsView } from "@/modules/namespace.module/_components/organizations-view";

export const metadata: Metadata = {
  title: "我的組織 — 玄武平台",
};

export default function OrganizationsPage() {
  return <OrganizationsView />;
}
