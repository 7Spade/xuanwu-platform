import type { Metadata } from "next";
import { NotificationsView } from "@/modules/notification.module/_components/notifications-view";

export const metadata: Metadata = {
  title: "通知 — 玄武平台",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
