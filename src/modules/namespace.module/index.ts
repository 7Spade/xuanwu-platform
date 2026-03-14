// namespace.module — Public API barrel
// Bounded Context: Namespace / 命名空間
//
// Exports: DTOs, application use cases, port interfaces.
// NEVER export entities, value objects, repositories, or domain events directly.

export type { NamespaceDTO, WorkspacePathDTO } from "./core/_use-cases";

export {
  registerNamespace,
  getNamespaceBySlug,
  resolveWorkspacePath,
  bindWorkspaceToNamespace,
} from "./core/_use-cases";

export type {
  INamespaceRepository,
  INamespaceSlugAvailabilityPort,
} from "./domain.namespace/_ports";
