/**
 * Fork Firestore repository — implements IForkRepository port.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the port interfaces, keeping Firebase out of
 * business logic.
 *
 * Storage layout:
 *   forks/{forkId}   — flat collection; indexed fields: originWorkspaceId, forkedByAccountId
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
import type { IForkRepository } from "../domain.fork/_ports";
import type { ForkEntity } from "../domain.fork/_entity";
import type { ForkId } from "../domain.fork/_value-objects";
import { forkDocToEntity, forkEntityToDoc, type ForkDoc } from "./_mapper";

const FORKS_COLLECTION = "forks";

// ---------------------------------------------------------------------------
// FirestoreForkRepository
// ---------------------------------------------------------------------------

export class FirestoreForkRepository implements IForkRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: ForkId): Promise<ForkEntity | null> {
    const ref = doc(this.db, FORKS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return forkDocToEntity(snap.data() as ForkDoc);
  }

  async findByOriginWorkspace(originWorkspaceId: string): Promise<ForkEntity[]> {
    const col = collection(this.db, FORKS_COLLECTION);
    const q = query(col, where("originWorkspaceId", "==", originWorkspaceId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => forkDocToEntity(d.data() as ForkDoc));
  }

  async findByAccount(accountId: string): Promise<ForkEntity[]> {
    const col = collection(this.db, FORKS_COLLECTION);
    const q = query(col, where("forkedByAccountId", "==", accountId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => forkDocToEntity(d.data() as ForkDoc));
  }

  async save(fork: ForkEntity): Promise<void> {
    const ref = doc(this.db, FORKS_COLLECTION, fork.id);
    await setDoc(ref, forkEntityToDoc(fork));
  }
}
