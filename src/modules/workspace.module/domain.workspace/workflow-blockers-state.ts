/**
 * workflow-blockers-state — pure utility functions for summarising blocked workflow state.
 *
 * Source equivalent: workspace.slice/core/_components/workflow-blockers-state.ts
 * Ported as-is — no framework imports, no side effects.
 *
 * In xuanwu-platform the "blocked workflow" concept is simplified:
 *   a WorkItem with status === "blocked" counts as one blocked workflow.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Map of workflowId → number of blockers for that workflow. */
export type WorkflowBlockersState = Record<string, number>;

export interface WorkflowBlockersSource {
  workflowId: string;
  blockedBy?: string[];
}

// ---------------------------------------------------------------------------
// Reducers
// ---------------------------------------------------------------------------

export function applyWorkflowBlocked(
  state: WorkflowBlockersState,
  workflowId: string,
  blockedByCount: number,
): WorkflowBlockersState {
  return {
    ...state,
    [workflowId]: Math.max(1, blockedByCount),
  };
}

export function applyWorkflowUnblocked(
  state: WorkflowBlockersState,
  workflowId: string,
  blockedByCount = 0,
): WorkflowBlockersState {
  if (blockedByCount > 0) {
    return {
      ...state,
      [workflowId]: blockedByCount,
    };
  }
  const { [workflowId]: _removed, ...rest } = state;
  return rest;
}

export function deriveWorkflowBlockersFromSources(
  sources: readonly WorkflowBlockersSource[],
): WorkflowBlockersState {
  // Intentional accumulator mutation for O(n) aggregation without spread cloning.
  return sources.reduce<WorkflowBlockersState>((acc, source) => {
    const blockedByCount = source.blockedBy?.length ?? 0;
    if (blockedByCount === 0) return acc;
    acc[source.workflowId] = blockedByCount;
    return acc;
  }, {});
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export interface WorkflowBlockersSummary {
  blockedWorkflowCount: number;
  totalBlockedByCount: number;
  hasBlockedWorkflows: boolean;
}

export function summarizeWorkflowBlockers(
  state: WorkflowBlockersState,
): WorkflowBlockersSummary {
  const counts = Object.values(state);
  const totalBlockedByCount = counts.reduce((sum, count) => sum + count, 0);
  return {
    blockedWorkflowCount: counts.length,
    totalBlockedByCount,
    hasBlockedWorkflows: counts.length > 0,
  };
}
