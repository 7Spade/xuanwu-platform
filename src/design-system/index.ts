/**
 * Design System public API
 *
 * Five-tier hierarchy:
 *   primitives  — raw shadcn/ui components
 *   components  — project-specific wrappers
 *   patterns    — higher-order UI composites
 *   layout      — structural layout shells and page-specific wrappers
 *   tokens      — design-token constants (colours, spacing, typography, …)
 *
 * Import from the appropriate tier:
 *   import { Button }          from "@/design-system/primitives"
 *   import { SearchField }     from "@/design-system/components"
 *   import { LoginForm }       from "@/design-system/patterns"
 *   import { HomeLayout }      from "@/design-system/layout/marketing"
 *   import { colorBrand }      from "@/design-system/tokens"
 */

export * from "./primitives";
export * from "./components";
export * from "./patterns";
export * from "./layout";
export * from "./tokens";
