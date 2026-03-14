import type { NamespaceId, NamespaceSlug, NamespaceOwnerType } from "./_value-objects";

// ---------------------------------------------------------------------------
// WorkspaceBinding — a workspace registered under this namespace
// ---------------------------------------------------------------------------

export interface WorkspaceBinding {
  readonly workspaceId: string;
  readonly workspaceSlug: string;
  readonly boundAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// NamespaceEntity — aggregate root
// ---------------------------------------------------------------------------

/**
 * The Namespace aggregate root.
 *
 * Invariants:
 *   - A namespace slug is globally unique across personal and org namespaces.
 *   - A namespace is owned by exactly one Account (personal or org).
 *   - Workspace slugs within a namespace must be unique within that namespace.
 *   - A namespace slug mirrors the Account's handle — they must always be in sync.
 */
export interface NamespaceEntity {
  readonly id: NamespaceId;
  /** The globally unique slug (mirrors AccountHandle). */
  readonly slug: NamespaceSlug;
  readonly ownerType: NamespaceOwnerType;
  /** The AccountId of the owning account. */
  readonly ownerId: string;
  /** Workspaces registered under this namespace. */
  readonly workspaces: readonly WorkspaceBinding[];
  readonly createdAt: string;  // ISO-8601
  readonly updatedAt: string;  // ISO-8601
}

// ---------------------------------------------------------------------------
// Path resolution helper
// ---------------------------------------------------------------------------

/** Resolves a WorkspacePath string for a given namespace slug and workspace slug. */
export function buildWorkspacePath(
  namespaceSlug: string,
  workspaceSlug: string,
): string {
  return `${namespaceSlug}/${workspaceSlug}`;
}

/** Finds a workspace binding by its slug within this namespace. */
export function findWorkspaceBinding(
  namespace: NamespaceEntity,
  workspaceSlug: string,
): WorkspaceBinding | undefined {
  return namespace.workspaces.find((w) => w.workspaceSlug === workspaceSlug);
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

export function buildNamespace(
  id: NamespaceId,
  slug: NamespaceSlug,
  ownerType: NamespaceOwnerType,
  ownerId: string,
  now: string,
): NamespaceEntity {
  return {
    id,
    slug,
    ownerType,
    ownerId,
    workspaces: [],
    createdAt: now,
    updatedAt: now,
  };
}
