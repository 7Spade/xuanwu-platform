import type { Metadata } from "next";
import { AccountWorkspacesPage } from "./_account-workspaces";

export const metadata: Metadata = {
  title: "工作空間 — 玄武平台",
};

export default function WorkspacesPage() {
  return <AccountWorkspacesPage />;
}
