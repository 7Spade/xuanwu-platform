import type { ForkEntity } from "./_entity";
import type { ForkId } from "./_value-objects";
export interface IForkRepository {
  findById(id: ForkId): Promise<ForkEntity | null>;
  findByOriginWorkspace(originWorkspaceId: string): Promise<ForkEntity[]>;
  findByAccount(accountId: string): Promise<ForkEntity[]>;
  save(fork: ForkEntity): Promise<void>;
}
