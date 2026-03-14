import type { Metadata } from "next";
import { UserSettingsView } from "@/modules/account.module/_components/user-settings-view";

export const metadata: Metadata = {
  title: "帳號設定 — 玄武平台",
};

export default function ProfilePage() {
  return <UserSettingsView />;
}
