// feature.module / domain.feature / _ports.ts
import type { FeatureFlag, FlagRule } from './_entity';
import type { EvaluationContext, FlagEvaluation } from './_value-objects';

export interface IFeatureFlagRepository {
  findByKey(key: string): Promise<FeatureFlag | null>;
  findAll(): Promise<FeatureFlag[]>;
  save(flag: FeatureFlag): Promise<void>;
  archive(flagId: string): Promise<void>;
}

export interface IFlagRuleRepository {
  findByFlagId(flagId: string): Promise<FlagRule[]>;
  save(rule: FlagRule): Promise<void>;
  delete(ruleId: string): Promise<void>;
}

export interface IFlagEvaluator {
  evaluate(flagKey: string, context: EvaluationContext): Promise<FlagEvaluation>;
  evaluateMany(flagKeys: string[], context: EvaluationContext): Promise<FlagEvaluation[]>;
}
