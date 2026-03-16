// namespace.module — Public API barrel
// Bounded Context: Namespace / 命名空間
//
// Exports: DTOs, application use cases, port interfaces.
// NEVER export entities, value objects, repositories, or domain events directly.

export type { NamespaceDTO, WorkspacePathDTO } from "./core/_queries";

export {
  getNamespaceBySlug,
  resolveWorkspacePath,
} from "./core/_queries";
export { bindWorkspaceToNamespace, registerNamespace } from "./core/_use-cases";

export type {
  INamespaceRepository,
  INamespaceSlugAvailabilityPort,
} from "./domain.namespace/_ports";
export { useNamespaceBySlug } from "./_components/use-namespace-by-slug";
export type { UseNamespaceBySlugResult } from "./_components/use-namespace-by-slug";
