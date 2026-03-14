// feature.module / domain.feature / _entity.ts
// Aggregate Root: FeatureFlag
// Aggregate: FlagRule (child of FeatureFlag)

export type FlagKey = string; // e.g. 'new-editor-ui', 'beta-search'
export type FlagState = 'enabled' | 'disabled' | 'percentage' | 'targeted';

export interface FeatureFlag {
  readonly id: string;
  readonly key: FlagKey;
  readonly description: string;
  readonly defaultState: 'enabled' | 'disabled';
  readonly state: FlagState;
  /** Only defined when state === 'percentage' */
  readonly rolloutPercentage?: number;
  readonly rules: FlagRule[];
  readonly archivedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type RolloutStrategy =
  | { type: 'account-list'; accountIds: string[] }
  | { type: 'account-type'; accountTypes: ('personal' | 'organization')[] }
  | { type: 'plan'; plans: string[] }
  | { type: 'environment'; environments: ('development' | 'staging' | 'production')[] }
  | { type: 'percentage'; percentage: number };

export interface FlagRule {
  readonly id: string;
  readonly flagId: string;
  readonly strategy: RolloutStrategy;
  readonly outcome: 'enabled' | 'disabled';
  readonly priority: number; // lower = evaluated first
}
