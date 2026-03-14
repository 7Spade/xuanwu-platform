import type { NamespaceId, NamespaceOwnerType } from "./_value-objects";

interface NamespaceDomainEvent {
  readonly namespaceId: NamespaceId;
  readonly occurredAt: string; // ISO-8601
}

export interface NamespaceRegistered extends NamespaceDomainEvent {
  readonly type: "namespace:registered";
  readonly slug: string;
  readonly ownerType: NamespaceOwnerType;
  readonly ownerId: string;
}

export interface NamespaceSlugChanged extends NamespaceDomainEvent {
  readonly type: "namespace:slug:changed";
  readonly previousSlug: string;
  readonly newSlug: string;
}

export interface WorkspaceBoundToNamespace extends NamespaceDomainEvent {
  readonly type: "namespace:workspace:bound";
  readonly workspaceId: string;
  readonly workspaceSlug: string;
}

export type NamespaceDomainEventUnion =
  | NamespaceRegistered
  | NamespaceSlugChanged
  | WorkspaceBoundToNamespace;
