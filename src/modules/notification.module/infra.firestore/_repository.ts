/**
 * Notification Firestore repository — implements INotificationRepository.
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
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import type { INotificationRepository } from "../domain.notification/_ports";
import type { NotificationRecord } from "../domain.notification/_entity";
import type { NotificationId } from "../domain.notification/_value-objects";
import {
  notificationDocToRecord,
  notificationRecordToDoc,
  type NotificationDoc,
} from "./_mapper";

const NOTIFICATIONS_COLLECTION = "notifications";

// ---------------------------------------------------------------------------
// FirestoreNotificationRepository
// ---------------------------------------------------------------------------

export class FirestoreNotificationRepository implements INotificationRepository {
  private get db() {
    return getFirestore();
  }

  async findById(id: NotificationId): Promise<NotificationRecord | null> {
    const ref = doc(this.db, NOTIFICATIONS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return notificationDocToRecord(snap.data() as NotificationDoc);
  }

  async findByRecipient(
    accountId: string,
    unreadOnly?: boolean,
  ): Promise<NotificationRecord[]> {
    const col = collection(this.db, NOTIFICATIONS_COLLECTION);
    const constraints = [where("recipientAccountId", "==", accountId)];
    if (unreadOnly) constraints.push(where("read", "==", false));
    const q = query(col, ...constraints);
    const snaps = await getDocs(q);
    return snaps.docs.map((d) => notificationDocToRecord(d.data() as NotificationDoc));
  }

  async save(record: NotificationRecord): Promise<void> {
    const ref = doc(this.db, NOTIFICATIONS_COLLECTION, record.id);
    await setDoc(ref, notificationRecordToDoc(record));
  }

  async markRead(id: NotificationId, readAt: string): Promise<void> {
    const ref = doc(this.db, NOTIFICATIONS_COLLECTION, id);
    await updateDoc(ref, { read: true, readAt });
  }
}
