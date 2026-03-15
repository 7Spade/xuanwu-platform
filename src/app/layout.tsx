import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/design-system/providers/theme-provider";

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
    <html lang="zh-TW" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
