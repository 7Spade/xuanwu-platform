// feature.module / domain.feature / _events.ts

export interface FlagStateChanged {
  readonly type: 'FlagStateChanged';
  readonly flagId: string;
  readonly flagKey: string;
  readonly previousState: string;
  readonly newState: string;
  readonly changedBy: string; // IdentityId
  readonly occurredAt: string;
}

export interface FlagRuleUpdated {
  readonly type: 'FlagRuleUpdated';
  readonly flagId: string;
  readonly ruleId: string;
  readonly changedBy: string;
  readonly occurredAt: string;
}

export type FeatureDomainEvent = FlagStateChanged | FlagRuleUpdated;
