'use server';
// Namespace server actions — thin re-exports of application use cases.
export type { NamespaceDTO, WorkspacePathDTO } from "./_use-cases";
export {
  registerNamespace,
  bindWorkspaceToNamespace,
} from "./_use-cases";
