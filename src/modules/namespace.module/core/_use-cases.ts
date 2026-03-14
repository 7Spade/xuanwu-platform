import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { NamespaceEntity, WorkspaceBinding } from "../domain.namespace/_entity";
import { buildNamespace, findWorkspaceBinding } from "../domain.namespace/_entity";
import type { NamespaceId, NamespaceSlug, NamespaceOwnerType } from "../domain.namespace/_value-objects";
import type { INamespaceRepository, INamespaceSlugAvailabilityPort } from "../domain.namespace/_ports";

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface NamespaceDTO {
  readonly id: string;
  readonly slug: string;
  readonly ownerType: NamespaceOwnerType;
  readonly ownerId: string;
  readonly workspaceCount: number;
  readonly createdAt: string;
}

export interface WorkspacePathDTO {
  readonly path: string;
  readonly namespaceId: string;
  readonly workspaceId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function entityToDTO(namespace: NamespaceEntity): NamespaceDTO {
  return {
    id: namespace.id,
    slug: namespace.slug,
    ownerType: namespace.ownerType,
    ownerId: namespace.ownerId,
    workspaceCount: namespace.workspaces.length,
    createdAt: namespace.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Use Cases
// ---------------------------------------------------------------------------

/**
 * RegisterNamespaceUseCase
 * Registers a new namespace for an account. Called when an account receives its handle.
 * The namespace slug must equal the account handle.
 */
export async function registerNamespace(
  repo: INamespaceRepository,
  availabilityPort: INamespaceSlugAvailabilityPort,
  id: string,
  slug: string,
  ownerType: NamespaceOwnerType,
  ownerId: string,
): Promise<Result<NamespaceDTO>> {
  try {
    const parsedSlug = slug as NamespaceSlug;
    const isAvailable = await availabilityPort.isAvailable(parsedSlug);
    if (!isAvailable) {
      return fail(new Error(`Namespace slug "${slug}" is already taken`));
    }

    const now = new Date().toISOString();
    const namespace = buildNamespace(
      id as NamespaceId,
      parsedSlug,
      ownerType,
      ownerId,
      now,
    );
    await repo.save(namespace);
    return ok(entityToDTO(namespace));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * GetNamespaceBySlugUseCase
 */
export async function getNamespaceBySlug(
  repo: INamespaceRepository,
  slug: string,
): Promise<Result<NamespaceDTO | null>> {
  try {
    const namespace = await repo.findBySlug(slug as NamespaceSlug);
    return ok(namespace ? entityToDTO(namespace) : null);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * ResolveWorkspacePathUseCase
 * Resolves a path string ("namespace-slug/workspace-slug") to workspaceId.
 * Returns null when the namespace or workspace is not found.
 */
export async function resolveWorkspacePath(
  repo: INamespaceRepository,
  path: string,
): Promise<Result<WorkspacePathDTO | null>> {
  try {
    const [namespacePart, workspacePart] = path.split("/");
    if (!namespacePart || !workspacePart) {
      return fail(new Error(`Invalid workspace path format: "${path}"`));
    }

    const namespace = await repo.findBySlug(namespacePart as NamespaceSlug);
    if (!namespace) return ok(null);

    const binding = findWorkspaceBinding(namespace, workspacePart);
    if (!binding) return ok(null);

    return ok({
      path,
      namespaceId: namespace.id,
      workspaceId: binding.workspaceId,
    });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * BindWorkspaceToNamespaceUseCase
 * Registers a workspace slug under its namespace after workspace creation.
 */
export async function bindWorkspaceToNamespace(
  repo: INamespaceRepository,
  namespaceId: string,
  workspaceId: string,
  workspaceSlug: string,
): Promise<Result<NamespaceDTO>> {
  try {
    const namespace = await repo.findById(namespaceId as NamespaceId);
    if (!namespace) {
      return fail(new Error(`Namespace not found: ${namespaceId}`));
    }

    const alreadyBound = namespace.workspaces.some(
      (w) => w.workspaceSlug === workspaceSlug,
    );
    if (alreadyBound) {
      return fail(
        new Error(`Workspace slug "${workspaceSlug}" already exists in namespace`),
      );
    }

    const now = new Date().toISOString();
    const newBinding: WorkspaceBinding = {
      workspaceId,
      workspaceSlug,
      boundAt: now,
    };

    const updated: NamespaceEntity = {
      ...namespace,
      workspaces: [...namespace.workspaces, newBinding],
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
