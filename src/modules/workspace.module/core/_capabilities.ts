/**
 * workspace.module — application-facing capability catalog.
 *
 * Presentation code imports this file instead of reaching into domain paths.
 */

export {
  CAPABILITY_SPECS,
  NON_MOUNTABLE_CAPABILITY_IDS,
} from "../domain.workspace/_capability-specs";
export type { WorkspaceCapability } from "../domain.workspace/_value-objects";
