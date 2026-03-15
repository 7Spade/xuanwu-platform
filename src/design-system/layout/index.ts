// src/design-system/layout/index.ts
// Design-system layout tier.
//
// Structure:
//   base/       — global, page-agnostic structural shells (RootShell)
//   marketing/  — marketing / landing page layouts (HomeLayout, MarketingHeader)
//
// Add new page-specific sub-directories following the same pattern:
//   auth/       — authentication page layouts
//   dashboard/  — app-shell layouts for authenticated views
//
// Import via the layout tier:
//   import { RootShell }      from "@/design-system/layout/base";
//   import { HomeLayout }     from "@/design-system/layout/marketing";
//   import { MarketingHeader } from "@/design-system/layout/marketing";

export * from "./base";
export * from "./marketing";
