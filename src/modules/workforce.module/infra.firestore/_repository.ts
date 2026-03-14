/**
 * Workforce Firestore repository — implements IScheduleRepository port.
 *
 * All Firestore access is isolated to this file; the domain and application
 * layers only interact with the IScheduleRepository port interface,
 * keeping Firebase out of business logic.
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
import type { IScheduleRepository } from "../domain.workforce/_ports";
import type { ScheduleAssignment } from "../domain.workforce/_entity";
import type { ScheduleId } from "../domain.workforce/_value-objects";
import {
  scheduleDocToEntity,
  scheduleEntityToDoc,
  type ScheduleDoc,
} from "./_mapper";

const SCHEDULES_COLLECTION = "schedules";

// ---------------------------------------------------------------------------
// IScheduleRepository implementation
// ---------------------------------------------------------------------------

export class FirestoreScheduleRepository implements IScheduleRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: ScheduleId): Promise<ScheduleAssignment | null> {
    const ref = doc(this.db, SCHEDULES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const raw = { id: snap.id, ...snap.data() } as ScheduleDoc;
    return scheduleDocToEntity(raw);
  }

  async findByWorkspaceId(
    workspaceId: string,
  ): Promise<ScheduleAssignment[]> {
    const col = collection(this.db, SCHEDULES_COLLECTION);
    const q = query(col, where("workspaceId", "==", workspaceId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const raw = { id: d.id, ...d.data() } as ScheduleDoc;
      return scheduleDocToEntity(raw);
    });
  }

  async findByAccountId(accountId: string): Promise<ScheduleAssignment[]> {
    const col = collection(this.db, SCHEDULES_COLLECTION);
    const q = query(col, where("accountId", "==", accountId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const raw = { id: d.id, ...d.data() } as ScheduleDoc;
      return scheduleDocToEntity(raw);
    });
  }

  async findByAssigneeId(
    assigneeId: string,
  ): Promise<ScheduleAssignment[]> {
    const col = collection(this.db, SCHEDULES_COLLECTION);
    const q = query(
      col,
      where("assigneeIds", "array-contains", assigneeId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const raw = { id: d.id, ...d.data() } as ScheduleDoc;
      return scheduleDocToEntity(raw);
    });
  }

  async save(schedule: ScheduleAssignment): Promise<void> {
    const ref = doc(this.db, SCHEDULES_COLLECTION, schedule.id);
    const data = scheduleEntityToDoc(schedule);
    await setDoc(ref, data, { merge: true });
  }

  async deleteById(id: ScheduleId): Promise<void> {
    const ref = doc(this.db, SCHEDULES_COLLECTION, id);
    await deleteDoc(ref);
  }
}
