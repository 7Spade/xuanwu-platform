import type { SettlementRecord } from "./_entity";
import type { SettlementId } from "./_value-objects";

export interface ISettlementRepository {
  findById(id: SettlementId): Promise<SettlementRecord | null>;
  findByWorkspaceId(workspaceId: string): Promise<SettlementRecord[]>;
  findByDimensionId(dimensionId: string): Promise<SettlementRecord[]>;
  save(record: SettlementRecord): Promise<void>;
  deleteById(id: SettlementId): Promise<void>;
}
