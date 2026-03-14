import type { ForkId } from "./_value-objects";
export interface WorkspaceForked { readonly type: "fork:workspace:forked"; readonly forkId: ForkId; readonly originWorkspaceId: string; readonly forkedByAccountId: string; readonly occurredAt: string; }
export interface ForkAbandoned { readonly type: "fork:abandoned"; readonly forkId: ForkId; readonly occurredAt: string; }
export type ForkDomainEventUnion = WorkspaceForked | ForkAbandoned;
