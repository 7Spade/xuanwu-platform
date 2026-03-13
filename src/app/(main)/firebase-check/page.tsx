import type { Metadata } from "next";
import { FirebaseCheckClient } from "./firebase-check-client";

export const metadata: Metadata = {
  title: "Firebase 連線狀態 — Xuanwu Platform",
  description: "即時檢查所有 Firebase 服務的連線狀態",
};

export default function FirebaseCheckPage() {
  return <FirebaseCheckClient />;
}
