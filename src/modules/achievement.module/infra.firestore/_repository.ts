/**
 * Achievement Firestore repository — implements IAchievementRepository.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the port interfaces, keeping Firebase out of
 * business logic.
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import type { IAchievementRepository } from "../domain.achievement/_ports";
import type { AchievementRecord } from "../domain.achievement/_entity";
import type { AchievementId } from "../domain.achievement/_value-objects";
import {
  achievementDocToRecord,
  achievementRecordToDoc,
  type AchievementDoc,
} from "./_mapper";

const ACHIEVEMENTS_COLLECTION = "achievements";

// ---------------------------------------------------------------------------
// FirestoreAchievementRepository
// ---------------------------------------------------------------------------

export class FirestoreAchievementRepository implements IAchievementRepository {
  private get db() {
    return getFirestore();
  }

  async findByAccountId(accountId: string): Promise<AchievementRecord[]> {
    const col = collection(this.db, ACHIEVEMENTS_COLLECTION);
    const q = query(col, where("accountId", "==", accountId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => achievementDocToRecord(d.data() as AchievementDoc));
  }

  async findById(id: AchievementId): Promise<AchievementRecord | null> {
    const ref = doc(this.db, ACHIEVEMENTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return achievementDocToRecord(snap.data() as AchievementDoc);
  }

  async save(record: AchievementRecord): Promise<void> {
    const ref = doc(this.db, ACHIEVEMENTS_COLLECTION, record.id);
    await setDoc(ref, achievementRecordToDoc(record));
  }
}
