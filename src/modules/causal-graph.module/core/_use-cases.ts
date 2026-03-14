import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { CausalNode, CausalEdge, CausalPath, CausalNodeId } from "../domain.causal-graph/_entity";
import type { CausalDirection, ImpactScope } from "../domain.causal-graph/_value-objects";
import type { ICausalNodeRepository, ICausalEdgeRepository, ICausalPathQuery } from "../domain.causal-graph/_ports";

export interface CausalNodeDTO {
  readonly id: string;
  readonly kind: string;
  readonly sourceRef: string;
  readonly label: string;
  readonly occurredAt: string;
}

export interface ImpactScopeDTO {
  readonly triggerNodeId: string;
  readonly affectedNodeIds: string[];
  readonly maxDepth: number;
}

function nodeToDTO(n: CausalNode): CausalNodeDTO {
  return { id: n.id, kind: n.kind, sourceRef: n.sourceRef, label: n.label, occurredAt: n.occurredAt };
}

export async function registerCausalNode(
  repo: ICausalNodeRepository,
  node: CausalNode,
): Promise<Result<CausalNodeDTO>> {
  try {
    await repo.save(node);
    return ok(nodeToDTO(node));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function addCausalEdge(
  edgeRepo: ICausalEdgeRepository,
  edge: CausalEdge,
): Promise<Result<void>> {
  try {
    await edgeRepo.save(edge);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function resolveImpactScope(
  pathQuery: ICausalPathQuery,
  triggerNodeId: string,
  direction: CausalDirection,
  maxDepth: number,
): Promise<Result<ImpactScopeDTO>> {
  try {
    const scope = await pathQuery.resolveImpactScope(
      triggerNodeId as CausalNodeId, direction, maxDepth,
    );
    return ok({
      triggerNodeId: scope.triggerNodeId,
      affectedNodeIds: [...scope.affectedNodeIds],
      maxDepth: scope.maxDepth,
    });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
