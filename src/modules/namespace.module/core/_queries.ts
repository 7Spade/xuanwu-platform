// Namespace queries — adapter-backed application facade for read paths.

import { FirestoreNamespaceRepository } from "../infra.firestore/_repository";
import {
  getNamespaceByOwnerId as getNamespaceByOwnerIdUseCase,
  getNamespaceBySlug as getNamespaceBySlugUseCase,
  resolveWorkspacePath as resolveWorkspacePathUseCase,
  type NamespaceDTO,
  type WorkspacePathDTO,
} from "./_use-cases";

const namespaceRepository = new FirestoreNamespaceRepository();

export type { NamespaceDTO, WorkspacePathDTO };

export async function getNamespaceBySlug(slug: string) {
  return getNamespaceBySlugUseCase(namespaceRepository, slug);
}

export async function getNamespaceByOwnerId(ownerId: string) {
  return getNamespaceByOwnerIdUseCase(namespaceRepository, ownerId);
}

export async function resolveWorkspacePath(path: string) {
  return resolveWorkspacePathUseCase(namespaceRepository, path);
}
