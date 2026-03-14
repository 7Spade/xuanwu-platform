import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { SettlementRecord, ClaimLineItem } from "../domain.settlement/_entity";
import { buildSettlementRecord } from "../domain.settlement/_entity";
import type { SettlementId, FinanceLifecycleStage, SettlementRole } from "../domain.settlement/_value-objects";
import type { ISettlementRepository } from "../domain.settlement/_ports";

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface SettlementDTO {
  readonly id: string;
  readonly workspaceId: string;
  readonly dimensionId: string;
  readonly role: SettlementRole;
  readonly stage: FinanceLifecycleStage;
  readonly cycleIndex: number;
  readonly contractAmount: number;
  readonly receivedAmount: number;
  readonly outstandingAmount: number;
  readonly updatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function entityToDTO(r: SettlementRecord): SettlementDTO {
  return {
    id: r.id,
    workspaceId: r.workspaceId,
    dimensionId: r.dimensionId,
    role: r.role,
    stage: r.stage,
    cycleIndex: r.cycleIndex,
    contractAmount: r.contractAmount,
    receivedAmount: r.receivedAmount,
    outstandingAmount: r.contractAmount - r.receivedAmount,
    updatedAt: r.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Use Cases
// ---------------------------------------------------------------------------

export async function createSettlementRecord(
  repo: ISettlementRepository,
  id: string,
  workspaceId: string,
  dimensionId: string,
  role: SettlementRole,
  contractAmount: number,
): Promise<Result<SettlementDTO>> {
  try {
    const now = new Date().toISOString();
    const record = buildSettlementRecord(
      id as SettlementId,
      workspaceId,
      dimensionId,
      role,
      contractAmount,
      now,
    );
    await repo.save(record);
    return ok(entityToDTO(record));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function submitClaim(
  repo: ISettlementRepository,
  id: string,
  lineItems: ClaimLineItem[],
): Promise<Result<SettlementDTO>> {
  const ALLOWED_PREV: FinanceLifecycleStage[] = ["claim-preparation", "claim-approved"];
  try {
    const existing = await repo.findById(id as SettlementId);
    if (!existing) return fail(new Error(`Settlement not found: ${id}`));
    if (!ALLOWED_PREV.includes(existing.stage)) {
      return fail(new Error(`Cannot submit claim in stage: ${existing.stage}`));
    }
    const now = new Date().toISOString();
    const updated: SettlementRecord = {
      ...existing,
      stage: "claim-submitted",
      cycleIndex: existing.cycleIndex + 1,
      currentClaimLineItems: lineItems,
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function approveClaim(
  repo: ISettlementRepository,
  id: string,
): Promise<Result<SettlementDTO>> {
  try {
    const existing = await repo.findById(id as SettlementId);
    if (!existing) return fail(new Error(`Settlement not found: ${id}`));
    if (existing.stage !== "claim-submitted") {
      return fail(new Error(`Can only approve claim-submitted, got: ${existing.stage}`));
    }
    const now = new Date().toISOString();
    const updated: SettlementRecord = {
      ...existing,
      stage: "claim-approved",
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function recordPayment(
  repo: ISettlementRepository,
  id: string,
  amount: number,
  receivedAt: string,
): Promise<Result<SettlementDTO>> {
  try {
    const existing = await repo.findById(id as SettlementId);
    if (!existing) return fail(new Error(`Settlement not found: ${id}`));
    const newReceived = existing.receivedAmount + amount;
    const now = new Date().toISOString();
    const stage: FinanceLifecycleStage =
      newReceived >= existing.contractAmount ? "completed" : "payment-received";
    const updated: SettlementRecord = {
      ...existing,
      stage,
      receivedAmount: newReceived,
      paymentReceivedAt: receivedAt,
      updatedAt: now,
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getSettlementsByWorkspace(
  repo: ISettlementRepository,
  workspaceId: string,
): Promise<Result<SettlementDTO[]>> {
  try {
    const records = await repo.findByWorkspaceId(workspaceId);
    return ok(records.map(entityToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
