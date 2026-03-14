/**
 * Work Firestore repository — implements IWorkItemRepository and IMilestoneRepository.
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
import type { IWorkItemRepository, IMilestoneRepository } from "../domain.work/_ports";
import type { WorkItemEntity, MilestoneEntity } from "../domain.work/_entity";
import type { WorkItemId, MilestoneId } from "../domain.work/_value-objects";
import {
  workItemDocToEntity,
  workItemEntityToDoc,
  milestoneDocToEntity,
  milestoneEntityToDoc,
  type WorkItemDoc,
  type MilestoneDoc,
} from "./_mapper";

const WORK_ITEMS_COLLECTION = "workItems";
const MILESTONES_COLLECTION = "milestones";

// ---------------------------------------------------------------------------
// FirestoreWorkItemRepository
// ---------------------------------------------------------------------------

export class FirestoreWorkItemRepository implements IWorkItemRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: WorkItemId): Promise<WorkItemEntity | null> {
    const ref = doc(this.db, WORK_ITEMS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return workItemDocToEntity(snap.data() as WorkItemDoc);
  }

  async findByWorkspaceId(workspaceId: string): Promise<WorkItemEntity[]> {
    const col = collection(this.db, WORK_ITEMS_COLLECTION);
    const q = query(col, where("workspaceId", "==", workspaceId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => workItemDocToEntity(d.data() as WorkItemDoc));
  }

  async save(item: WorkItemEntity): Promise<void> {
    const ref = doc(this.db, WORK_ITEMS_COLLECTION, item.id);
    await setDoc(ref, workItemEntityToDoc(item));
  }

  async deleteById(id: WorkItemId): Promise<void> {
    const ref = doc(this.db, WORK_ITEMS_COLLECTION, id);
    await deleteDoc(ref);
  }
}

// ---------------------------------------------------------------------------
// FirestoreMilestoneRepository
// ---------------------------------------------------------------------------

export class FirestoreMilestoneRepository implements IMilestoneRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: MilestoneId): Promise<MilestoneEntity | null> {
    const ref = doc(this.db, MILESTONES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return milestoneDocToEntity(snap.data() as MilestoneDoc);
  }

  async findByWorkspaceId(workspaceId: string): Promise<MilestoneEntity[]> {
    const col = collection(this.db, MILESTONES_COLLECTION);
    const q = query(col, where("workspaceId", "==", workspaceId));
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => milestoneDocToEntity(d.data() as MilestoneDoc));
  }

  async save(milestone: MilestoneEntity): Promise<void> {
    const ref = doc(this.db, MILESTONES_COLLECTION, milestone.id);
    await setDoc(ref, milestoneEntityToDoc(milestone));
  }
}
