// Namespace actions — re-export barrel for application use cases.
export type { NamespaceDTO, WorkspacePathDTO } from "./_use-cases";
export {
  registerNamespace,
  bindWorkspaceToNamespace,
} from "./_use-cases";
