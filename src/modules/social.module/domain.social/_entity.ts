import type { SocialRelationType } from "./_value-objects";

/** A social relation between a subject account and a target resource. */
export interface SocialRelation {
  readonly id: string;
  readonly subjectAccountId: string;
  readonly targetId: string;
  readonly targetType: "workspace" | "account";
  readonly relationType: SocialRelationType;
  readonly createdAt: string;
}

export function buildSocialRelation(
  id: string, subjectAccountId: string, targetId: string,
  targetType: "workspace" | "account", relationType: SocialRelationType, now: string,
): SocialRelation {
  return { id, subjectAccountId, targetId, targetType, relationType, createdAt: now };
}
