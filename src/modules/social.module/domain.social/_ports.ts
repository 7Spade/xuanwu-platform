import type { SocialRelation } from "./_entity";
export interface ISocialGraphRepository {
  findBySubject(subjectAccountId: string): Promise<SocialRelation[]>;
  findByTarget(targetId: string): Promise<SocialRelation[]>;
  findBySubjectAndTarget(subjectAccountId: string, targetId: string): Promise<SocialRelation | null>;
  save(relation: SocialRelation): Promise<void>;
  deleteById(id: string): Promise<void>;
}
