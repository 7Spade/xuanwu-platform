import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { ForkEntity } from "../domain.fork/_entity";
import { buildFork } from "../domain.fork/_entity";
import type { ForkId, ForkStatus } from "../domain.fork/_value-objects";
import type { IForkRepository } from "../domain.fork/_ports";

export interface ForkDTO {
  readonly id: string;
  readonly originWorkspaceId: string;
  readonly forkedByAccountId: string;
  readonly baselineVersion: string;
  readonly status: ForkStatus;
  readonly createdAt: string;
}

export async function forkWorkspace(
  repo: IForkRepository,
  id: string,
  originWorkspaceId: string,
  forkedByAccountId: string,
  baselineVersion: string,
): Promise<Result<ForkDTO>> {
  try {
    const now = new Date().toISOString();
    const fork = buildFork(id as ForkId, originWorkspaceId, forkedByAccountId, baselineVersion, now);
    await repo.save(fork);
    return ok({ id: fork.id, originWorkspaceId: fork.originWorkspaceId, forkedByAccountId: fork.forkedByAccountId, baselineVersion: fork.baselineVersion, status: fork.status, createdAt: fork.createdAt });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function abandonFork(
  repo: IForkRepository,
  id: string,
): Promise<Result<ForkDTO>> {
  try {
    const existing = await repo.findById(id as ForkId);
    if (!existing) return fail(new Error(`Fork not found: ${id}`));
    const updated: ForkEntity = { ...existing, status: "abandoned", updatedAt: new Date().toISOString() };
    await repo.save(updated);
    return ok({ id: updated.id, originWorkspaceId: updated.originWorkspaceId, forkedByAccountId: updated.forkedByAccountId, baselineVersion: updated.baselineVersion, status: updated.status, createdAt: updated.createdAt });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getForksByAccount(
  repo: IForkRepository,
  accountId: string,
): Promise<Result<ForkDTO[]>> {
  try {
    const forks = await repo.findByAccount(accountId);
    return ok(forks.map((f) => ({ id: f.id, originWorkspaceId: f.originWorkspaceId, forkedByAccountId: f.forkedByAccountId, baselineVersion: f.baselineVersion, status: f.status, createdAt: f.createdAt })));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
