/**
 * Namespace domain services.
 *
 * Pure functions — no I/O, no async, no side-effects.
 *
 * NamespacePathResolutionService:
 *   - resolveWorkspaceIdFromPath — given a loaded NamespaceEntity and a
 *     workspace slug, returns the workspaceId for that binding (or null).
 *   - parseWorkspacePath — splits a "ns-slug/ws-slug" string into its parts.
 *
 * NamespaceConflictDetectionService:
 *   - isSlugReserved — checks whether a proposed slug is in the reserved list
 *     (e.g. "api", "admin", "settings").
 *   - buildWorkspaceBinding — factory for WorkspaceBinding value objects.
 *   - addWorkspaceBinding — returns a new NamespaceEntity with the binding
 *     appended; rejects duplicate workspace slugs.
 *   - removeWorkspaceBinding — returns a new NamespaceEntity with the binding
 *     for the given workspaceId removed.
 *   - hasWorkspaceSlug — checks if a slug is already registered in this namespace.
 */

import type { NamespaceEntity, WorkspaceBinding } from "./_entity";
import type { NamespaceSlug } from "./_value-objects";

// ---------------------------------------------------------------------------
// Reserved slugs — configuration-level list, not domain state
// ---------------------------------------------------------------------------

/**
 * Slugs that may never be used as namespace identifiers because they collide
 * with platform routes or well-known HTTP paths.
 */
export const RESERVED_NAMESPACE_SLUGS: ReadonlySet<string> = new Set([
  "api",
  "admin",
  "settings",
  "login",
  "logout",
  "signup",
  "help",
  "support",
  "about",
  "static",
  "assets",
  "public",
  "www",
  "mail",
  "app",
  "dashboard",
]);

// ---------------------------------------------------------------------------
// NamespacePathResolutionService
// ---------------------------------------------------------------------------

/**
 * Splits a raw WorkspacePath string ("ns-slug/ws-slug") into its two parts.
 *
 * @returns `{ namespaceSlug, workspaceSlug }` or `null` if the format is invalid.
 */
export function parseWorkspacePath(
  path: string,
): { namespaceSlug: NamespaceSlug; workspaceSlug: string } | null {
  const parts = path.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { namespaceSlug: parts[0] as NamespaceSlug, workspaceSlug: parts[1] };
}

/**
 * Given a loaded NamespaceEntity and a workspace slug, returns the
 * workspaceId for that binding.
 *
 * Pure — callers must pre-load the namespace from the repository.
 *
 * @returns The workspaceId string, or `null` if not found.
 */
export function resolveWorkspaceIdFromPath(
  namespace: NamespaceEntity,
  workspaceSlug: string,
): string | null {
  const binding = namespace.workspaces.find(
    (w) => w.workspaceSlug === workspaceSlug,
  );
  return binding?.workspaceId ?? null;
}

// ---------------------------------------------------------------------------
// NamespaceConflictDetectionService
// ---------------------------------------------------------------------------

/**
 * Returns `true` if the proposed slug is in the platform-reserved slug list.
 */
export function isSlugReserved(
  slug: string,
  reservedSlugs: ReadonlySet<string> = RESERVED_NAMESPACE_SLUGS,
): boolean {
  return reservedSlugs.has(slug.toLowerCase());
}

/**
 * Returns `true` if the namespace already has a workspace registered under
 * the given workspace slug.
 */
export function hasWorkspaceSlug(
  namespace: NamespaceEntity,
  workspaceSlug: string,
): boolean {
  return namespace.workspaces.some((w) => w.workspaceSlug === workspaceSlug);
}

/**
 * Builds a WorkspaceBinding value object.
 */
export function buildWorkspaceBinding(
  workspaceId: string,
  workspaceSlug: string,
  now: string,
): WorkspaceBinding {
  return { workspaceId, workspaceSlug, boundAt: now };
}

/**
 * Returns a new NamespaceEntity with `binding` appended.
 *
 * @throws Error if the workspace slug is already registered in this namespace
 *   (duplicate slug invariant).
 */
export function addWorkspaceBinding(
  namespace: NamespaceEntity,
  binding: WorkspaceBinding,
  now: string,
): NamespaceEntity {
  if (hasWorkspaceSlug(namespace, binding.workspaceSlug)) {
    throw new Error(
      `Workspace slug "${binding.workspaceSlug}" is already registered in namespace "${namespace.slug}".`,
    );
  }
  return {
    ...namespace,
    workspaces: [...namespace.workspaces, binding],
    updatedAt: now,
  };
}

/**
 * Returns a new NamespaceEntity with the binding for `workspaceId` removed.
 * If no binding exists for that ID, the original namespace is returned unchanged.
 */
export function removeWorkspaceBinding(
  namespace: NamespaceEntity,
  workspaceId: string,
  now: string,
): NamespaceEntity {
  const filtered = namespace.workspaces.filter(
    (w) => w.workspaceId !== workspaceId,
  );
  if (filtered.length === namespace.workspaces.length) return namespace;
  return { ...namespace, workspaces: filtered, updatedAt: now };
}
