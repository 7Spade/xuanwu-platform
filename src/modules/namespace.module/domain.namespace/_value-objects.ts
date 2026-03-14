import { z } from "zod";

// ---------------------------------------------------------------------------
// NamespaceId
// ---------------------------------------------------------------------------

export const NamespaceIdSchema = z.string().min(1, "NamespaceId must not be empty");
export type NamespaceId = z.infer<typeof NamespaceIdSchema>;

// ---------------------------------------------------------------------------
// NamespaceSlug
// ---------------------------------------------------------------------------

/**
 * Globally unique URL-safe slug for a namespace (mirrors AccountHandle).
 * Format: lowercase alphanumeric + hyphens, 3–39 characters.
 * Invariant: globally unique across both personal and org namespaces.
 */
export const NamespaceSlugSchema = z
  .string()
  .min(3, "NamespaceSlug must be at least 3 characters")
  .max(39, "NamespaceSlug must be at most 39 characters")
  .regex(/^[a-z0-9-]+$/, "NamespaceSlug may only contain lowercase letters, digits, and hyphens");
export type NamespaceSlug = z.infer<typeof NamespaceSlugSchema>;

// ---------------------------------------------------------------------------
// NamespaceOwnerType
// ---------------------------------------------------------------------------

export const NamespaceOwnerTypeSchema = z.enum(["personal", "organization"]);
export type NamespaceOwnerType = z.infer<typeof NamespaceOwnerTypeSchema>;

// ---------------------------------------------------------------------------
// WorkspacePath
// ---------------------------------------------------------------------------

/**
 * Resolved full URL path for a workspace within a namespace.
 * Format: `{namespace-slug}/{workspace-slug}`
 */
export const WorkspacePathSchema = z
  .string()
  .regex(
    /^[a-z0-9-]+\/[a-z0-9-]+$/,
    "WorkspacePath must follow the pattern: namespace-slug/workspace-slug",
  );
export type WorkspacePath = z.infer<typeof WorkspacePathSchema>;
