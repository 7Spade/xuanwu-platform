import type { SocialRelation } from "./_entity";
import type { SocialRelationType } from "./_value-objects";
export interface ISocialGraphRepository {
  findBySubject(subjectAccountId: string): Promise<SocialRelation[]>;
  findByTarget(targetId: string): Promise<SocialRelation[]>;
  findByTargetAndType(targetId: string, relationType: SocialRelationType): Promise<SocialRelation[]>;
  findBySubjectAndTarget(subjectAccountId: string, targetId: string): Promise<SocialRelation | null>;
  findBySubjectTargetAndType(subjectAccountId: string, targetId: string, relationType: SocialRelationType): Promise<SocialRelation | null>;
  save(relation: SocialRelation): Promise<void>;
  deleteById(id: string): Promise<void>;
}
