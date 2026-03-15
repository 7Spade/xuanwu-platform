"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * ThemeProvider — thin wrapper around next-themes ThemeProvider.
 *
 * Place this at the root of the app (inside `<body>`) so that dark/light/system
 * preference is available throughout the component tree.
 *
 * Usage in layout.tsx:
 * ```tsx
 * <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
 *   {children}
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
