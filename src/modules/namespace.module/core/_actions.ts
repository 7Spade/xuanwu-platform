// Namespace actions — adapter-backed application facade for write paths.

import { FirestoreNamespaceRepository } from "../infra.firestore/_repository";
import { FirestoreNamespaceSlugAvailabilityAdapter } from "../infra.firestore/_slug-availability";
import {
  bindWorkspaceToNamespace as bindWorkspaceToNamespaceUseCase,
  registerNamespace as registerNamespaceUseCase,
  type NamespaceDTO,
  type WorkspacePathDTO,
} from "./_use-cases";

const namespaceRepository = new FirestoreNamespaceRepository();
const slugAvailabilityPort = new FirestoreNamespaceSlugAvailabilityAdapter();

export type { NamespaceDTO, WorkspacePathDTO };

export async function registerNamespace(
  id: string,
  slug: string,
  ownerType: "personal" | "organization",
  ownerId: string,
) {
  return registerNamespaceUseCase(namespaceRepository, slugAvailabilityPort, id, slug, ownerType, ownerId);
}

export async function bindWorkspaceToNamespace(
  namespaceId: string,
  workspaceId: string,
  workspaceSlug: string,
) {
  return bindWorkspaceToNamespaceUseCase(namespaceRepository, namespaceId, workspaceId, workspaceSlug);
}
