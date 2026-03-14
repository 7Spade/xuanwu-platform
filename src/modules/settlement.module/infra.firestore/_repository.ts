/**
 * Settlement Firestore repository — implements ISettlementRepository.
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
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import type { ISettlementRepository } from "../domain.settlement/_ports";
import type { SettlementRecord } from "../domain.settlement/_entity";
import type { SettlementId } from "../domain.settlement/_value-objects";
import {
  settlementDocToEntity,
  settlementEntityToDoc,
  type SettlementDoc,
} from "./_mapper";

const SETTLEMENTS_COLLECTION = "settlements";

// ---------------------------------------------------------------------------
// FirestoreSettlementRepository
// ---------------------------------------------------------------------------

export class FirestoreSettlementRepository implements ISettlementRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: SettlementId): Promise<SettlementRecord | null> {
    const ref = doc(this.db, SETTLEMENTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return settlementDocToEntity(snap.data() as SettlementDoc);
  }

  async findByWorkspaceId(workspaceId: string): Promise<SettlementRecord[]> {
    const col = collection(this.db, SETTLEMENTS_COLLECTION);
    const q = query(col, where("workspaceId", "==", workspaceId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => settlementDocToEntity(d.data() as SettlementDoc));
  }

  async findByDimensionId(dimensionId: string): Promise<SettlementRecord[]> {
    const col = collection(this.db, SETTLEMENTS_COLLECTION);
    const q = query(col, where("dimensionId", "==", dimensionId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => settlementDocToEntity(d.data() as SettlementDoc));
  }

  async save(record: SettlementRecord): Promise<void> {
    const ref = doc(this.db, SETTLEMENTS_COLLECTION, record.id);
    await setDoc(ref, settlementEntityToDoc(record));
  }

  async deleteById(id: SettlementId): Promise<void> {
    const ref = doc(this.db, SETTLEMENTS_COLLECTION, id);
    await deleteDoc(ref);
  }
}
