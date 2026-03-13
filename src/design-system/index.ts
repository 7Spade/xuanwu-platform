/**
 * Design System public API
 *
 * Three-tier hierarchy:
 *   primitives  — raw shadcn/ui components
 *   components  — project-specific wrappers
 *   patterns    — higher-order UI composites
 *
 * Import from the appropriate tier:
 *   import { Button }      from "@/design-system/primitives"
 *   import { SearchField } from "@/design-system/components"
 *   import { LoginForm }   from "@/design-system/patterns"
 */

export * from "./primitives";
export * from "./components";
export * from "./patterns";
