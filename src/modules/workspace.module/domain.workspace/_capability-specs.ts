/**
 * Capability specs registry — the catalogue of all known mountable capabilities.
 *
 * Source equivalent: capabilitySpecs store in workspace.slice app-state.
 * Adapted: pure constant, no external dependency, referenced by WorkspaceCapabilitiesView.
 *
 * Permanent-layer capabilities (Core + Governance + Projection) that are NOT mountable:
 *   capabilities, members, audit
 */

import type { WorkspaceCapability } from "./_value-objects";

// Capabilities that are always rendered via permanent tabs and cannot be mounted/unmounted.
export const NON_MOUNTABLE_CAPABILITY_IDS = new Set([
  "capabilities",
  "members",
  "audit",
]);

export const CAPABILITY_SPECS: readonly WorkspaceCapability[] = [
  {
    id: "tasks",
    name: "WBS / Tasks",
    type: "ui",
    status: "stable",
    description: "Work-breakdown structure and task tracking for the workspace.",
  },
  {
    id: "files",
    name: "Files",
    type: "data",
    status: "stable",
    description: "Document and file management for workspace resources.",
  },
  {
    id: "daily",
    name: "Daily Log",
    type: "ui",
    status: "stable",
    description: "Daily activity journal and stand-up records.",
  },
  {
    id: "issues",
    name: "Issues",
    type: "ui",
    status: "stable",
    description: "Issue tracking and incident management.",
  },
  {
    id: "schedule",
    name: "Schedule",
    type: "ui",
    status: "stable",
    description: "Gantt and timeline scheduling for workspace milestones.",
  },
  {
    id: "document-parser",
    name: "Document Parser",
    type: "data",
    status: "beta",
    description: "AI-assisted document parsing and contract analysis.",
  },
  {
    id: "quality-assurance",
    name: "Quality Assurance",
    type: "governance",
    status: "stable",
    description: "QA checklists and compliance tracking.",
  },
  {
    id: "acceptance",
    name: "Acceptance",
    type: "governance",
    status: "stable",
    description: "Acceptance criteria and sign-off workflows.",
  },
  {
    id: "finance",
    name: "Finance",
    type: "data",
    status: "stable",
    description: "Budget tracking, cost accounting, and financial reporting.",
  },
  {
    id: "causal-graph",
    name: "Causal Graph",
    type: "ui",
    status: "beta",
    description: "Visualise cause-and-effect relationships between workspace events.",
  },
  {
    id: "workforce",
    name: "Workforce",
    type: "ui",
    status: "stable",
    description: "Staff scheduling, shift assignment, and capacity planning.",
  },
  {
    id: "forks",
    name: "Forks",
    type: "ui",
    status: "beta",
    description: "Branch the workspace for isolated experimentation and divergent analysis.",
  },
];
