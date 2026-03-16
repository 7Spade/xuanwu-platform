import type { Metadata } from "next";
import { UserSettingsView } from "@/modules/account.module";

export const metadata: Metadata = {
  title: "帳號設定 — 玄武平台",
};

export default function ProfilePage() {
  return <UserSettingsView />;
}
