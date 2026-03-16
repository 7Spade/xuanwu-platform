// src/design-system/layout/index.ts
// Design-system layout tier.
//
// Structure:
//   base/       — global, page-agnostic structural shells (RootShell)
//   marketing/  — marketing / landing page layouts (HomeLayout, MarketingHeader)
//   dashboard/  — authenticated app layouts (DashboardShell, NavMain, ShellHeader, …)
//
// Import via the layout tier:
//   import { RootShell }      from "@/design-system/layout/base";
//   import { HomeLayout }     from "@/design-system/layout/marketing";
//   import { DashboardShell } from "@/design-system/layout/dashboard";

export * from "./base";
export * from "./marketing";
export * from "./dashboard";
