// feature.module / domain.feature / _value-objects.ts

export interface EvaluationContext {
  readonly identityId: string;
  readonly accountId?: string;
  readonly accountType?: 'personal' | 'organization';
  readonly plan?: string;
  readonly workspaceId?: string;
  readonly environment: 'development' | 'staging' | 'production';
}

export interface FlagEvaluation {
  readonly flagKey: string;
  readonly result: 'enabled' | 'disabled';
  readonly matchedRuleId?: string;
  readonly evaluatedAt: string;
}
