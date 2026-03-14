import { z } from "zod";

// ---------------------------------------------------------------------------
// WorkspaceId
// ---------------------------------------------------------------------------

export const WorkspaceIdSchema = z.string().min(1, "WorkspaceId must not be empty");
export type WorkspaceId = z.infer<typeof WorkspaceIdSchema>;

// ---------------------------------------------------------------------------
// WorkspaceSlug
// ---------------------------------------------------------------------------

/**
 * URL-safe slug for a workspace within a namespace.
 * Together with the namespace slug, forms the full WorkspacePath.
 */
export const WorkspaceSlugSchema = z
  .string()
  .min(2, "WorkspaceSlug must be at least 2 characters")
  .max(60, "WorkspaceSlug must be at most 60 characters")
  .regex(/^[a-z0-9-]+$/, "WorkspaceSlug may only contain lowercase letters, digits, and hyphens");
export type WorkspaceSlug = z.infer<typeof WorkspaceSlugSchema>;

// ---------------------------------------------------------------------------
// WorkspaceLifecycleState
// ---------------------------------------------------------------------------

export const WorkspaceLifecycleStateSchema = z.enum([
  "preparatory",
  "active",
  "stopped",
]);
export type WorkspaceLifecycleState = z.infer<typeof WorkspaceLifecycleStateSchema>;

// ---------------------------------------------------------------------------
// WorkspaceVisibility
// ---------------------------------------------------------------------------

export const WorkspaceVisibilitySchema = z.enum(["visible", "hidden"]);
export type WorkspaceVisibility = z.infer<typeof WorkspaceVisibilitySchema>;

// ---------------------------------------------------------------------------
// WorkspaceRole
// ---------------------------------------------------------------------------

export const WorkspaceRoleSchema = z.enum(["Manager", "Contributor", "Viewer"]);
export type WorkspaceRole = z.infer<typeof WorkspaceRoleSchema>;

// ---------------------------------------------------------------------------
// TaskState
// ---------------------------------------------------------------------------

export const TaskStateSchema = z.enum([
  "todo",
  "doing",
  "blocked",
  "completed",
  "verified",
  "accepted",
  "planning",
]);
export type TaskState = z.infer<typeof TaskStateSchema>;

// ---------------------------------------------------------------------------
// TaskPriority
// ---------------------------------------------------------------------------

export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
