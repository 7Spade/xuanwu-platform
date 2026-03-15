import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import { buildSocialRelation } from "../domain.social/_entity";
import type { SocialRelationType, SocialTargetType } from "../domain.social/_value-objects";
import type { ISocialGraphRepository } from "../domain.social/_ports";

export interface SocialRelationDTO {
  readonly id: string;
  readonly subjectAccountId: string;
  readonly targetId: string;
  readonly targetType: SocialTargetType;
  readonly relationType: SocialRelationType;
  readonly createdAt: string;
}

export async function addRelation(
  repo: ISocialGraphRepository,
  id: string,
  subjectAccountId: string,
  targetId: string,
  targetType: SocialTargetType,
  relationType: SocialRelationType,
): Promise<Result<SocialRelationDTO>> {
  try {
    const now = new Date().toISOString();
    const relation = buildSocialRelation(id, subjectAccountId, targetId, targetType, relationType, now);
    await repo.save(relation);
    return ok({ ...relation });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function removeRelation(
  repo: ISocialGraphRepository,
  id: string,
): Promise<Result<void>> {
  try {
    await repo.deleteById(id);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getRelationsBySubject(
  repo: ISocialGraphRepository,
  subjectAccountId: string,
): Promise<Result<SocialRelationDTO[]>> {
  try {
    const relations = await repo.findBySubject(subjectAccountId);
    return ok(relations.map((r) => ({ ...r })));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Toggle a reaction (like/bookmark/star) for a given user+target.
 * If the relation already exists it is removed (un-react); otherwise it is created.
 * Returns { active: boolean, count: number } after the toggle.
 */
export async function toggleReaction(
  repo: ISocialGraphRepository,
  subjectAccountId: string,
  targetId: string,
  targetType: SocialTargetType,
  relationType: SocialRelationType,
): Promise<Result<{ active: boolean; count: number }>> {
  try {
    const existing = await repo.findBySubjectTargetAndType(
      subjectAccountId,
      targetId,
      relationType,
    );
    if (existing) {
      await repo.deleteById(existing.id);
    } else {
      const id = `${subjectAccountId}:${targetId}:${relationType}`;
      const now = new Date().toISOString();
      const relation = buildSocialRelation(id, subjectAccountId, targetId, targetType, relationType, now);
      await repo.save(relation);
    }
    const all = await repo.findByTargetAndType(targetId, relationType);
    return ok({ active: !existing, count: all.length });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Get the reaction count and the current user's reaction status for a target.
 */
export async function getReactionState(
  repo: ISocialGraphRepository,
  subjectAccountId: string,
  targetId: string,
  relationType: SocialRelationType,
): Promise<Result<{ active: boolean; count: number }>> {
  try {
    const [existing, all] = await Promise.all([
      repo.findBySubjectTargetAndType(subjectAccountId, targetId, relationType),
      repo.findByTargetAndType(targetId, relationType),
    ]);
    return ok({ active: !!existing, count: all.length });
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
