import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xuanwu Platform",
  description: "Next.js Domain-Driven Design minimal runnable platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
