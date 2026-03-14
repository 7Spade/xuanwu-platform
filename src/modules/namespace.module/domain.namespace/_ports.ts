import type { NamespaceEntity } from "./_entity";
import type { NamespaceId, NamespaceSlug } from "./_value-objects";

export interface INamespaceRepository {
  findById(id: NamespaceId): Promise<NamespaceEntity | null>;
  findBySlug(slug: NamespaceSlug): Promise<NamespaceEntity | null>;
  findByOwnerId(ownerId: string): Promise<NamespaceEntity | null>;
  save(namespace: NamespaceEntity): Promise<void>;
  deleteById(id: NamespaceId): Promise<void>;
}

export interface INamespaceSlugAvailabilityPort {
  isAvailable(slug: NamespaceSlug): Promise<boolean>;
}
