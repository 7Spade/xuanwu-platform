import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { SocialRelation } from "../domain.social/_entity";
import { buildSocialRelation } from "../domain.social/_entity";
import type { SocialRelationType } from "../domain.social/_value-objects";
import type { ISocialGraphRepository } from "../domain.social/_ports";

export interface SocialRelationDTO {
  readonly id: string;
  readonly subjectAccountId: string;
  readonly targetId: string;
  readonly targetType: "workspace" | "account";
  readonly relationType: SocialRelationType;
  readonly createdAt: string;
}

export async function addRelation(
  repo: ISocialGraphRepository,
  id: string,
  subjectAccountId: string,
  targetId: string,
  targetType: "workspace" | "account",
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
