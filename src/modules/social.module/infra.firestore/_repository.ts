/**
 * Social Firestore repository — implements ISocialGraphRepository.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the port interfaces, keeping Firebase out of
 * business logic.
 */

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
} from "firebase/firestore";
import type { ISocialGraphRepository } from "../domain.social/_ports";
import type { SocialRelation } from "../domain.social/_entity";
import type { SocialRelationType } from "../domain.social/_value-objects";
import {
  socialRelationDocToEntity,
  socialRelationEntityToDoc,
  type SocialRelationDoc,
} from "./_mapper";

const SOCIAL_RELATIONS_COLLECTION = "socialRelations";

export class FirestoreSocialGraphRepository implements ISocialGraphRepository {
  private get db() {
    return getFirestore();
  }

  async findBySubject(subjectAccountId: string): Promise<SocialRelation[]> {
    const col = collection(this.db, SOCIAL_RELATIONS_COLLECTION);
    const q = query(col, where("subjectAccountId", "==", subjectAccountId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) =>
      socialRelationDocToEntity(d.data() as SocialRelationDoc),
    );
  }

  async findByTarget(targetId: string): Promise<SocialRelation[]> {
    const col = collection(this.db, SOCIAL_RELATIONS_COLLECTION);
    const q = query(col, where("targetId", "==", targetId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) =>
      socialRelationDocToEntity(d.data() as SocialRelationDoc),
    );
  }

  async findByTargetAndType(
    targetId: string,
    relationType: SocialRelationType,
  ): Promise<SocialRelation[]> {
    const col = collection(this.db, SOCIAL_RELATIONS_COLLECTION);
    const q = query(
      col,
      where("targetId", "==", targetId),
      where("relationType", "==", relationType),
    );
    const snaps = await getDocs(q);
    return snaps.docs.map((d) =>
      socialRelationDocToEntity(d.data() as SocialRelationDoc),
    );
  }

  async findBySubjectAndTarget(
    subjectAccountId: string,
    targetId: string,
  ): Promise<SocialRelation | null> {
    const col = collection(this.db, SOCIAL_RELATIONS_COLLECTION);
    const q = query(
      col,
      where("subjectAccountId", "==", subjectAccountId),
      where("targetId", "==", targetId),
      limit(1),
    );
    const snaps = await getDocs(q);
    if (snaps.empty) return null;
    return socialRelationDocToEntity(snaps.docs[0].data() as SocialRelationDoc);
  }

  async findBySubjectTargetAndType(
    subjectAccountId: string,
    targetId: string,
    relationType: SocialRelationType,
  ): Promise<SocialRelation | null> {
    const col = collection(this.db, SOCIAL_RELATIONS_COLLECTION);
    const q = query(
      col,
      where("subjectAccountId", "==", subjectAccountId),
      where("targetId", "==", targetId),
      where("relationType", "==", relationType),
      limit(1),
    );
    const snaps = await getDocs(q);
    if (snaps.empty) return null;
    return socialRelationDocToEntity(snaps.docs[0].data() as SocialRelationDoc);
  }

  async save(relation: SocialRelation): Promise<void> {
    const ref = doc(this.db, SOCIAL_RELATIONS_COLLECTION, relation.id);
    await setDoc(ref, socialRelationEntityToDoc(relation));
  }

  async deleteById(id: string): Promise<void> {
    const ref = doc(this.db, SOCIAL_RELATIONS_COLLECTION, id);
    await deleteDoc(ref);
  }
}
